
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

const handler = async (m, { conn, command }) => {
    const isInviteToHarem = /^unirharem$/i.test(command);
    const isExpelFromHarem = /^expulsardelharem$/i.test(command);
    const isHaremInfo = /^miharem$/i.test(command);
    const isBecomeMaster = /^crearharem$/i.test(command);
    const isMasterInfo = /^mihareminfo$/i.test(command);
    const isLeaveHarem = /^dejarharem$/i.test(command);
    const isHaremList = /^listaharem$/i.test(command);

    const isUserMaster = (user) => {
        return masters[user] !== undefined;
    };

    const getUserHarem = (user) => {
        return haremMembers[user] ? haremMembers[user].haremId : null;
    };

    const getHaremMembers = (haremId) => {
        return Object.entries(haremMembers).filter(([memberId, memberData]) => 
            memberData.haremId === haremId && memberData.status === 'active'
        );
    };

    const getHaremMaster = (haremId) => {
        return Object.entries(masters).find(([masterId, masterData]) => 
            masterData.haremId === haremId
        )?.[0];
    };

    const countHaremMembers = (haremId) => {
        return getHaremMembers(haremId).length;
    };

    try {
        if (isInviteToHarem) {
            const recruit = m.quoted?.sender || m.mentionedJid?.[0];
            const inviter = m.sender;

            if (!recruit) {
                throw new Error('Debes mencionar a alguien para invitarlo a tu harén.\n> Ejemplo » *#unirharem @usuario*');
            }
            
            if (inviter === recruit) throw new Error('¡No puedes invitarte a ti mismo a tu harén!');

            // Verificar si el invitador es maestro y tiene harén
            if (!isUserMaster(inviter)) {
                throw new Error('Solo los maestros con harén pueden invitar a otros.\nUsa *#crearharem* para crear tu propio harén.');
            }

            const inviterHaremId = masters[inviter].haremId;
            
            // Verificar si el usuario ya está en algún harem
            if (haremMembers[recruit] && haremMembers[recruit].status === 'active') {
                const currentHaremId = haremMembers[recruit].haremId;
                const currentMaster = getHaremMaster(currentHaremId);
                return await conn.reply(m.chat, `《✧》 ${conn.getName(recruit)} ya pertenece al harén de ${conn.getName(currentMaster)}.`, m);
            }

            pendingInvitations[inviter] = recruit;
            const inviterName = conn.getName(inviter);
            const recruitName = conn.getName(recruit);
            
            const confirmationMessage = `👑 ${inviterName} te ha invitado a unirte a su harén real. ${recruitName} ¿aceptas convertirte en miembro de su harén?\n\n*Debes Responder con:*\n> ✐"Si" » para aceptar y unirte\n> ✐"No" » para rechazar la invitación.`;
            
            await conn.reply(m.chat, confirmationMessage, m, { mentions: [recruit, inviter] });

            confirmations[recruit] = {
                master: inviter,
                haremId: inviterHaremId,
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
                throw new Error(`${conn.getName(userToExpel)} no está en ningún harén.`);
            }
            
            // Solo el maestro del harem puede expulsar
            const userHaremId = haremMembers[userToExpel].haremId;
            const groupMaster = getHaremMaster(userHaremId);
            
            if (m.sender !== groupMaster) {
                throw new Error('Solo el maestro de este harén puede expulsar miembros.');
            }
            
            // Eliminar del registro del harem
            delete haremMembers[userToExpel];
            saveHarem();
            
            // Actualizar contador del maestro
            if (masters[groupMaster]) {
                masters[groupMaster].memberCount = countHaremMembers(userHaremId);
                saveMasters();
            }
            
            await conn.reply(m.chat, `✐ ${conn.getName(userToExpel)} ha sido liberado del harén.`, m);
            
        } else if (isHaremInfo) {
            const user = m.sender;
            const userHaremId = getUserHarem(user);
            
            if (!userHaremId) {
                return await conn.reply(m.chat, `《✧》 No perteneces a ningún harén.\nÚnete a uno con #unirharem o crea el tuyo con #crearharem`, m);
            }
            
            // Mostrar información del harem actual
            const groupMaster = getHaremMaster(userHaremId);
            const masterName = groupMaster ? conn.getName(groupMaster) : "Desconocido";
            const memberCount = countHaremMembers(userHaremId);
            const haremMembersList = getHaremMembers(userHaremId);
            
            let haremInfo = `👑 *INFORMACIÓN DE TU HARÉN* 👑\n\n`;
            haremInfo += `• Maestro: ${masterName}\n`;
            haremInfo += `• Miembros: ${memberCount}\n\n`;
            
            if (memberCount > 0) {
                haremInfo += `*Lista de miembros:*\n`;
                
                haremMembersList.forEach(([memberId, memberData], index) => {
                    const memberName = conn.getName(memberId);
                    if (memberId === groupMaster) {
                        haremInfo += `👑 ${memberName} (Maestro)\n`;
                    } else if (isUserMaster(memberId)) {
                        haremInfo += `⭐ ${memberName} (También es maestro)\n`;
                    } else {
                        haremInfo += `💖 ${memberName}\n`;
                    }
                });
            }
            
            haremInfo += `\nUsa *${process.env.PREFIX || '#'}unirharem @usuario* para invitar a alguien a tu harén.`;
            
            await conn.reply(m.chat, haremInfo, m);
            
        } else if (isBecomeMaster) {
            const user = m.sender;
            
            if (isUserMaster(user)) {
                const userHaremId = masters[user].haremId;
                const memberCount = countHaremMembers(userHaremId);
                return await conn.reply(m.chat, `《✧》 ¡Ya eres maestro de un harén con ${memberCount} miembros, ${conn.getName(user)}! 👑`, m);
            }
            
            // Crear un ID único para el harén
            const haremId = 'harem_' + Math.random().toString(36).substr(2, 9);
            
            // Convertir al usuario en maestro y crear su harén
            masters[user] = {
                since: new Date().toISOString(),
                haremId: haremId,
                memberCount: 1,
                status: 'active'
            };
            
            // Añadirse a sí mismo como miembro del harén
            haremMembers[user] = {
                haremId: haremId,
                joinDate: new Date().toISOString(),
                status: 'active',
                role: 'maestro'
            };
            
            saveMasters();
            saveHarem();
            
            await conn.reply(m.chat, `🎉 ¡Felicidades ${conn.getName(user)}! Has creado tu propio harén. 👑\n\nUsa *${process.env.PREFIX || '#'}unirharem @usuario* para invitar miembros a tu harén.`, m);
            
        } else if (isMasterInfo) {
            const user = m.sender;
            
            if (!isUserMaster(user)) {
                return await conn.reply(m.chat, `《✧》 No eres maestro de ningún harén.\nUsa *${process.env.PREFIX || '#'}crearharem* para crear el tuyo.`, m);
            }
            
            const masterData = masters[user];
            const joinDate = new Date(masterData.since).toLocaleDateString();
            const memberCount = countHaremMembers(masterData.haremId);
            
            let masterInfo = `👑 *INFORMACIÓN DE MAESTRO* 👑\n\n`;
            masterInfo += `• Nombre: ${conn.getName(user)}\n`;
            masterInfo += `• Maestro desde: ${joinDate}\n`;
            masterInfo += `• Miembros en tu harén: ${memberCount}\n`;
            masterInfo += `• ID de tu harén: ${masterData.haremId}\n\n`;
            masterInfo += `*Usa estos comandos:*\n`;
            masterInfo += `• #unirharem @usuario → Invitar a tu harén\n`;
            masterInfo += `• #expulsardelharem @usuario → Expulsar miembro\n`;
            masterInfo += `• #miharem → Ver información de tu harén\n`;
            masterInfo += `• #listaharem → Ver todos los harenes`;
            
            await conn.reply(m.chat, masterInfo, m);
            
        } else if (isLeaveHarem) {
            const user = m.sender;
            
            if (!haremMembers[user] || haremMembers[user].status !== 'active') {
                return await conn.reply(m.chat, `《✧》 No perteneces a ningún harén.`, m);
            }
            
            const userHaremId = haremMembers[user].haremId;
            const groupMaster = getHaremMaster(userHaremId);
            
            // Si es el maestro, no puede abandonar, debe disolver el harén
            if (user === groupMaster) {
                return await conn.reply(m.chat, `《✧》 Eres el maestro de este harén. No puedes abandonarlo.\nSi quieres disolverlo, expulsa a todos los miembros primero.`, m);
            }
            
            // Eliminar del registro del harem
            delete haremMembers[user];
            saveHarem();
            
            // Actualizar contador del maestro
            if (masters[groupMaster]) {
                masters[groupMaster].memberCount = countHaremMembers(userHaremId);
                saveMasters();
            }
            
            await conn.reply(m.chat, `✐ Has abandonado el harén de ${conn.getName(groupMaster)}.`, m);
            
        } else if (isHaremList) {
            // Obtener todos los harenes únicos
            const allHarems = {};
            
            Object.entries(masters).forEach(([masterId, masterData]) => {
                if (masterData.status === 'active') {
                    const memberCount = countHaremMembers(masterData.haremId);
                    allHarems[masterData.haremId] = {
                        master: masterId,
                        masterName: conn.getName(masterId),
                        memberCount: memberCount
                    };
                }
            });
            
            let haremList = `👑 *LISTA DE HARENES* 👑\n\n`;
            
            if (Object.keys(allHarems).length === 0) {
                haremList += `No hay harenes activos en este momento.\n¡Sé el primero en crear uno con #crearharem!`;
            } else {
                haremList += `*Harenes activos:*\n\n`;
                
                Object.values(allHarems).forEach((harem, index) => {
                    haremList += `*${index + 1}.* ${harem.masterName} - ${harem.memberCount} miembros\n`;
                });
                
                haremList += `\nUsa *${process.env.PREFIX || '#'}unirharem @usuario* para unirte a un harén.`;
            }
            
            await conn.reply(m.chat, haremList, m);
        }
    } catch (error) {
        await conn.reply(m.chat, `《✧》 ${error.message}`, m);
    }
}

handler.before = async (m) => {
    if (m.isBaileys) return;
    if (!(m.sender in confirmations)) return;
    if (!m.text) return;

    const { master, haremId, timeout } = confirmations[m.sender];

    if (/^No$/i.test(m.text)) {
        clearTimeout(timeout);
        delete confirmations[m.sender];
        return conn.reply(m.chat, '*《✧》Han rechazado tu invitación al harén.*', m);
    }

    if (/^Si$/i.test(m.text)) {
        try {
            // Guardar la información del harem
            haremMembers[m.sender] = {
                master: master,
                haremId: haremId,
                joinDate: new Date().toISOString(),
                status: 'active',
                role: 'miembro'
            };
            saveHarem();

            // Actualizar contador del maestro
            if (masters[master]) {
                masters[master].memberCount = countHaremMembers(haremId);
                saveMasters();
            }

            conn.reply(m.chat, `🌸 ¡Bienvenida/o al harén real, ${conn.getName(m.sender)}! \n\nAhora formas parte del harén de ${conn.getName(master)}\n\n¡Que tu estadía esté llena de prosperidad y elegancia! 👑✨`, m, { mentions: [master, m.sender] });

        } catch (error) {
            conn.reply(m.chat, `《✧》 Error al unirte al harén: ${error.message}`, m);
        }

        clearTimeout(timeout);
        delete confirmations[m.sender];
    }
};

// Función auxiliar para contar miembros de un harén
function countHaremMembers(haremId) {
    return Object.values(haremMembers).filter(member => 
        member.haremId === haremId && member.status === 'active'
    ).length;
}

handler.tags = ['harem', 'social'];
handler.help = [
    'crearharem', 
    'unirharem *@usuario*', 
    'expulsardelharem *@usuario*', 
    'miharem',
    'mihareminfo',
    'dejarharem',
    'listaharem'
];
handler.command = ['unirharem', 'expulsardelharem', 'miharem', 'crearharem', 'mihareminfo', 'dejarharem', 'listaharem'];
handler.group = false; // Ya no necesita estar en grupo
handler.private = true; // Funciona en chats privados
handler.admin = false;
handler.botAdmin = false; // Ya no necesita permisos de admin

export default handler;