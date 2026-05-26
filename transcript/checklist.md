# MedBot Journal — Build & Verify Checklist

Use this checklist to confirm every file exists, every dependency is wired correctly, and every feature works end-to-end. Work top to bottom. Don't skip steps — later checks assume earlier ones passed.

---

## Phase 1: Files exist on disk

Run `ls medbot/` (or `dir medbot` on Windows) and confirm each file is present:

- [ ] `medbot/storage.py`
- [ ] `medbot/prompts.py`
- [ ] `medbot/llm.py`
- [ ] `medbot/bot.py`
- [ ] `medbot/demo_seed.py`
- [ ] `medbot/requirements.txt`
- [ ] `medbot/.gitignore`
- [ ] `medbot/README.md`
- [ ] `medbot/data/` directory exists (or will be created on first write)

If any file is missing, create it from the conversation history before continuing.

---

## Phase 2: File contents sanity check

### storage.py
- [ ] Imports: `json`, `os`, `tempfile`, `datetime`, `timedelta`, `timezone`, `Path`, `ZoneInfo`
- [ ] `JOURNAL_PATH` points to `data/journal.json` relative to file
- [ ] `load_journal()` returns `{}` on missing/corrupt file (no crash)
- [ ] `save_journal()` uses `tempfile.mkstemp` + `os.replace` (atomic write)
- [ ] `get_user()` creates `{"name": ..., "entries": []}` if user missing
- [ ] `append_entry()` generates `evt_NNN` id and ISO-8601 timestamp
- [ ] `pop_last()` returns `None` if user has no entries
- [ ] `entries_in_range()` filters by `datetime.now() - timedelta(days=N)`

### prompts.py
- [ ] `EXTRACTION_PROMPT` uses doubled braces (`{{` / `}}`) inside the JSON schema
- [ ] `EXTRACTION_PROMPT` has `{message}` and `{timestamp}` placeholders
- [ ] `SUMMARY_PROMPT` has `{patient_name}`, `{n_days}`, `{entries_json}` placeholders
- [ ] Both prompts include the "no interpretation / no recommendations" rules

### llm.py
- [ ] Imports `EXTRACTION_PROMPT`, `SUMMARY_PROMPT` from `prompts`
- [ ] `MODEL_NAME` is set (e.g. `"gemini-2.0-flash"`)
- [ ] `extract_entry()` passes `generation_config={"response_mime_type": "application/json"}`
- [ ] `extract_entry()` returns `{"type": "note", "notes": raw_text}` on any failure
- [ ] `summarize()` returns a fallback string on failure (does not crash)
- [ ] `_get_model()` raises clearly if `GEMINI_API_KEY` is missing

### bot.py
- [ ] Imports: `llm`, `storage` helpers, `python-telegram-bot` v21+ classes
- [ ] Handlers registered: `/start`, `/summary`, `/note`, `/undo`, `/list`, plus text message handler
- [ ] Every handler wrapped in `try/except` with `_reply_error()` fallback
- [ ] `text_log` calls `llm.extract_entry()` then `append_entry()` with `raw_text` merged in
- [ ] `summary_cmd` defaults to 14 days, parses `/summary N` argument
- [ ] `summary_cmd` sorts entries by timestamp before passing to `llm.summarize`
- [ ] `_reply_long()` chunks messages at 4000 chars (Telegram 4096 limit)
- [ ] `main()` raises `SystemExit` if `TELEGRAM_BOT_TOKEN` missing
- [ ] Uses `app.run_polling()` to start

### demo_seed.py
- [ ] Reads `DEMO_TELEGRAM_USER_ID` from env, falls back to `123456789`
- [ ] Overwrites the user record (does not duplicate on re-run)
- [ ] Contains ~45 entries for "Sam Lee" across May 13–26
- [ ] Includes at least one skipped dose with reason
- [ ] Includes at least one `question_for_doctor` entry

### requirements.txt
- [ ] `python-telegram-bot==21.6`
- [ ] `google-generativeai==0.8.3`
- [ ] `python-dotenv==1.0.1`

### .gitignore
- [ ] `.env`
- [ ] `data/journal.json`
- [ ] `__pycache__/`
- [ ] `*.pyc`
- [ ] `venv/` or `.venv/`

### README.md
- [ ] Setup instructions (venv, pip install, .env keys)
- [ ] Command list
- [ ] "Not medical advice" disclaimer
- [ ] How to run `demo_seed.py`

---

## Phase 3: Environment setup

- [ ] Python 3.11+ installed (`python --version`)
- [ ] Virtual environment created (`python -m venv venv`)
- [ ] Venv activated (`venv\Scripts\activate` on Windows, `source venv/bin/activate` on Mac/Linux)
- [ ] `pip install -r requirements.txt` completed without errors
- [ ] `.env` file created in `medbot/` with:
  - [ ] `TELEGRAM_BOT_TOKEN=...` (from @BotFather)
  - [ ] `GEMINI_API_KEY=...` (from https://aistudio.google.com/apikey)
  - [ ] `DEMO_TELEGRAM_USER_ID=...` (numeric Telegram user id)
- [ ] `.env` is NOT tracked by git (`git status` should not show it)

---

## Phase 4: Bot launches

- [ ] `python bot.py` starts without error
- [ ] Log line shows `MedBot Journal starting`
- [ ] No tracebacks in terminal

If it fails: most common causes are missing env vars, wrong Python version, or `gemini-2.0-flash` model string being stale (check Gemini docs and update `MODEL_NAME` in llm.py).

---

## Phase 5: Feature tests (run with bot live)

Open your bot in Telegram. For each test, send the message and confirm the response.

### /start
- [ ] Reply contains your name and a how-to line
- [ ] `data/journal.json` now exists and contains your user id with empty entries

### Plain-text logging (medication taken)
- [ ] Send: `took 500mg metformin with breakfast`
- [ ] Reply looks like: `Logged: metformin taken, with breakfast`
- [ ] `data/journal.json` shows a new entry with `type: "medication"`, `medication: "metformin"`, `taken: true`, `food_context: "breakfast"`

### Plain-text logging (medication skipped)
- [ ] Send: `skipped my evening lisinopril because I felt dizzy`
- [ ] Reply looks like: `Logged: lisinopril skipped (felt dizzy)` (or similar with the patient's reason)
- [ ] JSON shows `taken: false`, `notes` contains "dizzy"

### Plain-text logging (symptom)
- [ ] Send: `had a bad headache after lunch`
- [ ] Reply starts with `Noted:` and includes "headache"
- [ ] JSON shows `type: "symptom"`

### Plain-text logging (question for doctor)
- [ ] Send: `want to ask my doctor about morning dizziness`
- [ ] Reply: `Added to doctor questions: ...`
- [ ] JSON shows `type: "question_for_doctor"`

### /note
- [ ] Send: `/note slept poorly last night`
- [ ] Reply: `Noted.`
- [ ] JSON shows `type: "note"`, `notes: "slept poorly last night"`
- [ ] No Gemini call made (verify by adding a print in `llm.extract_entry` if unsure)

### /list
- [ ] Send: `/list`
- [ ] Reply shows last 5 entries, formatted `evt_NNN: raw_text`

### /undo
- [ ] Send: `/undo`
- [ ] Reply: `Removed: ...` with preview of the entry
- [ ] Re-run `/list` — confirms the entry is gone
- [ ] Send `/undo` repeatedly until empty — final reply: `Nothing to undo.`

### /summary (no entries)
- [ ] With empty journal, send `/summary`
- [ ] Reply: `No entries in the last 14 days.`

### /summary (with seed data)
- [ ] Stop the bot (Ctrl+C in terminal)
- [ ] Run `python demo_seed.py` — confirm it prints success and writes to `journal.json`
- [ ] Restart bot: `python bot.py`
- [ ] Send `/summary`
- [ ] Reply contains:
  - [ ] Patient name "Sam Lee"
  - [ ] "Medications logged:" section with metformin and lisinopril
  - [ ] "Symptoms / notes:" section in chronological order
  - [ ] "Questions Sam Lee wants to ask:" section with 2 questions
  - [ ] No clinical interpretation, no adherence percentages, no advice
- [ ] Send `/summary 7` — reply covers only last 7 days

### Error handling
- [ ] Send an empty message or sticker — bot does not crash, logs are clean
- [ ] Temporarily set `GEMINI_API_KEY=invalid` in `.env`, restart, send a message — reply is `Sorry, didn't catch that...` and bot stays running
- [ ] Restore real key, restart, verify it works again

---

## Phase 6: Safety review (do not skip)

- [ ] Bot output never contains medical advice or interpretation
- [ ] Summary uses patient's exact wording in quotes
- [ ] No adherence scores or percentages anywhere
- [ ] No cause-and-effect language linking symptoms to medications
- [ ] README has "Not medical advice" disclaimer visible
- [ ] Demo data uses fictional patient name (Sam Lee), not a real person

---

## Phase 7: Git hygiene before pushing

- [ ] `git status` shows no `.env` file in tracked changes
- [ ] `git status` shows no `data/journal.json` in tracked changes
- [ ] `git status` shows no `__pycache__/` or `*.pyc` in tracked changes
- [ ] Commit message is descriptive (not "update")
- [ ] Push to GitHub: `git push -u origin main`

---

## Known issues to watch for

1. **Gemini model name stale.** If `gemini-2.0-flash` returns 404, try `gemini-2.0-flash-001` or `gemini-2.5-flash`. Check current names at https://ai.google.dev/gemini-api/docs/models.
2. **Gemini safety filters.** Medication words sometimes trip filters. If `response.text` raises, the fallback note kicks in but extraction silently fails. Check logs during testing.
3. **Telegram 4096-char limit.** `_reply_long()` should handle it. Verify by sending `/summary` with all 45 seed entries.
4. **Timezone handling.** Timestamps use local tz on the machine running the bot. If hosted in the cloud, set `TZ` env var.
5. **JSON file corruption.** `load_journal` returns `{}` on corrupt JSON — this silently wipes the user's data on next save. Back up `journal.json` before testing destructive flows.

---

## Final go/no-go

All Phase 5 checks pass + Phase 6 safety review clean = ready to demo.