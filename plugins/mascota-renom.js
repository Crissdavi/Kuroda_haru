import fs from 'fs';
import path from 'path';

const DB = path.resolve('src/database/mascotas.json');
function load(){ if(!fs.existsSync(DB)) return {}; return JSON.parse(fs.readFileSync(DB, 'utf8')); }
function save(d){ fs.writeFileSync(DB, JSON.stringify(d, null, 2)); }

const cooldowns = {};
function cooldownLeft(user, cmd){ const key = `${user}:${cmd}`, now = Date.now(); if(!cooldowns[key] || now>cooldowns[key]){ cooldowns[key]=now+60000; return 0;} return Math.ceil((cooldowns[key]-now)/1000); }

const handler = async (m, { conn, args }) => {
  const user = m.sender;
  const db = load();
  const pet = db[user];
  if(!pet) return await conn.reply(m.chat, '❌ No tienes mascota. Usa *adoptar*.', m);

  const left = cooldownLeft(user, 'renombrar');
  if (left) return await conn.reply(m.chat, `⏳ Espera ${left}s antes de renombrar.`, m);

  if (!args || args.length === 0) return await conn.reply(m.chat, '✏️ Usa: .renombrar NuevoNombre', m);

  const nuevo = args.join(' ').trim().slice(0, 32);
  const viejo = pet.nombre || 'Sin nombre';
  pet.nombre = nuevo;

  save(db);
  await conn.sendMessage(m.chat, { text: `✅ Tu mascota fue renombrada de *${viejo}* a *${nuevo}*.` }, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '💫', key: m.key } });
};

handler.help = ['renombrar <nombre>'];
handler.tags = ['mascotas'];
handler.command = ['renombrar'];
export default handler;
