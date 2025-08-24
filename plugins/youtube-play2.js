import yts from 'yt-search';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(m.chat, `❀ Especifica el formato (MP3 o MP4) y la búsqueda. Ejemplo: *${usedPrefix}${command} MP3 <término>*`, m);
    }

    const [format, ...query] = text.split(' ');
    if (!['MP3', 'MP4'].includes(format)) {
        return conn.reply(m.chat, `❀ Formato no válido. Usa *${usedPrefix}${command} MP3 <búsqueda>* o *${usedPrefix}${command} MP4 <búsqueda>*`, m);
    }

    const searchQuery = query.join(' ');
    if (!searchQuery) {
        return conn.reply(m.chat, `❀ Por favor, escribe un término de búsqueda después del formato.`, m);
    }

    try {
        await m.react('📦');

        let res = await yts(searchQuery);
        let video = res.videos[0];
        if (!video) throw `❀ No se encontraron resultados para *${searchQuery}*.`;

        let { title, url } = video;
        const apiUrl = `https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(url)}&apikey=sylphy`;
        const apiResponse = await (await fetch(apiUrl)).json();
        if (!apiResponse?.res?.url) throw `❀ Error de API: ${apiResponse?.error || apiResponse?.message || JSON.stringify(apiResponse)}`;

        const dl_url = apiResponse.res.url;

        if (format === 'MP3') {
            await conn.sendMessage(
                m.chat,
                { audio: { url: dl_url }, mimetype: "audio/mp4", ptt: true },
                { quoted: m }
            );
        } else if (format === 'MP4') {
            await conn.sendMessage(
                m.chat,
                { video: { url: dl_url }, caption: `❀ Descargado: *${title}*` },
                { quoted: m }
            );
        }

        await m.react('✅');
    } catch (error) {
        console.error(error);
        conn.reply(m.chat, `❀ Hubo un error: ${error}`, m);
    }
};

handler.command = ['play'];

export default handler;