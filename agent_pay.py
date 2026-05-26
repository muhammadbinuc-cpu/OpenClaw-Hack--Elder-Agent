"""
agent_pay.py — Agent-to-agent payment on GOAT mainnet with identity verification.

LIVE VERSION: executes real on-chain transfers. Identity check is enforced
against a hardcoded TRUSTED_AGENTS dict (mock of ERC-8004 registry, since
the registry isn't deployed on mainnet).

Usage:
    from agent_pay import pay, TRUSTED_AGENTS

    # Register pharmacy as a trusted agent (mocking ERC-8004 registry entry)
    TRUSTED_AGENTS["0xPharmacyWallet..."] = {
        "name": "TrustedPharmacy",
        "endpoint": "https://pharmacy.example/refill",
        "reputation": 98,
    }

    result = pay(
        from_wallet=AEGIS_WALLET,
        to_wallet=PHARMACY_WALLET,
        amount_btc="0.0001",
    )
    print(result.tx_hash, result.goat_scan_url)

Environment (.env):
    AEGIS_PRIVATE_KEY=0x...   # sender's MetaMask private key
"""

import os
from dataclasses import dataclass
from typing import Optional

from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

load_dotenv()

# ──────────────────────────────────────────────────────────────────────────────
# GOAT mainnet config (from MetaMask network settings)
# ──────────────────────────────────────────────────────────────────────────────

GOAT_RPC_URL = "https://rpc.goat.network"
GOAT_CHAIN_ID = 2345
GOAT_CURRENCY_SYMBOL = "BTC"
GOAT_EXPLORER_TX_URL = "https://explorer.goat.network/tx"

AEGIS_PRIVATE_KEY = os.getenv("AEGIS_PRIVATE_KEY")

# ──────────────────────────────────────────────────────────────────────────────
# Mock ERC-8004 registry — populate before calling pay()
# ──────────────────────────────────────────────────────────────────────────────

# Anti-scam check: only wallets in this dict can receive payment.
# In production this lookup happens on-chain against the ERC-8004 registry;
# here it's hardcoded because the registry isn't deployed on testnet3.
TRUSTED_AGENTS: dict = {}


# ──────────────────────────────────────────────────────────────────────────────
# Result types
# ──────────────────────────────────────────────────────────────────────────────


@dataclass
class AgentIdentity:
    address: str
    name: str
    endpoint: str
    reputation: int
    active: bool


@dataclass
class PaymentResult:
    success: bool
    tx_hash: Optional[str]
    from_wallet: str
    to_wallet: str
    amount: str
    currency: str
    recipient_identity: Optional[AgentIdentity]
    goat_scan_url: Optional[str]
    error: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "success": self.success,
            "txHash": self.tx_hash,
            "from": self.from_wallet,
            "to": self.to_wallet,
            "amount": self.amount,
            "currency": self.currency,
            "recipientIdentity": (
                {
                    "address": self.recipient_identity.address,
                    "name": self.recipient_identity.name,
                    "endpoint": self.recipient_identity.endpoint,
                    "reputation": self.recipient_identity.reputation,
                }
                if self.recipient_identity
                else None
            ),
            "goatScanUrl": self.goat_scan_url,
            "error": self.error,
        }


class IdentityVerificationError(Exception):
    """Raised when identity check fails. NEVER send funds in this case."""


# ──────────────────────────────────────────────────────────────────────────────
# Web3 setup
# ──────────────────────────────────────────────────────────────────────────────


def _get_web3() -> Web3:
    w3 = Web3(Web3.HTTPProvider(GOAT_RPC_URL))
    if not w3.is_connected():
        raise RuntimeError(f"Cannot connect to GOAT RPC at {GOAT_RPC_URL}")
    return w3


# ──────────────────────────────────────────────────────────────────────────────
# Identity verification (mock ERC-8004 lookup)
# ──────────────────────────────────────────────────────────────────────────────


def verify_agent_identity(wallet: str) -> AgentIdentity:
    """Look up wallet in TRUSTED_AGENTS. Raises if unknown."""
    wallet = Web3.to_checksum_address(wallet)
    if wallet not in TRUSTED_AGENTS:
        raise IdentityVerificationError(
            f"Wallet {wallet} is not a registered agent. "
            f"Refusing to send funds (anti-scam protection)."
        )
    info = TRUSTED_AGENTS[wallet]
    return AgentIdentity(
        address=wallet,
        name=info["name"],
        endpoint=info["endpoint"],
        reputation=info["reputation"],
        active=True,
    )


# ──────────────────────────────────────────────────────────────────────────────
# Native BTC transfer on GOAT mainnet
# ──────────────────────────────────────────────────────────────────────────────


def _execute_native_transfer(
    w3: Web3,
    from_wallet: str,
    to_wallet: str,
    amount_btc: str,
    sender_private_key: str,
) -> str:
    """Send native BTC on GOAT. Returns txHash hex string."""
    from_wallet = Web3.to_checksum_address(from_wallet)
    to_wallet = Web3.to_checksum_address(to_wallet)

    # GOAT EVM uses 18-decimal native token (standard EVM convention).
    amount_wei = w3.to_wei(amount_btc, "ether")

    nonce = w3.eth.get_transaction_count(from_wallet)
    gas_price = w3.eth.gas_price

    tx = {
        "from": from_wallet,
        "to": to_wallet,
        "value": amount_wei,
        "nonce": nonce,
        "gas": 21000,
        "gasPrice": gas_price,
        "chainId": GOAT_CHAIN_ID,
    }

    signed = Account.sign_transaction(tx, sender_private_key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    if receipt.status != 1:
        raise RuntimeError(f"Transaction reverted: {tx_hash.hex()}")

    return tx_hash.hex()


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────


def pay(
    from_wallet: str,
    to_wallet: str,
    amount_btc: str,
    sender_private_key: Optional[str] = None,
) -> PaymentResult:
    """
    Agent-to-agent payment on GOAT mainnet.

    Flow:
        1. Verify to_wallet is in TRUSTED_AGENTS (mock ERC-8004 check)
        2. Execute native BTC transfer
        3. Wait for confirmation
        4. Return proof with explorer link
    """
    private_key = sender_private_key or AEGIS_PRIVATE_KEY
    if not private_key:
        return PaymentResult(
            success=False, tx_hash=None,
            from_wallet=from_wallet, to_wallet=to_wallet,
            amount=amount_btc, currency=GOAT_CURRENCY_SYMBOL,
            recipient_identity=None, goat_scan_url=None,
            error="No private key. Set AEGIS_PRIVATE_KEY in .env",
        )

    print(f"\n[pay] {from_wallet} → {to_wallet}  ({amount_btc} {GOAT_CURRENCY_SYMBOL})")

    # 1. Identity check
    try:
        identity = verify_agent_identity(to_wallet)
        print(f"[pay] ✓ Recipient verified: {identity.name} (reputation {identity.reputation})")
    except IdentityVerificationError as e:
        print(f"[pay] ✗ Identity check FAILED: {e}")
        return PaymentResult(
            success=False, tx_hash=None,
            from_wallet=from_wallet, to_wallet=to_wallet,
            amount=amount_btc, currency=GOAT_CURRENCY_SYMBOL,
            recipient_identity=None, goat_scan_url=None,
            error=f"ERC-8004 verification failed: {e}",
        )

    # 2. Real on-chain transfer
    try:
        w3 = _get_web3()
        print(f"[pay] Connected to GOAT mainnet (chain {GOAT_CHAIN_ID})")
        tx_hash = _execute_native_transfer(
            w3, from_wallet, to_wallet, amount_btc, private_key
        )
        print(f"[pay] ✓ Transfer confirmed on-chain. txHash={tx_hash}")
    except Exception as e:
        print(f"[pay] ✗ Transfer failed: {e}")
        return PaymentResult(
            success=False, tx_hash=None,
            from_wallet=from_wallet, to_wallet=to_wallet,
            amount=amount_btc, currency=GOAT_CURRENCY_SYMBOL,
            recipient_identity=identity, goat_scan_url=None,
            error=str(e),
        )

    return PaymentResult(
        success=True,
        tx_hash=tx_hash,
        from_wallet=from_wallet,
        to_wallet=to_wallet,
        amount=amount_btc,
        currency=GOAT_CURRENCY_SYMBOL,
        recipient_identity=identity,
        goat_scan_url=f"{GOAT_EXPLORER_TX_URL}/{tx_hash}",
    )


# ──────────────────────────────────────────────────────────────────────────────
# Self-test — fill in wallets, set AEGIS_PRIVATE_KEY in .env, then run.
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json

    # ⚠️ FILL THESE IN ⚠️
    AEGIS_WALLET = "0xYOUR_AEGIS_SENDER_WALLET"
    PHARMACY_WALLET = "0xYOUR_PHARMACY_WALLET"

    # Register pharmacy as trusted (mock ERC-8004 entry)
    TRUSTED_AGENTS[Web3.to_checksum_address(PHARMACY_WALLET)] = {
        "name": "TrustedPharmacy",
        "endpoint": "https://pharmacy.example/refill",
        "reputation": 98,
    }

    print("=" * 60)
    print("Aegis pay() — GOAT mainnet live transfer")
    print("=" * 60)

    result = pay(
        from_wallet=AEGIS_WALLET,
        to_wallet=PHARMACY_WALLET,
        amount_btc="0.0001",
    )

    print("\nResult:")
    print(json.dumps(result.to_dict(), indent=2))

    if result.success:
        print(f"\n🔗 Verify on explorer:\n   {result.goat_scan_url}")
