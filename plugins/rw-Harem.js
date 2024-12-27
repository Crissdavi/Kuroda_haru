import fs from 'fs';

const obtenerDatos = () => {
    try {
        return fs.existsSync('data.json') 
            ? JSON.parse(fs.readFileSync('data.json', 'utf-8')) 
            : { usuarios: {}, personajesReservados: [] };
    } catch {
        return { usuarios: {}, personajesReservados: [] };
    }
};

const handler = async (m, { conn }) => {
    const sender = m.sender;
    const data = obtenerDatos();
    const usuario = data.usuarios[sender];

    if (!usuario || !usuario.characters || usuario.characters.length === 0) {
        return await conn.sendMessage(m.chat, {
            text: `@${sender.split('@')[0]}, no tienes personajes reclamados.`,
            mentions: [sender]
        });
    }

    const personajes = usuario.characters.map((p, i) => 
        `*${i + 1}.* ${p.name}\n  🔑 ID: ${p.id}\n  💎 Valor: ${p.value}`
    ).join('\n\n');

    return await conn.sendMessage(m.chat, {
        text: `@${sender.split('@')[0]}, estos son tus personajes reclamados:\n\n${personajes}`,
        mentions: [sender]
    });
};

handler.help = ['harem'];
handler.tags = ['rw'];
handler.command = ['harem', 'miswaifus'];
handler.group = true;

export default handler;