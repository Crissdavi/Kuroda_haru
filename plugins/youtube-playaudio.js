import fetch from "node-fetch"
import yts from 'yt-search';
import axios from 'axios'
 
let handler = async (m, { text, conn, args, usedPrefix, command }) => {
if (!text) return m.reply("ingresa el texto de lo que quieres buscar")
const yt = await search(args.join(' '))
 
try {
let api = await fetch(`https://miyanapi.vercel.app/youtube?url=${yt[0].url}`)
let { data } = await api.json()
let { audio_url, title, thumbnail } = data
const dl_url = await getBuffer(audio_url)
 
await conn.sendFile(m.chat, dl_url, 'HasumiBotFreeCodes.mp3', title, m)
} catch (error) {
console.error(error)
}}
 
handler.command = ['play']
export default handler
 
async function search(query, options = {}) {
  const search = await yts.search({query, hl: 'es', gl: 'ES', ...options});
  return search.videos;
}
 
const getBuffer = async (url, options) => {
    options ? options : {};
    const res = await axios({method: 'get', url, headers: {'DNT': 1, 'Upgrade-Insecure-Request': 1,}, ...options, responseType: 'arraybuffer'});
    return res.data;
}
