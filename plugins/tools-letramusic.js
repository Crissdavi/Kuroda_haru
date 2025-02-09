import fetch from 'node-fetch';

let handler = async(m, { conn, text, usedPrefix, command }) => {

if (!text) return m.reply(m.chat, '🪐 Ingrese Un Nombre De Alguna Cancion', m, rcanal);

try {
let api = `https://archive-ui.tanakadomp.biz.id/search/lirik?q=${text}`;

let responde = await fetch(api);
let json = await responde.json();
let crow = json.result;

let txt = `*Nombre:* ${crow.title}\n*Letra:* ${crow.lyrics}`;

let img = crow.thumb;

conn.sendMessage(m.chat, { image: { url: img }, caption: txt }, { quoted: fkontak });

} catch (e) {
console.log(e)
m.reply('*No se pudo obtener la letra De su canción*');
m.react('✖️');
 }
};

handler.command = ['lyrics', 'letramusic'];

export default handler;
