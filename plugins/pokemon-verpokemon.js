import fs from 'fs';
import axios from 'axios';

const usuariosPath = './src/database/usuarios.json';

function cargarJSON(ruta, valorDefault = {}) {
  try {
    if (!fs.existsSync(ruta)) fs.writeFileSync(ruta, JSON.stringify(valorDefault, null, 2));
    const data = fs.readFileSync(ruta, 'utf-8').trim();
    return data ? JSON.parse(data) : valorDefault;
  } catch (e) {
    return valorDefault;
  }
}

function guardarJSON(ruta, data) {
  fs.writeFileSync(ruta, JSON.stringify(data, null, 2));
}

let handler = async (m, { conn }) => {
  const userId = m.sender.replace(/[^0-9]/g, '');
  const usuarios = cargarJSON(usuariosPath);

  try {
    if (!usuarios[userId] || !usuarios[userId].pokemones || usuarios[userId].pokemones.length === 0) {
      await conn.reply(m.chat, 'No has capturado ningún Pokémon', m);
      return;
    }

    let texto = 'Tus Pokémon capturados:\n\n';
    usuarios[userId].pokemones.forEach((pokemon, index) => {
      texto += `${index + 1}. ${pokemon.nombre} (Nivel ${pokemon.nivel})\n`;
    });

    await conn.reply(m.chat, texto, m);
  } catch (error) {
    console.error(error);
    await conn.reply(m.chat, `Error al mostrar Pokémon: ${error.message}`, m);
  }
};

handler.tags = ['pokemon'];
handler.help = ['verpokemones'];
handler.command = ['verpokemones', 'mipokemon'];

export default handler;