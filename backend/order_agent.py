import os
from dataclasses import dataclass
from typing import Any
from uuid import uuid4

import httpx


ORDER_AMOUNT_BTC = "0.0001"


@dataclass(frozen=True)
class OrderAgentResult:
    success: bool
    status: str
    tx_hash: str | None
    message: str
    raw_response: dict[str, Any]


def _mode() -> str:
    return os.getenv("ORDER_AGENT_MODE", "mock").strip().lower() or "mock"


def _payment_agent_url() -> str:
    return os.getenv("PAYMENT_AGENT_URL", "http://127.0.0.1:6000").rstrip("/")


def build_order_payload(medication: str, dosage: str) -> dict[str, str]:
    return {
        "medication": medication,
        "dosage": dosage,
        "amount_btc": ORDER_AMOUNT_BTC,
        "source": "whatsapp_photo",
        "mode": _mode(),
    }


def _mock_order_response() -> OrderAgentResult:
    tx_hash = f"0x{uuid4().hex}"
    raw_response = {
        "success": True,
        "status": "mock_confirmed",
        "txHash": tx_hash,
        "message": "Demo order confirmed",
    }
    return OrderAgentResult(
        success=True,
        status="mock_confirmed",
        tx_hash=tx_hash,
        message="Demo order confirmed",
        raw_response=raw_response,
    )


def _failed_order_response(message: str) -> OrderAgentResult:
    raw_response = {
        "success": False,
        "status": "payment_agent_failed",
        "txHash": None,
        "message": message,
    }
    return OrderAgentResult(
        success=False,
        status="payment_agent_failed",
        tx_hash=None,
        message=message,
        raw_response=raw_response,
    )


def _normalize_live_response(raw_response: dict[str, Any]) -> OrderAgentResult:
    success = bool(raw_response.get("success"))
    status = str(raw_response.get("status") or ("confirmed" if success else "payment_agent_failed"))
    tx_hash = raw_response.get("txHash") or raw_response.get("tx_hash")
    message = str(raw_response.get("message") or ("Order confirmed" if success else "Payment agent failed"))
    return OrderAgentResult(
        success=success,
        status=status,
        tx_hash=str(tx_hash) if tx_hash else None,
        message=message,
        raw_response=raw_response,
    )


async def request_refill_order(medication: str, dosage: str) -> OrderAgentResult:
    payload = build_order_payload(medication, dosage)
    if _mode() != "live":
        return _mock_order_response()

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(f"{_payment_agent_url()}/pay", json=payload)
            response.raise_for_status()
            return _normalize_live_response(response.json())
    except Exception as exc:
        return _failed_order_response(f"Payment agent request failed: {exc}")
