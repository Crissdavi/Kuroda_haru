// plugins/harem/unirharem.js
import fs from "fs"
import path from "path"

const haremFile = path.resolve("src/database/harem.json")
const mastersFile = path.resolve("src/database/harem_masters.json")

function loadJSON(file) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "{}")
  return JSON.parse(fs.readFileSync(file, "utf8"))
}
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn, args }) => {
  let harem = loadJSON(haremFile)
  let masters = loadJSON(mastersFile)
  const user = m.sender
  const target = m.mentionedJid[0] || args[0]

  if (!masters[user]) {
    return conn.reply(m.chat, "《✧》 Solo los maestros de un harén pueden reclutar.", m)
  }
  if (!target) return conn.reply(m.chat, "⚠️ Menciona a quién quieres reclutar.", m)
  if (harem[target]) return conn.reply(m.chat, "⚠️ Ese usuario ya está en un harén.", m)

  const haremId = masters[user].haremId
  harem[target] = { haremId, role: "miembro", status: "active", joinDate: Date.now() }

  saveJSON(haremFile, harem)
  return conn.reply(
    m.chat,
    `✨ Has reclutado a @${target.split("@")[0]} a tu harén (ID: ${haremId})`,
    m,
    { mentions: [target] }
  )
}

handler.command = /^unirharem$/i
export default handler
