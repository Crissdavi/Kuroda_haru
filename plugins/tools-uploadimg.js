import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command, quoted }) => {
  if (!quoted || !quoted.fileSha256) {
    return conn.reply(m.chat, '🪐 Por favor, envía una imagen primero', m)
  }

  try {
    const file = await conn.downloadAndSaveMediaMessage(quoted)
    
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axios.post('https://masha-api.fun/uploader.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    const data = response.data
    if (data.status === 'success') {
      m.reply(`🪐 ¡Imagen subida exitosamente! \nEnlace: ${data.file_url}`)
    } else {
      m.reply('🪐 Hubo un error al subir la imagen.')
    }
  } catch (error) {
    console.error(error)
    m.reply('🪐 Ocurrió un error al procesar la solicitud.')
  }
}

handler.command = ['uploadimg', 'subirimagen']
handler.help = ['uploadimg']
handler.tags = ['tools']
handler.group = true
handler.register = true

export default handler