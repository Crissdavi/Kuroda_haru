import fs from 'fs';
import path from 'path';

const reportsPath = './src/database/reports.json';
const RECEIVER_NUMBER = '51913776697';

function leerReports() {
    try {
        if (fs.existsSync(reportsPath)) {
            return JSON.parse(fs.readFileSync(reportsPath, 'utf8'));
        }
    } catch (e) {}
    return [];
}

function guardarReports(arr) {
    try {
        const dir = path.dirname(reportsPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(reportsPath, JSON.stringify(arr, null, 2));
    } catch (e) {}
}

let handler = async (m, { conn, args }) => {
    // EVITA CUALQUIER USO DE conn.chatRead o funciones similares
    const text = args.join(' ').trim();
    const sender = m.sender.split('@')[0];

    if (!text) {
        return conn.sendMessage(m.chat, { text: 'Uso: .report mensaje' });
    }

    if (text === '--list') {
        if (sender !== RECEIVER_NUMBER) {
            return conn.sendMessage(m.chat, { text: 'No autorizado' });
        }
        
        const reports = leerReports();
        let listText = '📋 Reportes:\n\n';
        reports.slice(-20).forEach((r, i) => {
            listText += `${i+1}. ${r.from}: ${r.text}\n`;
        });
        
        return conn.sendMessage(m.chat, { text: listText });
    }

    // Guardar reporte
    const reports = leerReports();
    reports.push({
        from: sender,
        text: text,
        time: new Date().toLocaleString()
    });
    guardarReports(reports);

    // Enviar confirmación SIN usar funciones problemáticas
    conn.sendMessage(m.chat, { text: '✅ Reporte enviado' });
};

handler.command = ['report'];
export default handler;