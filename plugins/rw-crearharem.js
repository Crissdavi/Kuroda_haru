import { loadHarem, updateHarem, loadMasters, updateMasters } from "../../harem/storage.js"
import crypto from "crypto"

let handler = async (m, { text }) => {
  const harems = loadHarem()
  const masters = loadMasters()

  if (masters[m.sender]) {
    return m.reply("❌ Ya tienes un harem creado.")
  }

  const id = crypto.randomUUID()
  harems[id] = { id, name: text || null, master: m.sender, users: [] }
  masters[m.sender] = id

  updateHarem(harems)
  updateMasters(masters)

  m.reply(`✅ Harem creado con ID: *${id}*`)
}

handler.command = /^crearharem$/i
export default handler