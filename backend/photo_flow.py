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
    "medication": "Lisinopril",
    "dosage": "10mg",
    "quantity": 3,
    "refill_needed": True,
    "confidence": "high",
}


def _is_simulation_enabled() -> bool:
    return os.getenv("AEGIS_SIMULATE_VISION", "").strip().lower() in {"1", "true", "yes"}


def _auto_refill_enabled() -> bool:
    return os.getenv("AEGIS_AUTO_REFILL", "").strip().lower() in {"1", "true", "yes"}


SendMessage = Callable[[str, str, str], None]
ORDER_INTENT_PATTERN = re.compile(
    r"\b(order(?:\s+more)?|refill|buy|request(?:\s+a)?\s+refill)\b",
    re.IGNORECASE,
)
FALLBACK_MEDICATION_RESULT = {
    "medication": "Lisinopril",
    "dosage": "10mg",
    "quantity": 3,
    "refill_needed": True,
    "confidence": "fallback",
}
NOT_PRESCRIPTION_RESULT = {"error": "not a proper prescription"}


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
            f"{_vision_service_url()}/analyze-base64",
            json={"image": encoded, "mime_type": mime_type},
        )
        if response.status_code == 400:
            try:
                body = response.json()
            except Exception:
                body = {}
            if isinstance(body, dict) and "error" in body:
                return NOT_PRESCRIPTION_RESULT.copy()
        response.raise_for_status()
        return response.json()


async def analyze_medication_with_fallback(image_bytes: bytes, mime_type: str) -> dict[str, Any]:
    if _is_simulation_enabled():
        return SIMULATE_VISION_RESULT.copy()
    try:
        return await analyze_medication(image_bytes, mime_type)
    except Exception as exc:
        print(f"[photo] vision analysis failed, routing photo to review path: {exc}")
        log_alert("vision_analysis_failed", f"Vision analysis failed; routed photo to review path. Error: {exc}")
        return FALLBACK_MEDICATION_RESULT.copy()


def _is_fallback_result(result: dict[str, Any]) -> bool:
    confidence = str(result.get("confidence") or "").lower()
    return confidence == "fallback"


def _is_not_prescription(result: dict[str, Any]) -> bool:
    return "error" in result


def _is_unknown_medication(med_name: str) -> bool:
    return med_name.strip().lower() in {"", "unknown", "the medication"}


def _medication_name(result: dict[str, Any]) -> str:
    return str(result.get("medication") or result.get("name") or "Unknown")


def _refill_needed(result: dict[str, Any]) -> bool:
    return bool(result.get("refill_needed"))


def _quantity(result: dict[str, Any]) -> int | None:
    raw = result.get("quantity")
    if raw is None:
        return None
    try:
        return int(raw)
    except (TypeError, ValueError):
        return None


def _logged_reply_fallback(medication_label: str) -> str:
    return (
        "I could not read the photo clearly enough to confirm the medicine. "
        "I logged it for your caregiver to review."
    )


def _logged_reply_known(medication_label: str, quantity: int | None) -> str:
    if quantity is not None:
        return f"I found {medication_label}. About {quantity} pills left — plenty for now. I logged it."
    return f"I found {medication_label}. I logged it."


def _offer_refill_reply(medication_label: str, quantity: int | None) -> str:
    if quantity is not None:
        return (
            f"I found {medication_label}. Only about {quantity} pills left. "
            "Reply 'yes' to order a refill."
        )
    return f"I found {medication_label}. I logged it. Reply 'yes' to order a refill."


def _auto_refill_reply(medication_label: str, quantity: int | None) -> str:
    if quantity is not None:
        return (
            f"I found {medication_label}. Only about {quantity} pills left — "
            "placing a refill for you now."
        )
    return f"I found {medication_label}. Placing a refill for you now."


def _order_reply(medication_label: str) -> str:
    return f"I found {medication_label}. I placed a refill request."


def _unknown_order_reply() -> str:
    return "I could not identify that medicine clearly enough to request a refill. I logged it for your caregiver to review."


def _unknown_logged_reply() -> str:
    return "I could not identify that medicine clearly. I logged it for your caregiver to review."


def _not_prescription_reply() -> str:
    return "That doesn't look like a medicine to me. Send a clear photo of the pill bottle or prescription label."


def _duplicate_reply(medication_label: str) -> str:
    if medication_label:
        return f"I already saw that {medication_label} — still logged."
    return "I already saw that one — still logged."


def _short_tx_hash(tx_hash: str) -> str:
    if len(tx_hash) <= 22:
        return tx_hash
    return f"{tx_hash[:10]}...{tx_hash[-8:]}"


def _order_receipt(
    *,
    order_id: int,
    medication: str,
    dosage: str,
    payment_result: Any,
) -> str:
    raw_response = payment_result.raw_response if isinstance(payment_result.raw_response, dict) else {}
    medication_label = f"{medication} {dosage}".strip()
    lines = [
        "The refill request is confirmed.",
        "",
        f"Receipt #{order_id}",
        f"Medicine: {medication_label}",
        "Status: confirmed",
    ]

    amount_btc = raw_response.get("amount_btc")
    if amount_btc:
        lines.append(f"Amount: {amount_btc} BTC")

    tx_hash = payment_result.tx_hash
    if tx_hash:
        lines.append(f"Transaction: {_short_tx_hash(tx_hash)}")

    goat_scan_url = raw_response.get("goatScanUrl")
    if goat_scan_url:
        lines.append(f"Proof: {goat_scan_url}")

    return "\n".join(lines)


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
        confirmation = _order_receipt(
            order_id=order_id,
            medication=medication,
            dosage=dosage,
            payment_result=payment_result,
        )
    elif payment_result.success:
        confirmation = _order_receipt(
            order_id=order_id,
            medication=medication,
            dosage=dosage,
            payment_result=payment_result,
        )
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

        if _is_not_prescription(result):
            reply = _not_prescription_reply()
            log_interaction(body or "Photo message", reply, "not_prescription")
            send_message(from_number, reply, base_url)
            return

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

        med_name = _medication_name(result)
        dosage = str(result.get("dosage") or "unknown dosage")
        quantity = _quantity(result)
        refill_needed = _refill_needed(result)
        medication_label = f"{med_name} {dosage}".strip()
        is_fallback = _is_fallback_result(result)
        is_unknown = _is_unknown_medication(med_name)

        if is_unknown or is_fallback:
            log_alert(
                "medication_review",
                f"Medication photo needs review. Log #{med_log_id}.",
            )

        if is_fallback:
            reply = _logged_reply_fallback(medication_label)
            log_interaction(body or "Photo message", reply, "log_medication")
            send_message(from_number, reply, base_url)
            return

        if order_requested:
            if is_unknown:
                send_message(from_number, _unknown_order_reply(), base_url)
                return
            reply = _order_reply(medication_label)
            log_interaction(body or "Photo message", reply, "log_medication")
            send_message(from_number, reply, base_url)
            await place_mock_or_live_order(
                from_number=from_number,
                medication=med_name,
                dosage=dosage,
                med_log_id=med_log_id,
                reason=body or "WhatsApp photo refill request",
                base_url=base_url,
                send_message=send_message,
            )
            return

        if is_unknown:
            reply = _unknown_logged_reply()
            log_interaction(body or "Photo message", reply, "log_medication")
            send_message(from_number, reply, base_url)
            return

        if refill_needed:
            if _auto_refill_enabled():
                reply = _auto_refill_reply(medication_label, quantity)
                log_interaction(body or "Photo message", reply, "auto_refill")
                send_message(from_number, reply, base_url)
                await place_mock_or_live_order(
                    from_number=from_number,
                    medication=med_name,
                    dosage=dosage,
                    med_log_id=med_log_id,
                    reason=f"auto_refill (refill_needed=True); body={body!r}",
                    base_url=base_url,
                    send_message=send_message,
                )
                return
            offer = _offer_refill_reply(medication_label, quantity)
            set_pending_order(from_number, med_log_id, med_name, dosage)
            log_interaction(body or "Photo message", offer, "log_medication")
            send_message(from_number, offer, base_url)
            return

        ack = _logged_reply_known(medication_label, quantity)
        log_interaction(body or "Photo message", ack, "log_medication")
        send_message(from_number, ack, base_url)
    except Exception as exc:
        print(f"[photo] processing failed: {exc}")
        log_alert("photo_processing_failed", f"Could not process medication photo from {from_number}: {exc}")
        send_message(
            from_number,
            "I could not read that photo clearly. I logged it so your caregiver can check.",
            base_url,
        )
