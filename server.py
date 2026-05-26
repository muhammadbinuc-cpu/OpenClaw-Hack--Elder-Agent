"""
server.py — HTTP wrapper around agent_pay.pay() so Aegis (an HTTP-only AI agent)
can trigger GOAT mainnet payments via a URL.

Run:
    pip install -r requirements.txt
    export AEGIS_PRIVATE_KEY=0x...        # or put it in .env
    python server.py                      # serves on http://0.0.0.0:8000

Endpoints:
    GET  /health            → liveness check
    GET  /agents            → list registered (trusted) agents
    POST /agents            → register a trusted agent (mock ERC-8004 entry)
    POST /pay               → execute a payment

Example Aegis call:
    curl -X POST http://localhost:8000/agents \
      -H 'Content-Type: application/json' \
      -d '{"address":"0xPharmacy...","name":"TrustedPharmacy",
           "endpoint":"https://pharmacy.example/refill","reputation":98}'

    curl -X POST http://localhost:8000/pay \
      -H 'Content-Type: application/json' \
      -d '{"from_wallet":"0xAegis...","to_wallet":"0xPharmacy...","amount_btc":"0.0001"}'
"""

import os

from flask import Flask, jsonify, request
from web3 import Web3

from agent_pay import pay, TRUSTED_AGENTS, GOAT_CHAIN_ID, GOAT_CURRENCY_SYMBOL

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify(
        status="ok",
        network="GOAT mainnet",
        chainId=GOAT_CHAIN_ID,
        currency=GOAT_CURRENCY_SYMBOL,
        registeredAgents=len(TRUSTED_AGENTS),
    )


@app.get("/agents")
def list_agents():
    return jsonify(
        {addr: info for addr, info in TRUSTED_AGENTS.items()}
    )


@app.post("/agents")
def register_agent():
    """Register a trusted agent (mock ERC-8004 registry entry)."""
    data = request.get_json(silent=True) or {}
    missing = [k for k in ("address", "name", "endpoint", "reputation") if k not in data]
    if missing:
        return jsonify(error=f"Missing fields: {', '.join(missing)}"), 400

    try:
        addr = Web3.to_checksum_address(data["address"])
    except (ValueError, TypeError):
        return jsonify(error=f"Invalid address: {data['address']!r}"), 400

    TRUSTED_AGENTS[addr] = {
        "name": data["name"],
        "endpoint": data["endpoint"],
        "reputation": data["reputation"],
    }
    return jsonify(registered=addr, agent=TRUSTED_AGENTS[addr]), 201


@app.post("/pay")
def pay_endpoint():
    """Execute an agent-to-agent payment on GOAT mainnet."""
    data = request.get_json(silent=True) or {}
    missing = [k for k in ("from_wallet", "to_wallet", "amount_btc") if k not in data]
    if missing:
        return jsonify(error=f"Missing fields: {', '.join(missing)}"), 400

    result = pay(
        from_wallet=data["from_wallet"],
        to_wallet=data["to_wallet"],
        amount_btc=str(data["amount_btc"]),
    )
    return jsonify(result.to_dict()), (200 if result.success else 422)


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    app.run(host="0.0.0.0", port=port)
