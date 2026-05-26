"""Gemini calls for journal extraction and doctor-visit summary."""

import json
import logging
import os

import google.generativeai as genai
from dotenv import load_dotenv

from prompts import EXTRACTION_PROMPT, SUMMARY_PROMPT

load_dotenv()

logger = logging.getLogger(__name__)

MODEL_NAME = "gemini-2.5-flash"
VALID_TYPES = frozenset({"medication", "symptom", "question_for_doctor", "note"})
EXTRACTION_KEYS = (
    "type",
    "medication",
    "dose",
    "taken",
    "food_context",
    "symptoms",
    "notes",
)

_model: genai.GenerativeModel | None = None


def _get_model() -> genai.GenerativeModel:
    global _model
    if _model is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel(MODEL_NAME)
    return _model


def _fallback_note(raw_text: str) -> dict:
    return {"type": "note", "notes": raw_text}


def _normalize_extraction(parsed: dict) -> dict:
    out = {key: parsed.get(key) for key in EXTRACTION_KEYS}
    entry_type = out.get("type")
    if entry_type not in VALID_TYPES:
        raise ValueError(f"invalid entry type: {entry_type!r}")
    return out


def extract_entry(raw_text: str, timestamp: str) -> dict:
    """Extract structured fields from free-form patient text."""
    try:
        model = _get_model()
        prompt = EXTRACTION_PROMPT.format(message=raw_text, timestamp=timestamp)
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"},
        )
        parsed = json.loads(response.text)
        if not isinstance(parsed, dict):
            raise ValueError("extraction response is not a JSON object")
        return _normalize_extraction(parsed)
    except Exception:
        logger.exception("extract_entry failed")
        return _fallback_note(raw_text)


def summarize(entries: list, patient_name: str, n_days: int) -> str:
    """Format entries into a plain-text doctor-visit handout."""
    try:
        model = _get_model()
        prompt = SUMMARY_PROMPT.format(
            patient_name=patient_name,
            n_days=n_days,
            entries_json=json.dumps(entries, indent=2, ensure_ascii=False),
        )
        response = model.generate_content(prompt)
        return (response.text or "").strip()
    except Exception:
        logger.exception("summarize failed")
        return (
            f"{patient_name} — last {n_days} days\n\n"
            "Summary could not be generated. "
            f"({len(entries)} entries on file — try again or use /list.)"
        )