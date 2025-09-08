import axios from 'axios';
import fs from 'fs';

const mercadoPath = './src/database/mercadobot.json';

// Función para leer el mercado del bot
function leerMercadoBot() {
    try {
        const data = fs.readFileSync(mercadoPath, 'utf8');
        if (!data.trim()) return { pokemons: [], ultimaActualizacion: "", comprasHoy: {} };
        return JSON.parse(data);
    } catch (error) {
        return { pokemons: [], ultimaActualizacion: "", comprasHoy: {} };
    }
}

// Función para guardar el mercado del bot
function guardarMercadoBot(mercado) {
    try {
        fs.writeFileSync(mercadoPath, JSON.stringify(mercado, null, 2));
    } catch (error) {
        console.error('Error guardando mercado bot:', error);
    }
}

// Función para generar Pokémon aleatorios para el mercado
async function generarPokemonMercado() {
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const allPokemons = response.data.results;
        
        const pokemonsMercado = [];
        
        // Generar 5 Pokémon aleatorios
        for (let i = 0; i < 5; i++) {
            const randomPokemon = allPokemons[Math.floor(Math.random() * allPokemons.length)];
            const pokemonData = await axios.get(randomPokemon.url);
            
            const pokemonName = pokemonData.data.name.charAt(0).toUpperCase() + pokemonData.data.name.slice(1);
            const pokemonImage = pokemonData.data.sprites.other['official-artwork']?.front_default || 
                               pokemonData.data.sprites.front_default;

            // Calcular stats totales para determinar rareza
            const totalStats = pokemonData.data.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
            
            // Determinar rareza y precio
            let rareza, precioBase;
            const rarezaRandom = Math.random();
            
            if (rarezaRandom < 0.05) { // 5% probabilidad
                rareza = '💎💎💎 Legendario';
                precioBase = 8000 + Math.random() * 4000;
            } else if (rarezaRandom < 0.20) { // 15% probabilidad
                rareza = '🌟🌟🌟 Épico';
                precioBase = 4000 + Math.random() * 3000;
            } else if (rarezaRandom < 0.50) { // 30% probabilidad
                rareza = '🌟🌟 Raro';
                precioBase = 2000 + Math.random() * 2000;
            } else { // 50% probabilidad
                rareza = '⭐ Común';
                precioBase = 500 + Math.random() * 1500;
            }

            const precio = Math.round(precioBase / 100) * 100; // Redondear a centenas

            pokemonsMercado.push({
                id: i + 1,
                name: pokemonName,
                image: pokemonImage,
                height: pokemonData.data.height / 10,
                weight: pokemonData.data.weight / 10,
                types: pokemonData.data.types.map(t => t.type.name),
                stats: pokemonData.data.stats.reduce((acc, stat) => {
                    acc[stat.stat.name] = stat.base_stat;
                    return acc;
                }, {}),
                rareza: rareza,
                precio: precio,
                poderTotal: totalStats
            });
        }
        
        return pokemonsMercado;
    } catch (error) {
        console.error('Error generando Pokémon para mercado:', error);
        return [];
    }
}

let handler = async (m, { conn }) => {
    try {
        const sender = m.sender;
        let mercado = leerMercadoBot();
        const hoy = new Date().toDateString();

        // Verificar si hay que actualizar el mercado (una vez al día)
        if (mercado.ultimaActualizacion !== hoy || mercado.pokemons.length === 0) {
            await m.reply('🔄 *Actualizando mercado del bot...*');
            mercado.pokemons = await generarPokemonMercado();
            mercado.ultimaActualizacion = hoy;
            mercado.comprasHoy = {}; // Reiniciar compras del día
            guardarMercadoBot(mercado);
        }

        if (mercado.pokemons.length === 0) {
            return await m.reply('🏪 *Mercado vacío*\n\n❌ No hay Pokémon disponibles hoy.\n🔄 Vuelve mañana.');
        }

        const comprasHoy = mercado.comprasHoy[sender] || 0;
        const comprasRestantes = 1 - comprasHoy;

        let message = `🏪 *MERCADO DEL BOT - ${new Date().toLocaleDateString()}*\n\n`;
        message += `🛒 *Pokémon disponibles:* ${mercado.pokemons.length}/5\n`;
        message += `📊 *Compras hoy:* ${comprasHoy}/1 (${comprasRestantes} restantes)\n\n`;

        mercado.pokemons.forEach(pokemon => {
            message += `🔢 *${pokemon.id}. ${pokemon.name}*\n`;
            message += `   ${pokemon.rareza} | 💰 ${pokemon.precio} zenis\n`;
            message += `   ❤️${pokemon.stats.hp} ⚔️${pokemon.stats.attack} 🛡️${pokemon.stats.defense}\n`;
            message += `   📏${pokemon.height}m ⚖️${pokemon.weight}kg\n`;
            message += `   🌟 Poder: ${pokemon.poderTotal}\n\n`;
        });

        message += `═`.repeat(35) + `\n`;
        message += `💳 *Para comprar:* .comprarbot [número]\n`;
        message += `🎯 *Ejemplo:* .comprarbot 1\n`;
        message += `⏰ *Se actualiza:* Cada 24 horas\n`;
        message += `🎲 *Rareza:* Aleatoria con suerte`;

        await conn.sendMessage(m.chat, { 
            text: message,
            contextInfo: { mentionedJid: [sender] }
        }, { quoted: m });

    } catch (error) {
        console.error('Error en mercado bot:', error);
        await m.reply('❌ *Error al cargar el mercado*');
    }
};

handler.tags = ['pokemon', 'economy'];
handler.help = ['marketplace'];
handler.command = ['marketplace'];
export default handler;