import { loadHarems } from "../harem/storage.js";

const handler = async (m, { conn }) => {
  const harems = loadHarems();

  const allHarems = Object.values(harems)
    .filter(h => h.status === "active")
    .map(h => ({
      name: h.name || h.haremId,
      masterId: h.master,
      memberCount: h.members.length,
    }));

  if (allHarems.length === 0) {
    return conn.reply(m.chat, "❌ No hay harenes activos todavía.", m);
  }

  allHarems.sort((a, b) => b.memberCount - a.memberCount);

  let text = "🏆 *TOP HAREM* 🏆\n\n";
  allHarems.forEach((h, i) => {
    text += `*${i + 1}.* ${h.name}\n`;
    text += `👑 Maestro: @${h.masterId.split("@")[0]}\n`;
    text += `👥 Miembros: ${h.memberCount}\n\n`;
  });

  conn.reply(m.chat, text.trim(), m, {
    mentions: allHarems.map(h => h.masterId),
  });
};

handler.help = ["topsharem"];
handler.tags = ["harem"];
handler.command = /^topsharem$/i;

export default handler;