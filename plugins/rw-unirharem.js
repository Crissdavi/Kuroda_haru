// src/plugins/harem/unirharem.js
import { loadHarem, saveHarem, loadMasters, saveMasters } from "../../harem/storage.js";

let haremMembers = loadHarem();
let masters = loadMasters();

const handler = async (m, { conn }) => {
    const inviter = m.sender;
    const recruit = m.quoted?.sender || m.mentionedJid?.[0];

    if (!recruit) {
        return await conn.reply(m.chat, "✧ Debes mencionar o responder a alguien para invitarlo a tu harén.\n\nEjemplo: *.unirharem @usuario*", m);
    }

    if (inviter === recruit) {
        return await conn.reply(m.chat, "✧ No puedes invitarte a ti mismo a tu propio harén.", m);
    }

    // Verificar si el invitador es maestro
    if (!masters[inviter]) {
        return await conn.reply(m.chat, "✧ Solo los maestros con harén pueden invitar.\nUsa *.crearharem* primero.", m);
    }

    const inviterHaremId = masters[inviter].haremId;

    // Verificar si el reclutado ya pertenece a un harén
    if (haremMembers[recruit] && haremMembers[recruit].status === "active") {
        const currentHaremId = haremMembers[recruit].haremId;
        const currentMaster = Object.keys(masters).find(masterId => masters[masterId].haremId === currentHaremId);

        return await conn.reply(
            m.chat,
            `✧ ${conn.getName(recruit)} ya pertenece al harén de ${conn.getName(currentMaster)}.`,
            m,
            { mentions: [recruit, currentMaster] }
        );
    }

    // Verificar si ya es maestro
    if (masters[recruit]) {
        return await conn.reply(m.chat, `✧ ${conn.getName(recruit)} ya es maestro de su propio harén y no puede ser reclutado.`, m);
    }

    // Añadir automáticamente al harén
    haremMembers[recruit] = {
        master: inviter,
        haremId: inviterHaremId,
        joinDate: new Date().toISOString(),
        status: "active",
        role: "miembro"
    };
    saveHarem();

    // Actualizar contador del maestro
    masters[inviter].memberCount = Object.values(haremMembers).filter(m => m.haremId === inviterHaremId && m.status === "active").length;
    saveMasters();

    await conn.reply(
        m.chat,
        `🌸 ¡${conn.getName(recruit)} se ha unido automáticamente al harén de ${conn.getName(inviter)}! 👑`,
        m,
        { mentions: [recruit, inviter] }
    );
};

handler.command = ["unirharem"];
handler.help = ["unirharem @usuario"];
handler.tags = ["harem"];

export default handler;