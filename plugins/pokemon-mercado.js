import fs from 'fs';

const mercadoPath = './src/database/mercado.json';

function leerMercado() {
    try {
        const data = fs.readFileSync(mercadoPath, 'utf8');
        return JSON.parse(data) || { ventas: [] };
    } catch (error) {
        return { ventas: [] };
    }
}

let handler = async (m, { conn }) => {
    try {
        const mercado = leerMercado();

        if (mercado.ventas.length === 0) {
            return await m.reply('🏪 *MERCADO POKÉMON*\n\n❌ *No hay Pokémon en venta en este momento.*\n\n🎯 Sé el primero en vender con *.venderpokemon*');
        }

        let message = `🏪 *MERCADO POKÉMON*\n\n`;
        message += `📊 *Pokémon en venta:* ${mercado.ventas.length}\n\n`;

        mercado.ventas.forEach((venta, index) => {
            const statsTotal = Object.values(venta.pokemon.stats || {}).reduce((a, b) => a + b, 0);
            
            message += `🔢 *Venta #${venta.numero}*\n`;
            message += `🎯 *Pokémon:* ${venta.pokemon.name}\n`;
            message += `💰 *Precio:* ${venta.precio} zenis\n`;
            message += `⭐ *Poder:* ${statsTotal}\n`;
            message += `👤 *Vendedor:* ${venta.vendedorNombre}\n`;
            message += `📅 ${venta.fecha}\n`;
            message += `═`.repeat(25) + `\n\n`;
        });

        message += `💳 *Para comprar:* .comprar [número]\n`;
        message += `🎯 *Ejemplo:* .comprar 1`;

        await m.reply(message);

    } catch (error) {
        console.error('Error en mercado:', error);
        await m.reply('❌ *Error al cargar el mercado*');
    }
};

handler.tags = ['pokemon'];
handler.help = ['mercado'];
handler.command = ['mercado', 'tienda', 'market'];
export default handler;