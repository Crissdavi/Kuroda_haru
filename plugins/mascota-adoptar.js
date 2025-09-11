import fs from "fs"
import path from "path"

const mascotasFile = path.resolve("./src/database/mascotas.json")

function loadMascotas() {
  if (!fs.existsSync(mascotasFile)) return {}
  return JSON.parse(fs.readFileSync(mascotasFile, "utf8"))
}

function saveMascotas(data) {
  fs.writeFileSync(mascotasFile, JSON.stringify(data, null, 2))
}

// Rarezas y probabilidades
const rarezas = [
  { nombre: "Común", prob: 50 },
  { nombre: "Raro", prob: 20 },
  { nombre: "Épico", prob: 20 },
  { nombre: "Legendario", prob: 10 }
]

const mascotasDisponibles = [
  "🐶", "🐱", "🐹", "🐰", "🦊",
  "🐻", "🐼", "🐨", "🐯", "🦁",
  "🐮", "🐷", "🐸", "🐵", "🐤"
]

function elegirRareza() {
  const roll = Math.random() * 100
  let acumulado = 0
  for (let r of rarezas) {
    acumulado += r.prob
    if (roll <= acumulado) return r.nombre
  }
  return "Común"
}

const handler = async (m, { conn }) => {
  const mascotas = loadMascotas()
  const userId = m.sender

  if (mascotas[userId]) {
    return conn.reply(m.chat, "❌ Ya tienes una mascota adoptada.", m)
  }

  const rareza = elegirRareza()
  const mascota = mascotasDisponibles[Math.floor(Math.random() * mascotasDisponibles.length)]

  mascotas[userId] = {
    emoji: mascota,
    rareza,
    nivel: 1,
    experiencia: 0,
    etapa: "Bebé",
    hambre: 100,
    felicidad: 100,
    energia: 100,
    salud: 100,
    creado: Date.now()
  }

  saveMascotas(mascotas)

  let animacion = `🥚 El huevo comienza a moverse...\n`
  const msg = await conn.reply(m.chat, animacion, m)

  setTimeout(async () => {
    animacion = `🥚💥 El huevo se rompe poco a poco...\n`
    await conn.sendMessage(m.chat, { edit: msg.key, text: animacion })
  }, 2000)

  setTimeout(async () => {
    animacion = `✨ ¡Ha nacido tu mascota!\n${mascota} Rareza: *${rareza}*`
    await conn.sendMessage(m.chat, { edit: msg.key, text: animacion })
  }, 4000)
}

handler.help = ["adoptar"]
handler.tags = ["mascotas"]
handler.command = /^adoptar$/i

export default handler