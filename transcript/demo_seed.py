"""One-shot script to load demo journal data for Sam Lee.

Run from medbot/:  python demo_seed.py

Set DEMO_TELEGRAM_USER_ID in .env to your Telegram numeric user id
(message @userinfobot). Defaults to 123456789 for local testing only.
"""

import os

from dotenv import load_dotenv

from storage import load_journal, save_journal

load_dotenv()

DEMO_USER_ID = os.environ.get("DEMO_TELEGRAM_USER_ID", "123456789")
TZ = "-04:00"

SAM_LEE_ENTRIES = [
    {"id": "evt_001", "timestamp": f"2026-05-13T08:10:00{TZ}", "raw_text": "took metformin 500mg with breakfast", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with breakfast", "symptoms": None, "notes": None},
    {"id": "evt_002", "timestamp": f"2026-05-13T08:45:00{TZ}", "raw_text": "took lisinopril 10mg", "type": "medication", "medication": "lisinopril", "dose": "10mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_003", "timestamp": f"2026-05-13T19:30:00{TZ}", "raw_text": "took evening metformin with dinner", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with dinner", "symptoms": None, "notes": None},
    {"id": "evt_004", "timestamp": f"2026-05-14T08:05:00{TZ}", "raw_text": "took metformin with breakfast", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with breakfast", "symptoms": None, "notes": None},
    {"id": "evt_005", "timestamp": f"2026-05-14T08:40:00{TZ}", "raw_text": "took lisinopril", "type": "medication", "medication": "lisinopril", "dose": "10mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_006", "timestamp": f"2026-05-14T14:00:00{TZ}", "raw_text": "mild headache this afternoon", "type": "symptom", "medication": None, "dose": None, "taken": None, "food_context": None, "symptoms": "mild headache", "notes": None},
    {"id": "evt_007", "timestamp": f"2026-05-14T19:15:00{TZ}", "raw_text": "took evening metformin", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_008", "timestamp": f"2026-05-15T08:20:00{TZ}", "raw_text": "skipped morning metformin, stomach felt upset", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": False, "food_context": None, "symptoms": None, "notes": "stomach felt upset"},
    {"id": "evt_009", "timestamp": f"2026-05-15T08:50:00{TZ}", "raw_text": "took lisinopril", "type": "medication", "medication": "lisinopril", "dose": "10mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_010", "timestamp": f"2026-05-15T19:00:00{TZ}", "raw_text": "took metformin with dinner, still a bit nauseous", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with dinner", "symptoms": "a bit nauseous", "notes": None},
    {"id": "evt_011", "timestamp": f"2026-05-16T08:00:00{TZ}", "raw_text": "took metformin and lisinopril with breakfast", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with breakfast", "symptoms": None, "notes": None},
    {"id": "evt_012", "timestamp": f"2026-05-16T08:05:00{TZ}", "raw_text": "lisinopril 10mg with breakfast", "type": "medication", "medication": "lisinopril", "dose": "10mg", "taken": True, "food_context": "with breakfast", "symptoms": None, "notes": None},
    {"id": "evt_013", "timestamp": f"2026-05-16T19:20:00{TZ}", "raw_text": "evening metformin taken", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_014", "timestamp": f"2026-05-17T07:30:00{TZ}", "raw_text": "felt dizzy when I got out of bed", "type": "symptom", "medication": None, "dose": None, "taken": None, "food_context": None, "symptoms": "dizzy when I got out of bed", "notes": None},
    {"id": "evt_015", "timestamp": f"2026-05-17T08:15:00{TZ}", "raw_text": "took metformin with breakfast", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with breakfast", "symptoms": None, "notes": None},
    {"id": "evt_016", "timestamp": f"2026-05-17T08:50:00{TZ}", "raw_text": "took lisinopril", "type": "medication", "medication": "lisinopril", "dose": "10mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_017", "timestamp": f"2026-05-17T10:00:00{TZ}", "raw_text": "want to ask if dizziness in the morning is normal", "type": "question_for_doctor", "medication": None, "dose": None, "taken": None, "food_context": None, "symptoms": None, "notes": "Is morning dizziness normal?"},
    {"id": "evt_018", "timestamp": f"2026-05-18T08:00:00{TZ}", "raw_text": "took metformin with breakfast", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with breakfast", "symptoms": None, "notes": None},
    {"id": "evt_019", "timestamp": f"2026-05-18T08:40:00{TZ}", "raw_text": "took lisinopril", "type": "medication", "medication": "lisinopril", "dose": "10mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_020", "timestamp": f"2026-05-18T19:00:00{TZ}", "raw_text": "took evening metformin", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_021", "timestamp": f"2026-05-19T08:30:00{TZ}", "raw_text": "skipped lisinopril, ran out and pharmacy was closed", "type": "medication", "medication": "lisinopril", "dose": "10mg", "taken": False, "food_context": None, "symptoms": None, "notes": "ran out and pharmacy was closed"},
    {"id": "evt_022", "timestamp": f"2026-05-19T08:35:00{TZ}", "raw_text": "took metformin with breakfast", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with breakfast", "symptoms": None, "notes": None},
    {"id": "evt_023", "timestamp": f"2026-05-19T19:10:00{TZ}", "raw_text": "took metformin with dinner", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with dinner", "symptoms": None, "notes": None},
    {"id": "evt_024", "timestamp": f"2026-05-20T08:00:00{TZ}", "raw_text": "took metformin and lisinopril, picked up refill yesterday", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with breakfast", "symptoms": None, "notes": None},
    {"id": "evt_025", "timestamp": f"2026-05-20T08:05:00{TZ}", "raw_text": "lisinopril 10mg taken", "type": "medication", "medication": "lisinopril", "dose": "10mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_026", "timestamp": f"2026-05-20T19:00:00{TZ}", "raw_text": "evening metformin taken", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_027", "timestamp": f"2026-05-21T08:10:00{TZ}", "raw_text": "morning metformin and lisinopril with breakfast", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with breakfast", "symptoms": None, "notes": None},
    {"id": "evt_028", "timestamp": f"2026-05-21T08:15:00{TZ}", "raw_text": "lisinopril taken", "type": "medication", "medication": "lisinopril", "dose": "10mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_029", "timestamp": f"2026-05-21T13:00:00{TZ}", "raw_text": "tired and thirsty this afternoon", "type": "symptom", "medication": None, "dose": None, "taken": None, "food_context": None, "symptoms": "tired and thirsty", "notes": None},
    {"id": "evt_030", "timestamp": f"2026-05-21T19:00:00{TZ}", "raw_text": "took evening metformin", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_031", "timestamp": f"2026-05-22T08:00:00{TZ}", "raw_text": "took metformin with breakfast, feeling a bit nauseous", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with breakfast", "symptoms": "a bit nauseous", "notes": None},
    {"id": "evt_032", "timestamp": f"2026-05-22T08:45:00{TZ}", "raw_text": "took lisinopril", "type": "medication", "medication": "lisinopril", "dose": "10mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_033", "timestamp": f"2026-05-23T08:00:00{TZ}", "raw_text": "took morning meds with breakfast", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with breakfast", "symptoms": None, "notes": None},
    {"id": "evt_034", "timestamp": f"2026-05-23T08:05:00{TZ}", "raw_text": "lisinopril 10mg", "type": "medication", "medication": "lisinopril", "dose": "10mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_035", "timestamp": f"2026-05-23T19:00:00{TZ}", "raw_text": "skipped evening metformin, ate out late and forgot", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": False, "food_context": None, "symptoms": None, "notes": "ate out late and forgot"},
    {"id": "evt_036", "timestamp": f"2026-05-24T08:30:00{TZ}", "raw_text": "took metformin and lisinopril", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_037", "timestamp": f"2026-05-24T08:35:00{TZ}", "raw_text": "lisinopril taken", "type": "medication", "medication": "lisinopril", "dose": "10mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_038", "timestamp": f"2026-05-24T09:00:00{TZ}", "raw_text": "slept poorly last night", "type": "note", "medication": None, "dose": None, "taken": None, "food_context": None, "symptoms": None, "notes": "slept poorly last night"},
    {"id": "evt_039", "timestamp": f"2026-05-24T15:00:00{TZ}", "raw_text": "question for my doctor: should I take metformin if I skip a meal", "type": "question_for_doctor", "medication": None, "dose": None, "taken": None, "food_context": None, "symptoms": None, "notes": "Should I take metformin if I skip a meal?"},
    {"id": "evt_040", "timestamp": f"2026-05-25T08:00:00{TZ}", "raw_text": "took metformin with breakfast", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with breakfast", "symptoms": None, "notes": None},
    {"id": "evt_041", "timestamp": f"2026-05-25T08:40:00{TZ}", "raw_text": "took lisinopril", "type": "medication", "medication": "lisinopril", "dose": "10mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_042", "timestamp": f"2026-05-25T19:00:00{TZ}", "raw_text": "evening metformin with dinner", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with dinner", "symptoms": None, "notes": None},
    {"id": "evt_043", "timestamp": f"2026-05-26T08:14:23{TZ}", "raw_text": "took my metformin with breakfast, feeling a bit nauseous", "type": "medication", "medication": "metformin", "dose": "500mg", "taken": True, "food_context": "with breakfast", "symptoms": "a bit nauseous", "notes": None},
    {"id": "evt_044", "timestamp": f"2026-05-26T08:50:00{TZ}", "raw_text": "took lisinopril 10mg", "type": "medication", "medication": "lisinopril", "dose": "10mg", "taken": True, "food_context": None, "symptoms": None, "notes": None},
    {"id": "evt_045", "timestamp": f"2026-05-26T14:30:00{TZ}", "raw_text": "headache this afternoon", "type": "symptom", "medication": None, "dose": None, "taken": None, "food_context": None, "symptoms": "headache", "notes": None},
]


def main() -> None:
    data = load_journal()
    data[str(DEMO_USER_ID)] = {"name": "Sam Lee", "entries": SAM_LEE_ENTRIES}
    save_journal(data)
    print(f"Seeded {len(SAM_LEE_ENTRIES)} entries for Sam Lee (user_id={DEMO_USER_ID}).")


if __name__ == "__main__":
    main()