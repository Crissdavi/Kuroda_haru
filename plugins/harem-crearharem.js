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
  if (harems[maestro]) {
    return await conn.reply(m.chat, `✧ Ya eres el maestro de un harem.`, m);
  }
  harems[maestro] = {
    miembros: [],
    maestro: maestro,
  };
  saveHarems();
  await conn.reply(m.chat, `✩ ¡Harem creado con éxito! Eres el maestro.`, m);
};

handler.tags = ['harem'];
handler.help = ['crearharem'];
handler.command = ['crearharem'];

export default handler;