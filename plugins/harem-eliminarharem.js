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
  const usuario = m.sender;
  
  // Cargar datos frescos
  harems = loadHarems();

  // Verificar si el usuario tiene un harem
  if (!harems[usuario]) {
    return await conn.reply(m.chat, '✧ No tienes un harem para eliminar.', m);
  }

  // Verificar que sea el maestro del harem
  if (harems[usuario].maestro !== usuario) {
    return await conn.reply(m.chat, '✧ Solo el maestro del harem puede eliminarlo.', m);
  }

  // Obtener información antes de eliminar
  const miembrosCount = harems[usuario].miembros.length;
  const haremCreado = harems[usuario].creado ? new Date(harems[usuario].creado).toLocaleDateString() : 'fecha desconocida';

  // Eliminar el harem directamente
  delete harems[usuario];
  saveHarems();

  await conn.reply(m.chat, 
    `🗑️ *HAREM ELIMINADO*\n\n✧ Harem creado el ${haremCreado} eliminado.\n✧ Miembros liberados: ${miembrosCount}\n\n✅ Ya no eres maestro de ningún harem.`,
    m
  );
};

handler.tags = ['harem'];
handler.help = ['eliminarharem'];
handler.command = ['eliminarharem'];

export default handler;