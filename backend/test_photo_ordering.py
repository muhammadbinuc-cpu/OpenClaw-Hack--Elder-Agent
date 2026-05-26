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


class PhotoFlowTests(unittest.IsolatedAsyncioTestCase):
    async def test_unknown_photo_does_not_request_refill(self) -> None:
        calls: list[str] = []
        sent_messages: list[str] = []
        originals = {
            "download_twilio_media": photo_flow.download_twilio_media,
            "analyze_medication_with_fallback": photo_flow.analyze_medication_with_fallback,
            "request_refill_order": photo_flow.request_refill_order,
            "log_photo_medication": photo_flow.log_photo_medication,
            "log_interaction": photo_flow.log_interaction,
            "log_alert": photo_flow.log_alert,
            "log_order_request": photo_flow.log_order_request,
        }

        async def download_twilio_media(_: str) -> tuple[bytes, str]:
            return b"image", "image/jpeg"

        async def analyze_medication_with_fallback(_: bytes, __: str) -> dict[str, str]:
            return {
                "name": "Unknown",
                "dosage": "Unknown",
                "purpose": "Unable to identify",
                "confidence": "low",
                "warnings": "Ask a caregiver to verify.",
            }

        async def request_refill_order(_: str, __: str) -> order_agent.OrderAgentResult:
            calls.append("request_refill_order")
            return order_agent.OrderAgentResult(False, "unexpected", None, "unexpected", {})

        def send_message(_: str, body: str, __: str) -> None:
            sent_messages.append(body)

        try:
            photo_flow.download_twilio_media = download_twilio_media
            photo_flow.analyze_medication_with_fallback = analyze_medication_with_fallback
            photo_flow.request_refill_order = request_refill_order
            photo_flow.log_photo_medication = lambda _: 123
            photo_flow.log_interaction = lambda *_: None
            photo_flow.log_alert = lambda *_: None
            photo_flow.log_order_request = lambda **_: 456

            await photo_flow.process_photo_message(
                "https://example.test/media",
                "order more of this",
                "+15551234567",
                "https://example.test",
                send_message,
            )
        finally:
            photo_flow.download_twilio_media = originals["download_twilio_media"]
            photo_flow.analyze_medication_with_fallback = originals["analyze_medication_with_fallback"]
            photo_flow.request_refill_order = originals["request_refill_order"]
            photo_flow.log_photo_medication = originals["log_photo_medication"]
            photo_flow.log_interaction = originals["log_interaction"]
            photo_flow.log_alert = originals["log_alert"]
            photo_flow.log_order_request = originals["log_order_request"]

        self.assertEqual(calls, [])
        self.assertEqual(len(sent_messages), 1)
        self.assertIn("could not identify", sent_messages[0])


if __name__ == "__main__":
    unittest.main()
