
import fetch from 'node-fetch'
const { generateWAMessageContent, generateWAMessageFromContent, proto } = (await import('@whiskeysockets/baileys')).default

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return m.reply('Ingresa el texto de lo que quieres buscar en Spotify');
await m.react('🕓')
try {
async function createImage(url) {
const { imageMessage } = await generateWAMessageContent({image: { url }}, {upload: conn.waUploadToServer})
return imageMessage
}

let push = [];
let api = await fetch(`https://deliriussapi-oficial.vercel.app/search/spotify?q=${encodeURIComponent(text)}`);
let json = await api.json()

for (let track of json.data) {
let image = await createImage(track.image)

push.push({
body: proto.Message.InteractiveMessage.Body.fromObject({text: `*${track.title}* - ${track.artist}`}),
footer: proto.Message.InteractiveMessage.Footer.fromObject({text: `Popularidad: ${track.popularity}`}),
header: proto.Message.InteractiveMessage.Header.fromObject({title: '', hasMediaAttachment: true, imageMessage: image}),
nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
buttons: [
{
"name": "cta_copy",
"buttonParamsJson": "{\"display_text\":\"copiar url\",\"id\":\"123456789\",\"copy_code\":\"" + track.url + "\"}"
},
]
})
});
}

const msg = generateWAMessageFromContent(m.chat, {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 2
},
interactiveMessage: proto.Message.InteractiveMessage.fromObject({
body: proto.Message.InteractiveMessage.Body.create({text: `${text}`}),
footer: proto.Message.InteractiveMessage.Footer.create({text: '> Spotify'}),
header: proto.Message.InteractiveMessage.Header.create({hasMediaAttachment: false}),
carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({cards: [...push]})
})
}}}, {})

await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
} catch (error) {
console.error(error)
}}

handler.help = ["spotifysearch"]
handler.tags = ["search"]
handler.command = /^(spotifysearch)$/i

export default handler