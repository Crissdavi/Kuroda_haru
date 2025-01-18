import fetch from 'node-fetch'

let handler = async (m, { conn, command, text, usedPrefix }) => {
if (!text) return conn.reply(m.chat, `❀ Ingresa un link de youtube`, m)

try {
let api = await fetch(`https://axeel.my.id/api/download/audio?url=${text}`)
let json = await api.json()
let { title, views, likes, description, author } = json.metadata
let HS = `- *Titulo :* ${title}
- *Descripcion :* ${description}
- *Visitas :* ${views}
- *Likes :* ${likes}
- *Autor :* ${author}
- *Tamaño :* ${json.downloads.size}
`
m.reply(HS)
await conn.sendMessage(m.chat, { audio: { url: json.downloads.url }, mimetype: 'audio/mpeg' }, { quoted: m });
} catch (error) {
console.error(error)
}}

handler.command = /^(ytmp3)$/i

export default handler