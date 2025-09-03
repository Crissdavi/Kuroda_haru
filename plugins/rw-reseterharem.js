// plugins/harem/resetearharem.js
import fs from "fs"
import path from "path"

const haremFile = path.resolve("src/database/harem.json")
const mastersFile = path.resolve("src/database/harem_masters.json")

function saveJSON(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)) }

let handler = async (m, { conn }) => {
  saveJSON(haremFile, {})
  saveJSON(mastersFile, {})
  conn.reply(m.chat, "🗑️ Se han reseteado todos los harems.", m)
}

handler.command = /^resetearharem$/i
export default handler
