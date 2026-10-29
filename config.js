// Village settings. Everything here is plain data: no API keys anywhere.
window.VILLAGE_CONFIG = {
  villageName: "Souq al-Qamar",
  villageNameArabic: "سوق القمر",

  // "painted" uses the illustration in assets/map/souq.jpg as the whole village.
  // "drawn" uses the built-in hand-drawn map instead.
  map: "painted",

  // Your real inbox. Each agent gets an alias on it: you+muse@gmail.com, you+layla@gmail.com …
  // Gmail and iCloud both deliver "+anything" to the same inbox.
  ownerEmail: "i.am.richardmaier@gmail.com",

  // The AI that runs the villagers. The phone widgets read this, so switching
  // to another AI means changing these lines (see SWITCHING.md). No keys here.
  brain: {
    name: "Claude",                                      // shown on the phone: "Connect Gmail in Claude"
    app: "the Claude app",                               // where calls happen
    callSetup: "https://claude.ai/projects",             // where you make a villager's voice assistant
    callLink: "https://claude.ai/project/",              // what a saved call link starts with
    connectors: "https://claude.ai/settings/connectors", // where you connect Gmail, Calendar, the Arabic app
    scheduledRuns: "https://claude.ai/code/routines",    // where the village's scheduled runs live
    quickSetup: "https://claude.ai/code/routines",       // where you get the quick-reply address and token
    // ChatGPT:  callSetup "https://chatgpt.com/gpts/editor", callLink "https://chatgpt.com/g/"
    // Gemini:   callSetup "https://gemini.google.com/gems/create", callLink "https://gemini.google.com/gem/"
  },

  // Digits only, international format, no "+" (e.g. "15551234567").
  // The WhatsApp chat the agents listen on. Leave "" to hide WhatsApp buttons.
  whatsappNumber: "",

  // Weather and sunrise/sunset come from Open-Meteo (free, no key).
  // The device's location is used when the browser allows it; otherwise this one.
  location: { lat: 40.2338, lon: -111.6585, label: "Provo" },
  useDeviceLocation: true,
  temperatureUnit: "fahrenheit", // or "celsius"

  // How often the village re-reads data/state.js for new statuses, hearts and mail.
  statePollSeconds: 60,

  // Your character.
  avatar: { name: "You", robe: "#f4ecdc", trim: "#2f7a78", head: "keffiyeh", headColor: "#e9e2d0", skin: "#c99a74" },

  // Links on the library shelves (Muse's room). Add your school sites here.
  library: {
    shelves: [
      // { label: "Learning Suite", url: "https://learningsuite.byu.edu" },
    ],
  },

  // Sound slots. Drop files in village/audio/ with these names and they play.
  // Missing files are skipped silently.
  audio: {
    volume: 0.6,
    tracks: { day: "audio/day.mp3", night: "audio/night.mp3", rain: "audio/rain.mp3", music: "audio/music.mp3" },
    sfx: { click: "audio/click.mp3", door: "audio/door.mp3", message: "audio/message.mp3", heart: "audio/heart.mp3" },
  },

  // Nudge a hand-made image that sits a little off: { "places/library": { scale: 1.05, dx: 0, dy: 6 } }
  assetTweaks: {},
};
