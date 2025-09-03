// src/plugins/harem/idharem.js
import { loadMasters } from './storage.js'

const handler = async (m, { conn }) => {
  const masters = loadMasters()
  const user = m.sender

  if (!masters[user] || !masters[user].haremId) {
    return conn.reply(m.chat, 'No eres maestro de ningún harén', m)
  }

  return conn.reply(m.chat, masters[user].haremId, m)
}

handler.command = /^idharem$/i
export default handler