import fs from 'fs';
import path from 'path';

const haremsFile = path.resolve('src/database/harems.json');

function loadHarems() {
  try {
    return fs.existsSync(haremsFile) ? JSON.parse(fs.readFileSync(haremsFile, 'utf8')) : {};
  } catch (error) {
    console.error('Error loading harems:', error);
    return {};
  }
}

function saveHarems(haremsData) {
  try {
    fs.writeFileSync(haremsFile, JSON.stringify(haremsData, null, 2));
  } catch (error) {
    console.error('Error saving harems:', error);
  }
}

const handler = async (m, { conn }) => {
  const harems = loadHarems();
  const donador = m.sender;
  const receptor = m.mentionedJid?.[0];
  const miembro = m.mentionedJid?.[1]; // Segunda mención

  // Debug: ver las menciones
  console.log('Donador:', donador);
  console.log('Receptor:', receptor);
  console.log('Miembro:', miembro);

  if (!receptor || !miembro) {
    return await conn.reply(m.chat, 
      '✧ Uso: *donar @receptor @miembro*\n' +
      '✧ Ejemplo: donar @amigo @miembro-a-donar\n\n' +
      '💡 Debes mencionar DOS usuarios: primero al receptor, luego al miembro a donar',
      m
    );
  }

  if (!harems[donador]) {
    return await conn.reply(m.chat, '✧ No tienes un harem para donar miembros.', m);
  }

  if (receptor === donador) {
    return await conn.reply(m.chat, '✧ No puedes donarte a ti mismo.', m);
  }

  // Verificar que el miembro existe en el harem del donador
  if (!harems[donador].miembros.includes(miembro)) {
    return await conn.reply(m.chat, 
      `✧ @${miembro.split('@')[0]} no está en tu harem.`,
      m,
      { mentions: [miembro] }
    );
  }

  if (!harems[receptor]) {
    return await conn.reply(m.chat, 
      `✧ @${receptor.split('@')[0]} no tiene un harem creado.`,
      m,
      { mentions: [receptor] }
    );
  }

  if (harems[receptor].miembros.length >= 20) {
    return await conn.reply(m.chat, 
      `✧ El harem de @${receptor.split('@')[0]} está lleno (20/20).`,
      m,
      { mentions: [receptor] }
    );
  }

  if (harems[receptor].miembros.includes(miembro)) {
    return await conn.reply(m.chat, 
      `✧ @${miembro.split('@')[0]} ya está en el harem de @${receptor.split('@')[0]}.`,
      m,
      { mentions: [miembro, receptor] }
    );
  }

  // REALIZAR LA DONACIÓN (ESTA ES LA PARTE CRÍTICA)
  try {
    // 1. Remover del donador
    harems[donador].miembros = harems[donador].miembros.filter(m => m !== miembro);
    
    // 2. Agregar al receptor
    harems[receptor].miembros.push(miembro);
    
    // 3. GUARDAR LOS CAMBIOS
    saveHarems(harems);
    
    // 4. Verificar que se guardó correctamente
    const haremsVerificados = loadHarems();
    const donoExitoso = !haremsVerificados[donador]?.miembros.includes(miembro);
    const recibioExitoso = haremsVerificados[receptor]?.miembros.includes(miembro);

    if (donoExitoso && recibioExitoso) {
      await conn.sendMessage(m.chat, {
        text: `🎁 *DONACIÓN EXITOSA* 🎁\n\n` +
              `✧ @${donador.split('@')[0]} donó a @${miembro.split('@')[0]}\n` +
              `✧ Para: @${receptor.split('@')[0]}\n\n` +
              `✅ Miembro transferido correctamente\n` +
              `📊 Ahora tienes: ${harems[donador].miembros.length}/20 miembros\n` +
              `📈 Receptor ahora tiene: ${harems[receptor].miembros.length}/20 miembros`,
        mentions: [donador, receptor, miembro]
      });
    } else {
      throw new Error('Error en la verificación de la donación');
    }

  } catch (error) {
    console.error('Error en donación:', error);
    await conn.reply(m.chat, 
      '❌ Error al procesar la donación. Intenta nuevamente.',
      m
    );
  }
};

handler.tags = ['harem'];
handler.help = ['donar @receptor @miembro'];
handler.command = ['donar', 'donarmiembro', 'donarharem'];

export default handler;