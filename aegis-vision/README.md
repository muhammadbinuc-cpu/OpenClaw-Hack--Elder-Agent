# Aegis Vision — Piece 2

Gemini Vision API layer for the Aegis elderly care agent. Receives a photo of a pill bottle, identifies the medication, and returns structured JSON to the backend orchestrator.

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` with `GEMINI_API_KEY=your_google_ai_studio_key`.

## Run

```bash
python main.py
```

Server runs on **http://localhost:5000**

## Endpoints

### `GET /health`
```json
{"status": "ok", "service": "aegis-vision"}
```

### `POST /analyze`
JSON body with base64-encoded image:
```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{"image": "<base64string>", "mime_type": "image/jpeg"}'
```

### `POST /analyze-file`
Multipart file upload for local testing:
```bash
curl -X POST http://localhost:5000/analyze-file \
  -F "file=@pill_bottle.jpg"
```

### Response (both analyze endpoints)

Prescription detected:
```json
{
  "name": "Lisinopril",
  "dosage": "10mg",
  "purpose": "Helps lower blood pressure.",
  "warnings": "Check with a caregiver or doctor before changing how this is taken.",
  "confidence": "high",
  "raw_analysis": "Full Gemini response for debugging"
}
```

`confidence` is `"high"` when Gemini succeeds, `"fallback"` if Gemini fails (server always returns valid JSON).

## Test

```bash
# With a real image:
python test_local.py path/to/pill_bottle.jpg

# Without an image (blank test image, will use fallback):
python test_local.py
```

## Notes for teammates

- **Muaaz (backend):** POST to `/analyze` with base64 JSON. `/analyze-file` is only for local/manual tests.
- **Muhammad (glasses):** Send the image to Muaaz who will relay it here. Both multipart and base64 are supported.
- CORS is open to all origins — no header config needed on your end.
