import fs from 'fs';
import path from 'path';

const reportsPath = './src/database/reports.json';
const DATA_DIR = path.dirname(reportsPath);
const RECEIVER_NUMBER = '51913776697';
const RECEIVER_JID = `${RECEIVER_NUMBER}@s.whatsapp.net`;

function leerReports() {
  try {
    // Si el archivo no existe, retorna array vacío
    if (!fs.existsSync(reportsPath)) {
      return [];
    }
    
    const raw = fs.readFileSync(reportsPath, 'utf8');
    
    // Si está vacío o es inválido, retorna array vacío
    if (!raw || raw.trim() === '') {
      return [];
    }
    
    const data = JSON.parse(raw);
    
    // Asegura que siempre sea un array
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Error en leerReports:', e);
    return []; // Siempre retorna array vacío
  }
}

function guardarReports(arr) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(reportsPath, JSON.stringify(arr, null, 2));
  } catch (e) {
    console.error('Error en guardarReports:', e);
  }
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
      await conn.sendMessage(m.chat, { text: 'Uso: .report [tipo] mensaje\nEjemplo: `.report bug el bot no funciona`' }, { quoted: m });
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
        listText += `🔸 ${i + 1}. Desde: ${r.from}\n   Tipo: ${r.type || 'general'}\n   Texto: ${r.text}\n   Fecha: ${r.time}\n\n`;
      });
      
      await conn.sendMessage(m.chat, { text: listText }, { quoted: m });
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
    
    // Asegurar que reports es un array antes de usar push
    if (!Array.isArray(reports)) {
      console.error('Reports no es un array:', reports);
      await conn.sendMessage(m.chat, { text: '❌ Error interno: no se pudo guardar el reporte.' }, { quoted: m });
      return;
    }
    
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

    await conn.sendMessage(RECEIVER_JID, { text: forwardText });
    await conn.sendMessage(m.chat, { text: '✅ *Reporte enviado exitosamente*' }, { quoted: m });
    
  } catch (error) {
    console.error('Error en report:', error);
    await conn.sendMessage(m.chat, { text: '❌ Error al procesar el reporte' }, { quoted: m });
  }
};

handler.tags = ['admin', 'utils'];
handler.help = ['report [tipo] texto', 'report --list'];
handler.command = ['report'];
export default handler;