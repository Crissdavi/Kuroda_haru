//Sticker Search
import fg from 'api-dylux';
import { sticker } from '../lib/sticker.js';

let handler = async (m, { conn, text }) => {
if (!text) return conn.reply(m.chat, 'Ingresa lo que quieras buscar', m);

try {
let { sticker_url, title } = await fg.StickerSearch(text);
    
for (let url of sticker_url) {
let stiker = await sticker(null, url, 'Jtxs', title);
if (stiker) { await conn.sendFile(m.chat, stiker, 'sticker.gif', '', m, false, { asSticker: true }) }
}
} catch (error) {
console.error(error);
}}

handler.help = ['stickerss']
handler.tags = ['search']
handler.command = ['stickerss', 'stickersearch']
export default handler;