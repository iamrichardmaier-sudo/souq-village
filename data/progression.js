// Skills and friendship, Stardew-style.
//
// During the day, the things you do (Arabic XP, emails sent, workouts…) are
// counted under player.today in data/state.js. At the end of the day,
// tools/daily.mjs turns those counts into skill XP and friendship points,
// levels up skills and hearts, and writes the level-ups the village (and the
// phone notification) announce.
//
// Both the village page and tools/daily.mjs load this file, so the numbers
// can only live here.
window.VILLAGE_PROGRESSION = (() => {
  const MAX_LEVEL = 15;
  // Total skill XP to reach a level: 250 × level². A strong day is worth about
  // 100 XP, so level 1 takes a few days, level 5 about two months, level 10
  // most of a year, and level 15 (56,250 XP) a year and a half of steady work.
  const LEVEL_XP = Array.from({ length: MAX_LEVEL + 1 }, (_, level) => 250 * level * level);

  // Friendship: 10 hearts of 500 points. Each person gives at most 40 points a
  // day, so a full 10 hearts takes at least four months of showing up.
  const HEART_POINTS = 500;
  const MAX_HEARTS = 10;
  const DAILY_FRIENDSHIP_CAP = 40;
  // After a week with no friendship gained, a person cools off by 2 points a
  // day, but never below the heart you had already earned.
  const DECAY_AFTER_DAYS = 7;
  const DECAY_PER_DAY = 2;

  const skills = [
    { id: "arabic", name: "Arabic", ar: "العربية", icon: "📖", agent: "ahmed" },
    { id: "business", name: "Business", ar: "التجارة", icon: "✉️", agent: "muhammad" },
    { id: "scholarship", name: "Scholarship", ar: "العلم", icon: "🎓", agent: "mustafa" },
    { id: "strength", name: "Strength", ar: "القوة", icon: "⚔️", agent: "saladin" },
    { id: "leadership", name: "Leadership", ar: "القيادة", icon: "👑", agent: "othman" },
    { id: "wisdom", name: "Wisdom", ar: "الحكمة", icon: "🦉", agent: "muse" },
  ];

  // Everything that earns XP. skillXp and friendship are per unit; cap is the
  // most skill XP one source can give in a day.
  const sources = [
    // Ahmed — Arabic
    { id: "arabic_app_xp", skill: "arabic", label: "XP earned in your Arabic app", skillXp: 1 / 9, friendship: 1 / 25, cap: 150 },
    { id: "arabic_streak", skill: "arabic", label: "Kept your Arabic streak today", skillXp: 10, friendship: 3 },
    // Muhammad — Business
    { id: "emails_sent", skill: "business", label: "Emails you sent", skillXp: 4, friendship: 1, cap: 80 },
    { id: "inbox_cleared", skill: "business", label: "Emails answered or archived from your inbox", skillXp: 1, friendship: 0.25, cap: 40 },
    { id: "inbox_zero", skill: "business", label: "Ended the day at inbox zero", skillXp: 30, friendship: 8 },
    { id: "linkedin_connections", skill: "business", label: "New LinkedIn connections", skillXp: 10, friendship: 2, cap: 60 },
    { id: "linkedin_messages", skill: "business", label: "LinkedIn messages", skillXp: 5, friendship: 1, cap: 50 },
    // Mustafa — Scholarship
    { id: "assignments_done", skill: "scholarship", label: "Assignments turned in", skillXp: 35, friendship: 8 },
    { id: "assignments_early", skill: "scholarship", label: "Assignments turned in a day or more early", skillXp: 20, friendship: 5 },
    { id: "study_minutes", skill: "scholarship", label: "Minutes of focused study", skillXp: 1, friendship: 0.2, cap: 120 },
    { id: "decks_built", skill: "scholarship", label: "Slide decks and card sets made with Mustafa", skillXp: 20, friendship: 6 },
    // Saladin — Strength
    { id: "workouts", skill: "strength", label: "Workouts finished", skillXp: 25, friendship: 8 },
    { id: "workout_minutes", skill: "strength", label: "Minutes of exercise", skillXp: 1.5, friendship: 0.4, cap: 150 },
    { id: "steps_10k", skill: "strength", label: "Walked 10,000 steps", skillXp: 15, friendship: 3 },
    // Othman — Leadership
    { id: "tasks_done", skill: "leadership", label: "Tasks checked off", skillXp: 5, friendship: 1, cap: 60 },
    { id: "weekly_review", skill: "leadership", label: "Weekly plan with Othman", skillXp: 60, friendship: 15 },
    { id: "plans_kept", skill: "leadership", label: "Planned blocks you showed up for", skillXp: 8, friendship: 2, cap: 40 },
    // Muse — Wisdom
    { id: "reading_minutes", skill: "wisdom", label: "Minutes of reading", skillXp: 1, friendship: 0.25, cap: 100 },
    { id: "digest_read", skill: "wisdom", label: "Read Muse's school digest", skillXp: 10, friendship: 4 },
  ];

  const skill = (id) => skills.find((s) => s.id === id);
  const levelFor = (xp) => { let l = 0; for (let i = 1; i <= MAX_LEVEL; i++) if (xp >= LEVEL_XP[i]) l = i; return l; };
  const progressFor = (xp) => {
    const level = levelFor(xp);
    const floor = LEVEL_XP[level], next = level < MAX_LEVEL ? LEVEL_XP[level + 1] : null;
    return { level, xp, floor, next, into: xp - floor, need: next == null ? 0 : next - xp, fraction: next == null ? 1 : (xp - floor) / (next - floor) };
  };
  const heartsFor = (points) => Math.min(MAX_HEARTS, Math.floor((points || 0) / HEART_POINTS));

  // What a day's counts are worth: { skills: {arabic: 87}, friendship: {ahmed: 21} }
  const gainsFor = (counts) => {
    const out = { skills: {}, friendship: {} };
    sources.forEach((src) => {
      const n = Math.max(0, Number(counts?.[src.id]) || 0);
      if (!n) return;
      const s = skill(src.skill);
      const xp = Math.min(src.cap ?? Infinity, n * src.skillXp);
      out.skills[s.id] = (out.skills[s.id] || 0) + xp;
      out.friendship[s.agent] = (out.friendship[s.agent] || 0) + n * src.friendship;
    });
    Object.keys(out.skills).forEach((k) => (out.skills[k] = Math.round(out.skills[k])));
    Object.keys(out.friendship).forEach((k) => (out.friendship[k] = Math.min(DAILY_FRIENDSHIP_CAP, Math.round(out.friendship[k]))));
    return out;
  };

  return { MAX_LEVEL, LEVEL_XP, HEART_POINTS, MAX_HEARTS, DAILY_FRIENDSHIP_CAP, DECAY_AFTER_DAYS, DECAY_PER_DAY, skills, sources, skill, levelFor, progressFor, heartsFor, gainsFor };
})();
