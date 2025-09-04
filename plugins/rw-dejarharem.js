// plugins/harem/dejarharem.js
import fs from "fs"
import path from "path"

const haremFile = "./src/database/harem.json";

function loadJSON(file) { if (!fs.existsSync(file)) fs.writeFileSync(file, "{}"); return JSON.parse(fs.readFileSync(file, "utf8")) }
function saveJSON(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)) }

let handler = async (m, { conn }) => {
  let harem = loadJSON(haremFile)
  const user = m.sender

  if (!harem[user]) return conn.reply(m.chat, "⚠️ No estás en ningún harén.", m)
  if (harem[user].role === "maestro") return conn.reply(m.chat, "⚠️ Eres maestro, no puedes salir de tu propio harén.", m)

  delete harem[user]
  saveJSON(haremFile, harem)

  conn.reply(m.chat, "🚪 Saliste del harén.", m)
}

handler.command = /^dejarharem$/i
export default handler
