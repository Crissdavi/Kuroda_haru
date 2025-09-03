// plugins/harem/unirharemmaestro.js
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
  const target =
    m.mentionedJid?.[0] || // si etiquetan
    (m.quoted ? m.quoted.sender : null) || // si responden
    args[0]

  if (!target) return conn.reply(m.chat, "⚠️ Menciona o responde al maestro del harén al que quieres unirte.", m)
  if (!masters[target]) return conn.reply(m.chat, "⚠️ Esa persona no tiene un harén.", m)
  if (harem[user]) return conn.reply(m.chat, "⚠️ Ya perteneces a un harén.", m)

  const haremId = masters[target].haremId
  harem[user] = { haremId, role: "miembro", status: "active", joinDate: Date.now() }

  saveJSON(haremFile, harem)
  return conn.reply(
    m.chat,
    `✨ Te uniste al harén de @${target.split("@")[0]} con ID: ${haremId}`,
    m,
    { mentions: [target] }
  )
}

handler.command = /^unirharemmaestro$/i
export default handler
