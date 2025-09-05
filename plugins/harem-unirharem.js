import fs from 'fs';
import path from 'path';

const haremsFile = path.resolve('src/database/harems.json');
const MAX_MIEMBROS = 20;

// Función para cargar harems (SIEMPRE frescos)
function loadHarems() {
  try {
    if (!fs.existsSync(haremsFile)) {
      return {};
    }
    const data = fs.readFileSync(haremsFile, 'utf8');
    // Validar que el JSON no esté corrupto
    if (data.trim() === '') {
      return {};
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error loading harems:', error);
    // En caso de error, devolver objeto vacío
    return {};
  }
}

// Función para guardar harems
function saveHarems(haremsData) {
  try {
    // Crear directorio si no existe
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
  // ✅ CARGAR SIEMPRE DATOS FRESCOS (esto evita el bug)
  let harems = loadHarems();
  const maestro = m.sender;
  const miembro = m.mentionedJid?.[0] || m.quoted?.sender;

  // Debug logging
  console.log('🔍 unirharem ejecutado por:', maestro);
  console.log('🔍 Miembro a agregar:', miembro);
  console.log('🔍 Harems en DB:', Object.keys(harems).length);

  if (!miembro) {
    return await conn.reply(m.chat, '✧ Debes mencionar o responder al usuario que quieres agregar al harem.', m);
  }

  // ✅ VALIDAR ESTRUCTURA DEL HAREM
  if (!harems[maestro] || !harems[maestro].miembros || !Array.isArray(harems[maestro].miembros)) {
    // Si el harem existe pero está corrupto, recrearlo
    if (harems[maestro]) {
      harems[maestro] = {
        creado: harems[maestro].creado || new Date().toISOString(),
        maestro: maestro,
        miembros: []
      };
    } else {
      return await conn.reply(m.chat, '✧ No tienes un harem creado. Usa *crearharem* primero.', m);
    }
  }

  if (miembro === maestro) {
    return await conn.reply(m.chat, '✧ No puedes agregarte a ti mismo.', m);
  }

  // ✅ VERIFICAR LÍMITE
  if (harems[maestro].miembros.length >= MAX_MIEMBROS) {
    return await conn.reply(m.chat, 
      `✧ ¡Límite alcanzado! Solo puedes tener ${MAX_MIEMBROS} miembros en tu harem.`,
      m
    );
  }

  // ✅ VERIFICAR SI YA ESTÁ EN EL HAREM
  if (harems[maestro].miembros.includes(miembro)) {
    return await conn.reply(m.chat, 
      `✧ @${miembro.split('@')[0]} ya está en tu harem.`,
      m,
      { mentions: [miembro] }
    );
  }

  // ✅ VERIFICAR SI ESTÁ EN OTRO HAREM (EXCLUYENDO EL ACTUAL)
  const yaEnOtroHarem = Object.entries(harems).some(([otroMaestro, datos]) => {
    return otroMaestro !== maestro && 
           datos.miembros && 
           Array.isArray(datos.miembros) &&
           datos.miembros.includes(miembro);
  });

  if (yaEnOtroHarem) {
    return await conn.reply(m.chat, 
      `✧ @${miembro.split('@')[0]} ya pertenece a otro harem.`,
      m,
      { mentions: [miembro] }
    );
  }

  try {
    // ✅ AGREGAR MIEMBRO
    harems[maestro].miembros.push(miembro);
    
    // ✅ GUARDAR Y VERIFICAR
    const guardadoExitoso = saveHarems(harems);
    
    if (!guardadoExitoso) {
      throw new Error('Error al guardar en la base de datos');
    }

    // ✅ VERIFICACIÓN FINAL (double-check)
    const haremsVerificados = loadHarems();
    const agregadoExitoso = haremsVerificados[maestro]?.miembros?.includes(miembro);

    if (agregadoExitoso) {
      await conn.sendMessage(m.chat, {
        text: `✅ @${miembro.split('@')[0]} ha sido agregado a tu harem.\n✧ Miembros: ${harems[maestro].miembros.length}/${MAX_MIEMBROS}`,
        mentions: [miembro]
      });
      
      // ✅ OPCIONAL: Notificar al miembro agregado
      try {
        await conn.sendMessage(miembro, {
          text: `🎉 ¡Has sido agregado al harem de @${maestro.split('@')[0]}!`,
          mentions: [maestro]
        });
      } catch (notifyError) {
        console.log('⚠️ No se pudo notificar al miembro:', notifyError);
      }
      
    } else {
      throw new Error('El miembro no se agregó correctamente');
    }

  } catch (error) {
    console.error('❌ Error en unirharem:', error);
    await conn.reply(m.chat, 
      '❌ Error al agregar el miembro. Intenta nuevamente.',
      m
    );
  }
};

handler.tags = ['harem'];
handler.help = ['unirharem @usuario'];
handler.command = ['unirharem', 'agregarharem', 'addharem'];

export default handler;