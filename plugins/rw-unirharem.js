import fs from "fs";

const HAREM_FILE = "./db/harem.json";
const MASTERS_FILE = "./db/harem_masters.json";

let harem = JSON.parse(fs.readFileSync(HAREM_FILE));
let masters = JSON.parse(fs.readFileSync(MASTERS_FILE));

export default {
  command: /^\.unirharem/i,
  handler: async (m, { conn, text }) => {
    let mentionedJid = m.mentionedJid && m.mentionedJid[0] 
      ? m.mentionedJid[0] 
      : m.quoted 
        ? m.quoted.sender 
        : null;

    if (!mentionedJid) return m.reply("⚠️ Debes mencionar o responder al maestro de un harén.");

    if (!masters[mentionedJid]) {
      return m.reply("❌ Ese usuario no tiene un harén creado.");
    }

    let haremId = masters[mentionedJid];
    if (!harem[haremId]) return m.reply("❌ Ese harén ya no existe.");

    let userId = m.sender;

    // Verificar si ya pertenece
    for (let hId in harem) {
      if (harem[hId].miembros.includes(userId)) {
        return m.reply("⚠️ Ya perteneces a un harén.");
      }
    }

    harem[haremId].miembros.push(userId);

    fs.writeFileSync(HAREM_FILE, JSON.stringify(harem, null, 2));
    m.reply(`✅ Te uniste automáticamente al harén de *${conn.getName(mentionedJid)}*.`);
  },
};