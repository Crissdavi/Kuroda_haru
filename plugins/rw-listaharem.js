// plugins/harem/listaharem.js
import fs from "fs"
import path from "path"

const mastersFile = path.resolve("src/database/harem_masters.json")

function loadJSON(file) { if (!fs.existsSync(file)) fs.writeFileSync(file, "{}"); return JSON.parse(fs.readFileSync(file, "utf8")) }

let handler = async (m, { conn }) => {
  let masters = loadJSON(mastersFile)
  if (Object.keys(masters).length === 0) return conn.reply(m.chat, "⚠️ No hay harems creados.", m)

  let txt = "📜 Lista de harems activos:\n\n"
  for (let u in masters) {
    txt += `👑 Maestro: @${u.split("@")[0]} | ID: ${masters[u].haremId}\n`
  }

  conn.reply(m.chat, txt, m, { mentions: Object.keys(masters) })
}

handler.command = /^listaharem$/i
export default handler
