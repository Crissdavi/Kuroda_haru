/*import { igdl } from "ruhend-scraper"

let handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `*${xdownload} Por favor, ingresa un link de Instagram.*`, m)
  }
  try {
    await m.react('⏳️')
    let res = await igdl(args[0])
    let data = res.data
    for (let media of data) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await conn.sendFile(m.chat, media.url, 'instagram.mp4', '\`\`\`◜Instagram - Download◞\`\`\`\n\n> Kuroda 🐢\n> Video downloaded successfully')
    }
  } catch {
    await m.react('❌')
    conn.reply(m.chat, '*❌ Ocurrió un error.*')
  }
}

handler.help = ['igv2']
handler.tags = ['download']
handler.command = ['instagram2', 'ig2', 'igv2']

export default handler*/

import { igdl } from "ruhend-scraper"

let handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `*${xdownload} Por favor, ingresa un link de Instagram*`, m)
  }
  try {
    await m.react('⏳️')
    let res = await igdl(args[0])
    let data = res.data

    if (!data || !data.length) throw 'Sin resultados'

    let media = data[0] // Solo el primer archivo (imagen o video)
    let filename = media.type === 'video' ? 'instagram.mp4' : 'instagram.jpg'

    await conn.sendFile(
      m.chat,
      media.url,
      filename,
      '```◜Instagram - Download◞```\n\n> © Powered by Shadow Ultra\n> Contenido descargado correctamente'
    )
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    conn.reply(m.chat, '*❌ Ocurrió un error al procesar el enlace.*')
  }
}

handler.help = ['ig']
handler.tags = ['download']
handler.command = ['instagram', 'ig', 'igv']

export default handler