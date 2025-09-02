const handlerHaremCount = async (m, { conn }) => {
  const groupId = m.chat;
  const userId = m.sender;

  try {
    if (!groups[groupId]) {
      groups[groupId] = { members: [] };
    }

    const haremCount = groups[groupId].members.filter((member) => member === userId).length;

    if (m.mentionedJid && m.mentionedJid[0] === conn.user.jid) {
      await conn.reply(m.chat, `Tienes ${groups[groupId].members.filter((member) => member === userId).length} usuarios en tu harem.`, m);
    } else {
      const mentionedUser = m.mentionedJid?.[0];
      if (!mentionedUser) {
        throw new Error('Debes mencionar a alguien para ver su harem.');
      }

      const mentionedUserHaremCount = groups[groupId].members.filter((member) => member === mentionedUser).length;
      await conn.reply(m.chat, `El usuario @${mentionedUser.split('@')[0]} tiene ${mentionedUserHaremCount} usuarios en su harem.`, m, {
        mentions: [mentionedUser],
      });
    }
  } catch (error) {
    await conn.reply(m.chat, `Error: ${error.message}`, m);
  }
};

handler.tags = ['fun'];
handler.help = ['haremcount'];
handler.command = ['haremcount', 'cuentadeharem'];
handler.group = true;

export { handlerHaremCount };
