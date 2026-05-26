# Repository Instructions

## Project Shape
- `backend/` is the urgent WhatsApp agent orchestrator on port 8000.
- `aegis-vision/` is the Gemini medication image service on port 5000.
- Payment and guardian dashboard work is intentionally deferred until the team provides payment details and asks for dashboard implementation.

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

## Verification
- Check `GET http://localhost:8000/health` and `GET http://localhost:5000/health`.
- Simulate text and photo webhooks before changing Twilio sandbox settings.
- Verify fallback mode without API keys because the hackathon demo must not break.

## Codex and Claude Handoff
- Codex implements the smallest viable patch, then Claude Code can review the resulting diff.
- Do not let Codex and Claude Code edit this worktree concurrently.

## Assumptions To Verify
- Payment integration will be added later from Ibrahim's pharmacy-agent branch and live credentials.
- Guardian dashboard is out of scope for the current WhatsApp-agent milestone.
