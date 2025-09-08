import fs from 'fs';
import path from 'path';

const reportsPath = './src/database/reports.json';
const RECEIVER_NUMBER = '51913776697';

function leerReports() {
  try {
    if (!fs.existsSync(reportsPath)) return [];
    const data = fs.readFileSync(reportsPath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
}

let handler = async (m, { conn, args }) => {
  try {
    const text = args.join(' ').trim();
    const sender = m.sender.split('@')[0];
    
    if (!text) {
      return await conn.sendMessage(m.chat, { text: 'Uso: .report mensaje' });
    }
    
    if (text === '--list') {
      if (sender !== RECEIVER_NUMBER) {
        return await conn.sendMessage(m.chat, { text: 'No autorizado' });
      }
      
      const reports = leerReports();
      let listText = 'Reportes:\n\n';
      reports.forEach((r, i) => {
        listText += `${i+1}. ${r.from}: ${r.text}\n`;
      });
      
      return await conn.sendMessage(m.chat, { text: listText });
    }
    
    // Guardar reporte
    const reports = leerReports();
    reports.push({
      from: sender,
      text: text,
      time: new Date().toLocaleString()
    });
    
    fs.writeFileSync(reportsPath, JSON.stringify(reports, null, 2));
    await conn.sendMessage(m.chat, { text: '✅ Reporte enviado' });
    
  } catch (error) {
    console.error('Error:', error);
    await conn.sendMessage(m.chat, { text: '❌ Error' });
  }
};

handler.command = ['report'];
export default handler;