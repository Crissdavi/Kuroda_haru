import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();
const completadoImage = './src/completado.jpg';

const obtenerDatos = () => {
    try {
        return fs.existsSync('data.json') ? JSON.parse(fs.readFileSync('data.json', 'utf-8')) : { 'usuarios': {}, 'personajesReservados': [] };
    } catch (error) {
        console.error('Error al leer data.json:', error);
        return { 'usuarios': {}, 'personajesReservados': [] };
    }
};

const guardarDatos = (data) => {
    try {
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error al escribir en data.json:', error);
    }
};


const reservarPersonaje = (userId, character) => {
    let data = obtenerDatos();
    data.personajesReservados.push({ userId, ...character });
    guardarDatos(data);
};

const obtenerPersonajes = () => {
    try {
        return JSON.parse(fs.readFileSync('./src/JSON/characters.json', 'utf-8'));
    } catch (error) {
        console.error('Error al leer characters.json:', error);
        return [];
    }
};

let cooldowns = {};

let handler = async (m, { conn }) => {
    try {
        let userId = m.sender;
        let currentTime = new Date().getTime();
        const cooldownDuration = 10 * 60 * 1000; // 10 minutos
        let userCooldown = cooldowns[userId] || 0;
        let timeSinceLastRoll = currentTime - userCooldown;

        if (timeSinceLastRoll < cooldownDuration) {
            let remainingTime = cooldownDuration - timeSinceLastRoll;
            let minutes = Math.floor(remainingTime / (60 * 1000));
            let seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
            let replyMessage = `¡Espera ${minutes} minutos y ${seconds} segundos antes de usar el comando de nuevo!`;
            await conn.sendMessage(m.chat, { text: replyMessage });
            return;
        }
        let data = obtenerDatos();
        let personajes = obtenerPersonajes();
        let availableCharacters = personajes.filter(character => {
            let isReserved = data.personajesReservados.some(reserved => reserved.url === character.url);
            return !isReserved;
        });

        if (availableCharacters.length === 0) {
            await conn.sendMessage(m.chat, { image: { url: completadoImage }, caption: '¡Todos los personajes han sido reservados!' });
            return;
        }

        let randomCharacter = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
        let uniqueId = uuidv4();
        let reservedBy = data.usuarios[randomCharacter.url] || null;

        let statusMessage = reservedBy ? `Reservado por ${reservedBy.userId}` : 'Libre';
        let responseMessage = `*Nombre:* ${randomCharacter.name}\n*Valor:* ${randomCharacter.value} WFC!\n*Estado:* ${statusMessage}\n*ID:* ${uniqueId}`;

        await conn.sendMessage(m.chat, {
            image: { url: randomCharacter.url },
            caption: responseMessage,
            mimetype: 'image/jpeg',
            contextInfo: {
                mentionedJid: reservedBy ? [reservedBy.userId] : [],
                externalAdReply: {
                    showAdAttribution: true,
                    title: '¡Nuevo personaje!',
                    body: '¡Felicidades por tu nuevo personaje!',
                    thumbnailUrl: randomCharacter.url,
                    sourceUrl: 'https://github.com/Crissdavi/Kuroda_haru',
                    mediaType: 1,
                }
            }
        });

        if (!reservedBy) {
            reservarPersonaje(userId, { ...randomCharacter, id: uniqueId });
        }

        cooldowns[userId] = currentTime;
        console.log('Cooldown actualizado para ' + userId + ': ' + cooldowns[userId]);
    } catch (error) {
        console.error('Error en el handler:', error);
        await conn.sendMessage(m.chat, { text: 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente.' });
    }
};

handler.help = ['roll'];
handler.tags = ['rw'];
handler.command = ['roll', 'rw'];
handler.group = true;

export default handler;
