import importlib
import os
import sys
import tempfile
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))


def _make_async(result):
    async def _inner(*_args, **_kwargs):
        return result
    return _inner


class WebhookTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.TemporaryDirectory()
        self._previous_env = {
            "DATABASE_URL": os.environ.get("DATABASE_URL"),
            "ORDER_AGENT_MODE": os.environ.get("ORDER_AGENT_MODE"),
            "TWILIO_ACCOUNT_SID": os.environ.get("TWILIO_ACCOUNT_SID"),
            "TWILIO_AUTH_TOKEN": os.environ.get("TWILIO_AUTH_TOKEN"),
            "TWILIO_WHATSAPP_NUMBER": os.environ.get("TWILIO_WHATSAPP_NUMBER"),
            "ANTHROPIC_API_KEY": os.environ.get("ANTHROPIC_API_KEY"),
            "PUBLIC_BASE_URL": os.environ.get("PUBLIC_BASE_URL"),
            "AEGIS_AUTO_REFILL": os.environ.get("AEGIS_AUTO_REFILL"),
            "AEGIS_SYNC_PHOTO_REPLY": os.environ.get("AEGIS_SYNC_PHOTO_REPLY"),
            "AEGIS_SEND_VOICE_NOTE": os.environ.get("AEGIS_SEND_VOICE_NOTE"),
            "ORDER_AMOUNT_BTC": os.environ.get("ORDER_AMOUNT_BTC"),
        }
        db_path = Path(self._tmpdir.name) / "aegis.db"
        os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
        os.environ["ORDER_AGENT_MODE"] = "mock"
        os.environ.pop("TWILIO_ACCOUNT_SID", None)
        os.environ.pop("TWILIO_AUTH_TOKEN", None)
        os.environ.pop("TWILIO_WHATSAPP_NUMBER", None)
        os.environ.pop("ANTHROPIC_API_KEY", None)
        os.environ["AEGIS_AUTO_REFILL"] = "false"
        os.environ["AEGIS_SYNC_PHOTO_REPLY"] = "false"
        os.environ["AEGIS_SEND_VOICE_NOTE"] = "true"
        os.environ.pop("ORDER_AMOUNT_BTC", None)
        os.environ["PUBLIC_BASE_URL"] = "http://test.local"

        for module in ("db", "photo_flow", "order_agent", "agent", "main"):
            if module in sys.modules:
                del sys.modules[module]

        self.main = importlib.import_module("main")
        self.photo_flow = importlib.import_module("photo_flow")
        self.db = importlib.import_module("db")
        self.main.TWILIO_ACCOUNT_SID = ""
        self.main.TWILIO_AUTH_TOKEN = ""
        self.main.TWILIO_WHATSAPP_NUMBER = ""
        os.environ.pop("TWILIO_ACCOUNT_SID", None)
        os.environ.pop("TWILIO_AUTH_TOKEN", None)
        os.environ.pop("TWILIO_WHATSAPP_NUMBER", None)
        os.environ.pop("ANTHROPIC_API_KEY", None)
        from fastapi.testclient import TestClient

        self._client_cm = TestClient(self.main.app)
        self._client_cm.__enter__()
        self.client = self._client_cm

    def tearDown(self) -> None:
        self._client_cm.__exit__(None, None, None)
        for key, value in self._previous_env.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
        self._tmpdir.cleanup()

    def _patch_photo_io(self, *, result: dict) -> None:
        self.photo_flow.download_twilio_media = _make_async((b"fake-bytes-default", "image/jpeg"))
        self.photo_flow.analyze_medication_with_fallback = _make_async(result)

    def _patch_photo_io_with_bytes(self, *, payloads: list[tuple[bytes, dict]]) -> None:
        url_to_bytes: dict[str, bytes] = {}
        bytes_to_result: dict[bytes, dict] = {b: r for b, r in payloads}
        remaining = list(payloads)

        async def fake_download(url: str):
            if url not in url_to_bytes:
                if remaining:
                    url_to_bytes[url] = remaining.pop(0)[0]
                else:
                    url_to_bytes[url] = b"fake-bytes-default"
            return url_to_bytes[url], "image/jpeg"

        async def fake_analyze(image_bytes: bytes, mime_type: str):
            return bytes_to_result.get(image_bytes, payloads[-1][1])

        self.photo_flow.download_twilio_media = fake_download
        self.photo_flow.analyze_medication_with_fallback = fake_analyze

    def _count(self, table: str) -> int:
        with self.db.connect() as conn:
            return conn.execute(f"SELECT COUNT(*) AS c FROM {table}").fetchone()["c"]

    def test_text_message_logs_interaction(self) -> None:
        response = self.client.post(
            "/webhook/whatsapp",
            data={"From": "whatsapp:+15551112222", "Body": "hello", "NumMedia": "0"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("<Response>", response.text)
        self.assertEqual(self._count("interactions"), 1)

    def test_photo_with_caption_returns_immediate_twiml_and_offers_refill(self) -> None:
        self._patch_photo_io(result={
            "medication": "Lisinopril",
            "dosage": "10mg",
            "quantity": 3,
            "refill_needed": True,
            "confidence": "high",
        })

        response = self.client.post(
            "/webhook/whatsapp",
            data={
                "From": "whatsapp:+15551112222",
                "Body": "what is this",
                "NumMedia": "1",
                "MediaUrl0": "https://example.com/p.jpg",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("checking that medicine now", response.text)
        self.assertEqual(self._count("med_logs"), 1)
        self.assertEqual(self._count("pending_orders"), 1)

    def test_sync_photo_reply_returns_final_result_in_twiml(self) -> None:
        os.environ["AEGIS_SYNC_PHOTO_REPLY"] = "true"
        voice_notes: list[tuple[str, str, str]] = []
        self.main.send_whatsapp_voice_note = lambda to_number, text, base_url: voice_notes.append(
            (to_number, text, base_url)
        )
        self._patch_photo_io(result={
            "medication": "Lisinopril",
            "dosage": "10mg",
            "quantity": 3,
            "refill_needed": True,
            "confidence": "high",
        })

        response = self.client.post(
            "/webhook/whatsapp",
            data={
                "From": "whatsapp:+15551112222",
                "Body": "what is this",
                "NumMedia": "1",
                "MediaUrl0": "https://example.com/p.jpg",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("I found Lisinopril 10mg", response.text)
        self.assertNotIn("checking that medicine now", response.text)
        self.assertEqual(self._count("med_logs"), 1)
        self.assertEqual(self._count("pending_orders"), 1)
        self.assertEqual(len(voice_notes), 1)
        self.assertIn("I found Lisinopril 10mg", voice_notes[0][1])

    def test_yes_after_offer_places_mock_order(self) -> None:
        self._patch_photo_io(result={
            "medication": "Lisinopril",
            "dosage": "10mg",
            "quantity": 3,
            "refill_needed": True,
            "confidence": "high",
        })
        self.client.post(
            "/webhook/whatsapp",
            data={
                "From": "whatsapp:+15551112222",
                "Body": "",
                "NumMedia": "1",
                "MediaUrl0": "https://example.com/p.jpg",
            },
        )
        self.assertEqual(self._count("pending_orders"), 1)

        response = self.client.post(
            "/webhook/whatsapp",
            data={"From": "whatsapp:+15551112222", "Body": "yes", "NumMedia": "0"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("Ordering a refill", response.text)
        self.assertEqual(self._count("pending_orders"), 0)
        self.assertEqual(self._count("order_requests"), 1)
        orders = self.client.get("/api/order-requests").json()
        self.assertEqual(orders[0]["status"], "confirmed")
        self.assertNotIn("mock", str(orders[0]).lower())
        self.assertNotIn("demo", str(orders[0]).lower())
        stats = self.client.get("/api/stats").json()
        self.assertGreaterEqual(stats["confirmed_orders"], 1)

    def test_explicit_order_caption_skips_pending_and_orders_directly(self) -> None:
        self._patch_photo_io(result={
            "medication": "Lisinopril",
            "dosage": "10mg",
            "quantity": 3,
            "refill_needed": True,
            "confidence": "high",
        })
        response = self.client.post(
            "/webhook/whatsapp",
            data={
                "From": "whatsapp:+15551112222",
                "Body": "order more of this",
                "NumMedia": "1",
                "MediaUrl0": "https://example.com/p.jpg",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self._count("pending_orders"), 0)
        self.assertEqual(self._count("order_requests"), 1)

    def test_unknown_medication_does_not_offer_or_order(self) -> None:
        self._patch_photo_io(result={
            "medication": "Unknown",
            "dosage": "Unknown",
            "quantity": 0,
            "refill_needed": False,
            "confidence": "low",
        })
        self.client.post(
            "/webhook/whatsapp",
            data={
                "From": "whatsapp:+15551112222",
                "Body": "",
                "NumMedia": "1",
                "MediaUrl0": "https://example.com/p.jpg",
            },
        )
        self.assertEqual(self._count("pending_orders"), 0)

        self.client.post(
            "/webhook/whatsapp",
            data={"From": "whatsapp:+15551112222", "Body": "yes", "NumMedia": "0"},
        )
        self.assertEqual(self._count("order_requests"), 0)

    def test_fallback_photo_with_order_intent_does_not_order(self) -> None:
        self._patch_photo_io(result=self.photo_flow.FALLBACK_MEDICATION_RESULT.copy())
        self.client.post(
            "/webhook/whatsapp",
            data={
                "From": "whatsapp:+15551112222",
                "Body": "order more of this",
                "NumMedia": "1",
                "MediaUrl0": "https://example.com/p.jpg",
            },
        )
        self.assertEqual(self._count("order_requests"), 0)
        self.assertEqual(self._count("pending_orders"), 0)

    def test_duplicate_photo_within_window_dedupes(self) -> None:
        self._patch_photo_io(result={
            "medication": "Lisinopril",
            "dosage": "10mg",
            "quantity": 3,
            "refill_needed": True,
            "confidence": "high",
        })
        for _ in range(2):
            self.client.post(
                "/webhook/whatsapp",
                data={
                    "From": "whatsapp:+15551112222",
                    "Body": "",
                    "NumMedia": "1",
                    "MediaUrl0": "https://example.com/p.jpg",
                },
            )
        self.assertEqual(self._count("med_logs"), 1)
        self.assertEqual(self._count("pending_orders"), 1)

    def test_multi_media_schedules_one_task_per_url(self) -> None:
        payloads = [
            (b"image-one", {"medication": "Lisinopril", "dosage": "10mg", "quantity": 3, "refill_needed": True, "confidence": "high"}),
            (b"image-two", {"medication": "Metformin", "dosage": "500mg", "quantity": 5, "refill_needed": True, "confidence": "high"}),
        ]
        self._patch_photo_io_with_bytes(payloads=payloads)

        response = self.client.post(
            "/webhook/whatsapp",
            data={
                "From": "whatsapp:+15551112222",
                "Body": "",
                "NumMedia": "2",
                "MediaUrl0": "https://example.com/a.jpg",
                "MediaUrl1": "https://example.com/b.jpg",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self._count("med_logs"), 2)


if __name__ == "__main__":
    unittest.main()
