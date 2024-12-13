import yts from 'yt-search'
const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `❗ Ingresa un texto`;

    const randomReduction = Math.floor(Math.random() * 5) + 1;
    let search = await yts(text);
    let isVideo = /vid$/.test(command);
    let urls = search.all[0].url;
    let body = `\`\`\`-----[ Sylph - YTDL ]-----

    •  Title : *${search.all[0].title}*
    •  Views : *${search.all[0].views}*
    •  Duration : *${search.all[0].timestamp}*
    •  Uploaded : *${search.all[0].ago}*
    •  Url : *${urls}*

## Su ${isVideo ? 'Video' : 'Audio'} se está enviando, espere un momento...\`\`\``;

    conn.sendMessage(m.chat, { 
        image: { url: search.all[0].thumbnail }, 
        caption: body 
    }, { quoted: m });

    let res = isVideo ? await ytmp44(urls) : await ytmp33(urls);
    let type = isVideo ? 'video' : 'audio';

    conn.sendMessage(m.chat, { 
        [type]: { url: res.resultados.descargar }, 
        gifPlayback: true, 
        mimetype: isVideo ? "video/mp4" : "audio/mpeg" 
    }, { quoted: m });
}

handler.command = ['play', 'playvid'];
handler.help = ['play', 'playvid'];
handler.tags = ['dl'];
export default handler;
