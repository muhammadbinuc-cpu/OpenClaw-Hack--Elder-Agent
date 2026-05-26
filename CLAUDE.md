# Aegis Project Context

Aegis is an AI care agent for elderly dementia patients. The urgent milestone is a working WhatsApp bot that can receive voice-transcribed text and medication photos from Meta Ray-Ban glasses, respond quickly, log activity, and keep functioning without live API keys.

## Current Architecture

```
Meta Ray-Ban + WhatsApp
        |
        v
Twilio WhatsApp Sandbox
        |
        v
backend/ FastAPI :8000
  - POST /webhook/whatsapp
  - SQLite logs
  - Claude text interpretation with fallback
  - gTTS voice notes where Twilio/public URL are configured
        |
        v
aegis-vision/ FastAPI :5000
  - POST /analyze
  - Gemini medication identification with Lisinopril fallback
```

Payment and guardian dashboard are planned but intentionally deferred for now. Ibrahim's `mibrahim20071030-pharmacyagent` branch contains useful future payment-agent context, including `/health` and `/refill`, but the current implementation should not depend on it.

Muaaz's `muaaz/payment-agent` branch currently has `agent_pay.py`, a GOAT mainnet Python helper with mock ERC-8004 identity verification. It is not yet an HTTP service, so do not wire it directly into the WhatsApp background photo flow without adding a safe adapter and explicit confirmation/mocking controls.

## Demo Flow

1. Patient says, "Hey Meta, send a WhatsApp message to Aegis."
2. Twilio sends the message to `POST /webhook/whatsapp`.
3. Backend asks Claude for `{ action, spoken_response }`, or uses fallback logic if no key is configured.
4. Backend logs the interaction and responds immediately with TwiML.
5. For photos, backend replies immediately, processes the image in a background task, calls `aegis-vision`, logs the medication, and sends a final WhatsApp message.
6. Generated MP3 audio is served from `backend/static/audio/` so Twilio can fetch it through the public ngrok base URL.

## Run

```bash
./setup.sh
cp backend/.env.example backend/.env
cp aegis-vision/.env.example aegis-vision/.env
./run_all.sh
```

Use ngrok for Twilio:

```bash
ngrok http --url=granny-oxford-posh.ngrok-free.dev 8000
```

Then configure Twilio WhatsApp Sandbox inbound messages to:

```text
https://granny-oxford-posh.ngrok-free.dev/webhook/whatsapp
```

Local `.env` files are required for live testing and must not be committed:

- `backend/.env`: Twilio SID/token, Twilio WhatsApp sender, Anthropic key, `PUBLIC_BASE_URL`, patient name, DB URL, and vision URL.
- `aegis-vision/.env`: Gemini API key.

Current notes:

- Backend Claude calls use `claude-haiku-4-5-20251001`; older Haiku 3.5 model IDs were rejected by the provided key.
- The backend extracts JSON from Claude responses before validation.
- Gemini can hit free-tier quota; the vision service intentionally falls back to Lisinopril 10mg so the demo continues.

## Tech Stack

- FastAPI, Twilio, Anthropic Claude, Gemini, SQLite, gTTS.
- OpenClaw, ERC-8004, x402, GOAT Network remain part of the larger hackathon story and payment follow-up.

## Next Build Steps

1. Improve the WhatsApp patient experience: clearer medication-photo response, guardian alert wording, and better failure messages.
2. Add a safe payment adapter around Muaaz's helper with mock mode first; do not auto-send mainnet funds.
3. Add a minimal guardian activity page only after the WhatsApp flow is reliable.
