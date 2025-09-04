import { loadMasters } from "../../harem/storage.js"

let handler = async (m) => {
  const masters = loadMasters()
  const masterId = m.sender

  const haremId = masters[masterId]
  if (!haremId) return m.reply("❌ No eres maestro de ningún harem.")

  m.reply(`${haremId}`)
}

handler.command = /^idharem$/i
export default handler