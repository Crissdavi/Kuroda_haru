import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `🎵 *Buscar Letra de Canción*\n\nPor favor, ingresa el nombre de la canción o artista\nEjemplo: *${usedPrefix + command}* Bad Bunny - Moscow Mule`, m);
  }

  try {
    // Mostrar mensaje de espera
    await conn.sendMessage(m.chat, { 
      text: '🔍 *Buscando letra...*', 
      mentions: [m.sender] 
    });

    const apiUrl = `https://api.sylphy.xyz/tools/lyrics?q=${encodeURIComponent(text)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.status || !data.lyrics) {
      return conn.reply(m.chat, '❌ No se encontró la letra de la canción. Intenta con otro nombre.', m);
    }

    const { info, lyrics } = data;
    const { title, artist, album } = info;
    
    // Formatear la letra para que no sea demasiado larga
    const maxLength = 3000;
    let formattedLyrics = lyrics;
    
    if (lyrics.length > maxLength) {
      formattedLyrics = lyrics.substring(0, maxLength) + 
        `\n\n...\n\n📝 *La letra es demasiado larga. Mostrando solo parte de ella.*`;
    }

    // Crear mensaje con formato atractivo
    const message = `
🎤 *${title}* - ${artist}
💿 *Álbum:* ${album?.title || 'Desconocido'}

📝 *Letra:*
${formattedLyrics}

✨ *Fuente:* Sylphy API
    `.trim();

    // Enviar mensaje con la letra
    await conn.sendMessage(m.chat, { 
      text: message,
      contextInfo: {
        externalAdReply: {
          title: `🎵 ${title} - ${artist}`,
          body: `Letra completa | ${album?.title || 'Sin álbum'}`,
          thumbnail: await (await fetch(album?.artwork || 'https://telegra.ph/file/1f9a69f56d2e6b2c2b5e3.png')).buffer(),
          mediaType: 1,
          mediaUrl: info.preview || '',
          sourceUrl: ''
        }
      }
    }, { quoted: m });

  } catch (error) {
    console.error('Error al buscar letra:', error);
    await conn.reply(m.chat, '❌ Error al buscar la letra. Intenta más tarde.', m);
  }
};

handler.help = ['lyrics', 'letra'];
handler.tags = ['tools', 'music'];
handler.command = ['lyrics', 'letra', 'lyric'];
handler.limit = true;

export default handler;