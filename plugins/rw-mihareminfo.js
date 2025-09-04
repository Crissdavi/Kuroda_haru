import fs from 'fs';
import path from 'path';

const haremFile = path.resolve('src/database/harem.json');

function loadHarems() {
    try {
        if (!fs.existsSync(haremFile)) {
            return {};
        }
        const data = fs.readFileSync(haremFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading harems:', error);
        return {};
    }
}

const handler = async (m, { conn }) => {
    try {
        // CARGAR DATOS FRESCOS CADA VEZ que se ejecuta el comando
        const harems = loadHarems();
        const userId = m.sender;

        console.log('Harems data:', JSON.stringify(harems, null, 2)); // Debug

        // Buscar todos los harem donde el usuario sea miembro
        const userHarems = Object.entries(harems).filter(([key, harem]) => {
            return harem && harem.members && harem.members.includes(userId);
        });

        if (userHarems.length === 0) {
            return conn.reply(m.chat, '❌ *No perteneces a ningún harem*\n> Crea uno con #crearharem o únete con #unirharem', m);
        }

        // Tomar el primer harem (asumiendo que un usuario solo puede estar en uno)
        const [, harem] = userHarems[0];
        
        console.log('User harem:', harem); // Debug

        // Verificar que los miembros existan
        if (!harem.members || !Array.isArray(harem.members)) {
            return conn.reply(m.chat, '❌ *Error: Datos del harem corruptos*', m);
        }

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

        // Mostrar miembros
        if (normalMembers.length > 0) {
            membersToShow.forEach((member) => {
                const memberName = conn.getName(member) || 'Usuario';
                text += `👤 @${member.split('@')[0]} • ${memberName}\n`;
            });
            
            // Mostrar miembros restantes
            if (remainingMembers > 0) {
                text += `\n📋 *Y ${remainingMembers} miembro(s) más...*`;
            }
        } else {
            text += '🌟 *No hay otros miembros aún*';
        }

        // Preparar todas las menciones
        const allMentions = [...harem.members];

        await conn.reply(m.chat, text.trim(), m, {
            mentions: allMentions
        });

    } catch (error) {
        console.error('Error en miharem:', error);
        await conn.reply(m.chat, '❌ *Error al cargar la información del harem*', m);
    }
};

handler.tags = ['group'];
handler.help = ['miharem'];
handler.command = ['miharem'];
handler.group = true;

export default handler;