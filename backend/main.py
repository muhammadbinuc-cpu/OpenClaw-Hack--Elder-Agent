import base64
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any
from uuid import uuid4

import httpx
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from gtts import gTTS
from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse

from agent import AgentDecision, interpret_patient_message
from db import connect, init_db, row_to_dict, utc_now


load_dotenv()

PATIENT_NAME = os.getenv("PATIENT_NAME", "the patient")
VISION_SERVICE_URL = os.getenv("VISION_SERVICE_URL", "http://127.0.0.1:5000").rstrip("/")
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


def log_interaction(patient_message: str, decision: AgentDecision) -> None:
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO interactions (timestamp, patient_message, agent_response, action_taken)
            VALUES (?, ?, ?, ?)
            """,
            (utc_now(), patient_message, decision.spoken_response, decision.action),
        )


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


async def download_twilio_media(media_url: str) -> tuple[bytes, str]:
    auth = (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN else None
    async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
        response = await client.get(media_url, auth=auth)
        response.raise_for_status()
        return response.content, response.headers.get("content-type", "image/jpeg")


async def analyze_medication(image_bytes: bytes, mime_type: str) -> dict[str, Any]:
    encoded = base64.b64encode(image_bytes).decode("utf-8")
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            f"{VISION_SERVICE_URL}/analyze",
            json={"image": encoded, "mime_type": mime_type},
        )
        response.raise_for_status()
        return response.json()


def log_photo_medication(result: dict[str, Any]) -> int:
    with connect() as conn:
        cursor = conn.execute(
            """
            INSERT INTO med_logs (timestamp, med_name, dosage, purpose, confidence, source)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                utc_now(),
                str(result.get("name") or "Unknown"),
                str(result.get("dosage") or "Unknown"),
                str(result.get("purpose") or "Ask a caregiver to verify."),
                str(result.get("confidence") or "unknown"),
                "photo",
            ),
        )
        return int(cursor.lastrowid)


def log_alert(alert_type: str, message: str) -> None:
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO alerts (timestamp, alert_type, message, resolved)
            VALUES (?, ?, ?, 0)
            """,
            (utc_now(), alert_type, message),
        )


async def process_photo_message(media_url: str, from_number: str, base_url: str) -> None:
    try:
        image_bytes, mime_type = await download_twilio_media(media_url)
        result = await analyze_medication(image_bytes, mime_type)
        med_log_id = log_photo_medication(result)
        med_name = str(result.get("name") or "the medication")
        dosage = str(result.get("dosage") or "unknown dosage")
        warning = str(result.get("warnings") or "Please verify this with your caregiver.")
        spoken = (
            f"I identified {med_name}, {dosage}. "
            "I logged it and your caregiver can review it."
        )
        log_interaction(
            "Photo message",
            AgentDecision(action="log_medication", spoken_response=spoken),
        )
        if "unknown" in med_name.lower():
            log_alert("medication_review", f"Medication photo needs review. Log #{med_log_id}. {warning}")
        send_whatsapp_message(from_number, spoken, base_url)
    except Exception as exc:
        print(f"[photo] processing failed: {exc}")
        log_alert("photo_processing_failed", f"Could not process medication photo from {from_number}: {exc}")
        send_whatsapp_message(
            from_number,
            "I could not read that photo clearly. I logged it so your caregiver can check.",
            base_url,
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
) -> Response:
    base_url = _public_url(request)
    from_number = From.replace("whatsapp:", "")

    if NumMedia > 0 and MediaUrl0:
        background_tasks.add_task(process_photo_message, MediaUrl0, from_number, base_url)
        return _twiml("Processing your photo. I will tell you what I find in a moment.")

    decision = interpret_patient_message(Body or "", PATIENT_NAME)
    log_interaction(Body or "", decision)
    execute_text_action(from_number, Body or "", decision)
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
        return {
            "patient_name": PATIENT_NAME,
            "status": "monitoring",
            "meds_today": meds_today,
            "active_alerts": active_alerts,
            "interactions": interactions,
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
