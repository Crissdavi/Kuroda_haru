import gplay from "google-play-scraper";

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, "*\`🪐 Ingresa el nombre de app que quieres buscar\`*", m);
  }
  
  let res = await gplay.search({ term: text });
  if (!res.length) {
    return conn.reply(m.chat, "*\`🪐 Por favor ingresa el nombre de una app de la Play Store\`*", m); 
  }

  let opt = {
    contextInfo: {
      externalAdReply: {
        title: res[0].title,
        body: res[0].summary,
        thumbnail: (await conn.getFile(res[0].icon)).data,
        sourceUrl: res[0].url,
      },
    },
  };

  res = res.map(
    (v) =>
      `*\`🪐 Resultado:\`* ${v.title}
       *\`✍️ Desarrollador:\`* ${v.developer}
       *\`💸 Precio:\`* ${v.priceText}
       *\`📈 Puntuacion:\`* ${v.scoreText}
       *\`⛓️ Link:\`* ${v.url}`
  ).join`\n\n`;

  conn.reply(m.chat, res, m, opt); 
};

handler.help = ['playstore', 'playstoresearch']; 
handler.tags = ['search'];
handler.command = /^(playstore|playstoresearch)$/i; 
export default handler;