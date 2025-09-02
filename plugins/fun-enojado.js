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
    m.react('😠');
    let str = `${name2} está enojado/a con ${name}`.trim();
    if (m.isGroup){

    let pp = 'https://sylphy.xyz/download/4tfYos.mp4' 
    let pp2 = 'https://sylphy.xyz/download/TdCaDT.mp4' 
    let pp3 = 'https://sylphy.xyz/download/4vxKJj.mp4' 
    let pp4 = 'https://files.catbox.moe/uedd7l.mp4' 
    let pp5 = 'https://files.catbox.moe/5stubg.mp4' 
    let pp6 = 'https://files.catbox.moe/phaft3.mp4'
    const videos = [pp, pp2, pp3, pp4, pp5, pp6];
    const video = videos[Math.floor(Math.random() * videos.length)];
    conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption:str, mentions: [m.sender] },{ quoted: estilo })
    };

}

handler.help = ['enojado @tag', 'enojado'];
handler.tags = [funt'];
handler.command = ['enojado','angry'];
handler.group = true;

export default handler;