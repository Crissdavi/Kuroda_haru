import fetch from "node-fetch";
import yts from 'yt-search';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(
        m.chat,
        `🎵 Ingresa el nombre de la música a descargar.\n\nEjemplo: ${usedPrefix}${command} Coldplay Viva la Vida`,
        m
      );
    }

    const search = await yts(text);
    if (!search.all || search.all.length === 0) {
      return m.reply('No se encontraron resultados para tu búsqueda.');
    }

    const videoInfo = search.all[0];
    if (!videoInfo) {
      return m.reply('No se pudo obtener información del video.');
    }

    const { 
      title = 'Desconocido', 
      thumbnail = '', 
      timestamp = 'Desconocido', 
      views = 0, 
      ago = 'Desconocido', 
      url = '', 
      author = { name: 'Desconocido' } 
    } = videoInfo;

    if (!url) {
      return m.reply('No se pudo obtener la URL del video.');
    }

    const vistas = formatViews(views);
    const canal = author.name || 'Desconocido';

    const infoMessage = `
🎶 *Título:* ${title}
⏱️ *Duración:* ${timestamp}
👀 *Vistas:* ${vistas}
📺 *Canal:* ${canal}
📅 *Publicado:* ${ago}

👉 Responde con:
1️⃣ - MP3 (Audio)
3️⃣ - MP3 Documento
`;

    try {
      const thumb = thumbnail ? (await conn.getFile(thumbnail))?.data : null;

      const JT = {
        contextInfo: {
          externalAdReply: {
            title: 'YouTube Downloader',
            body: title,
            mediaType: 1,
            previewType: 0,
            mediaUrl: url,
            sourceUrl: url,
            thumbnail: thumb,
            renderLargerThumbnail: true,
          },
        },
      };

      await conn.reply(m.chat, infoMessage, m, JT);

      if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {};
      }

      global.db.data.users[m.sender].lastYTSearch = {
        url,
        title,
        messageId: m.key.id,  
        timestamp: Date.now() 
      };

    } catch {
      await conn.reply(m.chat, infoMessage, m);
    }

  } catch (error) {
    console.error("Error completo:", error);
    return m.reply(`❌ Ocurrió un error: ${error.message || 'Desconocido'}`);
  }
};


async function processDownload(conn, m, url, title, option) {
  await conn.reply(m.chat, `⏳ Procesando descarga...`, m, null, rcanal);

  try {
    let downloadUrl;
    let fileName;
    let mimeType;

    if (option === 1 || option === 3) {
      downloadUrl = await getAudioUrl(url);
      fileName = `${title.replace(/[^\w\s]/gi, '')}.mp3`;
      mimeType = 'audio/mpeg';

      if (!downloadUrl) {
        throw new Error("No se pudo obtener el enlace de audio desde ninguna API.");
      }

      if (option === 1) {
        await conn.sendMessage(m.chat, { 
          audio: { url: downloadUrl }, 
          fileName, 
          mimetype: mimeType 
        }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, { 
          document: { url: downloadUrl },
          mimetype: mimeType,
          fileName
        }, { quoted: m });
      }
    }

    return true;
  } catch (error) {
    console.error("Error al procesar descarga:", error);
    conn.reply(m.chat, `❌ Error: ${error.message}`, m);
    return false;
  }
}


async function getAudioUrl(videoUrl) {
  const apis = [
    {
      url: `https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(videoUrl)}`,
      parser: (data) => data?.data?.download
    },
    {
      url: `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}`,
      parser: (data) => data?.result?.download?.url
    },
    {
      url: `https://api.botcahx.biz.id/api/dowloader/yt?url=${encodeURIComponent(videoUrl)}&apikey=Admin`,
      parser: (data) => data?.result?.mp3
    },
    {
      url: `https://api.lolhuman.xyz/api/ytaudio?apikey=GataDios&url=${encodeURIComponent(videoUrl)}`,
      parser: (data) => data?.result?.link || data?.result?.audio?.link
    },
    {
      url: `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`,
      parser: (data) => data?.url
    }
  ];

  for (let i = 0; i < apis.length; i++) {
    try {
      const response = await fetch(apis[i].url, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 15000
      });

      if (!response.ok) continue;

      const apiJson = await response.json();
      const audioUrl = apis[i].parser(apiJson);

      if (audioUrl) {
        return audioUrl;
      }

    } catch (error) {
      console.error(`API ${i + 1} falló:`, error.message);
    }
  }

  return null;
}


handler.before = async (m, { conn }) => {
  if (!/^[13]$/.test(m.text)) return false;

  const user = global.db.data.users[m.sender];
  if (!user || !user.lastYTSearch) return false;

  const currentTime = Date.now();
  const searchTime = user.lastYTSearch.timestamp || 0;

  if (currentTime - searchTime > 10 * 60 * 1000) {
    return false; 
  }

  const option = parseInt(m.text);
  if (isNaN(option) || (option !== 1 && option !== 3)) return false;

  await processDownload(
    conn, 
    m, 
    user.lastYTSearch.url, 
    user.lastYTSearch.title, 
    option
  );

  user.lastYTSearch = null;

  return true;
};

function formatViews(views) {
  if (views === undefined) return "No disponible";

  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k`;
  return views.toLocaleString();
}

handler.command = ['play'];
handler.tags = ['downloader'];

export default handler;