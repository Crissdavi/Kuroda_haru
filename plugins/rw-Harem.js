
import fs from 'fs';
import path from 'path';

const haremFile = path.resolve('src/database/harem.json');
let pendingInvitations = {};
let haremMembers = loadHarem();
const confirmations = {};

function loadHarem() {
    return fs.existsSync(haremFile) ? JSON.parse(fs.readFileSync(haremFile, 'utf8')) : {};
}

function saveHarem() {
    fs.writeFileSync(haremFile, JSON.stringify(haremMembers, null, 2));
}

const handler = async (m, { conn, command, participants }) => {
    const isInviteToHarem = /^unirharem$/i.test(command);
    const isExpelFromHarem = /^expulsardelharem$/i.test(command);
    const isHaremInfo = /^miharem$/i.test(command);

    const userIsInGroup = (user) => {
        return participants.some(participant => participant.id === user);
    };

    try {
        if (isInviteToHarem) {
            const recruit = m.quoted?.sender || m.mentionedJid?.[0];
            const master = m.sender;

            if (!recruit) {
                throw new Error('Debes mencionar a alguien para invitarlo a tu harén.\n> Ejemplo » *#unirharem @usuario*');
            }
            
            if (userIsInGroup(recruit)) {
                return await conn.reply(m.chat, `《✧》 ${conn.getName(recruit)} ya está en este harén.`, m);
            }
            
            if (master === recruit) throw new Error('¡No puedes invitarte a ti mismo a tu harén!');

            pendingInvitations[master] = recruit;
            const masterName = conn.getName(master);
            const recruitName = conn.getName(recruit);
            
            const confirmationMessage = `👑 ${masterName} te ha invitado a unirte a su harén real. ${recruitName} ¿aceptas convertirte en miembro de su harén?\n\n*Debes Responder con:*\n> ✐"Si" » para aceptar y unirte\n> ✐"No" » para rechazar la invitación.`;
            
            await conn.reply(m.chat, confirmationMessage, m, { mentions: [recruit, master] });

            confirmations[recruit] = {
                master,
                groupId: m.chat,
                timeout: setTimeout(() => {
                    conn.sendMessage(m.chat, { text: '*《✧》Se acabó el tiempo, la invitación al harén ha expirado.*' }, { quoted: m });
                    delete confirmations[recruit];
                }, 60000)
            };

        } else if (isExpelFromHarem) {
            const userToExpel = m.quoted?.sender || m.mentionedJid?.[0];
            
            if (!userToExpel) {
                throw new Error('Debes mencionar a alguien para expulsarlo del harén.\n> Ejemplo » *#expulsardelharem @usuario*');
            }
            
            if (!userIsInGroup(userToExpel)) {
                throw new Error(`${conn.getName(userToExpel)} no está en este harén.`);
            }
            
            // Solo el maestro/matriz del harem puede expulsar
            const isMaster = m.isGroup ? participants.find(p => p.id === m.sender)?.admin : false;
            if (!isMaster) throw new Error('Solo el maestro/matriz del harén puede expulsar miembros.');
            
            await conn.groupParticipantsUpdate(m.chat, [userToExpel], 'remove');
            
            // Eliminar del registro del harem
            if (haremMembers[userToExpel]) {
                delete haremMembers[userToExpel];
                saveHarem();
            }
            
            await conn.reply(m.chat, `✐ ${conn.getName(userToExpel)} ha sido liberado del harén.`, m);
            
        } else if (isHaremInfo) {
            // Mostrar información del harem actual
            const haremCount = participants.length - 1; // Excluyendo al bot
            const master = participants.find(p => p.admin)?.id || m.sender;
            const masterName = conn.getName(master);
            
            let haremInfo = `👑 *HARÉN DE ${masterName.toUpperCase()}* 👑\n\n`;
            haremInfo += `• Miembros del harén: ${haremCount}\n`;
            haremInfo += `• Maestro/Matriz: ${masterName}\n\n`;
            haremInfo += `*Miembros:*\n`;
            
            participants.forEach((p, index) => {
                if (!p.id.endsWith('@s.whatsapp.net')) return; // Excluir al bot
                if (p.admin) {
                    haremInfo += `👑 ${conn.getName(p.id)} (Maestro/Matriz)\n`;
                } else {
                    haremInfo += `💖 ${conn.getName(p.id)}\n`;
                }
            });
            
            haremInfo += `\nUsa *${process.env.PREFIX || '#'}unirharem @usuario* para invitar a alguien a tu harén.`;
            
            await conn.reply(m.chat, haremInfo, m);
        }
    } catch (error) {
        await conn.reply(m.chat, `《✧》 ${error.message}`, m);
    }
}

handler.before = async (m) => {
    if (m.isBaileys) return;
    if (!(m.sender in confirmations)) return;
    if (!m.text) return;

    const { master, groupId, timeout } = confirmations[m.sender];

    if (/^No$/i.test(m.text)) {
        clearTimeout(timeout);
        delete confirmations[m.sender];
        return conn.sendMessage(groupId, { text: '*《✧》Han rechazado tu invitación al harén.*' }, { quoted: m });
    }

    if (/^Si$/i.test(m.text)) {
        try {
            // Añadir al usuario al grupo (harén)
            await conn.groupParticipantsUpdate(groupId, [m.sender], 'add');
            
            conn.sendMessage(groupId, { text: `🌸 ¡Bienvenida/o al harén real, ${conn.getName(m.sender)}! \n\nAhora formas parte del harén de ${conn.getName(master)}\n\n¡Que tu estadía esté llena de prosperidad y elegancia! 👑✨`, mentions: [master, m.sender] }, { quoted: m });

            // Guardar la información del harem
            haremMembers[m.sender] = {
                master: master,
                group: groupId,
                joinDate: new Date().toISOString(),
                status: 'active'
            };
            saveHarem();

        } catch (error) {
            conn.sendMessage(groupId, { text: `《✧》 Error al agregar al usuario al harén: ${error.message}` }, { quoted: m });
        }

        clearTimeout(timeout);
        delete confirmations[m.sender];
    }
};

handler.tags = ['group', 'harem'];
handler.help = ['unirharem *@usuario*', 'expulsardelharem *@usuario*', 'miharem'];
handler.command = ['unirharem', 'expulsardelharem', 'miharem'];
handler.group = true;
handler.admin = false; // unirharem no requiere admin, expulsar sí
handler.botAdmin = true; // el bot necesita ser admin para agregar/expulsar

export default handler;