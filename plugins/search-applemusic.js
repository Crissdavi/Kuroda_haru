//APPLE MUSIC  -  SEARCH
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
if (!text) return m.reply(`Ingresa una petición`)

try {
let api = await fetch(`https://deliriussapi-oficial.vercel.app/search/applemusic?text=${encodeURIComponent(text)}`)
let json = await api.json()
let JT = 'Applemusic  -  Search'
json.forEach((video, index) => {
JT += `\n\n`
JT += `*Nro* : ${index + 1}\n`
JT += `*Título* : ${video.title}\n`
JT += `*Tipo* : ${video.type}\n`
JT += `*Artista* : ${video.artists}\n`
JT += `*Url* : ${video.url}\n`
})

await conn.sendFile(m.chat, json[0].image, 'hasumiBotFreeCodes.jpg', JT, m);
} catch (error) {
console.error(error)
}}

handler.tags = ['search']
handler.help = ['applemusicsearch']
handler.command = /^(applemusicsearch)$/i

export default handler