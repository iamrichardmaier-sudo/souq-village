# WhatsApp and phone calls

`PHONE.md` covers what's already built and free:
- texting each villager from their widget, with quick replies;
- hearing their answers in their own voice (🔊 Listen);
- live voice calls through a Claude Project per villager;
- "Talk to Ahmed" through Siri.

This page covers the options beyond that.

## A WhatsApp chat for each villager

**Option A: through Muse (free, works now, answered at the next village run)**
- In the village, each villager's **WhatsApp** button opens a chat that starts with their name ("Ahmed: …").
- Set `whatsappNumber` in `config.js` to the WhatsApp chat of your Meta AI / Muse assistant. Tell Muse once: *"When I write a message that starts with one of my villagers' names, email it to i.am.richardmaier+<that name in lowercase>@gmail.com with my message as the subject."*
- The village treats those emails as messages to that villager (`AGENTS.md`). Replies show up in their widget chat and by email.
- **Catch:** this depends on Muse reliably sending the emails. Test it with one message first.

**Option B: a separate WhatsApp contact per villager, answering instantly (not free, needs one stored key)**
1. **Meta's WhatsApp Business Platform**, with one business phone number per villager, or one number that sorts messages by name.
2. **A small webhook** that receives your messages. It could be a free Supabase edge function in your Arabic app's project.
3. **An AI the webhook can call right away.** That means a paid API (for example the Claude API), with its key kept as a Supabase secret, never in this repo.
4. **Meta's pricing per conversation.** It changes often, so check it before you start.

When it's set up, put each villager's number in `whatsapp` in `data/agents.js`. Their WhatsApp button then opens that contact directly.

## Real phone calls

Calls through a Claude Project (`PHONE.md`) are free, but they happen inside the Claude app. For a real phone number you can dial, with a different voice for each villager, you need:
- a voice-agent service, such as ElevenLabs Agents, Vapi or Retell;
- a phone number, from that service or Twilio;
- an AI model behind it.

All of these are paid accounts with keys.

## Voice messages from villagers

The village can turn a villager's words into an audio clip with Higgsfield's text-to-speech, through the Higgsfield connector, so no key is stored. Each clip costs credits, so save it for special moments: Othman's morning briefing, Saladin cheering after a workout, or a level-up.

## Recommendation

Use what's built (`PHONE.md`) together with **Option A**. Only move to **B** or real phone calls if instant WhatsApp replies or dialing a number are worth a monthly cost and one stored key.
