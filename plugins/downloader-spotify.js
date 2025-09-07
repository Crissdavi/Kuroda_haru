import fetch from 'node-fetch';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear directorio temporal si no existe
if (!fs.existsSync('./tmp')) {
    fs.mkdirSync('./tmp');
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) throw `❌ *Falta el nombre de la canción*\n\n📌 *Ejemplo:*\n• ${usedPrefix}${command} Billie Jean\n• ${usedPrefix}${command} Bohemian Rhapsody`;

    try {
        // Mensaje de espera
        let waitMessage = await m.reply('🔍 *Buscando música en fuentes alternativas...*\n⏳ Esto puede tomar unos segundos');
        
        let audioBuffer;
        let songInfo;
        
        // Intentar con diferentes APIs
        try {
            [audioBuffer, songInfo] = await downloadFromDeezer(text);
        } catch (e) {
            console.log('Deezer falló, intentando con SoundCloud...');
            [audioBuffer, songInfo] = await downloadFromSoundCloud(text);
        }

        if (!audioBuffer) {
            await conn.editMessage(m.chat, { 
                text: '❌ *No se pudo encontrar la música*\n\n💡 *Sugerencias:*\n• Intenta con un nombre más específico\n• Prueba con otro artista\n• Verifica tu conexión a internet',
                mentions: []
            }, waitMessage);
            return;
        }

        // Enviar el audio con metadatos
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${songInfo.title || 'audio'}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: songInfo.title || 'Audio Descargado',
                    body: songInfo.artist || 'Música',
                    thumbnailUrl: songInfo.thumbnail,
                    mediaType: 2,
                    sourceUrl: songInfo.url || 'https://deezer.com'
                }
            }
        }, { quoted: m });

        // Editar mensaje de espera para indicar éxito
        await conn.editMessage(m.chat, { 
            text: '✅ *Música encontrada y enviada correctamente*',
            mentions: []
        }, waitMessage);

    } catch (error) {
        console.error('Error en el handler:', error);
        m.reply('❌ *Ocurrió un error al procesar tu solicitud*\n\n🔗 *Puedes intentar con:*\n• Un nombre diferente de canción\n• Más tarde');
    }
};

// Función para descargar desde Deezer
async function downloadFromDeezer(query) {
    try {
        // Buscar en Deezer
        const searchResponse = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`);
        const searchData = await searchResponse.json();
        
        if (!searchData.data || searchData.data.length === 0) {
            throw new Error('No se encontraron resultados en Deezer');
        }
        
        const track = searchData.data[0];
        const songInfo = {
            title: track.title,
            artist: track.artist.name,
            thumbnail: track.album.cover_big,
            url: track.link,
            duration: track.duration
        };
        
        // Intentar descargar usando API alternativa para Deezer
        const downloadResponse = await fetch(`https://api.deezer.page/download.php?url=${encodeURIComponent(track.link)}`);
        
        if (!downloadResponse.ok) {
            throw new Error('Error al descargar de Deezer');
        }
        
        const audioBuffer = await downloadResponse.buffer();
        return [audioBuffer, songInfo];
        
    } catch (error) {
        console.error('Error con Deezer:', error);
        throw error;
    }
}

// Función para descargar desde SoundCloud
async function downloadFromSoundCloud(query) {
    try {
        // Buscar en SoundCloud (API no oficial)
        const searchResponse = await fetch(`https://api.soundcloud.com/search/tracks?q=${encodeURIComponent(query)}&client_id=YOUR_CLIENT_ID&limit=1`);
        
        // Si no tenemos client_id, usar un proxy
        if (searchResponse.status === 401) {
            const alternativeSearch = await fetch(`https://soundcloud-api.vercel.app/search?q=${encodeURIComponent(query)}`);
            const searchData = await alternativeSearch.json();
            
            if (!searchData || !searchData[0]) {
                throw new Error('No se encontraron resultados en SoundCloud');
            }
            
            const track = searchData[0];
            const songInfo = {
                title: track.title,
                artist: track.user.username,
                thumbnail: track.artwork_url,
                url: track.permalink_url,
                duration: track.duration
            };
            
            // Descargar usando API alternativa
            const downloadResponse = await fetch(`https://soundcloud-downloader.vercel.app/download?url=${encodeURIComponent(track.permalink_url)}`);
            const downloadData = await downloadResponse.json();
            
            if (!downloadData.downloadUrl) {
                throw new Error('Error al obtener enlace de descarga');
            }
            
            const audioResponse = await fetch(downloadData.downloadUrl);
            const audioBuffer = await audioResponse.buffer();
            
            return [audioBuffer, songInfo];
        }
        
        const searchData = await searchResponse.json();
        
        if (!searchData || !searchData[0]) {
            throw new Error('No se encontraron resultados en SoundCloud');
        }
        
        const track = searchData[0];
        const songInfo = {
            title: track.title,
            artist: track.user.username,
            thumbnail: track.artwork_url,
            url: track.permalink_url,
            duration: track.duration
        };
        
        // Descargar track
        const downloadResponse = await fetch(`https://api.soundcloud.com/tracks/${track.id}/download?client_id=YOUR_CLIENT_ID`);
        
        if (!downloadResponse.ok) {
            // Intentar con stream URL
            const streamResponse = await fetch(track.stream_url + '?client_id=YOUR_CLIENT_ID');
            if (!streamResponse.ok) {
                throw new Error('Error al descargar de SoundCloud');
            }
            
            const audioBuffer = await streamResponse.buffer();
            return [audioBuffer, songInfo];
        }
        
        const audioBuffer = await downloadResponse.buffer();
        return [audioBuffer, songInfo];
        
    } catch (error) {
        console.error('Error con SoundCloud:', error);
        throw error;
    }
}

// Función alternativa usando APIs de descarga genéricas
async function downloadFromGenericAPI(query) {
    try {
        // API 1: MusicDownloadAPI
        const api1Response = await fetch(`https://music-download-api.vercel.app/search?q=${encodeURIComponent(query)}`);
        const api1Data = await api1Response.json();
        
        if (api1Data && api1Data.url) {
            const audioResponse = await fetch(api1Data.url);
            const audioBuffer = await audioResponse.buffer();
            
            return [audioBuffer, {
                title: api1Data.title || query,
                artist: api1Data.artist || 'Desconocido',
                thumbnail: api1Data.thumbnail || 'https://cdn.pixabay.com/photo/2017/11/07/00/22/music-2925274_960_720.png',
                url: api1Data.url
            }];
        }
        
        // API 2: FreeMusicArchive (solo música libre de derechos)
        const api2Response = await fetch(`https://freemusicarchive.org/api/trackSearch?q=${encodeURIComponent(query)}&limit=1`);
        const api2Data = await api2Response.json();
        
        if (api2Data && api2Data.aTracks && api2Data.aTracks[0]) {
            const track = api2Data.aTracks[0];
            const audioResponse = await fetch(track.trackURL);
            const audioBuffer = await audioResponse.buffer();
            
            return [audioBuffer, {
                title: track.trackTitle,
                artist: track.artistName,
                thumbnail: track.albumImage,
                url: track.trackURL
            }];
        }
        
        throw new Error('No se encontraron resultados en las APIs genéricas');
        
    } catch (error) {
        console.error('Error con APIs genéricas:', error);
        throw error;
    }
}

handler.command = /^(music|musica|song|cancion|deezer|soundcloud)$/i;
handler.help = ['music <nombre de canción>', 'musica <nombre de canción>'];
handler.tags = ['music'];
handler.premium = false;

export default handler;