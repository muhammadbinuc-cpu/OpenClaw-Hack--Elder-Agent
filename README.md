# Aegis 🛡️

### 🏆 1st Place — OpenClaw Hackathon 2026 (Toronto Tech Week) · out of 500+ hackers

**An AI-powered multi-agent system that turns a Meta Ray-Ban glasses photo into an autonomous, blockchain-verified medication-refill workflow — for elderly patients with dementia.**

🔗 **Live demo:** https://aegis-guardian-ai.vercel.app

---

## What it does

An elderly user holds a pill bottle up to their Meta Ray-Ban glasses. From that single
photo, Aegis:

1. **Reads the label** with vision AI (medication name, dosage, pills remaining, refill need)
2. **Routes the refill request** through a FastAPI orchestrator to autonomous agents
3. **Verifies the pharmacy's on-chain identity** (ERC-8004) before trusting it
4. **Executes a micropayment** via x402 / AgentKit on the GOAT Network — or **blocks the
   transaction** if the merchant is untrusted (fraud protection)
5. **Surfaces everything to a caregiver** on the Guardian Dashboard, with human approval on
   every high-risk action

The result: medication management that's autonomous, verified, and human-approved — built
to protect a vulnerable population from both missed doses and financial fraud.

## Architecture

```
[Meta Glasses] ──image──▶ [Vision API] ──JSON──▶ [Backend Orchestrator]
                                                          │
                                                          ▼
                                                [ElderAgent + PharmacyAgent]
                                                          │
                                                          ▼
                                                  [Guardian Dashboard]
```

| # | Piece | Stack |
|---|-------|-------|
| 1 | Meta Ray-Ban glasses → photo capture | Meta Ray-Ban, WhatsApp |
| 2 | Vision API — label extraction | FastAPI, Gemini Vision |
| 3 | Backend orchestrator | FastAPI, Twilio, SQLite |
| 4 | ElderAgent + PharmacyAgent | x402, ERC-8004, AgentKit |
| 5 | Guardian Dashboard | React, Vite |

## Tech stack

**Frontend:** React 19 · Vite · Tailwind CSS · Framer Motion · Three.js / Spline
**Backend:** Python · FastAPI · Twilio · SQLite
**AI:** Gemini Vision (medication-label extraction)
**Web3:** x402 · ERC-8004 (on-chain agent identity) · GOAT Network · AgentKit
**Platform:** OpenClaw · ClawUp · Meta Ray-Ban

## Repo layout

| Path | Description |
|------|-------------|
| [`aegis-guardian/`](./aegis-guardian) | Guardian Dashboard — the deployed React/Vite frontend |
| [`aegis-vision/`](./aegis-vision) | Vision API — FastAPI service that reads pill-bottle photos |
| [`backend/`](./backend) | Orchestrator — FastAPI + Twilio WhatsApp + SQLite |

## Run the frontend locally

```bash
cd aegis-guardian
npm install
npm run dev        # http://localhost:5173
```

Deployed on Vercel (root directory `aegis-guardian`); every push to `main` auto-deploys.

---

<sub>Built at OpenClaw Hackathon · Toronto Tech Week 2026.</sub>
