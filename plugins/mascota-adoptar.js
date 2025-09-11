import fs from 'fs';
import path from 'path';

const mascotasFile = path.resolve('src/database/mascotas.json');

const TIPOS_HUEVOS = {
  comun: { emoji: '🥚', nombre: 'Huevo Común', mascotas: ['cat','dog','rabbit','hamster','turtle'] },
  raro: { emoji: '🔮', nombre: 'Huevo Raro', mascotas: ['fox','wolf','panda','owl'] },
  epico: { emoji: '💎', nombre: 'Huevo Épico', mascotas: ['dragon','unicorn','dinosaur','phoenix'] },
  legendario: { emoji: '🌟', nombre: 'Huevo Legendario', mascotas: ['dragon','unicorn','phoenix'] },
  misterioso: { emoji: '❓', nombre: 'Huevo Misterioso', mascotas: ['cat','dog','fox','dragon','phoenix','unicorn','wolf'] }
};

const TIPOS_MASCOTAS = {
  dragon: { emoji: '🐉', nombre: 'Dragón', rareza: 'Legendario' },
  fox: { emoji: '🦊', nombre: 'Zorro', rareza: 'Raro' },
  cat: { emoji: '🐱', nombre: 'Gato', rareza: 'Común' },
  dog: { emoji: '🐶', nombre: 'Perro', rareza: 'Común' },
  rabbit: { emoji: '🐰', nombre: 'Conejo', rareza: 'Común' },
  phoenix: { emoji: '🔥', nombre: 'Fénix', rareza: 'Legendario' },
  wolf: { emoji: '🐺', nombre: 'Lobo', rareza: 'Raro' },
  panda: { emoji: '🐼', nombre: 'Panda', rareza: 'Raro' },
  unicorn: { emoji: '🦄', nombre: 'Unicornio', rareza: 'Legendario' },
  hamster: { emoji: '🐹', nombre: 'Hámster', rareza: 'Común' },
  turtle: { emoji: '🐢', nombre: 'Tortuga', rareza: 'Común' },
  owl: { emoji: '🦉', nombre: 'Búho', rareza: 'Raro' },
  dinosaur: { emoji: '🦖', nombre: 'Dinosaurio', rareza: 'Legendario' }
};

function loadMascotas() {
  try {
    if (!fs.existsSync(mascotasFile)) return {};
    return JSON.parse(fs.readFileSync(mascotasFile, 'utf8'));
  } catch (e) {
    console.error('Error loading mascotas.json', e);
    return {};
  }
}

function saveMascotas(data) {
  try {
    fs.writeFileSync(mascotasFile, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving mascotas.json', e);
  }
}

function obtenerHuevoAleatorio() {
  const probabilidades = [
    { tipo: 'comun', prob: 40 },
    { tipo: 'raro', prob: 20 },
    { tipo: 'epico', prob: 20 },
    { tipo: 'legendario', prob: 10},
    { tipo: 'misterioso', prob: 10 }
  ];
  const rnd = Math.random() * 100;
  let acum = 0;
  for (const p of probabilidades) {
    acum += p.prob;
    if (rnd <= acum) return p.tipo;
  }
  return 'comun';
}

function obtenerMascotaDeHuevo(tipo) {
  const huevo = TIPOS_HUEVOS[tipo];
  return huevo.mascotas[Math.floor(Math.random() * huevo.mascotas.length)];
}

async function enviarAnimacionEclosion(conn, chat, usuario, huevo, mascotaInfo) {
  const nombreUsuario = usuario.split('@')[0];
  // mensaje inicial
  const initial = await conn.sendMessage(chat, { text: `🥚 *${nombreUsuario}* ha encontrado un ${huevo.emoji} *${huevo.nombre}*...\n¿Qué criatura habrá dentro?` });
  await new Promise(r => setTimeout(r, 1800));
  // brillo
  await conn.sendMessage(chat, { text: `🔮 El huevo comienza a brillar...\n¡Algo está pasando!`, edit: initial.key });
  await new Promise(r => setTimeout(r, 1800));
  // crack
  await conn.sendMessage(chat, { text: `💫 *CRACK!* El huevo se está abriendo...`, edit: initial.key });
  await new Promise(r => setTimeout(r, 1800));
  // reveal
  await conn.sendMessage(chat, {
    text:
      `🎉 *¡FELICIDADES ${nombreUsuario}!*\n\n` +
      `✨ El ${huevo.emoji} *${huevo.nombre}* ha eclosionado y...\n\n` +
      `🐾 *¡HA NACIDO UN ${mascotaInfo.nombre.toUpperCase()}!* ${mascotaInfo.emoji}\n\n` +
      `✧ Rareza: ${mascotaInfo.rareza}\n` +
      `✧ Nivel: 1\n\n` +
      `• Usa *${process.env.PREFIX || '#'}mascota* para ver su estado\n` +
      `• *${process.env.PREFIX || '#'}alimentar* / *${process.env.PREFIX || '#'}jugar* / *${process.env.PREFIX || '#'}entrenar* / *${process.env.PREFIX || '#'}curar*`,
    edit: initial.key
  });
}

const handler = async (m, { conn, args, usedPrefix }) => {
  try {
    const userId = m.sender;
    const mascotas = loadMascotas();

    if (mascotas[userId]) {
      return await conn.reply(m.chat, `✧ Ya tienes una mascota.\nUsa *${usedPrefix}mascota* para verla o *${usedPrefix}liberar* para soltarla.`, m);
    }

    let tipo = args[0]?.toLowerCase();
    if (tipo && !TIPOS_HUEVOS[tipo]) {
      return await conn.reply(m.chat, `✧ Tipo de huevo no válido.\nDisponibles: ${Object.keys(TIPOS_HUEVOS).join(', ')}\nO usa *${usedPrefix}adoptar* sin tipo para uno aleatorio.`, m);
    }
    if (!tipo) tipo = obtenerHuevoAleatorio();

    const huevo = TIPOS_HUEVOS[tipo];
    const tipoMascota = obtenerMascotaDeHuevo(tipo);
    const mascotaInfo = TIPOS_MASCOTAS[tipoMascota];

    await enviarAnimacionEclosion(conn, m.chat, userId, huevo, mascotaInfo);

    // crear mascota
    mascotas[userId] = {
      emoji: mascotaInfo.emoji,
      nombre: mascotaInfo.nombre,
      tipo: tipoMascota,
      nivel: 1,
      experiencia: 0,
      experienciaMax: 100,
      hambre: 100,
      salud: 100,
      felicidad: 100,
      energia: 100,
      rareza: mascotaInfo.rareza,
      etapa: 'Bebé',
      lastUpdate: Date.now(),
      estadisticas: { alimentado: 0, jugado: 0, entrenado: 0, curado: 0 },
      adoptada: new Date().toISOString()
    };

    saveMascotas(mascotas);
  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, 'Error interno al adoptar. Intenta nuevamente.', m);
  }
};

handler.help = ['adoptar [tipo-huevo]'];
handler.tags = ['mascotas', 'rpg'];
handler.command = /^adoptar$/i;

export default handler;