// src/plugins/harem/resetearharem.js
import { saveHarems } from "../../harem/storage.js";

const handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return conn.reply(m.chat, "❌ Solo el owner puede resetear los harenes.", m);

  saveHarems({});
  conn.reply(m.chat, "♻️ Se reseteó toda la base de harenes.", m);
};

handler.help = ["resetearharem"];
handler.tags = ["harem"];
handler.command = /^resetearharem$/i;

export default handler;