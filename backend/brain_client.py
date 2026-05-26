"""Client for the external Aegis brain agent.

CONTRACT (share this with whoever's building the brain):

    POST {AEGIS_BRAIN_URL}/chat
      Headers:  Authorization: Bearer {AEGIS_BRAIN_TOKEN}   (optional)
                Content-Type: application/json
      Body:
        {
          "from_number": "+15551234567",
          "message":     "the patient's WhatsApp text, or a photo summary",
          "context": {
            "patient_name":    "Muhammad",
            "recent_meds":     [{"med_name": "...", "dosage": "...", "timestamp": "..."}],
            "interactions":    [{"patient_message": "...", "agent_response": "...", "timestamp": "..."}],
            "pending_order":   {"medication": "...", "dosage": "..."} | null,
            "photo_result":    {"name": "...", "dosage": "...", "confidence": "..."} | null
          }
        }
      Response:
        {
          "reply": "natural-language reply to send to the patient",
          "actions": [
            {"type": "request_refill",      "args": {"medication": "...", "dosage": "..."}},
            {"type": "log_medication",      "args": {"name": "...", "dosage": "..."}},
            {"type": "set_pending_order",   "args": {"medication": "...", "dosage": "..."}},
            {"type": "clear_pending_order", "args": {}},
            {"type": "create_alert",        "args": {"alert_type": "...", "message": "..."}}
          ]
        }

If AEGIS_BRAIN_URL is unset, the backend falls back to local agent.py + photo_flow templates.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Any

import httpx


@dataclass
class BrainAction:
    type: str
    args: dict[str, Any] = field(default_factory=dict)


@dataclass
class BrainReply:
    reply: str
    actions: list[BrainAction] = field(default_factory=list)
    raw: dict[str, Any] = field(default_factory=dict)


def brain_url() -> str:
    return os.getenv("AEGIS_BRAIN_URL", "").rstrip("/")


def brain_enabled() -> bool:
    return bool(brain_url())


def _auth_header() -> dict[str, str]:
    token = os.getenv("AEGIS_BRAIN_TOKEN", "").strip()
    return {"Authorization": f"Bearer {token}"} if token else {}


async def call_brain(
    from_number: str,
    message: str,
    context: dict[str, Any],
    timeout_seconds: float = 12.0,
) -> BrainReply | None:
    """Call the external brain. Returns None on failure so callers can fall back."""
    url = brain_url()
    if not url:
        return None
    payload = {"from_number": from_number, "message": message, "context": context}
    try:
        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            response = await client.post(
                f"{url}/chat",
                json=payload,
                headers={"Content-Type": "application/json", **_auth_header()},
            )
            response.raise_for_status()
            data = response.json()
    except Exception as exc:
        print(f"[brain] call failed, falling back: {exc}")
        return None

    reply = str(data.get("reply") or "").strip()
    actions_raw = data.get("actions") or []
    actions: list[BrainAction] = []
    for entry in actions_raw:
        if not isinstance(entry, dict):
            continue
        action_type = str(entry.get("type") or "").strip()
        if not action_type:
            continue
        args = entry.get("args") or {}
        if not isinstance(args, dict):
            args = {}
        actions.append(BrainAction(type=action_type, args=args))
    return BrainReply(reply=reply, actions=actions, raw=data)
