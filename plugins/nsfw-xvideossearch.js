//XVIDEOS -  SEARCH
import fg from 'api-dylux'

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
if (!text) return conn.reply(m.chat, 'ingresa el texto de lo que quieres buscar', m)

try {
let res = await fg.xvideosSearch(text)
let img = res[0].thumb
let txt = 'XVIDEOS  -  SEARCH '
for (let i = 0; i < res.length; i++) {
txt += `\n\n`
txt += `*Nro* : ${i + 1}\n`
txt += `*Titulo* : ${res[i].title}\n`
txt += `*Duracion* : ${res[i].duration}\n`
txt += `*Url* : ${res[i].url}`
}
await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m)
} catch (error) {
console.log(error)
}}

handler.command = ['xvideossearch']
handler.tags = ['nsfw'] 
export default handler