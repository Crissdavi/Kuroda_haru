let cooldowns = {}

let handler = async (m, { conn, isPrems }) => {
let user = global.db.data.users[m.sender]
  let tiempoEspera = 2 * 00
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
    const tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000))
    conn.reply(m.chat, `🚩 Espera ⏱ *${tiempoRestante}* para volver a Trabajar.`, m, rcanal)
    return
  }
  let resultado = Math.floor(Math.random() * 2500)
  cooldowns[m.sender] = Date.now()
  await conn.reply(m.chat, `🚩 ${pickRandom(works)} *${toNum(resultado)}* ( *${resultado}* ) Zenis 💴.`, m, rcanal)
  user.limit += resultado
}

handler.help = ['slut']
handler.tags = ['rpg']
handler.command = ['slut']
handler.register = true 
export default handler

function toNum(number) {
    if (number >= 1000 && number < 1000000) {
        return (number / 1000).toFixed(1) + 'k'
    } else if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M'
    } else if (number <= -1000 && number > -1000000) {
        return (number / 1000).toFixed(1) + 'k'
    } else if (number <= -1000000) {
        return (number / 1000000).toFixed(1) + 'M'
    } else {
        return number.toString()
    }
}

function segundosAHMS(segundos) {
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}

// Thanks to FG98
const works = [
   " Dejaste que un grupo de jovenes te vistieran de puta a cambio de",
   "Ayudaste al admin a eyacular y te dió",
   "Te vistieron de maid en publico y te dieron",
   "Le sobaste el pito a un cliente habitual y ganaste",
   "Te vistieron de colegiala en publico y te dieron",
   "Le diste los sentones de su vida a un hombre que encontraste por ahi y ganaste", 
  ]
 
