import yts from 'yt-search';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(
            m.chat,
            `❀ Ingresa el nombre de la canción.\nEjemplo: *${usedPrefix}${command} Believer*`,
            m
        );
    }

    try {
        await m.react('🎵');

        // Buscar en YouTube
        const res = await yts(text);
        const video = res.videos[0];
        if (!video) throw `❀ No encontré resultados para *${text}*.`;

        const { title, url } = video;

        // Llamada a la API de Delirius (ytmp3)
        const apiUrl = `https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(url)}`;
        const apiResponse = await (await fetch(apiUrl)).json();

        // Validar respuesta y extraer URL
        const dl_url = apiResponse?.data?.download?.url;
        if (!dl_url) throw `❀ Error en la API: ${JSON.stringify(apiResponse)}`;

        // Enviar audio
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

        await m.react('✅');
    } catch (error) {
        console.error(error);
        conn.reply(m.chat, `❀ Ocurrió un error: ${error}`, m);
    }
};

handler.command = ['yt3'];
export default handler;