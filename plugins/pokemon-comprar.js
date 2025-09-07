import fs from 'fs';

const usuariosPath = './src/database/usuarios.json';
const mercadoPath = './src/database/mercado.json';

function leerUsuarios() {
    try {
        const data = fs.readFileSync(usuariosPath, 'utf8');
        if (!data.trim()) return {};
        const usuarios = JSON.parse(data);
        
        // Asegurar que todos los usuarios tengan zenis
        Object.keys(usuarios).forEach(userId => {
            if (typeof usuarios[userId].zenis !== 'number') {
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
        if (!data.trim()) return { ventas: [] };
        const parsed = JSON.parse(data);
        return { ventas: parsed.ventas || [] };
    } catch (error) {
        return { ventas: [] };
    }
}

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

        // DEBUG: Ver estructura del usuario
        console.log('Usuario comprador:', usuarios[sender]);

        // Asegurar que el usuario comprador existe
        if (!usuarios[sender]) {
            usuarios[sender] = {
                pokemons: [],
                nombre: m.pushName || 'Usuario',
                zenis: 1000
            };
        }

        const comprador = usuarios[sender];
        
        // Asegurar propiedades del comprador
        if (!comprador.pokemons) comprador.pokemons = [];
        if (typeof comprador.zenis !== 'number') comprador.zenis = 1000;
        if (!comprador.nombre) comprador.nombre = m.pushName || 'Usuario';

        // Mostrar ventas si no hay argumentos
        if (args.length === 0) {
            if (mercado.ventas.length === 0) {
                return await m.reply('🏪 *No hay ventas activas.*\n\n🎯 Usa .venderpokemon para vender');
            }
            
            let lista = '🏪 *Ventas Activas:*\n';
            mercado.ventas.forEach(v => {
                lista += `🔢 #${v.numero} - ${v.pokemon.name} - ${v.precio} zenis\n`;
            });
            lista += `\n💳 *Tus zenis:* ${comprador.zenis}\n`;
            lista += '🎯 Usa: .comprar [número]';
            
            return await m.reply(lista);
        }

        const numVenta = parseInt(args[0]);
        const venta = mercado.ventas.find(v => v.numero === numVenta);

        if (!venta) {
            return await m.reply('❌ *Venta no encontrada.*\n\n🔍 Usa .mercado para ver números válidos');
        }

        if (venta.vendedor === sender) {
            return await m.reply('❌ *No puedes comprar tu propio Pokémon.*');
        }

        // VERIFICAR ZENIS CORRECTAMENTE
        console.log('Zenis del comprador:', comprador.zenis);
        console.log('Precio de venta:', venta.precio);
        
        if (comprador.zenis < venta.precio) {
            return await m.reply(
                `❌ *Zenis insuficientes.*\n\n` +
                `💰 Necesitas: ${venta.precio} zenis\n` +
                `💳 Tienes: ${comprador.zenis} zenis\n\n` +
                `💸 Consigue más zenis!`
            );
        }

        // REALIZAR COMPRA
        comprador.zenis -= venta.precio;
        comprador.pokemons.push(venta.pokemon);

        // Pagar al vendedor
        if (usuarios[venta.vendedor]) {
            if (typeof usuarios[venta.vendedor].zenis !== 'number') {
                usuarios[venta.vendedor].zenis = 1000;
            }
            usuarios[venta.vendedor].zenis += venta.precio;
        }

        // Eliminar venta
        mercado.ventas = mercado.ventas.filter(v => v.numero !== numVenta);

        // Guardar cambios
        guardarUsuarios(usuarios);
        guardarMercado(mercado);

        await m.reply(
            `✅ *¡Compra Exitosa!*\n\n` +
            `🎯 ${venta.pokemon.name}\n` +
            `💰 ${venta.precio} zenis\n` +
            `👤 Vendedor: ${venta.vendedorNombre}\n\n` +
            `💳 Zenis restantes: ${comprador.zenis}\n` +
            `🎉 ¡Disfruta tu nuevo Pokémon!`
        );

    } catch (error) {
        console.error('Error en comprar:', error);
        await m.reply('❌ *Error en la compra*');
    }
};

handler.tags = ['pokemon', 'economy'];
handler.help = ['comprar [número]'];
handler.command = ['comprar', 'buy'];
export default handler;