import fs from 'fs';
import path from 'path';

const haremsFile = path.resolve('src/database/harems.json');
let harems = loadHarems();

function loadHarems() {
  return fs.existsSync(haremsFile) ? JSON.parse(fs.readFileSync(haremsFile, 'utf8')) : {};
}

function saveHarems() {
  fs.writeFileSync(haremsFile, JSON.stringify(harems, null, 2));
}

const handler = async (m, { conn }) => {
  const maestro = m.sender;
  const miembro = m.mentionedJid?.[0];

  if (!miembro) return;

  if (!harems[maestro]) return;

  if (!harems[maestro].miembros.includes(miembro)) {
    harems[maestro].miembros.push(miembro);
    saveHarems();
    await conn.sendMessage(m.chat, {
      text: `✩ ¡${conn.getName(miembro)} ahora tu amo es @${maestro.split('@')[0]}!`,
      mentions: [maestro, miembro],
    });
  }
};

handler.tags = ['harem'];
handler.help = ['unirharem'];
handler.command = ['unirharem'];

export default handler;