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
  
  if (Object.keys(harems).length === 0) {
    return await conn.reply(m.chat, '✧ No hay harems creados todavía.', m);
  }

  let lista = '📋 *LISTA COMPLETA DE HAREMS* 📋\n\n';
  let contador = 1;
  let totalMiembros = 0;

  // Ordenar por cantidad de miembros (descendente)
  const haremsOrdenados = Object.entries(harems)
    .sort((a, b) => b[1].miembros.length - a[1].miembros.length);

  haremsOrdenados.forEach(([maestro, data]) => {
    const emoji = getEmojiByRank(contador);
    const fecha = data.creado ? new Date(data.creado).toLocaleDateString() : '??/??/????';
    const estado = data.miembros.length >= 20 ? '🔴 LLENO' : '🟢 ACTIVO';
    
    lista += `${emoji} *${contador}.* @${maestro.split('@')[0]}\n`;
    lista += `   👥 ${data.miembros.length}/20 miembros | ${estado}\n`;
    lista += `   📅 ${fecha}\n\n`;
    
    totalMiembros += data.miembros.length;
    contador++;
  });

  lista += `📊 *ESTADÍSTICAS:*\n`;
  lista += `✨ Harems totales: ${Object.keys(harems).length}\n`;
  lista += `👥 Miembros totales: ${totalMiembros}\n`;
  lista += `📈 Promedio: ${(totalMiembros / Object.keys(harems).length).toFixed(1)} miembros/harem`;

  const menciones = Object.keys(harems);
  await conn.sendMessage(m.chat, {
    text: lista,
    mentions: menciones
  });
};

function getEmojiByRank(rank) {
  const emojis = {
    1: '👑',  // 1er lugar
    2: '🥈',  // 2do lugar  
    3: '🥉',  // 3er lugar
    default: '▸' // Resto
  };
  return emojis[rank] || emojis.default;
}

handler.tags = ['harem'];
handler.help = ['listaharems'];
handler.command = ['listaharems', 'haremslista', 'listah'];

export default handler;