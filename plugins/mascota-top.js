import fs from 'fs'
import path from 'path'

const mascotasFile = path.resolve('src/database/mascotas.json')

function loadMascotas() {
  try {
    if (!fs.existsSync(mascotasFile)) return {}
    return JSON.parse(fs.readFileSync(mascotasFile, 'utf8'))
  } catch (e) {
    return {}
  }
}

const handler = async (m, { conn }) => {
  const userId = m.sender
  const mascotas = loadMascotas()

  if (!Object.keys(mascotas).length) {
    return conn.reply(m.chat, '❌ No hay mascotas registradas todavía.', m)
  }

  // ordenar por nivel y experiencia
  const ranking = Object.entries(mascotas)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.nivel - a.nivel) || (b.experiencia - a.experiencia))

  // top 10
  let msg = `🏆 *TOP 10 MASCOTAS* 🏆\n\n`
  ranking.slice(0, 10).forEach((p, i) => {
    const isUser = p.id === userId
    msg += `${i + 1}. ${p.nombre} ${p.emoji} [Lvl ${p.nivel}] ${isUser ? '(Tú)' : ''}\n`
  })

  // puesto del usuario
  const pos = ranking.findIndex(p => p.id === userId)
  if (pos !== -1) {
    msg += `\n📍 Tu posición: *${pos + 1}* de ${ranking.length} jugadores.`
  }

  await conn.sendMessage(m.chat, { react: { text: '🏆', key: m.key } })
  return conn.reply(m.chat, msg, m)
}

handler.help = ['topmascotas']
handler.tags = ['mascotas', 'rpg']
handler.command = /^topmascotas$/i

export default handler