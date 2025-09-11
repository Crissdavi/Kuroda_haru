import fs from 'fs';
import path from 'path';

const DB = path.resolve('src/database/mascotas.json');
function load(){ if(!fs.existsSync(DB)) return {}; return JSON.parse(fs.readFileSync(DB, 'utf8')); }
function save(d){ fs.writeFileSync(DB, JSON.stringify(d, null, 2)); }

const handler = async (m, { conn }) => {
  const user = m.sender;
  const db = load();
  if(!db[user]) return await conn.reply(m.chat, '❌ No tienes mascota que liberar.', m);

  // eliminación automática sin confirmación
  delete db[user];
  save(db);

  await conn.sendMessage(m.chat, { text: '🐾 Tu mascota ha sido liberada. ¡Esperamos que tenga una buena vida! 🌲' }, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '🕊️', key: m.key } });
};

handler.help = ['liberar'];
handler.tags = ['mascotas'];
handler.command = ['liberar'];
export default handler;
