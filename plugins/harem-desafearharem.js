import fs from 'fs';
import path from 'path';

const haremsFile = path.resolve('src/database/harems.json');

function loadHarems() {
  try {
    return fs.existsSync(haremsFile) ? JSON.parse(fs.readFileSync(haremsFile, 'utf8')) : {};
  } catch (error) {
    console.error('Error loading harems:', error);
    return {};
  }
}

function saveHarems() {
  try {
    fs.writeFileSync(haremsFile, JSON.stringify(harems, null, 2));
  } catch (error) {
    console.error('Error saving harems:', error);
  }
}

const handler = async (m, { conn }) => {
  let harems = loadHarems();
  const retador = m.sender;
  const oponente = m.mentionedJid?.[0];

  if (!oponente) {
    return await conn.reply(m.chat, '✧ Debes mencionar al maestro que quieres desafiar.', m);
  }

  if (!harems[retador] || !harems[oponente]) {
    return await conn.reply(m.chat, '✧ Ambos deben tener harems creados.', m);
  }

  if (retador === oponente) {
    return await conn.reply(m.chat, '✧ No puedes desafiarte a ti mismo.', m);
  }

  if (harems[retador].miembros.length === 0 || harems[oponente].miembros.length === 0) {
    return await conn.reply(m.chat, '✧ Los harems deben tener al menos 1 miembro.', m);
  }

  // Simular batalla
  const poderRetador = harems[retador].miembros.length * (Math.random() + 0.5);
  const poderOponente = harems[oponente].miembros.length * (Math.random() + 0.5);
  const ganador = poderRetador > poderOponente ? retador : oponente;
  const perdedor = ganador === retador ? oponente : retador;

  // 30% de chance de robar miembro
  let miembroRobado = null;
  let mensajeBotin = '';
  
  if (Math.random() < 0.3 && harems[perdedor].miembros.length > 0 && harems[ganador].miembros.length < 20) {
    miembroRobado = harems[perdedor].miembros[Math.floor(Math.random() * harems[perdedor].miembros.length)];
    harems[perdedor].miembros = harems[perdedor].miembros.filter(m => m !== miembroRobado);
    harems[ganador].miembros.push(miembroRobado);
    saveHarems();
    mensajeBotin = `🎁 @${ganador.split('@')[0]} robó a @${miembroRobado.split('@')[0]} del harem perdedor!`;
  } else {
    mensajeBotin = `✨ Victoria honorable, sin botín.`;
  }

  let mensajeResultado = `⚔️ *BATALLA DE HAREMS* ⚔️\n\n` +
                        `🎯 @${retador.split('@')[0]} vs @${oponente.split('@')[0]}\n\n` +
                        `⚡ Poder: ${poderRetador.toFixed(1)} vs ${poderOponente.toFixed(1)}\n` +
                        `🏆 *GANADOR:* @${ganador.split('@')[0]}\n\n` +
                        `${mensajeBotin}`;

  const mentions = [retador, oponente];
  if (miembroRobado) mentions.push(miembroRobado);

  await conn.sendMessage(m.chat, {
    text: mensajeResultado,
    mentions: mentions
  });
};

handler.tags = ['harem', 'fun'];
handler.help = ['desafiar @maestro'];
handler.command = ['desafiar', 'desafioharem', 'batallaharem'];

export default handler;