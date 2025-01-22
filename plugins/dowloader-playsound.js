import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
if (!text) return conn.reply(m.chat, `❀ Ingresa el texto de la cancion que quieras buscar en soundcloud`, m)
    
try {
let apiSearch = await fetch(`https://api.siputzx.my.id/api/s/soundcloud?query=${text}`)   
let jsonSearch = await apiSearch.json()
let { permalink_url:link } = jsonSearch.data[0]

let apiDL = await fetch(`https://api.siputzx.my.id/api/d/soundcloud?url=${link}`)
let jsonDL = await apiDL.json()
let { title, thumbnail, url } = jsonDL.data

let aud = { audio: { url: url }, mimetype: 'audio/mp4', fileName: `${title}.mp3`, contextInfo: { externalAdReply: { showAdAttribution: true, mediaType: 2, mediaUrl: url, title: title, sourceUrl: null, thumbnail: await (await conn.getFile(thumbnail)).data }}}

await conn.sendMessage(m.chat, aud, { quoted: m })

} catch (error) {
console.error(error)
}}

handler.command = ['soundcloudplay', 'soundplay', 'playsound']
export default handler