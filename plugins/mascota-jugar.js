import fs from 'fs';
import path from 'path';

const DB = path.resolve('src/database/mascotas.json');

function load() {
  if (!fs.existsSync(DB)) return {};
  return JSON.parse(fs.readFileSync(DB, 'utf8'));
}
function save(data) { fs.writeFileSync(DB, JSON.stringify(data, null, 2)); }

const cooldowns = {};
function cooldownLeft(user, cmd) {
  const key = `${user}:${cmd}`;
  const now = Date.now();
  if (!cooldowns[key] || now > cooldowns[key]) {
    cooldowns[key] = now + 60_000;
    return 0;
  }
  return Math.ceil((cooldowns[key] - now) / 1000);
}

function ensure(pet) {
  pet.nivel = pet.nivel ?? pet.level ?? 1;
  pet.experiencia = pet.experiencia ?? pet.exp ?? 0;
  pet.hambre = pet.hambre ?? 100;
  pet.salud = pet.salud ?? 100;
  pet.felicidad = pet.felicidad ?? 100;
}

function neededExp(nivel) { return nivel * 100; }
function getStage(n) {
  if (n < 5) return 'Bebé';
  if (n < 10) return 'Niño';
  if (n < 20) return 'Joven';
  return 'Adulto';
}
function progressBar(exp, needed, len = 12) {
  const filled = Math.floor((exp / needed) * len);
  return '█'.repeat(Math.max(0, Math.min(len, filled))) + '░'.repeat(len - Math.max(0, Math.min(len, filled)));
}

async function checkLevelUp(pet, conn, m) {
  let changed = false;
  while (pet.experiencia >= neededExp(pet.nivel)) {
    pet.experiencia -= neededExp(pet.nivel);
    pet.nivel++;
    pet.etapa = getStage(pet.nivel);
    // mensaje especial al subir de nivel
    await conn.sendMessage(m.chat, { text: `🎉 ¡Tu mascota *${pet.nombre || 'Sin nombre'}* subió a nivel *${pet.nivel}*! ✨\nEtapa: *${pet.etapa}*` }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '🌟', key: m.key } });
    changed = true;
  }
  return changed;
}

const handler = async (m, { conn }) => {
  const user = m.sender;
  const pets = load();
  const pet = pets[user];
  if (!pet) return await conn.reply(m.chat, '❌ No tienes mascota. Usa *adoptar* para conseguir una.', m);

  const left = cooldownLeft(user, 'jugar');
  if (left) return await conn.reply(m.chat, `⏳ Espera ${left}s antes de volver a jugar.`, m);

  ensure(pet);

  // efectos de jugar
  pet.hambre = Math.max(0, pet.hambre - 8);
  pet.felicidad = Math.min(100, (pet.felicidad ?? 100) + 12);
  pet.experiencia += 20;

  await conn.sendMessage(m.chat, { text: `🎾 Jugaste con *${pet.nombre || pet.tipo || 'tu mascota'}*.\n+20 XP` }, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '❤', key: m.key } });

  await checkLevelUp(pet, conn, m);

  save(pets);
};

handler.help = ['jugar'];
handler.tags = ['mascotas'];
handler.command = ['jugar'];
export default handler;
