// src/plugins/harem/crearharem.js
import { loadHarems, saveHarems } from "../../harem/storage.js";

const handler = async (m, { conn, args }) => {
  const harems = loadHarems();
  const masterId = m.sender;

  // Ya es maestro de un harem activo
  const hasHarem = Object.entries(harems).find(
    ([, h]) => h.master === masterId && h.status === "active"
  );
  if (hasHarem) return conn.reply(m.chat, "❌ Ya tienes un harén activo.", m);

  const name = args.join(" ").trim();
  if (!name) return conn.reply(m.chat, "⚠️ Usa: *.crearharem <nombre_del_harén>*", m);

  // Nombre único (en todo el archivo, activos o no)
  const nameUsed = Object.values(harems).some(h => (h.name || "").toLowerCase() === name.toLowerCase());
  if (nameUsed) return conn.reply(m.chat, "❌ Ese nombre de harén ya está en uso.", m);

  const haremId = "harem_" + Math.random().toString(36).slice(2, 10);

  harems[haremId] = {
    name,
    master: masterId,
    status: "active",
    createdAt: new Date().toISOString(),
    members: {
      [masterId]: { role: "maestro", joinDate: new Date().toISOString(), status: "active" }
    }
  };

  saveHarems(harems);
  conn.reply(m.chat, `✅ Harén *${name}* creado.`, m);
};

handler.help = ["crearharem <nombre>"];
handler.tags = ["harem"];
handler.command = /^crearharem$/i;

export default handler;