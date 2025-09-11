import acrcloud from 'acrcloud'
import { youtube } from '@bochilteam/scraper-sosmed' // ✅ Cambiado aquí
import yts from 'yt-search'

let acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu'
})

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ''
  
  if (/video|audio/.test(mime)) {
    let buffer = await q.download()
    let user = global.db.data.users[m.sender]
    await m.react('🕓')
    
    try {
      let { status, metadata } = await acr.identify(buffer)
      if (status.code !== 0) throw new Error(status.msg)
      
      let { title, artists, album, genres, release_date } = metadata.music[0]
      let res = await yts(title)
      
      if (!res.videos || res.videos.length === 0) {
        throw new Error('No se encontraron videos para: ' + title)
      }
      
      let vid = res.videos[0]
      
      if (!vid || !vid.url || typeof vid.url !== 'string' || !vid.url.includes('youtube.com')) {
        throw new Error('URL de YouTube no válida')
      }
      
      let v = vid.url
      console.log('Procesando URL:', v)
      
      // ✅ USANDO scraper-sosmed CORRECTAMENTE
      let yt = await youtube(v)
      
      if (!yt || !yt.audio || !yt.audio['128kbps']) {
        throw new Error('No se pudo obtener el audio del video')
      }
      
      let url = await yt.audio['128kbps'].download()
      let title2 = yt.title || title
      
      let txt = '`乂  W H A T M U S I C  -  T O O L S`\n\n'
      txt += `        ✩   *Título* : ${title}`
      if (artists) txt += `\n        ✩   *Artistas* : ${artists.map(v => v.name).join(', ')}`
      if (album) txt += `\n        ✩   *Álbum* : ${album.name}`
      if (genres) txt += `\n        ✩   *Género* : ${genres.map(v => v.name).join(', ')}`
      txt += `\n        ✩   *Fecha de lanzamiento* : ${release_date}\n\n`
      txt += `> 🚩 *${global.textbot || 'Bot'}*`
      
      await conn.sendFile(m.chat, vid.thumbnail, 'thumbnail.jpg', txt, m, null, global.rcanal)
      await conn.sendFile(m.chat, url, `${title2}.mp3`, null, m, false, { 
        mimetype: 'audio/mpeg', 
        asDocument: user?.useDocument || false 
      })
      await m.react('✅')
      
    } catch (error) {
      console.error('Error detallado:', error)
      await m.react('❌')
      await conn.reply(m.chat, `❌ Error al procesar la música:\n${error.message}`, m, global.rcanal)
    }
    
  } else {
    return conn.reply(m.chat, `🚩 Etiqueta un audio o video de poca duración con el comando *${usedPrefix + command}* para ver qué música contiene.`, m, global.rcanal)
  }
}

handler.help = ['whatmusic *<audio/video>*']
handler.tags = ['tools']
handler.command = ['whatmusic', 'shazam']
handler.register = true 
export default handler