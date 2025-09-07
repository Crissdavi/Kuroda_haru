import fetch from 'node-fetch';

let handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!text) return conn.reply(m.chat, `❀ Ingresa el nombre de la canción o artista`, m);
    
    try {
        await conn.reply(m.chat, '🔍 *Buscando tu música...*', m);
        
        // Intentar con varias APIs alternativas
        const APIs = [
            `https://api.downloads.live/spotify/search?q=${encodeURIComponent(text)}`,
            `https://spotify-downloader-api.vercel.app/api/search?q=${encodeURIComponent(text)}`,
            `https://spotify23.p.rapidapi.com/search/?q=${encodeURIComponent(text)}&type=tracks&offset=0&limit=1`
        ];
        
        let success = false;
        
        for (let apiUrl of APIs) {
            try {
                const response = await fetch(apiUrl, {
                    headers: {
                        // Algunas APIs可能需要 headers
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                if (response.status === 200) {
                    const data = await response.json();
                    
                    // Diferentes APIs tienen diferentes estructuras de respuesta
                    let trackInfo;
                    if (data.tracks && data.tracks.length > 0) {
                        trackInfo = data.tracks[0];
                    } else if (data.result && data.result.length > 0) {
                        trackInfo = data.result[0];
                    } else if (data.tracks && data.tracks.items && data.tracks.items.length > 0) {
                        trackInfo = data.tracks.items[0];
                    } else {
                        continue; // Intentar con la siguiente API
                    }
                    
                    const artists = trackInfo.artists ? trackInfo.artists.map(artist => artist.name).join(', ') : (trackInfo.artists || 'N/A');
                    
                    const HS = `🎵 *Resultado encontrado:*\n\n- *Título:* ${trackInfo.name || trackInfo.title}\n- *Artista:* ${artists}\n- *Duración:* ${trackInfo.duration || 'N/A'}\n- *Popularidad:* ${trackInfo.popularity || 'N/A'}`;
                    
                    if (trackInfo.thumbnail || trackInfo.album?.images?.[0]?.url) {
                        await conn.sendFile(m.chat, trackInfo.thumbnail || trackInfo.album.images[0].url, 'spotify.jpg', HS, m);
                    } else {
                        await conn.reply(m.chat, HS, m);
                    }
                    
                    success = true;
                    break;
                }
            } catch (apiError) {
                console.error(`Error con API: ${apiUrl}`, apiError);
                continue;
            }
        }
        
        if (!success) {
            await conn.reply(m.chat, `❀ No se pudo conectar con los servicios de música. Intenta más tarde.\n🔗 Busca manualmente: https://open.spotify.com/search/${encodeURIComponent(text)}`, m);
        }
        
    } catch (error) {
        console.error(error);
        conn.reply(m.chat, `❀ Error al procesar tu solicitud. Intenta con otro nombre.`, m);
    }
}

handler.command = /^(spotify|music)$/i;
handler.help = ['spotify <búsqueda>'];
handler.tags = ['music'];

export default handler;