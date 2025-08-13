import fetch from 'node-fetch';
let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    let pp = await conn.profilePictureUrl(m.sender, 'image')

    const anu = {
      "key": {
        "fromMe": false,
        "participant": "0@s.whatsapp.net",
        "remoteJid": "0@s.whatsapp.net"
      },
      "message": {
        "groupInviteMessage": {
          "groupJid": "6285240750713-1610340626@g.us",
          "inviteCode": "mememteeeekkeke",
          "groupName": "P",
          "caption": "Hello, I'm Kuroda",
          "jpegThumbnail": await (await fetch(pp)).buffer()
        }
      }
    }
    
    conn.sendMessage(m.chat, { text: 'Hola soy Kuroda, ¿Cómo puedo ayudarte?' }, { quoted: anu })
  } catch (error) {
    conn.sendMessage(m.chat, 'Hola soy Kuroda, un gusto', 'conversation', { quoted: m })
  }
}

handler.customPrefix = /^(kuroda)$/i
handler.command = new RegExp
export default handler
