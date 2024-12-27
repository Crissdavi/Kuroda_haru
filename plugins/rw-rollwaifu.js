let handler = async (m, { conn, text }) => {
    if (!text) {
        await conn.sendMessage(m.chat, { text: 'Debes proporcionar una ID para buscar al personaje.' });
        return;
    }

    let data = obtenerDatos();
    let personaje = data.personajesReservados.find(p => p.id === text.trim());

    if (!personaje) {
        await conn.sendMessage(m.chat, { text: `No se encontró un personaje con la ID: ${text}` });
        return;
    }

    let responseMessage = `🌱 Nombre: ${personaje.name}\n💹 Valor: ${personaje.value} Zekis\n🆔 ID: ${personaje.id}\n💾 Estado: Reservado por ${personaje.userId}`;

    await conn.sendMessage(m.chat, {
        image: { url: personaje.url },
        caption: responseMessage,
    });
};
handler.help = ['roll'];
handler.tags = ['rw'];
handler.command = ['roll', 'rw'];
handler.group = true;

export default handler;