

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return m.reply('ingresa un texto')
let username = `${conn.getName(m.sender)}`

let api = await fetch(`https://api.ssateam.my.id/api/gpt4omini?text=${text}&id=${username}&apiKey=root`)
let json = await api.json()
m.reply(json.data.reply)
}
handler.command = /^(chatgpt)$/i;

export default handler
