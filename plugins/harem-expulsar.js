import fs from 'fs';
import path from 'path';

const haremsFile = path.resolve('src/database/harems.json');
let harems = loadHarems();

function loadHarems() {
  try {
    return fs.existsSync(haremsFile) ? JSON.parse(fs.readFileSync(haremsFile, 'utf8')) : {};
  } catch (error) {
    console.error('Error loading harems:', error);
    return {};
  }
}

function saveHarems() {
  try {
    fs.writeFileSync(haremsFile, JSON.stringify(harems, null, 2));
  } catch (error) {
    console.error('Error saving harems:', error);
  }
}

const handler = async (m, { conn }) => {
  const maestro = m.sender;
  const miembro = m.mentionedJid?.[0];
  
  harems = loadHarems();

  if (!miembro) {
    return await conn.reply(m.chat, '✧ Debes mencionar a quien quieres expulsar del harem.', m);
  }

  if (!harems[maestro]) {
    return await conn.reply(m.chat, '✧ No tienes un harem creado.', m);
  }

  if (maestro === miembro) {
    return await conn.reply(m.chat, '✧ No puedes expulsarte a ti mismo.', m);
  }

  if (!harems[maestro].miembros.includes(miembro)) {
    return await conn.reply(m.chat, '✧ Este usuario no está en tu harem.', m);
  }

  // Expulsar al miembro
  harems[maestro].miembros = harems[maestro].miembros.filter(m => m !== miembro);
  saveHarems();

  await conn.sendMessage(m.chat, {
    text: `🚫 @${miembro.split('@')[0]} ha sido expulsado del harem.\n✧ Miembros restantes: ${harems[maestro].miembros.length}/20`,
    mentions: [miembro]
  });
};

handler.tags = ['harem'];
handler.help = ['expulsar @usuario'];
handler.command = ['expulsar', 'kickharem', 'echar'];

export default handler;