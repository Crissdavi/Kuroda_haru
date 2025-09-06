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

    // Si se especifica un número, mostrar ese Pokémon específico con stats detalladas
    if (!isNaN(numeroPokemon) && numeroPokemon > 0 && numeroPokemon <= userPokemons.length) {
      const pokemon = userPokemons[numeroPokemon - 1];
      const stats = pokemon.stats || {};
      
      // Calcular stats totales y rareza
      const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);
      let rareza = '⭐ Común';
      if (totalStats > 400) rareza = '🌟🌟 Raro';
      if (totalStats > 500) rareza = '🌟🌟🌟 Épico';
      if (totalStats > 600) rareza = '💎💎💎 Legendario';

      // Crear mensaje con todas las estadísticas
      const caption = `📋 *POKÉMON #${numeroPokemon} - ${pokemon.name.toUpperCase()}*\n\n` +
        `📊 *Rareza:* ${rareza}\n` +
        `📏 *Altura:* ${pokemon.height}m\n` +
        `⚖️ *Peso:* ${pokemon.weight}kg\n` +
        `🌀 *Tipo:* ${pokemon.types.join(' / ').toUpperCase()}\n` +
        `📅 *Capturado:* ${pokemon.captured}\n\n` +
        `💪 *ESTADÍSTICAS*\n` +
        `❤️  *HP:* ${stats.hp || 0}\n` +
        `⚔️  *Ataque:* ${stats.attack || 0}\n` +
        `🛡️  *Defensa:* ${stats.defense || 0}\n` +
        `💨  *Vel. Ataque:* ${stats['special-attack'] || 0}\n` +
        `🛡️  *Vel. Defensa:* ${stats['special-defense'] || 0}\n` +
        `⚡  *Velocidad:* ${stats.speed || 0}\n\n` +
        `📈 *Stats Totales:* ${totalStats}\n\n` +
        `🌿 *Usa .cosecha para conseguir alimentos de mejora*`;

      if (pokemon.image) {
        await conn.sendFile(m.chat, pokemon.image, 'pokemon-detail.png', caption, m);
      } else {
        await m.reply(caption);
      }
      return;
    }

    // Mostrar lista completa de Pokémon con stats básicas
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

      // Mostrar stats clave en la lista
      message += `${index + 1}. ${rareza} *${pokemon.name}*\n` +
                 `   ❤️ ${stats.hp || 0}  ⚔️ ${stats.attack || 0}  🛡️ ${stats.defense || 0}\n\n`;
    });

    message += `\n${'═'.repeat(40)}\n`;
    message += `🔍 *Usa .verpokemon [número] para ver stats completas*\n`;
    message += `🌿 *Usa .cosecha para mejorar stats con alimentos*\n`;
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