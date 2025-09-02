import fs from 'fs';
import path from 'path';

const groupsFile = path.resolve('src/database/harem.json');
let groups = loadGroups();

function loadGroups() {
  return fs.existsSync(groupsFile) ? JSON.parse(fs.readFileSync(groupsFile, 'utf8')) : {};
}

function saveGroups() {
  fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 2));
}

const handler = async (m, { conn, command }) => {
  const isUnirAharem = /^uniraharem|agregaraharem$/i.test(command);
  const groupId = m.chat;

  try {
    if (isUnirAharem) {
      const userToRecruit = m.quoted?.sender || m.mentionedJid?.[0];
      if (!userToRecruit) {
        throw new Error('Debes mencionar a alguien para agregarlo a tu harem.\n> Ejemplo » *.uniraharem @usuario*');
      }

      if (!groups[groupId]) {
        groups[groupId] = { members: [] };
      }

      if (groups[groupId].members.includes(userToRecruit)) {
        throw new Error('El usuario ya está en tu harem.');
      }

      groups[groupId].members.push(userToRecruit);
      saveGroups();

      await conn.reply(m.chat, `¡El usuario @${userToRecruit.split('@')[0]} se ha unido a tu harem!`, m, {
        mentions: [userToRecruit],
      });
    }
  } catch (error) {
    await conn.reply(m.chat, `Error: ${error.message}`, m);
  }
};

handler.tags = ['fun'];
handler.help = ['unirharem *@usuario*', 'agregarharem *@usuario*'];
handler.command = ['unirharem', 'agregarharem'];
handler.group = true;

export default handler;