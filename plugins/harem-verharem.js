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
  const objetivo = m.mentionedJid?.[0] || m.quoted?.sender || (m.text.split(' ')[1] ? m.text.split(' ')[1] + '@s.whatsapp.net' : null);
  
  const harems = loadHarems();

  if (!objetivo) {
    return await conn.reply(m.chat, 
      '✧ Debes mencionar o responder al usuario cuyo harem quieres ver.\n' +
      '✧ Ejemplo: *verharem @usuario*',
      m
    );
  }

  if (!harems[objetivo]) {
    return await conn.reply(m.chat, 
      `✧ @${objetivo.split('@')[0]} no tiene un harem creado.`,
      m,
      { mentions: [objetivo] }
    );
  }

  if (objetivo === usuario) {
    return await conn.reply(m.chat, 
      '✧ Para ver tu propio harem usa *miharem*',
      m
    );
  }

  const haremData = harems[objetivo];
  const miembros = haremData.miembros || [];
  
  // Formatear información
  const fechaCreacion = haremData.creado 
    ? new Date(haremData.creado).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : 'Fecha desconocida';

  const miembrosTexto = miembros.length > 0 
    ? miembros.map((miembro, index) => `➥ ${index + 1}. @${miembro.split('@')[0]}`).join('\n')
    : '✦ No hay miembros aún';

  // Crear mensaje con formato
  const mensaje = `🎌 *HAREM DE @${objetivo.split('@')[0]}* 🎌

✦ *Líder:* @${objetivo.split('@')[0]}
✦ *Creado:* ${fechaCreacion}
✦ *Miembros:* ${miembros.length}/20

👥 *INTEGRANTES:*
${miembrosTexto}

⚡ *ESTADO:* ${miembros.length >= 20 ? '🔴 Lleno' : '🟢 Disponible'}
${miembros.length >= 15 ? '💪 ¡Harem poderoso!' : ''}
${miembros.length <= 5 ? '🌱 Harem en crecimiento' : ''}`;

  // Enviar mensaje con menciones
  const todasMenciones = [objetivo, ...miembros];
  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: todasMenciones
  });
};

handler.tags = ['harem'];
handler.help = ['verharem @usuario'];
handler.command = ['verharem', 'verharem', 'viewharem', 'vh'];

export default handler;