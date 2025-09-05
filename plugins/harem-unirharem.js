import fs from 'fs';
import path from 'path';

const haremsFile = path.resolve('src/database/harems.json');
const MAX_MIEMBROS = 20;

// ✅ FUNCIÓN MEJORADA para cargar harems
function loadHarems() {
    try {
        if (!fs.existsSync(haremsFile)) {
            return {};
        }
        const data = fs.readFileSync(haremsFile, 'utf8').trim();
        if (!data) return {};
        
        const parsed = JSON.parse(data);
        // ✅ Validar y reparar estructura
        Object.keys(parsed).forEach(maestro => {
            if (!parsed[maestro].miembros || !Array.isArray(parsed[maestro].miembros)) {
                parsed[maestro].miembros = [];
            }
            if (!parsed[maestro].maestro) {
                parsed[maestro].maestro = maestro;
            }
        });
        return parsed;
    } catch (error) {
        console.error('❌ Error loading harems:', error);
        return {};
    }
}

// ✅ FUNCIÓN MEJORADA para guardar
function saveHarems(haremsData) {
    try {
        const dir = path.dirname(haremsFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(haremsFile, JSON.stringify(haremsData, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Error saving harems:', error);
        return false;
    }
}

const handler = async (m, { conn }) => {
    // ✅ CARGAR DATOS FRESCOS EN CADA EJECUCIÓN
    const harems = loadHarems();
    const maestro = m.sender;
    let miembro = m.mentionedJid?.[0] || m.quoted?.sender;

    // ✅ CORREGIR: Si el miembro viene de un reply, extraer correctamente
    if (!miembro && m.quoted) {
        miembro = m.quoted.sender;
    }

    console.log('🔍 Debug: Maestro:', maestro);
    console.log('🔍 Debug: Miembro:', miembro);
    console.log('🔍 Debug: Harems keys:', Object.keys(harems));

    if (!miembro) {
        return await conn.reply(m.chat, '✧ Debes mencionar o responder al usuario que quieres agregar.', m);
    }

    // ✅ VERIFICAR SI EL MAESTRO TIENE HAREM (CON REPARACIÓN)
    if (!harems[maestro]) {
        // 🔄 INTENTAR RECUPERAR: Quizás el harem existe pero no se cargó
        const haremsRetry = loadHarems();
        if (!haremsRetry[maestro]) {
            return await conn.reply(m.chat, '✧ No tienes un harem creado. Usa *crearharem* primero.', m);
        } else {
            // ✅ Si existía pero no se cargó, usar los datos recuperados
            harems[maestro] = haremsRetry[maestro];
        }
    }

    // ✅ FORZAR ESTRUCTURA VÁLIDA
    if (!harems[maestro].miembros || !Array.isArray(harems[maestro].miembros)) {
        harems[maestro].miembros = [];
    }

    if (miembro === maestro) {
        return await conn.reply(m.chat, '✧ No puedes agregarte a ti mismo.', m);
    }

    if (harems[maestro].miembros.length >= MAX_MIEMBROS) {
        return await conn.reply(m.chat, `✧ ¡Límite alcanzado! Máximo ${MAX_MIEMBROS} miembros.`, m);
    }

    if (harems[maestro].miembros.includes(miembro)) {
        return await conn.reply(m.chat, `✧ @${miembro.split('@')[0]} ya está en tu harem.`, m, {
            mentions: [miembro]
        });
    }

    // ✅ VERIFICAR EN OTROS HAREMS (EXCLUYENDO EL ACTUAL)
    const yaEnOtroHarem = Object.entries(harems).some(([otroMaestro, datos]) => {
        return otroMaestro !== maestro && 
               datos.miembros && 
               datos.miembros.includes(miembro);
    });

    if (yaEnOtroHarem) {
        return await conn.reply(m.chat, `✧ @${miembro.split('@')[0]} ya está en otro harem.`, m, {
            mentions: [miembro]
        });
    }

    try {
        // ✅ AGREGAR MIEMBRO
        harems[maestro].miembros.push(miembro);
        
        // ✅ GUARDAR Y VERIFICAR
        if (!saveHarems(harems)) {
            throw new Error('Error al guardar');
        }

        // ✅ VERIFICACIÓN FINAL
        const haremsVerificados = loadHarems();
        const agregadoExitoso = haremsVerificados[maestro]?.miembros?.includes(miembro);

        if (agregadoExitoso) {
            await conn.sendMessage(m.chat, {
                text: `✅ @${miembro.split('@')[0]} ha sido agregado a tu harem.\n✧ Miembros: ${harems[maestro].miembros.length}/${MAX_MIEMBROS}`,
                mentions: [miembro]
            });
        } else {
            throw new Error('No se verificó la adición');
        }

    } catch (error) {
        console.error('❌ Error en unirharem:', error);
        await conn.reply(m.chat, '❌ Error al agregar el miembro. Intenta nuevamente.', m);
    }
};

handler.tags = ['harem'];
handler.help = ['unirharem @usuario'];
handler.command = ['unirharem', 'agregarharem', 'addharem'];

export default handler;