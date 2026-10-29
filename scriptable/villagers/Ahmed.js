// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: book-open;

// Ahmed, Souq al-Qamar. Paste this into a new Scriptable script named "Ahmed".
// Add a Scriptable widget and pick "Ahmed". No parameter needed.
// The first time you open it, it asks for the village's address.
// Everything else lives in "Souq Core", which this keeps up to date.

const AGENT = "ahmed";

const here = module.filename;
const fm = here.includes("Mobile Documents") ? FileManager.iCloud() : FileManager.local();
const corePath = fm.joinPath(fm.directory(here), "Souq Core.js");

if (!Keychain.contains("souq.villageURL")) {
  if (config.runsInWidget) {
    const w = new ListWidget();
    w.addText("Open Ahmed in Scriptable once to finish setup.").font = Font.mediumSystemFont(13);
    Script.setWidget(w);
    Script.complete();
    return;
  }
  const a = new Alert();
  a.title = "Where is the village?";
  a.message = "The village's web address, like https://your-site.netlify.app/";
  a.addTextField("https://", "");
  a.addAction("Save");
  a.addCancelAction("Cancel");
  if ((await a.present()) === -1) return;
  let url = a.textFieldValue(0).trim();
  if (!url.endsWith("/")) url += "/";
  Keychain.set("souq.villageURL", url);
}

try {
  const code = await new Request(Keychain.get("souq.villageURL") + "scriptable/SouqCore.js?t=" + Date.now()).loadString();
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
