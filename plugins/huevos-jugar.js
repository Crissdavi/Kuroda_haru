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

function verificarNivel(userId, mascotas) {
    const mascota = mascotas[userId];
    const expNecesaria = mascota.nivel * 100;
    
    if (mascota.experiencia >= expNecesaria) {
        const viejoNivel = mascota.nivel;
        mascota.nivel++;
        mascota.experiencia = 0;
        return viejoNivel;
    }
    return null;
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

    if (mascota.energia < 20) {
        return await conn.reply(m.chat, 
            `✧ ${mascota.nombre} está muy cansado para jugar 😴\n` +
            `✧ Usa *${usedPrefix}dormir* para que descanse.`, m);
    }

    // Jugar
    mascota.felicidad = Math.min(100, mascota.felicidad + 25);
    mascota.energia = Math.max(0, mascota.energia - 15);
    mascota.experiencia += 20;
    mascota.estadisticas.jugado++;
    
    const subioNivel = verificarNivel(userId, mascotas);
    
    let mensaje = `🎮 ¡Jugaste con *${mascota.nombre}*!\n` +
                 `✧ Felicidad: +25%\n` +
                 `✧ Energía: -15%\n` +
                 `✧ EXP: +20`;
    
    if (subioNivel) {
        mensaje += `\n\n🎉 *¡NIVEL SUBIDO!* ${subioNivel} → ${mascota.nivel}`;
    }

    saveMascotas(mascotas);
    await conn.reply(m.chat, mensaje, m);
};

handler.tags = ['rpg', 'mascotas'];
handler.help = ['jugar - Jugar con tu mascota'];
handler.command = ['jugar', 'play'];

export default handler;