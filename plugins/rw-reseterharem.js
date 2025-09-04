import { saveHarem, saveMasters } from "../../harem/storage.js";

const handler = async (m, { conn, isOwner }) => {
  if (!isOwner) {
    return conn.reply(m.chat, "❌ Solo el dueño del bot puede usar este comando.", m);
  }

  saveHarem({});
  saveMasters({});

  conn.reply(m.chat, "🗑️ Todos los harenes han sido reseteados.", m);
};

handler.help = ["resetearharem"];
handler.tags = ["harem"];
handler.command = /^resetearharem$/i;

export default handler;