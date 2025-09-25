[24/9, 11:04 p. m.] Haru: import Starlights from '@StarlightsTeam/Scraper'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) return conn.reply(m.chat, '🚩 Ingresa el enlace del vídeo de Instagram junto al comando.\n\n`Ejemplo:`\n' + `> *${usedPrefix + command}* https://www.instagram.com/p/C60xXk3J-sb/?igsh=YzljYTk1ODg3Zg==`, m, rcanal)
    await m.react('🕓')
    try {
        let result = await Starlights.igdl(args[0])

        if (result.length > 0) {
            for (let i = 0; i < result.length; i++) {
                let { dl_url } = result[i]
                await conn.sendFile(m.chat, dl_url, `igdl.mp4`, listo, m, null, rcanal)
            }
            await m.react('✅')
        } else {
            await m.react('✖️')
        }
    } catch {
        await m.react('✖️')
    }
}

handler.help = ['instagram *<link ig>*']
handler.tags = ['downloader']
handler.command = /^(instagramdl|instagram|igdl|ig|instagramdl2|instagram2|igdl2|ig2|instagramdl3|instagram3|igdl3|ig3)$/i
//handler.limit = 1
handler.register = true

export default handler
[24/9, 11:09 p. m.] Haru: Login