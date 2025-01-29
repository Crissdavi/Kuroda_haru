let handler = async (m, { conn, text }) => {
    if (!text) throw "❌ Ingresa una URL válida.";

    try {
        // Realizamos la solicitud al API
        let apiResponse = await fetch(`https://api.lyrax.net/api/dl/terabox?url=${text}&apikey=Tesina`);
        let api = await apiResponse.json();

        // Validamos si la respuesta del API contiene los datos esperados
        if (!api.data || !api.data.media || !api.data.media['360p']) {
            throw "⚠️ No se pudo obtener el enlace del video. Verifica la URL.";
        }

        // Extraemos los datos del API
        let { title } = api.data;
        let link = api.data.media['360p'];

        // Aseguramos que las variables estén definidas
        if (!title) title = "video";
        if (!link) throw "⚠️ El enlace del video no está disponible.";

        // Enviamos el archivo como documento
        await conn.sendMessage(m.chat, { 
            document: { url: link }, 
            mimetype: 'video/mp4', 
            fileName: `${title}.mp4`
        }, { quoted: m });

    } catch (err) {
        // Capturamos cualquier error y mostramos un mensaje claro
        throw `❌ Error: ${err.message}`;
    }
};

handler.command = ['terabox'];
export default handler;