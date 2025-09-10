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

    // Verificar energía con margen de error
    if (mascota.energia >= 99) {
        return await conn.reply(m.chat, 
            `✧ ${mascota.nombre} ya está completamente descansado! ⚡\n` +
            `✧ Energía: ${Math.round(mascota.energia)}%`, m);
    }

    // Calcular energía necesaria para llegar al 100%
    const energiaNecesaria = 100 - mascota.energia;
    
    // Descansar mascota - poner al 100% exacto
    mascota.energia = 100;
    mascota.ultimaActualizacion = Date.now(); // Actualizar timestamp
    
    await conn.reply(m.chat, 
        `😴 *${mascota.nombre}* está descansando...\n` +
        `✧ Energía: +${Math.round(energiaNecesaria)}%\n` +
        `✧ Ahora tiene: 100% de energía ⚡`, m);

    saveMascotas(mascotas);
};

handler.tags = ['rpg', 'mascotas'];
handler.help = ['dormir - Hacer descansar a tu mascota'];
handler.command = ['dormir', 'descansar', 'sleep'];

export default handler;