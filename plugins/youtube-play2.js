import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
if (!text) throw '• Ingresa un enlace de YouTube.'
try {
let res = await fetch(`https://api.diioffc.web.id/api/download/ytmp3?url=${encodeURIComponent(text)}`)
let json = await res.json()
if (json.status && json.result?.download?.url) {
let { title, thumbnail, views, duration, author, download } = json.result
let caption = `• *Título:* ${title}\n• *Canal:* ${author.name}\n• *Duración:* ${duration.timestamp}\n• *Vistas:* ${views.toLocaleString()}`
await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption }, { quoted: m })
await conn.sendMessage(m.chat, { audio: { url: download.url }, mimetype: 'audio/mpeg', fileName: download.filename || 'audio.mp3' }, { quoted: m })
} else throw 'No se pudo obtener el audio.'
} catch (e) {
m.reply(`❌ *Error:* Ocurrió un error desconocido`)
}}
handler.command = ['ytmp3']
export default handler