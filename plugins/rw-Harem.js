
    import fs from 'fs';
import path from 'path';

const haremFile = path.resolve('src/database/harem.json');
const mastersFile = path.resolve('src/database/harem_masters.json');
let haremMembers = loadHarem();
let masters = loadMasters();

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
    const isDisbandHarem = /^disolverharem$/i.test(command);

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

            const inviterName = conn.getName(inviter);
            const recruitName = conn.getName(recruit);
            
            // Añadir automáticamente al harén sin confirmación
            haremMembers[recruit] = {
                master: inviter,
                haremId: inviterHaremId,
                joinDate: new Date().toISOString(),
                status: 'active',
                role: 'miembro'
            };
            saveHarem();

            // Actualizar contador del maestro
            if (masters[inviter]) {
                masters[inviter].memberCount = countHaremMembers(inviterHaremId);
                saveMasters();
            }

            await conn.reply(m.chat, `🌸 ¡${recruitName} se ha unido automáticamente al harén de ${inviterName}! 👑\n\n¡Bienvenida/o al harén real! ✨`, m, { mentions: [recruit, inviter] });

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
            
            const expelledName = conn.getName(userToExpel);
            
            // Eliminar del registro del harem
            delete haremMembers[userToExpel];
            saveHarem();
            
            // Actualizar contador del maestro
            if (masters[groupMaster]) {
                masters[groupMaster].memberCount = countHaremMembers(userHaremId);
                saveMasters();
            }
            
            await conn.reply(m.chat, `✐ ${expelledName} ha sido expulsado del harén.`, m);
            
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
            haremInfo += `• Miembros: ${memberCount}\n`;
            haremInfo += `• ID del harén: ${userHaremId}\n\n`;
            
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
            
            await conn.reply(m.chat, `🎉 ¡Felicidades ${conn.getName(user)}! Has creado tu propio harén. 👑\n\n• ID de tu harén: ${haremId}\n• Usa *${process.env.PREFIX || '#'}unirharem @usuario* para invitar miembros.`, m);
            
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
            masterInfo += `• #listaharem → Ver todos los harenes\n`;
            masterInfo += `• #disolverharem → Disolver tu harén (elimina todos los miembros)`;
            
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
                return await conn.reply(m.chat, `《✧》 Eres el maestro de este harén. No puedes abandonarlo.\nUsa #disolverharem si quieres eliminar todo el harén.`, m);
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
                    haremList += `*${index + 1}.* ${harem.masterName} - ${harem.memberCount} miembros (ID: ${harem.masterData?.haremId || 'N/A'})\n`;
                });
                
                haremList += `\nUsa *${process.env.PREFIX || '#'}unirharem @usuario* para unirte a un harén.`;
            }
            
            await conn.reply(m.chat, haremList, m);
            
        } else if (isDisbandHarem) {
            const user = m.sender;
            
            if (!isUserMaster(user)) {
                return await conn.reply(m.chat, `《✧》 No eres maestro de ningún harén.`, m);
            }
            
            const masterData = masters[user];
            const haremId = masterData.haremId;
            const memberCount = countHaremMembers(haremId);
            
            // Confirmación rápida
            const confirmMessage = `¿Estás seguro de que quieres disolver tu harén (ID: ${haremId}) con ${memberCount} miembros?\n\nResponde *"si"* para confirmar o *"no"* para cancelar.`;
            await conn.reply(m.chat, confirmMessage, m);
            
            // Esperar confirmación
            let confirmed = false;
            const collector = (response) => {
                if (response.sender === user && /^s[ií]?$/i.test(response.text)) {
                    confirmed = true;
                    conn.off('message-new', collector);
                } else if (response.sender === user && /^no?$/i.test(response.text)) {
                    conn.off('message-new', collector);
                }
            };
            
            conn.on('message-new', collector);
            
            // Esperar 15 segundos por la respuesta
            await new Promise(resolve => setTimeout(resolve, 15000));
            conn.off('message-new', collector);
            
            if (confirmed) {
                // Eliminar todos los miembros del harén
                const members = getHaremMembers(haremId);
                members.forEach(([memberId]) => {
                    delete haremMembers[memberId];
                });
                
                // Eliminar al maestro
                delete masters[user];
                
                saveHarem();
                saveMasters();
                
                await conn.reply(m.chat, `✐ Tu harén (ID: ${haremId}) ha sido disuelto correctamente. Todos los ${memberCount} miembros han sido liberados.`, m);
            } else {
                await conn.reply(m.chat, `《✧》 Operación cancelada. Tu harén (ID: ${haremId}) sigue activo.`, m);
            }
        }
    } catch (error) {
        await conn.reply(m.chat, `《✧》 ${error.message}`, m);
    }
}

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
    'listaharem',
    'disolverharem'
];
handler.command = ['unirharem', 'expulsardelharem', 'miharem', 'crearharem', 'mihareminfo', 'dejarharem', 'listaharem', 'disolverharem'];
handler.group = false;
handler.private = true;
handler.admin = false;
handler.botAdmin = false;

export default handler;