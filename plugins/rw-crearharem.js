import fs from 'fs';
import path from 'path';

const haremFile = path.resolve('src/database/harem.json');
let harems = loadHarems();

function loadHarems() {
    return fs.existsSync(haremFile) ? JSON.parse(fs.readFileSync(haremFile, 'utf8')) : {};
}

function saveHarems() {
    fs.writeFileSync(haremFile, JSON.stringify(harems, null, 2));
}

const handler = async (m, { conn, command, text }) => {
    const isCreate = /^crearharem$/i.test(command);

    try {
        if (isCreate) {
            const haremName = text.trim();
            const creator = m.sender;

            if (!haremName) {
                throw new Error('Debes poner un nombre para tu harem.\n> Ejemplo » *#crearharem MiGrupoDeAmigos*');
            }

            // Verificar si ya es creador de algún harem
            const existingHarem = Object.values(harems).find(harem => harem.creator === creator);
            if (existingHarem) {
                return await conn.reply(m.chat, `《✧》 Ya eres el líder del harem *${existingHarem.name}*\n> Solo puedes crear un harem como líder`, m);
            }

            // Crear nuevo harem
            const newHarem = {
                id: Date.now().toString(),
                name: haremName,
                creator: creator,
                members: [creator],
                createdAt: new Date().toISOString(),
                address: ''
            };

            harems[creator] = newHarem;
            saveHarems();

            await conn.reply(m.chat, `♡ ¡Harem creado exitosamente! •(=^●ω●^=)•\n\n*Nombre:* ${haremName}\n*Líder:* ${conn.getName(creator)}\n*ID:* ${newHarem.id}`, m);
        }
    } catch (error) {
        await conn.reply(m.chat, `《✧》 ${error.message}`, m);
    }
}

handler.tags = ['group'];
handler.help = ['crearharem *nombre*'];
handler.command = ['crearharem'];
handler.group = true;

export default handler;