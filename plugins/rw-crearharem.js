import { loadHarems, saveHarems } from "../harem/storage.js";

const handler = async (m, { args, conn }) => {
  const harems = loadHarems();
  const masterId = m.sender;

  if (harems[masterId]) {
    return conn.reply(m.chat, "❌ Ya tienes un harén creado.", m);
  }

  const haremName = args.join(" ").trim();
  if (!haremName) {
    return conn.reply(m.chat, "⚠️ Usa: *.crearharem <nombre>*", m);
  }

  // evitar nombres repetidos
  const existsName = Object.values(harems).some(h => h.name.toLowerCase() === haremName.toLowerCase());
  if (existsName) {
    return conn.reply(m.chat, "❌ Ese nombre de harén ya está en uso.", m);
  }

  const haremId = "harem_" + Math.random().toString(36).substring(2, 10);

  harems[masterId] = {
    haremId,
    master: masterId,
    name: haremName,
    members: [],
    createdAt: Date.now(),
    status: "active",
  };

  saveHarems(harems);

  conn.reply(m.chat, `✅ Harén *${haremName}* creado con éxito.\nID: ${haremId}`, m);
};

handler.help = ["crearharem <nombre>"];
handler.tags = ["harem"];
handler.command = /^crearharem$/i;

export default handler;