// src/plugins/harem/unirharemmaestro.js
import { loadHarem, saveHarem, loadMasters, saveMasters } from "../../harem/storage.js";

let haremMembers = loadHarem();
let masters = loadMasters();

// Guardamos solicitudes temporales en memoria
let joinRequests = {};

const handler = async (m, { conn }) => {
    const requester = m.sender;
    const targetMaster = m.quoted?.sender || m.mentionedJid?.[0];

    if (!targetMaster) {
        return await conn.reply(m.chat, "✧ Debes mencionar o responder al maestro del harén al que quieres unirte.\n\nEjemplo: *.unirharemmaestro @maestro*", m);
    }

    if (requester === targetMaster) {
        return await conn.reply(m.chat, "✧ No puedes solicitar unirte a tu propio harén.", m);
    }

    // Verificar si el objetivo es maestro
    if (!masters[targetMaster]) {
        return await conn.reply(m.chat, "✧ Esa persona no es maestro de ningún harén.", m);
    }

    const targetHaremId = masters[targetMaster].haremId;

    // Verificar si el solicitante ya está en un harén
    if (haremMembers[requester] && haremMembers[requester].status === "active") {
        return await conn.reply(m.chat, "✧ Ya perteneces a un harén. No puedes solicitar unirte a otro.", m);
    }

    // Verificar si ya es maestro
    if (masters[requester]) {
        return await conn.reply(m.chat, "✧ Ya eres maestro de un harén y no puedes unirte a otro.", m);
    }

    // Guardar la solicitud en memoria
    joinRequests[requester] = targetMaster;

    await conn.reply(
        m.chat,
        `✧ ${conn.getName(requester)} quiere unirse a tu harén 👑\nResponde con *sí* o *no* en los próximos 30 segundos.`,
        m,
        { mentions: [requester, targetMaster] }
    );

    // Escuchar la respuesta del maestro
    const confirmation = await new Promise(resolve => {
        conn.ev.on("messages.upsert", function onMessage({ messages }) {
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim().toLowerCase();

            if (msg.key.participant === targetMaster || msg.key.remoteJid === targetMaster) {
                if (text === "sí" || text === "si") {
                    conn.ev.off("messages.upsert", onMessage);
                    resolve(true);
                } else if (text === "no") {
                    conn.ev.off("messages.upsert", onMessage);
                    resolve(false);
                }
            }
        });

        // Expira a los 30 segundos
        setTimeout(() => resolve(null), 30000);
    });

    if (confirmation === true) {
        // Aceptado
        haremMembers[requester] = {
            master: targetMaster,
            haremId: targetHaremId,
            joinDate: new Date().toISOString(),
            status: "active",
            role: "miembro"
        };
        saveHarem();

        masters[targetMaster].memberCount = Object.values(haremMembers).filter(m => m.haremId === targetHaremId && m.status === "active").length;
        saveMasters();

        await conn.reply(m.chat, `🌸 ${conn.getName(requester)} ha sido aceptado en el harén de ${conn.getName(targetMaster)} 👑`, m, {
            mentions: [requester, targetMaster],
        });
    } else if (confirmation === false) {
        await conn.reply(m.chat, `✧ ${conn.getName(targetMaster)} ha rechazado la solicitud de ${conn.getName(requester)}.`, m, {
            mentions: [requester, targetMaster],
        });
    } else {
        await conn.reply(m.chat, "⏳ La solicitud ha expirado. No hubo respuesta del maestro.", m);
    }

    delete joinRequests[requester];
};

handler.command = ["unirharemmaestro"];
handler.help = ["unirharemmaestro @maestro"];
handler.tags = ["harem"];

export default handler;