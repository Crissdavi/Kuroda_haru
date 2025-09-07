import fetch from 'node-fetch';

let handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!text) return conn.reply(m.chat, `❀ Ingresa el texto de lo que quieras buscar en Spotify`, m);
    
    try {
        // Primero intentamos con la API original
        let apiSearch = await fetch(`https://api.vreden.web.id/api/spotifysearch?query=${encodeURIComponent(text)}`);
        
        if (apiSearch.status !== 200) {
            throw new Error('API principal no disponible');
        }
        
        let jsonSearch = await apiSearch.json();
        
        // Verificar si hay resultados
        if (!jsonSearch.result || jsonSearch.result.length === 0) {
            return conn.reply(m.chat, `❀ No se encontraron resultados para "${text}"`, m);
        }
        
        let { popularity, url } = jsonSearch.result[0];
        let apiDL = await fetch(`https://api.vreden.web.id/api/spotify?url=${encodeURIComponent(url)}`);
        let jsonDL = await apiDL.json();
        
        // Verificar respuesta de la API
        if (!jsonDL.result || !jsonDL.result.result) {
            return conn.reply(m.chat, `❀ Error al obtener los detalles de la canción`, m);
        }
        
        let { title, artists, cover, music } = jsonDL.result.result;
        
        // Crear mensaje
        let HS = `❀ *Resultado de Spotify:*\n\n- *Título:* ${title}\n- *Artista:* ${artists}\n- *Popularidad:* ${popularity}\n- *Enlace:* ${url}`;
        
        // Enviar imagen de portada
        await conn.sendFile(m.chat, cover, 'spotify_cover.jpg', HS, m);
        
        // Enviar audio
        await conn.sendFile(m.chat, music, `${title}.mp3`, null, m, null, { mimetype: 'audio/mp4' });
        
    } catch (error) {
        console.error('Error con API principal:', error);
        // Si falla la API principal, intentamos con API alternativa
        await tryAlternativeAPI(m, conn, text);
    }
}

// Función para intentar con API alternativa
async function tryAlternativeAPI(m, conn, text) {
    try {
        conn.reply(m.chat, 'Buscando en API alternativa...', m);
        
        // API alternativa - ejemplo con otra API de búsqueda de música
        // NOTA: Necesitarías conseguir una API key para muchos de estos servicios
        let alternativeSearch = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(text)}&limit=1`);
        let jsonAlt = await alternativeSearch.json();
        
        if (!jsonAlt.data || jsonAlt.data.length === 0) {
            return conn.reply(m.chat, `❀ No se encontraron resultados para "${text}" en la API alternativa`, m);
        }
        
        let track = jsonAlt.data[0];
        let HS = `❀ *Resultado alternativo:*\n\n- *Título:* ${track.title}\n- *Artista:* ${track.artist.name}\n- *Álbum:* ${track.album.title}\n- *Enlace:* ${track.link}`;
        
        // Enviar imagen de portada
        await conn.sendFile(m.chat, track.album.cover_big, 'album_cover.jpg', HS, m);
        
        // Para Deezer necesitarías otra API para descargar el audio
        conn.reply(m.chat, 'ℹ️ Para descargar la canción, necesitas configurar una API de descarga compatible', m);
        
    } catch (altError) {
        console.error('Error con API alternativa:', altError);
        conn.reply(m.chat, `❀ Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente más tarde.`, m);
    }
}

handler.command = /^(spotify|music)$/i;
handler.help = ['spotify <búsqueda>'];
handler.tags = ['music'];

export default handler;