const axios = require('axios');

// Función para mejorar la calidad de la imagen
async function enhanceImage(imageUrl) {
   try {
    let { data } = await axios.get(`https://deliriussapi-oficial.vercel.app/anime/animesearch?query=${encodeURIComponent(text)}`);
    let res = data.data;
    let ult = res.sort(() => 0.5 - Math.random()).slice(0, 7);

    for (let result of ult) {
        HasumiBotFreeCodes.push({
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: `${result.name}`,
                hasMediaAttachment: false // Cambiado a false, ya no se enviará imagen
            }),
            body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `
*Tipo:* ${result.payload.media_type}
*Año de inicio:* ${result.payload.start_year}
*Emitido:* ${result.payload.aired}
*Puntuación:* ${result.payload.score}
*Estado:* ${result.payload.status}
*Vistas:* ${result.views}
*Imagen:* ${result.image_url}` // Agregada la URL de la imagen en el cuerpo
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: `${result.url}` }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
        });
    }

    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    body: proto.Message.InteractiveMessage.Body.create({ text: '' }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: 'ANIME SLIDE' }),
                    header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
                    carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: [...HasumiBotFreeCodes] })
                })
            }
        }
    }, { quoted: m });

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
} catch (error) {
    console.error(error);
}

handler.command = ['anime'];

export default handler;
