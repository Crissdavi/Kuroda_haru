import axios from 'axios';
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

function guardarUsuarios(usuarios) {
  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
}

let handler = async (m, { conn }) => {
  try {
    const sender = m.sender;
    const usuarios = leerUsuarios();
    
    // Si el usuario no existe en la DB, crearlo
    if (!usuarios[sender]) {
      usuarios[sender] = {
        pokemons: [],
        nombre: m.pushName || 'Usuario'
      };
    }

    await m.reply('🎣 *Lanzando Pokébola...*');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await m.reply('⚡ *¡Pokébola en movimiento!*');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const captureMessages = [
      '✨ *La Pokébola se está agitando...*',
      '🌟 *¡Parece que quiere escapar!*',
      '💫 *¡Un poco más...!*',
      '🎉 *¡Casi atrapado!*'
    ];

    for (const msg of captureMessages) {
      await m.reply(msg);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const pokemons = response.data.results;
    const randomPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
    const pokemonData = await axios.get(randomPokemon.url);
    
    const pokemonName = pokemonData.data.name.charAt(0).toUpperCase() + pokemonData.data.name.slice(1);
    const pokemonImage = pokemonData.data.sprites.other['official-artwork']?.front_default || 
                         pokemonData.data.sprites.front_default;

    // Guardar el Pokémon capturado
    const pokemonCapturado = {
      id: pokemonData.data.id,
      name: pokemonName,
      image: pokemonImage,
      height: pokemonData.data.height / 10,
      weight: pokemonData.data.weight / 10,
      types: pokemonData.data.types.map(t => t.type.name),
      captured: new Date().toLocaleDateString(),
      stats: pokemonData.data.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
      }, {})
    };

    usuarios[sender].pokemons.push(pokemonCapturado);
    guardarUsuarios(usuarios);

    const totalStats = Object.values(pokemonCapturado.stats).reduce((a, b) => a + b, 0);
    let rareza = '⭐ Común';
    if (totalStats > 400) rareza = '🌟🌟 Raro';
    if (totalStats > 500) rareza = '🌟🌟🌟 Épico';
    if (totalStats > 600) rareza = '💎💎💎 Legendario';

    if (!pokemonImage) {
      return await m.reply(`🎊 *¡CAPTURADO!*\n\n🌟 *${pokemonName}* - ${rareza}\n❌ No tiene imagen disponible\n\n¡Agregado a tu Pokédex!`);
    }

    const caption = `🎊 *¡POKÉMON CAPTURADO!*

🌟 *Nombre:* ${pokemonName}
📊 *Rareza:* ${rareza}
📏 *Altura:* ${pokemonCapturado.height}m
⚖️ *Peso:* ${pokemonCapturado.weight}kg
❤️ *HP:* ${pokemonCapturado.stats.hp}
⚔️ *Ataque:* ${pokemonCapturado.stats.attack}
🛡️ *Defensa:* ${pokemonCapturado.stats.defense}
🌀 *Tipo:* ${pokemonCapturado.types.join(' / ').toUpperCase()}
📅 *Capturado:* ${pokemonCapturado.captured}

¡Agregado a tu Pokédex! 🎯
Usa *.verpokemon* para ver tu colección`;

    await conn.sendFile(
      m.chat, 
      pokemonImage, 
      'pokemon.png', 
      caption,
      m
    );
    
  } catch (error) {
    console.error('Error en comando pokemon:', error);
    await m.reply('❌ *La Pokébola falló!* Ocurrió un error al intentar capturar el Pokémon. Intenta de nuevo.');
  }
};

handler.tags = ['game', 'pokemon'];
handler.help = ['pokemon'];
handler.command = ['pokemon', 'capturar', 'poke'];
export default handler;