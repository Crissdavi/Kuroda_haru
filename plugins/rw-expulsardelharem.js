// src/plugins/harem/expulsardelharem.js
import { loadHarems, saveHarems } from "../../harem/storage.js";

const handler = async (m, { conn }) => {
  const harems = loadHarems();
  const masterId = m.sender;

  const entry = Object.entries(harems).find(
    ([, h]) => h.master === masterId && h.status === "active"
  );
  if (!entry) return conn.reply(m.chat, "❌ No eres maestro de ningún harén activo.", m);

  const [haremId, harem] = entry;

  const target =
    (m.mentionedJid && m.mentionedJid[0]) ||
    (m.quoted && m.quoted.sender) ||
    null;

  if (!target) return conn.reply(m.chat, "⚠️ Menciona o responde a alguien: *.expulsardelharem @usuario*", m);
  if (target === masterId) return conn.reply(m.chat, "❌ No puedes expulsarte a ti (maestro).", m);

  if (!harem.members[target]) {
    return conn.reply(m.chat, "❌ Ese usuario no está en tu harén.", m);
  }

  delete harem.members[target];
  saveHarems(harems);

  conn.reply(m.chat, `🚪 @${target.split("@")[0]} fue expulsado del harén *${harem.name}*.`, m, {
    mentions: [target],
  });
};

handler.help = ["expulsardelharem @usuario (o respondiendo)"];
handler.tags = ["harem"];
handler.command = /^expulsardelharem$/i;

export default handler;