import fs from 'fs'

const usuariosPath = './src/database/usuarios.json'

let handler = async (m, { conn }) => {
  try {
    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const pokemons = response.data.results;
    const randomPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
    const pokemonData = await axios.get(randomPokemon.url);
    const pokemonName = pokemonData.data.name;
    const pokemonImage = pokemonData.data.sprites.front_default;

    await conn.sendFile(m.chat, pokemonImage, 'pokemon.png', `¡Felicidades! Has capturado a ${pokemonName}`, m);
  } catch (error) {
    m.reply(error)
  }
};

handler.tags = ['pokemon'];
handler.help = ['pokemon'];
handler.command = ['pokemon', 'capturar'];
export default handler