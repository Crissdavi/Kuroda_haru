import fs from 'fs';

// Función para obtener Pokémon de cualquier base de datos
function obtenerPokemonUsuario(userId) {
    // PRIMERO intentar con global.db
    if (global.db.data.users[userId] && global.db.data.users[userId].pokemons) {
        return global.db.data.users[userId].pokemons;
    }
    
    // SINO intentar con archivo JSON
    try {
        const usuariosPath = './src/database/usuarios.json';
        if (fs.existsSync(usuariosPath)) {
            const data = fs.readFileSync(usuariosPath, 'utf8');
            const usuarios = JSON.parse(data);
            return usuarios[userId]?.pokemons || [];
        }
    } catch (error) {
        console.error('Error leyendo archivo usuarios:', error);
    }
    
    return [];
}

// Función para calcular poder
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
            victimaId = m.quoted.sender;
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            victimaId = m.mentionedJid[0];
        } else {
            return await m.reply('❌ *Debes responder al mensaje de quien quieres robar.*');
        }
        
        if (victimaId === sender) {
            return await m.reply('❌ *No puedes robarte a ti mismo.*');
        }

        // OBTENER POKÉMON DE AMBAS BASES DE DATOS
        const misPokemons = obtenerPokemonUsuario(sender);
        const susPokemons = obtenerPokemonUsuario(victimaId);

        if (misPokemons.length === 0) {
            return await m.reply('❌ *No tienes Pokémon para robar.*\n\n🎯 Usa *.pokemon* primero');
        }

        if (susPokemons.length === 0) {
            return await m.reply('❌ *El usuario no tiene Pokémon para robar.*');
        }

        // Obtener Pokémon específicos
        let miPokemonIndex = 0;
        let suPokemonIndex = 0;

        if (args.length >= 2) {
            miPokemonIndex = parseInt(args[0]) - 1;
            suPokemonIndex = parseInt(args[1]) - 1;
        }

        // Validar índices
        if (isNaN(miPokemonIndex) || miPokemonIndex < 0 || miPokemonIndex >= misPokemons.length) {
            return await m.reply(`❌ *Pokémon inválido.*\n\nTienes ${misPokemons.length} Pokémon. Usa .verpokemon`);
        }

        if (isNaN(suPokemonIndex) || suPokemonIndex < 0 || suPokemonIndex >= susPokemons.length) {
            return await m.reply(`❌ *El usuario no tiene ese Pokémon.*\n\nTiene ${susPokemons.length} Pokémon.`);
        }

        const miPokemon = misPokemons[miPokemonIndex];
        const suPokemon = susPokemons[suPokemonIndex];

        await m.reply(`⚔️ *¡Desafío de Robo!*\n\n🗡️ Tú: ${miPokemon.name}\n🛡️ Oponente: ${suPokemon.name}\n\n🔍 Calculando resultado...`);

        // Calcular poderes y determinar ganador
        const poderMio = calcularPoderPokemon(miPokemon);
        const poderSuyo = calcularPoderPokemon(suPokemon);
        const suerte = Math.random() * 0.4 - 0.2;
        const poderFinalMio = poderMio * (1 + suerte);
        const yoGano = poderFinalMio > poderSuyo;

        if (yoGano) {
            // ROBO EXITOSO - Guardar en ambas bases de datos
            misPokemons.push(suPokemon);
            susPokemons.splice(suPokemonIndex, 1);
            
            // Actualizar global.db si existe
            if (global.db.data.users[sender]) {
                global.db.data.users[sender].pokemons = misPokemons;
            }
            if (global.db.data.users[victimaId]) {
                global.db.data.users[victimaId].pokemons = susPokemons;
            }
            
            // Actualizar archivo JSON si existe
            try {
                const usuariosPath = './src/database/usuarios.json';
                if (fs.existsSync(usuariosPath)) {
                    const data = fs.readFileSync(usuariosPath, 'utf8');
                    const usuarios = JSON.parse(data);
                    if (usuarios[sender]) usuarios[sender].pokemons = misPokemons;
                    if (usuarios[victimaId]) usuarios[victimaId].pokemons = susPokemons;
                    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
                }
            } catch (error) {
                console.error('Error actualizando archivo:', error);
            }

            await m.reply(`✅ *¡Robo Exitoso!*\n\n🎯 Has robado: ${suPokemon.name}\n💪 Poder: ${poderSuyo}\n📈 Tu poder: ${poderMio}\n\n🎉 ¡Ahora es tuyo!`);
        } else {
            await m.reply(`❌ *¡Robo Fallido!*\n\n🛡️ ${suPokemon.name} es más fuerte\n💪 Poder oponente: ${poderSuyo}\n📈 Tu poder: ${poderMio}\n\n💪 Mejora tus Pokémon con .cosecha`);
        }

    } catch (error) {
        console.error('Error en robar:', error);
        await m.reply('❌ *Error en el robo*');
    }
};

handler.tags = ['pokemon', 'game'];
handler.help = ['robar [tu-pokémon] [su-pokémon]'];
handler.command = ['robar', 'robarpokemon', 'robarpoke'];
export default handler;