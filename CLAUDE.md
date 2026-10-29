# Souq al-Qamar: how the agents think

This repo is a village of AI agents. The page (`index.html`) only shows them. The agents themselves are **you, Claude**, running as a scheduled Claude Code task on the owner's Claude subscription. No API keys are stored anywhere.

## Each run

1. **Read the roster.** `data/agents.js` lists every agent: `id`, `name`, `home`, `job`, `personality`, `spouse`. When you act as an agent, stay inside their job and talk the way their personality says.
2. **Read the mail.** With the Gmail connector, find mail sent to the owner's agent aliases since `lastRun` in `data/brain.json`:
   `to:(OWNER+muse@gmail.com OR OWNER+layla@gmail.com …)`. The address after the `+` is the agent's `id`. Take OWNER from `ownerEmail` in `config.js`.
   Also find replies the owner sent in those threads, and WhatsApp-forwarded notes, if any.
3. **Do the work.** For each message, act as that agent:
   - Do what was asked if it fits the agent's job. If it doesn't fit, say who in the village it does fit.
   - Answer the owner in the same thread. If the connector can only make drafts, leave a draft and set that agent's `messageNote` to "Reply waiting in your drafts".
   - **Agent to agent:** if the subject names another agent ("Omar: can you check…"), that agent takes a turn too. Write their answer in the thread, add an `activity` entry `{ from, to, subject }` for each hop, and stop after 3 hops.
   - **Muse is special.** Mail to `+muse` usually comes from the owner's Meta Muse assistant with things it pulled from school websites. File it under `library/` as dated Markdown, one file per course (`library/<course>.md`). Don't answer it. Set Muse's `message: true` with a short `messageNote` ("3 new due dates"). Other agents read `library/` when they need school facts.
4. **Update `data/state.js`** (keep it the same shape, strict JSON after `window.VILLAGE_STATE =`):
   - `status`: `"working"` while an agent has unfinished work, otherwise `"idle"`.
   - `task`: a few words on what they are doing.
   - `message` / `messageNote`: true when the owner should look at something from them.
   - `tasksDone`: add 1 for each finished request. (Hearts and levels come from `player`, below, not from this.)
   - `activity`: append mail events (owner = `"you"`). Keep the last 200.
   - `updated`: now, ISO time.
5. **Save** `lastRun` in `data/brain.json`, commit with a short message ("Village: Layla answered 2 emails"), and push. The hosted page picks up the new state within a minute.

## Skills and friendship (every run)

You gather numbers; `tools/daily.mjs` does all the arithmetic. Never edit `player` in `data/state.js` by hand.

1. **Work out "today"** in the owner's time zone (America/Denver unless `config.js` says otherwise).
2. **Gather today's totals.** Report each one as the total so far today, not a delta. Source ids are listed in `data/progression.js`.
   - `arabic_app_xp`: the Arabic Flashcards connector, `get_study_xp` with `days: 2`. Take the XP for today's date. If yesterday and today both have XP, set `arabic_streak` to 1.
   - `emails_sent`: Gmail search `in:sent after:<today> -to:me` (count the messages).
   - `inbox_cleared` and `inbox_zero`: count `in:inbox`, and keep `inboxAtStart` (the inbox size at the first run of the day) in `data/brain.json`. `inbox_cleared` = max(0, inboxAtStart − now). On the last run of the day, `inbox_zero` = 1 if the inbox is empty.
   - `linkedin_connections`: today's LinkedIn emails saying someone accepted your invitation.
   - `linkedin_messages`: today's LinkedIn "new message" emails.
   - From mail to `+report` today: lines `key=value` set a total. Lines `key+=value` add to it; use `node tools/daily.mjs add` for those. `steps=N` is not a source of its own: record `steps_10k` = 1 when N ≥ 10000.
   - `decks_built`: decks or card sets Mustafa made for the owner today.
   - `digest_read`: 1 if the owner opened or answered today's Muse digest.
   - `assignments_done` and `assignments_early`: from Muse's digest when an assignment shows as submitted.
   - `weekly_review`: 1 when the owner and Othman finish the weekly plan thread.
3. **Record:** `node tools/daily.mjs record --date <today> --counts '<json>'`. If the date changed since the last run, it closes the previous day by itself.
4. **On the last run of the day** (after 11:15 PM), run `node tools/daily.mjs close`. It writes level-ups to `player.levelUps`. The village shows them, and the owner's phone announces them.
5. Commit `data/state.js` with the rest. In the commit message, mention any level-ups ("Village: Arabic reached level 3").

## Rules

- Never put passwords, tokens or API keys in this repo.
- Never send email to anyone except the owner unless the owner asked in that thread.
- Keep `data/agents.js` readable; it's edited by hand.
- If a run finds no new mail and no counts changed, change nothing and don't commit.
