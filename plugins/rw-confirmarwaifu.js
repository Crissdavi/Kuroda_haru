import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const obtenerDatos = () => {
    try {
        return fs.existsSync('data.json') 
            ? JSON.parse(fs.readFileSync('data.json', 'utf-8')) 
            : { usuarios: {}, personajesReservados: [] };
    } catch {
        return { usuarios: {}, personajesReservados: [] };
    }
};

const guardarDatos = (data) => {
    try {
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    } catch {}
};

const manejarClaim = async (personaje, sender, usuarios, conn, m) => {
    if (!usuarios[sender]) {
        usuarios[sender] = { characters: [], characterCount: 0, totalRwcoins: 0 };
    }
    usuarios[sender].characters.push({
        name: personaje.name,
        url: personaje.url,
        value: personaje.value
    });
    const personajesReservados = usuarios[personaje.userId]?.characters.filter(p => p.url !== personaje.url) || [];
    guardarDatos({ usuarios, personajesReservados });

    const mentions = [sender];
    return await conn.sendMessage(m.chat, { 
        text: `¡Felicidades @${sender.split('@')[0]}, reclamaste a ${personaje.name}!`, 
        mentions 
    });
};

const handler = async (m, { conn }) => {
    if (!m.quoted) return;

    const sender = m.sender;
    const match = m.quoted.text.match(/`ID:`\s*-->\s*`([a-zA-Z0-9-]+)`/);
    const id = match && match[1];
    if (!id) {
        return await conn.sendMessage(m.chat, {
            text: 'No se encontró un ID válido en el mensaje citado.',
            mentions: [sender]
        });
    }

    const data = obtenerDatos();
    const personaje = data.personajesReservados.find(p => p.id === id);
    if (!personaje) {
        return await conn.sendMessage(m.chat, {
            text: 'El personaje citado no está disponible.',
            mentions: [sender]
        });
    }

    const tiempoRestante = cooldowns[sender] ? COOLDOWN_TIME - (Date.now() - cooldowns[sender]) : 0;
    if (tiempoRestante > 0) {
        return await conn.sendMessage(m.chat, {
            text: `Debes esperar antes de reclamar otro personaje.\nTiempo restante: ${Math.floor(tiempoRestante / 60000)} minutos y ${(tiempoRestante % 60000) / 1000} segundos.`,
            mentions: [sender]
        });
    }

    cooldowns[sender] = Date.now();
    return manejarClaim(personaje, sender, data.usuarios, conn, m);
};

let cooldowns = {};
const COOLDOWN_TIME = 10 * 60 * 1000;

handler.help = ['claimwaifu'];
handler.tags = ['rw'];
handler.command = ['claim', 'c'];
handler.group = true;

export default handler;