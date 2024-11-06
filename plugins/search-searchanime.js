import axios from 'axios';
const { generateWAMessageContent } = (await import('@whiskeysockets/baileys')).default;

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Ingresa el texto de lo que quieres buscar');

    async function createImage(url) {
        const { imageMessage } = await generateWAMessageContent({ image: { url } }, { upload: conn.waUploadToServer });
        return imageMessage;
    }

    try {
        let { data } = await axios.get(`https://deliriussapi-oficial.vercel.app/anime/animesearch?query=${encodeURIComponent(text)}`);
        let res = data.data.sort(() => 0.5 - Math.random()).slice(0, 7);

        for (let result of res) {
            const imageMessage = await createImage(result.image_url);
            const textMessage = `
*Tipo:* ${result.payload.media_type}
*Año de inicio:* ${result.payload.start_year}
*Emitido:* ${result.payload.aired}
*Puntuación:* ${result.payload.score}
*Estado:* ${result.payload.status}
*Vistas:* ${result.views}`;

            await conn.sendMessage(m.chat, { text: textMessage }, { quoted: m });
            await conn.sendMessage(m.chat, imageMessage, { quoted: m });
        }
    } catch (error) {
        console.error(error);
        m.reply('Ocurrió un error al buscar las imágenes.');
    }
}

handler.command = ['anime'];

export default handler;

