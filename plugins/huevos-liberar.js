import fs from 'fs';
import path from 'path';

const mascotasFile = path.resolve('src/database/mascotas.json');

function loadMascotas() {
    try {
        return fs.existsSync(mascotasFile) ? JSON.parse(fs.readFileSync(mascotasFile, 'utf8')) : {};
    } catch (error) {
        console.error('Error loading mascotas:', error);
        return {};
    }
}

function saveMascotas(data) {
    try {
        fs.writeFileSync(mascotasFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving mascotas:', error);
    }
}

const handler = async (m, { conn, usedPrefix }) => {
    const userId = m.sender;
    let mascotas = loadMascotas();

    if (!mascotas[userId]) {
        return await conn.reply(m.chat, 
            `✧ No tienes una mascota para liberar.\n` +
            `✧ Usa *${usedPrefix}adoptar* para obtener una.`, m);
    }

    const mascota = mascotas[userId];
    
    // Confirmación de liberación
    await conn.reply(m.chat, 
        `⚠️ *¿Estás seguro de liberar a ${mascota.nombre}?*\n\n` +
        `✧ **Nivel:** ${mascota.nivel}\n` +
        `✧ **Rareza:** ${mascota.rareza}\n\n` +
        `✅ Responde *sí* para confirmar\n` +
        `❌ Responde *no* para cancelar`, m);

    // Esperar confirmación
    const filter = (msg) => msg.sender === userId && ['sí', 'si', 'yes', 'no'].includes(msg.body.toLowerCase());
    const response = await conn.waitForMessage(m.chat, filter, { time: 30000 });
    
    if (!response || response.body.toLowerCase() === 'no') {
        return await conn.reply(m.chat, 
            `✧ Liberación de ${mascota.nombre} cancelada.`, m);
    }

    // Liberar mascota
    delete mascotas[userId];
    saveMascotas(mascotas);
    
    await conn.reply(m.chat, 
        `😢 *${mascota.nombre} ha sido liberado...*\n` +
        `✧ Esperamos que sea feliz en su nuevo hogar.\n\n` +
        `✨ Puedes adoptar otra mascota con *${usedPrefix}adoptar*`, m);
};

handler.tags = ['mascotas'];
handler.help = ['liberar - Liberar a tu mascota actual'];
handler.command = ['liberar', 'release', 'liberarmascota'];

export default handler;