import fs from 'fs';
import path from 'path';
import { Sticker, createSticker, StickerTypes } from 'wa-sticker-formatter';

const mascotasFile = path.resolve('src/database/mascotas.json');

// Mapeo de tipos de mascota a stickers/emojis
const STICKERS_MASCOTAS = {
    dragon: { pack: 'Dragon Pack', author: 'Mascotas RPG', emoji: '🐉' },
    fox: { pack: 'Fox Pack', author: 'Mascotas RPG', emoji: '🦊' },
    cat: { pack: 'Cat Pack', author: 'Mascotas RPG', emoji: '🐱' },
    dog: { pack: 'Dog Pack', author: 'Mascotas RPG', emoji: '🐶' },
    rabbit: { pack: 'Rabbit Pack', author: 'Mascotas RPG', emoji: '🐰' },
    phoenix: { pack: 'Phoenix Pack', author: 'Mascotas RPG', emoji: '🐦‍🔥' },
    wolf: { pack: 'Wolf Pack', author: 'Mascotas RPG', emoji: '🐺' },
    panda: { pack: 'Panda Pack', author: 'Mascotas RPG', emoji: '🐼' },
    unicorn: { pack: 'Unicorn Pack', author: 'Mascotas RPG', emoji: '🦄' },
    hamster: { pack: 'Hamster Pack', author: 'Mascotas RPG', emoji: '🐹' },
    turtle: { pack: 'Turtle Pack', author: 'Mascotas RPG', emoji: '🐢' },
    owl: { pack: 'Owl Pack', author: 'Mascotas RPG', emoji: '🦉' },
    dinosaur: { pack: 'Dino Pack', author: 'Mascotas RPG', emoji: '🦖' },
    penguin: { pack: 'Penguin Pack', author: 'Mascotas RPG', emoji: '🐧' },
    monkey: { pack: 'Monkey Pack', author: 'Mascotas RPG', emoji: '🐵' },
    bear: { pack: 'Bear Pack', author: 'Mascotas RPG', emoji: '🐻' },
    tiger: { pack: 'Tiger Pack', author: 'Mascotas RPG', emoji: '🐯' },
    lion: { pack: 'Lion Pack', author: 'Mascotas RPG', emoji: '🦁' },
    snake: { pack: 'Snake Pack', author: 'Mascotas RPG', emoji: '🐍' },
    frog: { pack: 'Frog Pack', author: 'Mascotas RPG', emoji: '🐸' }
};

// Stickers por estado de salud
const STICKERS_ESTADO = {
    saludable: '😊',
    hambriento: '😋',
    cansado: '😴',
    enfermo: '😷',
    grave: '🤒',
    triste: '😢'
};

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

function obtenerEmojiEstado(mascota) {
    if (mascota.salud < 30) return '🤒';
    if (mascota.salud < 50) return '😷';
    if (mascota.hambre < 20) return '😵';
    if (mascota.felicidad < 20) return '😢';
    if (mascota.energia < 20) return '😴';
    return '😊';
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
    
    // Sistema de enfermedades
    if (mascota.hambre < 10) {
        mascota.salud = Math.max(0, mascota.salud - (tiempoTranscurrido * 0.2)); // Desnutrición
    }
    
    if (mascota.felicidad < 10) {
        mascota.salud = Math.max(0, mascota.salud - (tiempoTranscurrido * 0.1)); // Depresión
    }
    
    if (mascota.energia < 5) {
        mascota.salud = Math.max(0, mascota.salud - (tiempoTranscurrido * 0.15)); // Agotamiento
    }
    
    mascota.etapa = obtenerEtapa(mascota.nivel);
    mascota.ultimaActualizacion = ahora;
    return mascota;
}

async function crearStickerMascota(mascota) {
    const stickerConfig = STICKERS_MASCOTAS[mascota.tipo] || STICKERS_MASCOTAS.cat;
    const emojiEstado = obtenerEmojiEstado(mascota);
    
    // Texto para el sticker
    const textoSticker = 
        `${stickerConfig.emoji} ${mascota.nombre}\n` +
        `Nvl: ${mascota.nivel} | ${mascota.etapa.toUpperCase()}\n` +
        `Estado: ${emojiEstado}`;

    try {
        // Crear sticker con texto
        const sticker = new Sticker(textoSticker, {
            pack: stickerConfig.pack,
            author: stickerConfig.author,
            type: StickerTypes.FULL,
            categories: ['🤩', '🎉'],
            id: '12345',
            quality: 70,
            background: '#000000'
        });

        return await sticker.toBuffer();
    } catch (error) {
        console.error('Error creando sticker:', error);
        return null;
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

    const mascota = actualizarEstadoMascota(userId, mascotas);
    const estado = obtenerEstadoMascota(mascota);
    const stickerConfig = STICKERS_MASCOTAS[mascota.tipo] || STICKERS_MASCOTAS.cat;
    
    // Crear sticker de la mascota
    const stickerBuffer = await crearStickerMascota(mascota);
    
    // Mensaje de estado
    const mensaje = 
        `🐾 *${mascota.nombre}* ${stickerConfig.emoji} (${mascota.etapa.toUpperCase()})\n` +
        `✧ **Estado:** ${estado.estado} ${estado.emoji}\n` +
        `✧ **Nivel:** ${mascota.nivel}\n` +
        `✧ **Rareza:** ${mascota.rareza}\n` +
        `✧ **EXP:** ${mascota.experiencia}/${mascota.nivel * 100}\n` +
        `${getBarraProgreso((mascota.experiencia / (mascota.nivel * 100)) * 100)}\n\n` +
        `❤️  Salud: ${Math.round(mascota.salud)}% ${mascota.salud < 50 ? '⚠️' : ''}\n` +
        `🍖 Hambre: ${Math.round(mascota.hambre)}% ${mascota.hambre < 30 ? '⚠️' : ''}\n` +
        `🎭 Felicidad: ${Math.round(mascota.felicidad)}% ${mascota.felicidad < 30 ? '⚠️' : ''}\n` +
        `⚡ Energía: ${Math.round(mascota.energia)}% ${mascota.energia < 30 ? '⚠️' : ''}\n\n` +
        `💡 **Necesita:** ${estado.necesita}\n\n` +
        `📊 **Estadísticas:**\n` +
        `• Alimentado: ${mascota.estadisticas.alimentado || 0} veces\n` +
        `• Jugado: ${mascota.estadisticas.jugado || 0} veces\n` +
        `• Entrenado: ${mascota.estadisticas.entrenado || 0} veces\n` +
        `• Curado: ${mascota.estadisticas.curado || 0} veces\n\n` +
        `📅 Adoptada: ${new Date(mascota.adoptada).toLocaleDateString()}`;

    // Enviar sticker primero
    if (stickerBuffer) {
        await conn.sendMessage(m.chat, {
            sticker: stickerBuffer
        }, { quoted: m });
    }

    // Enviar estado después
    await conn.reply(m.chat, mensaje, m);
};

handler.tags = ['rpg', 'mascotas'];
handler.help = ['mascota - Ver estado de tu mascota con sticker'];
handler.command = ['mascota', 'pet', 'mypet'];

export default handler;