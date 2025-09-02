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

const handler = async (m, { conn }) => {
  const groupId = m.chat;
  const userId = m.sender;

  try {
    if (!groups[groupId]) {
      groups[groupId] = {};
    }

    if (!groups[groupId][userId]) {
      groups[groupId][userId] = { harem: [] };
    }

    const mentionedUser = m.mentionedJid?.[0];

    if (mentionedUser) {
      if (!groups[groupId][userId].harem.includes(mentionedUser)) {
        groups[groupId][userId].harem.push(mentionedUser);
        saveGroups();
      }

      await conn.reply(m.chat, `El usuario @${mentionedUser.split('@')[0]} ha sido agregado a tu harem.`, m, { mentions: [mentionedUser] });
    } else {
      await conn.reply(m.chat, `Tienes ${groups[groupId][userId].harem.length} usuarios en tu harem.`, m);
    }
  } catch (error) {
    await conn.reply(m.chat, `Error: ${error.message}`, m);
  }
};

handler.tags = ['fun'];
handler.help = ['haremcount'];
handler.command = ['haremcount', 'cuentadeharem'];
handler.group = true;

export default handler;