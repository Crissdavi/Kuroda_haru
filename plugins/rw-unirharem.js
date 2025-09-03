import fs from "fs";
import path from "path";

const haremFile = path.resolve("src/database/harem.json");
const mastersFile = path.resolve("src/database/harem_masters.json");

let harem = JSON.parse(fs.readFileSync(haremFile));
let masters = JSON.parse(fs.readFileSync(mastersFile));

export default {
  command: /^\.unirharem/i,
  handler: async (m, { conn }) => {
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

    fs.writeFileSync(haremFile, JSON.stringify(harem, null, 2));
    m.reply(`✅ Te uniste automáticamente al harén de *${conn.getName(mentionedJid)}*.`);
  },
};