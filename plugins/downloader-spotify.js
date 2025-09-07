import fetch from 'node-fetch';

let handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!text) return conn.reply(m.chat, `❀ Ingresa el nombre de la canción o artista que quieres buscar`, m);
    
    try {
        // Mensaje de espera
        await conn.reply(m.chat, '🔍 *Buscando en Spotify...*', m);
        
        // Usar una API alternativa funcional
        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(text)}&type=track&limit=1`;
        
        // Necesitarías un token de acceso para la API oficial de Spotify
        // Como alternativa, usemos una API pública que no requiera autenticación
        try {
            // Primero intentamos con una API pública alternativa
            const publicApiResponse = await fetch(`https://api.downloads.live/spotify/search?q=${encodeURIComponent(text)}`);
            
            if (publicApiResponse.status !== 200) {
                throw new Error('API pública no disponible');
            }
            
            const data = await publicApiResponse.json();
            
            if (!data || !data.tracks || data.tracks.length === 0) {
                return conn.reply(m.chat, `❀ No se encontraron resultados para "${text}"`, m);
            }
            
            const track = data.tracks[0];
            const HS = `❀ *Resultado de Spotify:*\n\n- *Título:* ${track.name}\n- *Artista:* ${track.artists}\n- *Duración:* ${track.duration}\n- *Enlace:* ${track.url}`;
            
            // Enviar información de la canción
            await conn.sendFile(m.chat, track.thumbnail, 'spotify.jpg', HS, m);
            
            // Para descargar la canción, necesitaríamos otro endpoint
            conn.reply(m.chat, '⚠️ La descarga directa requiere configuración adicional. Usa /spotifydl para descargar.', m);
            
        } catch (publicApiError) {
            console.error('Error con API pública:', publicApiError);
            
            // Fallback: mostrar información básica sin descarga
            const fallbackMessage = `🎵 *Resultado para:* ${text}\n\nℹ️ El servicio de descarga temporalmente no está disponible.\n📋 Puedes buscar manualmente en: https://open.spotify.com/search/${encodeURIComponent(text)}`;
            await conn.reply(m.chat, fallbackMessage, m);
        }
        
    } catch (error) {
        console.error(error);
        conn.reply(m.chat, `❀ Ocurrió un error al buscar. Intenta con otro nombre o más tarde.`, m);
    }
}

handler.command = /^(spotify|spotifysearch)$/i;
handler.help = ['spotify <búsqueda>', 'spotifysearch <búsqueda>'];
handler.tags = ['music'];
handler.premium = false;

export default handler;