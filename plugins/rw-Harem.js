
import fs from 'fs';
import path from 'path';

const recruitmentsFile = path.resolve('src/database/harem.json');
let pendingInvitations = {};
let recruitments = loadRecruitments();
const confirmations = {};

function loadRecruitments() {
    return fs.existsSync(recruitmentsFile) ? JSON.parse(fs.readFileSync(recruitmentsFile, 'utf8')) : {};
}

function saveRecruitments() {
    fs.writeFileSync(recruitmentsFile, JSON.stringify(recruitments, null, 2));
}

const handler = async (m, { conn, command, participants }) => {
    const isHarem = /^unirharem$/i.test(command);
    const isExpel = /^expulsar$/i.test(command);

    const userIsInGroup = (user) => {
        return participants.some(participant => participant.id === user);
    };

    try {
        if (isRecruit) {
            const recruit = m.quoted?.sender || m.mentionedJid?.[0];
            const recruiter = m.sender;

            if (!recruit) {
                throw new Error('Debes mencionar a alguien para unirlo a tu harem.\n> Ejemplo » *#unirharem @usuario*');
            }
            
            if (userIsInGroup(recruit)) {
                return await conn.reply(m.chat, `《✧》 ${conn.getName(recruit)} ya está en este grupo.`, m);
            }
            
            if (recruiter === recruit) throw new Error('¡No puedes unirte a ti mismo!');

            pendingInvitations[recruiter] = recruit;
            const recruiterName = conn.getName(recruiter);
            const recruitName = conn.getName(recruit);
            
            const confirmationMessage = `🎯 ${recruiterName} te ha invitado a unirte a este grupo. ${recruitName} ¿aceptas la invitación?\n\n*Debes Responder con:*\n> ✐"Si" » para aceptar\n> ✐"No" » para rechazar.`;
            
            await conn.reply(m.chat, confirmationMessage, m, { mentions: [recruit, recruiter] });

            confirmations[recruit] = {
                recruiter,
                groupId: m.chat,
                timeout: setTimeout(() => {
                    conn.sendMessage(m.chat, { text: '*《✧》Se acabó el tiempo, no se obtuvo respuesta. La invitación ha expirado.*' }, { quoted: m });
                    delete confirmations[recruit];
                }, 60000)
            };

        } else if (isExpel) {
            const userToExpel = m.quoted?.sender || m.mentionedJid?.[0];
            
            if (!userToExpel) {
                throw new Error('Debes mencionar a alguien para expulsarlo del grupo.\n> Ejemplo » *#expulsar @usuario*');
            }
            
            if (!userIsInGroup(userToExpel)) {
                throw new Error(`${conn.getName(userToExpel)} no está en este grupo.`);
            }
            
            // Solo el admin puede expulsar
            const isAdmin = m.isGroup ? participants.find(p => p.id === m.sender)?.admin : false;
            if (!isAdmin) throw new Error('Solo los administradores pueden expulsar miembros.');
            
            await conn.groupParticipantsUpdate(m.chat, [userToExpel], 'remove');
            await conn.reply(m.chat, `✐ ${conn.getName(userToExpel)} ha sido expulsado del grupo.`, m);
        }
    } catch (error) {
        await conn.reply(m.chat, `《✧》 ${error.message}`, m);
    }
}

handler.before = async (m) => {
    if (m.isBaileys) return;
    if (!(m.sender in confirmations)) return;
    if (!m.text) return;

    const { recruiter, groupId, timeout } = confirmations[m.sender];

    if (/^No$/i.test(m.text)) {
        clearTimeout(timeout);
        delete confirmations[m.sender];
        return conn.sendMessage(groupId, { text: '*《✧》Han rechazado tu invitación al grupo.*' }, { quoted: m });
    }

    if (/^Si$/i.test(m.text)) {
        try {
            // Añadir al usuario al grupo
            await conn.groupParticipantsUpdate(groupId, [m.sender], 'add');
            
            conn.sendMessage(groupId, { text: `🎉 ¡Bienvenido/a al grupo, ${conn.getName(m.sender)}! \n\nFue reclutado por: ${conn.getName(recruiter)}\n\n¡Disfruta de tu estadía! 🎊`, mentions: [recruiter, m.sender] }, { quoted: m });

            // Guardar el reclutamiento en la base de datos
            recruitments[m.sender] = {
                recruiter: recruiter,
                group: groupId,
                date: new Date().toISOString()
            };
            saveRecruitments();

        } catch (error) {
            conn.sendMessage(groupId, { text: `《✧》 Error al agregar al usuario: ${error.message}` }, { quoted: m });
        }

        clearTimeout(timeout);
        delete confirmations[m.sender];
    }
};

handler.tags = ['fun'];
handler.help = ['unirharem *@usuario*', 'expulsar *@usuario*'];
handler.command = ['unirharem', 'expulsar'];
handler.group = true;
handler.admin = false; // reclutar no requiere admin, expulsar sí
handler.botAdmin = false; // el bot necesita ser admin para agregar/expulsar

export default handler;