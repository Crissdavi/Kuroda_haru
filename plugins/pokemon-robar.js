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

// Función para calcular poder total de un Pokémon
function calcularPoderTotal(pokemon) {
    const stats = pokemon.stats || {};
    return (stats.hp || 0) + (stats.attack || 0) + (stats.defense || 0) + 
           (stats.speed || 0) + (stats['special-attack'] || 0) + (stats['special-defense'] || 0);
}

// Función para determinar ventaja de tipos
function calcularVentajaTipos(tiposAtacante, tiposDefensor) {
    let ventaja = 0;
    
    // Tabla simple de ventajas (puedes expandirla)
    const ventajas = {
        'fire': ['grass', 'bug', 'ice'],
        'water': ['fire', 'ground', 'rock'],
        'grass': ['water', 'ground', 'rock'],
        'electric': ['water', 'flying'],
        'ice': ['grass', 'ground', 'flying'],
        'fighting': ['normal', 'ice', 'rock'],
        'poison': ['grass'],
        'ground': ['fire', 'electric', 'poison', 'rock'],
        'flying': ['grass', 'fighting', 'bug'],
        'psychic': ['fighting', 'poison'],
        'bug': ['grass', 'psychic'],
        'rock': ['fire', 'ice', 'flying', 'bug'],
        'ghost': ['psychic', 'ghost'],
        'dragon': ['dragon']
    };

    tiposAtacante.forEach(tipoAtacante => {
        tiposDefensor.forEach(tipoDefensor => {
            if (ventajas[tipoAtacante] && ventajas[tipoAtacante].includes(tipoDefensor)) {
                ventaja += 0.2; // 20% de ventaja por tipo
            }
        });
    });

    return ventaja;
}

let handler = async (m, { conn, args, mentionedJid }) => {
    try {
        const sender = m.sender;
        const usuarios = leerUsuarios();
        
        // Verificar si mencionaron a alguien
        if (!mentionedJid || mentionedJid.length === 0) {
            return await conn.sendMessage(m.chat, {
                text: '❌ *Debes mencionar a un usuario para retarle.*\n\n📋 Ejemplo: .robar @usuario',
                contextInfo: { mentionedJid: [sender] }
            }, { quoted: m });
        }

        const oponenteId = mentionedJid[0];
        
        // Verificaciones básicas
        if (oponenteId === sender) {
            return await conn.sendMessage(m.chat, {
                text: '❌ *No puedes robarte a ti mismo.*\n\n😅 Eso sería bastante tonto...',
                contextInfo: { mentionedJid: [sender] }
            }, { quoted: m });
        }

        if (!usuarios[sender] || usuarios[sender].pokemons.length === 0) {
            return await conn.sendMessage(m.chat, {
                text: '❌ *No tienes Pokémon para batallar.*\n\n🎯 Primero captura algún Pokémon con *.pokemon*',
                contextInfo: { mentionedJid: [sender] }
            }, { quoted: m });
        }

        if (!usuarios[oponenteId] || usuarios[oponenteId].pokemons.length === 0) {
            return await conn.sendMessage(m.chat, {
                text: '❌ *El usuario no tiene Pokémon para robar.*\n\n😅 No puedes retar a alguien que no tiene Pokémon.',
                contextInfo: { mentionedJid: [sender] }
            }, { quoted: m });
        }

        // Verificar si se especificó Pokémon
        let numeroPokemonAtacante = 1;
        let numeroPokemonDefensor = 1;

        if (args.length >= 2) {
            numeroPokemonAtacante = parseInt(args[0]) || 1;
            numeroPokemonDefensor = parseInt(args[1]) || 1;
        }

        // Validar números de Pokémon
        if (numeroPokemonAtacante < 1 || numeroPokemonAtacante > usuarios[sender].pokemons.length ||
            numeroPokemonDefensor < 1 || numeroPokemonDefensor > usuarios[oponenteId].pokemons.length) {
            
            return await conn.sendMessage(m.chat, {
                text: `❌ *Números de Pokémon inválidos.*\n\n` +
                      `📋 Tú tienes ${usuarios[sender].pokemons.length} Pokémon\n` +
                      `📋 ${usuarios[oponenteId].nombre} tiene ${usuarios[oponenteId].pokemons.length} Pokémon\n\n` +
                      `🔍 Usa .verpokemon para ver los números correctos`,
                contextInfo: { mentionedJid: [sender, oponenteId] }
            }, { quoted: m });
        }

        const pokemonAtacante = usuarios[sender].pokemons[numeroPokemonAtacante - 1];
        const pokemonDefensor = usuarios[oponenteId].pokemons[numeroPokemonDefensor - 1];

        // Mensaje de inicio de batalla
        await conn.sendMessage(m.chat, {
            text: `⚔️ *¡DESAFÍO DE ROBOT INICIADO!*\n\n` +
                  `🗡️ *Retador:* ${usuarios[sender].nombre || 'Tú'} con ${pokemonAtacante.name}\n` +
                  `🛡️ *Oponente:* ${usuarios[oponenteId].nombre || 'Usuario'} con ${pokemonDefensor.name}\n\n` +
                  `🔍 *Analizando combate...*`,
            contextInfo: { mentionedJid: [sender, oponenteId] }
        }, { quoted: m });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Calcular poderes
        const poderAtacante = calcularPoderTotal(pokemonAtacante);
        const poderDefensor = calcularPoderTotal(pokemonDefensor);
        
        // Calcular ventaja de tipos
        const ventajaTipos = calcularVentajaTipos(
            pokemonAtacante.types.map(t => t.toLowerCase()),
            pokemonDefensor.types.map(t => t.toLowerCase())
        );

        // Calcular poder total con ventajas
        const poderTotalAtacante = poderAtacante * (1 + ventajaTipos);
        const poderTotalDefensor = poderDefensor;

        // Determinar ganador
        const atacanteGana = poderTotalAtacante > poderTotalDefensor;
        const diferencia = Math.abs(poderTotalAtacante - poderTotalDefensor);

        // Mensaje de análisis
        let mensajeAnalisis = `📊 *ANÁLISIS DEL COMBATE*\n\n` +
                             `⭐ *${pokemonAtacante.name}:* ${poderAtacante} puntos de poder\n` +
                             `⭐ *${pokemonDefensor.name}:* ${poderDefensor} puntos de poder\n`;

        if (ventajaTipos > 0) {
            mensajeAnalisis += `🎯 *Ventaja de tipos:* +${(ventajaTipos * 100).toFixed(0)}% para ${pokemonAtacante.name}\n`;
        }

        mensajeAnalisis += `\n⚖️ *Diferencia de poder:* ${diferencia.toFixed(0)} puntos\n`;

        await conn.sendMessage(m.chat, {
            text: mensajeAnalisis,
            contextInfo: { mentionedJid: [sender, oponenteId] }
        }, { quoted: m });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mensaje de resultado
        let mensajeResultado = `🎯 *RESULTADO FINAL*\n\n`;

        if (atacanteGana) {
            // Robar Pokémon
            const pokemonRobado = usuarios[oponenteId].pokemons.splice(numeroPokemonDefensor - 1, 1)[0];
            usuarios[sender].pokemons.push(pokemonRobado);

            mensajeResultado += `✅ *¡VICTORIA!* 🎉\n` +
                               `🗡️ *${pokemonAtacante.name}* venció a *${pokemonDefensor.name}*\n` +
                               `💰 *Has robado:* ${pokemonRobado.name}\n\n` +
                               `🎯 ¡${pokemonRobado.name} ahora es tuyo!`;

        } else {
            mensajeResultado += `❌ *¡DERROTA!* 💔\n` +
                               `🛡️ *${pokemonDefensor.name}* es más fuerte que *${pokemonAtacante.name}*\n` +
                               `📉 No has podido robar ningún Pokémon\n\n` +
                               `💪 Mejora tus Pokémon con .cosecha y .usaralimento`;
        }

        // Guardar cambios si hubo robo
        if (atacanteGana) {
            guardarUsuarios(usuarios);
        }

        await conn.sendMessage(m.chat, {
            text: mensajeResultado,
            contextInfo: { mentionedJid: [sender, oponenteId] }
        }, { quoted: m });

    } catch (error) {
        console.error('Error en comando robar:', error);
        await conn.sendMessage(m.chat, {
            text: '❌ *Error en el desafío de robo*\n\n⚠️ Intenta de nuevo más tarde.',
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
    }
};

handler.tags = ['pokemon', 'game'];
handler.help = ['robar', 'robar [@usuario] [tu-pokémon] [su-pokémon]'];
handler.command = ['robar', 'robarpokemon', 'desafiar'];
handler.command = ['robar', 'robarpokemon', 'desafiar'];
export default handler;