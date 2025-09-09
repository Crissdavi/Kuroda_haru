import fs from 'fs';
import path from 'path';

const mascotasFile = path.resolve('src/database/mascotas.json');

// Tipos de mascotas disponibles
const TIPOS_MASCOTAS = {
    dragon: { emoji: '🐉', nombre: 'Dragón', rareza: 'Legendario' },
    fox: { emoji: '🦊', nombre: 'Zorro', rareza: 'Raro' },
    cat: { emoji: '🐱', nombre: 'Gato', rareza: 'Común' },
    dog: { emoji: '🐶', nombre: 'Perro', rareza: 'Común' },
    rabbit: { emoji: '🐰', nombre: 'Conejo', rareza: 'Común' },
    phoenix: { emoji: '🐦‍🔥', nombre: 'Fénix', rareza: 'Mítico' },
    wolf: { emoji: '🐺', nombre: 'Lobo', rareza: 'Raro' },
    panda: { emoji: '🐼', nombre: 'Panda', rareza: 'Raro' },
    unicorn: { emoji: '🦄', nombre: 'Unicornio', rareza: 'Legendario' },
    hamster: { emoji: '🐹', nombre: 'Hámster', rareza: 'Común' },
    turtle: { emoji: '🐢', nombre: 'Tortuga', rareza: 'Común' },
    owl: { emoji: '🦉', nombre: 'Búho', rareza: 'Raro' },
    dinosaur: { emoji: '🦖', nombre: 'Dinosaurio', rareza: 'Legendario' },
    penguin: { emoji: '🐧', nombre: 'Pingüino', rareza: 'Raro' },
    monkey: { emoji: '🐵', nombre: 'Mono', rareza: 'Común' },
    bear: { emoji: '🐻', nombre: 'Oso', rareza: 'Raro' },
    tiger: { emoji: '🐯', nombre: 'Tigre', rareza: 'Raro' },
    lion: { emoji: '🦁', nombre: 'León', rareza: 'Raro' },
    snake: { emoji: '🐍', nombre: 'Serpiente', rareza: 'Común' },
    frog: { emoji: '🐸', nombre: 'Rana', rareza: 'Común' }
};

// Probabilidades de rareza
const PROBABILIDADES = {
    'Común': 60,
    'Raro': 25,
    'Legendario': 10,
    'Mítico': 5
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

function obtenerMascotaAleatoria() {
    // Filtrar mascotas por rareza según probabilidades
    const randomRareza = Math.random() * 100;
    let rarezaSeleccionada = 'Común';
    let acumulado = 0;

    for (const [rareza, prob] of Object.entries(PROBABILIDADES)) {
        acumulado += prob;
        if (randomRareza <= acumulado) {
            rarezaSeleccionada = rareza;
            break;
        }
    }

    // Obtener todas las mascotas de la rareza seleccionada
    const mascotasDeRareza = Object.entries(TIPOS_MASCOTAS)
        .filter(([_, info]) => info.rareza === rarezaSeleccionada)
        .map(([tipo, info]) => ({ tipo, ...info }));

    // Seleccionar una mascota aleatoria de esa rareza
    const mascotaAleatoria = mascotasDeRareza[Math.floor(Math.random() * mascotasDeRareza.length)];
    
    return { ...mascotaAleatoria, rareza: rarezaSeleccionada };
}

async function enviarAnimacionEclosion(conn, chat, usuario, mascota) {
    const nombreUsuario = usuario.split('@')[0];
    
    // Animación paso a paso
    await conn.sendMessage(chat, { 
        text: `🥚 *${nombreUsuario}* ha encontrado un huevo misterioso...\n` +
              `✧ ¿Qué criatura habrá dentro?` 
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    await conn.sendMessage(chat, { 
        text: `🔮 El huevo comienza a brillar...\n` +
              `✧ Se escuchan ruidos dentro...` 
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    await conn.sendMessage(chat, { 
        text: `💫 *CRACK!* El huevo se agrieta...\n` +
              `✧ ¡Algo está naciendo!` 
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mensaje final de eclosión
    const mensajeFinal = 
        `🎉 *¡FELICIDADES ${nombreUsuario}!* \n` +
        `✨ El huevo ha eclosionado y...\n\n` +
        `🐾 *¡HA NACIDO UN ${mascota.nombre.toUpperCase()}!* ${mascota.emoji}\n\n` +
        `✧ **Rareza:** ${mascota.rareza}\n` +
        `✧ **Tipo:** ${mascota.nombre}\n` +
        `✧ **Nivel:** 1\n\n` +
        `💫 *¡Una nueva aventura comienza!*\n` +
        `• Usa *!mascota* para ver su estado\n` +
        `• *!alimentar* para darle comida\n` +
        `• *!jugar* para divertirte con él`;

    await conn.sendMessage(chat, { text: mensajeFinal });

    // Emoji de celebración adicional
    await new Promise(resolve => setTimeout(resolve, 500));
    await conn.sendMessage(chat, { 
        text: `🎊 ¡${mascota.emoji.repeat(3)} FELICIDADES ${mascota.emoji.repeat(3)}` 
    });
}

const handler = async (m, { conn, usedPrefix }) => {
    const userId = m.sender;
    const chat = m.chat;
    let mascotas = loadMascotas();

    if (mascotas[userId]) {
        return await conn.reply(chat, 
            `✧ Ya tienes una mascota adoptada.\n` +
            `✧ Usa *${usedPrefix}mascota* para verla.\n` +
            `✧ Usa *${usedPrefix}liberar* si quieres adoptar otra.`, m);
    }

    // Obtener mascota aleatoria
    const mascota = obtenerMascotaAleatoria();

    // Enviar animación de eclosión
    await enviarAnimacionEclosion(conn, chat, userId, mascota);

    // Guardar la mascota en la base de datos
    mascotas[userId] = {
        nombre: mascota.nombre,
        tipo: mascota.tipo,
        nivel: 1,
        experiencia: 0,
        hambre: 100,
        felicidad: 100,
        energia: 100,
        salud: 100,
        ultimaActualizacion: Date.now(),
        adoptada: new Date().toISOString(),
        evolucion: 1,
        rareza: mascota.rareza,
        habilidades: [],
        estadisticas: {
            alimentado: 0,
            jugado: 0,
            entrenado: 0
        },
        historia: {
            nacimiento: new Date().toISOString(),
            deHuevo: true,
            tipoNacimiento: 'eclosion_misteriosa'
        }
    };

    saveMascotas(mascotas);

    // Mensaje final después de guardar
    await new Promise(resolve => setTimeout(resolve, 1000));
    await conn.sendMessage(chat, { 
        text: `📋 *${mascota.nombre}* ha sido registrado en tu inventario.\n` +
              `✧ ¡Cuida bien de tu nueva compañía! ${mascota.emoji}` 
    });
};

handler.tags = ['rpg', 'mascotas'];
handler.help = ['adoptar - Adoptar un huevo misterioso que eclosionará al instante'];
handler.command = ['adoptar', 'getpet', 'obtenermascota'];

export default handler;