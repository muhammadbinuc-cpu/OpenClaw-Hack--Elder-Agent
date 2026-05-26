# MedBot Journal — Cursor Build Plan

**Scope:** Telegram bot that logs medication events + lifestyle context from free-form voice messages, then produces a doctor-visit summary on demand. **Journal only — no payments, no Price Hunter.**

**Stack:** Python 3.11+, `python-telegram-bot`, Google Gemini API, JSON file storage.

**Core rule baked into every prompt:** *Log and organize, don't interpret or recommend.* The bot stores the patient's own words + timestamps. It never diagnoses, scores adherence, flags interactions, or draws conclusions. The doctor does that.

---

## Project Layout

```
medbot/
├── .env                    # secrets, gitignored
├── .gitignore
├── requirements.txt
├── README.md
├── bot.py                  # entry point — Telegram handlers
├── llm.py                  # Gemini calls (extraction + summary)
├── storage.py              # JSON read/write
├── prompts.py              # the two LLM prompts as constants
├── data/
│   └── journal.json        # created on first write
└── demo_seed.py            # one-shot script to load fake "Sam Lee" data
```

---

## Dependencies (`requirements.txt`)

```
python-telegram-bot==21.6
google-generativeai==0.8.3
python-dotenv==1.0.1
```

---

## Environment (`.env`)

```
TELEGRAM_BOT_TOKEN=...     # from @BotFather
GEMINI_API_KEY=...         # from aistudio.google.com
```

---

## Data Model (`data/journal.json`)

One file, keyed by Telegram user_id (string). Each user has a list of entries. Append-only — never delete or edit past entries during demo.

```json
{
  "123456789": {
    "name": "Sam Lee",
    "entries": [
      {
        "id": "evt_001",
        "timestamp": "2026-05-26T08:14:23-04:00",
        "raw_text": "took my metformin with breakfast, feeling a bit nauseous",
        "type": "medication",
        "medication": "metformin",
        "dose": null,
        "taken": true,
        "food_context": "with breakfast",
        "symptoms": "nauseous",
        "notes": null
      },
      {
        "id": "evt_002",
        "timestamp": "2026-05-26T14:30:00-04:00",
        "raw_text": "headache this afternoon",
        "type": "symptom",
        "medication": null,
        "symptoms": "headache",
        "notes": null
      },
      {
        "id": "evt_003",
        "timestamp": "2026-05-26T15:00:00-04:00",
        "raw_text": "want to ask if dizziness in the morning is normal",
        "type": "question_for_doctor",
        "notes": "Is morning dizziness normal?"
      }
    ]
  }
}
```

**Entry types the extractor must produce:**
- `medication` — dose taken or skipped
- `symptom` — anything the patient feels (headache, nausea, dizzy, etc.)
- `question_for_doctor` — patient flags something to ask
- `note` — generic free-text fallback when nothing else fits

---

## Prompts (`prompts.py`)

### Extraction prompt — turns free-form text into one structured entry

```
You are a logging assistant for a personal medication journal. Your only job is to
extract facts from what the patient said. You do NOT interpret, diagnose, give
advice, or draw connections between events. You only record what the patient
literally reported.

Given the patient's message and the current timestamp, return ONE JSON object
matching this schema. Use null for any field the patient did not mention.

{
  "type": "medication" | "symptom" | "question_for_doctor" | "note",
  "medication": string | null,
  "dose": string | null,
  "taken": true | false | null,
  "food_context": string | null,
  "symptoms": string | null,
  "notes": string | null
}

Rules:
- "type" = "medication" only if the patient mentions taking, skipping, or refilling a drug.
- "type" = "symptom" if the message is primarily about how they feel (no medication mentioned).
- "type" = "question_for_doctor" if the patient says "ask the doctor", "want to ask", "question for my doctor", etc.
- "type" = "note" for anything else (mood, sleep, lifestyle context that doesn't fit above).
- If the patient says "skipped" or "didn't take", set "taken" to false and put their reason in "notes" using their own words.
- For "symptoms", quote the patient's wording as closely as possible. Do not paraphrase "nauseous" as "nausea-related symptom". Do not categorize.
- NEVER add a field that says why a symptom happened, even if obvious. The doctor decides cause.
- NEVER compute time deltas like "45 minutes after dose". Only record what was said.
- Return ONLY the JSON object. No prose, no markdown fence.

Patient message: {{MESSAGE}}
Current time: {{TIMESTAMP}}
```

### Summary prompt — turns N days of entries into a doctor-visit handout

```
You are formatting a medication journal summary for the patient to bring to
their doctor. You are NOT a clinician. You do NOT interpret, recommend, score
adherence, flag interactions, or suggest causes. You organize the patient's own
logged entries into a clean readable summary.

Given the entries below, produce a plain-text summary in exactly this format:

{{PATIENT_NAME}} — last {{N_DAYS}} days

Medications logged:
[For each unique medication, one line: name + dose, count of days taken out of
days in range, then a sub-list of any missed days with the patient's stated
reason in quotes. List doses chronologically. Include food_context when present.]

Symptoms / notes:
[Chronological list. One line per entry: date + time + patient's words in
quotes. Do NOT group, do NOT classify, do NOT link to medications.]

Questions {{PATIENT_NAME}} wants to ask:
[Each question_for_doctor entry as a quoted line. If none, write "(none logged)".]

Rules:
- Use the patient's exact wording for symptoms and reasons. Quote them.
- Do not add adherence percentages or scores.
- Do not write any sentence that draws a connection between two entries.
- Do not add a clinical-sounding intro or conclusion.
- Do not recommend anything.
- Output plain text only. No markdown headers, no emoji.

Entries (JSON array):
{{ENTRIES_JSON}}
```

---

## Telegram Command Surface (`bot.py`)

| Command / input | What it does |
|---|---|
| `/start` | Greet, register user, write `name` field. Reply with a 3-line how-to. |
| Any plain text message | Treat as a log entry. Call Gemini extraction → append to journal → reply with one-line confirmation ("Logged: metformin taken with breakfast"). |
| `/summary` | Default last 14 days. Call Gemini summary → reply with formatted text. |
| `/summary 7` | Same but for last N days. |
| `/note <text>` | Force a `note`-type entry with the text verbatim. Skips the extractor. Useful when extraction misbehaves on stage. |
| `/undo` | Pop the most recent entry from the user's list. (Hackathon insurance for bad voice transcription on stage.) |
| `/list` | Reply with the last 5 raw entries, one per line. Debug aid. |

**Confirmation reply format** (kept terse so Meta AI reads it cleanly through glasses):
- Medication taken: `Logged: {medication} taken{, with {food_context}}{. Noted: {symptoms}}`
- Medication skipped: `Logged: {medication} skipped ({notes})`
- Symptom: `Noted: {symptoms}`
- Question: `Added to doctor questions: {notes}`
- Note: `Noted.`

---

## File-by-File Build Order

**1. `storage.py`** (~10 min)
- `load_journal() -> dict` — reads JSON file, returns `{}` if missing.
- `save_journal(data: dict)` — atomic write (write temp + rename).
- `get_user(data, user_id, name=None) -> dict` — returns the user's record, creating it if missing.
- `append_entry(data, user_id, entry: dict)` — generates `evt_NNN` id, sets ISO-8601 timestamp with local tz, appends.
- `pop_last(data, user_id) -> dict | None` — for `/undo`.
- `entries_in_range(data, user_id, days: int) -> list` — filters by timestamp.

**2. `prompts.py`** (~5 min)
- Two string constants: `EXTRACTION_PROMPT`, `SUMMARY_PROMPT`. Use `.format()` or `.replace()` placeholders, not f-strings (keeps the `{}` in the JSON schema literal).

**3. `llm.py`** (~15 min)
- Configure Gemini client from `GEMINI_API_KEY`.
- Use model `gemini-2.0-flash` (fast, cheap, JSON-mode capable).
- `extract_entry(raw_text: str, timestamp: str) -> dict` — calls Gemini with response_mime_type="application/json", parses, validates required keys exist, returns the dict. On any error, return a fallback `{"type": "note", "notes": raw_text}` so the bot never crashes mid-demo.
- `summarize(entries: list, patient_name: str, n_days: int) -> str` — calls Gemini in normal text mode, returns the string.

**4. `bot.py`** (~25 min)
- Standard `python-telegram-bot` application setup.
- Handlers for `/start`, `/summary`, `/note`, `/undo`, `/list`, and a `MessageHandler(filters.TEXT & ~filters.COMMAND, ...)` for plain text.
- The plain-text handler is the main loop: get user_id → load journal → call `extract_entry` → `append_entry` → `save_journal` → build confirmation reply → send.
- Wrap every handler in try/except that logs the error and replies "Sorry, didn't catch that. Try again or use /note." Don't let stack traces reach the user during demo.

**5. `demo_seed.py`** (~10 min)
- Standalone script. Hard-codes the Telegram user_id of the demo account and writes a realistic 14-day history for "Sam Lee" (metformin + lisinopril, a few missed doses with reasons, a handful of symptoms, two questions for the doctor). Run this once before the demo so `/summary` returns something rich without needing 14 days of live logging.

**6. `README.md`** (~5 min)
- How to run: `pip install -r requirements.txt`, fill `.env`, `python demo_seed.py`, `python bot.py`.
- One line on what the bot does. One line on the design rule.

---

## Total Time Estimate

~70 minutes of focused build, plus ~15 minutes of testing the Telegram round-trip. Fits inside the original 4:30–5:15 PM polish slot with margin.

---

## Demo-Day Safety Notes

- **Seed data first.** Run `demo_seed.py` before going on stage. Don't rely on live logging to build up history.
- **Test `/summary` last.** If extraction is flaky under stage conditions, you can still demo `/summary` against seeded data and it'll look great.
- **Use fake patient data only.** "Sam Lee," fictional meds. Never a real person's prescription history.
- **`/undo` exists for a reason.** If Meta AI mis-transcribes "metformin" as "met four men," log it, hit `/undo`, retry. Don't fight it on stage.
- **The bot must not crash.** Every Gemini call is wrapped in try/except with a fallback. A wrong log is recoverable; a crashed bot is not.

---

## What This Plan Deliberately Does NOT Do

- No adherence percentage or score.
- No drug interaction warnings.
- No "symptom likely caused by X" labels.
- No automatic alerts to a doctor.
- No trend graphs.
- No time-delta computations ("45 min after dose").
- No payment integration (separate teammate, separate file).
- No glasses-side code. The bot doesn't know or care that the message came from glasses. It's a Telegram bot. Meta AI handles voice in and TTS out.
