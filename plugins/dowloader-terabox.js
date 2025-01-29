import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
    if (!text) throw "❌ Por favor, ingresa una URL válida.";

    try {
        // Hacemos la solicitud a la API
        const apiResponse = await fetch(`https://api.lyrax.net/api/dl/terabox?url=${text}&apikey=Tesina`);
        if (!apiResponse.ok) {
            throw `❌ Error al conectarse a la API. Código de estado: ${apiResponse.status}`;
        }

        const api = await apiResponse.json();

        // Validamos que la respuesta tenga la estructura esperada
        if (!api || !api.data || !api.data.media || !api.data.media['360p']) {
            throw "⚠️ No se pudieron obtener los datos del video. Verifica la URL o inténtalo nuevamente.";
        }

        // Extraemos la información necesaria
        const title = api.data.title || "video"; // Título del archivo
        const link = api.data.media['360p']; // Enlace del video en 360p

        if (!link) throw "⚠️ No se encontró el enlace del video.";

        // Enviamos el video como documento MP4
        await conn.sendMessage(m.chat, {
            document: { url: link }, // Enlace al video
            mimetype: 'video/mp4', // Tipo MIME
            fileName: `${title}.mp4` // Nombre del archivo
        }, { quoted: m });

    } catch (err) {
        // Mostramos cualquier error que ocurra
        console.error("Error en el handler:", err);
        throw `❌ Error: ${err.message || "Ocurrió un error desconocido."}`;
    }
};

handler.command = ['terabox'];
export default handler;