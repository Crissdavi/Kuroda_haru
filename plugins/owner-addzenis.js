import db from '../lib/database.js'

import MessageType from '@whiskeysockets/baileys'
let impts = 0
let handler = async (m, { conn, text }) => {
    let who
    if (m.isGroup) who = m.mentionedJid[0]
    else who = m.chat
    if (!who) return m.reply('⚠️️ *Taguea al usuario*')
    let txt = text.replace('@' + who.split`@`[0], '').trim()
    if (!txt) return m.reply('⚠️️ Ingrese la cantidad de *Zenis* que quiere añadir')
    if (isNaN(txt)) return m.reply('⚠️ *sólo números*')
    let len = parseInt(txt)
    let zenis = Zenis
    let pjk = Math.ceil(len * impts)
    zenis += pjk
    if (zenis < 1) return m.reply('⚠️️ Mínimo es  *1*')
    let users = global.db.data.users
   users[who].zenis += len

    await conn.reply(m.chat, `⊜ *😏 AÑADIDO*
┏━━━━━━━━━━━⬣
┃⋄ *Total:* ${len}
┗━━━━━━━━━━━⬣`, m, rcanal)
   conn.fakeReply(m.chat, `⊜ *_Recibiste_* \n\n *_+${len} zenis 💴_*`, who, m.text)
}

handler.help = ['addzenis *<@user>*']
handler.tags = ['owner']
handler.command = ['addzenis', 'addzen', 'regalarzenis'] 
handler.rowner = true

export default handler
