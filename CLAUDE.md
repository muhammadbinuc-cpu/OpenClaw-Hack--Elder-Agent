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

## Demo Flow

1. Patient says, "Hey Meta, send a WhatsApp message to Aegis."
2. Twilio sends the message to `POST /webhook/whatsapp`.
3. Backend asks Claude for `{ action, spoken_response }`, or uses fallback logic if no key is configured.
4. Backend logs the interaction and responds immediately with TwiML.
5. For photos, backend replies immediately, processes the image in a background task, calls `aegis-vision`, logs the medication, and sends a final WhatsApp message.

## Run

```bash
./setup.sh
cp backend/.env.example backend/.env
cp aegis-vision/.env.example aegis-vision/.env
./run_all.sh
```

Use ngrok for Twilio:

```bash
ngrok http 8000
```

Then configure Twilio WhatsApp Sandbox inbound messages to:

```text
https://YOUR-NGROK-DOMAIN/webhook/whatsapp
```

## Tech Stack

- FastAPI, Twilio, Anthropic Claude, Gemini, SQLite, gTTS.
- OpenClaw, ERC-8004, x402, GOAT Network remain part of the larger hackathon story and payment follow-up.
