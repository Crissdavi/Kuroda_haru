import fs from 'fs';
import path from 'path';

const DB = path.resolve('src/database/mascotas.json');
function load(){ if(!fs.existsSync(DB)) return {}; return JSON.parse(fs.readFileSync(DB, 'utf8')); }
function save(d){ fs.writeFileSync(DB, JSON.stringify(d, null, 2)); }

function ensure(p){
  p.nivel = p.nivel ?? p.level ?? 1;
  p.experiencia = p.experiencia ?? p.exp ?? 0;
  p.hambre = p.hambre ?? 100;
  p.salud = p.salud ?? 100;
  p.energia = p.energia ?? 100;
  p.felicidad = p.felicidad ?? 100;
}
function needed(n){ return n*100; }
function getStage(n){ if(n<5) return 'Bebé'; if(n<10) return 'Niño'; if(n<20) return 'Joven'; return 'Adulto'; }
function progressBar(exp, needed, len=12){
  const filled = Math.floor((exp/needed)*len);
  return '█'.repeat(Math.max(0, Math.min(len, filled))) + '░'.repeat(len - Math.max(0, Math.min(len, filled)));
}

const handler = async (m, { conn }) => {
  const user = m.sender;
  const db = load();
  const pet = db[user];
  if(!pet) return await conn.reply(m.chat, '❌ No tienes mascota. Usa *adoptar*.', m);

  ensure(pet);
  const neededExp = needed(pet.nivel);
  const bar = progressBar(pet.experiencia, neededExp);
  const txt =
`🐾 *Tu Mascota*
${pet.emoji || pet.tipo || ''} *${pet.nombre || 'Sin nombre'}*

⭐ Nivel: *${pet.nivel}*
🏷 Rareza: *${pet.rareza || 'Desconocida'}*
🏁 Etapa: *${pet.etapa ?? getStage(pet.nivel)}*

📈 Experiencia: ${pet.experiencia}/${neededExp}
${bar}

💖 Salud: ${pet.salud ?? 100}/100
🍗 Hambre: ${pet.hambre ?? 100}/100
🔋 Energía: ${pet.energia ?? 100}/100
😊 Felicidad: ${pet.felicidad ?? 100}/100
`;

  await conn.sendMessage(m.chat, { text: txt }, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });
};

handler.help = ['mimascota'];
handler.tags = ['mascotas'];
handler.command = ['mimascota','mascota', 'mypet'];
export default handler;
