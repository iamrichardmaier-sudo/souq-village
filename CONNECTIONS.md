# Where XP comes from

Everything you do is counted during the day. At the end of the day it turns into **skill XP** (15 levels per skill) and **friendship** (10 hearts per person). The exact numbers live in `data/progression.js`.

**The scale:**
- **Skills:** a strong day is about 100 skill XP. Level 1 takes a few days, level 5 about two months, level 10 most of a year, and level 15 about a year and a half.
- **Hearts:** each heart is 500 points, and each person gives at most 40 points a day. A full 10 hearts takes at least four months.
- **Cooling off:** after a week of nothing, a friendship cools by 2 points a day, but you never lose a heart you've already earned.

There are **three ways numbers get in**, and none of them stores an API key:

1. **The agents' scheduled Claude task** reads them with your claude.ai connectors (Gmail, and the Arabic app's own connector). This runs on your Claude subscription.
2. **The "Souq Day Report" Shortcut** on your iPhone. Every night it emails a few numbers from Apple Health and Reminders to `i.am.richardmaier+report@gmail.com`.
3. **The "Log to Souq" Shortcut** for anything else. Tap it, pick what you did, type a number, and it sends one line to the same address.

## Who gives what

| Person | Skill | Counts | How it's measured | Setup |
|---|---|---|---|---|
| **Ahmed** | Arabic 📖 | XP in your Arabic app; keeping your streak | The Arabic app's MCP server now has `get_study_xp` (your XP per study day). You sign in with your own account (OAuth), so no key is stored. | Merge the benarabic branch, then add the connector (step 1 below). |
| **Muhammad** | Business ✉️ | Emails sent; inbox items handled; ending the day at inbox zero | Gmail connector: counts `in:sent` for today, and compares today's inbox size with yesterday's | Connect Gmail in claude.ai |
| | | New LinkedIn connections | LinkedIn emails you when someone accepts your invitation; Muhammad counts those emails | LinkedIn → Settings → Notifications → turn on email for "Invitations accepted" |
| | | LinkedIn messages | LinkedIn has no feed of messages you send. Its "new message" emails count replies you get. For messages you send, use **Log to Souq** | — |
| **Mustafa** | Scholarship 🎓 | Assignments turned in (bonus if early); focused study minutes; decks and card sets built | Muse's digest says when an assignment shows as submitted; study minutes and decks come from **Log to Souq**. Decks Mustafa builds for you count automatically | — |
| **Saladin** | Strength ⚔️ | Workouts; exercise minutes; 10,000-step days | Apple Health, through the nightly **Souq Day Report**. Park Destroyer counts as long as it saves workouts to Apple Health | Check that Health → Sharing → Apps lists Park Destroyer with Workouts on |
| **Othman** | Leadership 👑 | Tasks checked off; your weekly plan; planned blocks you showed up for | Apple Reminders completed today (Day Report); the weekly plan is an email thread with Othman; planned blocks come from your calendar if you connect Google Calendar | Optional: connect Google Calendar in claude.ai |
| **Muse** | Wisdom 🦉 | Minutes of reading; reading Muse's school digest | **Log to Souq** for reading; the digest counts when you open or answer it in Gmail | — |

For future agents, the same pattern fits:
- **Khalil the baker:** meals and groceries, from Health's nutrition entries or a food app that writes to Health.
- **Yasmin the merchant:** money, from your bank's daily balance email.
- **Samir the timekeeper:** calendar, from Google Calendar.
- **Hakima the healer:** sleep and mindfulness minutes, from Apple Health.

## Setup steps

### 1. Connect your Arabic app to Claude (Ahmed)
1. Merge the `claude/festive-feynman-o0eq3d` branch of `benarabic` into `main`. It adds the `get_study_xp` tool. Lovable redeploys the `mcp` function.
2. In claude.ai, go to **Settings → Connectors → Add custom connector**. Name it "Arabic Flashcards". The URL is `https://fphpcfecgnfoogfaeihu.supabase.co/functions/v1/mcp`.
3. Sign in with your Arabic app account when it asks.

### 2. Souq Day Report (Shortcuts app, one automation)
Make a new Shortcut named **Souq Day Report** with these actions:
1. **Find Health Samples** where Type is *Workouts* and Start Date is *Today* → **Count** → set variable `workouts`.
2. **Find Health Samples** where Type is *Exercise Minutes* and Start Date is *Today* → **Calculate Statistics: Sum** → set variable `minutes`.
3. **Find Health Samples** where Type is *Steps* and Start Date is *Today* → **Calculate Statistics: Sum** → set variable `steps`.
4. **Find Reminders** where *Is Completed* is true and *Completion Date* is *Today* → **Count** → set variable `tasks`.
5. **Text:**
   ```
   workouts=[workouts]
   workout_minutes=[minutes]
   steps=[steps]
   tasks_done=[tasks]
   ```
6. **Send Email** to `i.am.richardmaier+report@gmail.com`, Subject `Souq day report`, Body = the Text. Turn **Show Compose Sheet** off.

Then go to **Automation → New → Time of Day → 10:30 PM, Daily, Run Immediately**, with the action **Run Shortcut → Souq Day Report**.

### 3. Log to Souq (quick button for everything else)
Make a Shortcut named **Log to Souq** with these actions:
1. **Choose from Menu** with these items. Each menu item sets a Text variable `key` to the value after the arrow:
   - Reading minutes → `reading_minutes`
   - Study minutes → `study_minutes`
   - Assignment turned in → `assignments_done`
   - Assignment turned in early → `assignments_early`
   - Deck or card set built → `decks_built`
   - LinkedIn messages sent → `linkedin_messages`
   - Weekly plan done → `weekly_review`
2. **Ask for Input** (Number): "How many?"
3. **Send Email** to `i.am.richardmaier+report@gmail.com`, Subject `Souq log`, Body `[key]+=[Provided Input]`, with Show Compose Sheet off.

Add it to your home screen, or say "Hey Siri, Log to Souq."

### 4. Level-up notifications
Use `scriptable/LevelUpNotify.js`; the setup is at the top of the file. Every night at 11:55 PM it checks the village. For each new level or heart, your phone shows a notification like **"⚔️ Level up! Strength 4"**. Tapping it opens the village.
