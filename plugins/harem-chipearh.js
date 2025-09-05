import fs from 'fs';
import path from 'path';

const haremsFile = path.resolve('src/database/harems.json');

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
  const harems = loadHarems();

  if (!harems[usuario] || !harems[usuario].miembros || harems[usuario].miembros.length < 2) {
    return await conn.reply(m.chat, '✧ Necesitas al menos 2 miembros en tu harem para shippear.', m);
  }

  const miembros = harems[usuario].miembros;
  const [persona1, persona2] = miembros.sort(() => Math.random() - 0.5).slice(0, 2);
  
  const porcentaje = Math.floor(Math.random() * 101);
  const nombresShip = [
    `${persona1.split('@')[0].slice(0, 3)}${persona2.split('@')[0].slice(-3)}`,
    `${persona2.split('@')[0].slice(0, 3)}${persona1.split('@')[0].slice(-3)}`,
    `Amor${porcentaje}`,
    `Destino${Math.floor(Math.random() * 100)}`,
    `${persona1.split('@')[0].charAt(0)}${persona2.split('@')[0].charAt(0)}Love`
  ];
  
  const shipName = nombresShip[Math.floor(Math.random() * nombresShip.length)];
  
  const mensajes = [
    `💕 ¡Son alma gemelas!`,
    `👨‍❤️‍👨 Pareja perfecta encontrada`,
    `💔 Mejor sean amigos...`,
    `🔥 ¡Química explosiva!`,
    `❄️ Hielo y fuego`,
    `🌈 Arcoíris de amor`,
    `⚡ Amor a primera vista`,
    `🌙 Noche de pasión`,
    `☀️ Día de romance`,
    `💫 Destino escrito en las estrellas`
  ];

  // Emoji basado en el porcentaje
  let emojiCompatibilidad = '💔';
  if (porcentaje >= 80) emojiCompatibilidad = '💖';
  else if (porcentaje >= 60) emojiCompatibilidad = '💕';
  else if (porcentaje >= 40) emojiCompatibilidad = '💝';
  else if (porcentaje >= 20) emojiCompatibilidad = '💘';

  const mensaje = `💘 *SHIP DEL HAREM* 💘

@${persona1.split('@')[0]} ❤️ @${persona2.split('@')[0]}

🏷️ *Ship name:* ${shipName}
${emojiCompatibilidad} *Compatibilidad:* ${porcentaje}%

💬 ${mensajes[Math.floor(Math.random() * mensajes.length)]}

${porcentaje >= 80 ? '🎉 ¡Match perfecto!' : ''}
${porcentaje <= 30 ? '😅 Quizás en otra vida...' : ''}`;

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: [persona1, persona2]
  });
};

handler.tags = ['harem', 'fun'];
handler.help = ['shippeaharem'];
handler.command = ['shippeaharem', 'shipharem', 'shipear'];

export default handler;