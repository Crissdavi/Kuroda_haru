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

function obtenerEstadoMascota(mascota) {
    if (mascota.salud < 30) return { emoji: '🤒', estado: 'Gravemente enfermo', necesita: 'curar urgentemente' };
    if (mascota.salud < 50) return { emoji: '😷', estado: 'Enfermo', necesita: 'medicina' };
    if (mascota.hambre < 20) return { emoji: '😵', estado: 'Hambriento', necesita: 'comida' };
    if (mascota.felicidad < 20) return { emoji: '😢', estado: 'Triste', necesita: 'jugar' };
    if (mascota.energia < 20) return { emoji: '😴', estado: 'Agotado', necesita: 'descansar' };
    return { emoji: '😊', estado: 'Saludable', necesita: 'seguir cuidándome' };
}

function actualizarEstadoMascota(userId, mascotas) {
    if (!mascotas[userId]) return null;
    
    const mascota = mascotas[userId];
    const ahora = Date.now();
    const tiempoTranscurrido = (ahora - mascota.ultimaActualizacion) / 60000;
    
    // Reducir stats normales
    mascota.hambre = Math.max(0, mascota.hambre - (tiempoTranscurrido * 0.5));
    mascota.felicidad = Math.max(0, mascota.felicidad - (tiempoTranscurrido * 0.3));
    mascota.energia = Math.max(0, mascota.energia - (tiempoTranscurrido * 0.2));
    
    // ⚠️ SISTEMA DE ENFERMEDADES - AGREGADO ✅
    if (mascota.hambre < 10) {
        mascota.salud = Math.max(0, mascota.salud - (tiempoTranscurrido * 0.2)); // Desnutrición
    }
    
    if (mascota.felicidad < 10) {
        mascota.salud = Math.max(0, mascota.salud - (tiempoTranscurrido * 0.1)); // Depresión
    }
    
    if (mascota.energia < 5) {
        mascota.salud = Math.max(0, mascota.salud - (tiempoTranscurrido * 0.15)); // Agotamiento
    }
    // ⚠️ FIN DEL SISTEMA DE ENFERMEDADES ✅
    
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
            `✧ Usa *${usedPrefix}adoptar* para obtener una.`, m);
    }

    const mascota = actualizarEstadoMascota(userId, mascotas);
    const estadoInfo = obtenerEstadoMascota(mascota);
    const expNecesario = mascota.nivel * 100;
    const progresoExp = (mascota.experiencia / expNecesario) * 100;

    const mensaje = 
        `🐾 *${mascota.nombre}* ${estadoInfo.emoji} (${mascota.etapa.toUpperCase()})\n` +
        `✧ **Estado:** ${estadoInfo.estado}\n` +
        `✧ **Nivel:** ${mascota.nivel}\n` +
        `✧ **Rareza:** ${mascota.rareza}\n` +
        `✧ **EXP:** ${mascota.experiencia}/${expNecesario}\n` +
        `${getBarraProgreso(progresoExp)}\n\n` +
        `❤️  Salud: ${Math.round(mascota.salud)}% ${mascota.salud < 50 ? '⚠️' : ''}\n` +
        `🍖 Hambre: ${Math.round(mascota.hambre)}% ${mascota.hambre < 30 ? '⚠️' : ''}\n` +
        `🎭 Felicidad: ${Math.round(mascota.felicidad)}% ${mascota.felicidad < 30 ? '⚠️' : ''}\n` +
        `⚡ Energía: ${Math.round(mascota.energia)}% ${mascota.energia < 30 ? '⚠️' : ''}\n\n` +
        `💡 **Necesita:** ${estadoInfo.necesita}\n\n` +
        `📊 **Estadísticas de cuidado:**\n` +
        `• 🍖 Alimentado: ${mascota.estadisticas.alimentado || 0} veces\n` +
        `• 🎮 Jugado: ${mascota.estadisticas.jugado || 0} veces\n` +
        `• 💪 Entrenado: ${mascota.estadisticas.entrenado || 0} veces\n` +
        `• 💊 Curado: ${mascota.estadisticas.curado || 0} veces\n\n` +
        `📅 **Adoptada:** ${new Date(mascota.adoptada).toLocaleDateString()}\n` +
        `👤 **Dueño:** ${userId.split('@')[0]}`;

    await conn.reply(m.chat, mensaje, m);
};

handler.tags = ['rpg', 'mascotas'];
handler.help = ['mascota - Ver estado de tu mascota'];
handler.command = ['mascota', 'pet', 'mypet'];

export default handler;