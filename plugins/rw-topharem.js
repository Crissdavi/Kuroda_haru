// src/plugins/harem/topsharem.js
import { loadHarems } from "../../harem/storage.js";

const handler = async (m, { conn }) => {
  const harems = loadHarems();

  const activos = Object.values(harems).filter(h => h.status === "active");
  if (!activos.length) {
    return conn.reply(m.chat, "📝 No hay harenes activos todavía.", m);
  }

  const list = activos
    .map(h => ({
      name: h.name,
      master: h.master,
      memberCount: Object.keys(h.members || {}).length
    }))
    .sort((a, b) => b.memberCount - a.memberCount);

  let text = "🏆 *TOP HAREM* 🏆\n\n";
  list.forEach((h, i) => {
    text += `*${i + 1}.* ${h.name}\n`;
    text += `   👑 Maestro: @${h.master.split("@")[0]}\n`;
    text += `   👥 Miembros: ${h.memberCount}\n\n`;
  });

  conn.reply(m.chat, text.trim(), m, { mentions: list.map(h => h.master) });
};

handler.help = ["topsharem"];
handler.tags = ["harem"];
handler.command = /^topsharem$/i;

export default handler;