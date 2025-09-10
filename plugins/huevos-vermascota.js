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
    phoenix: { pack: 'Phoenix Pack', author: 'Mascotas RPG', emoji: '🔥' },
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

// Stickers por etapa/estado
const STICKERS_ESTADO = {
    bebe: '👶',
    joven: '👦',
    adulto: '👨',
    legendario: '👑',
    feliz: '😊',
    hambriento: '😋',
    cansado: '😴',
    enfermo: '🤒'
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

function obtenerEmojiEstado(mascota) {
    if (mascota.hambre < 30) return '😋'; // Hambriento
    if (mascota.felicidad < 30) return '😢'; // Triste
    if (mascota.energia < 30) return '😴'; // Cansado
    if (mascota.salud < 50) return '🤒'; // Enfermo
    return '😊'; // Feliz
}

function actualizarEstadoMascota(userId, mascotas) {
    if (!mascotas[userId]) return null;
    
    const mascota = mascotas[userId];
    const ahora = Date.now();
    const tiempoTranscurrido = (ahora - mascota.ultimaActualizacion) / 60000;
    
    mascota.hambre = Math.max(0, mascota.hambre - (tiempoTranscurrido * 0.5));
    mascota.felicidad = Math.max(0, mascota.felicidad - (tiempoTranscurrido * 0.3));
    mascota.energia = Math.max(0, mascota.energia - (tiempoTranscurrido * 0.2));
    
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
        // Crear sticker con texto (puedes personalizar más)
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
            `✧ Usa *${usedPrefix}adoptar* para obtener un huevo.`, m);
    }

    const mascota = actualizarEstadoMascota(userId, mascotas);
    const stickerConfig = STICKERS_MASCOTAS[mascota.tipo] || STICKERS_MASCOTAS.cat;
    
    // Crear sticker de la mascota
    const stickerBuffer = await crearStickerMascota(mascota);
    
    // Mensaje de estado
    const estado = 
        `🐾 *${mascota.nombre}* ${stickerConfig.emoji} (${mascota.etapa.toUpperCase()})\n` +
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

    // Enviar sticker primero
    if (stickerBuffer) {
        await conn.sendMessage(m.chat, {
            sticker: stickerBuffer
        }, { quoted: m });
    }

    // Enviar estado después
    await conn.reply(m.chat, estado, m);
};

handler.tags = ['rpg', 'mascotas'];
handler.help = ['mascota - Ver estado de tu mascota con sticker'];
handler.command = ['mascota', 'pet', 'mypet'];

export default handler;