import base64
import hashlib
import os
import re
from typing import Any, Callable

import httpx

from brain_client import brain_enabled, call_brain
from db import (
    clear_pending_order,
    get_pending_order_snapshot,
    get_recent_interactions,
    get_recent_meds,
    log_alert,
    log_interaction,
    log_order_request,
    log_photo_medication,
    lookup_recent_photo,
    record_photo,
    set_pending_order,
)
from order_agent import request_refill_order


SIMULATE_VISION_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xcf"
    b"\xc0\xf0\x9f\x01\x00\x05\x00\x01\xff\xf6\xdb\xab\xfb\x00\x00\x00\x00IEND\xaeB`\x82"
)
SIMULATE_VISION_RESULT: dict[str, Any] = {
    "name": "Lisinopril",
    "dosage": "10mg",
    "purpose": "Blood pressure medication. Demo simulator result.",
    "confidence": "high",
    "warnings": "Simulated result for local development only.",
    "visual_evidence": "Simulator stub — vision service was not called.",
}


def _is_simulation_enabled() -> bool:
    return os.getenv("AEGIS_SIMULATE_VISION", "").strip().lower() in {"1", "true", "yes"}


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
    return os.getenv("VISION_SERVICE_URL", "http://127.0.0.1:5001").rstrip("/")


def _twilio_auth() -> tuple[str, str] | None:
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
    if not account_sid or not auth_token:
        return None
    return account_sid, auth_token


async def download_twilio_media(media_url: str) -> tuple[bytes, str]:
    if _is_simulation_enabled():
        url_salt = hashlib.sha256(media_url.encode("utf-8")).digest()[:8]
        return SIMULATE_VISION_PNG + url_salt, "image/png"
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
    if _is_simulation_enabled():
        return SIMULATE_VISION_RESULT.copy()
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
        return (
            f"I could not read the photo clearly, so I used the demo fallback: {medication_label}. "
            "I logged it. Say the name of the medicine and I'll order it."
        )
    return f"I found {medication_label}. I logged it."


def _offer_refill_reply(medication_label: str) -> str:
    return (
        f"I found {medication_label}. I logged it. Reply 'yes' to order a refill."
    )


def _order_reply(medication_label: str) -> str:
    return f"I found {medication_label}. I placed a refill request."


def _unknown_order_reply() -> str:
    return "I could not identify that medicine clearly enough to request a refill. I logged it for your caregiver to review."


def _duplicate_reply(medication_label: str) -> str:
    if medication_label:
        return f"I already saw that {medication_label} — still logged."
    return "I already saw that one — still logged."


async def place_mock_or_live_order(
    *,
    from_number: str,
    medication: str,
    dosage: str,
    med_log_id: int | None,
    reason: str,
    base_url: str,
    send_message: SendMessage,
) -> None:
    payment_result = await request_refill_order(medication, dosage)
    order_id = log_order_request(
        med_log_id=med_log_id if med_log_id is not None else 0,
        medication=medication,
        dosage=dosage,
        reason=reason,
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


async def _route_photo_through_brain(
    *,
    body: str,
    from_number: str,
    base_url: str,
    send_message: SendMessage,
    result: dict[str, Any],
    med_log_id: int,
) -> bool:
    if not brain_enabled() or not from_number:
        return False
    context = {
        "patient_name": os.getenv("PATIENT_NAME", "the patient"),
        "from_number": from_number,
        "recent_meds": get_recent_meds(limit=5),
        "interactions": get_recent_interactions(limit=10),
        "pending_order": get_pending_order_snapshot(from_number),
        "photo_result": result,
    }
    reply = await call_brain(from_number, body or "(photo only)", context)
    if reply is None or not reply.reply:
        return False
    log_interaction(body or "Photo message", reply.reply, "brain_photo")
    for action in reply.actions:
        kind = action.type
        args = action.args or {}
        if kind == "request_refill":
            await place_mock_or_live_order(
                from_number=from_number,
                medication=str(args.get("medication") or result.get("name") or "Unknown"),
                dosage=str(args.get("dosage") or result.get("dosage") or "unknown dosage"),
                med_log_id=med_log_id,
                reason=f"brain photo action; body={body!r}",
                base_url=base_url,
                send_message=send_message,
            )
        elif kind == "set_pending_order":
            set_pending_order(
                from_number,
                med_log_id,
                str(args.get("medication") or result.get("name") or "Unknown"),
                str(args.get("dosage") or result.get("dosage") or "unknown dosage"),
            )
        elif kind == "clear_pending_order":
            clear_pending_order(from_number)
        elif kind == "create_alert":
            log_alert(
                str(args.get("alert_type") or "brain_alert"),
                str(args.get("message") or "Brain raised an alert."),
            )
    send_message(from_number, reply.reply, base_url)
    return True


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
        image_sha256 = hashlib.sha256(image_bytes).hexdigest()
        cached = lookup_recent_photo(from_number, image_sha256)
        if cached is not None:
            send_message(from_number, _duplicate_reply(""), base_url)
            log_interaction(body or "Photo message", "duplicate photo within 5 minutes", "dedupe")
            return

        result = await analyze_medication_with_fallback(image_bytes, mime_type)
        med_log_id = log_photo_medication(result)
        record_photo(from_number, image_sha256, med_log_id)

        if await _route_photo_through_brain(
            body=body,
            from_number=from_number,
            base_url=base_url,
            send_message=send_message,
            result=result,
            med_log_id=med_log_id,
        ):
            return

        med_name = str(result.get("name") or "Unknown")
        dosage = str(result.get("dosage") or "unknown dosage")
        warning = str(result.get("warnings") or "Please verify this with your caregiver.")
        medication_label = f"{med_name} {dosage}".strip()
        is_fallback = _is_fallback_result(result)
        is_unknown = _is_unknown_medication(med_name)

        if is_unknown or is_fallback:
            log_alert(
                "medication_review",
                f"Medication photo needs review. Log #{med_log_id}. {warning}",
            )

        if is_fallback:
            logged_reply = _logged_reply(medication_label, result)
            log_interaction(body or "Photo message", logged_reply, "log_medication")
            send_message(from_number, logged_reply, base_url)
            return

        if not order_requested:
            if is_unknown:
                reply = _logged_reply(medication_label, result)
                log_interaction(body or "Photo message", reply, "log_medication")
                send_message(from_number, reply, base_url)
                return
            offer = _offer_refill_reply(medication_label)
            set_pending_order(from_number, med_log_id, med_name, dosage)
            log_interaction(body or "Photo message", offer, "log_medication")
            send_message(from_number, offer, base_url)
            return

        if is_unknown:
            send_message(from_number, _unknown_order_reply(), base_url)
            return

        order_reply = _order_reply(medication_label)
        log_interaction(body or "Photo message", order_reply, "log_medication")
        send_message(from_number, order_reply, base_url)
        await place_mock_or_live_order(
            from_number=from_number,
            medication=med_name,
            dosage=dosage,
            med_log_id=med_log_id,
            reason=body or "WhatsApp photo refill request",
            base_url=base_url,
            send_message=send_message,
        )
    except Exception as exc:
        print(f"[photo] processing failed: {exc}")
        log_alert("photo_processing_failed", f"Could not process medication photo from {from_number}: {exc}")
        send_message(
            from_number,
            "I could not read that photo clearly. I logged it so your caregiver can check.",
            base_url,
        )
