
import fetch from 'node-fetch'

let HS = async (m, { conn, command, text, usedPrefix }) => {
if (!text) return conn.reply(m.chat, '🪐 ingresa un link de youtube', m, null, rcanal)
try {
let api = await fetch(`https://api.davidcyriltech.my.id/download/ytmp4?url=${text}`)
let json = await api.json()
let { title, quality, thumbnail, download_url } = json.result
await conn.sendMessage(m.chat, { video: { url: download_url }, caption: title }, { quoted: m })
} catch (error) {
console.error(error)
}}

HS.command = ['ytmp4']

export default HS