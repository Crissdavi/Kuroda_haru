import { loadHarem, saveHarem, loadMasters, saveMasters } from "../../harem/storage.js";

const handler = async (m, { conn, args }) => {
  const userId = m.sender;
  const masterId = m.mentionedJid?.[0] || (m.quoted && m.quoted.sender);

  if (!masterId) {
    return conn.reply(m.chat, "⚠️ Debes mencionar al maestro del harén al que quieres unirte.", m);
  }

  let harems = loadHarem();
  let masters = loadMasters();

  if (!masters[masterId] || masters[masterId].status !== "active") {
    return conn.reply(m.chat, "❌ Ese usuario no es maestro de un harén activo.", m);
  }

  if (harems[userId] && harems[userId].status === "active") {
    return conn.reply(m.chat, "⚠️ Ya perteneces a un harén, no puedes unirte a otro.", m);
  }

  if (masters[userId] && masters[userId].status === "active") {
    return conn.reply(m.chat, "⚠️ Eres maestro de un harén, no puedes unirte a otro.", m);
  }

  // Avisar al maestro
  conn.reply(
    masterId,
    `📩 @${userId.split("@")[0]} quiere unirse a tu harén.\nResponde con *sí* o *no*.`,
    m,
    { mentions: [userId] }
  );

  // Esperar respuesta
  const confirmation = await conn.waitForMessage({
    sender: masterId,
    filter: (msg) => /^sí$|^no$/i.test(msg.text),
    timeout: 30000,
  });

  if (!confirmation) {
    return conn.reply(m.chat, "⌛ El maestro no respondió a tiempo.", m);
  }

  if (/^no$/i.test(confirmation.text)) {
    return conn.reply(m.chat, "❌ El maestro rechazó tu solicitud.", m);
  }

  // Agregar al harem
  harems[userId] = {
    master: masterId,
    haremId: masters[masterId].haremId,
    group: m.chat,
    joinDate: new Date().toISOString(),
    status: "active",
    role: "miembro",
  };

  masters[masterId].memberCount = (masters[masterId].memberCount || 1) + 1;

  saveHarem(harems);
  saveMasters(masters);

  conn.reply(
    m.chat,
    `🎉 @${userId.split("@")[0]} ahora forma parte del harén de @${masterId.split("@")[0]} ✨`,
    m,
    { mentions: [userId, masterId] }
  );
};

handler.help = ["unirharemmaestro @maestro"];
handler.tags = ["harem"];
handler.command = /^unirharemmaestro$/i;

export default handler;