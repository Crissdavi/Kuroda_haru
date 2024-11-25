let handler = async (m, { command, text }) => m.reply(`
*⁉️ 𝐏𝐑𝐄𝐆𝐔𝐍𝐓𝐀 ⁉️*
  
*𝙿𝚁𝙴𝙶𝚄𝙽𝚃𝙰:* ${text}
*𝚁𝙴𝚂𝙿𝚄𝙴𝚂𝚃𝙰:* ${['Mujer','Hombre','trans','Bisexual','Polisexual', 'Pansexual',Ni idea''].getRandom()}
`.trim(), null, m.mentionedJid ? {
mentions: m.mentionedJid
} : {})
handler.help = ['revelargenero, *<texto>*']
handler.tags = ['fun']
handler.command = /^quegeneroes|quegenerosera|quegenerosoy|apakah$/i
export default handler
