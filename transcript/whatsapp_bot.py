"""MedBot Journal — WhatsApp/Twilio entry point."""

import logging
import os
from datetime import datetime

from dotenv import load_dotenv
from flask import Flask, Response, request
from twilio.twiml.messaging_response import MessagingResponse

import llm
from storage import (
    append_entry,
    entries_in_range,
    get_user,
    load_journal,
    pop_last,
    save_journal,
)

load_dotenv()

logging.basicConfig(
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

ERROR_REPLY = "Sorry, didn't catch that. Try again or use /note."
DEFAULT_SUMMARY_DAYS = 14
WHATSAPP_MAX_MESSAGE = 1600


def _now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def _split_text(text: str, limit: int = WHATSAPP_MAX_MESSAGE) -> list[str]:
    return [text[i : i + limit] for i in range(0, len(text), limit)]


def _twiml(parts: list[str]) -> Response:
    resp = MessagingResponse()
    for part in parts:
        resp.message(part)
    return Response(str(resp), mimetype="text/xml")


def format_confirmation(entry: dict) -> str:
    entry_type = entry.get("type")
    if entry_type == "medication":
        med = entry.get("medication") or "medication"
        if entry.get("taken") is False:
            reason = entry.get("notes") or "no reason given"
            return f"Logged: {med} skipped ({reason})"
        msg = f"Logged: {med} taken"
        if entry.get("food_context"):
            msg += f", with {entry['food_context']}"
        if entry.get("symptoms"):
            msg += f". Noted: {entry['symptoms']}"
        return msg
    if entry_type == "symptom":
        return f"Noted: {entry.get('symptoms') or entry.get('raw_text', '')}"
    if entry_type == "question_for_doctor":
        q = entry.get("notes") or entry.get("raw_text", "")
        return f"Added to doctor questions: {q}"
    return "Noted."


def _handle_start(user_id: str, name: str) -> list[str]:
    try:
        data = load_journal()
        get_user(data, user_id, name=name)
        save_journal(data)
        return [
            f"Hi {name} — MedBot Journal is ready.\n"
            "Send any message to log meds, symptoms, or notes.\n"
            "/summary for a doctor handout · /undo to remove last entry"
        ]
    except Exception:
        logger.exception("_handle_start failed")
        return [ERROR_REPLY]


def _handle_summary(user_id: str, args: list[str]) -> list[str]:
    try:
        days = DEFAULT_SUMMARY_DAYS
        if args:
            try:
                days = max(1, int(args[0]))
            except ValueError:
                return ["Usage: /summary or /summary 7"]
        data = load_journal()
        record = get_user(data, user_id)
        entries = entries_in_range(data, user_id, days)
        if not entries:
            return [f"No entries in the last {days} days."]
        entries = sorted(entries, key=lambda e: e.get("timestamp", ""))
        text = llm.summarize(entries, record.get("name") or "Patient", days)
        return _split_text(text)
    except Exception:
        logger.exception("_handle_summary failed")
        return [ERROR_REPLY]


def _handle_note(user_id: str, args: list[str]) -> list[str]:
    try:
        text = " ".join(args).strip()
        if not text:
            return ["Usage: /note <text>"]
        data = load_journal()
        entry = append_entry(data, user_id, {"raw_text": text, "type": "note", "notes": text})
        save_journal(data)
        return [format_confirmation(entry)]
    except Exception:
        logger.exception("_handle_note failed")
        return [ERROR_REPLY]


def _handle_undo(user_id: str) -> list[str]:
    try:
        data = load_journal()
        removed = pop_last(data, user_id)
        if removed is None:
            return ["Nothing to undo."]
        save_journal(data)
        preview = removed.get("raw_text") or removed.get("type", "entry")
        return [f"Removed: {preview}"]
    except Exception:
        logger.exception("_handle_undo failed")
        return [ERROR_REPLY]


def _handle_list(user_id: str) -> list[str]:
    try:
        data = load_journal()
        record = get_user(data, user_id)
        entries = record.get("entries", [])
        if not entries:
            return ["No entries yet."]
        lines = []
        for entry in entries[-5:]:
            raw = entry.get("raw_text") or entry.get("notes") or entry.get("type")
            lines.append(f"{entry.get('id')}: {raw}")
        return ["\n".join(lines)]
    except Exception:
        logger.exception("_handle_list failed")
        return [ERROR_REPLY]


def _handle_text(user_id: str, raw_text: str) -> list[str]:
    try:
        ts = _now_iso()
        extracted = llm.extract_entry(raw_text, ts)
        data = load_journal()
        entry = append_entry(data, user_id, {"raw_text": raw_text, **extracted})
        save_journal(data)
        return [format_confirmation(entry)]
    except Exception:
        logger.exception("_handle_text failed")
        return [ERROR_REPLY]


@app.route("/webhook", methods=["POST"])
def webhook():
    from_field = request.form.get("From", "")
    body = (request.form.get("Body") or "").strip()
    profile_name = request.form.get("ProfileName") or "Patient"

    # E.164 phone number — strip Twilio's "whatsapp:" scheme prefix
    user_id = from_field.removeprefix("whatsapp:")

    if not user_id or not body:
        return _twiml([ERROR_REPLY])

    logger.info("from=%s body=%r", user_id, body[:80])

    if body.startswith("/"):
        tokens = body.split()
        command = tokens[0].lower()
        args = tokens[1:]
        if command == "/start":
            replies = _handle_start(user_id, profile_name)
        elif command == "/summary":
            replies = _handle_summary(user_id, args)
        elif command == "/note":
            replies = _handle_note(user_id, args)
        elif command == "/undo":
            replies = _handle_undo(user_id)
        elif command == "/list":
            replies = _handle_list(user_id)
        else:
            replies = [f"Unknown command: {command}\nTry /start, /summary, /note, /undo, /list"]
    else:
        replies = _handle_text(user_id, body)

    return _twiml(replies)


def main() -> None:
    for var in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_NUMBER"):
        if not os.environ.get(var):
            raise SystemExit(f"{var} is not set")
    port = int(os.environ.get("PORT", 5000))
    logger.info("MedBot Journal (WhatsApp) starting on port %d", port)
    app.run(host="0.0.0.0", port=port)


if __name__ == "__main__":
    main()
