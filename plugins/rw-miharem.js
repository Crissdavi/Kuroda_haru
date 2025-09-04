import { loadHarem, loadMasters } from "../../harem/storage.js";

const handler = async (m, { conn }) => {
  const userId = m.sender;
  let harems = loadHarem();
  let masters = loadMasters();

  const haremData = harems[userId];
  const masterData = masters[userId];

  if (!haremData && !masterData) {
    return conn.reply(m.chat, "❌ No perteneces a ningún harén.", m);
  }

  if (masterData && masterData.status === "active") {
    return conn.reply(
      m.chat,
      `👑 Eres maestro del harén: *${masterData.name || masterData.haremId}* (ID: ${masterData.haremId})`,
      m
    );
  }

  return conn.reply(
    m.chat,
    `👥 Eres miembro del harén: *${haremData.haremId}* (Maestro: @${haremData.master.split("@")[0]})`,
    m,
    { mentions: [haremData.master] }
  );
};

handler.help = ["miharem"];
handler.tags = ["harem"];
handler.command = /^miharem$/i;

export default handler;