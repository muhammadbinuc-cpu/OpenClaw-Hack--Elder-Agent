# Aegis — Autonomous AI agent for elderly dementia care with blockchain-verified payments

**Built at:** OpenClaw Hackathon, Toronto Tech Week, May 26 2026

## What is Aegis?

Aegis is an AI agent system that helps elderly people with dementia manage their daily medications and finances autonomously through Meta Ray-Ban glasses. It protects them from fraud using blockchain-verified merchant identities (ERC-8004) and executes payments through x402/AgentKit on the GOAT Network.

---

## Full System Architecture (5 pieces, 5 team members)

```
[Meta Glasses] ──image──▶ [Gemini Vision API] ──JSON──▶ [Backend Orchestrator]
  Muhammad                    Farill (THIS)                   Muaaz
                                                               │
                                                               ▼
                                                     [ElderAgent + PharmacyAgent]
                                                          Ibrahim (ClawUp)
                                                               │
                                                               ▼
                                                     [Guardian Dashboard]
                                                           Abdullah
```

### Piece 1 — Meta Glasses (Muhammad)
- Ray-Ban Meta glasses capture a photo of a pill bottle
- Streams image to phone, phone sends to Piece 2

### Piece 2 — Gemini Vision API (Farill) ← THIS SERVICE
- Receives image (multipart or base64 JSON)
- Sends to Gemini 2.0 Flash Vision API
- Extracts: medication name, dosage, quantity remaining, refill needed
- Returns structured JSON to Muaaz's backend
- If Gemini fails → returns hardcoded Lisinopril 10mg fallback

### Piece 3 — Backend Orchestrator (Muaaz)
- Receives medication JSON from Piece 2
- Calls ElderAgent (Piece 4) with medication info
- Receives confirmation and sends to glasses + dashboard

### Piece 4 — ElderAgent on ClawUp + PharmacyAgent (Ibrahim)
- ElderAgent receives medication request from Muaaz
- Verifies pharmacy's ERC-8004 identity on GOAT Network blockchain
- If trusted → executes x402 micropayment via AgentKit
- PharmacyAgent verifies payment, confirms refill
- If untrusted → blocks transaction (scam protection)
- Returns confirmation to Muaaz

### Piece 5 — Guardian Dashboard (Abdullah)
- React frontend showing transaction history
- Displays agent identity, reputation score, payment confirmations
- Links to GoatScan for on-chain verification

---

## This Service: Piece 2

**Input:** Image from Muhammad's Meta glasses (sent via Muaaz's backend orchestrator)  
**Output:** Structured JSON with medication info → forwarded to Muaaz's backend

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check — returns `{"status":"ok","service":"aegis-vision"}` |
| POST | `/analyze` | Accepts multipart image upload, returns medication JSON |
| POST | `/analyze-base64` | Accepts `{"image": "<base64>", "mime_type": "image/jpeg"}`, returns medication JSON |

### Response format (both analyze endpoints)

Prescription detected:
```json
{
  "is_prescription": true,
  "medication": "Lisinopril",
  "dosage": "10mg",
  "quantity": 3,
  "refill_needed": true,
  "confidence": "high",
  "raw_analysis": "Full Gemini response text for debugging"
}
```

Not a prescription (random image):
```json
{
  "is_prescription": false,
  "medication": null,
  "dosage": null,
  "quantity": 0,
  "refill_needed": false,
  "confidence": "high",
  "raw_analysis": "Full Gemini response text for debugging"
}
```

`confidence` values: `"high"` (Gemini succeeded), `"fallback"` (Gemini failed, hardcoded response used)

---

## Tech Stack

- Python 3.11+
- FastAPI + uvicorn
- google-generativeai (Gemini 2.0 Flash)
- httpx (async HTTP for forwarding to backend)
- python-dotenv
- python-multipart

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key |
| `BACKEND_URL` | No | Muaaz's backend endpoint to forward results to |

---

## How to Run

```bash
cd aegis-vision
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set your GEMINI_API_KEY
# Optionally set BACKEND_URL to Muaaz's server
python main.py
```

Server starts on **http://localhost:5000**

### Test it

```bash
# With a real pill bottle photo:
python test_local.py path/to/pill_bottle.jpg

# Without an image (uses blank test image, will trigger fallback):
python test_local.py
```

---

## Demo Flow

1. Elderly user holds pill bottle up to Meta glasses
2. Muhammad's glasses capture photo → sends to Muaaz's backend
3. Muaaz's backend POSTs image to `POST /analyze` on this service
4. This service sends image to Gemini Vision API
5. Gemini returns medication name, dosage, quantity
6. This service returns JSON + optionally forwards to `BACKEND_URL`
7. Muaaz's backend calls Ibrahim's ElderAgent with medication data
8. ElderAgent verifies pharmacy identity on GOAT Network blockchain
9. If trusted → x402 payment executes via AgentKit
10. Abdullah's dashboard shows transaction + GoatScan link
11. Confirmation appears on the glasses

---

## Fallback Behavior

If Gemini API is unreachable or returns unparseable output, the service returns:
```json
{
  "medication": "Lisinopril",
  "dosage": "10mg",
  "quantity": 3,
  "refill_needed": true,
  "confidence": "fallback",
  "raw_analysis": "Gemini API unavailable — using hardcoded fallback response"
}
```
The server never crashes — it always returns a valid medication JSON.

---

## Hackathon Stack

OpenClaw · ClawUp · ERC-8004 · x402 · GOAT Network · AgentKit · Gemini API · Meta Ray-Ban

## Team

| Name | Role |
|------|------|
| Farill | Gemini Vision API (this service) |
| Muhammad | Meta Ray-Ban glasses |
| Muaaz | Backend orchestrator |
| Ibrahim | ElderAgent + PharmacyAgent on ClawUp |
| Abdullah | Guardian dashboard |
