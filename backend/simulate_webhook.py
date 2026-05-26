"""Local simulator for POST /webhook/whatsapp.

Lets you exercise the WhatsApp flow without Twilio or ngrok. The backend must
already be running on http://127.0.0.1:8000 (or set AEGIS_BACKEND_URL).
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

import httpx


STATE_PATH = Path(__file__).resolve().parent / ".simulate_state.json"
DEFAULT_FROM = "+15555550123"
DEFAULT_DEMO_PHOTO = "https://example.com/demo-pill.jpg"


def _backend() -> str:
    return os.getenv("AEGIS_BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")


def _load_state() -> dict[str, str]:
    if STATE_PATH.exists():
        try:
            return json.loads(STATE_PATH.read_text())
        except json.JSONDecodeError:
            return {}
    return {}


def _save_state(state: dict[str, str]) -> None:
    STATE_PATH.write_text(json.dumps(state))


def _resolve_from(arg_from: str | None) -> str:
    if arg_from:
        return arg_from
    state = _load_state()
    return state.get("from") or DEFAULT_FROM


def _post(form: dict[str, str]) -> httpx.Response:
    url = f"{_backend()}/webhook/whatsapp"
    return httpx.post(url, data=form, timeout=15.0)


def _remember_from(from_number: str) -> None:
    state = _load_state()
    state["from"] = from_number
    _save_state(state)


def cmd_text(args: argparse.Namespace) -> int:
    from_number = _resolve_from(args.from_number)
    _remember_from(from_number)
    response = _post({"From": f"whatsapp:{from_number}", "Body": args.body, "NumMedia": "0"})
    print(f"HTTP {response.status_code}")
    print(response.text)
    return 0 if response.is_success else 1


def cmd_photo(args: argparse.Namespace) -> int:
    from_number = _resolve_from(args.from_number)
    _remember_from(from_number)
    urls = [args.url] + list(args.extra or [])
    form: dict[str, str] = {
        "From": f"whatsapp:{from_number}",
        "Body": args.caption or "",
        "NumMedia": str(len(urls)),
    }
    for index, url in enumerate(urls[:10]):
        form[f"MediaUrl{index}"] = url
    response = _post(form)
    print(f"HTTP {response.status_code}")
    print(response.text)
    return 0 if response.is_success else 1


def cmd_confirm(args: argparse.Namespace) -> int:
    body = "yes" if args.answer == "yes" else "no"
    namespace = argparse.Namespace(from_number=args.from_number, body=body)
    return cmd_text(namespace)


def cmd_demo(args: argparse.Namespace) -> int:
    from_number = args.from_number or DEFAULT_FROM
    _remember_from(from_number)
    if not os.getenv("AEGIS_SIMULATE_VISION"):
        print(
            "note: AEGIS_SIMULATE_VISION is not set in your environment. The backend "
            "process needs that env to stub the vision call. Start the backend with "
            "AEGIS_SIMULATE_VISION=1 ./run_all.sh, then rerun this command."
        )

    print(f"--- demo from {from_number} ---")
    print("[1/3] sending text 'hi'")
    cmd_text(argparse.Namespace(from_number=from_number, body="hi"))
    time.sleep(0.2)

    print("[2/3] sending photo (no caption) -> expect offer to refill")
    cmd_photo(argparse.Namespace(from_number=from_number, url=DEFAULT_DEMO_PHOTO, caption="", extra=[]))
    time.sleep(1.0)

    print("[3/3] sending 'yes' -> expect mock order")
    cmd_text(argparse.Namespace(from_number=from_number, body="yes"))
    time.sleep(0.5)

    print("--- /api/order-requests ---")
    orders = httpx.get(f"{_backend()}/api/order-requests", timeout=10.0)
    print(orders.text)
    print("--- /api/stats ---")
    stats = httpx.get(f"{_backend()}/api/stats", timeout=10.0)
    print(stats.text)
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--from", dest="from_number", help="Patient phone, e.g. +15555550123")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_text = sub.add_parser("text", help="Send a text message")
    p_text.add_argument("body")
    p_text.set_defaults(func=cmd_text)

    p_photo = sub.add_parser("photo", help="Send a media message")
    p_photo.add_argument("url")
    p_photo.add_argument("caption", nargs="?", default="")
    p_photo.add_argument("--extra", action="append", default=[], help="Extra media URLs")
    p_photo.set_defaults(func=cmd_photo)

    p_confirm = sub.add_parser("confirm", help="Reply yes/no as the last-used number")
    p_confirm.add_argument("answer", choices=["yes", "no"])
    p_confirm.set_defaults(func=cmd_confirm)

    p_demo = sub.add_parser("demo", help="Run the full golden path end-to-end")
    p_demo.set_defaults(func=cmd_demo)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
