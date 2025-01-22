import fg from 'api-dylux';

let handler = async (m, { conn, text, isPrems, isOwner, usedPrefix, command, args }) => {
   if (!args[0]) throw `Ingresa la URL o título de un video de Xvideos.`;

   const isUrl = (url) => {
      const regex = /^https?:\/\/(www\.)?xvideos\.com\/.+$/i;
      return regex.test(url);
   };

   if (command === 'xvideos') {
      let text = args[0];
      const results = await fg.xvideosSearch(text);
      const limit = results.slice(0, 10);
      const messages = limit.map(video => [
         `## *${video.title}*\n## *Duración:* ${video.duration}`,
         '',
         video.thumb,
         [
            ['⬇️ Descargar', `.xvid ${video.url}`]
         ],
         [],
         [
            //['🔗 Ver video', video.url]
         ]
      ]);

      await conn.sendCarousel(m.chat, null, null, null, messages);

   } else if (command === 'xvideosdl' || command === 'xvid') {
      let text = args[0];
      if (!isUrl(text)) throw `Por favor, ingresa una URL válida de Xvideos.`;

      let vid = await fg.xvideosdl(text);
      let { title, views, vote, likes, deslikes, size, url_dl, thumb } = vid;
      let texto = `
## Titulo: \`${title}\`

-👁️ \`Vistas\`: ${views}
-👍 \`Likes\`: ${likes}
-👎 \`DesLikes\`: ${deslikes}
-📦 \`Peso\`: ${size}
-🗳️ \`Votos\`: ${vote}
`;

      await conn.sendFile(m.chat, thumb, title + '.mp4', texto, m);
      await conn.sendMessage(m.chat, { video: { url: url_dl }, caption: wm }, { quoted: m });

   } else {
      throw `Comando no reconocido.`;
   }
};

handler.help = ['xvideocar', 'xvideoscar'];
handler.tags = ['search'];
handler.command = ['xvideoscar', 'xvideocar', 'xvidcar'];
handler.register = true
handler.group = true

export default handler;