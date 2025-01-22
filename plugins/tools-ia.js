import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return conn.reply(m.chat, `🪐 Ingresa un texto para hablar con chatgpt`, m, null, rcanal)


try {
let prompt = 'eres Koruda, creado por Haru ✯, tu proposito es ayudar a los usuarios respondiendo sus preguntas'
let api = await axios.get(`https://restapi.apibotwa.biz.id/api/gptlogic?message=${text}&prompt=${prompt}`)
let json = api.data
m.reply(json.data.response)
} catch (error) {
console.error(error)    
}}    

handler.command = ['chatgpt', 'ia', 'Ia', 'IA']
handler.help = ['ia']
handler.tags = ['tools'] 
handler.group = true
//handler.limit = 1
handler.register = true 
export default handler