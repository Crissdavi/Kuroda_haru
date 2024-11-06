import axios from 'axios';
const { proto, generateWAMessageContent } = (await import('@whiskeysockets/baileys')).default;

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Ingresa el texto de lo que quieres buscar');

    async function createImage(url) {
        const { imageMessage } = await generateWAMessageContent({ image: { url } }, { upload: conn.waUploadToServer });
        return imageMessage;
    }

    try {
        let { data } = await axios.get(`https://deliriussapi-oficial.vercel.app/anime/animesearch?query=${encodeURIComponent(text)}`);
        let res = data.data;
        let ult = res.sort(() => 0.5 - Math.random()).slice(0, 7);

        // Enviar texto e imagen de la URL
        for (let result of ult) {
            const imageMessage = await createImage(result.image_url);

            // Enviar texto con la información del anime
            const textMessage = `
*Nombre:* ${result.name}
*Tipo:* ${result.payload.media_type}
*Año de inicio:* ${result.payload.start_year}
*Emitido:* ${result.payload.aired}
*Puntuación:* ${result.payload.score}
*Estado:* ${result.payload.status}
*Vistas:* ${result.views}
*Imagen:* ${result.image_url}`;

            // Enviar el texto primero
            await conn.sendMessage(m.chat, { text: textMessage }, { quoted: m });
            // Luego, enviar la imagen
            await conn.sendMessage(m.chat, imageMessage, { quoted: m });
        }
    } catch (error) {
        console.error(error);
        m.reply('Ocurrió un error al buscar la imagen.');
    }
}

handler.command = ['anime'];

export default handler;
