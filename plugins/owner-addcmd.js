const handler = async (m, {conn, text, usedPrefix, command}) => {
  global.db.data.sticker = global.db.data.sticker || {};
  if (!m.quoted) throw `*Responde a un archivo / sticker / imágen*`;
  if (!m.quoted.fileSha256) throw `*Responde a un sticker *`;
  if (!text) throw `*Añade un texto o comando:*\n*—◉ ${usedPrefix + command} #kick*\n\n*Ejemplo de uso:*\n*—◉ ${usedPrefix + command} <#menu> <sticker>*`;
  const sticker = global.db.data.sticker;
  const hash = m.quoted.fileSha256.toString('base64');
  if (sticker[hash] && sticker[hash].locked) throw `*Responde a un sticker*`;
  sticker[hash] = {text, mentionedJid: m.mentionedJid, creator: m.sender, at: + new Date, locked: false};
  m.reply(`*Se añadió con éxito*`);
};
handler.command = ['setcmd', 'addcmd', 'cmdadd', 'cmdset'];
handler.rowner = true;
export default handler;
