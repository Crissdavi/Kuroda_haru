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
  const miembro = m.mentionedJid?.[0];

  // Cargar datos frescos
  harems = loadHarems();

  if (!miembro) {
    return await conn.reply(m.chat, '✧ Debes mencionar a alguien para agregar al harem.', m);
  }

  if (!harems[maestro] || !harems[maestro].miembros) {
    return await conn.reply(m.chat, '✧ Primero crea un harem con *crearharem*.', m);
  }

  if (miembro === maestro) {
    return await conn.reply(m.chat, '✧ No puedes agregarte a ti mismo.', m);
  }

  // Verificar límite de miembros
  if (harems[maestro].miembros.length >= MAX_MIEMBROS) {
    return await conn.reply(m.chat, `✧ ¡Límite alcanzado! Solo puedes tener ${MAX_MIEMBROS} miembros en tu harem.`, m);
  }

  if (harems[maestro].miembros.includes(miembro)) {
    return await conn.reply(m.chat, '✧ Este usuario ya está en tu harem.', m);
  }

  // Verificar si está en otro harem (excluyendo el actual)
  const yaEnOtroHarem = Object.keys(harems).some(maestroId => 
    maestroId !== maestro && 
    harems[maestroId].miembros && 
    harems[maestroId].miembros.includes(miembro)
  );

  if (yaEnOtroHarem) {
    return await conn.reply(m.chat, '✧ Este usuario ya pertenece a otro harem.', m);
  }

  // Agregar miembro
  harems[maestro].miembros.push(miembro);
  saveHarems();

  await conn.sendMessage(m.chat, {
    text: `✅ @${miembro.split('@')[0]} ha sido agregado a tu harem.\n✧ Miembros: ${harems[maestro].miembros.length}/${MAX_MIEMBROS}`,
    mentions: [miembro]
  });
};

handler.tags = ['harem'];
handler.help = ['unirharem @usuario'];
handler.command = ['unirharem', 'agregarharem'];

export default handler;