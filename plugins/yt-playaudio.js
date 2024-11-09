//*`[ PLAY - AUDIO ]`*
import yts from 'yt-search'
import axios from 'axios'

let handler = async (m, { conn, text }) => {
if (!text) return m.reply(`ingrese su consulta\n* Ejemplo:* ${usedPrefix}${command} ULTIMATE - xneymar`);
try {
let ytsres = await yts(text)
let vid = ytsres.videos[0]
let { url, title, thumbnail, timestamp, ago } = vid
let api = await axios.get(`https://widipe.com/download/ytdl?url=${url}`)
let json = api.data.result
let { mp3 } = json

let audioMsg = { audio: { url: mp3 },mimetype: 'audio/mpeg',fileName: `${title}.mp3`,contextInfo: {externalAdReply: {showAdAttribution: true,
mediaType: 2,mediaUrl: url,title: title,body: '©HasumiBot',sourceUrl: url,thumbnailUrl: thumbnail,renderLargerThumbnail: true}}}
await conn.sendMessage(m.chat, audioMsg, { quoted: m })
} catch (error) {
console.error(error)
}}


handler.command = /^(play)$/i

export default handler
