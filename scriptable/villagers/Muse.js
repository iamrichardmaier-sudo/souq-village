// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: book;

// Muse, Souq al-Qamar. Paste this into a new Scriptable script named "Muse".
// Add a Scriptable widget and pick "Muse". No parameter needed.
// Everything else lives in "Souq Core", which this keeps up to date.

const AGENT = "muse";

const here = module.filename;
const fm = here.includes("Mobile Documents") ? FileManager.iCloud() : FileManager.local();
const corePath = fm.joinPath(here.substring(0, here.lastIndexOf("/")), "Souq Core.js");

// The village's web address. Every Souq script on this phone uses it.
const VILLAGE_URL = "https://souqvillage.netlify.app/";
Keychain.set("souq.villageURL", VILLAGE_URL);

try {
  const code = await new Request(VILLAGE_URL + "scriptable/SouqCore.js?t=" + Date.now()).loadString();
  if (code.includes("module.exports.run")) fm.writeString(corePath, code);
} catch (e) {}

if (!fm.fileExists(corePath)) {
  const msg = "Couldn't reach the village. Check the address and your connection.";
  if (config.runsInWidget) { const w = new ListWidget(); w.addText(msg); Script.setWidget(w); }
  else { const a = new Alert(); a.title = msg; a.addAction("OK"); await a.present(); }
} else {
  if (fm.isFileStoredIniCloud(corePath) && !fm.isFileDownloaded(corePath)) await fm.downloadFileFromiCloud(corePath);
  await importModule("Souq Core").run({ agent: AGENT });
}
Script.complete();
