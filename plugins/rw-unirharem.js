// src/plugins/harem/unirharem.js
import { loadHarems, saveHarems } from "../../harem/storage.js";

const handler = async (m, { conn }) => {
  const harems = loadHarems();
  const masterId = m.sender;

  // Harem del maestro
  const entry = Object.entries(harems).find(
    ([, h]) => h.master === masterId && h.status === "active"
  );
  if (!entry) return conn.reply(m.chat, "❌ No eres maestro de ningún harén activo.", m);

  const [haremId, harem] = entry;

  const target =
    (m.mentionedJid && m.mentionedJid[0]) ||
    (m.quoted && m.quoted.sender) ||
    null;

  if (!target) return conn.reply(m.chat, "⚠️ Menciona o responde a alguien: *.unirharem @usuario*", m);
  if (target === masterId) return conn.reply(m.chat, "❌ Ya eres el maestro, no necesitas unirte.", m);

  // Ya pertenece a algún harén (como miembro o maestro)
  const alreadyIn = Object.values(harems).some(h =>
    h.master === target || (h.members && h.members[target])
  );
  if (alreadyIn) return conn.reply(m.chat, "❌ Ese usuario ya pertenece a un harén.", m);

  harem.members[target] = { role: "miembro", joinDate: new Date().toISOString(), status: "active" };
  saveHarems(harems);

  conn.reply(
    m.chat,
    `✅ @${target.split("@")[0]} fue añadido al harén *${harem.name}*.`,
    m,
    { mentions: [target] }
  );
};

handler.help = ["unirharem @usuario (o respondiendo)"];
handler.tags = ["harem"];
handler.command = /^unirharem$/i;

export default handler;