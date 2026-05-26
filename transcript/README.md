# MedBot Journal

Telegram bot that logs medication events and lifestyle context from free-form messages, then produces a plain-text doctor-visit summary on demand.

> **Not medical advice.** This bot logs and organizes what you say. It never interprets, diagnoses, scores adherence, or recommends. Your doctor does that.

---

## Setup

**Requirements:** Python 3.11+

```bash
# 1. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create .env in this folder
cp .env.example .env
# Fill in the three values (see below)

# 4. Start the bot
python bot.py
```

### `.env` keys

| Key | Where to get it |
|-----|----------------|
| `TELEGRAM_BOT_TOKEN` | [@BotFather](https://t.me/BotFather) on Telegram |
| `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `DEMO_TELEGRAM_USER_ID` | [@userinfobot](https://t.me/userinfobot) — only needed for demo |

---

## Commands

| Command | Action |
|---------|--------|
| `/start` | Register + how-to |
| `(any text)` | Log via Gemini → confirmation |
| `/summary` | Last 14 days plain-text handout |
| `/summary 7` | Last N days |
| `/note <text>` | Verbatim note, no LLM |
| `/undo` | Remove last entry |
| `/list` | Last 5 entries |

---

## Demo data

Loads 45 fictional entries for "Sam Lee" (May 13–26, metformin + lisinopril):

```bash
# Set DEMO_TELEGRAM_USER_ID in .env to your Telegram id first
python demo_seed.py
```

Re-running overwrites the demo user — it does not duplicate entries.

---

## Entry types

`medication` · `symptom` · `question_for_doctor` · `note`

Fields stored per entry: `id`, `timestamp`, `raw_text`, `medication`, `dose`, `taken`, `food_context`, `symptoms`, `notes`

---

## Gotchas

- Run from this folder so relative imports work
- Gemini 404 → try `gemini-2.0-flash-001` or `gemini-2.5-flash` in `llm.py`
- Seed user id must match who messages the bot
- `/summary` chunked at 4000 chars (Telegram limit)

---

## Not in scope

Adherence scores · interaction warnings · cause labels · graphs · payments · WhatsApp bridge
