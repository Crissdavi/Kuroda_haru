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

let handler = async (m, { conn }) => {
  let harem = loadJSON(haremFile)
  let masters = loadJSON(mastersFile)
  const user = m.sender

  if (!masters[user]) {
    return conn.reply(m.chat, "《✧》 No eres maestro de ningún harén.", m)
  }

  const haremId = masters[user].haremId
  const memberCount = Object.values(harem).filter(v => v.haremId === haremId).length

  await conn.sendMessage(m.chat, {
    text: `⚠️ ¿Seguro que quieres disolver tu harén (ID: ${haremId}) con ${memberCount} miembros?`,
    footer: "Confirma tu decisión",
    buttons: [
      { buttonId: `disolver_yes_${haremId}`, buttonText: { displayText: "✅ Sí" }, type: 1 },
      { buttonId: `disolver_no_${haremId}`, buttonText: { displayText: "❌ No" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = /^disolverharem$/i
export default handler

// ─────────── LISTENER ───────────
global.disolverHaremListener ??= false
if (!global.disolverHaremListener) {
  global.disolverHaremListener = true
  global.conn?.ev.on("messages.upsert", async ({ messages }) => {
    let msg = messages[0]
    if (!msg?.message?.buttonsResponseMessage) return

    let buttonId = msg.message.buttonsResponseMessage.selectedButtonId
    let sender = msg.key.participant || msg.key.remoteJid
    let chat = msg.key.remoteJid

    if (buttonId.startsWith("disolver_yes_")) {
      let haremId = buttonId.split("_")[2]
      let harem = loadJSON(haremFile)
      let masters = loadJSON(mastersFile)

      // eliminar miembros de ese harén
      for (let u in harem) {
        if (harem[u].haremId === haremId) delete harem[u]
      }
      delete masters[sender]

      saveJSON(haremFile, harem)
      saveJSON(mastersFile, masters)

      await global.conn.sendMessage(chat, { text: `✐ Tu harén (${haremId}) fue disuelto.` })
    }

    if (buttonId.startsWith("disolver_no_")) {
      await global.conn.sendMessage(chat, { text: "❌ Operación cancelada." })
    }
  })
}
