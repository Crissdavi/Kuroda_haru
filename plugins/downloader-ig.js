import { igdl } from 'ruhend-scraper';

const handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `Ingrese la url del vídeo porfavor`, m, null, rcanal);
  }

  try {
    await m.react('📼');
    const res = await igdl(args[0]);
    const data = res.data;

    for (let media of data) {
      await conn.sendFile(m.chat, media.url, 'instagram.mp4',`Listl`, m, null, rcanal);
    await m.react('🐢');
    }
  } catch (e) {
    return conn.reply(m.chat, `Perdon, ocurrio un error en la entrega de su video`, m);
    await m.react('🫤');
  }
};

handler.command = ['instagram', 'ig'];
handler.tags = ['descargas'];
handler.help = ['instagram', 'ig'];
handler.group = true;
handler.zenis = 2;

export default handler;