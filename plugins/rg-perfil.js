import PhoneNumber from 'awesome-phonenumber';
import fetch from 'node-fetch';
import fs from 'fs';

const loadMarriages = () => {
    if (fs.existsSync('./src/database/marry.json')) {
        const data = JSON.parse(fs.readFileSync('./src/database/marry.json', 'utf-8'));
        global.db.data.marriages = data;
    } else {
        global.db.data.marriages = {};
    }
};

var handler = async (m, { conn }) => {
    loadMarriages();

    let who;
    if (m.quoted && m.quoted.sender) {
        who = m.quoted.sender;
    } else {
        who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    }

    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://i.ibb.co/THMjPnv/file.jpg');
    let { premium, level, zenis, exp, lastclaim, registered, regTime, age, role } = global.db.data.users[who] || {};
    let username = conn.getName(who);

    age = registered ? (age || 'Desconocido') : 'Sin especificar';
    role = role || 'Novato';

    let isMarried = who in global.db.data.marriages;
    let partner = isMarried ? global.db.data.marriages[who] : null;
    let partnerName = partner ? conn.getName(partner) : 'Nadie';
    let api = await axios.get(`https://deliriussapi-oficial.vercel.app/tools/country?text=${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}`);
    let userNationalityData = api.data.result;
    let userNationality = userNationalityData ? `${userNationalityData.name} ${userNationalityData.emoji}` : 'Desconocido';

    let noprem = `
「✿」PERFIL DE USUARIO 
ꕥ Nombre » ${username}
✦ Edad » ${age}
♡ Casado con » ${isMarried ? partnerName : 'Nadie'}
✧ Registrado » ${registered ? '✅': '❌'}
❒ Pais » ${userNationality}
⛁ Zenis » ${zenis || 0}
❖ Nivel » ${level || 0}
☆ Experiencia » ${exp || 0}
✎ Rango » ${role}
❁ Premium » ${premium ? '✅': '❌'}
`.trim();

let prem = `
「✿」𝐔𝐒𝐔𝐀𝐑𝐈𝐎 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 
ꕥ Nombre » ${username}
✦ Edad » ${age}
♡ Casado con » ${isMarried ? partnerName : 'Nadie'}
✧ Registrado » ${registered ? '✅': '❌'}
❒ Pais » ${userNationality}
⛁ Zenis » ${zenis || 0}
❖ Nivel » ${level || 0}
☆ Experiencia » ${exp || 0}
✎ Rango » ${role}
❁ Premium » ${premium ? '✅': '❌'}
`.trim();

    conn.sendFile(m.chat, pp, 'miniurl.jpg', `${premium ? prem.trim() : noprem.trim()}`, m, { mentions: [who] });
}

handler.help = ['profile'];
handler.register = true;
handler.group = true;
handler.tags = ['rg'];
handler.command = ['profile', 'perfil'];

export default handler;
