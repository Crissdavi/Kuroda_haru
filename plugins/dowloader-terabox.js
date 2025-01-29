let handler = async (m, { conn, text }) => {
    if (!text) throw "Ingresa una URL";

    try {
        let apiResponse = await fetch(`https://api.lyrax.net/api/dl/terabox?url=${text}&apikey=Tesina`);
        let api = await apiResponse.json();

        if (!api.data || !api.data.media || !api.data.media['360p']) {
            throw "No se pudo obtener el enlace del video.";
        }

        let { title, image } = api.data;
        let link = api.data.media['360p'];
        let filename = title || "video";

        await conn.sendFile(m.chat, link, `${filename}.mp4`, title, m);
    } catch (err) {
        throw `Error: ${err.message}`;
    }
};

handler.tag = ['terabox']
handler.command = ['terabox'];
export default handler;