import { loadHarem, saveHarem, loadMasters, saveMasters } from "../../harem/storage.js";

const handler = async (m, { conn, args }) => {
  const masterId = m.sender;
  const mentionedUser = m.mentionedJid?.[0] || (m.quoted && m.quoted.sender);

  if (!mentionedUser) {
    return conn.reply(m.chat, "⚠️ Debes mencionar o responder al usuario que quieres expulsar.", m);
  }

  let harems = loadHarem();
  let masters = loadMasters();

  if (!masters[masterId] || masters[masterId].status !== "active") {
    return conn.reply(m.chat, "❌ No eres maestro de ningún harén activo.", m);
  }

  if (!harems[mentionedUser] || harems[mentionedUser].master !== masterId) {
    return conn.reply(m.chat, "⚠️ Ese usuario no está en tu harén.", m);
  }

  delete harems[mentionedUser];
  masters[masterId].memberCount = Math.max((masters[masterId].memberCount || 1) - 1, 0);

  saveHarem(harems);
  saveMasters(masters);

  conn.reply(
    m.chat,
    `🛑 @${mentionedUser.split("@")[0]} fue expulsado del harén de @${masterId.split("@")[0]}.`,
    m,
    { mentions: [mentionedUser, masterId] }
  );
};

handler.help = ["expulsardelharem @user"];
handler.tags = ["harem"];
handler.command = /^expulsardelharem$/i;

export default handler;