import fs from 'fs';
import path from 'path';

const haremFile = path.resolve('src/database/harem.json');
const mastersFile = path.resolve('src/database/harem_masters.json');
let pendingInvitations = {};
let haremMembers = loadHarem();
let masters = loadMasters();
const confirmations = {};

function loadHarem() {
    return fs.existsSync(haremFile) ? JSON.parse(fs.readFileSync(haremFile, 'utf8')) : {};
}

function loadMasters() {
    return fs.existsSync(mastersFile) ? JSON.parse(fs.readFileSync(mastersFile, 'utf8')) : {};
}

function saveHarem() {
    fs.writeFileSync(haremFile, JSON.stringify(haremMembers, null, 2));
}

function saveMasters() {
    fs.writeFileSync(mastersFile, JSON.stringify(masters, null, 2));
}

const handler = async (m, { conn, command, participants, groupMetadata }) => {
    const isInviteToHarem = /^unirharem$/i.test(command);
    const isExpelFromHarem = /^expulsardelharem$/i.test(command);
    const isHaremInfo = /^miharem$/i.test(command);
    const isBecomeMaster = /^convertirmemaestro$/i.test(command);
    const isMasterInfo = /^mimaestro$/i.test(command);

    const userIsInGroup = (user) => {
        return participants.some(participant => participant.id === user);
    };

    const isUserMaster = (user) => {
        return masters[user] !== undefined;
    };

    const getGroupMaster = () => {
        return Object.values(haremMembers).find(member => 
            member.group === m.chat && member.role === 'maestro'
        )?.user;
    };

    try {
        if (isInviteToHarem) {
            const recruit = m.quoted?.sender || m.mentionedJid?.[0];
            const inviter = m.sender;

            if (!recruit) {
                throw new Error('Debes mencionar a alguien para invitarlo a tu harén.\n> Ejemplo » *#unirharem @usuario*');
            }
            
            if (userIsInGroup(recruit)) {
                return await conn.reply(m.chat, `《✧》 ${conn.getName(recruit)} ya está en este harén.`, m);
            }
            
            if (inviter === recruit) throw new Error('¡No puedes invitarte a ti mismo a tu harén!');

            // Verificar si el invitador es maestro
            if (!isUserMaster(inviter)) {
                throw new Error('Solo los maestros pueden invitar a otros a su harén.\nUsa *#convertirmemaestro* para convertirte en maestro.');
            }

            pendingInvitations[inviter] = recruit;
            const inviterName = conn.getName(inviter);
            const recruitName = conn.getName(recruit);
            
            const confirmationMessage = `👑 ${inviterName} te ha invitado a unirte a su harén real. ${recruitName} ¿aceptas convertirte en miembro de su harén?\n\n*Debes Responder con:*\n> ✐"Si" » para aceptar y unirte\n> ✐"No" » para rechazar la invitación.`;
            
            await conn.reply(m.chat, confirmationMessage, m, { mentions: [recruit, inviter] });

            confirmations[recruit] = {
                master: inviter,
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
            
            // Solo el maestro del harem puede expulsar
            const groupMaster = getGroupMaster();
            if (m.sender !== groupMaster) {
                throw new Error('Solo el maestro de este harén puede expulsar miembros.');
            }
            
            await conn.groupParticipantsUpdate(m.chat, [userToExpel], 'remove');
            
            // Eliminar del registro del harem
            if (haremMembers[userToExpel]) {
                delete haremMembers[userToExpel];
                saveHarem();
            }
            
            await conn.reply(m.chat, `✐ ${conn.getName(userToExpel)} ha sido liberado del harén.`, m);
            
        } else if (isHaremInfo) {
            // Mostrar información del harem actual
            const groupMaster = getGroupMaster();
            const masterName = groupMaster ? conn.getName(groupMaster) : "Ninguno";
            
            let haremInfo = `👑 *INFORMACIÓN DEL HARÉN* 👑\n\n`;
            haremInfo += `• Maestro: ${masterName}\n`;
            haremInfo += `• Miembros: ${participants.length - 1}\n\n`;
            haremInfo += `*Lista de miembros:*\n`;
            
            participants.forEach((p, index) => {
                if (!p.id.endsWith('@s.whatsapp.net')) return;
                
                if (p.id === groupMaster) {
                    haremInfo += `👑 ${conn.getName(p.id)} (Maestro)\n`;
                } else if (isUserMaster(p.id)) {
                    haremInfo += `⭐ ${conn.getName(p.id)} (Maestro)\n`;
                } else {
                    haremInfo += `💖 ${conn.getName(p.id)}\n`;
                }
            });
            
            haremInfo += `\nUsa *${process.env.PREFIX || '#'}unirharem @usuario* para invitar a alguien a tu harén.`;
            
            await conn.reply(m.chat, haremInfo, m);
            
        } else if (isBecomeMaster) {
            const user = m.sender;
            
            if (isUserMaster(user)) {
                return await conn.reply(m.chat, `《✧》 ¡Ya eres un maestro, ${conn.getName(user)}! 👑`, m);
            }
            
            // Convertir al usuario en maestro
            masters[user] = {
                since: new Date().toISOString(),
                haremCount: 0,
                status: 'active'
            };
            saveMasters();
            
            await conn.reply(m.chat, `🎉 ¡Felicidades ${conn.getName(user)}! Ahora eres un maestro y puedes crear tu propio harén. 👑\n\nUsa *${process.env.PREFIX || '#'}unirharem @usuario* para invitar miembros a tu harén.`, m);
            
        } else if (isMasterInfo) {
            const user = m.sender;
            
            if (!isUserMaster(user)) {
                return await conn.reply(m.chat, `《✧》 No eres un maestro todavía.\nUsa *${process.env.PREFIX || '#'}convertirmemaestro* para convertirte en uno.`, m);
            }
            
            const masterData = masters[user];
            const joinDate = new Date(masterData.since).toLocaleDateString();
            
            // Contar miembros en el harem actual
            const memberCount = Object.values(haremMembers).filter(member => 
                member.master === user && member.status === 'active'
            ).length;
            
            let masterInfo = `👑 *INFORMACIÓN DE MAESTRO* 👑\n\n`;
            masterInfo += `• Nombre: ${conn.getName(user)}\n`;
            masterInfo += `• Maestro desde: ${joinDate}\n`;
            masterInfo += `• Miembros en tu harén: ${memberCount}\n`;
            masterInfo += `• Estado: ${masterData.status}\n\n`;
            masterInfo += `*Usa estos comandos:*\n`;
            masterInfo += `• #unirharem @usuario → Invitar a tu harén\n`;
            masterInfo += `• #expulsardelharem @usuario → Expulsar miembro\n`;
            masterInfo += `• #miharem → Ver información de tu harén`;
            
            await conn.reply(m.chat, masterInfo, m);
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
                status: 'active',
                role: 'miembro'
            };
            saveHarem();

            // Actualizar contador del maestro
            if (masters[master]) {
                masters[master].haremCount = (masters[master].haremCount || 0) + 1;
                saveMasters();
            }

        } catch (error) {
            conn.sendMessage(groupId, { text: `《✧》 Error al agregar al usuario al harén: ${error.message}` }, { quoted: m });
        }

        clearTimeout(timeout);
        delete confirmations[m.sender];
    }
};

handler.tags = ['group', 'harem'];
handler.help = [
    'unirharem *@usuario*', 
    'expulsardelharem *@usuario*', 
    'miharem',
    'convertirmemaestro',
    'mimaestro'
];
handler.command = ['unirharem', 'expulsardelharem', 'miharem', 'convertirmemaestro', 'mimaestro'];
handler.group = true;
handler.admin = false;
handler.botAdmin = true;

export default handler;