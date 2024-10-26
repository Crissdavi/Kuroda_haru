import fetch from 'node-fetch';
import Starlights from '@StarlightsTeam/Scraper';
import { getDevice } from '@whiskeysockets/baileys';

let handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, 'Ingresa el texto de lo que quieras buscar', m, rcanal);

  await m.react('🕓'); 

  const deviceType = await getDevice(m.key.id);
  try {
    let results = await Starlights.spotifySearch(text);
    if (!results || results.length === 0) return conn.reply(m.chat, 'No se encontraron resultados', m);

    
    const firstTrack = results[0];

    
    let listSections = [];
    let txt = '*S P O T I F Y - S E A R C H* \n';
    txt += `*✨ Primer Resultado:*\n`;
    txt += `*🎵 Título:* ${firstTrack.title}\n`;
    txt += `*🎤 Artista:* ${firstTrack.artist}\n`;
    txt += `*💬 Url:* ${firstTrack.url}\n\n`;
    
    for (let i = 1; i < (results.length >= 30 ? 30 : results.length); i++) {
      const track = results[i];
      listSections.push({
        title: `Canción Nro ${i + 1}`,
        rows: [
          {
            header: '',
            title: `${track.title}\n`,
            description: `Artista: ${track.artist}`,
            id: `${usedPrefix}spotifydl ${track.url}`
          }
        ]
      });
    }

    
    await conn.sendList(m.chat, txt + '* Tema kuroda*', '', 'Mas Resultados', 'https://qu.ax/fPmDc.jpg', listSections, m);
    await m.react('✅'); 
  } catch (error) {
    console.error(error);
    await m.react('❌'); 
  }
}

handler.help = ['spotifysearch *<búsqueda>*'];
handler.tags = ['search'];
handler.command = ['spotifysearch'];
handler.register = true;

export default handler;
