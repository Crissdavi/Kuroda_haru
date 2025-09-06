import fs from 'fs';

const alimentosPokemon = [
    { 
        nombre: '🍎 Baya Vital', 
        tipo: 'vida', 
        rareza: 'común', 
        efecto: '+5 HP permanente', 
        stat: 'hp', 
        valor: 5,
        emoji: '❤️'
    },
    { 
        nombre: '⚔️ Fruta Atacante', 
        tipo: 'ataque', 
        rareza: 'rara', 
        efecto: '+3 Ataque permanente', 
        stat: 'attack', 
        valor: 3,
        emoji: '⚔️'
    },
    { 
        nombre: '🛡️ Raíz Defensiva', 
        tipo: 'defensa', 
        rareza: 'rara', 
        efecto: '+3 Defensa permanente', 
        stat: 'defense', 
        valor: 3,
        emoji: '🛡️'
    },
    { 
        nombre: '🌀 Esencia Veloz', 
        tipo: 'velocidad', 
        rareza: 'épica', 
        efecto: '+2 Velocidad permanente', 
        stat: 'speed', 
        valor: 2,
        emoji: '💨'
    },
    { 
        nombre: '🌟 Baya Dorada', 
        tipo: 'todas', 
        rareza: 'legendaria', 
        efecto: '+2 a todos los stats', 
        stat: 'all', 
        valor: 2,
        emoji: '✨'
    },
    { 
        nombre: '🍯 Miel Energética', 
        tipo: 'energía', 
        rareza: 'épica', 
        efecto: '+4 HP y +1 Ataque', 
        stat: 'mixed', 
        valor: { hp: 4, attack: 1 },
        emoji: '⚡'
    },
    { 
        nombre: '🌰 Nuez Resistente', 
        tipo: 'defensa', 
        rareza: 'común', 
        efecto: '+2 Defensa permanente', 
        stat: 'defense', 
        valor: 2,
        emoji: '🌰'
    },
    { 
        nombre: '🍓 Fruta Fuerte', 
        tipo: 'ataque', 
        rareza: 'común', 
        efecto: '+2 Ataque permanente', 
        stat: 'attack', 
        valor: 2,
        emoji: '💪'
    }
];

const usuariosPath = './src/database/usuarios.json';
const alimentosPath = './src/database/alimentos.json';

function leerUsuarios() {
    try {
        const data = fs.readFileSync(usuariosPath, 'utf8');
        return JSON.parse(data) || {};
    } catch (error) {
        return {};
    }
}

function leerAlimentos() {
    try {
        const data = fs.readFileSync(alimentosPath, 'utf8');
        return JSON.parse(data) || {};
    } catch (error) {
        return {};
    }
}

function guardarAlimentos(alimentos) {
    fs.writeFileSync(alimentosPath, JSON.stringify(alimentos, null, 2));
}

let handler = async (m, { conn }) => {
    try {
        const sender = m.sender;
        
        const mensajeBusqueda = await conn.sendMessage(m.chat, { 
            text: '🌿 *Buscando alimentos en el bosque...*' 
        }, { quoted: m });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simular búsqueda
        await conn.relayMessage(m.chat, {
            protocolMessage: {
                key: mensajeBusqueda.key,
                type: 14,
                editedMessage: {
                    conversation: '🔍 *Explorando arbustos y árboles...*'
                }
            }
        }, {});

        await new Promise(resolve => setTimeout(resolve, 2000));

        const rand = Math.random();
        let alimentoEncontrado;

        if (rand < 0.5) {
            // Alimentos comunes (50% probabilidad)
            alimentoEncontrado = alimentosPokemon.filter(a => a.rareza === 'común')[
                Math.floor(Math.random() * alimentosPokemon.filter(a => a.rareza === 'común').length)
            ];
        } else if (rand < 0.8) {
            // Alimentos raros (30% probabilidad)
            alimentoEncontrado = alimentosPokemon.filter(a => a.rareza === 'rara')[
                Math.floor(Math.random() * alimentosPokemon.filter(a => a.rareza === 'rara').length)
            ];
        } else if (rand < 0.95) {
            // Alimentos épicos (15% probabilidad)
            alimentoEncontrado = alimentosPokemon.filter(a => a.rareza === 'épica')[
                Math.floor(Math.random() * alimentosPokemon.filter(a => a.rareza === 'épica').length)
            ];
        } else {
            // Alimentos legendarios (5% probabilidad)
            alimentoEncontrado = alimentosPokemon.filter(a => a.rareza === 'legendaria')[
                Math.floor(Math.random() * alimentosPokemon.filter(a => a.rareza === 'legendaria').length)
            ];
        }

        const alimentosUsuarios = leerAlimentos();
        
        if (!alimentosUsuarios[sender]) {
            alimentosUsuarios[sender] = {
                inventario: []
            };
        }

        alimentosUsuarios[sender].inventario.push({
            ...alimentoEncontrado,
            obtenido: new Date().toLocaleDateString()
        });

        guardarAlimentos(alimentosUsuarios);

        await conn.relayMessage(m.chat, {
            protocolMessage: {
                key: mensajeBusqueda.key,
                type: 14,
                editedMessage: {
                    conversation: `🎉 *¡Alimento encontrado!*\n\n${alimentoEncontrado.emoji} *${alimentoEncontrado.nombre}*\n📊 *Tipo:* ${alimentoEncontrado.tipo}\n🌟 *Rareza:* ${alimentoEncontrado.rareza}\n💫 *Efecto:* ${alimentoEncontrado.efecto}\n\n¡Agregado a tu inventario! Usa *.usaralimento* para dárselo a tus Pokémon.`
                }
            }
        }, {});

    } catch (error) {
        console.error('Error en comando cosecha:', error);
        await conn.sendMessage(m.chat, {
            text: '❌ *Error en la cosecha*\n\n🌧️ El clima no fue favorable para buscar alimentos. Intenta de nuevo más tarde.',
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
    }
};

handler.tags = ['pokemon', 'economy'];
handler.help = ['cosecha', 'buscarcomida'];
handler.command = ['cosecha', 'buscarcomida', 'buscaralimento', 'harvest'];
export default handler;