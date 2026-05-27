import os
from dataclasses import dataclass
from typing import Any
from uuid import uuid4

import httpx


DEFAULT_ORDER_AMOUNT_BTC = "0.0000001"
DEFAULT_GOAT_RPC_URL = "https://rpc.testnet3.goat.network"
DEFAULT_GOAT_CHAIN_ID = 48816
DEFAULT_GOAT_EXPLORER_TX_URL = "https://explorer.testnet3.goat.network/tx"


@dataclass(frozen=True)
class OrderAgentResult:
    success: bool
    status: str
    tx_hash: str | None
    message: str
    raw_response: dict[str, Any]


def _mode() -> str:
    return os.getenv("ORDER_AGENT_MODE", "mock").strip().lower() or "mock"


def _payment_agent_url() -> str:
    return os.getenv("PAYMENT_AGENT_URL", "http://127.0.0.1:6000").rstrip("/")


def _pharmacy_wallet_address() -> str:
    return os.getenv("PHARMACY_WALLET_ADDRESS", "").strip()


def _goat_private_key() -> str:
    return os.getenv("GOAT_WALLET_PRIVATE_KEY", "").strip() or os.getenv("AEGIS_PRIVATE_KEY", "").strip()


def _order_amount_btc() -> str:
    return os.getenv("ORDER_AMOUNT_BTC", DEFAULT_ORDER_AMOUNT_BTC).strip() or DEFAULT_ORDER_AMOUNT_BTC


def _with_0x_prefix(value: str) -> str:
    return value if value.startswith("0x") else f"0x{value}"


def build_order_payload(medication: str, dosage: str) -> dict[str, str]:
    return {
        "medication": medication,
        "dosage": dosage,
        "amount_btc": _order_amount_btc(),
        "source": "whatsapp_photo",
        "mode": _mode(),
    }


def _mock_order_response() -> OrderAgentResult:
    tx_hash = f"0x{uuid4().hex}"
    raw_response = {
        "success": True,
        "status": "mock_confirmed",
        "txHash": tx_hash,
        "message": "Order confirmed",
        "amount_btc": _order_amount_btc(),
    }
    return OrderAgentResult(
        success=True,
        status="mock_confirmed",
        tx_hash=tx_hash,
        message="Order confirmed",
        raw_response=raw_response,
    )


def _failed_order_response(message: str) -> OrderAgentResult:
    raw_response = {
        "success": False,
        "status": "payment_agent_failed",
        "txHash": None,
        "message": message,
    }
    return OrderAgentResult(
        success=False,
        status="payment_agent_failed",
        tx_hash=None,
        message=message,
        raw_response=raw_response,
    )


def _normalize_live_response(raw_response: dict[str, Any]) -> OrderAgentResult:
    success = bool(raw_response.get("success"))
    status = str(raw_response.get("status") or ("confirmed" if success else "payment_agent_failed"))
    tx_hash = raw_response.get("txHash") or raw_response.get("tx_hash")
    message = str(raw_response.get("message") or ("Order confirmed" if success else "Payment agent failed"))
    return OrderAgentResult(
        success=success,
        status=status,
        tx_hash=str(tx_hash) if tx_hash else None,
        message=message,
        raw_response=raw_response,
    )


def _goat_transfer_response(medication: str, dosage: str) -> OrderAgentResult:
    try:
        from eth_account import Account
        from web3 import Web3
    except ImportError:
        return _failed_order_response("Live GOAT payment requires web3 and eth-account. Run pip install -r backend/requirements.txt.")

    private_key = _goat_private_key()
    pharmacy_wallet = _pharmacy_wallet_address()
    if not private_key:
        return _failed_order_response("GOAT_WALLET_PRIVATE_KEY is not set.")
    if not pharmacy_wallet:
        return _failed_order_response("PHARMACY_WALLET_ADDRESS is not set.")

    rpc_url = os.getenv("GOAT_RPC_URL", DEFAULT_GOAT_RPC_URL).strip() or DEFAULT_GOAT_RPC_URL
    chain_id = int(os.getenv("GOAT_CHAIN_ID", str(DEFAULT_GOAT_CHAIN_ID)))
    explorer_base = os.getenv("GOAT_EXPLORER_TX_URL", DEFAULT_GOAT_EXPLORER_TX_URL).rstrip("/")
    amount_btc = _order_amount_btc()

    try:
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        if not w3.is_connected():
            return _failed_order_response(f"Cannot connect to GOAT RPC at {rpc_url}")

        account = Account.from_key(private_key)
        from_wallet = Web3.to_checksum_address(account.address)
        to_wallet = Web3.to_checksum_address(pharmacy_wallet)
        amount_wei = w3.to_wei(amount_btc, "ether")
        gas_price = w3.eth.gas_price
        nonce = w3.eth.get_transaction_count(from_wallet)
        balance = w3.eth.get_balance(from_wallet)
        estimated_cost = amount_wei + (21000 * gas_price)
        if balance < estimated_cost:
            return _failed_order_response(
                f"Insufficient GOAT testnet BTC: balance={w3.from_wei(balance, 'ether')} BTC, "
                f"needed={w3.from_wei(estimated_cost, 'ether')} BTC"
            )

        tx = {
            "from": from_wallet,
            "to": to_wallet,
            "value": amount_wei,
            "nonce": nonce,
            "gas": 21000,
            "gasPrice": gas_price,
            "chainId": chain_id,
        }
        signed = Account.sign_transaction(tx, private_key)
        tx_hash = _with_0x_prefix(w3.eth.send_raw_transaction(signed.raw_transaction).hex())
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=90)
        if receipt.status != 1:
            return _failed_order_response(f"GOAT transaction reverted: {tx_hash}")

        raw_response = {
            "success": True,
            "status": "confirmed",
            "txHash": tx_hash,
            "message": "GOAT testnet payment confirmed",
            "goatScanUrl": f"{explorer_base}/{tx_hash}",
            "from": from_wallet,
            "to": to_wallet,
            "amount_btc": amount_btc,
            "chainId": chain_id,
            "medication": medication,
            "dosage": dosage,
            "blockNumber": receipt.blockNumber,
        }
        return OrderAgentResult(
            success=True,
            status="confirmed",
            tx_hash=tx_hash,
            message="GOAT testnet payment confirmed",
            raw_response=raw_response,
        )
    except Exception as exc:
        return _failed_order_response(f"GOAT payment failed: {exc}")


async def request_refill_order(medication: str, dosage: str) -> OrderAgentResult:
    payload = build_order_payload(medication, dosage)
    if _mode() != "live":
        return _mock_order_response()

    if _goat_private_key() or _pharmacy_wallet_address():
        return _goat_transfer_response(medication, dosage)

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(f"{_payment_agent_url()}/pay", json=payload)
            response.raise_for_status()
            return _normalize_live_response(response.json())
    except Exception as exc:
        return _failed_order_response(f"Payment agent request failed: {exc}")
