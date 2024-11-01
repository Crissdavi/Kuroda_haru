
//*`[ TIKTOK - DL ]`*
import axios from 'axios'

let handler = async (m, { conn, args }) => {
if (!args[0]) return m.reply('https://vm.tiktok.com/ZMhNNeDHU/')
try {
let api = await axios.get(`https://api.ryzendesu.vip/api/downloader/ttdl?url=${encodeURIComponent(args[0])}`)
let json = api.data
let { data, processed_time:proceso } = json
let { play:video, duration:duracion, title: titulo, music:audio } = data

let txt = '`乂  T I K T O K  -  D O W N L O A D`\n\n'
    txt += `	✩  *Título* : ${title}\n`
    txt += `	✩  *Autor* : ${author}\n`
    txt += `	✩  *Duración* : ${duration} segundos\n`
    txt += `	✩  *Vistas* : ${views}\n`
    txt += `	✩  *Likes* : ${likes}\n`
    txt += `	✩  *Comentarios* : ${comment}\n`
    txt += `	✩  *Compartidos* : ${share}\n`
    txt += `	✩  *Publicado* : ${published}\n`
    txt += `	✩  *Descargas* : ${downloads}\n\n`
    txt += `> 🚩 *${textbot}*`
await conn.sendFile(m.chat, video, 'HasumiBotFreeCodes.mp4', JT, m)
await conn.sendFile(m.chat, audio, 'HasumiBotFreeCodes.mp3', null, m)
} catch (error) {
console.error(error)    
}}

handler.command = /^(tiktok)$/i

export default handler