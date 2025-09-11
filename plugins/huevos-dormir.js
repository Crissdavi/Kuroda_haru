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

    if (mascota.energia >= 100) {
        return await conn.reply(m.chat, 
            `✧ ${mascota.nombre} ya está descansado! ⚡\n` +
            `✧ Energía: ${Math.round(mascota.energia)}%`, m);
    }

    // Descansar
    const energiaRecuperada = 100 - mascota.energia;
    mascota.energia = 100;
    mascota.ultimaActualizacion = Date.now();
    
    await conn.reply(m.chat, 
        `😴 *${mascota.nombre}* está descansando...\n` +
        `✧ Energía: +${energiaRecuperada}%\n` +
        `✧ Ahora tiene: 100% de energía ⚡`, m);

    saveMascotas(mascotas);
};

handler.tags = ['rpg', 'mascotas'];
handler.help = ['dormir - Hacer descansar a tu mascota'];
handler.command = ['dormir', 'sleep'];

export default handler;