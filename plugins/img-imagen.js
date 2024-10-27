

//*`[ IMAGEN SEARCH - CARRUSEL ]`*
import axios from 'axios';
const { proto, generateWAMessageFromContent, generateWAMessageContent } = (await import('@whiskeysockets/baileys')).default

let handler = async (m, { conn, text }) => {
if (!text) return m.reply('Ingresa el texto de lo que quieres buscar');
const prohibited = ['caca', 'polla', 'porno', 'porn', 'gore', 'cum', 'semen', 'puta', 'puto', 'culo', 'putita', 'putito','pussy', 'hentai', 'pene', 'coño', 'asesinato', 'zoofilia', 'mia khalifa', 'desnudo', 'desnuda', 'cuca', 'chocha', 'muertos', 'pornhub', 'xnxx', 'xvideos', 'teta', 'vagina', 'marsha may', 'misha cross', 'sexmex', 'furry', 'furro', 'furra', 'xxx', 'rule34', 'panocha', 'pedofilia', 'necrofilia', 'pinga', 'horny', 'ass', 'nude', 'popo', 'nsfw', 'femdom', 'futanari', 'erofeet', 'sexo', 'sex', 'yuri', 'ero', 'ecchi', 'blowjob', 'anal', 'ahegao', 'pija', 'verga', 'trasero', 'violation', 'violacion', 'bdsm', 'cachonda', '+18', 'cp', 'mia marin', 'lana rhoades', 'cogiendo', 'cepesito', 'hot', 'buceta', 'xxx', 'rule', 'r u l e']
if (prohibited.some(word => m.text.toLowerCase().includes(word))) return m.reply('Deja de buscar eso puto enfermo de mierda, que por eso no tienes novia.').then(_ => m.react('✖️'))
await m.react('🕓')
async function createImage(url) {
const { imageMessage } = await generateWAMessageContent({image: { url }}, { upload: conn.waUploadToServer })
return imageMessage
}

try {
let HasumiBotFreeCodes = []
let { data } = await axios.get(`https://api.ryzendesu.vip/api/search/gimage?query=${encodeURIComponent(text)}`)
let JT = data
let imgs = JT.slice(0, 7)

for (let result of imgs) {
HasumiBotFreeCodes.push({
header: proto.Message.InteractiveMessage.Header.fromObject({ title: ``, hasMediaAttachment: true, imageMessage: await createImage(result) }),
await m.react('✅')
} catch {
await m.react('✖️')
}}
body: proto.Message.InteractiveMessage.Body.fromObject({ text: `${text}` }),
footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: `` }),
nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
})
}

const msg = generateWAMessageFromContent(m.chat, {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 2
},
interactiveMessage: proto.Message.InteractiveMessage.fromObject({contextInfo: {mentionedJid: [m.sender]},
body: proto.Message.InteractiveMessage.Body.create({ text: 'Sigue el canal Koruda' }),
footer: proto.Message.InteractiveMessage.Footer.create({ text: 'imagen search' }),
header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: [...Sigue el canal del bot] })
})
}}}, { quoted: m })

await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
} catch (error) {
console.error(error) 
}}
handler.help = ['imagen *<búsqueda>*']
handler.tags = ['img']
handler.command = ['imagen']
handler.register = true 
//handler.limit = 1
export default handler
