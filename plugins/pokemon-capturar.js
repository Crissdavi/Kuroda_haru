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
    
    if (!usuarios[sender]) {
      usuarios[sender] = {
        pokemons: [],
        nombre: m.pushName || 'Usuario'
      };
    }

    let mensajeCaptura = await conn.sendMessage(m.chat, { 
      text: '🎣 *Lanzando Pokébola...*' 
    }, { quoted: m });

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await conn.relayMessage(m.chat, {
      protocolMessage: {
        key: mensajeCaptura.key,
        type: 14,
        editedMessage: {
          conversation: '⚡ *¡Pokébola en movimiento!*'
        }
      }
    }, {});

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await conn.relayMessage(m.chat, {
      protocolMessage: {
        key: mensajeCaptura.key,
        type: 14,
        editedMessage: {
          conversation: '✨ *La Pokébola se está agitando...*'
        }
      }
    }, {});

    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const pokemons = response.data.results;
    const randomPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
    const pokemonData = await axios.get(randomPokemon.url);
    
    const pokemonName = pokemonData.data.name.charAt(0).toUpperCase() + pokemonData.data.name.slice(1);
    const pokemonImage = pokemonData.data.sprites.other['official-artwork']?.front_default || 
                         pokemonData.data.sprites.front_default;

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
     
      await conn.relayMessage(m.chat, {
        protocolMessage: {
          key: mensajeCaptura.key,
          type: 14,
          editedMessage: {
            conversation: `🎊 *¡CAPTURADO!*\n\n🌟 *${pokemonName}* - ${rareza}\n❌ No tiene imagen disponible\n\n¡Agregado a tu Pokédex!`
          }
        }
      }, {});
      return;
    }

    await conn.sendFile(
      m.chat, 
      pokemonImage, 
      'pokemon.png', 
      `🎊 *¡POKÉMON CAPTURADO!*\n\n🌟 *Nombre:* ${pokemonName}\n📊 *Rareza:* ${rareza}\n📏 *Altura:* ${pokemonCapturado.height}m\n⚖️ *Peso:* ${pokemonCapturado.weight}kg\n❤️ *HP:* ${pokemonCapturado.stats.hp}\n⚔️ *Ataque:* ${pokemonCapturado.stats.attack}\n🛡️ *Defensa:* ${pokemonCapturado.stats.defense}\n🌀 *Tipo:* ${pokemonCapturado.types.join(' / ').toUpperCase()}\n📅 *Capturado:* ${pokemonCapturado.captured}\n\n¡Agregado a tu Pokédex! 🎯\nUsa *.verpokemon* para ver tu colección`,
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