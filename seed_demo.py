from datetime import datetime, timedelta, timezone

from backend.db import connect, init_db


MEDS = [
    ("Lisinopril", "10mg", "Helps lower blood pressure.", "high", "photo"),
    ("Aricept", "5mg", "Supports memory symptoms in dementia.", "high", "voice"),
    ("Metformin", "500mg", "Helps manage blood sugar.", "medium", "photo"),
    ("Aspirin", "81mg", "Helps reduce clotting risk when prescribed.", "medium", "voice"),
    ("Omeprazole", "20mg", "Helps reduce stomach acid.", "fallback", "photo"),
]


def main() -> None:
    init_db()
    now = datetime.now(timezone.utc)
    with connect() as conn:
        conn.execute("DELETE FROM payments")
        conn.execute("DELETE FROM med_logs")
        conn.execute("DELETE FROM alerts")
        conn.execute("DELETE FROM interactions")

        for index, med in enumerate(MEDS):
            timestamp = (now - timedelta(hours=22 - index * 4)).isoformat()
            cursor = conn.execute(
                """
                INSERT INTO med_logs (timestamp, med_name, dosage, purpose, confidence, source)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (timestamp, *med),
            )
            med_log_id = cursor.lastrowid
            conn.execute(
                """
                INSERT INTO payments (timestamp, med_log_id, amount, tx_hash, status, pharmacy)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    timestamp,
                    med_log_id,
                    12.50 + index,
                    f"0x{index + 1:064x}",
                    "mock_pending",
                    "KW Pharmacy",
                ),
            )

        conn.execute(
            """
            INSERT INTO alerts (timestamp, alert_type, message, resolved)
            VALUES (?, ?, ?, 0)
            """,
            (
                now.isoformat(),
                "medication_review",
                "New medication detected: Omeprazole - verify with doctor.",
            ),
        )

    print("Seeded demo SQLite data.")


if __name__ == "__main__":
    main()
