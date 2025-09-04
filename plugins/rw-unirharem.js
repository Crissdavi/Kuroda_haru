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
    const isJoin = /^unirharem$/i.test(command);

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

            await conn.reply(m.chat, `♡ ¡Harem creado exitosamente! •(=^●ω●^=)•\n\n*Nombre:* ${haremName}\n*Líder:* ${conn.getName(creator)}\n*ID:* ${newHarem.id}\n\n> Usa *#unirharem @usuario* para agregar amigos`, m);

        } else if (isJoin) {
            const targetUser = m.quoted?.sender || m.mentionedJid?.[0];
            const inviter = m.sender;

            if (!targetUser) {
                throw new Error('Debes mencionar a alguien para unirlo a tu harem.\n> Ejemplo » *#unirharem @usuario*');
            }

            // Verificar que el invitador tiene harem
            if (!harems[inviter]) {
                throw new Error('Primero debes crear un harem con #crearharem');
            }

            const harem = harems[inviter];

            // Verificar que el invitador es el líder
            if (harem.creator !== inviter) {
                throw new Error('Solo el líder del harem puede agregar miembros');
            }

            // Verificar si el usuario ya está en el harem
            if (harem.members.includes(targetUser)) {
                throw new Error(`${conn.getName(targetUser)} ya está en tu harem`);
            }

            // Agregar usuario al harem
            harem.members.push(targetUser);
            harems[targetUser] = harem; // Crear referencia para el nuevo miembro
            saveHarems();

            await conn.reply(m.chat, `✅ *${conn.getName(targetUser)}* se ha unido al harem *${harem.name}*\n\n*Miembros totales:* ${harem.members.length}`, m, { mentions: [targetUser] });
        }
    } catch (error) {
        await conn.reply(m.chat, `《✧》 ${error.message}`, m);
    }
}

handler.tags = ['group'];
handler.help = ['crearharem *nombre*', 'unirharem *@usuario*'];
handler.command = ['crearharem', 'unirharem'];
handler.group = true;

export default handler;