import fs from 'fs';

const usuariosPath = './src/database/usuarios.json';
const mercadoPath = './src/database/mercado.json';

function leerUsuarios() {
    try {
        const data = fs.readFileSync(usuariosPath, 'utf8');
        const usuarios = JSON.parse(data) || {};
        
        Object.keys(usuarios).forEach(userId => {
            if (!usuarios[userId].pokemons) {
                usuarios[userId].pokemons = [];
            }
            if (usuarios[userId].zenis === undefined) {
                usuarios[userId].zenis = 1000;
            }
        });
        
        return usuarios;
    } catch (error) {
        return {};
    }
}

function leerMercado() {
    try {
        const data = fs.readFileSync(mercadoPath, 'utf8');
        return JSON.parse(data) || { ventas: [] };
    } catch (error) {
        return { ventas: [] };
    }
}

function guardarUsuarios(usuarios) {
    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
}

function guardarMercado(mercado) {
    fs.writeFileSync(mercadoPath, JSON.stringify(mercado, null, 2));
}

let handler = async (m, { conn, args }) => {
    try {
        const sender = m.sender;
        const usuarios = leerUsuarios();
        const mercado = leerMercado();
        
        if (!usuarios[sender]) {
            usuarios[sender] = {
                pokemons: [],
                nombre: m.pushName || 'Usuario',
                zenis: 1000
            };
        }

        if (!Array.isArray(usuarios[sender].pokemons)) {
            usuarios[sender].pokemons = [];
        }

        if (usuarios[sender].pokemons.length === 0) {
            return await m.reply('❌ *No tienes Pokémon para vender.*\n\n🎯 Captura algunos con *.pokemon* primero!');
        }

        if (args.length < 2) {
            let mensaje = '❌ *Faltan argumentos.*\n\n📋 Ejemplo: .venderpokemon 1 500\n';
            mensaje += '• 1 = Número de tu Pokémon (usa .verpokemon para ver números)\n';
            mensaje += '• 500 = Precio en zenis\n\n';
            mensaje += '📋 *Tus Pokémon:*\n';
            
            usuarios[sender].pokemons.forEach((poke, index) => {
                mensaje += `${index + 1}. ${poke.name}\n`;
            });
            
            return await m.reply(mensaje);
        }

        const numeroPokemon = parseInt(args[0]);
        const precio = parseInt(args[1]);

        if (isNaN(numeroPokemon) || isNaN(precio) || numeroPokemon < 1 || precio < 1) {
            return await m.reply('❌ *Números inválidos.*\n\n💰 El precio mínimo es 1 zeni');
        }

        if (numeroPokemon > usuarios[sender].pokemons.length) {
            return await m.reply(`❌ *No tienes ese Pokémon.*\n\n📋 Solo tienes ${usuarios[sender].pokemons.length} Pokémon\n🔍 Usa *.verpokemon* para ver tu lista`);
        }

        if (precio > 100000) {
            return await m.reply('❌ *Precio muy alto.*\n\n💰 El precio máximo es 100,000 zenis');
        }

        const pokemonAVender = usuarios[sender].pokemons[numeroPokemon - 1];

        const venta = {
            numero: mercado.ventas.length + 1,
            vendedor: sender,
            vendedorNombre: usuarios[sender].nombre || 'Usuario',
            pokemon: pokemonAVender,
            precio: precio,
            fecha: new Date().toLocaleString()
        };

        mercado.ventas.push(venta);
        
        guardarUsuarios(usuarios);
        guardarMercado(mercado);

        const mensajeVenta = `🏪 *¡POKÉMON EN VENTA!*\n\n` +
                            `🔢 *Número de venta:* #${venta.numero}\n` +
                            `🎯 *Pokémon:* ${pokemonAVender.name}\n` +
                            `💰 *Precio:* ${precio} zenis\n` +
                            `👤 *Vendedor:* ${usuarios[sender].nombre || 'Tú'}\n\n` +
                            `📊 *Stats totales:* ${Object.values(pokemonAVender.stats || {}).reduce((a, b) => a + b, 0)}\n` +
                            `📅 *Publicado:* ${new Date().toLocaleString()}\n\n` +
                            `🔍 *Usa .mercado para ver todas las ventas*\n` +
                            `💳 *Usa .comprar [número] para comprar*`;

        await m.reply(mensajeVenta);

    } catch (error) {
        console.error('Error en venderpokemon:', error);
        await m.reply('❌ *Error al vender el Pokémon*\n\n⚠️ ' + error.message);
    }
};

handler.tags = ['pokemon', 'economy'];
handler.help = ['venderpokemon [número] [precio]'];
handler.command = ['venderpokemon', 'venderpoke', 'vender'];
export default handler;