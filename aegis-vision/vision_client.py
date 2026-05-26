import os
import json
import re
import base64
import anthropic
from dotenv import load_dotenv

load_dotenv()

FALLBACK_RESPONSE = {
    "medication": "Lisinopril",
    "dosage": "10mg",
    "quantity": 3,
    "refill_needed": True,
    "confidence": "fallback",
}

CLAUDE_PROMPT = (
    "You are analyzing an image for an elderly care AI agent called Aegis. "
    "First determine whether the image shows a prescription medication label or pill bottle. "
    "Return ONLY a valid JSON object — no markdown, no code fences, no explanation.\n\n"
    "Always include:\n"
    '  "is_prescription": true if the image clearly shows a prescription medication or pill bottle, false for anything else\n\n'
    "If is_prescription is true, also include:\n"
    '  "medication": full medication name (string)\n'
    '  "dosage": dosage including units e.g. "10mg" (string)\n'
    '  "quantity": estimated number of pills remaining (integer)\n'
    '  "refill_needed": true if quantity is 5 or less, otherwise false (boolean)\n'
    '  "confidence": "high", "medium", or "low" (string)\n\n'
    "If is_prescription is false, omit the above fields.\n"
    "Return raw JSON only."
)


def _client() -> anthropic.Anthropic:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY is not set in environment")
    return anthropic.Anthropic(api_key=api_key)


def _parse(text: str) -> dict:
    cleaned = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()
    data = json.loads(cleaned)
    if not data.get("is_prescription", False):
        return {"error": "not a proper prescription"}
    return {
        "medication": str(data["medication"]) if data.get("medication") else "Unknown",
        "dosage": str(data["dosage"]) if data.get("dosage") else "Unknown",
        "quantity": int(data.get("quantity", 0)),
        "refill_needed": bool(data.get("refill_needed", False)),
        "confidence": data.get("confidence", "low"),
    }


def analyze_image_bytes(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    print(f"[vision] analyzing image — {len(image_bytes)} bytes, mime={mime_type}")
    try:
        client = _client()
        image_data = base64.standard_b64encode(image_bytes).decode("utf-8")

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": mime_type,
                                "data": image_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": CLAUDE_PROMPT,
                        },
                    ],
                }
            ],
        )

        raw_text = response.content[0].text.strip()
        print(f"[vision] raw response: {raw_text}")

        result = _parse(raw_text)
        if "error" not in result:
            result["raw_analysis"] = raw_text
        return result

    except json.JSONDecodeError as e:
        print(f"[vision] JSON parse error: {e} — returning fallback")
        return FALLBACK_RESPONSE.copy()
    except Exception as e:
        print(f"[vision] error: {e} — returning fallback")
        return FALLBACK_RESPONSE.copy()
