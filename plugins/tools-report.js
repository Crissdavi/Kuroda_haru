import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';

const reportsPath = './src/database/reports.json';
const DB_DIR = path.dirname(reportsPath);
const RECEIVER_NUMBER = '51913776697';
const RECEIVER_JID = `${RECEIVER_NUMBER}@s.whatsapp.net`;

function leerReports() {
  try {
    const raw = fs.readFileSync(reportsPath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    try { if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true }); } catch {}
    return [];
  }
}

function guardarReports(arr) {
  try { if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true }); } catch {}
  fs.writeFileSync(reportsPath, JSON.stringify(arr, null, 2));
}

async function downloadQuotedMedia(quoted) {
  try {
    return await quoted.download?.();
  } catch {
    return null;
  }
}

let handler = async (m, { conn, args = [], text = '', participants = [] }) => {
  try {
    const sender = m.sender;
    const senderNumber = sender.split('@')[0];
    const fullText = text && text.trim() ? text.trim() : (args && args.length ? args.join(' ').trim() : (m.quoted ? (m.quoted.caption || m.quoted.text || '') : (m.text || '')));
    if (!fullText) {
      await m.reply('Uso: .report [tipo] mensaje\n> Ejemplo: .report by masha');
      return;
    }

    if (fullText === '--list' || (args && args[0] === '--list')) {
      if (senderNumber !== RECEIVER_NUMBER) {
        await m.reply('No autorizado. Solo el owner puede ver la lista de reportes.');
        return;
      }
      const reports = leerReports();
      if (!reports.length) {
        await m.reply('No hay reportes guardados.');
        return;
      }
      const latest = reports.slice(-100).reverse();
      let listText = 'Lista de reportes\n\n';
      latest.forEach((r, i) => {
        listText += `${i + 1}. Desde: ${r.from}\n   Tipo: ${r.type}\n   Texto: ${r.text}\n   Fecha: ${r.time}\n\n`;
      });
      if (listText.length > 6000) {
        const tmpPath = path.join(DB_DIR, `reportes_${Date.now()}.txt`);
        fs.writeFileSync(tmpPath, listText);
        await conn.sendMessage(sender, { document: fs.readFileSync(tmpPath), fileName: 'reportes.txt', mimetype: 'text/plain' }, { quoted: m });
        try { fs.unlinkSync(tmpPath); } catch {}
      } else {
        await m.reply(listText);
      }
      return;
    }

    let type = 'general';
    let textReport = fullText;
    const tokens = fullText.split(/\s+/);
    if (tokens.length >= 2) {
      type = tokens[0];
      textReport = tokens.slice(1).join(' ');
    }

    const time = new Date().toISOString();
    const reports = leerReports();
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    reports.push({ id, from: senderNumber, type, text: textReport, time });
    guardarReports(reports);

    const forwardText = 'Nuevo reporte recibido\nDesde: ' + senderNumber + '\nTipo: ' + type + '\nFecha: ' + time + '\n\nContenido:\n' + textReport;

    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || '';
    const isMedia = /image|video|sticker|audio/.test(mime);
    if (isMedia) {
      const mediaBuffer = await downloadQuotedMedia(quoted);
      if (mediaBuffer) {
        if (/image/.test(mime)) await conn.sendMessage(RECEIVER_JID, { image: mediaBuffer, caption: forwardText });
        else if (/video/.test(mime)) await conn.sendMessage(RECEIVER_JID, { video: mediaBuffer, caption: forwardText, mimetype: 'video/mp4' });
        else if (/audio/.test(mime)) await conn.sendMessage(RECEIVER_JID, { audio: mediaBuffer, fileName: 'audio.mp3', mimetype: 'audio/mpeg', caption: forwardText });
        else if (/sticker/.test(mime)) await conn.sendMessage(RECEIVER_JID, { sticker: mediaBuffer });
      } else {
        await conn.sendMessage(RECEIVER_JID, { text: forwardText });
      }
    } else {
      await conn.sendMessage(RECEIVER_JID, { text: forwardText });
    }

    const users = Array.isArray(participants) ? participants.map(u => conn.decodeJid(u.id)) : [];
    const announceText = 'Reporte enviado Xd.';
    const content = { extendedTextMessage: { text: announceText, contextInfo: { mentionedJid: users } } };
    const msg = generateWAMessageFromContent(m.chat, content, { quoted: m, userJid: conn.user.id });
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    await m.reply('Reporte enviado.');

  } catch (error) {
    console.error('Error en report handler:', error);
    try { await m.reply('ola, revisa tu consola w.'); } catch {}
  }
};

handler.tags = ['admin', 'utils'];
handler.help = ['report [tipo] texto', 'report --list'];
handler.command = ['report'];
handler.group = false;
handler.admin = false;
export default handler;
