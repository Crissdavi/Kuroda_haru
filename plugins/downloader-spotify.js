//SPOTIFY  -  DL
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, args }) => {
if (!args[0]) return m.reply(`Ingresa un enlace de Spotify`)
    
try {
let api = await fetch(`https://deliriussapi-oficial.vercel.app/download/spotifydl?url=${args[0]}`)
let json = await api.json()
let { data } = json
let { title, author, image, cover, url } = data

let JT = `*Titulo:* ${title}
*autor:* ${author}`


await conn.sendFile(m.chat, image, `HasumiBotFreeCodes.jpeg`, JT, m);
await conn.sendFile(m.chat, url, 'hasumiBotFreeCodes.mp3', null, m)

} catch (error) {
console.error(error)
}}

handler.command = /^(spotifydl)$/i

export default handler