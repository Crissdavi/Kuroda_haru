import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
    let who;
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    else who = m.chat;
    if (!who) throw 'Etiqueta o menciona a alguien';

    let user = global.db.data.users[who];
    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    m.react('💃');
    let str = `${name2} está bailando con ${name}`.trim();
    if (m.isGroup){

    let pp = 'https://tinyurl.com/26djysdo'
let pp2 = 'https://tinyurl.com/294oahv9'
let pp3 = 'https://sylphy.xyz/download/D83L9G.mp4'
let pp4 = 'https://sylphy.xyz/download/pesgBH.mp4'
    const videos = [pp, pp2, pp3, pp4];
    const video = videos[Math.floor(Math.random() * videos.length)];
    conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption:str, mentions: [m.sender] },{ quoted: estilo })
    };

}

handler.help = ['dance @tag'];
handler.tags = ['fun'];
handler.command = ['dance','bailar'];
handler.group = true;

export default handler;