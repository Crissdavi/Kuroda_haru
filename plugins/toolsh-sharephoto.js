import { Couples } from 'dhn-api'
var handler = async (m, { conn, command }) => {

const res = await Couples() 
await conn.sendFile(m.chat, res.male, 'ppcp.jpg', 'Hombre', m) 
return conn.sendFile(m.chat, res.female, 'ppcp.jpg', 'Mujer', m)
}
handler.help = ['Sharephotos']
handler.tags = ['internet']
handler.command = /^(Sharephotos|compartirimagen|compartirfoto)$/i
export default handler