import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
import yts from 'yt-search';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuración
const DOWNLOAD_DIR = './tmp';

// Crear directorio si no existe
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) throw `🎵 *Falta el nombre de la canción*\n\n📌 *Ejemplo:*\n• ${usedPrefix}${command} Billie Jean\n• ${usedPrefix}${command} Bohemian Rhapsody - Queen`;

    try {
        // Mensaje de espera
        let waitMessage = await m.reply('🔍 *Buscando en YouTube Music...*\n⏳ *Esto puede tomar de 10-20 segundos*');

        // Buscar y descargar
        const [audioPath, songInfo] = await searchAndDownloadYouTubeMusic(text);
        
        if (!audioPath || !fs.existsSync(audioPath)) {
            await conn.editMessage(m.chat, { 
                text: '❌ *No se pudo encontrar la música*\n\n💡 *Sugerencias:*\n• Intenta con un nombre más específico\n• Incluye el artista\n• Prueba con otra canción',
                mentions: []
            }, waitMessage);
            return;
        }

        // Verificar tamaño del archivo
        const stats = fs.statSync(audioPath);
        const fileSize = (stats.size / (1024 * 1024)).toFixed(2);

        if (parseFloat(fileSize) > 15) {
            await conn.editMessage(m.chat, { 
                text: `❌ *Archivo demasiado grande (${fileSize}MB)*\nEl límite de WhatsApp es 15MB`,
                mentions: []
            }, waitMessage);
            fs.unlinkSync(audioPath);
            return;
        }

        // Leer y enviar el audio
        const audioBuffer = fs.readFileSync(audioPath);
        
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${cleanFileName(songInfo.title)}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: songInfo.title || 'Audio Descargado',
                    body: songInfo.artist || 'YouTube Music',
                    thumbnailUrl: songInfo.thumbnail,
                    mediaType: 2,
                    sourceUrl: songInfo.url
                }
            }
        }, { quoted: m });

        // Eliminar archivo temporal
        setTimeout(() => {
            if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath);
            }
        }, 5000);

        // Mensaje de éxito
        await conn.editMessage(m.chat, { 
            text: `✅ *${songInfo.title}* enviada correctamente\n🎤 *Artista:* ${songInfo.artist}\n⏱️ *Duración:* ${songInfo.duration}\n📦 *Tamaño:* ${fileSize}MB`,
            mentions: []
        }, waitMessage);

    } catch (error) {
        console.error('Error general:', error);
        m.reply('❌ *Error al procesar tu solicitud*\n💡 Intenta con otro nombre o más tarde');
    }
};

// Función principal para buscar y descargar
async function searchAndDownloadYouTubeMusic(query) {
    try {
        console.log(`🔍 Buscando: ${query}`);
        
        // Paso 1: Buscar con yt-search (que ya tienes instalado)
        const searchResults = await yts(`${query} official audio`);
        if (!searchResults || searchResults.videos.length === 0) {
            throw new Error('No se encontraron resultados');
        }

        const firstResult = searchResults.videos[0];
        const videoUrl = firstResult.url;
        
        console.log(`✅ Encontrado: ${firstResult.title} - ${firstResult.author.name}`);

        // Paso 2: Descargar usando @bochilteam/scraper (que ya tienes)
        const outputPath = `${DOWNLOAD_DIR}/${Date.now()}_${firstResult.videoId}.mp3`;
        await downloadAudio(videoUrl, outputPath);

        return [outputPath, {
            title: firstResult.title,
            artist: firstResult.author.name,
            thumbnail: firstResult.thumbnail,
            url: videoUrl,
            duration: firstResult.timestamp
        }];

    } catch (error) {
        console.error('Error en searchAndDownloadYouTubeMusic:', error);
        throw error;
    }
}

// Descargar audio usando @bochilteam/scraper
async function downloadAudio(url, outputPath) {
    try {
        console.log(`⬇️ Descargando: ${url}`);
        
        // Usar @bochilteam/scraper que ya tienes instalado
        let yt;
        try {
            yt = await youtubedl(url);
        } catch (e) {
            yt = await youtubedlv2(url);
        }

        // Obtener el stream de audio
        const audioStream = await yt.audio['128kbps'].download();
        
        // Guardar a archivo
        const writeStream = fs.createWriteStream(outputPath);
        audioStream.pipe(writeStream);
        
        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                console.log(`✅ Descarga completada: ${outputPath}`);
                resolve(outputPath);
            });
            writeStream.on('error', reject);
        });
        
    } catch (error) {
        console.error('Error en downloadAudio:', error);
        
        // Fallback: usar ytdl-mp3 que también tienes
        try {
            console.log('🔄 Intentando con ytdl-mp3 como fallback...');
            const { ytdlMp3 } = await import('ytdl-mp3');
            await ytdlMp3(url, { output: outputPath });
            
            if (fs.existsSync(outputPath)) {
                return outputPath;
            }
        } catch (fallbackError) {
            console.error('Error en fallback ytdl-mp3:', fallbackError);
        }
        
        throw new Error('Error al descargar el audio');
    }
}

// Limpiar nombre de archivo
function cleanFileName(name) {
    return name.replace(/[^\w\sáéíóúñÁÉÍÓÚÑ]/gi, '').substring(0, 50);
}

handler.command = /^(play|music|musica|song|cancion|ytmusic)$/i;
handler.help = ['play <nombre de canción>', 'music <nombre de canción>'];
handler.tags = ['music'];
handler.premium = false;

export default handler;