import fs from 'fs';
import path from 'path';

const haremsFile = path.resolve('src/database/harems.json');
let harems = loadHarems();

function loadHarems() {
  try {
    return fs.existsSync(haremsFile) ? JSON.parse(fs.readFileSync(haremsFile, 'utf8')) : {};
  } catch (error) {
    console.error('Error loading harems:', error);
    return {};
  }
}

const handler = async (m, { conn }) => {
  const usuario = m.sender;
  harems = loadHarems();

  if (!harems[usuario] || harems[usuario].miembros.length < 2) {
    return await conn.reply(m.chat, '✧ Necesitas al menos 2 miembros en tu harem para pelear.', m);
  }

  const miembros = harems[usuario].miembros;
  const [luchador1, luchador2] = miembros.sort(() => Math.random() - 0.5).slice(0, 2);
  
  const ataques = ['✨ Rayo celestial', '🔥 Fuego infernal', '💧 Tsunami épico', '🌪️ Tornado devastador', '⚡ Electrocute'];
  const resultados = ['ganó gloriosamente', 'perdió patéticamente', 'empató heroicamente'];
  
  const ataque1 = ataques[Math.floor(Math.random() * ataques.length)];
  const ataque2 = ataques[Math.floor(Math.random() * ataques.length)];
  const resultado = resultados[Math.floor(Math.random() * resultados.length)];

  const mensaje = `⚔️ *BATALLA EN EL HAREM* ⚔️

@${luchador1.split('@')[0]} usa: ${ataque1}
@${luchador2.split('@')[0]} contraataca con: ${ataque2}

🎯 Resultado: ${resultado}

${resultado.includes('ganó') ? `🏆 ¡@${luchador1.split('@')[0]} es el campeón!` : ''}`;

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: [luchador1, luchador2]
  });
};

handler.tags = ['harem', 'fun'];
handler.help = ['peleaharem'];
handler.command = ['peleaharem', 'batallaharem'];

export default handler;