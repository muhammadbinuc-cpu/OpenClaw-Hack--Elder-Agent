import os
import json
import re
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

FALLBACK_RESPONSE = {
    "error": "gemini_unavailable",
    "medication": None,
    "dosage": None,
    "quantity": 0,
    "refill_needed": False,
    "confidence": "fallback",
    "raw_analysis": "Gemini API unavailable — could not analyze image",
}

GEMINI_PROMPT = (
    "You are analyzing an image for an elderly care AI agent called Aegis. "
    "First determine whether the image shows a prescription medication label or pill bottle. "
    "Return ONLY a valid JSON object — no markdown, no code fences, no explanation.\n\n"
    "Always include:\n"
    '  "is_prescription": true if the image clearly shows a prescription medication or pill bottle, false for anything else (boolean)\n\n'
    "If is_prescription is true, also include:\n"
    '  "medication": full medication name (string)\n'
    '  "dosage": dosage including units, e.g. "10mg" (string)\n'
    '  "quantity": estimated number of pills remaining (integer; estimate visually if not printed)\n'
    '  "refill_needed": true if quantity is 5 or less, otherwise false (boolean)\n\n'
    "If is_prescription is false, set medication to null, dosage to null, quantity to 0, refill_needed to false.\n"
    "Return raw JSON only."
)


def _client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment")
    return genai.Client(api_key=api_key)


NOT_A_PRESCRIPTION = {"error": "not a proper prescription"}


def _parse(text: str) -> dict:
    cleaned = re.sub(r"```(?:json)?", "", text).strip()
    data = json.loads(cleaned)
    if not data.get("is_prescription", False):
        return NOT_A_PRESCRIPTION.copy()
    return {
        "medication": str(data["medication"]) if data.get("medication") else "Unknown",
        "dosage": str(data["dosage"]) if data.get("dosage") else "Unknown",
        "quantity": int(data.get("quantity", 0)),
        "refill_needed": bool(data.get("refill_needed", False)),
    }


def analyze_image_bytes(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    print(f"[gemini] analyzing image — {len(image_bytes)} bytes, mime={mime_type}")
    try:
        client = _client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Content(parts=[
                    types.Part(text=GEMINI_PROMPT),
                    types.Part(inline_data=types.Blob(data=image_bytes, mime_type=mime_type)),
                ])
            ],
        )
        raw_text = response.text.strip()
        print(f"[gemini] raw response: {raw_text}")

        result = _parse(raw_text)
        if "error" not in result:
            result["confidence"] = "high"
            result["raw_analysis"] = raw_text
        return result

    except json.JSONDecodeError as e:
        print(f"[gemini] JSON parse error: {e} — returning fallback")
        return FALLBACK_RESPONSE.copy()
    except Exception as e:
        print(f"[gemini] error: {e} — returning fallback")
        return FALLBACK_RESPONSE.copy()
