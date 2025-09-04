import { loadHarem, loadMasters } from "../../harem/storage.js";

const handler = async (m, { conn }) => {
  const masterId = m.sender;
  let harems = loadHarem();
  let masters = loadMasters();

  if (!masters[masterId] || masters[masterId].status !== "active") {
    return conn.reply(m.chat, "❌ No eres maestro de ningún harén activo.", m);
  }

  const haremId = masters[masterId].haremId;
  const members = Object.entries(harems).filter(
    ([, data]) => data.haremId === haremId && data.status === "active"
  );

  if (members.length === 0) {
    return conn.reply(m.chat, "👥 Tu harén está vacío.", m);
  }

  let text = `👑 *Miembros del harén*\nID: ${haremId}\n\n`;
  members.forEach(([user], index) => {
    text += `${index + 1}. @${user.split("@")[0]}\n`;
  });

  conn.reply(m.chat, text.trim(), m, {
    mentions: members.map(([u]) => u),
  });
};

handler.help = ["listaharem"];
handler.tags = ["harem"];
handler.command = /^listaharem$/i;

export default handler;