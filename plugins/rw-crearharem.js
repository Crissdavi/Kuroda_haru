import { loadHarem, saveHarem, loadMasters, saveMasters } from "../../harem/storage.js";

function generateHaremId() {
  return "harem_" + Math.random().toString(36).substr(2, 6);
}

const handler = async (m, { conn }) => {
  const userId = m.sender;

  let harems = loadHarem();
  let masters = loadMasters();

  // Si ya es maestro de un harem activo
  if (masters[userId] && masters[userId].status === "active") {
    return conn.reply(m.chat, "⚠️ Ya eres maestro de un harén activo.", m);
  }

  // Si ya pertenece a otro harem
  if (harems[userId] && harems[userId].status === "active") {
    return conn.reply(m.chat, "⚠️ Ya perteneces a un harén. No puedes crear otro.", m);
  }

  // Crear nuevo harem
  const haremId = generateHaremId();

  // Guardar maestro como usuario dentro del harem
  harems[userId] = {
    master: userId,
    haremId: haremId,   // 🔑 Importante para que no quede undefined
    group: m.chat,
    joinDate: new Date().toISOString(),
    status: "active",
    role: "maestro"
  };

  // Guardar datos del maestro en harem_masters
  masters[userId] = {
    haremId: haremId,
    since: Date.now(),
    status: "active",
    memberCount: 1,
    name: "" // nombre opcional que luego se puede editar
  };

  // Guardar cambios en disco
  saveHarem(harems);
  saveMasters(masters);

  return conn.reply(
    m.chat,
    `✨ Harén creado con éxito!\n\n📖 ID de tu harén: *${haremId}*\n👑 Maestro: @${userId.split("@")[0]}`,
    m,
    { mentions: [userId] }
  );
};

handler.help = ["crearharem"];
handler.tags = ["harem"];
handler.command = /^crearharem$/i;

export default handler;