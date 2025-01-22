import fetch from 'node-fetch'

let handler = async(m, { conn, text }) => {
if (!text) {
return conn.reply(m.chat, `🪐 Ingresa un texto para hablar con Gemini`, m)
}
    
try {
let api = await fetch(`https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${text}`)
let json = await api.json()
await m.reply(json.result)
} catch (error) {
console.error(error)    
}}

handler.help = ['gemini']
handler.tags = ['tools']
handler.command = ['gemini'] 
handler.group = true
//handler.limit = 1
handler.register = true 
export default handler