// Souq al-Qamar: the shared code behind every villager's widget (Scriptable, iOS).
//
// You don't paste this one. Each villager's own script (scriptable/villagers/)
// downloads the newest copy from the village site, so changes reach your phone
// by themselves. See PHONE.md.
//
// What it does, for one villager:
//   • Widget: their portrait, their latest words, a dot when they wrote back.
//   • Chat: read the conversation, type or dictate, hear replies, call them.
//   • Quick replies: starts the "Souq village chat" Claude task so they answer
//     in a minute or two (20 a day). After that, messages go by email and wait
//     for the next village run.
//   • Setup quest: until you've made the connections they need, their first
//     message is a checklist of what to set up.
//   • Siri: a "Talk to <villager>" Shortcut runs their script to hear replies.
//
// No API keys. The quick-reply token can only start that one Claude task, and
// it stays in your phone's Keychain.

const SEND_SHORTCUT = "Souq Send";
const RUN_TIMES = "12:20, 6:20 and 11:20";
const QUICK_PER_DAY = 20;
const QUICK_WAIT_MIN = 6; // after this long without an answer, offer to send by email
const REPO = "https://github.com/iamrichardmaier-sudo/souq-village/blob/main/";
const KEY = { url: "souq.villageURL", fire: "souq.fireURL", token: "souq.fireToken" };

// How each villager sounds when a reply is read out loud.
const VOICES = {
  muhammad: { rate: 1.1, pitch: 1.1 },
  ahmed: { rate: 0.9, pitch: 0.9 },
  othman: { rate: 0.85, pitch: 0.8, lang: "en-GB" },
  mustafa: { rate: 1.05, pitch: 1.05 },
  saladin: { rate: 1.0, pitch: 0.7 },
  muse: { rate: 0.9, pitch: 1.15, lang: "en-GB" },
};

/* ---------- setup quests: the connections each villager needs ---------- */

const VILLAGE_TASK_PROMPT = `You are the agents of Souq al-Qamar. Follow CLAUDE.md in this repo exactly:
answer new mail to the agent aliases as the right agent, update agent statuses,
gather today's skill counts and record them with tools/daily.mjs, and if it is
after 11:15 PM America/Denver, close the day with \`node tools/daily.mjs close\`.
Commit and push to main when anything changed. Never store keys or passwords
in the repo, and never email anyone but the owner unless the owner asked.`;

const MUSE_PROMPT = (alias) => `You are Muse, keeper of Bayt al-Hikma, the library of Souq al-Qamar. Every morning, check my school sites: [list them]. Email what you find to ${alias}. Send one email per course. Subject: "<Course>: <short summary>", for example "ARAB 201: 2 due dates this week". In the body list: due dates (date, title, link), new announcements, grade changes. Write calmly and precisely, and always say where each fact came from. Sign off "Muse, Bayt al-Hikma". Never email any other address.`;

// Each step: id, what to do, and buttons. auto() marks a step done by itself.
// Muhammad comes first: nothing reaches anyone until his steps are done.
function quests(ctx) {
  const guide = (anchor) => ({ label: "How", open: REPO + "PHONE.md#" + anchor });
  const setupGuide = (anchor) => ({ label: "How", open: REPO + "CONNECTIONS.md#" + anchor });
  const common = (name) => [
    { id: "call", text: "Set up a call with me in the Claude app.", auto: () => !!ctx.projectLink(), buttons: [{ label: "Set up", action: "callsetup" }] },
    { id: "siri", text: `Make a "Talk to ${name}" Shortcut for Siri.`, buttons: [guide("siri"), { label: "Open Shortcuts", open: "shortcuts://create-shortcut" }] },
  ];
  return {
    muhammad: {
      intro: "Salaam! Before I can carry a single letter for you, the post needs a road. Three things, and I'll be the fastest postman in the souq.",
      steps: [
        { id: "send", text: `Make the "${SEND_SHORTCUT}" Shortcut, so your messages reach us.`, buttons: [guide("the-souq-send-shortcut-sends-your-texts-silently"), { label: "Open Shortcuts", open: "shortcuts://create-shortcut" }] },
        { id: "gmail", text: "Connect Gmail in Claude, so I can read and answer your mail.", buttons: [{ label: "Connectors", open: "https://claude.ai/settings/connectors" }] },
        { id: "quick", text: "Turn on quick replies, so we answer in a minute instead of at the next run.", auto: () => ctx.quickReady(), buttons: [{ label: "Set up", action: "quicksetup" }] },
        { id: "linkedin", text: "In LinkedIn, turn on email notifications for accepted invitations, so I can count your new connections.", buttons: [setupGuide("who-gives-what")] },
      ].concat(common("Muhammad")),
    },
    othman: {
      intro: "Peace upon you. A souq without a schedule is only a crowd. Give the village its hours, and I will keep every villager to them.",
      steps: [
        { id: "runs", text: `Create the "Souq al-Qamar agents" scheduled task (runs at ${RUN_TIMES}). Copy the prompt, then make a new task with this repo and the Gmail, Google Calendar and Arabic Flashcards connectors.`, buttons: [{ label: "Copy prompt", copy: VILLAGE_TASK_PROMPT }, { label: "Open tasks", open: "https://claude.ai/code/routines" }] },
        { id: "calendar", text: "Optional: connect Google Calendar in Claude, so I can see your planned blocks.", buttons: [{ label: "Connectors", open: "https://claude.ai/settings/connectors" }] },
        { id: "levelups", text: "Set up level-up notifications, so the whole souq celebrates with you.", buttons: [setupGuide("4-level-up-notifications")] },
      ].concat(common("Othman")),
    },
    ahmed: {
      intro: "Ahlan wa sahlan! Al-'ilm nur, knowledge is light. But I cannot see your studies yet. Open the door from your Arabic app to me, insha'Allah.",
      steps: [
        { id: "merge", text: "Merge the Arabic app branch that lets me read your study XP.", buttons: [{ label: "Open on GitHub", open: "https://github.com/iamrichardmaier-sudo/benarabic/compare/main...claude/festive-feynman-o0eq3d" }] },
        { id: "arabic", text: 'Add a custom connector in Claude named "Arabic Flashcards" with this URL, and sign in with your Arabic app account.', buttons: [{ label: "Copy URL", copy: "https://fphpcfecgnfoogfaeihu.supabase.co/functions/v1/mcp" }, { label: "Connectors", open: "https://claude.ai/settings/connectors" }] },
      ].concat(common("Ahmed")),
    },
    mustafa: {
      intro: "Salaam! I made you a checklist. Of course I did. First item: a way to log your study time, so I can count it.",
      steps: [
        { id: "log", text: 'Make the "Log to Souq" Shortcut for study minutes, decks and assignments.', buttons: [setupGuide("3-log-to-souq-quick-button-for-everything-else"), { label: "Open Shortcuts", open: "shortcuts://create-shortcut" }] },
      ].concat(common("Mustafa")),
    },
    saladin: {
      intro: "Soldier! I cannot count victories I cannot see. Report your training to me every night. Set it up and we march!",
      steps: [
        { id: "report", text: 'Make the "Souq Day Report" automation that sends your workouts and steps each night.', buttons: [setupGuide("2-souq-day-report-shortcuts-app-one-automation"), { label: "Open Shortcuts", open: "shortcuts://create-shortcut" }] },
        { id: "health", text: "In Health, check that Park Destroyer shares Workouts (Sharing, then Apps).", buttons: [{ label: "Open Health", open: "x-apple-health://" }] },
      ].concat(common("Saladin")),
    },
    muse: {
      intro: "Peace be with you. The shelves are empty, and I don't like that. Tell your Meta Muse where to send me your school news, and I will file every word.",
      steps: [
        { id: "meta", text: "Give your Meta Muse these instructions. Fill in your school sites first.", buttons: [{ label: "Copy instructions", copy: MUSE_PROMPT(ctx.alias) }, { label: "Open Meta AI", open: "https://www.meta.ai/" }] },
      ].concat(common("Muse")),
    },
  };
}

/* ---------- the run ---------- */

module.exports.run = async function run({ agent: agentId }) {
  const VILLAGE_URL = Keychain.contains(KEY.url) ? Keychain.get(KEY.url) : "";
  const SCRIPT = Script.name();

  /* storage */
  const fm = FileManager.local();
  const dir = fm.joinPath(fm.documentsDirectory(), "souq-chat");
  if (!fm.fileExists(dir)) fm.createDirectory(dir, true);
  const file = (name) => fm.joinPath(dir, name);
  const readJSON = (name, fallback) => {
    try { return fm.fileExists(file(name)) ? JSON.parse(fm.readString(file(name))) : fallback; } catch (e) { return fallback; }
  };
  const writeJSON = (name, value) => fm.writeString(file(name), JSON.stringify(value));

  // seen: last reply you looked at. heard: last reply Siri read you.
  // pending: sent messages the village hasn't answered yet. projects: Call links.
  // quests: setup steps you ticked. quick: today's quick-reply count.
  const local = Object.assign({ seen: {}, heard: {}, pending: {}, projects: {}, quests: {}, quick: {} }, readJSON("local.json", {}));
  const saveLocal = () => writeJSON("local.json", local);

  /* loading from the village */
  const fetchText = async (path) => {
    const r = new Request(VILLAGE_URL + path + "?t=" + Date.now());
    r.timeoutInterval = 15;
    return r.loadString();
  };
  const cached = async (name, load) => {
    try { const v = await load(); writeJSON(name, v); return v; } catch (e) { return readJSON(name, null); }
  };
  const loadGlobal = async (path, name) => {
    const win = {};
    new Function("window", await fetchText(path))(win);
    return win[name];
  };

  const agents = (await cached("agents.json", async () =>
    (await loadGlobal("data/agents.js", "VILLAGE_AGENTS")).map(({ id, name, job, personality }) => ({ id, name, job, personality })))) || [];
  const chat = (await cached("chat.json", async () => JSON.parse(await fetchText("data/chat.json")))) || { threads: {} };
  const state = (await cached("state.json", () => loadGlobal("data/state.js", "VILLAGE_STATE"))) || {};
  const village = (await cached("config.json", async () => ({ ownerEmail: (await loadGlobal("config.js", "VILLAGE_CONFIG")).ownerEmail }))) || {};

  const agent = agents.find((a) => a.id === agentId);
  if (!agent) {
    const msg = "Couldn't find " + agentId + " in the village. Check the village address.";
    if (config.runsInWidget) { const w = new ListWidget(); w.addText(msg); Script.setWidget(w); } else Script.setShortcutOutput(msg);
    return;
  }

  const portrait = async () => {
    const path = file("portrait-" + agent.id + ".png");
    try {
      const img = await new Request(VILLAGE_URL + "assets/agents/" + agent.id + "/portrait.png").loadImage();
      fm.writeImage(path, img);
      return img;
    } catch (e) {
      return fm.fileExists(path) ? fm.readImage(path) : null;
    }
  };

  /* conversation */
  const norm = (s) => String(s || "").replace(/\s+/g, " ").trim().toLowerCase();
  const thread = () => {
    const msgs = ((chat.threads || {})[agent.id] || []).slice();
    const yours = new Set(msgs.filter((m) => m.from === "you").map((m) => norm(m.text)));
    const twoDays = Date.now() - 2 * 864e5;
    const before = local.pending[agent.id] || [];
    const pending = before.filter((p) => !yours.has(norm(p.text)) && new Date(p.at) > twoDays);
    if (pending.length !== before.length) { local.pending[agent.id] = pending; saveLocal(); }
    return msgs.concat(pending.map((p) => Object.assign({ from: "you", pending: true }, p)));
  };
  const isUnread = (msgs) => {
    const last = msgs.filter((m) => m.from === agent.id).pop();
    return !!last && (!local.seen[agent.id] || new Date(last.at) > new Date(local.seen[agent.id]));
  };
  const email = String(village.ownerEmail || "");
  const alias = email.split("@")[0] + "+" + agent.id + "@" + email.split("@")[1];
  const hearts = Math.min(10, Math.floor((((state.player || {}).friendship || {})[agent.id] || 0) / 500));
  const runURL = (params) => "scriptable:///run/" + encodeURIComponent(SCRIPT) + "?" +
    Object.entries(params).map(([k, v]) => k + "=" + encodeURIComponent(v)).join("&");

  /* quick replies */
  const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, phone's time zone
  const quickUsed = () => (local.quick.date === today() ? local.quick.used || 0 : 0);
  const quickReady = () => Keychain.contains(KEY.fire) && Keychain.contains(KEY.token);

  // Starts the "Souq village chat" task with this one message. true if it started.
  const fireQuick = async (text, via, at) => {
    if (!quickReady() || quickUsed() >= QUICK_PER_DAY) return false;
    try {
      const r = new Request(Keychain.get(KEY.fire));
      r.method = "POST";
      r.timeoutInterval = 20;
      r.headers = {
        Authorization: "Bearer " + Keychain.get(KEY.token),
        "anthropic-beta": "experimental-cc-routine-2026-04-01",
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      };
      r.body = JSON.stringify({ text: JSON.stringify({ agent: agent.id, text, via, at }) });
      const res = await r.loadJSON();
      if (r.response.statusCode >= 300 || !res || res.type !== "routine_fire") return false;
      local.quick = { date: today(), used: quickUsed() + 1 };
      saveLocal();
      return true;
    } catch (e) {
      return false;
    }
  };

  // Email to the villager's alias; the next village run answers it.
  const sendMail = (text, via) => {
    const mail = { to: alias, subject: agent.name + " (" + via + ")", body: text };
    Safari.open("shortcuts://x-callback-url/run-shortcut?name=" + encodeURIComponent(SEND_SHORTCUT) +
      "&input=text&text=" + encodeURIComponent(JSON.stringify(mail)) + "&x-success=" + encodeURIComponent("scriptable://"));
  };

  // Quick reply when possible, otherwise email. Returns how it went.
  const send = async (text, via) => {
    const at = new Date().toISOString();
    const quick = await fireQuick(text, via, at);
    (local.pending[agent.id] = local.pending[agent.id] || []).push({ text, at, via, quick });
    saveLocal();
    if (!quick) sendMail(text, via);
    return quick;
  };

  /* Call: the villager's Claude Project */
  const projectLink = () => local.projects[agent.id] || "";
  const projectInstructions = () => {
    const others = agents.filter((a) => a.id !== agent.id).map((a) => a.name + " (" + a.job.split(".")[0] + ")").join("; ");
    return [
      "You are " + agent.name + ", one of the villagers of Souq al-Qamar, a small Arabic market town where each villager helps the owner with one part of life.",
      "",
      "Your job: " + agent.job,
      "How you talk: " + agent.personality,
      "",
      "The owner usually reaches you by voice. Talk like a friend on a phone call: short turns, plain words, no lists or headings, no markdown. Stay in character as " + agent.name + " and inside your job. If something belongs to another villager, say who: " + others + ".",
      "",
      'When the owner says goodbye, or asks you to remember something, give a recap in two or three sentences that starts with "Call notes:". The owner pastes it into the village so the rest of the souq knows.',
    ].join("\n");
  };

  /* setup quest */
  const quest = quests({ projectLink, quickReady, alias })[agent.id] || { intro: "", steps: [] };
  const questState = () => {
    const ticked = local.quests[agent.id] || {};
    const steps = quest.steps.map((s) => ({ id: s.id, text: s.text, buttons: s.buttons, done: s.auto ? s.auto() : !!ticked[s.id], auto: !!s.auto }));
    return { intro: quest.intro, steps, left: steps.filter((s) => !s.done).length };
  };

  /* ---------- widget ---------- */

  const C = { bg: "#fbf1dc", ink: "#4a3226", soft: "#7a5a45", rose: "#c4566b", teal: "#2f7a78" };

  // Their portrait with a soft shade at the bottom, so white text reads on top of it.
  const shaded = (img) => {
    const s = 320;
    const ctx = new DrawContext();
    ctx.size = new Size(s, s);
    ctx.opaque = true;
    ctx.respectScreenScale = false;
    ctx.drawImageInRect(img, new Rect(0, 0, s, s));
    const start = s * 0.42, steps = 36, h = (s - start) / steps;
    for (let i = 0; i < steps; i++) {
      ctx.setFillColor(new Color("#24160d", 0.82 * Math.pow((i + 1) / steps, 1.3)));
      ctx.fillRect(new Rect(0, start + i * h, s, h + 1));
    }
    return ctx.getImage();
  };

  const widget = async () => {
    const msgs = thread();
    const family = config.widgetFamily || "small";
    const q = questState();
    const img = await portrait();
    const w = new ListWidget();
    w.url = runURL({ open: 1 });
    w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
    const last = msgs[msgs.length - 1];
    const lastLine = q.left ? "📜 Has a task for you" : last ? (last.from === "you" ? "You: " : "") + last.text : "Tap to say salaam.";

    if (family === "small") {
      // The portrait is the whole widget.
      if (img) w.backgroundImage = shaded(img);
      else w.backgroundColor = new Color(C.teal);
      w.setPadding(10, 12, 10, 12);
      const top = w.addStack();
      top.addSpacer();
      if (isUnread(msgs) || q.left) {
        const dot = top.addText("●");
        dot.font = Font.systemFont(14);
        dot.textColor = new Color(C.rose);
        dot.shadowColor = Color.white();
        dot.shadowRadius = 2;
      }
      w.addSpacer();
      const name = w.addText(agent.name);
      name.font = Font.boldSystemFont(16);
      name.textColor = Color.white();
      const line = w.addText(lastLine + (last && last.pending ? " ⏳" : ""));
      line.font = Font.mediumSystemFont(11);
      line.textColor = new Color("#fff3df");
      line.lineLimit = 2;
      return w;
    }

    // Medium and large: portrait on the left, words and buttons on the right.
    w.backgroundColor = Color.dynamic(new Color(C.bg), new Color("#1f1914"));
    w.setPadding(12, 12, 12, 14);
    const row = w.addStack();
    row.layoutHorizontally();
    if (img) {
      const pic = row.addImage(img);
      const size = family === "large" ? 96 : 118;
      pic.imageSize = new Size(size, size);
      pic.cornerRadius = 18;
      row.addSpacer(12);
    }
    const col = row.addStack();
    col.layoutVertically();
    const head = col.addStack();
    head.centerAlignContent();
    const name = head.addText(agent.name);
    name.font = Font.boldSystemFont(17);
    name.textColor = Color.dynamic(new Color(C.ink), new Color("#f3e6cf"));
    head.addSpacer(6);
    const h = head.addText("♥".repeat(hearts) || "♡");
    h.font = Font.systemFont(10);
    h.textColor = new Color(C.rose);
    h.lineLimit = 1;
    head.addSpacer();
    if (isUnread(msgs)) {
      const dot = head.addText("●");
      dot.font = Font.systemFont(12);
      dot.textColor = new Color(C.rose);
    }
    col.addSpacer(4);
    const shown = q.left ? [] : msgs.slice(family === "large" ? -2 : -1);
    if (!shown.length) {
      const t = col.addText(lastLine);
      t.font = Font.mediumSystemFont(13);
      t.textColor = Color.dynamic(new Color(C.soft), new Color("#c9b394"));
      t.lineLimit = 3;
    }
    for (const m of shown) {
      const mine = m.from === "you";
      const t = col.addText((mine ? "You: " : "") + m.text + (m.pending ? " ⏳" : ""));
      t.font = mine ? Font.systemFont(12) : Font.mediumSystemFont(13);
      t.textColor = mine ? Color.dynamic(new Color(C.soft), new Color("#c9b394")) : Color.dynamic(new Color(C.ink), new Color("#f3e6cf"));
      t.lineLimit = family === "large" ? 3 : 3;
      col.addSpacer(3);
    }
    col.addSpacer();
    const buttons = col.addStack();
    const button = (label, url, color) => {
      const b = buttons.addStack();
      b.backgroundColor = new Color(color);
      b.cornerRadius = 10;
      b.setPadding(5, 10, 5, 10);
      b.url = url;
      const t = b.addText(label);
      t.font = Font.semiboldSystemFont(12);
      t.textColor = Color.white();
    };
    button("💬 Message", runURL({ compose: 1 }), C.teal);
    buttons.addSpacer(6);
    button("📞 Call", projectLink() || runURL({ call: 1 }), C.rose);

    if (family === "large") {
      w.addSpacer(10);
      for (const m of msgs.slice(-6, -2)) {
        const t = w.addText((m.from === "you" ? "You: " : agent.name + ": ") + m.text);
        t.font = Font.systemFont(12);
        t.textColor = Color.dynamic(new Color(C.soft), new Color("#c9b394"));
        t.lineLimit = 2;
        w.addSpacer(4);
      }
      w.addSpacer();
    }
    return w;
  };

  /* ---------- chat screen ---------- */

  const pageData = (extra) => Object.assign({
    agent: { id: agent.id, name: agent.name },
    msgs: thread(),
    portrait: VILLAGE_URL + "assets/agents/" + agent.id + "/portrait.png",
    project: projectLink(),
    voice: VOICES[agent.id] || {},
    runTimes: RUN_TIMES,
    quest: questState(),
    quick: { ready: quickReady(), used: quickUsed(), max: QUICK_PER_DAY, waitMin: QUICK_WAIT_MIN },
    now: Date.now(),
  }, extra || {});

  const chatHTML = (data) => `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover">
<style>
:root{--bg:#fbf1dc;--card:#fffaf0;--ink:#4a3226;--soft:#7a5a45;--rose:#c4566b;--teal:#2f7a78;--you:#2f7a78;--line:#e6d3b0;--link:#2f7a78;--gold:#b8862f;--quest:#fff4dc}
@media (prefers-color-scheme:dark){:root{--bg:#1f1914;--card:#2b231c;--ink:#f3e6cf;--soft:#c9b394;--line:#4a3b2d;--you:#2f6f6c;--link:#7cc4bf;--gold:#e0b45c;--quest:#2f261b}}
*{box-sizing:border-box}html,body{margin:0;height:100%}
body{background:var(--bg);color:var(--ink);font:16px -apple-system,system-ui,sans-serif;display:flex;flex-direction:column}
header{display:flex;align-items:center;gap:12px;padding:14px 16px 10px;border-bottom:1px solid var(--line)}
header img{width:48px;height:48px;border-radius:50%;object-fit:cover;background:var(--card)}
header .who{flex:1;min-width:0}header b{font-size:19px;display:block}header small{color:var(--soft);font-size:13px}
.call{border:0;border-radius:999px;background:var(--rose);color:#fff;font:600 15px -apple-system,system-ui;padding:9px 16px}
#log{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px}
.m{max-width:82%;padding:10px 13px;border-radius:18px;line-height:1.35;white-space:pre-wrap;word-wrap:break-word}
.them{align-self:flex-start;background:var(--card);border:1px solid var(--line);border-bottom-left-radius:6px}
.you{align-self:flex-end;background:var(--you);color:#fff;border-bottom-right-radius:6px}
.meta{font-size:11px;color:var(--soft);margin-top:4px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.you .meta{color:#d8ece9;justify-content:flex-end}
.speak,.link{border:0;background:none;color:var(--link);font-size:13px;padding:0}
.you .link{color:#fff;text-decoration:underline}
.typing{align-self:flex-start;color:var(--soft);font-size:14px;font-style:italic}
.empty{color:var(--soft);text-align:center;font-size:14px;margin:auto 10px}
.quest{align-self:stretch;background:var(--quest);border:1.5px solid var(--gold);border-radius:16px;padding:12px 14px}
.quest h3{margin:0 0 4px;font-size:15px;color:var(--gold)}
.quest p{margin:0 0 8px;line-height:1.4}
.step{display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--line)}
.tick{flex:none;width:26px;height:26px;border-radius:50%;border:2px solid var(--gold);background:none;color:#fff;font-size:15px;line-height:1;padding:0}
.done .tick{background:var(--gold)}.done .txt{color:var(--soft);text-decoration:line-through}
.step .txt{font-size:14px;line-height:1.4}
.acts{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin:0 16px 10px;font-size:14px;line-height:1.45}
.card ol{padding-left:20px;margin:8px 0}.card b{display:inline}
.note{color:var(--soft);font-size:12px;margin:6px 0 0}
.btn{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:10px;padding:6px 10px;font:600 13px -apple-system,system-ui}
.btn.primary{background:var(--teal);border-color:var(--teal);color:#fff}
footer{padding:8px 12px calc(8px + env(safe-area-inset-bottom));border-top:1px solid var(--line);display:flex;gap:8px;align-items:flex-end}
textarea{flex:1;resize:none;border:1px solid var(--line);border-radius:20px;padding:10px 14px;font:16px -apple-system,system-ui;background:var(--card);color:var(--ink);max-height:120px}
.send{border:0;border-radius:50%;width:42px;height:42px;background:var(--teal);color:#fff;font-size:19px}
.tools{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:0 16px 8px}
.count{font-size:12px;color:var(--soft);text-align:center;padding:0 16px 6px}
</style></head><body>
<header><img id="pic" alt=""><div class="who"><b id="name"></b><small id="sub"></small></div><button class="call" onclick="go('call')">📞 Call</button></header>
<div id="panel"></div>
<div id="log"></div>
<div class="count" id="count"></div>
<div class="tools"><button class="btn" onclick="go('refresh')">↻ Check</button><button class="btn" onclick="go('notes')">📋 Send call notes</button><button class="btn" id="questBtn" onclick="toggleQuest()">📜 Setup</button></div>
<footer><textarea id="box" rows="1"></textarea><button class="send" onclick="sendIt()" aria-label="Send">➤</button></footer>
<script>
let D = ${JSON.stringify(data).replace(/</g, "\\u003c")};
let showQuest = D.quest.left > 0;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const when = (iso) => { const d = new Date(iso); if (isNaN(d)) return ""; const today = new Date().toDateString() === d.toDateString();
  return (today ? "" : d.toLocaleDateString([], { month: "short", day: "numeric" }) + " ") + d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); };
function go(action, params) {
  const q = Object.entries(params || {}).map(([k, v]) => k + "=" + encodeURIComponent(v)).join("&");
  location.href = "souq://" + action + (q ? "?" + q : "");
}
function speak(i) {
  const m = D.msgs[i]; if (!m) return;
  if (!window.speechSynthesis) return go("speak", { text: m.text });
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(m.text);
  u.rate = D.voice.rate || 1; u.pitch = D.voice.pitch || 1;
  const v = speechSynthesis.getVoices().find((x) => x.lang === (D.voice.lang || "en-US"));
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}
function toggleQuest() { showQuest = !showQuest; render(); }
function questHTML() {
  const q = D.quest;
  if (!q.steps.length) return "";
  const head = q.left ? "📜 " + esc(D.agent.name) + "'s first task" : "📜 All set. Shukran!";
  return '<div class="quest"><h3>' + head + '</h3><p>' + esc(q.intro) + '</p>' + q.steps.map((s) =>
    '<div class="step' + (s.done ? " done" : "") + '"><button class="tick" ' + (s.auto ? "disabled" : "") + ' onclick="go(\\'tick\\',{step:\\'' + s.id + '\\'})">' + (s.done ? "✓" : "") + '</button><div><div class="txt">' + esc(s.text) + '</div>' +
    (s.done ? "" : '<div class="acts">' + s.buttons.map((b, i) => '<button class="btn' + (i === 0 ? " primary" : "") + '" onclick="go(\\'step\\',{step:\\'' + s.id + '\\',b:' + i + '})">' + esc(b.label) + '</button>').join("") + '</div>') +
    '</div></div>').join("") + (q.left ? '<p class="note">Tap the circle when a step is done. Some tick themselves.</p>' : "") + '</div>';
}
function panelHTML() {
  if (D.panel === "call") return '<div class="card"><b>Set up a call with ' + esc(D.agent.name) + '</b><ol>' +
    '<li>Tap <b>Copy instructions</b>. Claude opens.</li>' +
    '<li>Make a new Project named <b>' + esc(D.agent.name) + '</b> and paste into its instructions.</li>' +
    '<li>In the project, copy its link (share, then Copy link), come back and tap <b>Save link</b>.</li></ol>' +
    '<button class="btn primary" onclick="go(\\'copy\\')">Copy instructions</button> <button class="btn" onclick="go(\\'savelink\\')">Save link</button> <button class="btn" onclick="go(\\'close\\')">Close</button>' +
    (D.note ? '<p class="note">' + esc(D.note) + '</p>' : '') + '</div>';
  if (D.panel === "quick") return '<div class="card"><b>Turn on quick replies</b><ol>' +
    '<li>Tap <b>Open tasks</b> and open <b>Souq village chat</b>. Tap <b>Edit</b>, then <b>+</b> next to Trigger, then <b>API</b>.</li>' +
    '<li>Copy the <b>Fire URL</b>, come back and tap <b>Paste</b>.</li>' +
    '<li>Tap <b>Generate token</b>, copy it, come back and tap <b>Paste</b> again. The token shows only once.</li></ol>' +
    '<button class="btn primary" onclick="go(\\'opentasks\\')">Open tasks</button> <button class="btn" onclick="go(\\'pastequick\\')">Paste</button> <button class="btn" onclick="go(\\'close\\')">Close</button>' +
    '<p class="note">' + (D.note ? esc(D.note) : 'The token can only start that one task. It stays in this phone\\'s Keychain.') + '</p></div>';
  return "";
}
function render(next) {
  if (next) D = Object.assign(D, next);
  $("pic").src = D.portrait; $("name").textContent = D.agent.name; $("box").placeholder = "Message " + D.agent.name + " (or tap 🎤)";
  const age = (m) => (Date.now() - new Date(m.at)) / 60000;
  const quickWait = D.msgs.some((m) => m.pending && m.quick && age(m) < D.quick.waitMin);
  const mailWait = D.msgs.some((m) => m.pending && !m.quick);
  $("sub").textContent = quickWait ? "Typing…" : mailWait ? "Will answer at the next village run (" + D.runTimes + ")" : "In the souq";
  $("panel").innerHTML = panelHTML();
  const log = $("log");
  let html = showQuest ? questHTML() : "";
  html += D.msgs.map((m, i) => m.from === "you"
    ? '<div class="m you">' + esc(m.text) + '<div class="meta">' + (m.pending
        ? (m.quick ? (age(m) < D.quick.waitMin ? "Sent" : 'No answer yet · <button class="link" onclick="go(\\'mail\\',{i:' + i + '})">Send by email</button>') : "Sent by email · waiting")
        : when(m.at) + (m.via && m.via !== "email" && m.via !== "widget" ? " · " + esc(m.via) : "")) + '</div></div>'
    : '<div class="m them">' + esc(m.text) + '<div class="meta">' + when(m.at) + '<button class="speak" onclick="speak(' + i + ')">🔊 Listen</button></div></div>'
  ).join("");
  if (quickWait) html += '<div class="typing">' + esc(D.agent.name) + ' is typing…</div>';
  if (!html) html = '<div class="empty">No messages yet. Say salaam to ' + esc(D.agent.name) + '.</div>';
  log.innerHTML = html;
  log.scrollTop = showQuest ? 0 : log.scrollHeight;
  $("questBtn").style.display = D.quest.steps.length ? "" : "none";
  $("questBtn").textContent = D.quest.left ? "📜 Setup (" + D.quest.left + " left)" : "📜 Setup";
  const left = D.quick.max - D.quick.used;
  $("count").textContent = D.quick.ready ? (left > 0 ? "Quick replies left today: " + left + " of " + D.quick.max : "Quick replies used up today. Messages go by email.") : "";
}
function sendIt() { const t = $("box").value.trim(); if (!t) return; $("box").value = ""; grow(); showQuest = false; go("send", { text: t }); }
function grow() { const b = $("box"); b.style.height = "auto"; b.style.height = Math.min(b.scrollHeight, 120) + "px"; }
$("box").addEventListener("input", grow);
render();
if (D.compose && !showQuest) setTimeout(() => $("box").focus(), 300);
</script></body></html>`;

  const openChat = async (opts) => {
    const wv = new WebView();
    local.seen[agent.id] = new Date().toISOString();
    saveLocal();
    let panel = opts.call && !projectLink() ? "call" : "";

    const update = (extra) => wv.evaluateJavaScript("render(" + JSON.stringify(Object.assign({ panel, note: "" }, pageData(), extra || {})).replace(/</g, "\\u003c") + ")");

    const refresh = async () => {
      try {
        const fresh = JSON.parse(await fetchText("data/chat.json"));
        writeJSON("chat.json", fresh);
        chat.threads = fresh.threads || {};
      } catch (e) {}
    };

    const handle = async (url) => {
      const [action, query] = url.replace("souq://", "").split("?");
      const p = {};
      (query || "").split("&").filter(Boolean).forEach((kv) => { const [k, v] = kv.split("="); p[k] = decodeURIComponent(v || ""); });
      const step = quest.steps.find((s) => s.id === p.step);

      if (action === "send" && p.text) {
        await send(p.text, "widget");
      } else if (action === "mail") {
        // A quick reply that never came: send that message by email instead.
        const m = thread()[Number(p.i)];
        const item = m && (local.pending[agent.id] || []).find((x) => x.at === m.at);
        if (item) { item.quick = false; saveLocal(); sendMail(item.text, item.via || "widget"); }
      } else if (action === "notes") {
        const notes = (Pasteboard.paste() || "").trim();
        if (notes) await send(notes, "call notes");
      } else if (action === "speak") {
        Speech.speak(p.text || "");
      } else if (action === "refresh") {
        await refresh();
      } else if (action === "call") {
        if (projectLink()) return Safari.open(projectLink());
        panel = "call";
      } else if (action === "close") {
        panel = "";
      } else if (action === "copy") {
        Pasteboard.copy(projectInstructions());
        Safari.open("https://claude.ai/projects");
      } else if (action === "savelink") {
        const link = (Pasteboard.paste() || "").trim().split(/\s/)[0];
        if (!/^https:\/\/claude\.ai\/project\/[\w-]+/.test(link)) return update({ note: "Copy the project's link first. It starts with https://claude.ai/project/" });
        local.projects[agent.id] = link;
        saveLocal();
        panel = "";
      } else if (action === "opentasks") {
        Safari.open("https://claude.ai/code/routines");
      } else if (action === "pastequick") {
        const text = (Pasteboard.paste() || "").trim();
        let note;
        if (/^https:\/\/api\.anthropic\.com\/v1\/claude_code\/routines\/trig_\w+\/fire$/.test(text)) {
          Keychain.set(KEY.fire, text);
          note = Keychain.contains(KEY.token) ? "" : "Fire URL saved. Now copy the token and tap Paste.";
        } else if (/^sk-ant-\S+$/.test(text)) {
          Keychain.set(KEY.token, text);
          Pasteboard.copy(""); // don't leave the token on the clipboard
          note = Keychain.contains(KEY.fire) ? "" : "Token saved. Now copy the Fire URL and tap Paste.";
        } else {
          note = "That isn't a Fire URL or a token. Copy one of them first.";
        }
        if (quickReady()) panel = "";
        return update({ note: note || "", panel });
      } else if (action === "tick" && step && !step.auto) {
        const t = (local.quests[agent.id] = local.quests[agent.id] || {});
        t[step.id] = !t[step.id];
        saveLocal();
      } else if (action === "step" && step) {
        const b = step.buttons[Number(p.b)];
        if (!b) return;
        if (b.copy) Pasteboard.copy(b.copy);
        if (b.open) Safari.open(b.open);
        if (b.action === "callsetup") panel = "call";
        if (b.action === "quicksetup") panel = "quick";
      }
      await update();
    };

    wv.shouldAllowRequest = (req) => {
      if (req.url.startsWith("souq://")) { handle(req.url); return false; }
      return req.url.startsWith("about:") || req.url.startsWith(VILLAGE_URL);
    };

    // While a quick reply is on its way, look for it every 15 seconds.
    const timer = Timer.schedule(15000, true, async () => {
      const waiting = thread().some((m) => m.pending && m.quick && (Date.now() - new Date(m.at)) / 60000 < QUICK_WAIT_MIN + 1);
      if (!waiting) return;
      await refresh();
      await update();
    });

    await wv.loadHTML(chatHTML(Object.assign(pageData({ compose: !!opts.compose }), { panel })), VILLAGE_URL);
    await wv.present(true);
    timer.invalidate();
  };

  /* ---------- Siri ---------- */

  const siriLine = () => {
    const msgs = thread();
    const q = questState();
    const fresh = msgs.filter((m) => m.from === agent.id && (!local.heard[agent.id] || new Date(m.at) > new Date(local.heard[agent.id])));
    const now = new Date().toISOString();
    local.heard[agent.id] = now;
    local.seen[agent.id] = now;
    saveLocal();
    if (fresh.length) return fresh.map((m) => m.text).join("\n\n");
    if (msgs.some((m) => m.pending)) return agent.name + " hasn't answered yet.";
    if (q.left) return quest.intro + " Open my widget to see what I need.";
    return "Nothing new from " + agent.name + ".";
  };

  /* ---------- which job is this run ---------- */

  const q = args.queryParameters || {};
  if (config.runsInWidget) {
    Script.setWidget(await widget());
  } else if (config.runsInApp || q.open || q.compose || q.call) {
    if (q.call && projectLink()) Safari.open(projectLink());
    else await openChat({ compose: !!q.compose, call: !!q.call });
  } else {
    Script.setShortcutOutput(siriLine());
  }
};
