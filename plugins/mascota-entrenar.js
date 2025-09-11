import fs from 'fs';
import path from 'path';

const DB = path.resolve('src/database/mascotas.json');

function load() { if (!fs.existsSync(DB)) return {}; return JSON.parse(fs.readFileSync(DB, 'utf8')); }
function save(d){ fs.writeFileSync(DB, JSON.stringify(d, null, 2)); }

const cooldowns = {};
function cooldownLeft(user, cmd) {
  const key = `${user}:${cmd}`, now = Date.now();
  if (!cooldowns[key] || now > cooldowns[key]) { cooldowns[key] = now + 60_000; return 0; }
  return Math.ceil((cooldowns[key] - now)/1000);
}

function ensure(pet) {
  pet.nivel = pet.nivel ?? pet.level ?? 1;
  pet.experiencia = pet.experiencia ?? pet.exp ?? 0;
  pet.energia = pet.energia ?? 100;
}

function needed(n){ return n*100; }
function getStage(n){ if(n<5) return 'Bebé'; if(n<10) return 'Niño'; if(n<20) return 'Joven'; return 'Adulto'; }

async function checkLevelUp(pet, conn, m) {
  while (pet.experiencia >= needed(pet.nivel)) {
    pet.experiencia -= needed(pet.nivel);
    pet.nivel++;
    pet.etapa = getStage(pet.nivel);
    await conn.sendMessage(m.chat, { text: `🎉 *Nivel ${pet.nivel}!* Tu mascota *${pet.nombre || ''}* ha subido de nivel.` }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '🌟', key: m.key } });
  }
}

const handler = async (m, { conn }) => {
  const user = m.sender;
  const db = load();
  const pet = db[user];
  if (!pet) return await conn.reply(m.chat, '❌ No tienes mascota. Usa *adoptar*.', m);

  const left = cooldownLeft(user, 'entrenar');
  if (left) return await conn.reply(m.chat, `⏳ Espera ${left}s antes de entrenar otra vez.`, m);

  ensure(pet);
  // entrenar: +30 XP, consume energia
  pet.energia = Math.max(0, pet.energia - 18);
  pet.experiencia += 30;

  await conn.sendMessage(m.chat, { text: `🏋️ Entrenaste a *${pet.nombre || pet.tipo}*.\n+30 XP` }, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '💪', key: m.key } });

  await checkLevelUp(pet, conn, m);
  save(db);
};

handler.help = ['entrenar'];
handler.tags = ['mascotas','acciones'];
handler.command = ['entrenar'];
export default handler;
