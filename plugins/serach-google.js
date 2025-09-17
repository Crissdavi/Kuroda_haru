import axios from 'axios';

let handler = async (m, { conn, command, args, usedPrefix }) => {
  const text = args.join` `;
  if (!text) return conn.reply(m.chat, '🚩 Ingresa lo que deseas buscar junto al comando.', m);
  
  await m.react('🕓');
  
  try {
    const response = await axios.get(`https://api.delirius.store/search/googlesearch?query=${encodeURIComponent(text)}`);
    const results = response.data;
    
    if (!results || results.length === 0) {
      return conn.reply(m.chat, '❌ No se encontraron resultados para tu búsqueda.', m);
    }
    
    let teks = `\t\t\t*乂  S E A R C H  -  G O O G L E*\n\n`;
    
    for (let g of results.slice(0, 5)) { // Limitar a 5 resultados
      teks += `*${g.title || 'Sin título'}*\n`;
      teks += `${g.link || 'Sin enlace'}\n`;
      teks += `${g.snippet || 'Sin descripción'}\n\n`;
    }
    
    const img = 'https://i.ibb.co/P5kZNFF/file.jpg';
    await conn.sendFile(m.chat, img, 'thumbnail.jpg', teks, m);
    await m.react('✅');
    
  } catch (error) {
    console.error(error);
    await conn.reply(m.chat, '❌ Error al realizar la búsqueda. Intenta nuevamente.', m);
    await m.react('❌');
  }
};

handler.help = ['google *<texto>*'];
handler.tags = ['tools', 'search'];
handler.command = /^googlef?$/i;
// handler.limit = 1;
handler.register = true;

export default handler;