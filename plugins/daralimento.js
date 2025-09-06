import fs from 'fs';

const usuariosPath = './src/database/usuarios.json';
const alimentosPath = './src/database/alimentos.json';

// Función para leer usuarios
function leerUsuarios() {
    try {
        const data = fs.readFileSync(usuariosPath, 'utf8');
        return JSON.parse(data) || {};
    } catch (error) {
        return {};
    }
}

// Función para leer alimentos
function leerAlimentos() {
    try {
        const data = fs.readFileSync(alimentosPath, 'utf8');
        return JSON.parse(data) || {};
    } catch (error) {
        return {};
    }
}

// Función para guardar usuarios
function guardarUsuarios(usuarios) {
    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
}

// Función para guardar alimentos
function guardarAlimentos(alimentos) {
    fs.writeFileSync(alimentosPath, JSON.stringify(alimentos, null, 2));
}

let handler = async (m, { conn, args }) => {
    try {
        const sender = m.sender;
        const usuarios = leerUsuarios();
        const alimentosUsuarios = leerAlimentos();

        // Verificar si el usuario existe y tiene Pokémon
        if (!usuarios[sender] || usuarios[sender].pokemons.length === 0) {
            return await conn.sendMessage(m.chat, {
                text: '❌ *No tienes Pokémon para alimentar.*\n\n🎯 Primero captura algún Pokémon con *.pokemon*',
                contextInfo: { mentionedJid: [sender] }
            }, { quoted: m });
        }

        // Verificar si tiene alimentos
        if (!alimentosUsuarios[sender] || alimentosUsuarios[sender].inventario.length === 0) {
            return await conn.sendMessage(m.chat, {
                text: '❌ *No tienes alimentos en tu inventario.*\n\n🌿 Consigue alimentos con *.cosecha*',
                contextInfo: { mentionedJid: [sender] }
            }, { quoted: m });
        }

        // Mostrar inventario de alimentos
        if (args.length === 0) {
            let message = `📦 *TU INVENTARIO DE ALIMENTOS*\n\n`;
            
            alimentosUsuarios[sender].inventario.forEach((alimento, index) => {
                message += `${index + 1}. ${alimento.nombre}\n   💫 ${alimento.efecto}\n   🌟 ${alimento.rareza}\n   📅 ${alimento.obtenido}\n\n`;
            });

            message += `🔍 *Usa .usaralimento [número] [pokémon]*\n`;
            message += `📋 *Ejemplo:* .usaralimento 1 3 (usar alimento 1 en Pokémon 3)`;

            return await conn.sendMessage(m.chat, { 
                text: message,
                contextInfo: { mentionedJid: [sender] }
            }, { quoted: m });
        }

        // Procesar uso de alimento
        if (args.length < 2) {
            return await conn.sendMessage(m.chat, {
                text: '❌ *Uso incorrecto.*\n\n📋 Ejemplo: .usaralimento 1 3 (usar alimento 1 en Pokémon 3)',
                contextInfo: { mentionedJid: [sender] }
            }, { quoted: m });
        }

        const numeroAlimento = parseInt(args[0]) - 1;
        const numeroPokemon = parseInt(args[1]) - 1;

        // Validar números
        if (isNaN(numeroAlimento) || isNaN(numeroPokemon) || 
            numeroAlimento < 0 || numeroPokemon < 0 ||
            numeroAlimento >= alimentosUsuarios[sender].inventario.length ||
            numeroPokemon >= usuarios[sender].pokemons.length) {
            
            return await conn.sendMessage(m.chat, {
                text: '❌ *Números inválidos.*\n\n🔍 Usa .usaralimento para ver tu inventario y .verpokemon para ver tus Pokémon.',
                contextInfo: { mentionedJid: [sender] }
            }, { quoted: m });
        }

        const alimento = alimentosUsuarios[sender].inventario[numeroAlimento];
        const pokemon = usuarios[sender].pokemons[numeroPokemon];

        // Aplicar efecto del alimento
        let mensajeEfecto = `🎯 *ALIMENTANDO A ${pokemon.name.toUpperCase()}*\n\n`;
        mensajeEfecto += `🍎 *Alimento usado:* ${alimento.nombre}\n`;
        mensajeEfecto += `💫 *Efecto:* ${alimento.efecto}\n\n`;

        // Aplicar mejoras según el tipo de alimento
        if (alimento.stat === 'hp') {
            pokemon.stats.hp = (pokemon.stats.hp || 0) + alimento.valor;
            mensajeEfecto += `❤️ *HP aumentó:* +${alimento.valor} (Total: ${pokemon.stats.hp})`;
        }
        else if (alimento.stat === 'attack') {
            pokemon.stats.attack = (pokemon.stats.attack || 0) + alimento.valor;
            mensajeEfecto += `⚔️ *Ataque aumentó:* +${alimento.valor} (Total: ${pokemon.stats.attack})`;
        }
        else if (alimento.stat === 'defense') {
            pokemon.stats.defense = (pokemon.stats.defense || 0) + alimento.valor;
            mensajeEfecto += `🛡️ *Defensa aumentó:* +${alimento.valor} (Total: ${pokemon.stats.defense})`;
        }
        else if (alimento.stat === 'speed') {
            pokemon.stats.speed = (pokemon.stats.speed || 0) + alimento.valor;
            mensajeEfecto += `💨 *Velocidad aumentó:* +${alimento.valor} (Total: ${pokemon.stats.speed})`;
        }
        else if (alimento.stat === 'all') {
            Object.keys(pokemon.stats).forEach(stat => {
                pokemon.stats[stat] = (pokemon.stats[stat] || 0) + alimento.valor;
            });
            mensajeEfecto += `✨ *Todos los stats aumentaron:* +${alimento.valor}`;
        }
        else if (alimento.stat === 'mixed') {
            Object.keys(alimento.valor).forEach(stat => {
                pokemon.stats[stat] = (pokemon.stats[stat] || 0) + alimento.valor[stat];
            });
            mensajeEfecto += `⚡ *Mejora múltiple aplicada*`;
        }

        // Remover alimento usado del inventario
        alimentosUsuarios[sender].inventario.splice(numeroAlimento, 1);

        // Guardar cambios
        guardarUsuarios(usuarios);
        guardarAlimentos(alimentosUsuarios);

        // Enviar mensaje de éxito
        await conn.sendMessage(m.chat, { 
            text: mensajeEfecto,
            contextInfo: { mentionedJid: [sender] }
        }, { quoted: m });

    } catch (error) {
        console.error('Error en comando usaralimento:', error);
        await conn.sendMessage(m.chat, {
            text: '❌ *Error al usar el alimento.*\n\n⚠️ Intenta de nuevo más tarde.',
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
    }
};

handler.tags = ['pokemon', 'economy'];
handler.help = ['usaralimento', 'usaralimento [número] [pokémon]'];
handler.command = ['usaralimento', 'darcomida', 'alimentar'];
export default handler;