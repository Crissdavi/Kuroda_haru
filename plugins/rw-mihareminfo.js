import fs from 'fs';
import path from 'path';

const haremFile = path.resolve('src/database/harem.json');

// Función para cargar datos de harem
function loadHarem() {
  if (!fs.existsSync(haremFile)) {
    return {};
  }
  const data = fs.readFileSync(haremFile, 'utf-8');
  return JSON.parse(data || '{}');
}

const handler = async (m, { conn }) => {
  const userId = m.sender;
  let harems = loadHarem();
  const haremData = harems[userId];

  if (!haremData) {
    return conn.reply(m.chat, "❌ No perteneces a ningún harén.", m);
  }

  let text = "📖 *Información de tu harén*\n\n";

  if (haremData.role === "maestro" || haremData.isMaster) {
    const members = Object.values(harems).filter(
      (member) => member.haremId === haremData.haremId && member.status === "active"
    );
    text += `👑 *Eres maestro del harén:*\n- Nombre: ${haremData.name || "Sin nombre"}\n- Miembros: ${members.length}\n`;
  } else {
    text += `👥 *Eres miembro del harén:*\n- Nombre: ${haremData.haremName || "Sin nombre"}\n`;
  }

  conn.reply(m.chat, text.trim(), m);
};

handler.help = ["mihareminfo"];
handler.tags = ["harem"];
handler.command = /^mihareminfo$/i;

export default handler;