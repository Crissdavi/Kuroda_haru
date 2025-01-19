import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
if (!text) return conn.reply(m.chat, 'Escribe un texto para hablar con koruda', m);

try {
let msg = await conn.sendMessage(m.chat, {text: '*koruda esta escribiendo.....*'});

let userid = conn.getName(m.sender) || 'default';
let apiurl = `https://restapi.apibotwa.biz.id/api/gptlogic?message=${encodeURIComponent(text)}`;
let result = await fetch(apiurl);
let response = await result.json();

await conn.relayMessage(m.chat, { protocolMessage: { key: msg.key, type: 14, editedMessage: { conversation: response.msg }}}, {});
} catch {}}

handler.command = handler.help = ["chatgpt", "ia"];

export default handler
