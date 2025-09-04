import { loadHarem, updateHarem, loadMasters } from "../../harem/storage.js"

let handler = async (m, { text }) => {
  const masters = loadMasters()
  const harems = loadHarem()

  const masterId = m.sender
  const haremId = masters[masterId]

  if (!haremId) return m.reply("❌ No eres maestro de ningún harem.")
  if (!text) return m.reply("⚠️ Debes escribir el nuevo nombre del harem.")

  harems[haremId].name = text
  updateHarem(harems)

  m.reply(`✅ El harem ahora se llama: *${text}*`)
}

handler.command = /^editarharem$/i
export default handler