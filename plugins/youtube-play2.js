import yts from 'yt-search';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(
            m.chat,
            `❀ Usa el comando correctamente:\n` +
            `• *${usedPrefix}${command} <nombre>* → descarga en audio (MP3)\n` +
            `• *${usedPrefix}${command} video <nombre>* → descarga en video (MP4)`,
            m
        );
    }

    try {
        await m.react('🎵');

        // Revisamos si pidió video
        let isVideo = false;
        let query = text;

        if (text.toLowerCase().startsWith('video ')) {
            isVideo = true;
            query = text.slice(6).trim(); // removemos la palabra "video"
        }

        // Buscar en YouTube
        const res = await yts(query);
        const video = res.videos[0];
        if (!video) throw `❀ No encontré resultados para *${query}*.`;

        const { title, url } = video;

        // Seleccionamos endpoint según tipo
        const endpoint = isVideo ? 'ytmp4' : 'ytmp3';
        const apiUrl = `https://api.delirius.store/download/${endpoint}?url=${encodeURIComponent(url)}`;
        const apiResponse = await (await fetch(apiUrl)).json();

        // Validar respuesta
        const dl_url = isVideo ? apiResponse?.result?.download_url : apiResponse?.result?.download_url;
        if (!dl_url) throw `❀ Error en la API: ${JSON.stringify(apiResponse)}`;

        // Enviar según formato
        if (isVideo) {
            await conn.sendMessage(
                m.chat,
                {
                    video: { url: dl_url },
                    caption: `❀ Descargado: *${title}*`
                },
                { quoted: m }
            );
        } else {
            await conn.sendMessage(
                m.chat,
                {
                    audio: { url: dl_url },
                    mimetype: "audio/mp4",
                    fileName: `${title}.mp3`,
                    ptt: false
                },
                { quoted: m }
            );
        }

        await m.react('✅');
    } catch (error) {
        console.error(error);
        conn.reply(m.chat, `❀ Ocurrió un error: ${error}`, m);
    }
};

handler.command = ['play'];
export default handler;