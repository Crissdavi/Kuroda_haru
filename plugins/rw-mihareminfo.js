// src/plugins/harem/mihareminfo.js
import { loadHarems } from "../../harem/storage.js";

const handler = async (m, { conn }) => {
  const harems = loadHarems();
  const userId = m.sender;

  const entry = Object.entries(harems).find(
    ([, h]) => (h.members && h.members[userId]) || h.master === userId
  );
  if (!entry) return conn.reply(m.chat, "❌ No perteneces a ningún harén.", m);

  const [, h] = entry;
  const members = Object.keys(h.members || {});
  let text = `📚 *Información de tu harén*\n\n`;
  text += `🏷️ Nombre: *${h.name}*\n`;
  text += `👑 Maestro: @${h.master.split("@")[0]}\n`;
  text += `👥 Miembros: ${members.length}\n\n`;

  if (members.length) {
    text += `*Miembros:*\n`;
    members.forEach((u, i) => {
      const r = h.members[u]?.role || "miembro";
      text += `${i + 1}. @${u.split("@")[0]} — ${r}\n`;
    });
  }

  conn.reply(m.chat, text.trim(), m, {
    mentions: [h.master, ...members]
  });
};

handler.help = ["mihareminfo"];
handler.tags = ["harem"];
handler.command = /^mihareminfo$/i;

export default handler;