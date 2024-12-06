import axios from 'axios'
import yts from 'yt-search'
 
const handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text || text.trim() === "") return m.reply(`ingresa el texto de lo que quieras buscar`)

await m.react('🕓')
try {
let api = await axios.get(`https://Ikygantengbangetanjay-api.hf.space/yt?query=${encodeURIComponent(text)}`);
let json = api.data.result
 
if (json.duration.seconds >= 3600) {
return m.reply('el video no puede durar mas de 1 hora'), m, rcanal).then(_ => m.react('✖️'))
}
let dl_urlaud = json.download.audio
let dl_urlvid = json.download.video
 
await conn.sendMessage(m.chat, { video: { url: dl_urlaud }, mimetype: 'video/mp4', fileName: `${json.title}.mp4`, caption: `${json.title}` }, { quoted: m })
await m.react('✅')

 
await conn.sendMessage(m.chat, { audio: { url: dl_urlvid }, mimetype: 'audio/mpeg', fileName: `${json.title}.mp3`, }, { quoted: m })
} catch (error) {
console.log(error)
await m.react('✅')
} catch {
await m.react('✖️')
}}}
handler.command = /^(video)$/i;
 
export default handler