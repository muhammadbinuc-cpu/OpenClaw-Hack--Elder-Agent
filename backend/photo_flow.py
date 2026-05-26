import base64
import os
import re
from typing import Any, Callable

import httpx

from db import log_alert, log_interaction, log_order_request, log_photo_medication
from order_agent import request_refill_order


SendMessage = Callable[[str, str, str], None]
ORDER_INTENT_PATTERN = re.compile(
    r"\b(order(?:\s+more)?|refill|buy|request(?:\s+a)?\s+refill)\b",
    re.IGNORECASE,
)
FALLBACK_MEDICATION_RESULT = {
    "name": "Lisinopril",
    "dosage": "10mg",
    "purpose": "Blood pressure medication. Ask a caregiver to verify.",
    "confidence": "fallback",
    "warnings": "Vision analysis failed, so this demo fallback should be verified by a caregiver.",
    "visual_evidence": "Vision service failed before it could inspect the photo.",
}


def has_order_intent(message: str) -> bool:
    return bool(ORDER_INTENT_PATTERN.search(message))


def _vision_service_url() -> str:
    return os.getenv("VISION_SERVICE_URL", "http://127.0.0.1:5000").rstrip("/")


def _twilio_auth() -> tuple[str, str] | None:
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
    if not account_sid or not auth_token:
        return None
    return account_sid, auth_token


async def download_twilio_media(media_url: str) -> tuple[bytes, str]:
    async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
        response = await client.get(media_url, auth=_twilio_auth())
        response.raise_for_status()
        return response.content, response.headers.get("content-type", "image/jpeg")


async def analyze_medication(image_bytes: bytes, mime_type: str) -> dict[str, Any]:
    encoded = base64.b64encode(image_bytes).decode("utf-8")
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            f"{_vision_service_url()}/analyze",
            json={"image": encoded, "mime_type": mime_type},
        )
        response.raise_for_status()
        return response.json()


async def analyze_medication_with_fallback(image_bytes: bytes, mime_type: str) -> dict[str, Any]:
    try:
        return await analyze_medication(image_bytes, mime_type)
    except Exception as exc:
        print(f"[photo] vision analysis failed, using fallback medication: {exc}")
        log_alert("vision_analysis_failed", f"Vision analysis failed; using demo fallback. Error: {exc}")
        return FALLBACK_MEDICATION_RESULT.copy()


def _is_fallback_result(result: dict[str, Any]) -> bool:
    confidence = str(result.get("confidence") or "").lower()
    raw_analysis = str(result.get("raw_analysis") or "").lower()
    return confidence == "fallback" or "fallback" in raw_analysis


def _is_unknown_medication(med_name: str) -> bool:
    return med_name.strip().lower() in {"", "unknown", "the medication"}


def _logged_reply(medication_label: str, result: dict[str, Any]) -> str:
    if _is_fallback_result(result):
        return f"I could not read the photo clearly, so I used the demo fallback: {medication_label}. I logged it."
    return f"I found {medication_label}. I logged it."


def _order_reply(medication_label: str, result: dict[str, Any]) -> str:
    if _is_fallback_result(result):
        return f"I could not read the photo clearly, so I used the demo fallback: {medication_label}. I placed a refill request."
    return f"I found {medication_label}. I placed a refill request."


def _unknown_order_reply() -> str:
    return "I could not identify that medicine clearly enough to request a refill. I logged it for your caregiver to review."


async def process_photo_message(
    media_url: str,
    body: str,
    from_number: str,
    base_url: str,
    send_message: SendMessage,
) -> None:
    order_requested = has_order_intent(body)
    try:
        image_bytes, mime_type = await download_twilio_media(media_url)
        result = await analyze_medication_with_fallback(image_bytes, mime_type)
        med_log_id = log_photo_medication(result)
        med_name = str(result.get("name") or "Unknown")
        dosage = str(result.get("dosage") or "unknown dosage")
        warning = str(result.get("warnings") or "Please verify this with your caregiver.")
        medication_label = f"{med_name} {dosage}".strip()
        logged_reply = _logged_reply(medication_label, result)
        log_interaction(body or "Photo message", logged_reply, "log_medication")
        if _is_unknown_medication(med_name):
            log_alert("medication_review", f"Medication photo needs review. Log #{med_log_id}. {warning}")

        if not order_requested:
            send_message(from_number, logged_reply, base_url)
            return

        if _is_unknown_medication(med_name):
            send_message(from_number, _unknown_order_reply(), base_url)
            return

        order_reply = _order_reply(medication_label, result)
        send_message(from_number, order_reply, base_url)
        payment_result = await request_refill_order(med_name, dosage)
        order_id = log_order_request(
            med_log_id=med_log_id,
            medication=med_name,
            dosage=dosage,
            reason=body or "WhatsApp photo refill request",
            payment_agent_status=payment_result.status,
            tx_hash=payment_result.tx_hash,
            agent_response=payment_result.raw_response,
        )
        if payment_result.success and payment_result.status == "mock_confirmed":
            confirmation = "The refill request is confirmed in demo mode."
        elif payment_result.success:
            confirmation = "The refill request is confirmed."
        else:
            confirmation = "I placed the refill request, but the payment agent could not confirm it yet."
            log_alert("payment_agent_failed", f"Order #{order_id} could not be confirmed: {payment_result.message}")
        send_message(from_number, confirmation, base_url)
    except Exception as exc:
        print(f"[photo] processing failed: {exc}")
        log_alert("photo_processing_failed", f"Could not process medication photo from {from_number}: {exc}")
        send_message(
            from_number,
            "I could not read that photo clearly. I logged it so your caregiver can check.",
            base_url,
        )
