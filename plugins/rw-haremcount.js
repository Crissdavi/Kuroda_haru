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
      groups[groupId] = { members: [] };
    }

    const haremCount = groups[groupId].members.filter((member) => member === userId).length;
    const mentionedUser = m.mentionedJid?.[0];

    if (mentionedUser) {
      const mentionedUserHaremCount = groups[groupId].members.filter((member) => member === mentionedUser).length;
      await conn.reply(m.chat, `El usuario @${mentionedUser.split('@')[0]} tiene ${mentionedUserHaremCount} usuarios en su harem.`, m, {
        mentions: [mentionedUser],
      });
    } else {
      await conn.reply(m.chat, `Tienes ${haremCount} usuarios en tu harem.`, m);
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