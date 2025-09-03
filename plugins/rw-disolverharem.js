// plugins/harem/disolverharem.js
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

// memoria temporal de confirmaciones
let confirmaciones = {}

let handler = async (m, { conn, args }) => {
  let masters = loadJSON(mastersFile)
  const user = m.sender
  const haremId = args[0]

  if (!masters[user]) {
    return conn.reply(m.chat, "《✧》 Solo los maestros de un harén pueden disolverlo.", m)
  }

  const myHaremId = masters[user].haremId
  if (!haremId) {
    return conn.reply(m.chat, `⚠️ Debes indicar el ID de tu harén.\nEjemplo: .disolverharem ${myHaremId}`, m)
  }

  if (haremId !== myHaremId) {
    return conn.reply(m.chat, "⚠️ Solo puedes disolver tu propio harén.", m)
  }

  confirmaciones[user] = { haremId, chat: m.chat }
  return conn.reply(
    m.chat,
    `⚠️ Estás a punto de disolver tu harén (ID: ${haremId}).\n\nEscribe *si* para confirmar o *no* para cancelar.`,
    m
  )
}

handler.command = /^disolverharem$/i
export default handler

// --- confirmación escrita ---
export async function before(m, { conn }) {
  const user = m.sender
  if (!confirmaciones[user]) return false
  const { haremId, chat } = confirmaciones[user]

  if (m.chat !== chat) return false
  const respuesta = m.text?.trim().toLowerCase()

  if (respuesta === "si") {
    let harem = loadJSON(haremFile)
    let masters = loadJSON(mastersFile)

    if (!masters[user] || masters[user].haremId !== haremId) {
      delete confirmaciones[user]
      return conn.reply(chat, "⚠️ Ya no eres maestro de ese harén.", m)
    }

    // eliminar miembros
    for (let u in harem) {
      if (harem[u].haremId === haremId) {
        delete harem[u]
      }
    }
    delete masters[user]

    saveJSON(haremFile, harem)
    saveJSON(mastersFile, masters)

    delete confirmaciones[user]
    return conn.reply(chat, `✅ Tu harén (ID: ${haremId}) ha sido disuelto.`, m)
  }

  if (respuesta === "no") {
    delete confirmaciones[user]
    return conn.reply(chat, "❌ Has cancelado la disolución del harén.", m)
  }

  return false
}