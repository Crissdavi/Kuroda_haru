// src/plugins/harem/miharem.js
import { loadHarems } from "../../harem/storage.js";

const handler = async (m, { conn }) => {
  const harems = loadHarems();
  const userId = m.sender;

  const entry = Object.entries(harems).find(
    ([, h]) => (h.members && h.members[userId]) || h.master === userId
  );
  if (!entry) return conn.reply(m.chat, "❌ No perteneces a ningún harén.", m);

  const [, h] = entry;
  const role = h.master === userId ? "maestro" : (h.members[userId]?.role || "miembro");
  const text = `📖 Estás en el harén *${h.name}*\n📌 Rol: ${role}\n👑 Maestro: @${h.master.split("@")[0]}`;

  conn.reply(m.chat, text, m, { mentions: [h.master] });
};

handler.help = ["miharem"];
handler.tags = ["harem"];
handler.command = /^miharem$/i;

export default handler;