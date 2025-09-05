const handler = async (m, { conn }) => {
  harems = loadHarems();
  
  if (Object.keys(harems).length === 0) {
    return await conn.reply(m.chat, '✧ No hay harems creados todavía.', m);
  }

  let lista = '📋 *LISTA DE HAREMS* 📋\n\n';
  let contador = 1;

  Object.entries(harems).forEach(([maestro, data]) => {
    lista += `▸ ${contador}. @${maestro.split('@')[0]} - ${data.miembros.length} miembros\n`;
    contador++;
  });

  lista += `\n✨ Total: ${Object.keys(harems).length} harems activos`;

  const menciones = Object.keys(harems);
  await conn.sendMessage(m.chat, {
    text: lista,
    mentions: menciones
  });
};

handler.tags = ['harem'];
handler.help = ['listaharems'];
handler.command = ['listaharems', 'haremslista', 'listah'];