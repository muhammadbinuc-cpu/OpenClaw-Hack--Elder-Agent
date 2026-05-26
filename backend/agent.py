import json
import os
import re
from typing import Literal

from anthropic import Anthropic
from pydantic import BaseModel, ValidationError


Action = Literal["log_medication", "create_alert", "check_schedule", "reply"]


class AgentDecision(BaseModel):
    action: Action
    spoken_response: str


SYSTEM_PROMPT = """
You are Aegis, a calm care assistant for an elderly dementia patient.
Interpret the patient's WhatsApp voice-transcribed message.
Return only JSON with:
- action: one of log_medication, create_alert, check_schedule, reply
- spoken_response: 1-2 short sentences that can be read aloud through smart glasses
Never give emergency medical instructions. For urgent or unclear medical risk, create_alert.
"""


def _fallback_decision(message: str) -> AgentDecision:
    lowered = message.lower()
    if any(word in lowered for word in ["hurt", "pain", "lost", "scared", "help", "emergency"]):
        return AgentDecision(
            action="create_alert",
            spoken_response="I am letting your caregiver know now. Please stay where you are if you feel unsafe.",
        )
    if any(word in lowered for word in ["schedule", "when", "next"]):
        return AgentDecision(
            action="check_schedule",
            spoken_response="I do not have your full schedule yet. I will ask your caregiver to confirm it.",
        )
    if any(word in lowered for word in ["pill", "medication", "medicine", "took", "dose"]):
        return AgentDecision(
            action="log_medication",
            spoken_response="I recorded that for your caregiver. Please follow the instructions on your medication label.",
        )
    return AgentDecision(
        action="reply",
        spoken_response="I am here with you. I can help with medication questions or contact your caregiver.",
    )


def _parse_decision(content: str) -> AgentDecision:
    cleaned = content.strip()
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(0)
    return AgentDecision.model_validate(json.loads(cleaned))


def interpret_patient_message(message: str, patient_name: str) -> AgentDecision:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return _fallback_decision(message)

    try:
        client = Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=220,
            temperature=0,
            system=SYSTEM_PROMPT.strip(),
            messages=[
                {
                    "role": "user",
                    "content": f"Patient name: {patient_name}\nMessage: {message}",
                }
            ],
        )
        content = response.content[0].text if response.content else "{}"
        return _parse_decision(content)
    except (json.JSONDecodeError, ValidationError, Exception) as exc:
        print(f"[agent] falling back after LLM error: {exc}")
        return _fallback_decision(message)
