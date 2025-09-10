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

const handler = async (m, { conn, usedPrefix, text }) => {
    const userId = m.sender;
    let mascotas = loadMascotas();

    if (!mascotas[userId]) {
        return await conn.reply(m.chat, 
            `✧ No tienes una mascota.\n` +
            `✧ Usa *${usedPrefix}adoptar* para obtener una.`, m);
    }

    if (!text) {
        return await conn.reply(m.chat, 
            `✧ Debes especificar un nuevo nombre.\n` +
            `✧ Ejemplo: *${usedPrefix}renombrar Rex*`, m);
    }

    const nuevoNombre = text.trim();
    if (nuevoNombre.length > 20) {
        return await conn.reply(m.chat, 
            `✧ El nombre es demasiado largo.\n` +
            `✧ Máximo 20 caracteres.`, m);
    }

    const viejoNombre = mascotas[userId].nombre;
    mascotas[userId].nombre = nuevoNombre;

    saveMascotas(mascotas);
    
    await conn.reply(m.chat, 
        `✏️ *¡Nombre cambiado!*\n` +
        `✧ De: ${viejoNombre}\n` +
        `✧ A: ${nuevoNombre}`, m);
};

handler.tags = ['rpg', 'mascotas'];
handler.help = ['renombrar [nombre] - Cambiar el nombre de tu mascota'];
handler.command = ['renombrar', 'rename', 'cambiarnombre'];

export default handler;