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
    const isTopHarem = /^topharem$/i.test(command);

    try {
        if (isTopHarem) {
            // Obtener todos los harens únicos (evitar duplicados)
            const uniqueHarems = [];
            const processedIds = new Set();
            
            for (const key in harems) {
                const harem = harems[key];
                if (!processedIds.has(harem.id)) {
                    uniqueHarems.push(harem);
                    processedIds.add(harem.id);
                }
            }

            // Verificar si hay harens
            if (uniqueHarems.length === 0) {
                return await conn.reply(m.chat, '🌸 *No hay harens creados aún*\n> ¡Sé el primero en crear uno con #crearharem!', m);
            }

            // Ordenar harens por cantidad de miembros (descendente)
            const sortedHarems = uniqueHarems.sort((a, b) => b.members.length - a.members.length);
            
            // Tomar los top 10
            const topHarems = sortedHarems.slice(0, 10);

            // Crear mensaje del top
            let topMessage = `
╔═══════════════════════════╗
        🏆 *TOP HAREMS* 🏆
╚═══════════════════════════╝

📊 *Total de harens:* ${uniqueHarems.length}

`;

            // Agregar cada harem al top
            topHarems.forEach((harem, index) => {
                const trophy = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
                topMessage += `
${trophy} *${index + 1}.* ${harem.name}
   👑 Líder: ${conn.getName(harem.creator) || harem.creator.split('@')[0]}
   👥 Miembros: ${harem.members.length}
`;
            });

            topMessage += `
╔═══════════════════════════╗
   🌸 *¡Competencia amistosa!* 🌸
╚═══════════════════════════╝
`;

            await conn.reply(m.chat, topMessage, m);

        }
    } catch (error) {
        await conn.reply(m.chat, `🎌 *Error:* ${error.message}`, m);
    }
}

handler.tags = ['group'];
handler.help = ['topharem'];
handler.command = ['topharem'];
handler.group = true;

export default handler;