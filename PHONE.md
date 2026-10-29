# Talking to the villagers from your phone

Every villager gets their own home-screen widget, with their portrait as the picture. Tap it to text them, hear their replies out loud, or call them for a live voice chat in the Claude app. Siri can do the same hands-free.

**The first time you open a villager, they give you a task:** the connections they need to do their job. Start with **Muhammad**, because nothing gets delivered until his part is done.

No API keys are involved:
- **Quick replies.** Your text goes straight to the AI (today the **Souq village chat** Claude task), and the villager answers in a minute or two. You get 20 a day. It uses your Claude plan, not money.
- **After 20,** or before quick replies are on, texts go out as email to the villager's alias (`you+ahmed@gmail.com`). The next village run answers them (12:20, 6:20 and 11:20).
- **Calls** open that villager's assistant in your AI's app (a Claude Project today) for live voice.

To move all of this to another AI, see `SWITCHING.md`.

## 1. The villager scripts (Scriptable)

1. Install **Scriptable** from the App Store.
2. For each villager, make a new script with exactly their name (**Muhammad**, **Ahmed**, **Othman**, **Mustafa**, **Saladin**, **Muse**), and paste in their file from `scriptable/villagers/`.
3. Open **Muhammad** once. It asks for the village's address (the Netlify link, like `https://your-site.netlify.app/`). The other villagers remember it.

The villager scripts download **Souq Core** from the village by themselves, and keep it up to date. You never edit it.

## 2. The widgets

Long-press the home screen → **+** → **Scriptable**, pick a size, then long-press the widget → **Edit Widget** → **Script:** the villager's name. Do this once per villager.

| Size | What it shows | Tapping it |
|---|---|---|
| Small | Their portrait fills the widget, with their name, latest words, and a dot when there's something new | Opens the chat |
| Medium | Portrait, hearts, their latest words, and **💬 Message** / **📞 Call** buttons | Each button does what it says |
| Large | The same, plus the last few messages | Same |

**In the chat:** type, or tap 🎤 on the keyboard to talk. **🔊 Listen** reads a reply in that villager's voice. **↻ Check** looks for replies. **📜 Setup** opens their task again.

**The whole village:** make one more script named **Souq Village** from `scriptable/Souq Village.js`, and add it as a widget of any size. It shows the painted souq the way the game shows it right now (morning, midday, sunset, night, rain, fog or snow), the weather, and who has news. Tap it to open the game. On medium and large, tap a face to open that villager's chat; a pink ring means they have news.

## 3. The setup tasks

Each villager's task is a checklist. Every step has buttons that take you to the right place or copy what you need. Tap the circle when a step is done. Steps the phone can check, like quick replies and calls, tick themselves.

| Villager | What they ask for |
|---|---|
| **Muhammad** | The **Souq Send** Shortcut (below), Gmail in Claude, quick replies, LinkedIn notifications |
| **Othman** | The village's scheduled task (he copies the prompt for you), Google Calendar, level-up notifications |
| **Ahmed** | The Arabic app's branch merged, and the **Arabic Flashcards** connector |
| **Mustafa** | The **Log to Souq** Shortcut (`CONNECTIONS.md` step 3) |
| **Saladin** | The **Souq Day Report** automation (`CONNECTIONS.md` step 2) and Health sharing for Park Destroyer |
| **Muse** | Instructions for your Meta Muse (she copies them for you) |
| **Everyone** | A call with them, and a Siri Shortcut |

### The Souq Send Shortcut (sends your texts silently)

In the Shortcuts app, make a new Shortcut named exactly **Souq Send**:

1. **Get Dictionary from** *Shortcut Input*.
2. **Get Dictionary Value** for key `to`. Rename the result **To** (long-press it).
3. **Get Dictionary Value** for key `subject` from the *Dictionary*. Rename it **Subject**.
4. **Get Dictionary Value** for key `body` from the *Dictionary*. Rename it **Body**.
5. **Send Email**: recipient *To*, subject *Subject*, message *Body*. Tap the arrow and turn **Show Compose Sheet** off.

It sends from the iPhone Mail app, so your Gmail needs to be added there (Settings → Apps → Mail → Mail Accounts).

### Quick replies (Muhammad's step)

1. In the chat, tap **Set up** on the step, then **Open**. Open **Souq village chat** → **Edit**. Add the **souq-village** repository, so the task can save replies.
2. Still in Edit, tap **+** next to Trigger → **API**.
3. Copy the **Fire URL**, come back, and tap **Paste**.
4. Tap **Generate token**, copy it, come back, and tap **Paste** again. The token shows only once.

The token can only start that one task, and it stays in your phone's Keychain. The chat shows how many quick replies are left today.

### Calls (everyone's step)

1. Tap **Set up**, then **Copy instructions**. Claude opens.
2. Make a **new Project** named after the villager and paste into its instructions.
3. Copy the project's link, come back, and tap **Save link**.

After that, **📞 Call** opens their project straight away. Tap the voice button in Claude to talk. When you say goodbye, they give you a recap that starts with "Call notes:". Copy it and tap **📋 Send call notes**, so the village remembers.

### Siri

Make one Shortcut per villager, named what you'll say, like **Talk to Ahmed**:

1. **Run Script** (Scriptable): Script *Ahmed*. Turn **Run In App** off.
2. **Speak Text**: *Script Result*. Tap the arrow to pick a different voice for each villager.
3. **Dictate Text.**
4. **Send Email**: To `i.am.richardmaier+ahmed@gmail.com`, Subject `Ahmed (Siri)`, Message *Dictated Text*. Turn **Show Compose Sheet** off.

Say **"Hey Siri, Talk to Ahmed."** Siri reads what Ahmed has said since you last heard, then listens for your answer. Siri messages go by email, so they're answered at the next village run.

**Home-screen icon with their face:**
1. Open the village address + `assets/agents/ahmed/portrait.png` in Safari, long-press the image and Save to Photos.
2. In Shortcuts, long-press **Talk to Ahmed** → Share → **Add to Home Screen**, tap the icon and choose that photo.

## Good to know

- **Quick replies aren't instant.** It takes a minute or two for the task to start and for the site to update. The chat shows "typing…" and checks every 15 seconds. If nothing comes after 6 minutes, tap **Send by email**.
- **Your Claude plan:** each quick reply is a whole Claude run, so it uses more of your plan than a normal chat. The 20-a-day cap is `QUICK_PER_DAY` in `scriptable/SouqCore.js`.
- **Privacy:** your chats are in `data/chat.json` on the village site. Its address is hard to guess, but anyone with the link could read them. Don't share the link.
- **Voices:** `VOICES` in `scriptable/SouqCore.js` sets each villager's speed, pitch and accent for 🔊 Listen.
