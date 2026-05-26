#!/usr/bin/env bash
set -euo pipefail

python3 -m pip install -r backend/requirements.txt
python3 -m pip install -r aegis-vision/requirements.txt

echo "Installed backend and vision dependencies."
echo "Copy backend/.env.example to backend/.env and aegis-vision/.env.example to aegis-vision/.env before running with real credentials."
