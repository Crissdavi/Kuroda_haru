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
    const isJoin = /^unirharem$/i.test(command);

    try {
        if (isJoin) {
            const targetUser = m.quoted?.sender || m.mentionedJid?.[0];
            const inviter = m.sender;

            if (!targetUser) {
                throw new Error('🎌 *Debes mencionar a alguien para unirlo a tu harem.*\n> Ejemplo » *#unirharem @usuario*');
            }

            // Verificar que el invitador tiene harem
            if (!harems[inviter]) {
                throw new Error('❌ *Primero debes crear un harem con* #crearharem');
            }

            const harem = harems[inviter];

            // Verificar que el invitador es el líder
            if (harem.creator !== inviter) {
                throw new Error('👑 *Solo el líder del harem puede agregar miembros*');
            }

            // Verificar si el usuario ya está en el harem
            if (harem.members.includes(targetUser)) {
                throw new Error(`🌸 *${conn.getName(targetUser)} ya está en tu harem*`);
            }

            // Agregar usuario al harem
            harem.members.push(targetUser);
            harems[targetUser] = harem;
            saveHarems();

            // Mensaje con diseño cool
            const coolMessage = `╔════════════════════╗
   🎎 *NUEVO MIEMBRO EN EL HAREM* 🎎
╚════════════════════╝

✨ *Harem:* ${harem.name}
👑 *Líder:* ${conn.getName(inviter)}
🌸 *Nuevo Miembro:* ${conn.getName(targetUser)}
📊 *Miembros Totales:* ${harem.members.length}

🎉 *¡Bienvenid@ al círculo sagrado!* 🎉

╔════════════════════╗
   🎀 *¡Que comience la aventura!* 🎀
╚════════════════════╝`;

            await conn.reply(m.chat, coolMessage, m, { 
                mentions: [targetUser, inviter],
                contextInfo: {
                    mentionedJid: [targetUser, inviter]
                }
            });
        }
    } catch (error) {
        await conn.reply(m.chat, `🎌 *Error:* ${error.message}`, m);
    }
}

handler.tags = ['group'];
handler.help = ['unirharem *@usuario*'];
handler.command = ['unirharem'];
handler.group = true;

export default handler;