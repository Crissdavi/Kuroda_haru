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

    // Función corregida para verificar si un usuario está en el grupo
    const userIsInGroup = (user) => {
        return participants.some(participant => participant.id === user);
    };

    const isUserMaster = (user) => {
        return masters[user] !== undefined;
    };

    const getGroupMaster = () => {
        return Object.entries(haremMembers).find(([memberId, memberData]) => 
            memberData.group === m.chat && memberData.role === 'maestro'
        )?.[0]; // Retorna el ID del maestro
    };

    // Función para contar miembros REALES del harem actual (excluyendo no miembros)
    const countHaremMembers = () => {
        return Object.values(haremMembers).filter(member => 
            member.group === m.chat && member.status === 'active'
        ).length;
    };

    // Función para obtener miembros REALES del harem actual
    const getHaremMembers = () => {
        return Object.entries(haremMembers).filter(([memberId, memberData]) => 
            memberData.group === m.chat && memberData.status === 'active'
        );
    };

    try {
        if (isInviteToHarem) {
            const recruit = m.quoted?.sender || m.mentionedJid?.[0];
            const inviter = m.sender;

            if (!recruit) {
                throw new Error('Debes mencionar a alguien para invitarlo a tu harén.\n> Ejemplo » *#unirharem @usuario*');
            }
            
            // Verificación CORREGIDA: usar la función userIsInGroup
            if (userIsInGroup(recruit)) {
                return await conn.reply(m.chat, `《✧》 ${conn.getName(recruit)} ya está en este grupo.`, m);
            }
            
            if (inviter === recruit) throw new Error('¡No puedes invitarte a ti mismo a tu harén!');

            // Verificar si el invitador es maestro
            if (!isUserMaster(inviter)) {
                throw new Error('Solo los maestros pueden invitar a otros a su harén.\nUsa *#convertirmemaestro* para convertirte en maestro.');
            }

            // Verificar si el usuario ya está en algún harem
            if (haremMembers[recruit] && haremMembers[recruit].status === 'active') {
                return await conn.reply(m.chat, `《✧》 ${conn.getName(recruit)} ya pertenece al harén de ${conn.getName(haremMembers[recruit].master)}.`, m);
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
            
            // Verificar si el usuario está en la base de datos del harem
            if (!haremMembers[userToExpel] || haremMembers[userToExpel].status !== 'active') {
                throw new Error(`${conn.getName(userToExpel)} no está en este harén.`);
            }
            
            // Verificar si el usuario está en el grupo de WhatsApp
            if (!userIsInGroup(userToExpel)) {
                // Si no está en el grupo pero sí en la BD, limpiar registro
                delete haremMembers[userToExpel];
                saveHarem();
                throw new Error(`${conn.getName(userToExpel)} no está en el grupo pero fue removido de la base de datos.`);
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
            const realMemberCount = countHaremMembers();
            const haremMembersList = getHaremMembers();
            
            let haremInfo = `👑 *INFORMACIÓN DEL HARÉN* 👑\n\n`;
            haremInfo += `• Maestro: ${masterName}\n`;
            haremInfo += `• Miembros registrados: ${realMemberCount}\n`;
            haremInfo += `• Miembros en el grupo: ${participants.length - 1}\n\n`;
            
            if (realMemberCount > 0) {
                haremInfo += `*Lista de miembros registrados:*\n`;
                
                haremMembersList.forEach(([memberId, memberData], index) => {
                    const memberName = conn.getName(memberId);
                    if (memberId === groupMaster) {
                        haremInfo += `👑 ${memberName} (Maestro)\n`;
                    } else if (isUserMaster(memberId)) {
                        haremInfo += `⭐ ${memberName} (Maestro)\n`;
                    } else {
                        haremInfo += `💖 ${memberName}\n`;
                    }
                });
            } else {
                haremInfo += `*No hay miembros registrados en este harén.*\n`;
            }
            
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
            
            // Si es el primer maestro en este grupo, asignarlo como maestro del harén
            const groupMaster = getGroupMaster();
            if (!groupMaster) {
                haremMembers[user] = {
                    master: user,
                    group: m.chat,
                    joinDate: new Date().toISOString(),
                    status: 'active',
                    role: 'maestro'
                };
                saveHarem();
            }
            
            await conn.reply(m.chat, `🎉 ¡Felicidades ${conn.getName(user)}! Ahora eres un maestro y puedes crear tu propio harén. 👑\n\nUsa *${process.env.PREFIX || '#'}unirharem @usuario* para invitar miembros a tu harén.`, m);
            
        } else if (isMasterInfo) {
            const user = m.sender;
            
            if (!isUserMaster(user)) {
                return await conn.reply(m.chat, `《✧》 No eres un maestro todavía.\nUsa *${process.env.PREFIX || '#'}convertirmemaestro* para convertirte en uno.`, m);
            }
            
            const masterData = masters[user];
            const joinDate = new Date(masterData.since).toLocaleDateString();
            
            // Contar miembros en el harem actual del maestro
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

// Función para limpiar miembros que ya no están en grupos
async function cleanupHaremMembers(conn) {
    for (const [memberId, memberData] of Object.entries(haremMembers)) {
        if (memberData.status === 'active') {
            try {
                const groupData = await conn.groupMetadata(memberData.group).catch(() => null);
                if (!groupData || !groupData.participants.some(p => p.id === memberId)) {
                    // Miembro ya no está en el grupo, marcarlo como inactivo
                    haremMembers[memberId].status = 'inactive';
                }
            } catch (error) {
                console.log('Error al verificar miembro:', error);
            }
        }
    }
    saveHarem();
}

// Ejecutar limpieza periódicamente (cada hora)
setInterval(() => {
    cleanupHaremMembers(conn);
}, 3600000);

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