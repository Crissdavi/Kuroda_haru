import axios from 'axios'
import yts from 'yt-search'

let handler = async (m, { conn, text, isPrems, isOwner, usedPrefix, command }) => {
if (!m.quoted) return conn.reply(m.chat, `[ ✰ ] Etiqueta el mensaje que contenga el resultado de YouTube Play.`, m, rcanal).then(_ => m.react('✖️'))
if (!m.quoted.text.includes("乂  Y O U T U B E  -  P L A Y")) return conn.reply(m.chat, `[ ✰ ] Etiqueta el mensaje que contenga el resultado de YouTube Play.`, m, rcanal).then(_ => m.react('✖️'))
let urls = m.quoted.text.match(new RegExp(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/, 'gi'))
if (!urls) return conn.reply(m.chat, `Resultado no Encontrado.`, m, rcanal).then(_ => m.react('✖️'))
if (urls.length < text) return conn.reply(m.chat, `Resultado no Encontrado.`, m, rcanal).then(_ => m.react('✖️'))
let user = global.db.data.users[m.sender]
 
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

handler.help = ['Video']
handler.tags = ['youtube']
handler.customPrefix = /^(Video|video|vídeo|Vídeo)/
handler.command = new RegExp
//handler.limit = 1

export default handler
