import yts from 'yt-search';
import axios from 'axios';
import fetch from "node-fetch";

const handler = async (m, { text, usedPrefix, command, conn }) => {
    if (!text) {
        throw m.reply("✧ Ingresa una consulta de *YouTube*");
    }
    await m.react('🕓');
    
    let res = await yts(text);
    let videoList = res.all;
    let videos = videoList[0];

    async function ytdl(url) {
        const response = await fetch('https://shinoa.us.kg/api/download/ytdl', {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'api_key': 'free',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: url
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    }

    let data_play = await ytdl(videos.url);
    console.log(data_play);

    if (data_play && data_play.data && data_play.data.mp3) {
        await conn.sendMessage(m.chat, { 
            audio: { url: data_play.data.mp3 }, 
            mimetype: 'audio/mp4',
        }, { quoted: m });
        
        await m.react('✅'); 
    } else {
        await m.reply("❌ No se pudo obtener el audio.");
        await m.react('❌'); 
    }
};

handler.help = ['ytmp3 <yt url>'];
handler.tags = ['downloader'];
handler.command = ['ytmp3', 'yta'];
handler.register = false;

export default handler;
