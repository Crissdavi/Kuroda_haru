

import fetch from 'node-fetch'

let handler = async (m, { conn, command, text, usedPrefix }) => {
if (!text) return conn.reply(m.chat, `❀ Ingresa un link de youtube`, m)

try {
let api = await fetch(`https://delirius-apiofc.vercel.app/download/ytmp3?url=${text}`)
let json = await api.json()
let { title, author, image:img, id, views, likes, comments, duration, download } = json.data
let HS = `- *Titulo :* ${title}
- *Autor :* ${author}
- *Visitas :* ${Num(views)}
- *Likes :* ${Num(likes)}
- *Comentarios :* ${Num(comments)}

*[ INFO ARCHIVO AUDIO ]*

- *Tamaño :* ${download.size}
- *Calidad :* ${download.quality}`
await conn.sendFile(m.chat, img, 'HasumiBotFreeCodes.jpg', HS, m)
await conn.sendMessage(m.chat, { audio: { url: download.url }, mimetype: 'audio/mpeg' }, { quoted: m });
} catch (error) {
console.error(error)
}}

handler.command = /^(ytmp3)$/i

export default handler

function Num(number) {
if (number >= 1000 && number < 1000000) {
return (number / 1000).toFixed(1) + 'k'
} else if (number >= 1000000) {
return (number / 1000000).toFixed(1) + 'M'
} else if (number <= -1000 && number > -1000000) {
return (number / 1000).toFixed(1) + 'k'
} else if (number <= -1000000) {
return (number / 1000000).toFixed(1) + 'M'
} else {
return number.toString()
}}