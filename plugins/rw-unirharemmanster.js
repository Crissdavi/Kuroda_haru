import fs from "fs";
import path from "path";

const haremFile = path.resolve("src/database/harem.json");
const mastersFile = path.resolve("src/database/harem_masters.json");

let harem = JSON.parse(fs.readFileSync(haremFile));
let masters = JSON.parse(fs.readFileSync(mastersFile));

let pendingRequests = {}; // solicitudes pendientes

export default {
  command: /^\.unirharemmaestro/i,
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

    // Guardamos la solicitud
    pendingRequests[mentionedJid] = { haremId, userId };

    await conn.sendMessage(mentionedJid, {
      text: `📩 *Solicitud de unión* 📩\n\n${conn.getName(userId)} quiere unirse a tu harén.\n\nResponde con "si" para aceptar o "no" para rechazar.`,
      mentions: [userId],
    });

    m.reply("✅ Solicitud enviada al maestro, espera su respuesta.");
  },
};

// ✅ Listener para manejar confirmación del maestro
export async function before(m, { conn }) {
  let maestroId = m.sender;

  if (pendingRequests[maestroId]) {
    let { haremId, userId } = pendingRequests[maestroId];

    if (/^si$/i.test(m.text)) {
      harem[haremId].miembros.push(userId);
      fs.writeFileSync(haremFile, JSON.stringify(harem, null, 2));

      await conn.sendMessage(maestroId, { text: `✅ Aceptaste a ${conn.getName(userId)} en tu harén.` });
      await conn.sendMessage(userId, { text: `🎉 Has sido aceptado en el harén de ${conn.getName(maestroId)}.` });

      delete pendingRequests[maestroId];
    } else if (/^no$/i.test(m.text)) {
      await conn.sendMessage(maestroId, { text: `❌ Rechazaste la solicitud de ${conn.getName(userId)}.` });
      await conn.sendMessage(userId, { text: `❌ Tu solicitud fue rechazada por ${conn.getName(maestroId)}.` });

      delete pendingRequests[maestroId];
    }
  }
}