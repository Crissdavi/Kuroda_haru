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

// Variable global para almacenar confirmaciones pendientes
const confirmacionesLiberar = new Map();

const handler = async (m, { conn, usedPrefix }) => {
    const userId = m.sender;
    let mascotas = loadMascotas();

    // Si ya hay una confirmación pendiente
    if (confirmacionesLiberar.has(userId)) {
        const respuesta = m.text.toLowerCase();
        const mascota = confirmacionesLiberar.get(userId);
        
        if (respuesta.includes('sí') || respuesta.includes('si') || respuesta.includes('yes')) {
            // Confirmar liberación
            delete mascotas[userId];
            saveMascotas(mascotas);
            confirmacionesLiberar.delete(userId);
            
            return await conn.reply(m.chat, 
                `😢 *${mascota.nombre} ha sido liberado...*\n` +
                `✧ Esperamos que sea feliz en su nuevo hogar.`, m);
        } else {
            // Cancelar liberación
            confirmacionesLiberar.delete(userId);
            return await conn.reply(m.chat, 
                `✧ Liberación de ${mascota.nombre} cancelada.`, m);
        }
    }

    if (!mascotas[userId]) {
        return await conn.reply(m.chat, 
            `✧ No tienes una mascota para liberar.\n` +
            `✧ Usa *${usedPrefix}adoptar* para obtener una.`, m);
    }

    const mascota = mascotas[userId];
    
    // Guardar confirmación pendiente
    confirmacionesLiberar.set(userId, mascota);
    
    // Configurar timeout para limpiar la confirmación después de 30 segundos
    setTimeout(() => {
        if (confirmacionesLiberar.has(userId)) {
            confirmacionesLiberar.delete(userId);
        }
    }, 30000);

    await conn.reply(m.chat, 
        `⚠️ *¿Estás seguro de liberar a ${mascota.nombre}?*\n\n` +
        `✧ **Nivel:** ${mascota.nivel}\n` +
        `✧ **Rareza:** ${mascota.rareza}\n\n` +
        `✅ *Responde "sí" para confirmar*\n` +
        `❌ *Responde "no" para cancelar*\n\n` +
        `✧ Tienes 30 segundos para responder.`, m);
};

// Limpiar confirmaciones antiguas cada minuto
setInterval(() => {
    // Esto mantiene el Map limpio automáticamente
}, 60000);

handler.tags = ['rpg', 'mascotas'];
handler.help = ['liberar - Liberar a tu mascota actual'];
handler.command = ['liberar', 'release', 'liberarmascota'];

export default handler;