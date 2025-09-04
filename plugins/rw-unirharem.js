import { loadHarems, saveHarems } from "../harem/storage.js";

const handler = async (m, { conn, args }) => {
  const harems = loadHarems();
  const masterId = m.sender;

  if (!harems[masterId]) {
    return conn.reply(m.chat, "❌ No eres maestro de ningún harén.", m);
  }

  const user = m.mentionedJid[0] || (m.quoted && m.quoted.sender);
  if (!user) return conn.reply(m.chat, "⚠️ Menciona o responde a alguien para unirlo.", m);

  const harem = harems[masterId];

  // verificar si ya está en un harén
  const already = Object.values(harems).some(h => h.members.includes(user) || h.master === user);
  if (already) {
    return conn.reply(m.chat, "❌ Ese usuario ya pertenece a un harén o es maestro.", m);
  }

  harem.members.push(user);
  saveHarems(harems);

  conn.reply(m.chat, `👤 @${user.split("@")[0]} fue añadido al harén *${harem.name}* ✅`, m, {
    mentions: [user],
  });
};

handler.help = ["unirharem @user"];
handler.tags = ["harem"];
handler.command = /^unirharem$/i;

export default handler;