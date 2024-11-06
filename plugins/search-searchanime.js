const axios = require('axios');

// Función para mejorar la calidad de la imagen
async function enhanceImage(imageUrl) {
    try {
        const response = await axios.post('https://api.deepai.org/api/waifu2x', {
            image: imageUrl,
        }, {
            headers: {
                'api-key': 'YOUR_API_KEY' // Reemplaza con tu clave de API de DeepAI
            }
        });
        return response.data.output_url; // URL de la imagen mejorada
    } catch (error) {
        console.error('Error al mejorar la imagen:', error);
        return imageUrl; // Devuelve la URL original si hay un error
    }
}

try {
    let { data } = await axios.get(`https://deliriussapi-oficial.vercel.app/anime/animesearch?query=${encodeURIComponent(text)}`);
    let res = data.data;
    let ult = res.sort(() => 0.5 - Math.random()).slice(0, 7);

    for (let result of ult) {
        // Mejora la calidad de la imagen antes de usarla
        const enhancedImageUrl = await enhanceImage(result.image_url);

        HasumiBotFreeCodes.push({
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: `${result.name}`,
                hasMediaAttachment: true,
                imageMessage: await createImage(enhancedImageUrl) // Usa la imagen mejorada
            }),
            body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `
*Tipo:* ${result.payload.media_type}
*Año de inicio:* ${result.payload.start_year}
*Emitido:* ${result.payload.aired}
*Puntuación:* ${result.payload.score}
*Estado:* ${result.payload.status}
*Vistas:* ${result.views}`
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
