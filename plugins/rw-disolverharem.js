import { loadHarem, updateHarem, loadMasters, updateMasters } from "../../harem/storage.js"

let handler = async (m, { text }) => {
  const harems = loadHarem()
  const masters = loadMasters()
  const haremId = text?.trim()

  if (!haremId) return m.reply("⚠️ Debes indicar la ID del harem que quieres disolver.")
  if (!harems[haremId]) return m.reply("❌ No existe ningún harem con esa ID.")

  if (harems[haremId].master !== m.sender) {
    return m.reply("❌ Solo el maestro de este harem puede disolverlo.")
  }

  delete harems[haremId]
  delete masters[m.sender]

  updateHarem(harems)
  updateMasters(masters)

  m.reply(`✅ El harem *${haremId}* ha sido disuelto.`)
}

handler.command = /^disolverharem$/i
export default handler;