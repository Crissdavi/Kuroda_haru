let handler = async (m, { conn, text }) => {
    if (!text) throw "Ingresa una URL";

    try {
        let apiResponse = await fetch(`https://api.lyrax.net/api/dl/terabox?url=${text}&apikey=Tesina`);
        let api = await apiResponse.json();

        if (!api.data) {
            throw "No se pudo obtener el enlace del video.";
        }

        let { filename, dl, size } = api.data

        await conn.sendFile(m.chat, dl, `${filename}.mp4`, `## ${filename} - ${size}`, m);
    } catch (err) {
        throw `Error: ${err.message}`;
    }
};

handler.command = ['terabox'];
export default handler;