# Aegis Guardian Dashboard

React/Vite frontend for the Aegis caregiver dashboard.

**Live demo:** https://aegis-guardian-ai.vercel.app

## Run Locally

```bash
npm install
npm run dev
```

Vite serves the app at http://localhost:5173 by default.

## Build

```bash
npm run build
npm run lint
```

## Routes

- `/` — landing/demo story
- `/dashboard` — caregiver dashboard
- `/dashboard/transactions/:id` — transaction detail
- `/how-it-works`, `/help`, `/privacy`, `/contact` — supporting pages

The app is deployed on Vercel from this directory. If the live alias shows Vercel authentication, Deployment Protection still needs to be disabled for the production deployment.
