try {
let v = args[0]
let yt = await youtubedl(v).catch(async () => await youtubedlv2(v))
let dl_url = await yt.audio[q].download()
let title = await yt.title
let size = await yt.audio[q].fileSizeH
let thumbnail = await yt.thumbnail

let img = await (await fetch(`${thumbnail}`)).buffer()  
if (size.split('MB')[0] >= limit) return star.reply(m.chat, `El archivo pesa mas de ${limit} MB, se canceló la Descarga.`, m, rcanal).then(_ => m.react('✖️'))
        let txt = '`乂  Y O U T U B E  -  M P 3 D O C`\n\n'
       txt += `           *Titulo* : ${title}\n`
       txt += `           *Calidad* : ${q}\n`
       txt += `           *Tamaño* : ${size}\n\n`
       txt += `> *-ESPERE SE ESTA ENVIANDO SU MUSICA .*`
await star.sendFile(m.chat, img, 'thumbnail.jpg', txt, m, null, rcanal)
await star.sendMessage(m.chat, { document: { url: dl_url }, caption: '', mimetype: 'audio/mpeg', fileName: `${title}.mp3`}, { quoted: m })
await m.react('✅')
} catch {
try {
let yt = await fg.yta(args[0], q)
let { title, dl_url, size } = yt 
let vid = (await yts(text)).all[0]
let { thumbnail, url } = vid

let img = await (await fetch(`${vid.thumbnail}`)).buffer()  
if (size.split('MB')[0] >= limit) return star.reply(m.chat, `El archivo pesa mas de ${limit} MB, se canceló la Descarga.`, m, rcanal).then(_ => m.react('✖️'))
        let txt = '`乂  Y O U T U B E  -  M P 3 D O C`\n\n'
       txt += `           *Titulo* : ${title}\n`
       txt += `           *Calidad* : ${q}\n`
       txt += `           *Tamaño* : ${size}\n\n`
       txt += `> *- ↻ESPERE SE ESTA ENVIANDO SU MUSICA . .*`
await star.sendFile(m.chat, img, 'thumbnail.jpg', txt, m, null, rcanal)
await star.sendMessage(m.chat, { document: { url: dl_url }, caption: '', mimetype: 'audio/mpeg', fileName: `${title}.mp3`}, { quoted: m })
await m.react('✅')
} catch {
try {
let yt = await fg.ytmp3(args[0], q)
let { title, dl_url, size, thumb } = yt 

let img = await (await fetch(`${thumb}`)).buffer()
if (size.split('MB')[0] >= limit) return star.reply(m.chat, `El archivo pesa mas de ${limit} MB, se canceló la Descarga.`, m, rcanal).then(_ => m.react('✖️'))
        let txt = '`乂  Y O U T U B E  -  M P 3 D O C`\n\n'
       txt += `           *Titulo* : ${title}\n`
       txt += `         *Calidad* : ${q}\n`
       txt += `          *Tamaño* : ${size}\n\n`
       txt += `> *- ↻ ESPERE SE ESTA ENVIANDO SU MUSICA .. . .*`
await star.sendFile(m.chat, img, 'thumbnail.jpg', txt, m, null, rcanal)
await star.sendMessage(m.chat, { document: { url: dl_url }, caption: '', mimetype: 'audio/mpeg', fileName: `${title}.mp3`}, { quoted: m })
await m.react('✅')
} catch {
await m.react('✖️')
}}}}
handler.help = ['ytmp3doc *<link yt>*']
handler.tags = ['downloader']
handler.command = ['ytmp3doc', 'ytadoc'] 
//handler.limit = 1
handler.register = true 

export default handler
