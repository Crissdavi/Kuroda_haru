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
    
    // Determinar de quién ver los Pokémon - SOLO POR RESPUESTA
    let usuarioObjetivoId = sender; // Por defecto ver los propios
    let usuarioObjetivo = usuarios[sender];
    let esPropio = true;

    // SI SE RESPONDIÓ A UN MENSAJE DE OTRA PERSONA
    if (m.quoted && m.quoted.sender && m.quoted.sender !== sender) {
      usuarioObjetivoId = m.quoted.sender;
      usuarioObjetivo = usuarios[usuarioObjetivoId];
      esPropio = false;
      
      // Verificar si el usuario objetivo existe
      if (!usuarioObjetivo) {
        return await conn.sendMessage(m.chat, {
          text: '❌ *El usuario no existe en la base de datos.*\n\n😅 Debe haber capturado al menos un Pokémon.',
          contextInfo: { mentionedJid: [sender] }
        }, { quoted: m });
      }
    }

    // Verificar si el usuario objetivo tiene Pokémon
    if (!usuarioObjetivo || !usuarioObjetivo.pokemons || usuarioObjetivo.pokemons.length === 0) {
      if (esPropio) {
        return await conn.sendMessage(m.chat, {
          text: '❌ *No has capturado ningún Pokémon todavía.*\n\n🎯 Usa *.pokemon* para empezar tu aventura Pokémon!',
          contextInfo: { mentionedJid: [sender] }
        }, { quoted: m });
      } else {
        return await conn.sendMessage(m.chat, {
          text: '❌ *El usuario no tiene Pokémon capturados.*\n\n😅 No hay nada que ver aquí...',
          contextInfo: { mentionedJid: [sender] }
        }, { quoted: m });
      }
    }

    const userPokemons = usuarioObjetivo.pokemons;
    const numeroPokemon = parseInt(args[0]);

    // Si se especifica un número, mostrar ese Pokémon específico
    if (!isNaN(numeroPokemon) && numeroPokemon > 0 && numeroPokemon <= userPokemons.length) {
      const pokemon = userPokemons[numeroPokemon - 1];
      const stats = pokemon.stats || {};
      
      const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);
      let rareza = '⭐ Común';
      if (totalStats > 400) rareza = '🌟🌟 Raro';
      if (totalStats > 500) rareza = '🌟🌟🌟 Épico';
      if (totalStats > 600) rareza = '💎💎💎 Legendario';

      const caption = `📋 *POKÉMON #${numeroPokemon} - ${pokemon.name.toUpperCase()}*\n` +
        `👤 *Entrenador:* ${usuarioObjetivo.nombre || 'Usuario'}\n\n` +
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
        `📈 *Stats Totales:* ${totalStats}`;

      if (pokemon.image) {
        await conn.sendFile(m.chat, pokemon.image, 'pokemon-detail.png', caption, m);
      } else {
        await m.reply(caption);
      }
      return;
    }

    // Mostrar lista completa de Pokémon
    let message = `📖 *POKÉDEX ${esPropio ? 'PERSONAL' : 'DE ' + (usuarioObjetivo.nombre || 'ENTRENADOR')}*\n`;
    message += `👤 *Entrenador:* ${usuarioObjetivo.nombre || 'Usuario'}\n`;
    message += `📊 *Total Pokémon:* ${userPokemons.length}\n\n`;
    
    // Mostrar solo los primeros 10 Pokémon para no saturar
    userPokemons.slice(0, 10).forEach((pokemon, index) => {
      const stats = pokemon.stats || {};
      const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);
      
      let rareza = '⭐';
      if (totalStats > 400) rareza = '🌟🌟';
      if (totalStats > 500) rareza = '🌟🌟🌟';
      if (totalStats > 600) rareza = '💎💎💎';

      message += `${index + 1}. ${rareza} *${pokemon.name}*\n` +
                 `   ❤️ ${stats.hp || 0}  ⚔️ ${stats.attack || 0}  🛡️ ${stats.defense || 0}\n\n`;
    });

    if (userPokemons.length > 10) {
      message += `📋 ...y ${userPokemons.length - 10} Pokémon más\n\n`;
    }

    message += `═`.repeat(40) + `\n`;
    
    if (esPropio) {
      message += `🔍 *Usa .verpokemon [número] para ver stats completas*\n`;
      message += `🌿 *Usa .cosecha para mejorar tus Pokémon*\n`;
      message += `📋 *Ejemplo:* .verpokemon 1`;
    } else {
      message += `🔍 *Usa .verpokemon [número] para ver stats completas*\n`;
      message += `📋 *Ejemplo:* .verpokemon 1\n\n`;
      message += `⚔️ *¿Quieres retarle?* Responde con .robar`;
    }

    await conn.sendMessage(m.chat, { 
      text: message,
      contextInfo: { mentionedJid: [sender] }
    }, { quoted: m });

  } catch (error) {
    console.error('Error en comando verpokemon:', error);
    await conn.sendMessage(m.chat, {
      text: '❌ *Error al cargar la Pokédex*\n\n⚠️ Intenta de nuevo más tarde.',
      contextInfo: { mentionedJid: [m.sender] }
    }, { quoted: m });
  }
};

handler.tags = ['pokemon', 'info'];
handler.help = ['verpokemon', 'verpokemon [número]'];
handler.command = ['verpokemon', 'mispokemons', 'pokedex', 'verpokes'];
export default handler;