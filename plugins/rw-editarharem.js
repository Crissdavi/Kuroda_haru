// src/plugins/harem/editharem.js
import { loadHarems, saveHarems } from "../../harem/storage.js";

const handler = async (m, { conn, args }) => {
  const harems = loadHarems();
  const masterId = m.sender;

  const entry = Object.entries(harems).find(
    ([, h]) => h.master === masterId && h.status === "active"
  );
  if (!entry) return conn.reply(m.chat, "❌ No tienes un harén activo.", m);

  const newName = args.join(" ").trim();
  if (!newName) return conn.reply(m.chat, "⚠️ Usa: *.editharem <nuevo_nombre>*", m);

  const nameUsed = Object.values(harems).some(h => (h.name || "").toLowerCase() === newName.toLowerCase());
  if (nameUsed) return conn.reply(m.chat, "❌ Ese nombre ya está en uso por otro harén.", m);

  const [haremId, harem] = entry;
  const oldName = harem.name;

  harem.name = newName;
  saveHarems(harems);

  conn.reply(m.chat, `✏️ Harén renombrado: *${oldName}* → *${newName}*`, m);
};

handler.help = ["editharem <nuevo_nombre>"];
handler.tags = ["harem"];
handler.command = /^editharem$/i;

export default handler;