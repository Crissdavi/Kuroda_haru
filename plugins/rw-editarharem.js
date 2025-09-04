import { loadMasters, saveMasters } from "../../harem/storage.js";

const handler = async (m, { conn, args }) => {
  const masterId = m.sender;
  const newName = args.join(" ");

  if (!newName) {
    return conn.reply(m.chat, "⚠️ Debes escribir un nuevo nombre para tu harén.", m);
  }

  let masters = loadMasters();

  if (!masters[masterId] || masters[masterId].status !== "active") {
    return conn.reply(m.chat, "❌ No eres maestro de ningún harén activo.", m);
  }

  masters[masterId].name = newName;

  saveMasters(masters);

  conn.reply(m.chat, `✅ Tu harén ahora se llama: *${newName}*`, m);
};

handler.help = ["editharem <nombre>"];
handler.tags = ["harem"];
handler.command = /^editharem$/i;

export default handler;