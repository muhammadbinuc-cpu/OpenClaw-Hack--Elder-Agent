"""JSON journal read/write and entry helpers."""

import json
import os
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

JOURNAL_PATH = Path(__file__).resolve().parent / "data" / "journal.json"


def load_journal() -> dict:
    """Read journal JSON; return empty dict if missing or invalid."""
    if not JOURNAL_PATH.exists():
        return {}
    try:
        with open(JOURNAL_PATH, encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}


def save_journal(data: dict) -> None:
    """Atomic write: temp file in same directory, then rename."""
    JOURNAL_PATH.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(
        dir=JOURNAL_PATH.parent, suffix=".tmp", text=True
    )
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")
        os.replace(tmp_path, JOURNAL_PATH)
    except Exception:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise


def get_user(data: dict, user_id: int | str, name: str | None = None) -> dict:
    """Return user record, creating {name, entries} if missing."""
    key = str(user_id)
    if key not in data:
        data[key] = {"name": name or "Patient", "entries": []}
    elif name is not None:
        data[key]["name"] = name
    return data[key]


def _local_tz():
    """Best-effort local timezone for timestamps."""
    local = datetime.now().astimezone().tzinfo
    if local is not None:
        key = getattr(local, "key", None)
        if key:
            try:
                return ZoneInfo(key)
            except Exception:
                pass
        return local
    return timezone.utc


def _next_event_id(entries: list) -> str:
    max_num = 0
    for entry in entries:
        eid = entry.get("id", "")
        if eid.startswith("evt_"):
            try:
                max_num = max(max_num, int(eid.split("_", 1)[1]))
            except ValueError:
                pass
    return f"evt_{max_num + 1:03d}"


def append_entry(data: dict, user_id: int | str, entry: dict) -> dict:
    """Append entry with generated id and ISO-8601 local timestamp."""
    user = get_user(data, user_id)
    now = datetime.now(_local_tz())
    full = {
        "id": _next_event_id(user["entries"]),
        "timestamp": now.isoformat(timespec="seconds"),
        **entry,
    }
    user["entries"].append(full)
    return full


def pop_last(data: dict, user_id: int | str) -> dict | None:
    """Remove and return the most recent entry, or None."""
    key = str(user_id)
    if key not in data or not data[key]["entries"]:
        return None
    return data[key]["entries"].pop()


def entries_in_range(data: dict, user_id: int | str, days: int) -> list:
    """Return entries whose timestamp falls within the last `days` days."""
    key = str(user_id)
    if key not in data:
        return []
    cutoff = datetime.now(_local_tz()) - timedelta(days=days)
    result = []
    for entry in data[key]["entries"]:
        ts = entry.get("timestamp")
        if not ts:
            continue
        try:
            dt = datetime.fromisoformat(ts)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=_local_tz())
        except ValueError:
            continue
        if dt >= cutoff:
            result.append(entry)
    return result