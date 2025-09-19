import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `🎵 *Buscar Letra de Canción*\n\nPor favor, ingresa el nombre de la canción o artista\nEjemplo: *${usedPrefix + command}* Bad Bunny - Moscow Mule`, m);
  }

  try {
    await conn.sendMessage(m.chat, { 
      text: '🔍 *Buscando letra...*', 
      mentions: [m.sender] 
    });

    const apiUrl = `https://api.sylphy.xyz/tools/lyrics?q=${encodeURIComponent(text)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) throw new Error(`Error en la API: ${response.status}`);
    
    const data = await response.json();
    
    if (!data.status || !data.lyrics) {
      return conn.reply(m.chat, '❌ No se encontró la letra de la canción. Intenta con otro nombre.', m);
    }

    const { info, lyrics } = data;
    const { title, artist, album } = info;
    
    const maxPartLength = 2000;
    const lyricsParts = [];
    
    for (let i = 0; i < lyrics.length; i += maxPartLength) {
      lyricsParts.push(lyrics.substring(i, i + maxPartLength));
    }

    const firstPart = `
🎤 *${title}* - ${artist}
💿 *Álbum:* ${album?.title || 'Desconocido'}
📝 *Parte 1/${lyricsParts.length}*

${lyricsParts[0]}
    `.trim();

    await conn.sendMessage(m.chat, { 
      text: firstPart,
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

    for (let i = 1; i < lyricsParts.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo entre mensajes
      
      const partMessage = `
📝 *Parte ${i + 1}/${lyricsParts.length}*

${lyricsParts[i]}
      `.trim();

      await conn.sendMessage(m.chat, { text: partMessage });
    }

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