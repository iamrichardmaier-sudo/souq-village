# Handoff: carrying Souq al-Qamar to a new Claude account

Everything the village needs is in this repo. Nothing important lives only in the old Claude account. Hand this file to the new account's Claude, or tell it: **"Read HANDOFF.md in souq-village and carry on."**

## What this is

- **The village** (`index.html`, `js/`, `assets/`): a cozy isometric Arabic souq (Souq al-Qamar, سوق القمر). It's a static site with no build step and no API keys. The map is a painted picture (`assets/map/souq-*.jpg`); its walkable streets, doors and lanterns are traced in `js/painted.js`. Seven more painted versions of the map (morning, sunset, night, rain, rainy night, fog, snow) fade in with the real time and weather. Weather comes from Open-Meteo, which needs no key.
- **The agents** (`data/agents.js`):

  | Agent | Role | Lives in |
  |---|---|---|
  | Muhammad | Postman, email | Post office |
  | Ahmed | Sheikh, Arabic | Madrasa (h5) |
  | Othman | Mayor, plans and goals | Palace (h7) |
  | Mustafa | Scholar, school | Jamia (h9) |
  | Saladin | Warrior, fitness | Training Yard (h3) |
  | Muse | Librarian, school data from the owner's Meta Muse assistant | Library |

  Houses h1, h2, h4, h6 and h8 and the coffee house are free for the 3–4 agents still to come; there are ideas in `CONNECTIONS.md`.
- **The brain**: the agents are Claude itself, running as a **scheduled Claude Code task** on the owner's subscription. The instructions are in `CLAUDE.md`. The owner talks to agents by emailing `i.am.richardmaier+<agent id>@gmail.com`. Putting another agent's name in the subject makes them talk to each other.
- **Progression** (Stardew-style):
  - The rules are in `data/progression.js` and the end-of-day math in `tools/daily.mjs`.
  - Six skills with 15 levels each, and 10 hearts per agent.
  - XP sources and setup are in `CONNECTIONS.md`.
  - Level-ups show in the village and as phone notifications (`scriptable/LevelUpNotify.js`).

## What the owner does with the new account

### 1. Connect the new Claude account
In **claude.ai → Settings → Connectors**, add:
- **GitHub**, with access to `iamrichardmaier-sudo/souq-village` (and `benarabic`).
- **Gmail**, for `i.am.richardmaier@gmail.com`. This is the inbox all agent mail goes to.
- **Google Calendar** (optional, for Othman's planned blocks).
- **Arabic Flashcards**: add a custom connector with the URL `https://fphpcfecgnfoogfaeihu.supabase.co/functions/v1/mcp` and sign in with the Arabic app account. This only works after step 2.
- **Higgsfield** (optional, only for making more art). Sign in to the same Higgsfield account. There are about 50 credits left as of Oct 29, 2026.

### 2. Merge the Arabic app change
In `benarabic`, merge the branch `claude/festive-feynman-o0eq3d` into `main`. It adds the `get_study_xp` tool to the app's MCP server (`src/lib/mcp/tools/get-study-xp.ts`), which lets Ahmed read the owner's daily Arabic XP. Lovable redeploys the function.

### 3. Put the village online (if not done yet)
1. On Netlify, go to **Add new site → Import from GitHub** and pick `souq-village`.
2. Leave the build command empty and set the publish directory to `.`. `netlify.toml` already sets both.
3. Put the site address into these three places:
   - `VILLAGE_URL` in `scriptable/AgentWidget.js`
   - `VILLAGE_URL` in `scriptable/LevelUpNotify.js`
   - your phone's Scriptable copies of those two scripts.

The site is public, but its address is hard to guess. Don't post the link.

### 4. Create the scheduled task (the agents' brain)
In a Claude Code session on the new account with `souq-village` open, say:

> Create a scheduled task for this repo named "Souq al-Qamar agents", a fresh session each time, with the Gmail, Google Calendar and Arabic Flashcards connectors, running at 12:20 PM, 6:20 PM and 11:20 PM America/Denver every day, with the prompt below.

**Prompt for the scheduled task:**
```
You are the agents of Souq al-Qamar. Follow CLAUDE.md in this repo exactly:
answer new mail to the agent aliases as the right agent, update agent statuses,
gather today's skill counts and record them with tools/daily.mjs, and if it is
after 11:15 PM America/Denver, close the day with `node tools/daily.mjs close`.
Commit and push to main when anything changed. Never store keys or passwords
in the repo, and never email anyone but the owner unless the owner asked.
```

Three runs a day keep the cost to the subscription low. Add more runs for faster replies.

### 5. Phone setup (Shortcuts and Scriptable)
Follow `CONNECTIONS.md` steps 2–4:
- the **Souq Day Report** automation, which sends Health and Reminders numbers each night;
- the **Log to Souq** button;
- **level-up notifications**.

Then add one **Tell <agent>** Shortcut per agent for Siri (see `README.md`).

### 6. Give Muse its instructions (Meta)
Use the text in `HIGGSFIELD_PROMPTS.md` §7 so Muse emails school updates to `i.am.richardmaier+muse@gmail.com`.

## Notes for the next Claude

- **Run locally:** `python3 -m http.server` from the repo root. Test any time and weather with `?hour=21&weather=rain`.
- **Simulate progression:** use `node tools/daily.mjs record|add|close|status`. It edits `data/state.js`, so back that file up first and restore it afterward.
- **Art pipeline:**
  - Character sheets are 4 poses on flat magenta. `python3 -I tools/cut_sheet.py sheet.png outdir` cuts them into `idle`/`working`/`wave`/`walk`/`portrait` PNGs. Copy the results to `assets/agents/<id>/`.
  - Rooms are 1024×572 PNGs in `assets/rooms/<place id>.png`. Houses without their own room use `house.png`.
  - Original sheets and the full-size map are in `assets/source/`.
- **What worked with Higgsfield** (Nano Banana Pro, 2 credits an image):
  - For a new character, attach **only** a clean existing sheet (`assets/source/sheet-muhammad.jpg`) and say "a new character sheet in exactly the same style, layout and flat magenta background… draw a DIFFERENT character…".
  - Attaching the map as a reference made part of the map leak into the background, and redoing a sheet with its own failed version attached copied the leak.
  - For map edits, name each building by position ("LOWER LEFT OF CENTER…") and list what must NOT change. The first vague attempt changed the wrong buildings.
  - New map versions must keep the exact layout (2000×1116 when saved). The streets in `js/painted.js` are traced to those pixels. Check alignment before using a new map.
- **Characters on the map** are drawn at `V.personScale` (1.6) in `js/painted.js`. They walk on a 16-pixel grid traced from the painting.
- **Open items:**
  - The owner's own character sheet. They need to describe themselves first.
  - AutoSprite walk cycles. Optional; a two-pose walk is used now.
  - LinkedIn sent-message counts. LinkedIn offers no feed, so they're logged by hand with Log to Souq.
  - Some edge houses (the left side and the laundry house) aren't reachable on the walk grid yet.
  - The 3–4 extra agents.
