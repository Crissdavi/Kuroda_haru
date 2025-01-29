let handler = async (m, { conn, text }) => {
    if (!text) throw "❌ Ingresa una URL válida.";

    try {
        // Hacemos la solicitud a la API
        const apiResponse = await fetch(`https://api.lyrax.net/api/dl/terabox?url=${text}&apikey=Tesina`);
        if (!apiResponse.ok) throw "❌ Error al conectar con la API. Verifica tu clave o URL.";
        
        const api = await apiResponse.json();

        // Validamos que la respuesta de la API sea correcta
        if (!api || !api.data || !api.data.media) {
            throw "⚠️ No se pudo obtener los datos del video. Verifica la URL.";
        }

        // Extraemos los datos necesarios con valores por defecto si no existen
        const title = api.data.title || "video"; // Nombre del archivo o valor predeterminado
        const link = api.data.media['360p']; // Enlace del video en 360p

        if (!link) throw "⚠️ No se pudo obtener el enlace del video. Intenta con otra URL.";

        // Enviamos el video como documento MP4
        await conn.sendMessage(m.chat, { 
            document: { url: link }, 
            mimetype: 'video/mp4', 
            fileName: `${title}.mp4`
        }, { quoted: m });

    } catch (err) {
        // Capturamos y mostramos errores claros
        throw `❌ Error: ${err.message || "Ocurrió un error desconocido."}`;
    }
};

handler.command = ['terabox'];
export default handler;