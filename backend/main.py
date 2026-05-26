import os
import re
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from gtts import gTTS
from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse

from agent import AgentDecision, interpret_patient_message
from db import (
    clear_pending_order,
    connect,
    init_db,
    log_interaction,
    pop_pending_order,
    row_to_dict,
    utc_now,
)
from photo_flow import place_mock_or_live_order, process_photo_message


CONFIRM_PATTERN = re.compile(r"^\s*(yes|yeah|yep|ok|okay|do it|order it|sure)\b", re.IGNORECASE)
CANCEL_PATTERN = re.compile(r"^\s*(no|nope|cancel|stop|don'?t)\b", re.IGNORECASE)
MAX_MEDIA_ATTACHMENTS = 10


load_dotenv()

PATIENT_NAME = os.getenv("PATIENT_NAME", "the patient")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "")
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "").rstrip("/")
STATIC_DIR = Path(__file__).resolve().parent / "static"
AUDIO_DIR = STATIC_DIR / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Aegis Backend Orchestrator", version="0.1.0", lifespan=lifespan)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _twiml(message: str) -> Response:
    response = MessagingResponse()
    response.message(message)
    return Response(content=str(response), media_type="application/xml")


def _safe_from_number(value: str) -> str:
    return value if value.startswith("whatsapp:") else f"whatsapp:{value}"


def _twilio_client() -> Client | None:
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        return None
    return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


def _public_url(request: Request | None = None) -> str:
    if PUBLIC_BASE_URL:
        return PUBLIC_BASE_URL
    if request:
        return str(request.base_url).rstrip("/")
    return "http://localhost:8000"


def _generate_voice_note(text: str, base_url: str) -> str | None:
    try:
        filename = f"{uuid4().hex}.mp3"
        path = AUDIO_DIR / filename
        gTTS(text=text, lang="en").save(str(path))
        return f"{base_url}/static/audio/{filename}"
    except Exception as exc:
        print(f"[voice] failed to generate gTTS audio: {exc}")
        return None


def send_whatsapp_message(to_number: str, body: str, base_url: str) -> None:
    client = _twilio_client()
    if client is None or not TWILIO_WHATSAPP_NUMBER:
        print(f"[twilio] demo mode outbound to {to_number}: {body}")
        return

    media_url = _generate_voice_note(body, base_url)
    try:
        kwargs: dict[str, Any] = {
            "from_": TWILIO_WHATSAPP_NUMBER,
            "to": _safe_from_number(to_number),
            "body": body,
        }
        if media_url:
            kwargs["media_url"] = [media_url]
        client.messages.create(**kwargs)
    except Exception as exc:
        print(f"[twilio] outbound send failed: {exc}")


def send_whatsapp_voice_note(to_number: str, text: str, base_url: str) -> None:
    client = _twilio_client()
    if client is None or not TWILIO_WHATSAPP_NUMBER:
        print(f"[twilio] demo mode voice note to {to_number}: {text}")
        return

    media_url = _generate_voice_note(text, base_url)
    if not media_url:
        return

    try:
        client.messages.create(
            from_=TWILIO_WHATSAPP_NUMBER,
            to=_safe_from_number(to_number),
            media_url=[media_url],
        )
    except Exception as exc:
        print(f"[twilio] voice note send failed: {exc}")


def execute_text_action(from_number: str, message: str, decision: AgentDecision) -> None:
    with connect() as conn:
        if decision.action == "log_medication":
            conn.execute(
                """
                INSERT INTO med_logs (timestamp, med_name, dosage, purpose, confidence, source)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (utc_now(), "Medication mentioned by patient", "Unknown", message, "voice", "voice"),
            )
        elif decision.action in {"create_alert", "check_schedule"}:
            conn.execute(
                """
                INSERT INTO alerts (timestamp, alert_type, message, resolved)
                VALUES (?, ?, ?, 0)
                """,
                (utc_now(), decision.action, f"{from_number}: {message}"),
            )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "aegis-backend"}


@app.post("/webhook/whatsapp")
async def whatsapp_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    From: str = Form(""),
    Body: str = Form(""),
    NumMedia: int = Form(0),
    MediaUrl0: str = Form(""),
    MediaUrl1: str = Form(""),
    MediaUrl2: str = Form(""),
    MediaUrl3: str = Form(""),
    MediaUrl4: str = Form(""),
    MediaUrl5: str = Form(""),
    MediaUrl6: str = Form(""),
    MediaUrl7: str = Form(""),
    MediaUrl8: str = Form(""),
    MediaUrl9: str = Form(""),
) -> Response:
    base_url = _public_url(request)
    from_number = From.replace("whatsapp:", "")

    media_urls = [
        url for url in (
            MediaUrl0, MediaUrl1, MediaUrl2, MediaUrl3, MediaUrl4,
            MediaUrl5, MediaUrl6, MediaUrl7, MediaUrl8, MediaUrl9,
        ) if url
    ][:MAX_MEDIA_ATTACHMENTS]

    if NumMedia > 0 and media_urls:
        for url in media_urls:
            background_tasks.add_task(
                process_photo_message,
                url,
                Body or "",
                from_number,
                base_url,
                send_whatsapp_message,
            )
        return _twiml("I'm checking that medicine now.")

    body = Body or ""

    if from_number and CONFIRM_PATTERN.match(body):
        pending = pop_pending_order(from_number)
        if pending is not None:
            ack = f"Ordering a refill of {pending['medication']} {pending['dosage']} now."
            log_interaction(body, ack, "confirm_order")
            background_tasks.add_task(
                place_mock_or_live_order,
                from_number=from_number,
                medication=pending["medication"],
                dosage=pending["dosage"],
                med_log_id=pending["med_log_id"],
                reason=f"WhatsApp confirmation: {body}",
                base_url=base_url,
                send_message=send_whatsapp_message,
            )
            background_tasks.add_task(send_whatsapp_voice_note, from_number, ack, base_url)
            return _twiml(ack)

    if from_number and CANCEL_PATTERN.match(body):
        pending = pop_pending_order(from_number)
        if pending is not None:
            reply = "Okay, I won't order it."
            log_interaction(body, reply, "cancel_order")
            background_tasks.add_task(send_whatsapp_voice_note, from_number, reply, base_url)
            return _twiml(reply)
        clear_pending_order(from_number)

    decision = interpret_patient_message(body, PATIENT_NAME)
    log_interaction(body, decision.spoken_response, decision.action)
    execute_text_action(from_number, body, decision)
    background_tasks.add_task(send_whatsapp_voice_note, from_number, decision.spoken_response, base_url)
    return _twiml(decision.spoken_response)


@app.get("/api/med-logs")
async def med_logs() -> list[dict[str, Any]]:
    with connect() as conn:
        rows = conn.execute("SELECT * FROM med_logs ORDER BY timestamp DESC").fetchall()
        return [row_to_dict(row) for row in rows]


@app.get("/api/alerts")
async def alerts() -> list[dict[str, Any]]:
    with connect() as conn:
        rows = conn.execute("SELECT * FROM alerts ORDER BY timestamp DESC").fetchall()
        return [row_to_dict(row) for row in rows]


@app.get("/api/payments")
async def payments() -> list[dict[str, Any]]:
    with connect() as conn:
        rows = conn.execute("SELECT * FROM payments ORDER BY timestamp DESC").fetchall()
        return [row_to_dict(row) for row in rows]


@app.get("/api/order-requests")
async def order_requests() -> list[dict[str, Any]]:
    with connect() as conn:
        rows = conn.execute("SELECT * FROM order_requests ORDER BY timestamp DESC").fetchall()
        return [row_to_dict(row) for row in rows]


@app.get("/api/stats")
async def stats() -> dict[str, Any]:
    with connect() as conn:
        meds_today = conn.execute(
            "SELECT COUNT(*) AS count FROM med_logs WHERE date(timestamp) = date('now')"
        ).fetchone()["count"]
        active_alerts = conn.execute(
            "SELECT COUNT(*) AS count FROM alerts WHERE resolved = 0"
        ).fetchone()["count"]
        interactions = conn.execute("SELECT COUNT(*) AS count FROM interactions").fetchone()["count"]
        order_requests_count = conn.execute("SELECT COUNT(*) AS count FROM order_requests").fetchone()["count"]
        confirmed_orders = conn.execute(
            "SELECT COUNT(*) AS count FROM order_requests WHERE status IN ('mock_confirmed', 'confirmed')"
        ).fetchone()["count"]
        return {
            "patient_name": PATIENT_NAME,
            "status": "monitoring",
            "meds_today": meds_today,
            "active_alerts": active_alerts,
            "interactions": interactions,
            "order_requests": order_requests_count,
            "confirmed_orders": confirmed_orders,
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
