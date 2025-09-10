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
            `✧ No tienes una mascota.\n` +
            `✧ Usa *${usedPrefix}adoptar* para obtener una.`, m);
    }

    const mascota = mascotas[userId];

    // Verificar si la mascota está enferma
    if (mascota.salud >= 80) {
        return await conn.reply(m.chat, 
            `✧ ${mascota.nombre} está saludable! ❤️\n` +
            `✧ Salud: ${Math.round(mascota.salud)}%`, m);
    }

    // Curar a la mascota
    const curacion = 30;
    mascota.salud = Math.min(100, mascota.salud + curacion);
    mascota.estadisticas.curado = (mascota.estadisticas.curado || 0) + 1;

    let mensaje = `💊 *${mascota.nombre} ha sido curado!*\n` +
                 `✧ Salud: +${curacion}%\n` +
                 `✧ Ahora tiene: ${Math.round(mascota.salud)}% de salud`;

    // Mensaje especial si estaba muy enfermo
    if (mascota.salud < 50) {
        mensaje += `\n\n⚠️ *¡Cuidado!* ${mascota.nombre} aún necesita más cuidados.`;
    }

    saveMascotas(mascotas);
    await conn.reply(m.chat, mensaje, m);
};

handler.tags = ['rpg', 'mascotas'];
handler.help = ['curar - Curar a tu mascota si está enferma'];
handler.command = ['curar', 'heal', 'medicina'];

export default handler;