import fs from 'fs';

// Función para calcular poder de un Pokémon
function calcularPoderPokemon(pokemon) {
    const stats = pokemon.stats || {};
    return (stats.hp || 0) + (stats.attack || 0) + (stats.defense || 0) + 
           (stats.speed || 0) + (stats['special-attack'] || 0) + (stats['special-defense'] || 0);
}

let handler = async (m, { conn, args }) => {
    try {
        const sender = m.sender;
        
        // DETECTAR OPONENTE AL RESPONDER MENSAJE
        let victimaId = null;
        
        if (m.quoted && m.quoted.sender) {
            victimaId = m.quoted.sender; // Usar ID de quien envió el mensaje respondido
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            victimaId = m.mentionedJid[0]; // Usar mención tradicional
        } else {
            return await m.reply('❌ *Debes responder al mensaje de quien quieres robar.*\n\n📋 Ejemplo: Responde a un mensaje y escribe .robar');
        }
        
        if (victimaId === sender) {
            return await m.reply('❌ *No puedes robarte a ti mismo.*');
        }

        if (!global.db.data.users[sender] || !global.db.data.users[sender].pokemons || global.db.data.users[sender].pokemons.length === 0) {
            return await m.reply('❌ *No tienes Pokémon para robar.*\n\n🎯 Usa *.pokemon* primero');
        }

        if (!global.db.data.users[victimaId] || !global.db.data.users[victimaId].pokemons || global.db.data.users[victimaId].pokemons.length === 0) {
            return await m.reply('❌ *El usuario no tiene Pokémon para robar.*');
        }

        // Obtener Pokémon específicos
        let miPokemonIndex = 0; // Por defecto el primero
        let suPokemonIndex = 0; // Por defecto el primero

        // Si se especificaron Pokémon: .robar 2 3 (respondiendo)
        if (args.length >= 2) {
            miPokemonIndex = parseInt(args[0]) - 1;
            suPokemonIndex = parseInt(args[1]) - 1;
        }

        // Validar índices
        if (isNaN(miPokemonIndex) || miPokemonIndex < 0 || miPokemonIndex >= global.db.data.users[sender].pokemons.length) {
            return await m.reply(`❌ *Pokémon inválido.*\n\nTienes ${global.db.data.users[sender].pokemons.length} Pokémon. Usa .verpokemon`);
        }

        if (isNaN(suPokemonIndex) || suPokemonIndex < 0 || suPokemonIndex >= global.db.data.users[victimaId].pokemons.length) {
            return await m.reply(`❌ *El usuario no tiene ese Pokémon.*\n\nTiene ${global.db.data.users[victimaId].pokemons.length} Pokémon.`);
        }

        const miPokemon = global.db.data.users[sender].pokemons[miPokemonIndex];
        const suPokemon = global.db.data.users[victimaId].pokemons[suPokemonIndex];

        await m.reply(`⚔️ *¡Desafío de Robo!*\n\n🗡️ Tú: ${miPokemon.name}\n🛡️ Oponente: ${suPokemon.name}\n\n🔍 Calculando resultado...`);

        // Calcular poderes
        const poderMio = calcularPoderPokemon(miPokemon);
        const poderSuyo = calcularPoderPokemon(suPokemon);
        
        // Determinar ganador (con 20% de suerte)
        const suerte = Math.random() * 0.4 - 0.2; // -20% a +20%
        const poderFinalMio = poderMio * (1 + suerte);
        
        const yoGano = poderFinalMio > poderSuyo;

        if (yoGano) {
            // ROBO EXITOSO
            global.db.data.users[sender].pokemons.push(suPokemon);
            global.db.data.users[victimaId].pokemons.splice(suPokemonIndex, 1);
            
            await m.reply(
                `✅ *¡Robo Exitoso!*\n\n` +
                `🎯 Has robado: ${suPokemon.name}\n` +
                `💪 Poder: ${poderSuyo}\n` +
                `📈 Tu poder: ${poderMio}\n\n` +
                `🎉 ¡Ahora es tuyo!`
            );
        } else {
            // ROBO FALLIDO
            await m.reply(
                `❌ *¡Robo Fallido!*\n\n` +
                `🛡️ ${suPokemon.name} es más fuerte\n` +
                `💪 Poder oponente: ${poderSuyo}\n` +
                `📈 Tu poder: ${poderMio}\n\n` +
                `💪 Mejora tus Pokémon con .cosecha`
            );
        }

    } catch (error) {
        console.error('Error en robar:', error);
        await m.reply('❌ *Error en el robo*');
    }
};

handler.tags = ['pokemon', 'game'];
handler.help = ['robar [tu-pokémon] [su-pokémon]', 'robar 2 3 (respondiendo a mensaje)'];
handler.command = ['robar', 'robarpokemon', 'robarpoke'];
export default handler;