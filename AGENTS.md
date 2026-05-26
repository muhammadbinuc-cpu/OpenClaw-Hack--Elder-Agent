# Repository Instructions

## Project Shape
- `backend/` is the urgent WhatsApp agent orchestrator on port 8000.
- `aegis-vision/` is the Gemini medication image service on port 5000.
- Payment and guardian dashboard work is intentionally deferred until after the WhatsApp demo path is stable.
- `muaaz/payment-agent` currently contains a payment helper (`agent_pay.py`), not an HTTP service.

## Common Commands
- Install: `./setup.sh`
- Run services: `./run_all.sh`
- Backend only: `cd backend && python3 main.py`
- Vision only: `cd aegis-vision && python3 main.py`
- Seed demo DB: `python3 seed_demo.py`

## Working Rules
- Keep secrets in local `.env` files only. Do not commit real Twilio, Gemini, Anthropic, wallet, or RPC credentials.
- Keep the Twilio webhook fast. Slow photo work belongs in FastAPI background tasks.
- Every service should keep a `/health` endpoint and demo fallback behavior.
- Backend and vision communicate over HTTP only.
- For the live hackathon tunnel, use `PUBLIC_BASE_URL=https://granny-oxford-posh.ngrok-free.dev` and point Twilio to `/webhook/whatsapp`.

## Verification
- Check `GET http://127.0.0.1:8000/health`, `GET http://127.0.0.1:5000/health`, and the ngrok `/health`.
- Simulate text and photo webhooks before changing Twilio sandbox settings.
- Verify fallback mode without API keys because the hackathon demo must not break.
- Text replies should use Claude when credentials are present; photo recognition may fall back to Lisinopril if Gemini quota is exhausted.

## Codex and Claude Handoff
- Codex implements the smallest viable patch, then Claude Code can review the resulting diff.
- Do not let Codex and Claude Code edit this worktree concurrently.

## Assumptions To Verify
- Payment integration will be added later from Muaaz's `muaaz/payment-agent` branch or Ibrahim's pharmacy-agent branch once the HTTP contract is decided.
- Guardian dashboard is out of scope for the current WhatsApp-agent milestone.
