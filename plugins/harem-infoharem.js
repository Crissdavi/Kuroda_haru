import fs from 'fs';
import path from 'path';

const haremsFile = path.resolve('src/database/harems.json');
let harems = loadHarems();

function loadHarems() {
  return fs.existsSync(haremsFile) ? JSON.parse(fs.readFileSync(haremsFile, 'utf8')) : {};
}

const handler = async (m, { conn }) => {
  const maestro = m.sender;

  if (!harems[maestro]) {
    return await conn.reply(m.chat, `No tienes un harem creado.`, m);
  }

  const miembros = harems[maestro].miembros;
  const miembrosTexto = miembros.map((miembro) => `@${miembro.split('@')[0]}`).join('\n');

  await conn.sendMessage(m.chat, {
    text: `🎌 **Harem de @${maestro.split('@')[0]}** 🎌\n\n**Líder:** @${maestro.split('@')[0]}\n**Miembros del equipo:**\n${miembrosTexto || 'No hay miembros'}\n\n**Total de integrantes:** ${miembros.length}`,
    mentions: [maestro, ...miembros],
  });
};

handler.tags = ['harem'];
handler.help = ['infoharem'];
handler.command = ['infoharem'];

export default handler;