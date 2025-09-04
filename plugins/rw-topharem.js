// src/plugins/harem/topsharem.js
import { loadHarem, loadMasters } from "../../harem/storage.js"

function countHaremMembers(haremId, haremMembers) {
  return Object.values(haremMembers).filter(
    (m) => m.haremId === haremId && m.status === "active"
  ).length
}

const handler = async (m, { conn }) => {
  const haremMembers = loadHarem()
  const masters = loadMasters()

  const allHarems = Object.entries(masters)
    .filter(([, masterData]) => masterData.status === "active")
    .map(([masterId, masterData]) => ({
      masterId,
      haremId: masterData.haremId,
      haremName:
        masterData.name && masterData.name.trim() !== ""
          ? masterData.name
          : masterData.haremId,
      memberCount: countHaremMembers(masterData.haremId, haremMembers),
    }))

  if (allHarems.length === 0) {
    return conn.reply(
      m.chat,
      "《✧》 No hay harenes activos todavía.\nCrea uno con *#crearharem*",
      m
    )
  }

  // ordenar por cantidad de miembros
  allHarems.sort((a, b) => b.memberCount - a.memberCount)

  let text = "🏆 *TOP HAREM* 🏆\n\n"
  allHarems.forEach((h, index) => {
    let medal = ""
    if (index === 0) medal = "🥇 "
    else if (index === 1) medal = "🥈 "
    else if (index === 2) medal = "🥉 "
    text += `${medal}*${index + 1}.* ${h.haremName}\n`
    text += `👑 Maestro: @${h.masterId.split("@")[0]}\n`
    text += `👥 Miembros: ${h.memberCount}\n\n`
  })

  await conn.reply(m.chat, text.trim(), m, {
    mentions: allHarems.map((h) => h.masterId),
  })
}

handler.help = ["topsharem"]
handler.tags = ["harem"]
handler.command = /^topsharem$/i

export default handler