import fs from 'fs'
import path from 'path'

const mascotasFile = path.resolve('src/database/mascotas.json')
const cooldowns = new Map()

function loadMascotas() {
  try {
    if (!fs.existsSync(mascotasFile)) return {}
    return JSON.parse(fs.readFileSync(mascotasFile, 'utf8'))
  } catch (e) {
    return {}
  }
}

function saveMascotas(data) {
  fs.writeFileSync(mascotasFile, JSON.stringify(data, null, 2))
}

function getBarra(valor, max = 100, length = 12) {
  const filled = Math.round((valor / max) * length)
  return '█'.repeat(filled) + '░'.repeat(length - filled)
}

function calcularEtapa(nivel) {
  if (nivel < 5) return 'Bebé'
  if (nivel < 10) return 'Niño'
  if (nivel < 20) return 'Joven'
  return 'Adulto'
}

async function accionMascota(conn, m, userId, tipoAccion, emoji, cambios, mensajeAccion) {
  const mascotas = loadMascotas()
  const mascota = mascotas[userId]
  if (!mascota) return conn.reply(m.chat, '❌ No tienes una mascota. Usa *#adoptar* primero.', m)

  // cooldown
  const now = Date.now()
  const cdKey = `${userId}_${tipoAccion}`
  if (cooldowns.has(cdKey) && now - cooldowns.get(cdKey) < 60 * 1000) {
    const falta = Math.ceil((60 * 1000 - (now - cooldowns.get(cdKey))) / 1000)
    return conn.reply(m.chat, `⏳ Debes esperar ${falta}s antes de volver a *${tipoAccion}* con tu mascota.`, m)
  }
  cooldowns.set(cdKey, now)

  // aplicar cambios
  mascota.experiencia += cambios.exp || 0
  mascota.hambre = Math.max(0, Math.min(100, mascota.hambre + (cambios.hambre || 0)))
  mascota.felicidad = Math.max(0, Math.min(100, mascota.felicidad + (cambios.felicidad || 0)))
  mascota.salud = Math.max(0, Math.min(100, mascota.salud + (cambios.salud || 0)))
  mascota.energia = Math.max(0, Math.min(100, mascota.energia + (cambios.energia || 0)))

  // subir de nivel
  if (mascota.experiencia >= mascota.experienciaMax) {
    mascota.nivel++
    mascota.experiencia = 0
    mascota.experienciaMax = Math.round(mascota.experienciaMax * 1.3)
    mascota.etapa = calcularEtapa(mascota.nivel)
  }

  saveMascotas(mascotas)

  // reacción
  await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })

  return conn.reply(
    m.chat,
    `✧ *${mascota.nombre}* ${mascota.emoji} ${mensajeAccion}\n\n` +
    `🌟 +${cambios.exp || 0} exp`,
    m
  )
}

const handler = async (m, { conn, command }) => {
  const userId = m.sender
  const mascotas = loadMascotas()
  const mascota = mascotas[userId]

  if (/^mimascota$/i.test(command)) {
    if (!mascota) return conn.reply(m.chat, '❌ No tienes mascota. Usa *#adoptar* primero.', m)

    const expBar = getBarra(mascota.experiencia, mascota.experienciaMax, 20)
    const hambreBar = getBarra(mascota.hambre, 100, 12)
    const saludBar = getBarra(mascota.salud, 100, 12)
    const felizBar = getBarra(mascota.felicidad, 100, 12)
    const energiaBar = getBarra(mascota.energia, 100, 12)

    return conn.reply(
      m.chat,
`🐾 *Mascota de @${userId.split('@')[0]}*

${mascota.emoji} *${mascota.nombre}*
✧ Rareza: ${mascota.rareza}
✧ Etapa: ${mascota.etapa}
✧ Nivel: ${mascota.nivel}

🌟 Exp: [${expBar}] ${mascota.experiencia}/${mascota.experienciaMax}
🍗 Hambre: [${hambreBar}] ${mascota.hambre}%
❤️ Salud: [${saludBar}] ${mascota.salud}%
😊 Felicidad: [${felizBar}] ${mascota.felicidad}%
💤 Energía: [${energiaBar}] ${mascota.energia}%`,
      m, { mentions: [userId] }
    )
  }

  if (/^jugar$/i.test(command)) {
    return accionMascota(conn, m, userId, 'jugar', '🎾', { exp: 15, felicidad: 20, energia: -10, hambre: -5 }, 'se divirtió jugando 🎾')
  }
  if (/^entrenar$/i.test(command)) {
    return accionMascota(conn, m, userId, 'entrenar', '💪', { exp: 25, energia: -15, hambre: -10, felicidad: -5 }, 'ha entrenado con fuerza 💪')
  }
  if (/^curar$/i.test(command)) {
    return accionMascota(conn, m, userId, 'curar', '❤️', { exp: 5, salud: 20, felicidad: 5 }, 'ha sido curado ❤️‍🩹')
  }
  if (/^dormir$/i.test(command)) {
    return accionMascota(conn, m, userId, 'dormir', '💤', { exp: 5, energia: 30, hambre: -10 }, 'ha descansado plácidamente 💤')
  }
}

handler.help = ['mimascota', 'jugar', 'entrenar', 'curar', 'dormir']
handler.tags = ['mascotas', 'rpg']
handler.command = /^(mimascota|jugar|entrenar|curar|dormir)$/i

export default handler