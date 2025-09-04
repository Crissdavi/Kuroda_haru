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
            
            // Separar líder y miembros normales
            const leader = harem.members.find(member => member === harem.creator);
            const normalMembers = harem.members.filter(member => member !== harem.creator);
            
            // Formatear líder
            const leaderInfo = `👑 *Líder:* @${leader.split('@')[0]} • ${conn.getName(leader) || 'Líder'}\n`;
            
            // Formatear miembros normales
            let membersList = '';
            if (normalMembers.length > 0) {
                membersList = normalMembers.map(member => {
                    return `👤 @${member.split('@')[0]} • ${conn.getName(member) || 'Usuario'}`;
                }).join('\n');
            } else {
                membersList = '🌟 *No hay otros miembros aún*';
            }

            // Crear mensaje con diseño cool
            const haremInfo = `
╔═══════════════════════════╗
       🏯 *INFORMACIÓN DEL HAREM* 🏯
╚═══════════════════════════╝

🎌 *Nombre:* ${harem.name}
${leaderInfo}
📅 *Creado:* ${new Date(harem.createdAt).toLocaleDateString()}
👥 *Total de miembros:* ${harem.members.length}

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