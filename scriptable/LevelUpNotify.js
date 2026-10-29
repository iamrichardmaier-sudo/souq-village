// Souq al-Qamar: phone notifications for level-ups and new hearts (Scriptable, iOS).
//
// Setup, once:
// 1. Paste this into a new Scriptable script named "Souq Level Ups".
// 2. Shortcuts → Automation → New → Time of Day → 11:55 PM, Daily, Run Immediately.
//    Action: Scriptable → Run Script → "Souq Level Ups". Turn off "Show When Run".
// 3. Run it once by hand so iOS asks to allow Scriptable's notifications.
// Each level-up notifies once; tapping it opens the village.

// The village's address: the one your villager scripts saved, or set it here (ending with /).
const VILLAGE_URL = Keychain.contains("souq.villageURL") ? Keychain.get("souq.villageURL") : "https://souqvillage.netlify.app/";

async function loadGlobal(path, name) {
  const txt = await new Request(VILLAGE_URL + path + "?t=" + Date.now()).loadString();
  const win = {};
  new Function("window", txt)(win);
  return win[name];
}

const state = await loadGlobal("data/state.js", "VILLAGE_STATE");
const progression = await loadGlobal("data/progression.js", "VILLAGE_PROGRESSION");
const agents = await loadGlobal("data/agents.js", "VILLAGE_AGENTS");
const ups = (state.player && state.player.levelUps) || [];

// Remember what was already announced, on this phone only.
const fm = FileManager.local();
const seenPath = fm.joinPath(fm.documentsDirectory(), "souq-seen-levelups.json");
const seen = new Set(fm.fileExists(seenPath) ? JSON.parse(fm.readString(seenPath)) : []);
const key = (u) => u.date + u.kind + u.id + (u.level || u.hearts);

// The first run only learns what is already there, so old level-ups don't all fire at once.
const firstRun = !fm.fileExists(seenPath);
for (const u of ups) {
  if (seen.has(key(u))) continue;
  seen.add(key(u));
  if (firstRun) continue;
  const skill = u.kind === "skill" ? progression.skills.find((s) => s.id === u.id) : null;
  const agent = agents.find((a) => a.id === (skill ? skill.agent : u.id));
  const n = new Notification();
  n.title = skill ? `${skill.icon} Level up! ${skill.name} ${u.level}` : `♥ ${agent ? agent.name : u.id}: ${u.hearts} hearts`;
  n.body = skill ? (agent ? `${agent.name} is proud of you.` : "Keep going.") : `You and ${agent ? agent.name : "your friend"} are growing closer.`;
  n.openURL = VILLAGE_URL;
  n.sound = "complete";
  await n.schedule();
}
fm.writeString(seenPath, JSON.stringify([...seen].slice(-300)));
Script.complete();
