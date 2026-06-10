#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting Aegis WhatsApp agent services..."
echo "Backend: http://localhost:8000"
echo "Vision:  http://localhost:5001"
echo "Twilio webhook for ngrok: https://YOUR-NGROK-DOMAIN/webhook/whatsapp"

trap 'kill 0' EXIT

(
  cd "$ROOT_DIR/aegis-vision"
  python3 main.py
) &

(
  cd "$ROOT_DIR/backend"
  python3 main.py
) &

wait
