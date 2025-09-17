import axios from 'axios';

let handler = async (m, { conn, command, args, usedPrefix }) => {
  const text = args.join` `;
  if (!text) return conn.reply(m.chat, '🚩 Ingresa lo que deseas buscar junto al comando.', m);
  
  await m.react('🕓');
  
  try {
    const response = await axios.get(`https://api.delirius.store/search/googlesearch?query=${encodeURIComponent(text)}`);
    const data = response.data;
    
    // Verificar si la API respondió correctamente
    if (!data.status || !data.data || !Array.isArray(data.data)) {
      return conn.reply(m.chat, '❌ Error en la respuesta de la API. Intenta nuevamente.', m);
    }
    
    const results = data.data;
    
    if (results.length === 0) {
      return conn.reply(m.chat, '❌ No se encontraron resultados para tu búsqueda.', m);
    }
    
    let teks = `\t\t\t*乂  S E A R C H  -  G O O G L E*\n\n`;
    teks += `*Búsqueda:* ${text}\n\n`;
    
    // Limitar a 5 resultados para no saturar el mensaje
    const searchResults = results.slice(0, 5);
    
    searchResults.forEach((g, index) => {
      teks += `*${index + 1}. ${g.title || 'Sin título'}*\n`;
      teks += `🔗 *Enlace:* ${g.url || 'Sin enlace'}\n`;
      teks += `📝 *Descripción:* ${g.description || 'Sin descripción'}\n\n`;
      teks += `─`.repeat(30) + `\n\n`;
    });
    
    teks += `*Fuente:* API Delirius Store\n`;
    
    const img = 'https://i.ibb.co/P5kZNFF/file.jpg';
    await conn.sendFile(m.chat, img, 'thumbnail.jpg', teks, m);
    await m.react('✅');
    
  } catch (error) {
    console.error('Error en búsqueda Google:', error);
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