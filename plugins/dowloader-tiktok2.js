
// *[ ✿ TIKTOK DL ]*
import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
let tiktokUrl = args[0]

if (!tiktokUrl || !tiktokUrl.includes("tiktok.com")) {
return m.reply('Ingresa un link de tiktok');
}

try {
let api = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(tiktokUrl)}`)
let json = await api.json()

let txt = `- *Video de :* _${json.author.name || "Desconocido"}_ ( @${json.author.unique_id || "N/A"})
- *Likes :* ${json.stats.likeCount || 0}
- *Comentarios :* ${json.stats.commentCount || 0}
- *Compartidos :* ${json.stats.shareCount || 0}
- *Reproducciones*: ${json.stats.playCount || 0}
- *Guardados*: ${json.stats.saveCount || 0}

Responde con:

✿ *1* (Calidad mediana)  
✿ *2* (Calidad alta)  
✿ *3* (audio)`

let enviarvid = await conn.sendMessage(m.chat, { video: { url: json.video.noWatermark }, caption: txt }, { quoted: m })
let msgID = enviarvid.key.id

conn.ev.on("messages.upsert", async (update) => {
let mensajeRecibido = update.messages[0]
if (!mensajeRecibido.message) return

let respuestaTXT = mensajeRecibido.message.conversation || mensajeRecibido.message.extendedTextMessage?.text
let chatId = mensajeRecibido .key.remoteJid
let RespuestaMSG = mensajeRecibido.message.extendedTextMessage?.contextInfo?.stanzaId === msgID

if (RespuestaMSG) {
await conn.sendMessage(chatId, { react: { text: '⬇️', key: mensajeRecibido.key, } })
if (respuestaTXT === '1') {
await conn.sendMessage(chatId, {video: { url: json.video.noWatermark }, caption: "Video Calidad Mediana",}, { quoted: mensajeRecibido })
} else if (respuestaTXT === '2') {
await conn.sendMessage(chatId, {video: { url: json.video.watermark }, caption: "Video Calidad Alta",}, { quoted: mensajeRecibido })
} else if (respuestaTXT === '3') {
await conn.sendMessage(chatId, {audio: { url: json.video.watermark }, caption: "Video Calidad Alta",}, { quoted: mensajeRecibido })
} else {
await conn.sendMessage(chatId, "✿ Solo puedes responder con 1,2,3", m)
}}})
      
} catch (error) {
console.error(error)
}}

handler.command = ['tiktok2']

export default handler
