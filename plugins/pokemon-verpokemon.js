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

let handler = async (m, { conn, args, mentionedJid }) => {
  try {
    const sender = m.sender;
    const usuarios = leerUsuarios();
    
    // Determinar de quién ver los Pokémon
    let usuarioObjetivoId = sender; // Por defecto ver los propios
    let usuarioObjetivo = usuarios[sender];
    let esPropio = true;

    // Si se mencionó a alguien o se respondió a un mensaje
    if ((mentionedJid && mentionedJid.length > 0) || (m.quoted && m.quoted.sender !== sender)) {
      const objetivoId = mentionedJid ? mentionedJid[0] : m.quoted.sender;
      
      if (usuarios[objetivoId] && usuarios[objetivoId].pokemons && usuarios[objetivoId].pokemons.length > 0) {
        usuarioObjetivoId = objetivoId;
        usuarioObjetivo = usuarios[objetivoId];
        esPropio = false;
      }
    }

    // Verificar si el usuario objetivo tiene Pokémon
    if (!usuarioObjetivo || usuarioObjetivo.pokemons.length === 0) {
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
        `📈 *Stats Totales:* ${totalStats}\n\n` +
        `🌿 *Usa .cosecha para mejorar tus Pokémon*`;

      if (pokemon.image) {
        await conn.sendFile(m.chat, pokemon.image, 'pokemon-detail.png', caption, m);
      } else {
        await m.reply(caption);
      }
      return;
    }

    // Mostrar lista completa de Pokémon
    await m.reply(`📊 *Cargando Pokédex${esPropio ? ' personal' : ' de ' + usuarioObjetivo.nombre}...* 🌟`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    let message = `📖 *POKÉDEX DE ${usuarioObjetivo.nombre ? usuarioObjetivo.nombre.toUpperCase() : 'ENTRENADOR'}*\n`;
    message += `👤 *Entrenador:* ${usuarioObjetivo.nombre || 'Usuario'}\n`;
    message += `📊 *Total Pokémon:* ${userPokemons.length}\n\n`;
    
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
    
    if (esPropio) {
      message += `🔍 *Usa .verpokemon [número] para ver stats completas*\n`;
      message += `🌿 *Usa .cosecha para mejorar tus Pokémon*\n`;
      message += `📋 *Ejemplo:* .verpokemon 1\n\n`;
      message += `👀 *Para ver otros entrenadores:* Responde a su mensaje con .verpokemon`;
    } else {
      message += `🔍 *Usa .verpokemon [número] para ver stats completas*\n`;
      message += `📋 *Ejemplo:* .verpokemon 1\n\n`;
      message += `⚔️ *¿Quieres retarle?* Usa .robar respondiendo a su mensaje`;
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
handler.help = ['verpokemon', 'verpokemon [@usuario]', 'verpokemon [número]'];
handler.command = ['verpokemon', 'mispokemons', 'pokedex', 'verpokes'];
export default handler;