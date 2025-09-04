// plugins/harem/crearharem.js
import fs from "fs"
import path from "path"

const haremFile = "./src/database/harem.json";
const mastersFile = "./src/database/harem_masters.json";

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

  if (masters[user]) {
    return conn.reply(m.chat, "《✧》 ¡Ya eres maestro de un harén!", m)
  }

  const haremId = "harem_" + Math.random().toString(36).slice(2, 9)
  masters[user] = { haremId, since: Date.now(), status: "active" }
  harem[user] = { haremId, role: "maestro", status: "active", joinDate: Date.now() }

  saveJSON(haremFile, harem)
  saveJSON(mastersFile, masters)

  conn.reply(m.chat, `🎉 Has creado tu harén con ID: ${haremId}`, m)
}

handler.command = /^crearharem$/i
export default handler
