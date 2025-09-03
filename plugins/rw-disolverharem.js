let handler = async (m, { conn, text }) => {
  if (!text) throw `Debes especificar el nombre del harem que quieres disolver.`

  let confirmMsg = await conn.reply(
    m.chat,
    `⚠️ ¿Seguro que deseas disolver el harem *${text}*?\n\nResponde a este mensaje con *sí* o *no*.`,
    m
  )

  // Guardamos el estado temporal
  conn.haremConfirm = conn.haremConfirm || {}
  conn.haremConfirm[confirmMsg.key.id] = {
    name: text,
    user: m.sender
  }
}

handler.before = async (m, { conn }) => {
  if (!m.quoted) return !0
  if (!conn.haremConfirm) return !0

  let data = conn.haremConfirm[m.quoted.id]
  if (!data) return !0
  if (m.sender !== data.user) return !0

  if (/^s(i|í)$/i.test(m.text)) {
    // Acción al confirmar
    await m.reply(`✅ El harem *${data.name}* ha sido disuelto.`)
    // Aquí borras el harem de la DB
    delete conn.haremConfirm[m.quoted.id]
  } else if (/^no$/i.test(m.text)) {
    await m.reply(`❎ Se canceló la disolución del harem.`)
    delete conn.haremConfirm[m.quoted.id]
  } else {
    await m.reply(`Responde únicamente con *sí* o *no*.`)
  }
}

handler.command = /^disolverharem$/i
export default handler