// plugins/harem/expulsardelharem.js
import fs from "fs"
import path from "path"

const haremFile = "./src/database/harem.json";
const mastersFile = "./src/database/harem_masters.json";

function loadJSON(file) { if (!fs.existsSync(file)) fs.writeFileSync(file, "{}"); return JSON.parse(fs.readFileSync(file, "utf8")) }
function saveJSON(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)) }

let handler = async (m, { conn, args }) => {
  let harem = loadJSON(haremFile)
  let masters = loadJSON(mastersFile)
  const user = m.sender
  const target = m.mentionedJid[0] || args[0]

  if (!masters[user]) return conn.reply(m.chat, "⚠️ No eres maestro de ningún harén.", m)
  if (!target || !harem[target]) return conn.reply(m.chat, "⚠️ Ese usuario no está en tu harén.", m)
  if (harem[target].haremId !== masters[user].haremId) return conn.reply(m.chat, "⚠️ Ese usuario no pertenece a tu harén.", m)

  delete harem[target]
  saveJSON(haremFile, harem)

  conn.reply(m.chat, `🚪 Expulsaste a @${target.split("@")[0]} de tu harén.`, m, { mentions: [target] })
}

handler.command = /^expulsardelharem$/i
export default handler
