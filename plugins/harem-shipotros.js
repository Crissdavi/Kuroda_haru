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
  const harems = loadHarems();
  
  // Obtener todos los miembros de todos los harems
  const todosMiembros = [];
  
  Object.values(harems).forEach(haremData => {
    if (haremData.miembros && haremData.miembros.length > 0) {
      haremData.miembros.forEach(miembro => {
        // Agregar información del harem de origen
        todosMiembros.push({
          jid: miembro,
          haremOrigen: Object.keys(harems).find(key => harems[key].miembros.includes(miembro))
        });
      });
    }
  });

  if (todosMiembros.length < 2) {
    return await conn.reply(m.chat, '✧ Necesita haber al menos 2 miembros en total entre todos los harems.', m);
  }

  // Seleccionar dos miembros aleatorios de DIFERENTES harems
  let persona1, persona2;
  let intentos = 0;
  const maxIntentos = 20;
  
  do {
    persona1 = todosMiembros[Math.floor(Math.random() * todosMiembros.length)];
    persona2 = todosMiembros[Math.floor(Math.random() * todosMiembros.length)];
    intentos++;
  } while (
    (persona1.jid === persona2.jid || persona1.haremOrigen === persona2.haremOrigen) &&
    intentos < maxIntentos
  );

  if (persona1.haremOrigen === persona2.haremOrigen) {
    return await conn.reply(m.chat, 
      '✧ No se encontraron miembros de diferentes harems para shippear.\n' +
      '✧ Intenta nuevamente o espera a que haya más harems.',
      m
    );
  }

  // Obtener nombres de los harems de origen
  const harem1Nombre = harems[persona1.haremOrigen]?.maestro ? 
    `@${harems[persona1.haremOrigen].maestro.split('@')[0]}` : 'Harem Desconocido';
  
  const harem2Nombre = harems[persona2.haremOrigen]?.maestro ? 
    `@${harems[persona2.haremOrigen].maestro.split('@')[0]}` : 'Harem Desconocido';

  // Generar ship
  const porcentaje = Math.floor(Math.random() * 101);
  const nombresShip = [
    `${persona1.jid.split('@')[0].slice(0, 3)}${persona2.jid.split('@')[0].slice(-3)}`,
    `${persona2.jid.split('@')[0].slice(0, 3)}${persona1.jid.split('@')[0].slice(-3)}`,
    `AmorCruzado${porcentaje}`,
    `${persona1.jid.split('@')[0].charAt(0)}${persona2.jid.split('@')[0].charAt(0)}X`,
    `DestinoInterHarem`,
    `RomeoYJulieta${Math.floor(Math.random() * 100)}`,
    `AmorProhibido`
  ];
  
  const shipName = nombresShip[Math.floor(Math.random() * nombresShip.length)];
  
  // Mensajes especiales para ships entre harems
  const mensajes = [
    `💕 ¡Amor que cruza fronteras de harems!`,
    `👨‍❤️‍👨 Romance inter-harem descubierto`,
    `💔 Amor prohibido entre diferentes reinos`,
    `🔥 ¡Química que ignora los límites!`,
    `❄️ Fuego y hielo se encuentran`,
    `🌈 Arcoíris que une dos mundos`,
    `⚡ Amor a través de los harems`,
    `🌙 Noche de pasión inter-harem`,
    `☀️ Romance bajo el sol de dos reinos`,
    `💫 Destino cruzó sus caminos`,
    `🎭 Drama de amor entre harems`,
    `🏰 Romeo y Julieta moderna`,
    `⚔️ Amor en medio de la rivalidad`,
    `🎪 Romance circense entre harems`,
    `🌉 Puente de amor entre dos mundos`
  ];

  // Emoji basado en el porcentaje
  let emojiCompatibilidad = '💔';
  if (porcentaje >= 80) emojiCompatibilidad = '💖';
  else if (porcentaje >= 60) emojiCompatibilidad = '💕';
  else if (porcentaje >= 40) emojiCompatibilidad = '💝';
  else if (porcentaje >= 20) emojiCompatibilidad = '💘';

  const mensaje = `💞 *SHIP INTER-HAREMS* 💞

@${persona1.jid.split('@')[0]} ❤️ @${persona2.jid.split('@')[0]}

🏰 *Procedencia:*
   👑 @${persona1.jid.split('@')[0]} → ${harem1Nombre}
   👑 @${persona2.jid.split('@')[0]} → ${harem2Nombre}

🏷️ *Ship name:* ${shipName}
${emojiCompatibilidad} *Compatibilidad:* ${porcentaje}%

💬 ${mensajes[Math.floor(Math.random() * mensajes.length)]}

${porcentaje >= 80 ? '🎉 ¡Amor que vence todas las barreras!' : ''}
${porcentaje <= 30 ? '😅 Quizás los harems no están destinados a unirse...' : ''}
${persona1.haremOrigen === persona2.haremOrigen ? '✨ ¡Mismo harem, mismo amor!' : '⚔️ ¡Amor entre reinos diferentes!'}`;

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: [persona1.jid, persona2.jid, persona1.haremOrigen, persona2.haremOrigen]
  });
};

handler.tags = ['harem', 'fun'];
handler.help = ['shipearotros'];
handler.command = ['shipearotros', 'shipotros', 'interharem', 'crossship'];

export default handler;