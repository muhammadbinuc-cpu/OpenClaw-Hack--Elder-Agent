"""MedBot Journal — Telegram entry point."""

import logging
import os
from datetime import datetime

from dotenv import load_dotenv
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

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

ERROR_REPLY = "Sorry, didn't catch that. Try again or use /note."
DEFAULT_SUMMARY_DAYS = 14
TELEGRAM_MAX_MESSAGE = 4000


def _now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


async def _reply_long(message, text: str) -> None:
    for i in range(0, len(text), TELEGRAM_MAX_MESSAGE):
        await message.reply_text(text[i : i + TELEGRAM_MAX_MESSAGE])


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


async def _reply_error(update: Update) -> None:
    if update.effective_message:
        await update.effective_message.reply_text(ERROR_REPLY)


async def start_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        user = update.effective_user
        if not user or not update.effective_message:
            return
        data = load_journal()
        name = user.full_name or user.first_name or "Patient"
        get_user(data, user.id, name=name)
        save_journal(data)
        await update.effective_message.reply_text(
            f"Hi {name} — MedBot Journal is ready.\n"
            "Send any message to log meds, symptoms, or notes.\n"
            "/summary for a doctor handout · /undo to remove last entry"
        )
    except Exception:
        logger.exception("start_cmd failed")
        await _reply_error(update)


async def summary_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        user = update.effective_user
        if not user or not update.effective_message:
            return
        days = DEFAULT_SUMMARY_DAYS
        if context.args:
            try:
                days = max(1, int(context.args[0]))
            except ValueError:
                await update.effective_message.reply_text("Usage: /summary or /summary 7")
                return
        data = load_journal()
        record = get_user(data, user.id)
        entries = entries_in_range(data, user.id, days)
        if not entries:
            await update.effective_message.reply_text(f"No entries in the last {days} days.")
            return
        entries = sorted(entries, key=lambda e: e.get("timestamp", ""))
        text = llm.summarize(entries, record.get("name") or "Patient", days)
        await _reply_long(update.effective_message, text)
    except Exception:
        logger.exception("summary_cmd failed")
        await _reply_error(update)


async def note_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        user = update.effective_user
        if not user or not update.effective_message:
            return
        text = " ".join(context.args).strip()
        if not text:
            await update.effective_message.reply_text("Usage: /note <text>")
            return
        data = load_journal()
        entry = append_entry(data, user.id, {"raw_text": text, "type": "note", "notes": text})
        save_journal(data)
        await update.effective_message.reply_text(format_confirmation(entry))
    except Exception:
        logger.exception("note_cmd failed")
        await _reply_error(update)


async def undo_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        user = update.effective_user
        if not user or not update.effective_message:
            return
        data = load_journal()
        removed = pop_last(data, user.id)
        if removed is None:
            await update.effective_message.reply_text("Nothing to undo.")
            return
        save_journal(data)
        preview = removed.get("raw_text") or removed.get("type", "entry")
        await update.effective_message.reply_text(f"Removed: {preview}")
    except Exception:
        logger.exception("undo_cmd failed")
        await _reply_error(update)


async def list_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        user = update.effective_user
        if not user or not update.effective_message:
            return
        data = load_journal()
        record = get_user(data, user.id)
        entries = record.get("entries", [])
        if not entries:
            await update.effective_message.reply_text("No entries yet.")
            return
        lines = []
        for entry in entries[-5:]:
            raw = entry.get("raw_text") or entry.get("notes") or entry.get("type")
            lines.append(f"{entry.get('id')}: {raw}")
        await update.effective_message.reply_text("\n".join(lines))
    except Exception:
        logger.exception("list_cmd failed")
        await _reply_error(update)


async def text_log(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        user = update.effective_user
        message = update.effective_message
        if not user or not message or not message.text:
            return
        raw_text = message.text.strip()
        if not raw_text:
            return
        ts = _now_iso()
        extracted = llm.extract_entry(raw_text, ts)
        data = load_journal()
        entry = append_entry(data, user.id, {"raw_text": raw_text, **extracted})
        save_journal(data)
        await message.reply_text(format_confirmation(entry))
    except Exception:
        logger.exception("text_log failed")
        await _reply_error(update)


def main() -> None:
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        raise SystemExit("TELEGRAM_BOT_TOKEN is not set")
    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("start", start_cmd))
    app.add_handler(CommandHandler("summary", summary_cmd))
    app.add_handler(CommandHandler("note", note_cmd))
    app.add_handler(CommandHandler("undo", undo_cmd))
    app.add_handler(CommandHandler("list", list_cmd))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_log))
    logger.info("MedBot Journal starting")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()