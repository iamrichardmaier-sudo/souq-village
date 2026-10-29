# Talking to the villagers from your phone

Each villager gets a home-screen widget with their portrait. Tap it to text them, hear their replies out loud, or call them for a live voice chat in the Claude app. Siri can do the same hands-free. There are no API keys:

- **Texts** go out as email to the villager's alias (`you+ahmed@gmail.com`).
- **Replies** come from the scheduled Claude run (12:20, 6:20 and 11:20). It answers in character and writes the reply into `data/chat.json`, which the widget reads from the village site.
- **Calls** open that villager's Project in the Claude app, where you talk to them in voice mode right away.

Villager ids: `muhammad`, `ahmed`, `othman`, `mustafa`, `saladin`, `muse`.

## 1. The script (Scriptable)

1. Install **Scriptable** from the App Store.
2. New script, named exactly **Souq Chat**. Paste in `scriptable/SouqChat.js`.
3. At the top, set `VILLAGE_URL` to the village's address (ends with `/`).

## 2. The "Souq Send" Shortcut (sends your texts silently)

In the Shortcuts app, make a new Shortcut named exactly **Souq Send**:

1. **Get Dictionary from** *Shortcut Input*.
2. **Get Dictionary Value** for key `to`. Rename the result **To** (long-press it).
3. **Get Dictionary Value** for key `subject` from the *Dictionary*. Rename it **Subject**.
4. **Get Dictionary Value** for key `body` from the *Dictionary*. Rename it **Body**.
5. **Send Email**: recipient *To*, subject *Subject*, message *Body*. Tap the arrow and turn **Show Compose Sheet** off.

It sends from the iPhone Mail app's account, so your Gmail needs to be added in Mail (Settings → Apps → Mail → Mail Accounts).

The script opens this Shortcut, then comes straight back. If you'd rather tap Send on every text, set `SEND_WITH = "mail"` in the script.

## 3. The widgets

For each villager: long-press the home screen → **+** → **Scriptable** and pick a size. Then long-press the widget → **Edit Widget**:
- **Script:** Souq Chat
- **Parameter:** the villager's id, like `ahmed`

| Size | What it shows | Tapping it |
|---|---|---|
| Small | Portrait, hearts, their latest words, a dot when they wrote back | Opens the chat |
| Medium | The last two messages, with **💬 Message** and **📞 Call** buttons | Each button does what it says |
| Large | The last five messages and both buttons | Same |

**In the chat:** type, or tap 🎤 on the keyboard to talk. A message shows *Sent · waiting* until the next village run answers it. Tap **🔊 Listen** on a reply to hear it in that villager's voice. Tap **↻ Check for replies** to look for new ones.

## 4. Calls (once per villager)

The first time you tap **📞 Call**, the chat shows three steps:

1. **Copy instructions.** This copies the villager's personality and opens Claude.
2. In Claude, make a **new Project** named after them (Ahmed) and paste into its instructions.
3. In the project, copy its link, come back to the chat and tap **Save link**.

After that, **📞 Call** opens their project straight away. Tap the voice button in Claude to talk.

At the end of a call, say goodbye. They'll give you a recap that starts with "Call notes:". Copy it and tap **📋 Send call notes** in their chat, so the village remembers.

**Optional:** in the project, add `data/chat.json` and `library/` from GitHub under the project's files. Then they know what you've texted about and your school details.

## 5. Siri

Make one Shortcut per villager, named what you'll say, like **Talk to Ahmed**:

1. **Run Script** (Scriptable): Script *Souq Chat*, Parameter `ahmed`. Turn **Run In App** off.
2. **Speak Text**: *Script Result*. Tap the arrow to pick a different voice for each villager.
3. **Dictate Text.**
4. **Send Email**: To `i.am.richardmaier+ahmed@gmail.com`, Subject `Ahmed (Siri)`, Message *Dictated Text*. Turn **Show Compose Sheet** off.

Say **"Hey Siri, Talk to Ahmed."** Siri reads whatever Ahmed has said since you last heard from him, then listens for your answer. Your Siri messages show up in the widget chat too.

**Home-screen icon with their face:**
1. Open `VILLAGE_URL` + `assets/agents/ahmed/portrait.png` in Safari, long-press the image and Save to Photos.
2. In Shortcuts, long-press **Talk to Ahmed** → Share → **Add to Home Screen**, tap the icon and choose that photo.

## Good to know

- **Replies come at the next village run**, not instantly. Calls are the instant option. For faster texts, add more times to the scheduled task (see `HANDOFF.md` step 4). Each run uses some of your Claude plan.
- **Privacy:** `data/chat.json` is on the village site, like `data/state.js`. Its address is hard to guess, but anyone with the link could read your chats. Don't share the link.
- **Changing the voices:** `VOICES` at the top of the script sets each villager's speed, pitch and accent for 🔊 Listen.
