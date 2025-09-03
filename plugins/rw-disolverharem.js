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

let handler = async (m, { conn, args }) => {
  let harem = loadJSON(haremFile)
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

  // Crear botones
  const buttons = [
    { buttonId: `confirmarDisolver_${haremId}`, buttonText: { displayText: "✅ Confirmar" }, type: 1 },
    { buttonId: "cancelarDisolver", buttonText: { displayText: "❌ Cancelar" }, type: 1 },
  ]

  const buttonMessage = {
    text: `⚠️ Estás a punto de disolver tu harén (ID: ${haremId}).\n\n¿Quieres continuar?`,
    footer: "Sistema de Harén",
    buttons,
    headerType: 1,
  }

  await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}

handler.command = /^disolverharem$/i
export default handler

// --- Handler de los botones ---
export async function before(m, { conn }) {
  if (!m.message?.buttonsResponseMessage) return
  const buttonId = m.message.buttonsResponseMessage.selectedButtonId
  const sender = m.sender

  let harem = loadJSON(haremFile)
  let masters = loadJSON(mastersFile)

  if (buttonId.startsWith("confirmarDisolver_")) {
    const haremId = buttonId.split("_")[1]

    if (!masters[sender]) return
    if (masters[sender].haremId !== haremId) {
      return conn.reply(m.chat, "⚠️ Solo puedes disolver tu propio harén.", m)
    }

    // eliminar miembros
    for (let u in harem) {
      if (harem[u].haremId === haremId) {
        delete harem[u]
      }
    }
    delete masters[sender]

    saveJSON(haremFile, harem)
    saveJSON(mastersFile, masters)

    return conn.reply(m.chat, `✅ Tu harén (ID: ${haremId}) ha sido disuelto.`, m)
  }

  if (buttonId === "cancelarDisolver") {
    return conn.reply(m.chat, "❌ Has cancelado la disolución del harén.", m)
  }
}
