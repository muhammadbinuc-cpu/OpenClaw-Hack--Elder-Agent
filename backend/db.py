import json
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterator


def _database_path() -> Path:
    database_url = os.getenv("DATABASE_URL", "sqlite:///./data/aegis.db")
    if database_url.startswith("sqlite:///"):
        raw_path = database_url.removeprefix("sqlite:///")
    else:
        raw_path = database_url
    path = Path(raw_path)
    if not path.is_absolute():
        path = Path(__file__).resolve().parent / path
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(_database_path())
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS med_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                med_name TEXT NOT NULL,
                dosage TEXT NOT NULL,
                purpose TEXT NOT NULL,
                confidence TEXT NOT NULL,
                source TEXT NOT NULL CHECK(source IN ('photo', 'voice'))
            );

            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                med_log_id INTEGER,
                amount REAL NOT NULL,
                tx_hash TEXT NOT NULL,
                status TEXT NOT NULL,
                pharmacy TEXT NOT NULL,
                FOREIGN KEY(med_log_id) REFERENCES med_logs(id)
            );

            CREATE TABLE IF NOT EXISTS order_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                med_log_id INTEGER,
                medication TEXT NOT NULL,
                dosage TEXT NOT NULL,
                status TEXT NOT NULL,
                reason TEXT NOT NULL,
                payment_agent_status TEXT NOT NULL,
                tx_hash TEXT,
                agent_response TEXT NOT NULL,
                FOREIGN KEY(med_log_id) REFERENCES med_logs(id)
            );

            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                alert_type TEXT NOT NULL,
                message TEXT NOT NULL,
                resolved INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                patient_message TEXT NOT NULL,
                agent_response TEXT NOT NULL,
                action_taken TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS pending_orders (
                from_number TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                med_log_id INTEGER NOT NULL,
                medication TEXT NOT NULL,
                dosage TEXT NOT NULL,
                FOREIGN KEY(med_log_id) REFERENCES med_logs(id)
            );

            CREATE TABLE IF NOT EXISTS photo_cache (
                from_number TEXT NOT NULL,
                image_sha256 TEXT NOT NULL,
                med_log_id INTEGER NOT NULL,
                timestamp TEXT NOT NULL,
                PRIMARY KEY(from_number, image_sha256),
                FOREIGN KEY(med_log_id) REFERENCES med_logs(id)
            );
            """
        )


def log_interaction(patient_message: str, agent_response: str, action_taken: str) -> None:
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO interactions (timestamp, patient_message, agent_response, action_taken)
            VALUES (?, ?, ?, ?)
            """,
            (utc_now(), patient_message, agent_response, action_taken),
        )


def log_photo_medication(result: dict[str, Any]) -> int:
    with connect() as conn:
        cursor = conn.execute(
            """
            INSERT INTO med_logs (timestamp, med_name, dosage, purpose, confidence, source)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                utc_now(),
                str(result.get("name") or "Unknown"),
                str(result.get("dosage") or "Unknown"),
                str(result.get("purpose") or "Ask a caregiver to verify."),
                str(result.get("confidence") or "unknown"),
                "photo",
            ),
        )
        return int(cursor.lastrowid)


def log_order_request(
    med_log_id: int,
    medication: str,
    dosage: str,
    reason: str,
    payment_agent_status: str,
    tx_hash: str | None,
    agent_response: dict[str, Any],
) -> int:
    with connect() as conn:
        cursor = conn.execute(
            """
            INSERT INTO order_requests (
                timestamp,
                med_log_id,
                medication,
                dosage,
                status,
                reason,
                payment_agent_status,
                tx_hash,
                agent_response
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                utc_now(),
                med_log_id,
                medication,
                dosage,
                payment_agent_status,
                reason,
                payment_agent_status,
                tx_hash,
                json.dumps(agent_response, sort_keys=True),
            ),
        )
        return int(cursor.lastrowid)


def log_alert(alert_type: str, message: str) -> None:
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO alerts (timestamp, alert_type, message, resolved)
            VALUES (?, ?, ?, 0)
            """,
            (utc_now(), alert_type, message),
        )


def set_pending_order(from_number: str, med_log_id: int, medication: str, dosage: str) -> None:
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO pending_orders (from_number, timestamp, med_log_id, medication, dosage)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(from_number) DO UPDATE SET
                timestamp=excluded.timestamp,
                med_log_id=excluded.med_log_id,
                medication=excluded.medication,
                dosage=excluded.dosage
            """,
            (from_number, utc_now(), med_log_id, medication, dosage),
        )


def pop_pending_order(from_number: str, ttl_minutes: int = 15) -> dict[str, Any] | None:
    with connect() as conn:
        row = conn.execute(
            "SELECT * FROM pending_orders WHERE from_number = ?",
            (from_number,),
        ).fetchone()
        if row is None:
            return None
        conn.execute("DELETE FROM pending_orders WHERE from_number = ?", (from_number,))
        try:
            created = datetime.fromisoformat(row["timestamp"])
        except ValueError:
            return None
        if datetime.now(timezone.utc) - created > timedelta(minutes=ttl_minutes):
            return None
        return row_to_dict(row)


def clear_pending_order(from_number: str) -> None:
    with connect() as conn:
        conn.execute("DELETE FROM pending_orders WHERE from_number = ?", (from_number,))


def lookup_recent_photo(
    from_number: str, image_sha256: str, ttl_minutes: int = 5
) -> dict[str, Any] | None:
    with connect() as conn:
        row = conn.execute(
            "SELECT * FROM photo_cache WHERE from_number = ? AND image_sha256 = ?",
            (from_number, image_sha256),
        ).fetchone()
        if row is None:
            return None
        try:
            recorded = datetime.fromisoformat(row["timestamp"])
        except ValueError:
            return None
        if datetime.now(timezone.utc) - recorded > timedelta(minutes=ttl_minutes):
            return None
        return row_to_dict(row)


def record_photo(from_number: str, image_sha256: str, med_log_id: int) -> None:
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO photo_cache (from_number, image_sha256, med_log_id, timestamp)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(from_number, image_sha256) DO UPDATE SET
                med_log_id=excluded.med_log_id,
                timestamp=excluded.timestamp
            """,
            (from_number, image_sha256, med_log_id, utc_now()),
        )


def row_to_dict(row: sqlite3.Row) -> dict:
    return {key: row[key] for key in row.keys()}
