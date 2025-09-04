import fs from 'fs';
import path from 'path';

const haremFile = path.resolve('src/database/harem.json');
const mastersFile = path.resolve('src/database/masters.json');

// Función para cargar datos de harem
function loadHarem() {
  if (!fs.existsSync(haremFile)) {
    return {};
  }
  const data = fs.readFileSync(haremFile, 'utf-8');
  return JSON.parse(data || '{}');
}

// Función para cargar datos de masters
function loadMasters() {
  if (!fs.existsSync(mastersFile)) {
    return {};
  }
  const data = fs.readFileSync(mastersFile, 'utf-8');
  return JSON.parse(data || '{}');
}

const handler = async (m, { conn }) => {
  const userId = m.sender;
  let harems = loadHarem();
  let masters = loadMasters();

  const haremData = harems[userId];
  const masterData = masters[userId];

  if (!haremData && !masterData) {
    return conn.reply(m.chat, "❌ No perteneces a ningún harén.", m);
  }

  let text = "📖 *Información de tu harén*\n\n";

  if (masterData && masterData.status === "active") {
    const members = Object.values(harems).filter(
      (member) => member.haremId === masterData.haremId && member.status === "active"
    );
    text += `👑 Eres maestro del harén:\n- ID: ${masterData.haremId}\n- Nombre: ${
      masterData.name || masterData.haremId
    }\n- Miembros: ${members.length}\n`;
  } else if (haremData) {
    const master = haremData.master;
    const masterInfo = masters[master];
    text += `👥 Eres miembro del harén:\n- ID: ${haremData.haremId}\n- Maestro: @${
      master.split("@")[0]
    }\n- Nombre: ${masterInfo?.name || haremData.haremId}\n`;
  }

  conn.reply(m.chat, text.trim(), m, {
    mentions: [haremData?.master || userId],
  });
};

handler.help = ["miharem"];
handler.tags = ["harem"];
handler.command = /^miharem$/i;

export default handler;