// src/plugins/harem/disolverharem.js
import { loadHarems, saveHarems } from "../../harem/storage.js";

const handler = async (m, { conn }) => {
  const harems = loadHarems();
  const masterId = m.sender;

  const entry = Object.entries(harems).find(
    ([, h]) => h.master === masterId && h.status === "active"
  );
  if (!entry) return conn.reply(m.chat, "❌ No tienes un harén activo para disolver.", m);

  const [haremId, harem] = entry;

  delete harems[haremId];
  saveHarems(harems);

  conn.reply(m.chat, `💔 Tu harén *${harem.name}* fue disuelto.`, m);
};

handler.help = ["disolverharem"];
handler.tags = ["harem"];
handler.command = /^disolverharem$/i;

export default handler;