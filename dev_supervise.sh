#!/usr/bin/env bash
# dev_supervise.sh — runs backend + aegis-vision + ngrok with auto-restart.
# Logs are written to ./logs/<service>.log. Ctrl-C kills the whole supervisor.

set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"

NGROK_URL="${NGROK_URL:-granny-oxford-posh.ngrok-free.dev}"

PIDS=()

shutdown() {
  echo
  echo "[supervise] shutting down..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  exit 0
}
trap shutdown INT TERM

supervise() {
  local name="$1"
  shift
  local logfile="$LOG_DIR/${name}.log"
  (
    while true; do
      echo "[supervise] starting $name at $(date -u +%FT%TZ)" | tee -a "$logfile"
      "$@" >>"$logfile" 2>&1
      local code=$?
      echo "[supervise] $name exited with code $code; restarting in 2s" | tee -a "$logfile"
      sleep 2
    done
  ) &
  PIDS+=($!)
  echo "[supervise] $name pid=$!"
}

cd "$ROOT/backend"
supervise backend env PYTHONUNBUFFERED=1 python3 main.py

cd "$ROOT/aegis-vision"
# Source backend/.env so vision inherits ANTHROPIC_API_KEY without duplicating the secret.
if [ -f "$ROOT/backend/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/backend/.env"
  set +a
fi
supervise vision env PYTHONUNBUFFERED=1 ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}" python3 main.py

cd "$ROOT"
if command -v ngrok >/dev/null 2>&1; then
  supervise ngrok ngrok http --url="$NGROK_URL" 8000 --log=stdout
else
  echo "[supervise] ngrok not installed; skipping tunnel"
fi

echo
echo "[supervise] services running. tail logs with: tail -F $LOG_DIR/*.log"
echo "[supervise] Ctrl-C to stop everything."

wait
