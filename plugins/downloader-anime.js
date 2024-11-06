const axios = require('axios');
const fs = require('fs');

async function downloadAnimesByLanguage(query, language) {
    try {
    // Realiza la búsqueda de animes
    let { data } = await axios.get(`https://deliriussapi-oficial.vercel.app/anime/animesearch?query=${encodeURIComponent(text)}`);
    let res = data.data;

    // Filtrar resultados por idioma (aquí asumimos que tienes un campo 'language' en el payload)
    // Cambia 'es' por el idioma que quieras usar
    const language = 'es'; 
    let filteredAnimes = res.filter(anime => anime.payload.language === language);

    // Selecciona un subconjunto aleatorio de animes filtrados
    let ult = filteredAnimes.sort(() => 0.5 - Math.random()).slice(0, 7);
    
    // Preparar los mensajes interactivos
    for (let result of ult) {
        HasumiBotFreeCodes.push({
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: `${result.name}`,
                hasMediaAttachment: true,
                imageMessage: await createImage(result.image_url)
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

    // Generar el mensaje de respuesta
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

    // Enviar el mensaje
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
} catch (error) {
    console.error(error);
}

// Definir el comando del handler
handler.command = ['animedl'];

export default handler;
    
