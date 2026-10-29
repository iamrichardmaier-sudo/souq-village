#!/usr/bin/env node
// The end-of-day engine. The scheduled AI run gathers today's numbers and
// calls this, so all the arithmetic is done here, the same way every time.
//
//   node tools/daily.mjs record --date 2026-10-29 --counts '{"arabic_app_xp": 640, "emails_sent": 9}'
//       Today's totals so far (each run reports the full total, not a delta).
//       A new date closes the previous day first.
//   node tools/daily.mjs add --date 2026-10-29 --counts '{"decks_built": 1}'
//       Adds to today's totals instead of replacing them.
//   node tools/daily.mjs close [--date 2026-10-29]
//       Ends the day: banks XP and friendship, levels up, writes level-ups.
//   node tools/daily.mjs status
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const load = (file, name) => { const win = {}; new Function("window", readFileSync(join(root, file), "utf8"))(win); return win[name]; };
const P = load("data/progression.js", "VILLAGE_PROGRESSION");
const roster = load("data/agents.js", "VILLAGE_AGENTS");
const statePath = join(root, "data/state.js");
const state = load("data/state.js", "VILLAGE_STATE");

const args = process.argv.slice(2);
const cmd = args[0];
const opt = (name) => { const i = args.indexOf("--" + name); return i < 0 ? undefined : args[i + 1]; };
const todayLocal = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60e3).toISOString().slice(0, 10); };
const nextDay = (d) => new Date(Date.parse(d + "T12:00:00Z") + 86400e3).toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400e3);

const player = (state.player ||= {});
player.today ||= {};
player.skills ||= {};
player.friendship ||= {};
player.lastGain ||= {};
player.levelUps ||= [];
player.history ||= [];
P.skills.forEach((s) => (player.skills[s.id] ??= 0));
roster.forEach((a) => (player.friendship[a.id] ??= 0));

const name = (id) => roster.find((a) => a.id === id)?.name || id;

function close(day) {
  const gains = P.gainsFor(player.today);
  const ups = [];
  P.skills.forEach((s) => {
    const gain = gains.skills[s.id] || 0;
    if (!gain) return;
    const before = P.levelFor(player.skills[s.id]);
    player.skills[s.id] += gain;
    const after = P.levelFor(player.skills[s.id]);
    for (let l = before + 1; l <= after; l++) ups.push({ date: day, kind: "skill", id: s.id, level: l, text: `${s.name} reached level ${l}!` });
  });
  roster.forEach((a) => {
    const gain = gains.friendship[a.id] || 0;
    const pts = player.friendship[a.id];
    if (gain > 0) {
      const before = P.heartsFor(pts);
      player.friendship[a.id] = Math.min(P.HEART_POINTS * P.MAX_HEARTS, pts + gain);
      player.lastGain[a.id] = day;
      const after = P.heartsFor(player.friendship[a.id]);
      for (let h = before + 1; h <= after; h++) ups.push({ date: day, kind: "heart", id: a.id, hearts: h, text: `${a.name} ♥ ${h} heart${h > 1 ? "s" : ""}` });
    } else if (player.lastGain[a.id] && daysBetween(player.lastGain[a.id], day) > P.DECAY_AFTER_DAYS) {
      const floor = P.heartsFor(pts) * P.HEART_POINTS;
      player.friendship[a.id] = Math.max(floor, pts - P.DECAY_PER_DAY);
    }
  });
  player.history.push({ date: day, counts: player.today, skills: gains.skills, friendship: gains.friendship });
  player.history = player.history.slice(-120);
  player.levelUps = player.levelUps.concat(ups).slice(-100);
  player.today = {};
  player.day = nextDay(day);
  return { gains, ups };
}

const counts = () => { const c = opt("counts"); return c ? JSON.parse(c) : {}; };
const date = opt("date") || todayLocal();
let report;
if (cmd === "record" || cmd === "add") {
  if (player.day && player.day < date) report = { closed: player.day, ...close(player.day) };
  player.day = date;
  Object.entries(counts()).forEach(([k, v]) => {
    if (!P.sources.some((s) => s.id === k)) throw new Error(`Unknown source "${k}". Known: ${P.sources.map((s) => s.id).join(", ")}`);
    player.today[k] = cmd === "add" ? (Number(player.today[k]) || 0) + Number(v) : Number(v);
  });
} else if (cmd === "close") {
  report = close(player.day || date);
} else if (cmd !== "status") {
  console.error("usage: daily.mjs record|add|close|status [--date YYYY-MM-DD] [--counts JSON]");
  process.exit(2);
}

if (cmd !== "status") {
  state.updated = new Date().toISOString();
  writeFileSync(statePath, "window.VILLAGE_STATE = " + JSON.stringify(state, null, 2) + ";\n");
}
const pending = P.gainsFor(player.today);
console.log(JSON.stringify({
  day: player.day, today: player.today, pendingGains: pending,
  skills: Object.fromEntries(P.skills.map((s) => [s.id, P.progressFor(player.skills[s.id])])),
  hearts: Object.fromEntries(roster.map((a) => [name(a.id), P.heartsFor(player.friendship[a.id])])),
  report,
}, null, 2));
