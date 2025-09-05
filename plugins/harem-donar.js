const handler = async (m, { conn }) => {
  const donador = m.sender;
  const receptor = m.mentionedJid?.[0];
  const miembro = m.mentionedJid?.[1]; // Segunda mención

  harems = loadHarems();

  if (!receptor || !miembro) {
    return await conn.reply(m.chat, 
      '✧ Uso: *donar @receptor @miembro*\n' +
      '✧ Ejemplo: donar @amigo @miembro-a-donar',
      m
    );
  }

  if (!harems[donador]) {
    return await conn.reply(m.chat, '✧ No tienes un harem para donar miembros.', m);
  }

  if (receptor === donador) {
    return await conn.reply(m.chat, '✧ No puedes donarte a ti mismo.', m);
  }

  if (!harems[donador].miembros.includes(miembro)) {
    return await conn.reply(m.chat, '✧ Este miembro no está en tu harem.', m);
  }

  if (!harems[receptor]) {
    return await conn.reply(m.chat, '✧ El receptor no tiene un harem creado.', m);
  }

  if (harems[receptor].miembros.length >= 20) {
    return await conn.reply(m.chat, '✧ El harem del receptor está lleno.', m);
  }

  if (harems[receptor].miembros.includes(miembro)) {
    return await conn.reply(m.chat, '✧ Este usuario ya está en el harem del receptor.', m);
  }

  // Realizar la donación
  harems[donador].miembros = harems[donador].miembros.filter(m => m !== miembro);
  harems[receptor].miembros.push(miembro);
  saveHarems();

  await conn.sendMessage(m.chat, {
    text: `🎁 *DONACIÓN EXITOSA* 🎁\n\n` +
          `✧ @${donador.split('@')[0]} donó a @${miembro.split('@')[0]}\n` +
          `✧ Para: @${receptor.split('@')[0]}\n\n` +
          `✅ Miembro transferido correctamente`,
    mentions: [donador, receptor, miembro]
  });
};

handler.tags = ['harem'];
handler.help = ['donar @receptor @miembro'];
handler.command = ['donar', 'donarmiembro'];