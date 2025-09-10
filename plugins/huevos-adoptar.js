import fs from 'fs';
import path from 'path';

const mascotasFile = path.resolve('src/database/mascotas.json');

const TIPOS_HUEVOS = {
    comun: { emoji: '🥚', nombre: 'Huevo Común', rareza: 'Común', mascotas: ['cat', 'dog', 'rabbit', 'hamster'] },
    raro: { emoji: '🔮', nombre: 'Huevo Raro', rareza: 'Raro', mascotas: ['fox', 'wolf', 'panda', 'owl'] },
    epico: { emoji: '💎', nombre: 'Huevo Épico', rareza: 'Épico', mascotas: ['dragon', 'phoenix', 'unicorn', 'dinosaur'] },
    legendario: { emoji: '🌟', nombre: 'Huevo Legendario', rareza: 'Legendario', mascotas: ['phoenix', 'dragon', 'unicorn'] },
    misterioso: { emoji: '❓', nombre: 'Huevo Misterioso', rareza: 'Misterioso', mascotas: ['cat', 'dog', 'fox', 'dragon', 'phoenix', 'unicorn', 'wolf'] }
};

const TIPOS_MASCOTAS = {
    dragon: { emoji: '🐉', nombre: 'Dragón', rareza: 'Legendario' },
    fox: { emoji: '🦊', nombre: 'Zorro', rareza: 'Raro' },
    cat: { emoji: '🐱', nombre: 'Gato', rareza: 'Común' },
    dog: { emoji: '🐶', nombre: 'Perro', rareza: 'Común' },
    rabbit: { emoji: '🐰', nombre: 'Conejo', rareza: 'Común' },
    phoenix: { emoji: '🔥', nombre: 'Fénix', rareza: 'Mítico' },
    wolf: { emoji: '🐺', nombre: 'Lobo', rareza: 'Raro' },
    panda: { emoji: '🐼', nombre: 'Panda', rareza: 'Raro' },
    unicorn: { emoji: '🦄', nombre: 'Unicornio', rareza: 'Legendario' },
    hamster: { emoji: '🐹', nombre: 'Hámster', rareza: 'Común' },
    turtle: { emoji: '🐢', nombre: 'Tortuga', rareza: 'Común' },
    owl: { emoji: '🦉', nombre: 'Búho', rareza: 'Raro' },
    dinosaur: { emoji: '🦖', nombre: 'Dinosaurio', rareza: 'Legendario' }
};

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

function obtenerHuevoAleatorio() {
    const probabilidades = [
        { tipo: 'comun', prob: 60 },
        { tipo: 'raro', prob: 25 },
        { tipo: 'epico', prob: 10 },
        { tipo: 'legendario', prob: 4 },
        { tipo: 'misterioso', prob: 1 }
    ];
    
    const random = Math.random() * 100;
    let acumulado = 0;
    
    for (const huevo of probabilidades) {
        acumulado += huevo.prob;
        if (random <= acumulado) {
            return huevo.tipo;
        }
    }
    return 'comun';
}

function obtenerMascotaDeHuevo(tipoHuevo) {
    const huevo = TIPOS_HUEVOS[tipoHuevo];
    const mascotasPosibles = huevo.mascotas;
    const mascotaAleatoria = mascotasPosibles[Math.floor(Math.random() * mascotasPosibles.length)];
    return mascotaAleatoria;
}

async function enviarAnimacionEclosion(conn, chat, usuario, huevo, mascotaInfo) {
    const nombreUsuario = usuario.split('@')[0];
    
    // Paso 1: Mensaje inicial
    let msg = await conn.sendMessage(chat, { 
        text: `🥚 *${nombreUsuario}* ha encontrado un ${huevo.emoji} *${huevo.nombre}*...\n¿Qué criatura habrá dentro?` 
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Paso 2: Huevo brillando (editamos el mensaje anterior)
    await conn.sendMessage(chat, {
        text: `🔮 El huevo comienza a brillar suavemente...\n¡Algo está pasando!`,
        edit: msg.key
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Paso 3: Eclosionando
    await conn.sendMessage(chat, {
        text: `💫 *CRACK!* ¡El huevo se está abriendo!\n¡Prepárate para lo que viene!`,
        edit: msg.key
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Paso 4: Revelación final
    await conn.sendMessage(chat, {
        text: `🎉 *¡FELICIDADES ${nombreUsuario}!*\n\n` +
              `✨ El ${huevo.emoji} *${huevo.nombre}* ha eclosionado y...\n\n` +
              `🐾 *¡HA NACIDO UN ${mascotaInfo.nombre.toUpperCase()}!* ${mascotaInfo.emoji}\n\n` +
              `✧ **Rareza:** ${mascotaInfo.rareza}\n` +
              `✧ **Tipo:** ${mascotaInfo.nombre}\n` +
              `✧ **Nivel:** 1\n\n` +
              `💫 *¡Una nueva aventura comienza!*\n` +
              `• Usa *!mascota* para ver su estado\n` +
              `• *!alimentar* para darle comida\n` +
              `• *!jugar* para divertirte con él\n\n` +
              `🎊 ¡${mascotaInfo.emoji.repeat(3)} FELICIDADES ${mascotaInfo.emoji.repeat(3)}`,
        edit: msg.key
    });
}

const handler = async (m, { conn, usedPrefix, command, args }) => {
    const userId = m.sender;
    const chat = m.chat;
    let mascotas = loadMascotas();

    if (mascotas[userId]) {
        return await conn.reply(m.chat, 
            `✧ Ya tienes una mascota.\n` +
            `✧ Usa *${usedPrefix}mascota* para verla.\n` +
            `✧ Usa *${usedPrefix}liberar* si quieres adoptar otra.`, m);
    }

    // Obtener tipo de huevo
    let tipoHuevo = args[0]?.toLowerCase();
    if (tipoHuevo && !TIPOS_HUEVOS[tipoHuevo]) {
        const tiposDisponibles = Object.keys(TIPOS_HUEVOS).join(', ');
        return await conn.reply(m.chat, 
            `✧ Tipo de huevo no válido.\n` +
            `✧ Disponibles: ${tiposDisponibles}\n` +
            `✧ O usa *${usedPrefix}adoptar* sin tipo para uno aleatorio`, m);
    }

    if (!tipoHuevo) {
        tipoHuevo = obtenerHuevoAleatorio();
    }

    const huevo = TIPOS_HUEVOS[tipoHuevo];
    const tipoMascota = obtenerMascotaDeHuevo(tipoHuevo);
    const mascotaInfo = TIPOS_MASCOTAS[tipoMascota];

    // Enviar animación de eclosión
    await enviarAnimacionEclosion(conn, chat, userId, huevo, mascotaInfo);

    // Crear la mascota
    mascotas[userId] = {
        nombre: mascotaInfo.nombre,
        tipo: tipoMascota,
        nivel: 1,
        experiencia: 0,
        hambre: 100,
        felicidad: 100,
        energia: 100,
        salud: 100,
        ultimaActualizacion: Date.now(),
        adoptada: new Date().toISOString(),
        rareza: mascotaInfo.rareza,
        etapa: 'bebe',
        estadisticas: {
            alimentado: 0,
            jugado: 0,
            entrenado: 0
        },
        procedencia: {
            deHuevo: true,
            tipoHuevo: tipoHuevo,
            fechaEclosion: new Date().toISOString()
        }
    };

    saveMascotas(mascotas);
};

handler.tags = ['rpg', 'mascotas'];
handler.help = ['adoptar [tipo-huevo] - Adoptar un huevo que eclosionará'];
handler.command = ['adoptar', 'gethuevo', 'obtenerhuevo'];

export default handler;