let handler = async (m, { command, text }) => m.reply(`
*🚫 𝐑𝐞𝐯𝐞𝐥𝐚𝐧𝐝𝐨 𝐠é𝐧𝐞𝐫𝐨 🚫*
  
*𝙿𝚁𝙴𝙶𝚄𝙽𝚃𝙰:* ${text}
*Que genero es :* ${['Mujer','Hombre','trans','Bisexual','Polisexual', 'Pansexual', 'Ni idea'].getRandom()}
`.trim(), null, m.mentionedJid ? {
mentions: m.mentionedJid
} : {})
handler.help = ['revelargenero, *<texto>*']
handler.tags = ['fun']
handler.command = /^quegeneroes|quegenerosera|quegenerosoy|apakah$/i
export default handler
