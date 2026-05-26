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
                    "name": "Unknown",
                    "dosage": "Unknown",
                    "purpose": "Unable to identify",
                    "confidence": "low",
                    "warnings": "Ask a caregiver to verify.",
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

    async def test_known_photo_no_intent_sets_pending_order(self) -> None:
        originals = _snapshot()
        try:
            env, call_log, sent_messages = _make_stub_env(
                analyze_result={
                    "name": "Lisinopril",
                    "dosage": "10mg",
                    "purpose": "Blood pressure",
                    "confidence": "high",
                    "warnings": "Demo",
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

        self.assertIn("set_pending_order", call_log)
        self.assertNotIn("request_refill_order", call_log)
        self.assertEqual(len(sent_messages), 1)
        self.assertIn("Reply 'yes'", sent_messages[0])

    async def test_duplicate_photo_within_window_short_circuits(self) -> None:
        originals = _snapshot()
        try:
            env, call_log, sent_messages = _make_stub_env(
                analyze_result={
                    "name": "Lisinopril",
                    "dosage": "10mg",
                    "purpose": "Blood pressure",
                    "confidence": "high",
                    "warnings": "Demo",
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
