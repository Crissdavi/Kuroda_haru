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
      await conn.sendMessage(m.chat, { text: 'Uso: .report [tipo] mensaje\n> Ejemplo: `.report bug el bot no funciona`' }, { quoted: m });
      return;
    }
    
    if (fullText === '--list' || (args && args[0] === '--list')) {
      if (senderNumber !== RECEIVER_NUMBER) {
        await conn.sendMessage(m.chat, { text: '❌ No autorizado. Solo el owner puede ver la lista de reportes.' }, { quoted: m });
        return;
      }
      
      const reports = leerReports();
      if (!reports.length) {
        await conn.sendMessage(m.chat, { text: '📝 No hay reportes guardados.' }, { quoted: m });
        return;
      }
      
      const latest = reports.slice(-100).reverse();
      let listText = '📋 Lista de reportes 📋\n\n';
      latest.forEach((r, i) => {
        listText += `🔸 ${i + 1}. Desde: ${r.from}\n   Tipo: ${r.type}\n   Texto: ${r.text}\n   Fecha: ${r.time}\n\n`;
      });
      
      if (listText.length > 6000) {
        const tmpPath = path.join(DATA_DIR, `reportes_${Date.now()}.txt`);
        fs.writeFileSync(tmpPath, listText);
        await conn.sendMessage(m.chat, { 
          document: fs.readFileSync(tmpPath), 
          fileName: 'reportes.txt', 
          mimetype: 'text/plain',
          caption: '📁 Lista de reportes'
        }, { quoted: m });
        try { fs.unlinkSync(tmpPath); } catch (e) {}
      } else {
        await conn.sendMessage(m.chat, { text: listText }, { quoted: m });
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
    
    const time = new Date().toLocaleString();
    const reports = leerReports();
    
    reports.push({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      from: senderNumber,
      type,
      text,
      time
    });
    
    guardarReports(reports);
    
    const forwardText = `🚨 *Nuevo reporte recibido* 🚨
    
📞 Desde: ${senderNumber}
📊 Tipo: ${type}
📅 Fecha: ${time}

📝 *Contenido:*
${text}`;

    // Enviar al administrador
    await conn.sendMessage(RECEIVER_JID, { text: forwardText });
    
    // Confirmar al usuario
    await conn.sendMessage(m.chat, { 
      text: `✅ *Reporte enviado exitosamente*\n\nEl administrador revisará tu reporte pronto.`
    }, { quoted: m });
    
  } catch (error) {
    console.error('Error en report:', error);
    await conn.sendMessage(m.chat, { 
      text: '❌ *Error al procesar el reporte*\nPor favor intenta nuevamente.' 
    }, { quoted: m });
  }
};

handler.tags = ['admin', 'utils'];
handler.help = ['report [tipo] texto', 'report --list'];
handler.command = ['report'];
handler.category = 'admin';
export default handler;