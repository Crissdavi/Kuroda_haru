import fs from 'fs';
import path from 'path';

const haremsFile = path.resolve('src/database/harems.json');
const MAX_MIEMBROS = 20;
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
  
  // Cargar datos frescos para evitar race condition
  harems = loadHarems();
  
  if (harems[maestro]) {
    return await conn.reply(m.chat, `✧ Ya eres el maestro de un harem.`, m);
  }
  
  harems[maestro] = {
    creado: new Date().toISOString(),
    maestro: maestro,
    miembros: []
  };
  
  saveHarems();
  await conn.reply(m.chat, `✩ ¡Harem creado con éxito! Eres el maestro.\n✧ Límite: ${MAX_MIEMBROS} miembros.`, m);
};

handler.tags = ['harem'];
handler.help = ['crearharem'];
handler.command = ['crearharem'];

export default handler;