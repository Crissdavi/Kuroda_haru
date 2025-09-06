import fs from 'fs';

const usuariosPath = './src/database/usuarios.json';

function leerUsuarios() {
  try {
    const data = fs.readFileSync(usuariosPath, 'utf8');
    return JSON.parse(data) || {};
  } catch (error) {
    return {};
  }
}

let handler = async (m, { conn, args }) => {
  try {
    const sender = m.sender;
    const usuarios = leerUsuarios();
    
    // Verificar si no tiene Pokémon
    if (!usuarios[sender] || usuarios[sender].pokemons.length === 0) {
      return await conn.sendMessage(m.chat, {
        text: '❌ *No has capturado ningún Pokémon todavía.*\n\n🎯 Usa *.pokemon* para empezar tu aventura Pokémon!',
        contextInfo: { mentionedJid: [sender] }
      }, { quoted: m });
    }

    const userPokemons = usuarios[sender].pokemons;
    const numeroPokemon = parseInt(args[0]);

    if (!isNaN(numeroPokemon) && numeroPokemon > 0 && numeroPokemon <= userPokemons.length) {
      const pokemon = userPokemons[numeroPokemon - 1];
      const stats = pokemon.stats || {};
      const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);
      
      let rareza = '⭐ Común';
      if (totalStats > 400) rareza = '🌟🌟 Raro';
      if (totalStats > 500) rareza = '🌟🌟🌟 Épico';
      if (totalStats > 600) rareza = '💎💎💎 Legendario';

      const caption = `📋 *POKÉMON #${numeroPokemon}*\n\n` +
        `🎯 *Nombre:* ${pokemon.name}\n` +
        `📊 *Rareza:* ${rareza}\n` +
        `📏 *Altura:* ${pokemon.height}m\n` +
        `⚖️ *Peso:* ${pokemon.weight}kg\n` +
        `🌀 *Tipo:* ${pokemon.types.join(' / ').toUpperCase()}\n` +
        `📅 *Capturado:* ${pokemon.captured}`;

      if (pokemon.image) {
        await conn.sendFile(m.chat, pokemon.image, 'pokemon-detail.png', caption, m);
      } else {
        await m.reply(caption);
      }
      return;
    }

    await m.reply('📊 *Cargando tu Pokédex...* 🌟');
    await new Promise(resolve => setTimeout(resolve, 1000));

    let message = `📖 *POKÉDEX - ${userPokemons.length} POKÉMON*\n\n`;
    
    userPokemons.forEach((pokemon, index) => {
      const stats = pokemon.stats || {};
      const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);
      
      let rareza = '⭐';
      if (totalStats > 400) rareza = '🌟🌟';
      if (totalStats > 500) rareza = '🌟🌟🌟';
      if (totalStats > 600) rareza = '💎💎💎';

      message += `${index + 1}. ${rareza} *${pokemon.name}*\n`;
    });

    message += `\n${'═'.repeat(35)}\n`;
    message += `🔍 *Usa .verpokemon [número] para ver detalles*\n`;
    message += `📋 *Ejemplo:* .verpokemon 1`;

    await conn.sendMessage(m.chat, { 
      text: message,
      contextInfo: { mentionedJid: [sender] }
    }, { quoted: m });

  } catch (error) {
    console.error('Error en comando verpokemon:', error);
    await conn.sendMessage(m.chat, {
      text: '❌ *Error al cargar tu Pokédex*\n\n⚠️ Intenta de nuevo más tarde.',
      contextInfo: { mentionedJid: [m.sender] }
    }, { quoted: m });
  }
};

handler.tags = ['game', 'pokemon'];
handler.help = ['verpokemon', 'verpokemon [número]'];
handler.command = ['verpokemon', 'mispokemons', 'pokedex', 'mispokes'];
export default handler;