# Moving the village to another AI

Almost nothing in the village belongs to one AI. Its data, the website, the phone widgets, the email addresses and your Shortcuts all stay the same. Only **four things** point at the AI, and this guide moves each one.

| What | Where it lives | Today |
|---|---|---|
| 1. The village's scheduled runs | Your AI service | Claude Code scheduled task **Souq al-Qamar agents** |
| 2. Its connections (Gmail, Calendar, Arabic app) | Your AI service | Claude connectors |
| 3. Quick replies from the phone | An address you paste into the phone | Claude scheduled task **Souq village chat** |
| 4. Calls | `brain` in `config.js`, plus one assistant per villager | Claude Projects |

The rules every AI follows are in **`AGENTS.md`**. Many AI coding tools read that file by themselves. `CLAUDE.md` only points Claude to it.

## What the new AI must be able to do

- **Read and push this GitHub repo** (`iamrichardmaier-sudo/souq-village`).
- **Read and send your Gmail.**
- **Run `node`**, for `tools/daily.mjs`.
- **Run on a schedule:** three times a day, at 12:20, 6:20 and 11:20 PM Denver time.
- **Nice to have:** Google Calendar, and MCP servers for the Arabic app's connector.

Coding agents that run in the cloud on a schedule fit best, for example OpenAI Codex, Gemini CLI in GitHub Actions, or Cursor background agents. A chat-only assistant can't push to the repo, so it can handle calls but not the runs.

## 1. The scheduled runs

Make a scheduled job in the new AI with access to the repo, Gmail and `node`, running at the three times above. Give it this prompt. Othman's setup step in the phone copies it too.

```
You are the agents of Souq al-Qamar. Follow AGENTS.md in this repo exactly:
answer new mail to the agent aliases as the right agent, update agent statuses,
gather today's skill counts and record them with tools/daily.mjs, and if it is
after 11:15 PM America/Denver, close the day with `node tools/daily.mjs close`.
Commit and push to main when anything changed. Never store keys or passwords
in the repo, and never email anyone but the owner unless the owner asked.
```

**If the tool reads a different file than `AGENTS.md`**, make that file one line long: "Follow AGENTS.md exactly." Gemini CLI, for example, reads `GEMINI.md`.

## 2. The connections

Connect these in the new AI:

- **Gmail:** the inbox that gets the agent mail (`config.js` → `ownerEmail`).
- **Google Calendar:** optional, for Othman.
- **Arabic Flashcards:** an MCP server at `https://fphpcfecgnfoogfaeihu.supabase.co/functions/v1/mcp`. You sign in with your Arabic app account, so no key is stored.

## 3. Quick replies

The phone sends each message to one web address as JSON:

```
POST <your address>
Authorization: Bearer <your token>     (only if you saved one)
Content-Type: application/json

{ "agent": "ahmed", "text": "How do I say tired?", "via": "widget", "at": "2026-10-29T17:02:00Z" }
```

**Whatever runs at that address should:**
1. Answer as that villager, following "Quick replies" in `AGENTS.md`.
2. Save the answer to `data/chat.json` and push, so the conversation is kept.
3. Reply to the request with any 2xx status. If it has the answer by then, send `{ "reply": "…" }`, and the phone shows it straight away.

If the AI's own trigger wants a different shape, put a small relay in front of it, like an n8n, Make or Zapier webhook.

**On the phone:** open Muhammad → 📜 Setup → quick replies **Set up**. Tap **Forget**, then copy the new address and tap **Paste**. If there's a token, copy it and tap **Paste** again. The 20-a-day cap still applies.

## 4. Calls

1. In `config.js`, change `brain` to the new AI: its name, its app, where to make an assistant (`callSetup`) and what an assistant link starts with (`callLink`). There are ChatGPT and Gemini examples in the file. Push it, and every widget picks it up.
2. Calls are now set up again for each villager. Tap **📞 Call**, then **Copy instructions**. Make the assistant (a GPT in ChatGPT, a Gem in Gemini), paste the instructions, copy its link and tap **Save link**.

## 5. Turn off the old AI

When the new runs work, turn off the Claude scheduled tasks **Souq al-Qamar agents** and **Souq village chat** on claude.ai/code/routines. Otherwise both AIs answer the same mail.

## What stays the same

- The website, `data/`, `library/` and `tools/`.
- The email aliases and the Day Report and Log to Souq Shortcuts.
- The Siri Shortcuts, which go by email.
- The villager scripts on your phone. They keep `Souq Core` up to date by themselves.
