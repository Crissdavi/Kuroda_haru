import { loadHarems } from "../harem/storage.js";

const handler = async (m, { conn }) => {
  const harems = loadHarems();
  const userId = m.sender;

  // encontrar en qué harem está
  const harem = Object.values(harems).find(
    h => h.master === userId || h.members.includes(userId)
  );

  if (!harem) {
    return conn.reply(m.chat, "❌ No perteneces a ningún harén.", m);
  }

  const isMaster = harem.master === userId;

  let text = `📖 Estás en el harén: *${harem.name || harem.haremId}*\n`;
  text += `👑 Maestro: @${harem.master.split("@")[0]}\n`;
  text += `👥 Miembros: ${harem.members.length}\n`;
  text += `📌 Rol: ${isMaster ? "Maestro" : "Miembro"}`;

  conn.reply(m.chat, text, m, { mentions: [harem.master, ...harem.members] });
};

handler.help = ["mihareminfo"];
handler.tags = ["harem"];
handler.command = /^mihareminfo$/i;

export default handler;