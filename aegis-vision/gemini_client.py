import os
import json
import re
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

FALLBACK_RESPONSE = {
    "name": "Lisinopril",
    "dosage": "10mg",
    "purpose": "Helps lower blood pressure.",
    "warnings": "Check with a caregiver or doctor before changing how this is taken.",
    "confidence": "fallback",
    "raw_analysis": "Gemini API unavailable — using hardcoded fallback response",
}

GEMINI_PROMPT = (
    "You are analyzing an image for an elderly care AI agent called Aegis. "
    "Identify the medication from a prescription label, pill bottle, or package. "
    "Return ONLY a valid JSON object — no markdown, no code fences, no explanation.\n\n"
    "Always include:\n"
    '  "name": full medication name, or "Unknown" if unclear (string)\n'
    '  "dosage": dosage including units, e.g. "10mg" (string)\n'
    '  "purpose": short plain-language purpose of the medication (string)\n'
    '  "warnings": short safety warning for an elderly dementia patient (string)\n'
    '  "confidence": number from 0 to 1, or "low", "medium", "high" (number|string)\n\n'
    "If the image is not a medication, set name to Unknown, dosage to Unknown, "
    "purpose to Unable to identify, warnings to Ask a caregiver to verify, and confidence to low.\n"
    "Return raw JSON only."
)


def _client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment")
    return genai.Client(api_key=api_key)


def _parse(text: str) -> dict:
    cleaned = re.sub(r"```(?:json)?", "", text).strip()
    data = json.loads(cleaned)

    confidence = data.get("confidence", "medium")
    if isinstance(confidence, (int, float)):
        confidence = max(0.0, min(float(confidence), 1.0))
    else:
        confidence = str(confidence or "medium")

    return {
        "name": str(data.get("name") or data.get("medication") or "Unknown"),
        "dosage": str(data["dosage"]) if data.get("dosage") else "Unknown",
        "purpose": str(data.get("purpose") or "Ask a caregiver or pharmacist to verify."),
        "warnings": str(data.get("warnings") or "Do not change medication without checking with a caregiver."),
        "confidence": confidence,
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
        result["raw_analysis"] = raw_text
        return result

    except json.JSONDecodeError as e:
        print(f"[gemini] JSON parse error: {e} — returning fallback")
        return FALLBACK_RESPONSE.copy()
    except Exception as e:
        print(f"[gemini] error: {e} — returning fallback")
        return FALLBACK_RESPONSE.copy()
