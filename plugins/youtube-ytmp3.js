import fetch from 'node-fetch'

let handler = async (m, { conn, command, text, usedPrefix }) => {
if (!text) return conn.reply(m.chat, '🪐 Ingresa un link de un video de youtube', m, null, rcanal)
try {
let api = await fetch(`https://api.davidcyriltech.my.id/download/ytmp3?url=${text}`)
let json = await api.json()
let { title, download_url, quality } = json.result
await conn.sendMessage(m.chat, { audio: { url: download_url }, mimetype: "audio/mpeg" }, { quoted: m })
} catch (error) {
console.error(error)
}}

handler.command = ['ytmp3']

export default handler