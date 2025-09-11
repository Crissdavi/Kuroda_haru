import fs from 'fs';
import path from 'path';

const DB = path.resolve('src/database/mascotas.json');
function load() { if(!fs.existsSync(DB)) return {}; return JSON.parse(fs.readFileSync(DB, 'utf8')); }
function save(d) { fs.writeFileSync(DB, JSON.stringify(d, null, 2)); }

function ensure(p) {
  p.nivel = p.nivel ?? p.level ?? 1;
  p.experiencia = p.experiencia ?? p.exp ?? 0;
  p.hambre = p.hambre ?? 100;
  p.salud = p.salud ?? 100;
  p.energia = p.energia ?? 100;
  p.felicidad = p.felicidad ?? 100;
}

const handler = async (m, { conn }) => {
  const user = m.sender;
  const db = load();
  const pet = db[user];
  
  if (!pet) return await conn.reply(m.chat, '❌ No tienes mascota. Usa *adoptar* para obtener una.', m);
  
  ensure(pet);
  
  // Verificar si ya está bien alimentada
  if (pet.hambre >= 95) {
    return await conn.reply(m.chat, `❌ ${pet.nombre || 'Tu mascota'} ya está llena (${pet.hambre}/100) 🍗`, m);
  }
  
  // Alimentar a la mascota (aumentar hambre entre 15-25 puntos)
  const alimentacion = Math.floor(Math.random() * 11) + 15;
  pet.hambre = Math.min(100, pet.hambre + alimentacion);
  
  // Pequeña ganancia de experiencia por alimentar
  pet.experiencia = (pet.experiencia || 0) + 5;
  
  // Mensajes aleatorios para hacerlo más divertido
  const mensajes = [
    `🍖 ${pet.nombre || 'Tu mascota'} ha comido delicioso (+${alimentacion} hambre)`,
    `🥩 ¡Ñam ñam! ${pet.nombre || 'Tu mascota'} está feliz (+${alimentacion} hambre)`,
    `🍗 Alimentaste a ${pet.nombre || 'tu mascota'} (+${alimentacion} hambre)`,
    `🥣 ${pet.nombre || 'Tu mascota'} disfrutó su comida (+${alimentacion} hambre)`
  ];
  
  const mensajeAleatorio = mensajes[Math.floor(Math.random() * mensajes.length)];
  
  save(db);
  
  await conn.reply(m.chat, `${mensajeAleatorio}\n🍗 Hambre actual: ${pet.hambre}/100`, m);
  await conn.sendMessage(m.chat, { react: { text: '🍗', key: m.key } });
};

handler.help = ['alimentar'];
handler.tags = ['mascotas'];
handler.command = ['alimentar', 'feed', 'comida'];
export default handler;