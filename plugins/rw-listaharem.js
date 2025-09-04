// src/plugins/harem/listaharem.js
import { loadHarems } from "../../harem/storage.js";

const handler = async (m, { conn }) => {
  const harems = loadHarems();

  const activos = Object.values(harems).filter(h => h.status === "active");
  if (activos.length === 0) {
    return conn.reply(m.chat, "📝 No hay harenes activos por ahora.", m);
  }

  let text = "👑 *LISTA DE HARENES* 👑\n\n";
  activos.forEach((h, i) => {
    const count = Object.keys(h.members || {}).length;
    text += `*${i + 1}.* ${h.name}\n`;
    text += `   👑 Maestro: @${h.master.split("@")[0]}\n`;
    text += `   👥 Miembros: ${count}\n\n`;
  });

  conn.reply(
    m.chat,
    text.trim(),
    m,
    { mentions: activos.map(h => h.master) }
  );
};

handler.help = ["listaharem"];
handler.tags = ["harem"];
handler.command = /^listaharem$/i;

export default handler;