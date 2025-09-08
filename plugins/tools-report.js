import fs from 'fs'; 
import path from 'path';

const reportsPath = './src/database/reports.json';
const DATA_DIR = path.dirname(reportsPath);
const RECEIVER_NUMBER = '51913776697';
const RECEIVER_JID = `${RECEIVER_NUMBER}@s.whatsapp.net`;

function leerReports() {
  try {
    const raw = fs.readFileSync(reportsPath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (err) {}
    return [];
  }
}

function guardarReports(arr) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {}
  fs.writeFileSync(reportsPath, JSON.stringify(arr, null, 2));
}

function parseTextFromMessage(m, args = []) {
  if (args && args.length) return args.join(' ').trim();
  if (m.text) return m.text.trim();
  if (m.message && typeof m.message === 'object') {
    const msg = m.message;
    if (msg.conversation) return msg.conversation.trim();
    if (msg.extendedTextMessage && msg.extendedTextMessage.text) return msg.extendedTextMessage.text.trim();
    if (msg.imageMessage && msg.imageMessage.caption) return msg.imageMessage.caption.trim();
    if (msg.videoMessage && msg.videoMessage.caption) return msg.videoMessage.caption.trim();
  }
  return '';
}

let handler = async (m, { conn, args }) => {
  try {
    const sender = m.sender;
    const senderNumber = sender.split('@')[0];
    const fullText = parseTextFromMessage(m, args);
    if (!fullText) {
      await m.reply('Uso: .report [tipo] mensaje\n> Ejemplo: `.report hola w`');
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
      let listText = '---- Lista de reportes ----\n\n';
      latest.forEach((r, i) => {
        listText += `${i + 1}. Desde: ${r.from}\n   Tipo: ${r.type}\n   Texto: ${r.text}\n   Fecha: ${r.time}\n\n`;
      });
      if (listText.length > 6000) {
        const tmpPath = path.join(DATA_DIR, `reportes_${Date.now()}.txt`);
        fs.writeFileSync(tmpPath, listText);
        await conn.sendMessage(sender, { document: fs.readFileSync(tmpPath), fileName: 'reportes.txt', mimetype: 'text/plain' });
        try { fs.unlinkSync(tmpPath); } catch (e) {}
      } else {
        await m.reply(listText);
      }
      return;
    }
    let type = 'general';
    let text = fullText;
    const tokens = fullText.split(/\s+/);
    if (tokens.length >= 2) {
      type = tokens[0];
      text = tokens.slice(1).join(' ');
    }
    const time = new Date().toISOString();
    const reports = leerReports();
    reports.push({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      from: senderNumber,
      type,
      text,
      time
    });
    guardarReports(reports);
    const forwardText = 'Nuevo reporte recibido\nDesde: ' + senderNumber + '\nTipo: ' + type + '\nFecha: ' + time + '\n\nContenido:\n' + text;
    await conn.sendMessage(RECEIVER_JID, { text: forwardText });
    await m.reply('Reporte enviado.');
  } catch (error) {
    console.error('Error en report:', error);
    try {
      await m.reply('ola ,revisa tu consola w.');
    } catch (e) {}
  }
};

handler.tags = ['admin', 'utils'];
handler.help = ['report [tipo] texto', 'report --list'];
handler.command = ['report'];
export default handler;
