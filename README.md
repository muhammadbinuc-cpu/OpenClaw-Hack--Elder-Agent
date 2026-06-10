# Aegis

AI care-agent prototype for medication support over WhatsApp. The system accepts patient text or medication photos, extracts structured medication data, logs activity, and exposes a caregiver-facing dashboard.

**Live demo:** https://aegis-guardian-ai.vercel.app

## Architecture

```
Meta Ray-Ban / WhatsApp
        |
        v
Twilio WhatsApp Sandbox
        |
        v
backend/ FastAPI :8000
  - text intent parsing
  - photo background tasks
  - SQLite persistence
  - outbound Twilio replies
        |
        v
aegis-vision/ FastAPI :5001
  - prescription-image validation
  - medication extraction
  - fallback response for demo continuity
        |
        v
aegis-guardian/ React + Vite
  - dashboard UI
  - workflow and transaction views
```

## Services

| Path | Role | Runtime |
|------|------|---------|
| [`backend/`](./backend) | WhatsApp webhook, patient-message handling, medication logs, refill/order requests | Python, FastAPI, Twilio, SQLite, Anthropic Claude, gTTS |
| [`aegis-vision/`](./aegis-vision) | Medication-photo analysis API | Python, FastAPI, Anthropic Claude vision |
| [`aegis-guardian/`](./aegis-guardian) | Caregiver dashboard frontend | React, Vite, Tailwind CSS, Framer Motion, Three.js |

## Data Flow

1. Twilio sends inbound WhatsApp messages to `POST /webhook/whatsapp`.
2. Text messages are parsed into an action and spoken response.
3. Photo messages receive an immediate TwiML acknowledgement, then process in a background task.
4. The backend downloads the image and posts it to `aegis-vision`.
5. The vision service returns medication, dosage, quantity, refill need, and confidence.
6. The backend records medication logs, alerts, interactions, and order requests in SQLite.
7. Refill requests use `ORDER_AGENT_MODE=mock` by default. Live GOAT testnet payment only runs when explicitly configured.

## API Surface

Backend:

- `GET /health`
- `POST /webhook/whatsapp`
- `GET /api/stats`
- `GET /api/recent-meds`
- `GET /api/interactions`
- `GET /api/order-requests`
- `GET /api/payments`

Vision:

- `GET /health`
- `POST /analyze`
- `POST /analyze-base64`

Frontend:

- `/`
- `/dashboard`
- `/dashboard/transactions/:id`
- `/how-it-works`
- `/help`
- `/privacy`
- `/contact`

## Run locally

```bash
./setup.sh
cp backend/.env.example backend/.env
cp aegis-vision/.env.example aegis-vision/.env
./run_all.sh
```

Backend: http://127.0.0.1:8000

Vision: http://127.0.0.1:5001

## Environment

Copy the example env files before using live integrations:

```bash
cp backend/.env.example backend/.env
cp aegis-vision/.env.example aegis-vision/.env
```

Key backend settings:

- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`
- `ANTHROPIC_API_KEY`
- `VISION_SERVICE_URL=http://127.0.0.1:5001`
- `PUBLIC_BASE_URL`
- `ORDER_AGENT_MODE=mock`
- `DATABASE_URL=sqlite:///./data/aegis.db`

Key vision settings:

- `ANTHROPIC_API_KEY`
- `VISION_PORT=5001`
- `BACKEND_URL` optional forwarding target

## Frontend

```bash
cd aegis-guardian
npm install
npm run dev        # http://localhost:5173
```

Build and lint:

```bash
npm run build
npm run lint
```

The Vercel project deploys from `aegis-guardian/` and serves the public alias at `https://aegis-guardian-ai.vercel.app`.

## Safety Defaults

- The order agent defaults to mock mode.
- Live GOAT payment requires explicit wallet, RPC, and pharmacy wallet configuration.
- Vision failures return a deterministic fallback medication result instead of breaking the demo path.
- Real Twilio, Anthropic, wallet, and RPC credentials belong only in local `.env` files.
