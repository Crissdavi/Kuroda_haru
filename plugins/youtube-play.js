
*Contenido del plugin "youtube-play":*

import fetch from 'node-fetch';
import yts from 'yt-search';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

let handler = async (m, { conn: star, command, args, text, usedPrefix }) => {
  if (args.length < 2) {
    let errorMsg = `「✦」Error: *No ingresaste un formato o título.*\n\n` +
                   `> ✐ *Por favor, ingresa el formato (mp3, mp4, etc.) seguido del título de la canción.*\n\n` +
                   `Ejemplo:\n> *${usedPrefix + command}* mp3 Minecraft relax soundtrack`;
    return star.reply(m.chat, errorMsg, m);
  }

  let format = args[0].toLowerCase(); 
  let query = args.slice(1).join(" ");

  if (!['mp3', 'mp4', 'mp3doc', 'mp4doc', 'vn', 'vc'].includes(format)) {
    let errorMsg = `「✦」Error: *Formato inválido.*\n\n` +
                   `> ✐ Los formatos válidos son: mp3, mp4, mp3doc, mp4doc, vn, vc.\n\n> Ejemplo\n\n> *.play* mp3 mía khalifa`;
    return star.reply(m.chat, errorMsg, m);
  }

  await m.react('⌛');

  try {
    let res = await yts.search({ query, hl: "es", gl: "ES" });
    if (!res.videos || res.videos.length === 0) return star.reply(m.chat, '*✐ No se encontraron resultados para tu búsqueda.*', m);

    let video = res.videos[0];
    let info = `「✦」*${command === 'playaudio' ? 'Audio' : 'Video'} de YouTube descargado* \n\n` +
               `> ✐ *Título:* ${video.title}\n` +
               `> ✐ *Canal:* ${video.author.name || 'Desconocido'}\n` +
               `> ✐ *Duración:* ${Math.floor(video.duration.seconds / 60)}m ${video.duration.seconds % 60}s\n` +
               `> ✐ *Calidad:* 1080p\n` +
               `> ✐ *Tamaño estimado:* 102MB\n` +
               `> ✐ *Link:* https://youtu.be/${video.videoId}\n`;

    await star.sendMessage(m.chat, { image: { url: video.image }, caption: info }, { quoted: m });

    const downloadUrl = `https://api-rin-tohsaka.vercel.app/download/${command === 'playaudio' ? 'ytmp3' : 'ytmp4'}?url=https://youtu.be/${video.videoId}`;
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      await m.react('✖️');
      return star.reply(m.chat, `Error, motivo: "La API devolvió un código HTTP ${response.status}"`, m);
    }

    const buffer = await response.buffer();
    const fileSize = parseInt(response.headers.get('content-length')) || buffer.length;

    if (fileSize > 200 * 1024 * 1024) {
      await m.react('✖️');
      return star.reply(m.chat, `「✦」Error: *El archivo supera el límite de 100 MB.*\n\nPor favor, intenta con otro archivo más pequeño.`, m);
    }

    const filePath = path.join('/tmp', `${video.videoId}.${command === 'playaudio' ? 'mp3' : 'mp4'}`);
    fs.writeFileSync(filePath, buffer);

    if (!fs.existsSync(filePath)) {
      await m.react('✖️');
      return star.reply(m.chat, 'Error: No se pudo guardar el archivo correctamente.', m);
    }

    if (fs.statSync(filePath).size === 0) {
      await m.react('✖️');
      return star.reply(m.chat, 'Error: El archivo descargado está vacío.', m);
    }

    let convertedFilePath;
    if (format === 'mp3') {
      convertedFilePath = filePath;
    } else if (format === 'mp3doc') {
      convertedFilePath = path.join('/tmp', `${video.videoId}.mp3`);
      fs.renameSync(filePath, convertedFilePath);
    } else if (format === 'mp4') {
      convertedFilePath = filePath;
    } else if (format === 'mp4doc') {
      convertedFilePath = path.join('/tmp', `${video.videoId}.mp4`);
      fs.renameSync(filePath, convertedFilePath);
    } else if (format === 'vn') {
      convertedFilePath = path.join('/tmp', `${video.videoId}.opus`);
      await new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .audioCodec('libopus')
          .toFormat('opus')
          .on('end', resolve)
          .on('error', reject)
          .save(convertedFilePath);
      });
      fs.unlinkSync(filePath);
    } else if (format === 'vc') {
      convertedFilePath = path.join('/tmp', `${video.videoId}.opus`);
      await new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .audioCodec('libopus')
          .toFormat('opus')
          .on('end', resolve)
          .on('error', reject)
          .save(convertedFilePath);
      });
      fs.unlinkSync(filePath);
    }

    setTimeout(async () => {
      if (format === 'vn' || format === 'vc') {
        await star.sendMessage(
          m.chat,
          { audio: { url: convertedFilePath }, mimetype: 'audio/ogg; codecs=opus', ptt: format === 'vc' },
          { quoted: m }
        );
        fs.unlinkSync(convertedFilePath);
      } else if (format === 'mp3doc' || format === 'mp4doc') {
        await star.sendMessage(
          m.chat,
          { document: { url: convertedFilePath }, mimetype: format === 'mp4doc' ? 'video/mp4' : 'audio/mpeg' },
          { quoted: m }
        );
        fs.unlinkSync(convertedFilePath);
      } else {
        if (format === 'mp3' || format === 'mp4') {
          await star.sendMessage(
            m.chat,
            { [format === 'mp3' ? 'audio' : 'video']: { url: convertedFilePath }, mimetype: format === 'mp3' ? 'audio/mpeg' : 'video/mp4' },
            { quoted: m }
          );
          fs.unlinkSync(convertedFilePath);
        }
      }

      await m.react('✅');
    }, 3000);

  } catch (error) {
    await m.react('✖️');
    await star.reply(m.chat, `Error, motivo: "${error.message}"`, m);
  }
};

handler.help = ['playtest *<formato> <búsqueda>*'];
handler.tags = ['downloader'];
handler.command = ['play'];

export default handler;




Solo dame creditos