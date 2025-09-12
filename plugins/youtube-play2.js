import axios from 'axios'
import yts from 'yt-search'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `🎵 Ingresa el nombre de la música o video que quieres descargar.\n\nEjemplo:\n${usedPrefix}${command} Coldplay Viva la Vida`,
      m
    )
  }

  try {
    // Buscar en YouTube por nombre
    const search = await yts(text)
    if (!search.videos || search.videos.length === 0) {
      return conn.reply(m.chat, '❌ No se encontraron resultados.', m)
    }

    const video = search.videos[0] // Primer resultado
    const url = video.url

    // Descargar info desde la API
    let { data: yt } = await axios.get(`https://api.starlights.uk/api/downloader/youtube?url=${encodeURIComponent(url)}`)
    if (!yt.status || !yt.result) throw '❌ No se pudo procesar el video.'

    let info = yt.result

    let txt = `*\`- Y O U T U B E - D O W N L O A D E R -\`*\n\n`
    txt += `📌 *Título:* ${info.title}\n`
    txt += `📺 *Canal:* ${info.channel}\n`
    txt += `⏱️ *Duración:* ${info.duration}\n`
    txt += `👀 *Vistas:* ${info.views}\n`
    txt += `🔗 *Link:* ${url}\n\n`
    txt += `👉 Responde con:\n🎶 *audio* → para descargar en MP3\n🎥 *video* → para descargar en MP4`

    // Guardar datos en memoria del usuario
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    global.db.data.users[m.sender].lastYT = {
      url,
      title: info.title,
      thumb: info.thumbnail,
      audio: info.audio,
      video: info.video,
      timestamp: Date.now()
    }

    await conn.sendFile(m.chat, info.thumbnail, 'thumb.jpg', txt, m)

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Error: ${e.message || e}`, m)
  }
}

handler.before = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  if (!user || !user.lastYT) return false

  const { url, title, audio, video, timestamp } = user.lastYT

  // Expira después de 10 minutos
  if (Date.now() - timestamp > 10 * 60 * 1000) {
    user.lastYT = null
    return false
  }

  if (/^audio$/i.test(m.text)) {
    await conn.reply(m.chat, '⏳ Descargando audio...', m)
    await conn.sendMessage(m.chat, { 
      audio: { url: audio }, 
      fileName: `${title}.mp3`, 
      mimetype: 'audio/mpeg' 
    }, { quoted: m })
    user.lastYT = null
    return true
  }

  if (/^video$/i.test(m.text)) {
    await conn.reply(m.chat, '⏳ Descargando video...', m)
    await conn.sendMessage(m.chat, { 
      video: { url: video }, 
      fileName: `${title}.mp4`, 
      mimetype: 'video/mp4' 
    }, { quoted: m })
    user.lastYT = null
    return true
  }

  return false
}

handler.help = ['play *<nombre de canción>*']
handler.tags = ['downloader']
handler.command = ['play', 'ytplay']

export default handler