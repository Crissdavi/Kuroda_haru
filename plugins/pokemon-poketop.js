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

let handler = async (m, { conn }) => {
  try {
    const usuarios = leerUsuarios();
    
    // Filtrar usuarios que tienen Pokémon
    const usuariosConPokemon = Object.entries(usuarios)
      .filter(([_, userData]) => userData.pokemons && userData.pokemons.length > 0)
      .sort((a, b) => b[1].pokemons.length - a[1].pokemons.length); // Ordenar por cantidad de Pokémon

    if (usuariosConPokemon.length === 0) {
      return await conn.sendMessage(m.chat, {
        text: '❌ *Ningún usuario tiene Pokémon capturados todavía.*\n\n🎯 Usa *.pokemon* para ser el primero!',
        contextInfo: { mentionedJid: [m.sender] }
      }, { quoted: m });
    }

    // Mensaje de carga
    await m.reply('📊 *Generando ranking de entrenadores...* 🌟');

    let message = `🏆 *RANKING DE ENTRENADORES POKÉMON*\n\n`;
    message += `👥 *Total de entrenadores:* ${usuariosConPokemon.length}\n\n`;

    // Calcular estadísticas generales
    const totalPokemons = usuariosConPokemon.reduce((total, [_, userData]) => total + userData.pokemons.length, 0);
    const promedioPokemons = (totalPokemons / usuariosConPokemon.length).toFixed(1);
    
    message += `📈 *Estadísticas globales:*\n`;
    message += `➤ Pokémon totales: ${totalPokemons}\n`;
    message += `➤ Promedio por entrenador: ${promedioPokemons}\n`;
    message += `➤ Entrenador líder: ${usuariosConPokemon[0][1].nombre}\n\n`;

    message += `🥇 *TOP 10 ENTRENADORES*\n${'═'.repeat(35)}\n\n`;

    // Mostrar top 10 entrenadores
    usuariosConPokemon.slice(0, 10).forEach(([userId, userData], index) => {
      const emojiPosicion = getMedalEmoji(index);
      const nombre = userData.nombre || 'Entrenador';
      const cantidad = userData.pokemons.length;
      
      // Calcular stats totales del usuario
      const statsTotales = userData.pokemons.reduce((total, pokemon) => {
        return total + (Object.values(pokemon.stats || {}).reduce((sum, stat) => sum + stat, 0));
      }, 0);

      // Encontrar Pokémon más fuerte
      const pokemonMasFuerte = userData.pokemons.reduce((masFuerte, pokemon) => {
        const statsPokemon = Object.values(pokemon.stats || {}).reduce((sum, stat) => sum + stat, 0);
        const statsMasFuerte = Object.values(masFuerte.stats || {}).reduce((sum, stat) => sum + stat, 0);
        return statsPokemon > statsMasFuerte ? pokemon : masFuerte;
      }, userData.pokemons[0]);

      message += `${emojiPosicion} *${nombre}*\n`;
      message += `   📊 Pokémon: ${cantidad}\n`;
      message += `   💪 Stats totales: ${statsTotales}\n`;
      message += `   ⭐ Más fuerte: ${pokemonMasFuerte.name}\n`;
      
      if (index < 3) {
        message += `   🏅 ${getTrophyText(index)}\n`;
      }
      
      message += `\n`;
    });

    // Mostrar mención del usuario actual si no está en top 10
    const usuarioActual = usuarios[m.sender];
    if (usuarioActual && usuarioActual.pokemons && usuarioActual.pokemons.length > 0) {
      const posicionActual = usuariosConPokemon.findIndex(([userId]) => userId === m.sender);
      if (posicionActual >= 10) {
        const nombre = usuarioActual.nombre || 'Tú';
        const cantidad = usuarioActual.pokemons.length;
        
        message += `📌 *Tu posición:* #${posicionActual + 1}\n`;
        message += `   📊 Pokémon: ${cantidad}\n`;
        message += `   🎯 Sigue mejorando para entrar al top 10!\n\n`;
      }
    }

    message += `🔍 *Usa .verpokemon para ver tu colección*\n`;
    message += `🎯 *Usa .pokemon para capturar más*`;

    await conn.sendMessage(m.chat, { 
      text: message,
      contextInfo: { mentionedJid: [m.sender] }
    }, { quoted: m });

  } catch (error) {
    console.error('Error en comando ranking:', error);
    await conn.sendMessage(m.chat, {
      text: '❌ *Error al generar el ranking*\n\n⚠️ Intenta de nuevo más tarde.',
      contextInfo: { mentionedJid: [m.sender] }
    }, { quoted: m });
  }
};

// Función para obtener emoji de medalla según posición
function getMedalEmoji(position) {
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  return medals[position] || `${position + 1}️⃣`;
}

// Función para texto de trofeo
function getTrophyText(position) {
  const texts = ['Campeón Pokémon', 'Subcampeón', 'Tercer lugar'];
  return texts[position] || 'Top entrenador';
}

handler.tags = ['pokemon', 'ranking'];
handler.help = ['ranking', 'topentrenadores'];
handler.command = ['ranking', 'topentrenadores', 'listapokemon', 'entrenadores'];
export default handler;