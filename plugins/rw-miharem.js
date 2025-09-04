// plugins/harem/miharem.js
import fs from "fs"
import path from "path"

const haremFile = "./src/database/harem.json";

function loadJSON(file) { if (!fs.existsSync(file)) fs.writeFileSync(file, "{}"); return JSON.parse(fs.readFileSync(file, "utf8")) }

let handler = async (m, { conn }) => {
  let harem = loadJSON(haremFile)
  const user = m.sender

  if (!harem[user]) return conn.reply(m.chat, "⚠️ No perteneces a ningún harén.", m)

  const { haremId, role } = harem[user]
  conn.reply(m.chat, `📖 Estás en el harén con ID: ${haremId}\nRol: ${role}`, m)
}

handler.command = /^miharem$/i
export default handler
