import fs from 'fs';
import path from 'path';

const haremFile = path.resolve('src/database/harem.json');

function resetAllHarems() {
    try {
        // Crear un objeto vacío para resetear completamente
        const emptyData = {};
        fs.writeFileSync(haremFile, JSON.stringify(emptyData, null, 2));
        return true;
    } catch (error) {
        console.error('Error resetting harems:', error);
        return false;
    }
}

const handler = async (m, { conn }) => {
    try {
        // Verificar si el archivo existe primero
        if (!fs.existsSync(haremFile)) {
            return conn.reply(m.chat, '✅ *No hay harens para resetear*\n> El archivo de harens ya está vacío', m);
        }

        // Leer el archivo actual para mostrar estadísticas
        const currentData = fs.existsSync(haremFile) ? JSON.parse(fs.readFileSync(haremFile, 'utf8')) : {};
        const haremCount = Object.keys(currentData).length;
        
        // Resetear todos los harens
        if (resetAllHarems()) {
            await conn.reply(m.chat, 
                `╔═══════════════════════════╗
         🗑️ *RESETEO COMPLETO* 🗑️
╚═══════════════════════════╝

✅ *Todos los harens han sido eliminados*
📊 *Harens eliminados:* ${haremCount}

⚡ *Base de datos reiniciada*
📁 *Archivo:* src/database/harem.json

> Los harens pueden ser creados nuevamente con #crearharem`,
                m
            );
        } else {
            await conn.reply(m.chat, '❌ *Error al resetear los harens*', m);
        }

    } catch (error) {
        console.error('Error en resetearharem:', error);
        await conn.reply(m.chat, '❌ *Error interno al resetear los harens*', m);
    }
};

handler.tags = ['owner'];
handler.help = ['resetearharem'];
handler.command = ['resetearharem'];
handler.owner = true; // Solo el owner del bot puede usar este comando
handler.group = false;

export default handler;