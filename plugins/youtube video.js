import axios from 'axios'
import yts from 'yt-search'
 
const handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text || text.trim() === "") return m.reply(`ingresa el texto de lo que quieras buscar`)
try {
let api = await axios.get(`https://Ikygantengbangetanjay-api.hf.space/yt?query=${encodeURIComponent(text)}`);
let json = api.data.result
 
if (json.duration.seconds >= 3600) {
return m.reply('el video no puede durar mas de 1 hora')
}
let dl_urlaud = json.download.audio
let dl_urlvid = json.download.video
 
await conn.sendMessage(m.chat, { video: { url: dl_urlaud }, mimetype: 'video/mp4', fileName: `${json.title}.mp4`, caption: `${json.title}` }, { quoted: m })
 
await conn.sendMessage(m.chat, { audio: { url: dl_urlvid }, mimetype: 'audio/mpeg', fileName: `${json.title}.mp3`, }, { quoted: m })
} catch (error) {
console.log(error)
}}

Please, Sign In to add comment
handler.help = ['Video']
handler.tags = ['youtube']
handler.customPrefix = /^(Video|video|vídeo|Vídeo)/
handler.command = new RegExp
//handler.limit = 1

export default handler
