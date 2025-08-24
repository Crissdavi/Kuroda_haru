import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const input = text?.trim();
    if (!input) {
        return conn.reply(m.chat, '`¡Espera!` *Proporciona una solicitud para responderte.*', m);
    }

    try {
         const estado = await conn.sendMessage(
            m.chat,
            { text: ' 𝙆𝙪𝙧𝙤 𝙚𝙨𝙩𝙖 𝙚𝙨𝙘𝙧𝙞𝙗𝙞𝙚𝙣𝙙𝙤...' },
            { quoted: m }
        );

       
        const res = await fetch(`https://api.sylphy.xyz/ai/chatgpt?text=${encodeURIComponent(input)}&apikey=tesis-me-gustas-uwu`);
        const contentType = res.headers.get('content-type');

        if (contentType.includes('text/html')) {
            return conn.sendMessage(
                m.chat,
                {
                    edit: estado.key,
                    text: '*`¡Perdón!` Parece que mi fuente de datos no pudo procesar tu solicitud, ¡Inténtalo más tarde por favor!*'
                }
            );
        }

        const json = await res.json();
        const respuesta = json?.result?.trim() || '*No puedo responder a eso*';

        setTimeout(async () => {
            await conn.sendMessage(
                m.chat,
                {
                    edit: estado.key,
                    text: respuesta
                }
            );
        }, 4000);

    } catch (error) {
        console.error(error);
        conn.reply(
            m.chat,
            '*¡Disculpe! Parece que estoy algo cansado, vuelve a intentarlo más tarde.*',
            m
        );
    }
};

handler.help = ['Gpt']
handler.tags = ['tools']
handler.command = /^(gpt|Kuro|kuroda)$/i
handler.register = true

export default handler