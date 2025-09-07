import fs from 'fs';

const usuariosPath = './src/database/usuarios.json';
const mercadoPath = './src/database/mercado.json';

function leerUsuarios() {
    try {
        const data = fs.readFileSync(usuariosPath, 'utf8');
        return JSON.parse(data) || {};
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
            return await m.reply('❌ *No tienes cuenta en el sistema.*\n\n🎯 Usa *.pokemon* para empezar!');
        }

        if (args.length === 0) {
            return await m.reply('❌ *Debes especificar un ID.*\n\n📋 Ejemplo: .comprar 123456789\n🔍 Usa *.mercado* para ver los IDs disponibles');
        }

        const idVenta = args[0];
        const venta = mercado.ventas.find(v => v.id === idVenta && !v.vendido);

        if (!venta) {
            return await m.reply('❌ *Venta no encontrada.*\n\n🔍 Verifica el ID o quizás ya fue vendido\n📋 Usa *.mercado* para ver ventas disponibles');
        }

        if (venta.vendedor === sender) {
            return await m.reply('❌ *No puedes comprar tu propio Pokémon.*\n\n😅 Eso sería bastante tonto...');
        }

        // Verificar zenis del comprador
        const zenisComprador = usuarios[sender].zenis || 0;
        if (zenisComprador < venta.precio) {
            return await m.reply(`❌ *No tienes suficientes zenis.*\n\n💰 Necesitas: ${venta.precio} zenis\n💳 Tienes: ${zenisComprador} zenis\n\n💸 Consigue más zenis!`);
        }

        // Verificar si el vendedor todavía existe y tiene zenis
        if (!usuarios[venta.vendedor]) {
            usuarios[venta.vendedor] = {
                pokemons: [],
                nombre: 'Usuario Inactivo',
                zenis: 0
            };
        }

        // REALIZAR LA COMPRA
        usuarios[sender].zenis = zenisComprador - venta.precio;
        usuarios[venta.vendedor].zenis = (usuarios[venta.vendedor].zenis || 0) + venta.precio;
        
        // Transferir Pokémon
        usuarios[sender].pokemons.push(venta.pokemon);
        venta.vendido = true;

        // Guardar cambios
        guardarUsuarios(usuarios);
        guardarMercado(mercado);

        const mensajeCompra = `✅ *¡COMPRA EXITOSA!*\n\n` +
                             `🎯 *Pokémon:* ${venta.pokemon.name}\n` +
                             `💰 *Precio:* ${venta.precio} zenis\n` +
                             `👤 *Vendedor:* ${venta.vendedorNombre}\n\n` +
                             `💳 *Zenis gastados:* ${venta.precio}\n` +
                             `💰 *Zenis restantes:* ${usuarios[sender].zenis}\n\n` +
                             `🎉 ¡Disfruta de tu nuevo Pokémon!`;

        await m.reply(mensajeCompra);

    } catch (error) {
        console.error('Error en comprar:', error);
        await m.reply('❌ *Error al realizar la compra*');
    }
};

handler.tags = ['pokemon'];
handler.help = ['comprar [id]'];
handler.command = ['comprar'];
export default handler;