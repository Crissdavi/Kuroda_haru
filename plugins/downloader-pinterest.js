import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) throw m.reply(`Ingresa un link de pinterest\n*✧ Ejemplo:* ${usedPrefix}${command} https://pin.it/7I5UODZJB`);
conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
	let ouh = await fetch(`https://api.zenkey.my.id/api/download/pinterest?q=loli&apikey=?url=${text}`)
  let gyh = await ouh.json()
	await conn.sendFile(m.chat, gyh.data.result, `pinvideobykeni.mp4`, `*✧ Url:* ${gyh.data.url}`, m)
	await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }})
}
handler.help = ['pinvid']
handler.tags = ['downloader']
handler.command = /^(pinvid|pinvideo)$/i
handler.premium = false
handler.register = true
export default handler;