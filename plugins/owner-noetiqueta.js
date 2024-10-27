let handler = async (m, { conn, usedPrefix, isOwner }) => {
await m.react('😺')
await conn.reply(m.chat, `Hola @${m.sender.split`@`[0]} si necesitas la ayuda de mi creador porfavor escribele al privado\n*- Solo asuntos importantes -*`, estilo, { mentions: [m.sender] })
let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;Criss;;\nFN:Criss\nORG:Criss\nTITLE:\nitem1.TEL;waid=51913776697:51913776697\nitem1.X-ABLabel:Criss\nX-WA-BIZ-DESCRIPTION:\nX-WA-BIZ-NAME:Criss\nEND:VCARD`
await conn.sendMessage(m.chat, { contacts: { displayName: 'Criss', contacts: [{ vcard }] }}, {quoted: m})
}
handler.customPrefix = /^(@51913776697)$/i
handler.command = new RegExp
export default handler
