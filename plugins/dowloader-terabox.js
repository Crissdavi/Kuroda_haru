//codigo por papi DEPOOL
let handler = async (m, { conn, text }) => {
    if (!text) throw "❌ Ingresa una URL válida.";

    try {
        // Realizamos la solicitud al API
        let apiResponse = await fetch(`https://api.lyrax.net/api/dl/terabox?url=${text}&apikey=Tesina`);
        let api = await apiResponse.json();

        // Verificamos si la estructura del API es válida
        if (!api || !api.data || !api.data.media || !api.data.media['360p']) {
            throw "⚠️ No se pudo obtener los datos del video. Verifica la URL o intenta nuevamente.";
        }

        // Extraemos los datos necesarios
        let title = api.data.title || "video"; // Nombre del archivo o valor por defecto
        let link = api.data.media['360p']; // Enlace al video en 360p

        if (!link) throw "⚠️ El enlace del video no está disponible.";

        // Enviamos el video como documento
        await conn.sendMessage(m.chat, { 
            document: { url: link }, 
            mimetype: 'video/mp4', 
            fileName: `${title}.mp4`
        }, { quoted: m });

    } catch (err) {
        // Manejamos errores y mostramos un mensaje claro
        throw `❌ Error: ${err.message}`;
    }
};

handler.command = ['terabox'];
export default handler;