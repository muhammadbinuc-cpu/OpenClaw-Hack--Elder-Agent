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
    "You are analyzing a prescription label or medication bottle for an elderly care AI agent. "
    "Extract the following and return as JSON only, no markdown, no extra text: "
    "medication name, dosage in mg, estimated pills remaining if visible, "
    "whether refill is needed (true if quantity is 5 or less). "
    'Format: {"medication": "", "dosage": "", "quantity": 0, "refill_needed": true/false, "confidence": "high/medium/low"}'
)


def _client() -> anthropic.Anthropic:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY is not set in environment")
    return anthropic.Anthropic(api_key=api_key)


def _parse(text: str) -> dict:
    cleaned = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()
    return json.loads(cleaned)


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
        result["raw_analysis"] = raw_text
        return result

    except json.JSONDecodeError as e:
        print(f"[vision] JSON parse error: {e} — returning fallback")
        return FALLBACK_RESPONSE.copy()
    except Exception as e:
        print(f"[vision] error: {e} — returning fallback")
        return FALLBACK_RESPONSE.copy()
