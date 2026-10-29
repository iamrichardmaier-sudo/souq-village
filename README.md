# Souq al-Qamar · سوق القمر

A cozy isometric Arabic souq where your AI agents live. The village is your painting (`assets/map/souq.jpg`), and its streets, doors and lanterns are traced in `js/painted.js`. Set `map: "drawn"` in `config.js` to use the built-in hand-drawn map instead. Walk around, or tap any building to jump straight inside. The time of day and the weather match the real ones outside.

No build step, no server code and **no API keys**. It's plain HTML and JavaScript.

## Open it

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` directly also works. Serving it over http is what turns on automatic background removal for your Gemini images.

**Controls:** tap the ground to walk (or use WASD / arrow keys). Tap a building or a person to go inside. 🗺️ lists every place. Drag to look around, and pinch or scroll to zoom. **E** enters the door you're standing at.

Handy for testing: `?hour=21` forces the time to 9 pm, and `?weather=rain` (also `clear`, `partly`, `cloudy`, `fog`, `snow` or `storm`) forces the weather.

## Files you edit

| File | What it is |
|---|---|
| `config.js` | Your email, WhatsApp number, location fallback, your character, library links, sound files |
| `data/agents.js` | The agents: name, house, job, personality, look, who's married |
| `data/state.js` | What each agent is doing right now. The scheduled AI run rewrites this. |
| `PHONE.md` | Setting up the phone widgets, Siri and calls |
| `data/chat.json` | The conversations the phone widgets show. The AI writes it. |
| `AGENTS.md` | The instructions the agents follow, for whichever AI runs them (`CLAUDE.md` points Claude to it) |
| `SWITCHING.md` | How to move the village to another AI |
| `ART_PROMPTS.md` | Gemini prompts and exact filenames for characters and rooms |
| `js/painted.js` | Where people can walk on the painting, and where each door and lantern is |

The five residents in `data/agents.js` (besides Muse) are samples. Replace them when you're ready.

## How talking to the agents works

Every agent has an email alias on your one inbox: `you+muse@gmail.com`, `you+layla@gmail.com` and so on. Gmail and iCloud deliver `+anything` to the same inbox.

- **You → an agent:** email their alias, or tap *Email* in their room.
- **Agent → you:** they reply in that thread. When they have something for you, a **!** floats over their head.
- **Agent → agent:** put another agent's name in the subject (*"Omar: can you check the grocery list?"*). They both act, and you'll see them meet at the coffee house.
- **Muse (Meta):** have Muse email what it finds on your school sites to `you+muse@…`. It gets filed in the library, where the other agents can read it.
- **WhatsApp:** set `whatsappNumber` in `config.js` and each room gets a WhatsApp button that starts the message with the agent's name.

### Who does the thinking

The agents run on **Claude Code as a scheduled task** using your Claude subscription. You don't need an API key and none is stored. Each run, Claude reads the new mail to the aliases through the Gmail connector, answers as each agent following `AGENTS.md`, updates `data/state.js`, and pushes. The hosted page picks that up within a minute.

Nothing is locked to Claude. Any AI that can push to this repo, read Gmail and run on a schedule can take over; see `SWITCHING.md`.

### Skills, hearts and levels

The village works like Stardew Valley. What you do during the day earns XP in 6 skills, 15 levels each, and hearts with the person who specializes in it, 10 hearts each. The XP turns into levels at the end of the day, and your phone announces each level-up. See `CONNECTIONS.md` for where every number comes from, and 📜 in the village for your progress.

## Phone: widgets, Siri and calls

Each villager has their own home-screen widget with their portrait. Text them there, and they answer in a minute or two (20 quick replies a day, then by email at the next run). Hear replies out loud, or tap **📞 Call** to talk live in your AI's app. Siri works too: *"Hey Siri, Talk to Ahmed."* No API keys are needed. The first time you open a villager, they ask you to set up the connections they need. Setup is in `PHONE.md`; the scripts are in `scriptable/villagers/`, and they share `scriptable/SouqCore.js`.

## Sound

Drop files into `audio/` named `day.mp3`, `night.mp3`, `rain.mp3`, `music.mp3`, `click.mp3`, `door.mp3`, `message.mp3`, `heart.mp3`. Anything missing stays silent. 🔊 turns sound on. Day and night ambience switch with the real clock, and rain plays when it's really raining.

## Hosting

Any static host works. Netlify can deploy a **private** GitHub repo for free and rebuilds on every push. Set the publish directory to the repo root, with no build command.
