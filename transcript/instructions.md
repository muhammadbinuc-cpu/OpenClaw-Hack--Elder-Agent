# MedBot Journal — Project Summary

Telegram bot that logs medication events and lifestyle context from free-form messages, then produces a plain-text doctor-visit summary on demand.

**Design rule:** Log and organize what the patient said. Never interpret, diagnose, score adherence, or recommend. The doctor does that.

---

## File layout

| File | Purpose |
|------|---------|
| `storage.py` | JSON journal I/O (`data/journal.json`), atomic saves, `evt_NNN` ids |
| `prompts.py` | `EXTRACTION_PROMPT` + `SUMMARY_PROMPT` |
| `llm.py` | Gemini extraction (JSON mode) + summary (text) |
| `bot.py` | Telegram handlers |
| `demo_seed.py` | 14-day fake "Sam Lee" history |
| `requirements.txt` | Pinned deps |
| `.env` | Secrets (gitignored) |
| `data/journal.json` | Auto-created, gitignored |

---

## Stack

Python 3.11+ · `python-telegram-bot==21.6` · `google-generativeai==0.8.3` · `python-dotenv==1.0.1` · JSON storage

---

## `.env`

```env
TELEGRAM_BOT_TOKEN=...       # @BotFather
GEMINI_API_KEY=...           # aistudio.google.com
DEMO_TELEGRAM_USER_ID=...    # @userinfobot
```

---

## Run

```bash
pip install -r requirements.txt
python demo_seed.py   # load demo data (optional)
python bot.py
```

Run from inside this folder so relative imports resolve.

---

## Commands

| Command | Action |
|---------|--------|
| `/start` | Register + how-to |
| `(text)` | Log via Gemini → confirm |
| `/summary` | Last 14 days handout |
| `/summary 7` | Last N days |
| `/note <text>` | Verbatim note (no LLM) |
| `/undo` | Remove last entry |
| `/list` | Last 5 entries |

---

## Entry types

`medication` · `symptom` · `question_for_doctor` · `note`

Fields: `id`, `timestamp`, `raw_text`, `medication`, `dose`, `taken`, `food_context`, `symptoms`, `notes`

---

## LLM

- Extract: `gemini-2.0-flash` + `response_mime_type="application/json"`
- Summary: same model, plain text
- Fallback: `{"type": "note", "notes": raw_text}` on any error

---

## Demo seed

Sam Lee, metformin + lisinopril, 45 entries (May 13–26). 3 missed doses, symptoms, 2 doctor questions.

Set `DEMO_TELEGRAM_USER_ID` in `.env` to your Telegram numeric id before running `python demo_seed.py`.

---

## Gotchas

- `pip install` from this folder
- Gemini 404 → try `gemini-2.0-flash-001` or `gemini-2.5-flash`
- Seed user id must match who messages the bot
- `/summary` chunked at 4000 chars (Telegram limit)
- Fictional data only for demos

---

## Not in scope

Adherence scores · interaction warnings · cause labels · graphs · payments

## Next

WhatsApp bridge — not built yet (Telegram-only for now).
