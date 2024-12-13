import fetch from "node-fetch"
import axios from 'axios'
 
let handler = async (m, { text, conn, args, usedPrefix, command }) => {
if (!text) return m.reply("ingresa el texto de lo que quieres buscar")
 
try {
let api = await fetch(`https://eliasar-yt-api.vercel.app/api/download/youtube?text=${text}&format=mp3`)
let { downloadInfo } = await api.json()
let { downloadUrl, title } = downloadInfo
const aud = await getBuffer(downloadUrl);
 
await conn.sendMessage(m.chat, { audio: aud, mimetype: 'audio/mpeg', fileName: title + `.mp3` }, { quoted: m });
} catch (error) {
console.error(error)
}}
 
handler.command = ['play']
export default handler
 
 
const getBuffer = async (url, options) => {
    options ? options : {};
    const res = await axios({method: 'get', url, headers: {'DNT': 1, 'Upgrade-Insecure-Request': 1,}, ...options, responseType: 'arraybuffer'});
    return res.data;
}
