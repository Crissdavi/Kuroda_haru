// liberar.js
import fs from 'fs';
import path from 'path';

const mascotasFile = path.resolve('src/database/mascotas.json');

function loadMascotas() {
  try {
    return fs.existsSync(mascotasFile) 
      ? JSON.parse(fs.readFileSync(mascotasFile, 'utf8')) 
      : {};
  } catch (error) {
    console.error('Error cargando mascotas:', error);
    return {};
  }
}

function saveMascotas(data) {
  try {
    fs.writeFileSync(mascotasFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error guardando mascotas:', error);
  }
}

const handler = async (m, { conn, usedPrefix }) => {
  const userId = m.sender;
  let mascotas = loadMascotas();

  if (!mascotas[userId]) {
    return await conn.reply(
      m.chat,
      `✧ No tienes ninguna mascota para liberar...\n` +
      `✧ Usa *${usedPrefix}adoptar* para darle un nuevo hogar a una.`,
      m
    );
  }

  const mascota = mascotas[userId];

  // Eliminar mascota
  delete mascotas[userId];
  saveMascotas(mascotas);

  // Reaccionar al mensaje del usuario
  await conn.sendMessage(m.chat, { react: { text: '😢', key: m.key } });

  // Mensaje triste de despedida
  await conn.reply(
    m.chat,
    `💔 *${mascota.nombre} se ha ido...*\n\n` +
    `• Nivel alcanzado: ${mascota.nivel}\n` +
    `• Rareza: ${mascota.rareza}\n\n` +
    `😢 Tu fiel compañero ya no estará contigo...\n` +
    `🌌 Esperamos que encuentre un lugar donde sea feliz.\n\n` +
    `🌱 Siempre puedes adoptar otra mascota con *${usedPrefix}adoptar*`,
    m
  );
};

handler.tags = ['rpg', 'mascotas'];
handler.help = ['liberar - Liberar a tu mascota actual (sin confirmación)'];
handler.command = ['liberar', 'release', 'liberarmascota'];

export default handler;