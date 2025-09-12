import axios from 'axios'
import fs from 'fs'

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `*🚩 Ingrese el nombre de la canción de Soundcloud*`, m)
  try {
    let { data: results } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/soundcloud-search?text=${encodeURIComponent(text)}`, { 
      headers: { 'Content-Type': 'application/json' } 
    })

    let randoms = results[Math.floor(Math.random() * results.length)]

    let { data: sm } = await axios.get(`https://api.starlights.uk/api/downloader/soundcloud?url=${randoms.url}`, { 
      headers: { 'Content-Type': 'application/json' }
    })

    let mpeg = await axios.get(sm.result.download, { responseType: 'arraybuffer' })
    let mp3 = `${sm.result.title}.mp3`
    fs.writeFileSync(mp3, Buffer.from(mpeg.data))

    let txt = `*\`- S O U N C L O U D - M U S I C -\`*\n\n`
    txt += `🍘• *Nombre:* ${sm.result.title}\n`
    txt += `🍘• *Artista:* ${sm.result.author}\n`
    txt += `🍘• *Duración:* ${sm.result.duration}\n`
    txt += `🍘• *Link:* ${randoms.url}\n\n`

    await conn.sendFile(m.chat, sm.result.thumbnail, 'thumb.jpg', txt, m)

    await conn.sendMessage(m.chat, { 
      audio: fs.readFileSync(mp3), 
      fileName: `${sm.result.title}.mp3`, 
      mimetype: 'audio/mpeg' 
    }, { quoted: m })

    fs.unlinkSync(mp3)

  } catch (error) {
    console.error(error)
    conn.reply(m.chat, `❌ Error al descargar la música.`, m)
  }
}

handler.help = ['soundcloud *<búsqueda>*']
handler.tags = ['downloader']
handler.command = ['soundcloud', 'sound']
handler.register = true

export default handler