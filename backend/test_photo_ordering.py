import os
import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))

import order_agent
import photo_flow


class OrderIntentTests(unittest.TestCase):
    def test_detects_explicit_order_language(self) -> None:
        examples = [
            "order more of this",
            "please refill this",
            "buy this medicine",
            "request a refill for this",
        ]

        for message in examples:
            with self.subTest(message=message):
                self.assertTrue(photo_flow.has_order_intent(message))

    def test_ignores_ambiguous_more_language(self) -> None:
        examples = [
            "what is this",
            "tell me more about this",
            "more information please",
        ]

        for message in examples:
            with self.subTest(message=message):
                self.assertFalse(photo_flow.has_order_intent(message))


class OrderAgentTests(unittest.IsolatedAsyncioTestCase):
    async def test_default_mode_is_mock(self) -> None:
        previous = os.environ.pop("ORDER_AGENT_MODE", None)
        try:
            result = await order_agent.request_refill_order("Lisinopril", "10mg")
        finally:
            if previous is not None:
                os.environ["ORDER_AGENT_MODE"] = previous

        self.assertTrue(result.success)
        self.assertEqual(result.status, "mock_confirmed")
        self.assertIsNotNone(result.tx_hash)

    async def test_order_amount_defaults_to_one_cent_cad_scale(self) -> None:
        previous = os.environ.pop("ORDER_AMOUNT_BTC", None)
        try:
            payload = order_agent.build_order_payload("Lisinopril", "10mg")
        finally:
            if previous is not None:
                os.environ["ORDER_AMOUNT_BTC"] = previous

        self.assertEqual(payload["amount_btc"], "0.0000001")

    async def test_order_amount_can_be_overridden_by_env(self) -> None:
        previous = os.environ.get("ORDER_AMOUNT_BTC")
        os.environ["ORDER_AMOUNT_BTC"] = "0.0000002"
        try:
            payload = order_agent.build_order_payload("Lisinopril", "10mg")
        finally:
            if previous is None:
                os.environ.pop("ORDER_AMOUNT_BTC", None)
            else:
                os.environ["ORDER_AMOUNT_BTC"] = previous

        self.assertEqual(payload["amount_btc"], "0.0000002")

    async def test_live_tx_hash_prefix_is_normalized(self) -> None:
        self.assertEqual(order_agent._with_0x_prefix("abc123"), "0xabc123")
        self.assertEqual(order_agent._with_0x_prefix("0xabc123"), "0xabc123")

    async def test_live_mode_without_wallet_fails_clearly(self) -> None:
        previous = {
            "ORDER_AGENT_MODE": os.environ.get("ORDER_AGENT_MODE"),
            "GOAT_WALLET_PRIVATE_KEY": os.environ.get("GOAT_WALLET_PRIVATE_KEY"),
            "AEGIS_PRIVATE_KEY": os.environ.get("AEGIS_PRIVATE_KEY"),
            "PHARMACY_WALLET_ADDRESS": os.environ.get("PHARMACY_WALLET_ADDRESS"),
        }
        os.environ["ORDER_AGENT_MODE"] = "live"
        os.environ.pop("GOAT_WALLET_PRIVATE_KEY", None)
        os.environ.pop("AEGIS_PRIVATE_KEY", None)
        os.environ["PHARMACY_WALLET_ADDRESS"] = "0x56134c3702FBDB6A6F6A26E96687C7F92aAF9351"
        try:
            result = await order_agent.request_refill_order("Lisinopril", "10mg")
        finally:
            for key, value in previous.items():
                if value is None:
                    os.environ.pop(key, None)
                else:
                    os.environ[key] = value

        self.assertFalse(result.success)
        self.assertEqual(result.status, "payment_agent_failed")
        self.assertIn("GOAT_WALLET_PRIVATE_KEY", result.message)


PATCH_TARGETS = (
    "download_twilio_media",
    "analyze_medication_with_fallback",
    "request_refill_order",
    "log_photo_medication",
    "log_interaction",
    "log_alert",
    "log_order_request",
    "lookup_recent_photo",
    "record_photo",
    "set_pending_order",
)


def _snapshot(targets=PATCH_TARGETS) -> dict:
    return {name: getattr(photo_flow, name) for name in targets}


def _restore(originals: dict) -> None:
    for name, value in originals.items():
        setattr(photo_flow, name, value)


async def _download_bytes(payload: bytes = b"image"):
    async def _inner(_: str):
        return payload, "image/jpeg"
    return _inner


def _make_stub_env(
    *,
    analyze_result: dict,
    download_payload: bytes = b"image",
    cached_record: dict | None = None,
    order_result: order_agent.OrderAgentResult | None = None,
) -> tuple[dict, list[str], list[str]]:
    sent_messages: list[str] = []
    call_log: list[str] = []

    async def download_twilio_media(_: str):
        return download_payload, "image/jpeg"

    async def analyze_medication_with_fallback(_: bytes, __: str):
        call_log.append("analyze")
        return analyze_result

    async def request_refill_order(_: str, __: str):
        call_log.append("request_refill_order")
        if order_result is not None:
            return order_result
        return order_agent.OrderAgentResult(False, "unexpected", None, "unexpected", {})

    def send_message(_: str, body: str, __: str) -> None:
        sent_messages.append(body)

    photo_flow.download_twilio_media = download_twilio_media
    photo_flow.analyze_medication_with_fallback = analyze_medication_with_fallback
    photo_flow.request_refill_order = request_refill_order
    photo_flow.log_photo_medication = lambda _: 123
    photo_flow.log_interaction = lambda *_: None
    photo_flow.log_alert = lambda *_: None
    photo_flow.log_order_request = lambda **_: 456
    photo_flow.lookup_recent_photo = lambda *_args, **_kwargs: cached_record
    photo_flow.record_photo = lambda *_args, **_kwargs: None
    photo_flow.set_pending_order = lambda *_args, **_kwargs: call_log.append("set_pending_order")

    return {"send_message": send_message}, call_log, sent_messages


class PhotoFlowTests(unittest.IsolatedAsyncioTestCase):
    async def test_unknown_photo_does_not_request_refill(self) -> None:
        originals = _snapshot()
        try:
            env, call_log, sent_messages = _make_stub_env(
                analyze_result={
                    "medication": "Unknown",
                    "dosage": "Unknown",
                    "quantity": 0,
                    "refill_needed": False,
                    "confidence": "low",
                },
            )
            await photo_flow.process_photo_message(
                "https://example.test/media",
                "order more of this",
                "+15551234567",
                "https://example.test",
                env["send_message"],
            )
        finally:
            _restore(originals)

        self.assertNotIn("request_refill_order", call_log)
        self.assertEqual(len(sent_messages), 1)
        self.assertIn("could not identify", sent_messages[0])

    async def test_unknown_photo_without_order_intent_uses_review_copy(self) -> None:
        originals = _snapshot()
        try:
            env, call_log, sent_messages = _make_stub_env(
                analyze_result={
                    "medication": "Unknown",
                    "dosage": "Unknown",
                    "quantity": 0,
                    "refill_needed": False,
                    "confidence": "low",
                },
            )
            await photo_flow.process_photo_message(
                "https://example.test/media",
                "",
                "+15551234567",
                "https://example.test",
                env["send_message"],
            )
        finally:
            _restore(originals)

        self.assertNotIn("request_refill_order", call_log)
        self.assertNotIn("set_pending_order", call_log)
        self.assertEqual(len(sent_messages), 1)
        self.assertIn("could not identify", sent_messages[0])
        self.assertNotIn("Unknown Unknown", sent_messages[0])

    async def test_fallback_result_never_orders_even_on_explicit_intent(self) -> None:
        originals = _snapshot()
        try:
            env, call_log, sent_messages = _make_stub_env(
                analyze_result=photo_flow.FALLBACK_MEDICATION_RESULT.copy(),
            )
            await photo_flow.process_photo_message(
                "https://example.test/media",
                "order more of this",
                "+15551234567",
                "https://example.test",
                env["send_message"],
            )
        finally:
            _restore(originals)

        self.assertNotIn("request_refill_order", call_log)
        self.assertNotIn("set_pending_order", call_log)
        self.assertEqual(len(sent_messages), 1)
        self.assertIn("could not read the photo", sent_messages[0].lower())
        self.assertNotIn("demo fallback", sent_messages[0].lower())

    async def test_known_photo_no_intent_sets_pending_order(self) -> None:
        originals = _snapshot()
        previous_auto_refill = os.environ.pop("AEGIS_AUTO_REFILL", None)
        try:
            env, call_log, sent_messages = _make_stub_env(
                analyze_result={
                    "medication": "Lisinopril",
                    "dosage": "10mg",
                    "quantity": 3,
                    "refill_needed": True,
                    "confidence": "high",
                },
            )
            await photo_flow.process_photo_message(
                "https://example.test/media",
                "",
                "+15551234567",
                "https://example.test",
                env["send_message"],
            )
        finally:
            if previous_auto_refill is not None:
                os.environ["AEGIS_AUTO_REFILL"] = previous_auto_refill
            _restore(originals)

        self.assertIn("set_pending_order", call_log)
        self.assertNotIn("request_refill_order", call_log)
        self.assertEqual(len(sent_messages), 1)
        self.assertIn("Reply 'yes'", sent_messages[0])

    async def test_auto_refill_places_order_without_pending_confirmation(self) -> None:
        originals = _snapshot()
        previous_auto_refill = os.environ.get("AEGIS_AUTO_REFILL")
        os.environ["AEGIS_AUTO_REFILL"] = "true"
        try:
            env, call_log, sent_messages = _make_stub_env(
                analyze_result={
                    "medication": "Lisinopril",
                    "dosage": "10mg",
                    "quantity": 3,
                    "refill_needed": True,
                    "confidence": "high",
                },
            )
            await photo_flow.process_photo_message(
                "https://example.test/media",
                "",
                "+15551234567",
                "https://example.test",
                env["send_message"],
            )
        finally:
            if previous_auto_refill is None:
                os.environ.pop("AEGIS_AUTO_REFILL", None)
            else:
                os.environ["AEGIS_AUTO_REFILL"] = previous_auto_refill
            _restore(originals)

        self.assertNotIn("set_pending_order", call_log)
        self.assertIn("request_refill_order", call_log)
        self.assertEqual(len(sent_messages), 2)
        self.assertIn("placing a refill", sent_messages[0])

    async def test_successful_refill_reply_includes_order_receipt(self) -> None:
        originals = _snapshot()
        previous_auto_refill = os.environ.get("AEGIS_AUTO_REFILL")
        os.environ["AEGIS_AUTO_REFILL"] = "true"
        try:
            env, call_log, sent_messages = _make_stub_env(
                analyze_result={
                    "medication": "Lisinopril",
                    "dosage": "10mg",
                    "quantity": 3,
                    "refill_needed": True,
                    "confidence": "high",
                },
                order_result=order_agent.OrderAgentResult(
                    True,
                    "confirmed",
                    "0x1234567890abcdef1234567890abcdef12345678",
                    "GOAT testnet payment confirmed",
                    {
                        "success": True,
                        "status": "confirmed",
                        "amount_btc": "0.0000001",
                        "txHash": "0x1234567890abcdef1234567890abcdef12345678",
                        "goatScanUrl": "https://explorer.testnet3.goat.network/tx/0x1234567890abcdef1234567890abcdef12345678",
                    },
                ),
            )
            await photo_flow.process_photo_message(
                "https://example.test/media",
                "",
                "+15551234567",
                "https://example.test",
                env["send_message"],
            )
        finally:
            if previous_auto_refill is None:
                os.environ.pop("AEGIS_AUTO_REFILL", None)
            else:
                os.environ["AEGIS_AUTO_REFILL"] = previous_auto_refill
            _restore(originals)

        self.assertIn("request_refill_order", call_log)
        self.assertEqual(len(sent_messages), 2)
        self.assertIn("Receipt #456", sent_messages[1])
        self.assertIn("Medicine: Lisinopril 10mg", sent_messages[1])
        self.assertIn("Amount: 0.0000001 BTC", sent_messages[1])
        self.assertIn("Proof: https://explorer.testnet3.goat.network/tx/", sent_messages[1])
        self.assertNotIn("mock", sent_messages[1].lower())
        self.assertNotIn("demo", sent_messages[1].lower())

    async def test_duplicate_photo_within_window_short_circuits(self) -> None:
        originals = _snapshot()
        try:
            env, call_log, sent_messages = _make_stub_env(
                analyze_result={
                    "medication": "Lisinopril",
                    "dosage": "10mg",
                    "quantity": 3,
                    "refill_needed": True,
                    "confidence": "high",
                },
                cached_record={"med_log_id": 99},
            )
            await photo_flow.process_photo_message(
                "https://example.test/media",
                "",
                "+15551234567",
                "https://example.test",
                env["send_message"],
            )
        finally:
            _restore(originals)

        self.assertNotIn("analyze", call_log)
        self.assertNotIn("set_pending_order", call_log)
        self.assertNotIn("request_refill_order", call_log)
        self.assertEqual(len(sent_messages), 1)
        self.assertIn("already saw", sent_messages[0].lower())


if __name__ == "__main__":
    unittest.main()
