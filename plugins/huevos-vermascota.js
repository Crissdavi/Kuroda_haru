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

function obtenerEtapa(nivel) {
    if (nivel < 5) return 'bebe';
    if (nivel < 10) return 'joven';
    if (nivel < 20) return 'adulto';
    return 'legendario';
}

function getBarraProgreso(progreso, largo = 10) {
    const completado = Math.round((progreso / 100) * largo);
    const vacio = largo - completado;
    return '█'.repeat(completado) + '░'.repeat(vacio);
}

function actualizarEstadoMascota(userId, mascotas) {
    if (!mascotas[userId]) return null;
    
    const mascota = mascotas[userId];
    const ahora = Date.now();
    const tiempoTranscurrido = (ahora - mascota.ultimaActualizacion) / 60000;
    
    // Reducir stats con el tiempo
    mascota.hambre = Math.max(0, mascota.hambre - (tiempoTranscurrido * 0.5));
    mascota.felicidad = Math.max(0, mascota.felicidad - (tiempoTranscurrido * 0.3));
    mascota.energia = Math.max(0, mascota.energia - (tiempoTranscurrido * 0.2));
    
    // Actualizar etapa
    mascota.etapa = obtenerEtapa(mascota.nivel);
    
    mascota.ultimaActualizacion = ahora;
    return mascota;
}

const handler = async (m, { conn, usedPrefix }) => {
    const userId = m.sender;
    let mascotas = loadMascotas();

    if (!mascotas[userId]) {
        return await conn.reply(m.chat, 
            `✧ No tienes una mascota.\n` +
            `✧ Usa *${usedPrefix}adoptar* para obtener un huevo.`, m);
    }

    const mascota = actualizarEstadoMascota(userId, mascotas);
    
    const estado = 
        `🐾 *${mascota.nombre}* (${mascota.etapa.toUpperCase()})\n` +
        `✧ **Nivel:** ${mascota.nivel}\n` +
        `✧ **Rareza:** ${mascota.rareza}\n` +
        `✧ **EXP:** ${mascota.experiencia}/${mascota.nivel * 100}\n` +
        `${getBarraProgreso((mascota.experiencia / (mascota.nivel * 100)) * 100)}\n\n` +
        `❤️  Salud: ${Math.round(mascota.salud)}%\n` +
        `🍖 Hambre: ${Math.round(mascota.hambre)}%\n` +
        `🎭 Felicidad: ${Math.round(mascota.felicidad)}%\n` +
        `⚡ Energía: ${Math.round(mascota.energia)}%\n\n` +
        `📊 **Estadísticas:**\n` +
        `• Alimentado: ${mascota.estadisticas.alimentado} veces\n` +
        `• Jugado: ${mascota.estadisticas.jugado} veces\n` +
        `• Entrenado: ${mascota.estadisticas.entrenado} veces\n\n` +
        `📅 Adoptada: ${new Date(mascota.adoptada).toLocaleDateString()}`;

    await conn.reply(m.chat, estado, m);
};

handler.tags = ['mascotas'];
handler.help = ['mypet - Ver estado de tu mascota'];
handler.command = ['mypet'];

export default handler;