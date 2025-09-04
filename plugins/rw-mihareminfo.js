// plugins/harem/mihareminfo.js
import fs from "fs"
import path from "path"

const haremFile = "./src/database/harem.json";

function loadJSON(file) { if (!fs.existsSync(file)) fs.writeFileSync(file, "{}"); return JSON.parse(fs.readFileSync(file, "utf8")) }

let handler = async (m, { conn }) => {
  let harem = loadJSON(haremFile)
  const user = m.sender

  if (!harem[user]) return conn.reply(m.chat, "⚠️ No perteneces a ningún harén.", m)

  const { haremId } = harem[user]
  const members = Object.entries(harem).filter(([_, d]) => d.haremId === haremId).map(([id]) => id)

  let txt = `👑 Info de tu harén (ID: ${haremId}):\n\n`
  txt += members.map((u, i) => `${i + 1}. @${u.split("@")[0]}`).join("\n")

  conn.reply(m.chat, txt, m, { mentions: members })
}

handler.command = /^mihareminfo$/i
export default handler
