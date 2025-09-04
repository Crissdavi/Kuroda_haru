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

const handler = async (m, { conn, command }) => {
    const isMyHarem = /^miharem$/i.test(command);

    try {
        if (isMyHarem) {
            const user = m.sender;

            // Verificar si el usuario pertenece a algún harem
            if (!harems[user]) {
                throw new Error('❌ *No perteneces a ningún harem*\n> Crea uno con #crearharem o únete con #unirharem');
            }

            const harem = harems[user];
            
            // Formatear lista de miembros con etiquetas
            const membersList = harem.members.map(member => {
                return `👤 @${member.split('@')[0]} • ${conn.getName(member) || 'Usuario'}`;
            }).join('\n');

            // Crear mensaje con diseño cool
            const haremInfo = `
╔═══════════════════════════╗
       🏯 *INFORMACIÓN DEL HAREM* 🏯
╚═══════════════════════════╝

🎌 *Nombre:* ${harem.name}
👑 *Líder:* @${harem.creator.split('@')[0]}
📅 *Creado:* ${new Date(harem.createdAt).toLocaleDateString()}
👥 *Miembros:* ${harem.members.length}

╔═══════════════════════════╗
          🎎 *MIEMBROS* 🎎
╚═══════════════════════════╝

${membersList}

╔═══════════════════════════╗
   🌸 *¡El círculo está completo!* 🌸
╚═══════════════════════════╝
            `;

            await conn.reply(m.chat, haremInfo, m, {
                mentions: harem.members // Etiqueta a todos los miembros
            });

        }
    } catch (error) {
        await conn.reply(m.chat, `🎌 *Error:* ${error.message}`, m);
    }
}

handler.tags = ['group'];
handler.help = ['miharem'];
handler.command = ['miharem'];
handler.group = true;

export default handler;