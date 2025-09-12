import fs from 'fs';

const mercadoPath = './src/database/mercadobot.json';
const usuariosPath = './src/database/usuarios.json';

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

// Función para leer usuarios
function leerUsuarios() {
    try {
        const data = fs.readFileSync(usuariosPath, 'utf8');
        return JSON.parse(data) || {};
    } catch (error) {
        return {};
    }
}

// Función para guardar usuarios
function guardarUsuarios(usuarios) {
    try {
        fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
    } catch (error) {
        console.error('Error guardando usuarios:', error);
    }
}

// Función para guardar mercado bot
function guardarMercadoBot(mercado) {
    try {
        fs.writeFileSync(mercadoPath, JSON.stringify(mercado, null, 2));
    } catch (error) {
        console.error('Error guardando mercado bot:', error);
    }
}

let handler = async (m, { conn, args }) => {
    try {
        const sender = m.sender;
        let mercado = leerMercadoBot();
        const usuarios = leerUsuarios();
        const hoy = new Date().toDateString();

        // Verificar si el mercado está actualizado
        if (mercado.ultimaActualizacion !== hoy) {
            return await m.reply('🔄 *El mercado se actualizó.*\n\n📋 Usa *.mercado* para ver los nuevos Pokémon.');
        }

        if (args.length === 0) {
            return await m.reply('❌ *Debes especificar un número.*\n\n📋 Ejemplo: .comprarbot 1');
        }

        const numeroPokemon = parseInt(args[0]);
        const pokemon = mercado.pokemons.find(p => p.id === numeroPokemon);

        if (!pokemon) {
            return await m.reply('❌ *Pokémon no encontrado.*\n\n🔍 Usa *.mercado* para ver números válidos.');
        }

        // Verificar si ya compró hoy
        if (mercado.comprasHoy[sender] >= 1) {
            return await m.reply('❌ *Ya compraste hoy.*\n\n⏰ Solo puedes comprar 1 Pokémon por día.\n🔄 Vuelve mañana.');
        }

        // VERIFICACIÓN Y RESTA (CÓDIGO CORREGIDO)
        // 1. Asegurarse de que el usuario existe en la DB global
        if (!global.db.data.users[sender]) {
            // Si no existe, inicializarlo con 0 zenis
            global.db.data.users[sender] = { zenis: 0 };
        }

        // 2. Ahora sí, verificar si tiene zenis suficientes
        if (global.db.data.users[sender].zenis < pokemon.precio) {
            return await m.reply(`❌ *Zenis insuficientes.*\n\n💰 Necesitas: ${pokemon.precio} zenis\n💳 Tienes: ${global.db.data.users[sender].zenis} zenis`);
        }

        // 3. Restar los zenis (AHORA es seguro hacerlo)
        global.db.data.users[sender].zenis -= pokemon.precio;

        // Asegurar que el usuario existe en usuarios.json
        if (!usuarios[sender]) {
            usuarios[sender] = {
                pokemons: [],
                nombre: global.db.data.users[sender]?.name || 'Usuario'
            };
        }

        // REALIZAR COMPRA
        // Agregar Pokémon al usuario en usuarios.json
        usuarios[sender].pokemons.push({
            id: pokemon.id,
            name: pokemon.name,
            image: pokemon.image,
            height: pokemon.height,
            weight: pokemon.weight,
            types: pokemon.types,
            stats: pokemon.stats,
            captured: new Date().toLocaleDateString(),
            rareza: pokemon.rareza
        });

        // Marcar como comprado hoy
        mercado.comprasHoy[sender] = (mercado.comprasHoy[sender] || 0) + 1;

        // Eliminar Pokémon del mercado
        mercado.pokemons = mercado.pokemons.filter(p => p.id !== numeroPokemon);

        // Guardar cambios
        guardarUsuarios(usuarios);
        guardarMercadoBot(mercado);

        await conn.sendFile(
            m.chat,
            pokemon.image,
            'pokemon.png',
            `✅ *¡COMPRA EXITOSA!*\n\n🎯 ${pokemon.name}\n${pokemon.rareza}\n💰 ${pokemon.precio} zenis\n📊 Poder: ${pokemon.poderTotal}\n\n💳 Zenis restantes: ${global.db.data.users[sender].zenis}\n🎉 ¡Disfruta tu nuevo Pokémon!`,
            m
        );

    } catch (error) {
        console.error('Error en comprarbot:', error);
        await m.reply('❌ *Error en la compra*');
    }
};

handler.tags = ['pokemon', 'economy'];
handler.help = ['comprarpoke [número]'];
handler.command = ['comprarpoke'];
export default handler;