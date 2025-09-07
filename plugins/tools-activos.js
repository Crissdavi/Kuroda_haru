let handler = async (m, { conn, groupMetadata }) => {
    await conn.sendPresenceUpdate('composing', m.chat)

    const lama = 86400000 * 7 // 7 días de inactividad
    const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    const milliseconds = new Date(now).getTime()

    let member = groupMetadata.participants.map(v => v.id)
    let total = 0
    const activos = []

    for (let i = 0; i < member.length; i++) {
        let users = groupMetadata.participants.find(u => u.id === member[i])
        // Verificar si el usuario ha estado activo en los últimos 7 días
        if (typeof global.db.data.users[member[i]] !== 'undefined' && 
            milliseconds - global.db.data.users[member[i]].lastseen <= lama && 
            global.db.data.users[member[i]].banned !== true) {
            total++
            activos.push(member[i])
        }
    }

    if (total === 0) return conn.reply(m.chat, `🤍 *No hay miembros activos registrados en este grupo.*`, m)

    const groupName = await conn.getName(m.chat)
    const message = `*${total}/${member.length}* miembros activos en *${groupName}*\n\n${activos.map(v => '  ○ @' + v.replace(/@.+/, '')).join('\n')}`

    return conn.reply(m.chat, message, m, {
        contextInfo: {
            mentionedJid: activos
        }
    })
}

handler.help = ['activos']
handler.tags = ['group']
handler.command = /^(activos|gcactivos)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler