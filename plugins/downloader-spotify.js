import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) throw `❌ *Falta el nombre de la canción*\n📌 Ejemplo: ${usedPrefix}${command} Billie Jean`;
    
    try {
        let response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(text)}&limit=1`);
        let data = await response.json();
        
        if (!data.data || data.data.length === 0) throw 'No se encontraron resultados';
        
        let track = data.data[0];
        let message = `🎵 *Resultado encontrado:*\n\n` +
                     `▢ *Título:* ${track.title}\n` +
                     `▢ *Artista:* ${track.artist.name}\n` +
                     `▢ *Álbum:* ${track.album.title}\n` +
                     `▢ *Duración:* ${Math.floor(track.duration / 60)}:${track.duration % 60 < 10 ? '0' : ''}${track.duration % 60}\n` +
                     `▢ *Enlace:* ${track.link}`;
        
        await conn.sendMessage(m.chat, {
            image: { url: track.album.cover_big },
            caption: message,
            mentions: []
        }, { quoted: m });
        
    } catch (error) {
        console.error(error);
        m.reply('❌ *Error al buscar la canción*\n🔗 Búsqueda manual: https://open.spotify.com/search/' + encodeURIComponent(text));
    }
}

handler.command = /^(spotify|music)$/i;
handler.help = ['spotify <búsqueda>'];
handler.tags = ['music'];

export default handler;