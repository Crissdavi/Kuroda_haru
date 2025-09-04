import { loadHarem, saveHarem, loadMasters, saveMasters } from "../../harem/storage.js";

const handler = async (m, { conn, args }) => {
  const masterId = m.sender;
  const haremId = args[0];

  if (!haremId) {
    return conn.reply(m.chat, "⚠️ Debes escribir la ID de tu harén.\nEjemplo: *.disolverharem harem_1234*", m);
  }

  let harems = loadHarem();
  let masters = loadMasters();

  if (!masters[masterId] || masters[masterId].status !== "active") {
    return conn.reply(m.chat, "❌ No eres maestro de ningún harén activo.", m);
  }

  if (masters[masterId].haremId !== haremId) {
    return conn.reply(m.chat, "⚠️ Solo puedes disolver tu propio harén.", m);
  }

  // Eliminar a todos los miembros de ese harem
  Object.keys(harems).forEach((u) => {
    if (harems[u].haremId === haremId) delete harems[u];
  });

  delete masters[masterId];

  saveHarem(harems);
  saveMasters(masters);

  conn.reply(m.chat, `💔 El harén *${haremId}* ha sido disuelto.`, m);
};

handler.help = ["disolverharem <id>"];
handler.tags = ["harem"];
handler.command = /^disolverharem$/i;

export default handler;