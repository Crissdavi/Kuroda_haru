//*`[ SPOTIFY - DL ]`*
import axios from 'axios'

let delay = ms => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn, args }) => {
if (!args[0]) return m.reply('Ingresa un enlace de spotify')
try {
let api = await axios.get(`https://api.ryzendesu.vip/api/downloader/spotify?url=${encodeURIComponent(args[0])}`)
let json = api.data

if (json.success) {
if (json.metadata.playlistName) {
let playlistName = json.metadata.playlistName
let cover = json.metadata.cover
let tracks = json.tracks
m.reply(`*Playlist:* ${playlistName}
*Cover:* ${cover}
*Total Tracks:* ${tracks.length}`)

for (let i = 0; i < tracks.length; i++) {
let track = tracks[i]
if (track.success) {
let { title, artists, album, cover, releaseDate } = track.metadata
let link = track.link  
let audioGet = await axios.get(link, { responseType: 'arraybuffer' })
let audio = audioGet.data

await conn.sendMessage(m.chat, {
document: audio, 
mimetype: 'audio/mpeg',
fileName: `${title}.mp3`,
caption: `
*Title:* ${title}
*Artists:* ${artists}
*Album:* ${album}
*Release Date:* ${releaseDate}
*Cover:* ${cover}
`,
}, { quoted: m })

await delay(1500)
} else {}
}
} else {
let { title, artists, album, cover, releaseDate } = json.metadata
let link = json.link  

let audioGet = await axios.get(link, { responseType: 'arraybuffer' })
let audio = audioGet.data

await conn.sendMessage(m.chat, {
document: audio,
mimetype: 'audio/mpeg',
fileName: `${title}.mp3`,
caption: `
*Title:* ${title}
*Artists:* ${artists}
*Album:* ${album}
*Release Date:* ${releaseDate}
*Cover:* ${cover}
`,
}, { quoted: m })
}
} else {}
} catch (error) {
console.error(error)
}}


handler.command = /^(spotifydl)$/i

export default handler
