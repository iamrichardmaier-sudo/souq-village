// Souq al-Qamar: chat with an agent from your home screen (Scriptable, iOS).
//
// One script does three jobs:
//   • Widget: the agent's portrait, their latest words, and a dot when they wrote back.
//   • Chat: tap the widget to read the conversation, type or dictate a message,
//     hear replies out loud, and tap Call to talk to them live in the Claude app.
//   • Siri: a "Talk to <agent>" Shortcut runs this script to read you their reply.
//
// No API keys. Your message goes out as an email to the agent's alias
// (you+ahmed@gmail.com), the scheduled Claude run answers it, writes the
// answer into data/chat.json, and this script reads it from the village site.
//
// Setup is in PHONE.md in the repo. In short:
//   1. Paste this into a new Scriptable script named exactly "Souq Chat".
//   2. Set VILLAGE_URL below.
//   3. Make the "Souq Send" Shortcut (PHONE.md, step 2).
//   4. Add a Scriptable widget, pick "Souq Chat", Parameter = the agent's id (ahmed).

const VILLAGE_URL = "https://YOUR-SITE.netlify.app/"; // where the village is hosted (ends with /)
const SCRIPT_NAME = "Souq Chat"; // must match this script's name in Scriptable
const SEND_WITH = "shortcut"; // "shortcut" sends silently through the Souq Send Shortcut; "mail" opens a compose sheet
const SEND_SHORTCUT = "Souq Send";
const RUN_TIMES = "12:20, 6:20 and 11:20"; // when the village runs, for the "waiting" note

// Optional: each agent's Claude Project link, for the Call button. You can also
// leave these empty and save the link from the chat screen (tap Call).
const PROJECTS = {
  // ahmed: "https://claude.ai/project/…",
};

// How each agent sounds when the chat reads a reply out loud.
const VOICES = {
  muhammad: { rate: 1.1, pitch: 1.1 },
  ahmed: { rate: 0.9, pitch: 0.9 },
  othman: { rate: 0.85, pitch: 0.8, lang: "en-GB" },
  mustafa: { rate: 1.05, pitch: 1.05 },
  saladin: { rate: 1.0, pitch: 0.7 },
  muse: { rate: 0.9, pitch: 1.15, lang: "en-GB" },
};

/* ---------- storage ---------- */

const fm = FileManager.local();
const dir = fm.joinPath(fm.documentsDirectory(), "souq-chat");
if (!fm.fileExists(dir)) fm.createDirectory(dir, true);
const file = (name) => fm.joinPath(dir, name);
const readJSON = (name, fallback) => {
  try { return fm.fileExists(file(name)) ? JSON.parse(fm.readString(file(name))) : fallback; } catch (e) { return fallback; }
};
const writeJSON = (name, value) => fm.writeString(file(name), JSON.stringify(value));

// seen: last reply you looked at, heard: last reply Siri read you,
// pending: messages you sent that the village hasn't picked up yet, projects: saved Call links.
const local = Object.assign({ seen: {}, heard: {}, pending: {}, projects: {} }, readJSON("local.json", {}));
const saveLocal = () => writeJSON("local.json", local);

/* ---------- loading from the village ---------- */

async function fetchText(path) {
  const r = new Request(VILLAGE_URL + path + "?t=" + Date.now());
  r.timeoutInterval = 15;
  return r.loadString();
}

// Loads from the site and keeps a copy, so the widget still shows something offline.
async function cached(name, load) {
  try { const v = await load(); writeJSON(name, v); return v; } catch (e) { return readJSON(name, null); }
}

const agents = (await cached("agents.json", async () => {
  const win = {};
  new Function("window", await fetchText("data/agents.js"))(win);
  return win.VILLAGE_AGENTS.map(({ id, name, job, personality }) => ({ id, name, job, personality }));
})) || [];
const chat = (await cached("chat.json", async () => JSON.parse(await fetchText("data/chat.json")))) || { threads: {} };
const state = (await cached("state.json", async () => {
  const win = {};
  new Function("window", await fetchText("data/state.js"))(win);
  return win.VILLAGE_STATE;
})) || {};

const village = (await cached("config.json", async () => {
  const win = {};
  new Function("window", await fetchText("config.js"))(win);
  return { ownerEmail: win.VILLAGE_CONFIG.ownerEmail };
})) || {};

async function portrait(id) {
  const path = file("portrait-" + id + ".png");
  try {
    const img = await new Request(VILLAGE_URL + "assets/agents/" + id + "/portrait.png").loadImage();
    fm.writeImage(path, img);
    return img;
  } catch (e) {
    return fm.fileExists(path) ? fm.readImage(path) : null;
  }
}

/* ---------- conversation helpers ---------- */

const norm = (s) => String(s || "").replace(/\s+/g, " ").trim().toLowerCase();

// The thread from the village plus anything you sent that it hasn't caught up with.
function thread(id) {
  const msgs = ((chat.threads || {})[id] || []).slice();
  const yours = new Set(msgs.filter((m) => m.from === "you").map((m) => norm(m.text)));
  const twoDays = Date.now() - 2 * 864e5;
  const pending = (local.pending[id] || []).filter((p) => !yours.has(norm(p.text)) && new Date(p.at) > twoDays);
  if (pending.length !== (local.pending[id] || []).length) { local.pending[id] = pending; saveLocal(); }
  return msgs.concat(pending.map((p) => Object.assign({ from: "you", pending: true }, p)));
}

const lastFrom = (msgs, who) => msgs.filter((m) => m.from === who).pop();
const isUnread = (id, msgs) => {
  const last = lastFrom(msgs, id);
  return !!last && (!local.seen[id] || new Date(last.at) > new Date(local.seen[id]));
};

const alias = (id) => {
  const email = String(village.ownerEmail || "");
  const [user, domain] = email.split("@");
  return user + "+" + id + "@" + domain;
};

const hearts = (id) => {
  const points = ((state.player || {}).friendship || {})[id] || 0;
  return Math.min(10, Math.floor(points / 500));
};

const runURL = (params) =>
  "scriptable:///run/" + encodeURIComponent(SCRIPT_NAME) + "?" +
  Object.entries(params).map(([k, v]) => k + "=" + encodeURIComponent(v)).join("&");

/* ---------- sending ---------- */

// Sends one message as an email to the agent's alias. The subject tag tells
// the village it came from the chat, so the answer goes to data/chat.json.
async function send(agent, text, tag) {
  const mail = { to: alias(agent.id), subject: agent.name + " (" + (tag || "widget") + ")", body: text };
  (local.pending[agent.id] = local.pending[agent.id] || []).push({ text, at: new Date().toISOString(), via: tag || "widget" });
  saveLocal();

  if (SEND_WITH === "shortcut") {
    Safari.open("shortcuts://x-callback-url/run-shortcut?name=" + encodeURIComponent(SEND_SHORTCUT) +
      "&input=text&text=" + encodeURIComponent(JSON.stringify(mail)) + "&x-success=" + encodeURIComponent("scriptable://"));
    return;
  }
  try {
    const m = new Mail();
    m.toRecipients = [mail.to];
    m.subject = mail.subject;
    m.body = mail.body;
    await m.send();
  } catch (e) {
    Safari.open("mailto:" + mail.to + "?subject=" + encodeURIComponent(mail.subject) + "&body=" + encodeURIComponent(mail.body));
  }
}

/* ---------- Call: the agent's Claude Project ---------- */

const projectLink = (id) => local.projects[id] || PROJECTS[id] || "";

function projectInstructions(agent) {
  const others = agents.filter((a) => a.id !== agent.id).map((a) => a.name + " (" + a.job.split(".")[0] + ")").join("; ");
  return [
    "You are " + agent.name + ", one of the villagers of Souq al-Qamar, a small Arabic market town where each villager helps the owner with one part of life.",
    "",
    "Your job: " + agent.job,
    "How you talk: " + agent.personality,
    "",
    "The owner usually reaches you by voice. Talk like a friend on a phone call: short turns, plain words, no lists or headings, no markdown. Stay in character as " + agent.name + " and inside your job. If something belongs to another villager, say who: " + others + ".",
    "",
    "When the owner says goodbye, or asks you to remember something, give a recap in two or three sentences that starts with \"Call notes:\". The owner pastes it into the village so the rest of the souq knows.",
  ].join("\n");
}

/* ---------- widget ---------- */

const C = { bg: "#fbf1dc", ink: "#4a3226", soft: "#7a5a45", rose: "#c4566b", teal: "#2f7a78", you: "#efe0c2" };

async function widget(agent) {
  const msgs = thread(agent.id);
  const family = config.widgetFamily || "small";
  const w = new ListWidget();
  w.backgroundColor = new Color(C.bg);
  w.setPadding(12, 12, 12, 12);
  w.url = runURL({ agent: agent.id });
  const img = await portrait(agent.id);

  const top = w.addStack();
  top.centerAlignContent();
  if (img) {
    const pic = top.addImage(img);
    const size = family === "small" ? 44 : 52;
    pic.imageSize = new Size(size, size);
    pic.cornerRadius = size / 2;
    top.addSpacer(8);
  }
  const names = top.addStack();
  names.layoutVertically();
  const name = names.addText(agent.name);
  name.font = Font.boldSystemFont(family === "small" ? 15 : 17);
  name.textColor = new Color(C.ink);
  name.lineLimit = 1;
  const h = names.addText("♥".repeat(hearts(agent.id)) || "♡");
  h.font = Font.systemFont(10);
  h.textColor = new Color(C.rose);
  h.lineLimit = 1;
  top.addSpacer();
  if (isUnread(agent.id, msgs)) {
    const dot = top.addText("●");
    dot.font = Font.systemFont(12);
    dot.textColor = new Color(C.rose);
  }

  w.addSpacer(8);
  const shown = family === "large" ? msgs.slice(-5) : family === "medium" ? msgs.slice(-2) : msgs.slice(-1);
  if (!shown.length) {
    const t = w.addText("Tap to say salaam.");
    t.font = Font.italicSystemFont(13);
    t.textColor = new Color(C.soft);
  }
  for (const m of shown) {
    const mine = m.from === "you";
    const line = w.addText((mine ? "You: " : "") + m.text + (m.pending ? "  ⏳" : ""));
    line.font = mine ? Font.systemFont(12) : Font.mediumSystemFont(13);
    line.textColor = new Color(mine ? C.soft : C.ink);
    line.lineLimit = family === "large" ? 3 : family === "medium" ? 2 : 3;
    w.addSpacer(4);
  }
  w.addSpacer();

  if (family !== "small") {
    // Medium and large widgets get two buttons; the small one opens the chat.
    const row = w.addStack();
    row.centerAlignContent();
    const button = (label, url, color) => {
      const b = row.addStack();
      b.backgroundColor = new Color(color);
      b.cornerRadius = 10;
      b.setPadding(5, 12, 5, 12);
      b.url = url;
      const t = b.addText(label);
      t.font = Font.semiboldSystemFont(13);
      t.textColor = Color.white();
    };
    button("💬 Message", runURL({ agent: agent.id, compose: 1 }), C.teal);
    row.addSpacer(8);
    button("📞 Call", projectLink(agent.id) || runURL({ agent: agent.id, call: 1 }), C.rose);
    row.addSpacer();
  }

  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  return w;
}

/* ---------- chat screen ---------- */

function chatHTML(agent, opts) {
  const data = {
    agent: { id: agent.id, name: agent.name },
    msgs: thread(agent.id),
    portrait: VILLAGE_URL + "assets/agents/" + agent.id + "/portrait.png",
    project: projectLink(agent.id),
    voice: VOICES[agent.id] || {},
    runTimes: RUN_TIMES,
    compose: !!opts.compose,
    setup: !!opts.call && !projectLink(agent.id),
  };
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover">
<style>
:root{--bg:#fbf1dc;--card:#fffaf0;--ink:#4a3226;--soft:#7a5a45;--rose:#c4566b;--teal:#2f7a78;--you:#2f7a78;--youInk:#fff;--line:#e6d3b0;--link:#2f7a78}
@media (prefers-color-scheme:dark){:root{--bg:#1f1914;--card:#2b231c;--ink:#f3e6cf;--soft:#c9b394;--line:#4a3b2d;--you:#2f6f6c;--link:#7cc4bf}}
*{box-sizing:border-box}html,body{margin:0;height:100%}
body{background:var(--bg);color:var(--ink);font:16px -apple-system,system-ui,sans-serif;display:flex;flex-direction:column}
header{display:flex;align-items:center;gap:12px;padding:14px 16px 10px;border-bottom:1px solid var(--line)}
header img{width:48px;height:48px;border-radius:50%;object-fit:cover;background:var(--card)}
header .who{flex:1;min-width:0}header b{font-size:19px;display:block}header small{color:var(--soft);font-size:13px}
.call{border:0;border-radius:999px;background:var(--rose);color:#fff;font:600 15px -apple-system,system-ui;padding:9px 16px}
#log{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px}
.m{max-width:82%;padding:10px 13px;border-radius:18px;line-height:1.35;white-space:pre-wrap;word-wrap:break-word}
.them{align-self:flex-start;background:var(--card);border:1px solid var(--line);border-bottom-left-radius:6px}
.you{align-self:flex-end;background:var(--you);color:var(--youInk);border-bottom-right-radius:6px}
.meta{font-size:11px;color:var(--soft);margin-top:4px;display:flex;gap:10px;align-items:center}
.you .meta{color:#d8ece9;justify-content:flex-end}
.speak{border:0;background:none;color:var(--link);font-size:13px;padding:0}
.empty,.note{color:var(--soft);text-align:center;font-size:14px;margin:auto 10px}
.note{margin:4px 0 0;font-size:12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin:0 16px 10px;font-size:14px;line-height:1.45}
.card ol{padding-left:20px;margin:8px 0}.card button{margin-top:6px}
.btn{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:10px;padding:8px 12px;font:600 14px -apple-system,system-ui}
.btn.primary{background:var(--teal);border-color:var(--teal);color:#fff}
footer{padding:8px 12px calc(8px + env(safe-area-inset-bottom));border-top:1px solid var(--line);display:flex;gap:8px;align-items:flex-end}
textarea{flex:1;resize:none;border:1px solid var(--line);border-radius:20px;padding:10px 14px;font:16px -apple-system,system-ui;background:var(--card);color:var(--ink);max-height:120px}
.send{border:0;border-radius:50%;width:42px;height:42px;background:var(--teal);color:#fff;font-size:19px}
.tools{display:flex;gap:8px;justify-content:center;padding:0 16px 8px}
.tools .btn{font-size:13px;padding:6px 10px}
</style></head><body>
<header><img id="pic" alt=""><div class="who"><b id="name"></b><small id="sub"></small></div><button class="call" onclick="go('call')">📞 Call</button></header>
<div id="setup"></div>
<div id="log"></div>
<div class="tools"><button class="btn" onclick="go('refresh')">↻ Check for replies</button><button class="btn" onclick="go('notes')">📋 Send call notes</button></div>
<footer><textarea id="box" rows="1" placeholder="Message"></textarea><button class="send" onclick="sendIt()" aria-label="Send">➤</button></footer>
<script>
let D = ${json};
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
function render(next) {
  if (next) D = Object.assign(D, next);
  $("pic").src = D.portrait; $("name").textContent = D.agent.name; $("box").placeholder = "Message " + D.agent.name + " (or tap 🎤)";
  const waiting = D.msgs.some((m) => m.pending);
  $("sub").textContent = waiting ? "Will answer at the next village run (" + D.runTimes + ")" : "In the souq";
  const log = $("log");
  log.innerHTML = D.msgs.length ? D.msgs.map((m, i) => m.from === "you"
    ? '<div class="m you">' + esc(m.text) + '<div class="meta">' + (m.pending ? "Sent · waiting" : when(m.at)) + (m.via && m.via !== "email" ? " · " + esc(m.via) : "") + '</div></div>'
    : '<div class="m them">' + esc(m.text) + '<div class="meta">' + when(m.at) + '<button class="speak" onclick="speak(' + i + ')">🔊 Listen</button></div></div>'
  ).join("") : '<div class="empty">No messages yet. Say salaam to ' + esc(D.agent.name) + '.</div>';
  log.scrollTop = log.scrollHeight;
  $("setup").innerHTML = D.setup ? '<div class="card"><b>Set up a call with ' + esc(D.agent.name) + '</b><ol>' +
    '<li>Tap <b>Copy instructions</b>. Claude opens.</li>' +
    '<li>Make a new Project named <b>' + esc(D.agent.name) + '</b> and paste into its instructions.</li>' +
    '<li>In the project, copy its link (share, then Copy link), come back here and tap <b>Save link</b>.</li></ol>' +
    '<button class="btn primary" onclick="go(\\'copy\\')">Copy instructions</button> <button class="btn" onclick="go(\\'save\\')">Save link</button>' +
    (D.setupNote ? '<p class="note">' + esc(D.setupNote) + '</p>' : '') + '</div>' : "";
}
function sendIt() { const t = $("box").value.trim(); if (!t) return; $("box").value = ""; grow(); go("send", { text: t }); }
function grow() { const b = $("box"); b.style.height = "auto"; b.style.height = Math.min(b.scrollHeight, 120) + "px"; }
$("box").addEventListener("input", grow);
render();
if (D.compose) setTimeout(() => $("box").focus(), 300);
</script></body></html>`;
}

async function openChat(agent, opts) {
  const wv = new WebView();
  local.seen[agent.id] = new Date().toISOString();
  saveLocal();
  let setupNote = "";

  const update = async (extra) => {
    await wv.evaluateJavaScript("render(" + JSON.stringify(Object.assign({ msgs: thread(agent.id), project: projectLink(agent.id) }, extra || {})) + ")");
  };

  const handle = async (url) => {
    const [action, query] = url.replace("souq://", "").split("?");
    const params = {};
    (query || "").split("&").filter(Boolean).forEach((p) => { const [k, v] = p.split("="); params[k] = decodeURIComponent(v || ""); });

    if (action === "send" && params.text) {
      await send(agent, params.text, "widget");
      await update();
    } else if (action === "notes") {
      const notes = (Pasteboard.paste() || "").trim();
      if (!notes) return update({ setup: false });
      await send(agent, notes, "call notes");
      await update();
    } else if (action === "speak") {
      Speech.speak(params.text || "");
    } else if (action === "refresh") {
      try {
        const fresh = JSON.parse(await fetchText("data/chat.json"));
        writeJSON("chat.json", fresh);
        chat.threads = fresh.threads || {};
      } catch (e) {}
      await update();
    } else if (action === "call") {
      if (projectLink(agent.id)) Safari.open(projectLink(agent.id));
      else await update({ setup: true });
    } else if (action === "copy") {
      Pasteboard.copy(projectInstructions(agent));
      Safari.open("https://claude.ai/projects");
    } else if (action === "save") {
      const link = (Pasteboard.paste() || "").trim();
      if (/^https:\/\/claude\.ai\/project\/[\w-]+/.test(link)) {
        local.projects[agent.id] = link.split(/\s/)[0];
        saveLocal();
        await update({ setup: false });
        Safari.open(local.projects[agent.id]);
      } else {
        setupNote = "Copy the project's link first. It starts with https://claude.ai/project/";
        await update({ setup: true, setupNote });
      }
    }
  };

  wv.shouldAllowRequest = (req) => {
    if (req.url.startsWith("souq://")) { handle(req.url); return false; }
    if (req.url.startsWith("about:") || req.url.startsWith(VILLAGE_URL)) return true;
    return false;
  };
  await wv.loadHTML(chatHTML(agent, opts), VILLAGE_URL);
  await wv.present(true);
}

/* ---------- Siri ---------- */

// Returns the agent's newest reply you haven't heard yet, for a "Talk to" Shortcut to speak.
function siriLine(agent) {
  const msgs = thread(agent.id);
  const fresh = msgs.filter((m) => m.from === agent.id && (!local.heard[agent.id] || new Date(m.at) > new Date(local.heard[agent.id])));
  const now = new Date().toISOString();
  local.heard[agent.id] = now;
  local.seen[agent.id] = now;
  saveLocal();
  if (fresh.length) return fresh.map((m) => m.text).join("\n\n");
  if (msgs.some((m) => m.pending)) return agent.name + " hasn't answered yet. The village runs at " + RUN_TIMES + ".";
  return "Nothing new from " + agent.name + ".";
}

/* ---------- which job is this run ---------- */

const pick = (id) => agents.find((a) => a.id === String(id || "").trim().toLowerCase());

if (config.runsInWidget) {
  const agent = pick(args.widgetParameter) || agents[0];
  if (agent) Script.setWidget(await widget(agent));
} else if (args.shortcutParameter || config.runsWithSiri) {
  const agent = pick(args.shortcutParameter);
  Script.setShortcutOutput(agent ? siriLine(agent) : "Tell me which villager: " + agents.map((a) => a.id).join(", ") + ".");
} else {
  const q = args.queryParameters || {};
  let agent = pick(q.agent);
  if (!agent) {
    const sheet = new Alert();
    sheet.title = "Who do you want to talk to?";
    agents.forEach((a) => sheet.addAction(a.name));
    sheet.addCancelAction("Cancel");
    const i = await sheet.presentSheet();
    agent = agents[i];
  }
  if (agent) {
    if (q.call && projectLink(agent.id)) Safari.open(projectLink(agent.id));
    else await openChat(agent, { compose: !!q.compose, call: !!q.call });
  }
}
Script.complete();
