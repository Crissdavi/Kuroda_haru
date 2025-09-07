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

function calcularPoderTotal(pokemon) {
    const stats = pokemon.stats || {};
    return (stats.hp || 0) + (stats.attack || 0) + (stats.defense || 0) + 
           (stats.speed || 0) + (stats['special-attack'] || 0) + (stats['special-defense'] || 0);
}

function calcularVentajaTipos(tiposAtacante, tiposDefensor) {
    let ventaja = 0;
    const ventajas = {
        'fire': ['grass', 'bug', 'ice'], 'water': ['fire', 'ground', 'rock'],
        'grass': ['water', 'ground', 'rock'], 'electric': ['water', 'flying'],
        'ice': ['grass', 'ground', 'flying'], 'fighting': ['normal', 'ice', 'rock'],
        'poison': ['grass'], 'ground': ['fire', 'electric', 'poison', 'rock'],
        'flying': ['grass', 'fighting', 'bug'], 'psychic': ['fighting', 'poison'],
        'bug': ['grass', 'psychic'], 'rock': ['fire', 'ice', 'flying', 'bug'],
        'ghost': ['psychic', 'ghost'], 'dragon': ['dragon']
    };

    tiposAtacante.forEach(tipoAtacante => {
        tiposDefensor.forEach(tipoDefensor => {
            if (ventajas[tipoAtacante] && ventajas[tipoAtacante].includes(tipoDefensor)) {
                ventaja += 0.2;
            }
        });
    });

    return ventaja;
}

let handler = async (m, { conn, args }) => {
    try {
        const sender = m.sender;
        const usuarios = leerUsuarios();
        
        // DETECTAR OPONENTE AUTOMÁTICAMENTE AL RESPONDER
        let oponenteId = null;
        
        // Si es una respuesta a otro mensaje
        if (m.quoted) {
            oponenteId = m.quoted.sender;
        }
        // Si se mencionó con @
        else if (m.mentionedJid && m.mentionedJid.length > 0) {
            oponenteId = m.mentionedJid[0];
        }
        // Si se pasó un número como argumento
        else if (args.length > 0) {
            oponenteId = args[0].replace('@', '');
        }

        // VERIFICAR SI SE DETECTÓ UN OPONENTE
        if (!oponenteId) {
            return await conn.sendMessage(m.chat, {
                text: '❌ *Debes responder al mensaje de quien quieres retar.*\n\n' +
                      '📋 *Cómo usar:*\n' +
                      '• Responde a un mensaje con `.robar`\n' +
                      '• O menciona con `.robar @usuario`\n\n' +
                      '🎯 *Ejemplo:* Responde a un mensaje de Elrian y escribe `.robar`',
                contextInfo: { mentionedJid: [sender] }
            }, { quoted: m });
        }

        // VERIFICACIONES BÁSICAS
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

        // OBTENER POKÉMON (usar primeros por defecto o los especificados)
        let numeroPokemonAtacante = 1;
        let numeroPokemonDefensor = 1;

        if (args.length >= 3) {
            numeroPokemonAtacante = parseInt(args[1]) || 1;
            numeroPokemonDefensor = parseInt(args[2]) || 1;
        }

        // VALIDAR NÚMEROS DE POKÉMON
        if (numeroPokemonAtacante < 1 || numeroPokemonAtacante > usuarios[sender].pokemons.length ||
            numeroPokemonDefensor < 1 || numeroPokemonDefensor > usuarios[oponenteId].pokemons.length) {
            
            return await conn.sendMessage(m.chat, {
                text: `❌ *Números de Pokémon inválidos.*\n\n` +
                      `📋 Tú tienes ${usuarios[sender].pokemons.length} Pokémon\n` +
                      `📋 Oponente tiene ${usuarios[oponenteId].pokemons.length} Pokémon\n\n` +
                      `🔍 Usa .verpokemon para ver los números correctos`,
                contextInfo: { mentionedJid: [sender, oponenteId] }
            }, { quoted: m });
        }

        const pokemonAtacante = usuarios[sender].pokemons[numeroPokemonAtacante - 1];
        const pokemonDefensor = usuarios[oponenteId].pokemons[numeroPokemonDefensor - 1];

        // MENSAJE DE INICIO DE BATALLA
        await conn.sendMessage(m.chat, {
            text: `⚔️ *¡DESAFÍO DE ROBO INICIADO!*\n\n` +
                  `🗡️ *Retador:* ${usuarios[sender].nombre || 'Tú'} con ${pokemonAtacante.name}\n` +
                  `🛡️ *Oponente:* ${usuarios[oponenteId].nombre || 'Usuario'} con ${pokemonDefensor.name}\n\n` +
                  `🔍 *Analizando combate...*`,
            contextInfo: { mentionedJid: [sender, oponenteId] }
        }, { quoted: m });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // CALCULAR PODER Y VENTAJAS
        const poderAtacante = calcularPoderTotal(pokemonAtacante);
        const poderDefensor = calcularPoderTotal(pokemonDefensor);
        const ventajaTipos = calcularVentajaTipos(
            pokemonAtacante.types.map(t => t.toLowerCase()),
            pokemonDefensor.types.map(t => t.toLowerCase())
        );
        const poderTotalAtacante = poderAtacante * (1 + ventajaTipos);
        const diferencia = Math.abs(poderTotalAtacante - poderDefensor);
        const atacanteGana = poderTotalAtacante > poderDefensor;

        // MENSAJE DE ANÁLISIS
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

        // MENSAJE DE RESULTADO
        let mensajeResultado = `🎯 *RESULTADO FINAL*\n\n`;

        if (atacanteGana) {
            const pokemonRobado = usuarios[oponenteId].pokemons.splice(numeroPokemonDefensor - 1, 1)[0];
            usuarios[sender].pokemons.push(pokemonRobado);
            guardarUsuarios(usuarios);

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

handler.tags = ['pokemon'];
handler.help = ['robar', 'robar [@usuario]', 'robar [@usuario] [tu-pokémon] [su-pokémon]'];
handler.command = ['robar', 'robarpokemon', 'desafiar', 'robarpoke'];
export default handler;