import yts from 'yt-search';
const formatAudio = ['mp3', 'm4a', 'webm', 'acc', 'flac', 'opus', 'ogg', 'wav'];
const formatVideo = ['360', '480', '720', '1080', '1440', '4k'];
const ddownr = {
  download: async (url, format) => {
    if (!formatAudio.includes(format) && !formatVideo.includes(format)) {
      throw new Error('Format tidak didukung, cek daftar format yang tersedia.');
    }

    const config = {
      method: 'GET',
      url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    try {
      const response = await axios.request(config);

      if (response.data && response.data.success) {
        const { id, title, info } = response.data;
        const { image } = info;
        const downloadUrl = await ddownr.cekProgress(id);

        return {
          id: id,
          image: image,
          title: title,
          downloadUrl: downloadUrl
        };
      } else {
        throw new Error('Gagal mengambil detail video.');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
  cekProgress: async (id) => {
    const config = {
      method: 'GET',
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    try {
      while (true) {
        const response = await axios.request(config);

        if (response.data && response.data.success && response.data.progress === 1000) {
          return response.data.download_url;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};
    
const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `\`\`\`[ 🪐 ] Por favor ingresa un texto. Ejemplo:\n${usedPrefix + command} Did i tell u that i miss you\`\`\``;

  const isVideo = /vid|2|mp4|v$/.test(command);
  const search = await yts(text);

  if (!search.all || search.all.length === 0) {
    throw "No se encontraron resultados para tu búsqueda.";
  }

  const videoInfo = search.all[0];
  const body = `\`\`\`⊜─⌈ 📻 ◜YouTube Play◞ 📻 ⌋─⊜

    ≡ Título : » ${videoInfo.title}
    ≡ Views : » ${videoInfo.views}
    ≡ Duration : » ${videoInfo.timestamp}
    ≡ Uploaded : » ${videoInfo.ago}
    ≡ URL : » ${videoInfo.url}

# 🪐 Su ${isVideo ? 'Video' : 'Audio'} se está enviando, espere un momento...\`\`\``;

  try {
    if (command === 'play3' || command === 'play3' || command === 'playvid') {
  await conn.sendMessage(m.chat, {
      image: { url: videoInfo.thumbnail },
      caption: body,
      footer: `© ` + botName + ` | Powered by I'm Fz ~`,
      buttons: [
        {
          buttonId: `.ytmp3 ${videoInfo.url}`,
          buttonText: {
            displayText: '🎵 Audio',
          },
        },
        {
          buttonId: `.ytmp4 ${videoInfo.url}`,
          buttonText: {
            displayText: '📽️ Video',
          },
        },
      ],
      viewOnce: true,
      headerType: 4,
    }, { quoted: fkontak });
    m.react('🪐');
    
    } else if (command === 'yta' || command === 'ytmp3') {
    m.react(rwait)
      let audio = await ddownr.download(videoInfo.url, 'mp3')
          conn.sendMessage(m.chat, {
      audio: { url: audio.downloadUrl },
      mimetype: "audio/mpeg",
      caption: '',
    }, { quoted: m });
    m.react(done)
    } else if (command === 'ytv' || command === 'ytmp4') {
    m.react(rwait)
      await conn.sendMessage(m.chat, {
      video: { url: `https://kepolu-ytdl.hf.space/yt/dl?url=${videoInfo.url}&type=video` },
      mimetype: "video/mp4",
      caption: `Título: ${videoInfo.title}\nURL: ${videoInfo.url}`,
    }, { quoted: m });
    m.react(done)
    } else {
      throw "Comando no reconocido.";
    }

  } catch (error) {
    throw "Ocurrió un error al procesar tu solicitud.";
  }
};

handler.command = handler.help = ['playvid', 'ytv', 'ytmp4', 'yta', 'play3', 'ytmp3'];
handler.tags = ['youtube'];
export default handler;

const getVideoId = (url) => {
  const regex = /(?:v=|\/)([0-9A-Za-z_-]{11}).*/;
  const match = url.match(regex);
  if (match) {
    return match[1];
  }
  throw new Error("Invalid YouTube URL");
};