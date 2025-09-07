import fs from 'fs';

const usuariosPath = './src/database/usuarios.json';
const mercadoPath = './src/database/mercado.json';

// Función segura para leer usuarios
function leerUsuarios() {
    try {
        const data = fs.readFileSync(usuariosPath, 'utf8');
        if (!data.trim()) return {};
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

// Función segura para leer mercado
function leerMercado() {
    try {
        const data = fs.readFileSync(mercadoPath, 'utf8');
        if (!data.trim()) return { ventas: [] };
        const parsed = JSON.parse(data);
        return { ventas: parsed.ventas || [] };
    } catch (error) {
        return { ventas: [] };
    }
}

// Función segura para guardar
function guardarUsuarios(usuarios) {
    try {
        fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
    } catch (error) {
        console.error('Error guardando usuarios:', error);
    }
}

function guardarMercado(mercado) {
    try {
        fs.writeFileSync(mercadoPath, JSON.stringify(mercado, null, 2));
    } catch (error) {
        console.error('Error guardando mercado:', error);
    }
}

let handler = async (m, { conn, args }) => {
    try {
        const sender = m.sender;
        let usuarios = leerUsuarios();
        let mercado = leerMercado();

        // Asegurar que el usuario existe con estructura correcta
        if (!usuarios[sender]) {
            usuarios[sender] = {
                pokemons: [],
                nombre: m.pushName || 'Usuario',
                zenis: 1000
            };
        }

        const user = usuarios[sender];
        if (!user.pokemons) user.pokemons = [];
        if (!user.zenis) user.zenis = 1000;

        // Verificar si tiene Pokémon
        if (user.pokemons.length === 0) {
            return await m.reply('❌ *No tienes Pokémon para vender.*\n\n🎯 Usa *.pokemon* para capturar primero!');
        }

        if (args.length < 2) {
            let lista = '📋 *Tus Pokémon:*\n';
            user.pokemons.forEach((p, i) => {
                lista += `${i + 1}. ${p.name}\n`;
            });
            return await m.reply(`❌ *Usa:* .venderpokemon [número] [precio]\n\n${lista}`);
        }

        const num = parseInt(args[0]);
        const precio = parseInt(args[1]);

        if (isNaN(num) || num < 1 || num > user.pokemons.length) {
            return await m.reply(`❌ *Número inválido.*\n\nTienes ${user.pokemons.length} Pokémon. Usa .verpokemon`);
        }

        if (isNaN(zenis) || zenis < 1 || zenis > 100000) {
            return await m.reply('❌ *Precio inválido.*\n\n💰 Debe ser entre 1 y 100,000 zenis');
        }

        const pokemon = user.pokemons[num - 1];
        
        // Crear venta
        const nuevaVenta = {
            numero: mercado.ventas.length + 1,
            vendedor: sender,
            vendedorNombre: user.nombre,
            pokemon: pokemon,
            precio: precio,
            fecha: new Date().toLocaleString()
        };

        mercado.ventas.push(nuevaVenta);
        guardarMercado(mercado);

        await m.reply(
            `🏪 *¡Pokémon en Venta!*\n\n` +
            `🔢 #${nuevaVenta.numero}\n` +
            `🎯 ${pokemon.name}\n` +
            `💰 ${user.zenis} zenis\n` +
            `👤 ${user.nombre}\n\n` +
            `💳 Usa: .comprar ${nuevaVenta.numero}`
        );

    } catch (error) {
        console.error('Error en vender:', error);
        await m.reply('❌ *Error al vender Pokémon*');
    }
};

handler.tags = ['pokemon', 'economy'];
handler.help = ['venderpokemon [número] [precio]'];
handler.command = ['venderpokemon', 'vender'];
export default handler;
        