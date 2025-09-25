import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) return conn.reply(
        m.chat,
        '🚩 Ingresa el enlace del vídeo de Instagram junto al comando.\n\n' +
        `Ejemplo:\n> *${usedPrefix + command}* https://www.instagram.com/reel/DOhw_KODFg-/`,
        m, 
        rcanal
    )
    await m.react('🕓')

    try {
        // 🔹 Llamada a la API Sylphy
        let apiUrl = `https://api.sylphy.xyz/download/instagram?url=${encodeURIComponent(args[0])}&apikey=sylphy-0d75`
        let res = await fetch(apiUrl)
        let json = await res.json()

        if (json.status && json.result) {
            let medias = Array.isArray(json.result) ? json.result : [json.result]
            for (let media of medias) {
                await conn.sendFile(m.chat, media.url, 'instagram.mp4', '✅ Aquí tienes tu video', m, null, rcanal)
            }
            await m.react('✅')
        } else {
            await conn.reply(m.chat, `✖️ Error: ${json.mensaje || 'No se pudo descargar el video'}`, m, rcanal)
            await m.react('✖️')
        }
    } catch (e) {
        console.error(e)
        await m.react('✖️')
        await conn.reply(m.chat, '⚠️ Ocurrió un error al procesar la descarga.', m, rcanal)
    }
}

handler.help = ['instagram *<link ig>*']
handler.tags = ['downloader']
handler.command = /^(instagramdl|instagram|igdl|ig)$/i
handler.register = true

export default handler;