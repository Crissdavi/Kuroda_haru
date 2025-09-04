import fs from 'fs';
import path from 'path';

const haremFile = path.resolve('src/database/harem.json');

function loadHarems() {
    return fs.existsSync(haremFile) ? JSON.parse(fs.readFileSync(haremFile, 'utf8')) : {};
}

const handler = async (m, { conn }) => {
    const harems = loadHarems();
    const userId = m.sender;

    // Buscar el harem del usuario
    const haremEntry = Object.entries(harems).find(([, h]) => 
        h.members && h.members.includes(userId)
    );
    
    if (!haremEntry) {
        return conn.reply(m.chat, '❌ *No perteneces a ningún harem*\n> Crea uno con #crearharem o únete con #unirharem', m);
    }

    const [, harem] = haremEntry;
    
    // Separar líder y miembros normales
    const leader = harem.creator;
    const normalMembers = harem.members.filter(member => member !== leader);
    
    // Limitar a 5 miembros mostrados
    const membersToShow = normalMembers.slice(0, 5);
    const remainingMembers = normalMembers.length - membersToShow.length;

    // Construir el mensaje
    let text = `
╔═══════════════════════════╗
       🏯 *INFORMACIÓN DEL HAREM* 🏯
╚═══════════════════════════╝

🎌 *Nombre:* ${harem.name}
👑 *Líder:* @${leader.split('@')[0]}
📅 *Creado:* ${new Date(harem.createdAt).toLocaleDateString()}
👥 *Miembros:* ${harem.members.length}

╔═══════════════════════════╗
          🎎 *MIEMBROS* 🎎
╚═══════════════════════════╝
`;

    // Mostrar miembros (máximo 5)
    if (normalMembers.length > 0) {
        membersToShow.forEach((member, index) => {
            text += `👤 @${member.split('@')[0]} • ${conn.getName(member) || 'Usuario'}\n`;
        });
        
        // Mostrar mensaje de miembros restantes
        if (remainingMembers > 0) {
            text += `\n📋 *Y ${remainingMembers} miembro(s) más...*`;
        }
    } else {
        text += '🌟 *No hay otros miembros aún*';
    }

    // Preparar menciones (todos los miembros)
    const allMentions = [leader, ...normalMembers];

    conn.reply(m.chat, text.trim(), m, {
        mentions: allMentions
    });
};

handler.tags = ['group'];
handler.help = ['miharem'];
handler.command = ['miharem'];
handler.group = true;

export default handler;