

import fetch from 'node-fetch';
import Sph from 'ytdl-mp3';

let handler = async (m, { conn, text }) => {
    if (!m.quoted) return;
    if (!m.quoted.text.includes("*`【Y O U T U B E - P L A Y】`*")) return;

    let urls = m.quoted.text.match(new RegExp(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9_-]+)/, 'gi'));
    if (!urls) return conn.reply(m.chat, `Resultado no encontrado.`, m);
    if (urls.length < text) return conn.reply(m.chat, `Resultado no encontrado.`, m);

    let videoUrl = urls[0];

    await m.react('🕓');

    try {
        let cxf = await Sph.ytdl(videoUrl);
        await conn.sendMessage(m.chat, { audio: { url: cxf.dl_url }, fileName: `${cxf.title}.mp3`, mimetype: 'audio/mp4' }, { quoted: m });
        await m.react('✅');
    } catch (error) {
        await m.react('✖️');
        return m.reply(`Ocurrió un error al procesar tu solicitud. Intenta nuevamente más tarde.`);
    }
};

handler.customPrefix = /^(a|A)/;
handler.command = new RegExp();