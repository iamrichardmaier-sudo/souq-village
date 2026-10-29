# The phone scripts (Scriptable, iOS)

Everything the owner runs on their iPhone lives in this folder. The owner's setup steps are in `PHONE.md`; this file is for whoever changes the code.

## The files

| File | Script name on the phone | What it does |
|---|---|---|
| `villagers/Muhammad.js`, `Ahmed.js`, `Othman.js`, `Mustafa.js`, `Saladin.js`, `Muse.js` | The villager's name | One per villager. A small launcher: it downloads `SouqCore.js` from the site and calls `run({ agent })`. That gives the villager's widget, chat screen, setup quest and Siri answer. |
| `Souq Village.js` | **Souq Village** | A launcher for the whole-village widget. It calls `village()`: the painted souq for the current time and weather, who has news, and a tap that opens the game. |
| `SouqCore.js` | **Souq Core** (saved by the launchers) | All the real code. The owner never pastes it. The launchers download the newest copy from the site on every run, so pushing this file updates every phone. |
| `LevelUpNotify.js` | **Souq Level Ups** | Standalone. A nightly Shortcuts automation runs it, and it sends a notification for each new level or heart. |

## How it fits together

```
phone launcher ──downloads──> https://souqvillage.netlify.app/scriptable/SouqCore.js
      │                                │
      └── importModule("Souq Core") ───┘
             ├─ run({ agent })  → widget / chat / Siri for one villager
             └─ village()       → the whole-village widget
```

**Reads from the site:**
- `config.js`: `ownerEmail`, and `brain` (which AI runs the village, with its links).
- `data/agents.js`, `data/state.js` and `data/chat.json`.
- `assets/agents/<id>/portrait.png` and `assets/map/widget/<scene>.jpg`.
- Weather from Open-Meteo, which needs no key.

**Sends:**
- **Email:** to `owner+<id>@gmail.com` through the owner's **Souq Send** Shortcut. The subject ends in `(widget)`, `(Siri)` or `(call notes)`.
- **Quick replies:** a POST to the address the owner pasted, up to 20 a day. For a Claude scheduled task's Fire URL the body is `{ text: "<json>" }`; for any other address it's `{ agent, text, via, at }`. A response of `{ "reply": "…" }` is shown right away. The rules the AI follows are in `AGENTS.md` → Quick replies.

**Stored on the phone, never in the repo:**
- **Keychain:** `souq.villageURL` (the site), plus `souq.fireURL` and `souq.fireToken` for quick replies.
- **`Documents/souq-chat/local.json`:**
  - what the owner has seen and heard,
  - messages still waiting for an answer,
  - answers an AI gave straight back,
  - call links and ticked setup steps,
  - today's quick-reply count.
- **Cached copies** of the site's files, so widgets still work offline.

## Changing things

- **Villager voices, the daily cap and run times:** the constants at the top of `SouqCore.js` (`VOICES`, `QUICK_PER_DAY`, `RUN_TIMES`).
- **Setup quests**, the connections each villager asks for: `quests()` in `SouqCore.js`.
- **A new villager:** add them to `data/agents.js`. Copy a launcher in `villagers/` and change `AGENT`, the name and the icon line. Then add their quest to `quests()`.
- **The site's address:** `VILLAGE_URL` near the top of every launcher, and `LevelUpNotify.js`.
- **A different AI:** change `brain` in `config.js` (see `SWITCHING.md`). The phone code needs no change.

## Scriptable gotchas

- **Missing commands:** use only real Scriptable APIs (docs.scriptable.app). For example, `FileManager` has no `directory()`, so the launchers cut the folder out of `module.filename` themselves.
- **No top-level `await` in a module:** `SouqCore.js` is imported with `importModule`, so all of its work sits inside `run()` and `village()`.
- **One link per tap:** small widgets take a single `url`; only medium and large widgets can have a separate one per area (the buttons and faces).
- **Tapping can open the app:** if the widget's "When Interacting" setting is Run Script, a tap runs the script in the app. `village()` then opens the game, and `run()` opens the chat.
- **Test without a phone:** run the launchers in Node with stand-ins for Scriptable's objects (`Request`, `FileManager`, `Keychain`, `WebView`, `ListWidget`, `DrawContext`, `Timer`…). Copy only methods Scriptable really has into the stand-ins, or the test will hide bugs.
