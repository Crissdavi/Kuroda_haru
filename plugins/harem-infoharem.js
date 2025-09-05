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

  if (!harems[usuario]) {
    return await conn.reply(m.chat, '✧ No tienes un harem creado. Usa *crearharem* para iniciar uno.', m);
  }

  const haremData = harems[usuario];
  const miembros = haremData.miembros || [];
  const maestro = haremData.maestro || usuario;
  
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
  const mensaje = `🎌 *TU HAREM* 🎌

✦ *Líder:* @${maestro.split('@')[0]}
✦ *Creado:* ${fechaCreacion}
✦ *Miembros:* ${miembros.length}/20

👥 *TUS INTEGRANTES:*
${miembrosTexto}

⚡ *ESTADO:* ${miembros.length >= 20 ? '🔴 Lleno' : '🟢 Disponible'}
💡 Usa *verharem @usuario* para ver otros harems`;

  // Enviar mensaje con menciones
  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: [maestro, ...miembros]
  });
};

handler.tags = ['harem'];
handler.help = ['miharem'];
handler.command = ['miharem', 'myharem', 'meharem'];

export default handler;