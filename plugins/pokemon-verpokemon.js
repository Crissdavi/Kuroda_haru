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
    const pagina = parseInt(args[1]) || 1; // Nueva: sistema de páginas

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

    // SISTEMA DE PÁGINAS - Mostrar lista de Pokémon
    const pokemonsPorPagina = 10;
    const totalPaginas = Math.ceil(userPokemons.length / pokemonsPorPagina);
    const paginaActual = Math.max(1, Math.min(pagina, totalPaginas));
    const inicio = (paginaActual - 1) * pokemonsPorPagina;
    const fin = inicio + pokemonsPorPagina;
    const pokemonsPagina = userPokemons.slice(inicio, fin);

    let message = `📖 *POKÉDEX ${esPropio ? 'PERSONAL' : 'DE ' + (usuarioObjetivo.nombre || 'ENTRENADOR')}*\n`;
    message += `👤 *Entrenador:* ${usuarioObjetivo.nombre || 'Usuario'}\n`;
    message += `📊 *Total Pokémon:* ${userPokemons.length}\n`;
    message += `📑 *Página:* ${paginaActual}/${totalPaginas}\n\n`;
    
    // Mostrar Pokémon de la página actual
    pokemonsPagina.forEach((pokemon, index) => {
      const numeroReal = inicio + index + 1;
      const stats = pokemon.stats || {};
      const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);
      
      let rareza = '⭐';
      if (totalStats > 400) rareza = '🌟🌟';
      if (totalStats > 500) rareza = '🌟🌟🌟';
      if (totalStats > 600) rareza = '💎💎💎';

      message += `${numeroReal}. ${rareza} *${pokemon.name}*\n`;
      message += `   ❤️ ${stats.hp || 0}  ⚔️ ${stats.attack || 0}  🛡️ ${stats.defense || 0}\n\n`;
    });

    // Pie de página con navegación
    message += `═`.repeat(40) + `\n`;
    
    if (totalPaginas > 1) {
      message += `📑 *Navegación:*\n`;
      if (paginaActual > 1) {
        message += `◀️ .verpokemon p${paginaActual - 1}  |  `;
      }
      if (paginaActual < totalPaginas) {
        message += `▶️ .verpokemon p${paginaActual + 1}\n`;
      }
      message += `🔢 .verpokemon [número] (ver detalles)\n`;
    }
    
    if (esPropio) {
      message += `🌿 *Usa .cosecha para mejorar tus Pokémon*`;
    } else {
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
handler.help = ['verpokemon', 'verpokemon [número]', 'verpokemon p[página]'];
handler.command = ['verpokemon', 'mispokemons', 'pokedex', 'verpokes'];
export default handler;