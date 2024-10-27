import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!args[0]) return conn.reply(m.chat, '*Ingresa un enlace de youtube*', m);
 
try {
let api = await fetch(`https://apis-starlights-team.koyeb.app/starlight/ytmp4?url=${args[0]}`);
let json = await api.json();
let { id, thumbnails, url, download } = json

let txt = `*ID* : ${id}
*Url* : ${url}`;
await conn.sendFile(m.chat, thumbnails.high, 'ytmp4.jpg', txt, m)

await conn.sendMessage(m.chat, { video: { url: download }, caption: null, mimetype: 'video/mp4', fileName: `${id}` + `.mp4`}, {quoted: m })

} catch {
conn.reply('error :v')    
}
}
    
handler.command = ['ytmp4'];

export default handler;