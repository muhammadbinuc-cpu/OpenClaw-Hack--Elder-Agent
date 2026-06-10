# Aegis Vision — Piece 2

Claude vision API layer for the Aegis elderly care agent. Receives a photo of a pill bottle, identifies the medication, and returns structured JSON to the backend orchestrator.

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:
```
ANTHROPIC_API_KEY=your_anthropic_key
VISION_PORT=5001
BACKEND_URL=http://muaaz-server/medication   # optional — forward results automatically
```

## Run

```bash
python main.py
```

Server runs on **http://localhost:5001** by default.

## Endpoints

### `GET /health`
```json
{"status": "ok", "service": "aegis-vision"}
```

### `POST /analyze`
Multipart file upload:
```bash
curl -X POST http://localhost:5001/analyze \
  -F "file=@pill_bottle.jpg"
```

### `POST /analyze-base64`
JSON body with base64-encoded image:
```bash
curl -X POST http://localhost:5001/analyze-base64 \
  -H "Content-Type: application/json" \
  -d '{"image": "<base64string>", "mime_type": "image/jpeg"}'
```

### Response (both analyze endpoints)

Valid prescription (HTTP 200):
```json
{
  "medication": "Lisinopril",
  "dosage": "10mg",
  "quantity": 3,
  "refill_needed": true,
  "confidence": "high",
  "raw_analysis": "Full Claude response for debugging"
}
```

Not a prescription (HTTP 400):
```json
{
  "error": "not a proper prescription"
}
```

`confidence` is `"high"` when Claude succeeds, `"fallback"` if analysis fails and the demo fallback is used.

## Test

```bash
# With a real image:
python test_local.py path/to/pill_bottle.jpg

# Without an image (blank test image, will use fallback):
python test_local.py
```

## Notes for teammates

- **Muaaz (backend):** POST to `/analyze` with multipart, or `/analyze-base64` with JSON. Set `BACKEND_URL` in `.env` to have results auto-forwarded to your server.
- **Muhammad (glasses):** Send the image to Muaaz who will relay it here. Both multipart and base64 are supported.
- CORS is open to all origins — no header config needed on your end.
