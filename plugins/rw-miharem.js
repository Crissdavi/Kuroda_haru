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

  let text = "📖 *Información de tu harén*\n\n";

  if (masterData && masterData.status === "active") {
    const members = Object.values(harems).filter(
      (m) => m.haremId === masterData.haremId && m.status === "active"
    );
    text += `👑 Eres maestro del harén:\n- ID: ${masterData.haremId}\n- Nombre: ${
      masterData.name || masterData.haremId
    }\n- Miembros: ${members.length}\n`;
  } else {
    const master = haremData.master;
    const masterInfo = masters[master];
    text += `👥 Eres miembro del harén:\n- ID: ${haremData.haremId}\n- Maestro: @${
      master.split("@")[0]
    }\n- Nombre: ${masterInfo?.name || haremData.haremId}\n`;
  }

  conn.reply(m.chat, text.trim(), m, {
    mentions: [haremData?.master || userId],
  });
};

handler.help = ["mihareminfo"];
handler.tags = ["harem"];
handler.command = /^mihareminfo$/i;

export default handler;