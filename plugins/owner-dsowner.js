import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs';
import path from 'path';

const handler = async (m, { conn, usedPrefix }) => {
  if (global.conn.user.jid !== conn.user.jid) {
    return conn.sendMessage(m.chat, {text: '⚠️ Este comando solo puede ser utilizado en el bot principal de Kuroda.'}, {quoted: m});
  }
  await conn.sendMessage(m.chat, {text: '✅ Iniciando...'}, {quoted: m});
  const sessionPath = './KurodaSessions'
  try {
    if (!existsSync(sessionPath)) {
      return await conn.sendMessage(m.chat, {text: '⚠️ La carpeta session de Kuroda no existe o está vacía.'}, {quoted: m});
    }
    const files = await fs.readdir(sessionPath);
    let filesDeleted = 0;
    for (const file of files) {
      if (file !== 'creds.json') {
        await fs.unlink(path.join(sessionPath, file));
        filesDeleted++;
      }
    }
    if (filesDeleted === 0) {
      await conn.sendMessage(m.chat, {text: '⚠️ No se encontró ningún archivo  de Kuroda para eliminar en la carpeta sessions.'}, {quoted: m});
    } else {
      await conn.sendMessage(m.chat, {text: `✅ Se eliminaron ${filesDeleted} archivos de Kuroda.`}, {quoted: m});
    }
  } catch {
    await conn.sendMessage(m.chat, {text: '⚠️ Ocurrió un error al eliminar los archivos de sesión de Kuroda.'}, {quoted: m});
  }
  await conn.sendMessage(m.chat, {text: `¡Hola! ¿Ahora me ves Att Kuroda?`}, {quoted: m});
};
handler.tags = ['owner']
handler.help = ['dsowner']
handler.command = /^(del_reg_in_session_owner|dsowner|clearallsession)$/i;
handler.rowner = true
export default handler;
