const handler = async (m, { conn }) => {
  const retador = m.sender;
  const oponente = m.mentionedJid?.[0];

  harems = loadHarems();

  if (!oponente) {
    return await conn.reply(m.chat, '✧ Debes mencionar al maestro que quieres desafiar.', m);
  }

  if (!harems[retador] || !harems[oponente]) {
    return await conn.reply(m.chat, '✧ Ambos deben tener harems creados.', m);
  }

  if (retador === oponente) {
    return await conn.reply(m.chat, '✧ No puedes desafiarte a ti mismo.', m);
  }

  if (harems[retador].miembros.length === 0 || harems[oponente].miembros.length === 0) {
    return await conn.reply(m.chat, '✧ Los harems deben tener al menos 1 miembro.', m);
  }

  // Simular batalla
  const poderRetador = harems[retador].miembros.length * (Math.random() + 0.5);
  const poderOponente = harems[oponente].miembros.length * (Math.random() + 0.5);
  const ganador = poderRetador > poderOponente ? retador : oponente;
  const perdedor = ganador === retador ? oponente : retador;

  // 30% de chance de robar miembro
  let miembroRobado = null;
  if (Math.random() < 0.3 && harems[perdedor].miembros.length > 0) {
    miembroRobado = harems[perdedor].miembros[Math.floor(Math.random() * harems[perdedor].miembros.length)];
    harems[perdedor].miembros = harems[perdedor].miembros.filter(m => m !== miembroRobado);
    harems[ganador].miembros.push(miembroRobado);
    saveHarems();
  }

  let mensajeResultado = `⚔️ *BATALLA DE HAREMS* ⚔️\n\n` +
                        `🎯 @${retador.split('@')[0]} vs @${oponente.split('@')[0]}\n\n` +
                        `🏆 *GANADOR:* @${ganador.split('@')[0]}\n` +
                        `💥 Poder: ${Math.max(poderRetador, poderOponente).toFixed(1)} vs ${Math.min(poderRetador, poderOponente).toFixed(1)}\n\n`;

  if (miembroRobado) {
    mensajeResultado += `🎁 @${ganador.split('@')[0]} robó a @${miembroRobado.split('@')[0]} del harem perdedor!`;
  } else {
    mensajeResultado += `✨ Victoria honorable, sin botín.`;
  }

  await conn.sendMessage(m.chat, {
    text: mensajeResultado,
    mentions: [retador, oponente, ...(miembroRobado ? [miembroRobado] : [])]
  });
};

handler.tags = ['harem', 'fun'];
handler.help = ['desafiar @maestro'];
handler.command = ['desafiar', 'desafioharem'];