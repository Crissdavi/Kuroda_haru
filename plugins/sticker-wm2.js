let ro = 1587
let handler = async (m, { conn, usedPrefix, command}) => {
    let time = global.db.data.users[m.sender].lastrob + 300000
    let user = global.db.data.users[m.sender]
    if (new Date - global.db.data.users[m.sender].lastrob < 300000) conn.reply(m.chat,`⏱️¡Hey! Espera *${msToTime(time - new Date())}* para volver a robar`,m)
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    else who = m.chat
    if (!who) conn.reply(m.chat,`🪐 Etiqueta a alguien para robar`,m)
    if (!(who in global.db.data.users)) throw `🪐 El usuario no se encuentra en mi base de datos`
    let users = global.db.data.users[who]
    let rob = Math.floor(Math.random() * ro)
    if (users.coin < rob) return m.reply(`🔖 @${who.split`@`[0]} tiene menos de *${ro} zenis 💴*\nNo robes a un podre v":`, null, { mentions: [who] })    
   global.db.data.users[m.sender].zenis += rob * user.zenis
   global.db.data.users[who].zenis -= rob * user.zenis
  
    m.reply(`
  ‣ Robaste *${rob * user.zenis} Zenis 💴* a @${who.split`@`[0]}
  `, null, { mentions: [who] })
    global.db.data.users[m.sender].lastrob = new Date * 1
  }

  handler.help = ['rob']
  handler.tags = ['rpg']
  handler.command = ['robar', 'rob']
  
  export default handler
  
  function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
    //  hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  
   // hours = (hours < 10) ? "0" + hours : hours
    minutes = (minutes < 10) ? "0" + minutes : minutes
    seconds = (seconds < 10) ? "0" + seconds : seconds
  
    return minutes + " Minuto(s) " + seconds + " Segundo(s)"
  }