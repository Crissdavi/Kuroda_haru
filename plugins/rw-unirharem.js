import { loadHarem, saveHarem, loadMasters, saveMasters } from "../../harem/storage.js";

const handler = async (m, { conn, args }) => {
  const masterId = m.sender;
  const mentionedUser = m.mentionedJid?.[0] || (m.quoted && m.quoted.sender);

  if (!mentionedUser) {
    return conn.reply(m.chat, "⚠️ Debes etiquetar o responder al usuario que quieres unir.", m);
  }

  let harems = loadHarem();
  let masters = loadMasters();

  // Revisar que el maestro tenga un harem activo
  if (!masters[masterId] || masters[masterId].status !== "active") {
    return conn.reply(m.chat, "❌ No eres maestro de ningún harén activo.", m);
  }

  const haremId = masters[masterId].haremId;

  // Revisar que el usuario no sea ya maestro
  if (masters[mentionedUser] && masters[mentionedUser].status === "active") {
    return conn.reply(m.chat, "⚠️ Ese usuario ya es maestro de otro harén.", m);
  }

  // Revisar que el usuario no pertenezca a otro harem
  if (harems[mentionedUser] && harems[mentionedUser].status === "active") {
    return conn.reply(m.chat, "⚠️ Ese usuario ya pertenece a un harén.", m);
  }

  // Agregar al usuario al harem
  harems[mentionedUser] = {
    master: masterId,
    haremId: haremId,
    group: m.chat,
    joinDate: new Date().toISOString(),
    status: "active",
    role: "miembro"
  };

  // Aumentar el contador de miembros del maestro
  masters[masterId].memberCount =
    (masters[masterId].memberCount || 1) + 1;

  // Guardar cambios
  saveHarem(harems);
  saveMasters(masters);

  return conn.reply(
    m.chat,
    `👥 @${mentionedUser.split("@")[0]} ahora forma parte del harén de @${masterId.split("@")[0]} ✨`,
    m,
    { mentions: [mentionedUser, masterId] }
  );
};

handler.help = ["unirharem @user"];
handler.tags = ["harem"];
handler.command = /^unirharem$/i;

export default handler;