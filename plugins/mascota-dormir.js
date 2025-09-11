import fs from 'fs';
import path from 'path';

const DB = path.resolve('src/database/mascotas.json');
function load(){ if(!fs.existsSync(DB)) return {}; return JSON.parse(fs.readFileSync(DB, 'utf8')); }
function save(d){ fs.writeFileSync(DB, JSON.stringify(d, null, 2)); }

const cooldowns = {};
function cooldownLeft(user, cmd){ const key = `${user}:${cmd}`, now = Date.now(); if(!cooldowns[key] || now>cooldowns[key]){ cooldowns[key]=now+60000; return 0;} return Math.ceil((cooldowns[key]-now)/1000); }

function ensure(p){ p.nivel = p.nivel ?? p.level ?? 1; p.experiencia = p.experiencia ?? p.exp ?? 0; p.energia = p.energia ?? 100; p.hambre = p.hambre ?? 100; }
function needed(n){ return n*100; }
function getStage(n){ if(n<5) return 'Bebé'; if(n<10) return 'Niño'; if(n<20) return 'Joven'; return 'Adulto'; }

async function checkLevelUp(pet, conn, m) {
  while (pet.experiencia >= needed(pet.nivel)) {
    pet.experiencia -= needed(pet.nivel);
    pet.nivel++;
    pet.etapa = getStage(pet.nivel);
    await conn.sendMessage(m.chat, { text: `🎉 ¡Tu mascota subió a nivel ${pet.nivel}!` }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '🌟', key: m.key } });
  }
}

const handler = async (m, { conn }) => {
  const user = m.sender;
  const db = load();
  const pet = db[user];
  if(!pet) return await conn.reply(m.chat, '❌ No tienes mascota. Usa *adoptar*.', m);

  const left = cooldownLeft(user, 'dormir');
  if (left) return await conn.reply(m.chat, `⏳ Espera ${left}s antes de usar dormir.`, m);

  ensure(pet);
  pet.energia = Math.min(100, (pet.energia ?? 100) + 40);
  pet.hambre = Math.max(0, (pet.hambre ?? 100) - 18);
  pet.experiencia += 10;

  await conn.sendMessage(m.chat, { text: `😴 ${pet.nombre || pet.tipo} se durmió y recuperó energía.\n+10 XP` }, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '🌙', key: m.key } });

  await checkLevelUp(pet, conn, m);
  save(db);
};

handler.help = ['dormir'];
handler.tags = ['mascotas','acciones'];
handler.command = ['dormir'];
export default handler;
