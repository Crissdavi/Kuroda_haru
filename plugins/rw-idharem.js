import { loadMasters } from "../../harem/storage.js";

const handler = async (m, { conn }) => {
  const masterId = m.sender;
  let masters = loadMasters();

  if (!masters[masterId] || masters[masterId].status !== "active") {
    return conn.reply(m.chat, "❌ No eres maestro de ningún harén activo.", m);
  }

  conn.reply(m.chat, `${masters[masterId].haremId}`, m);
};

handler.help = ["idharem"];
handler.tags = ["harem"];
handler.command = /^idharem$/i;

export default handler;