import fs from 'fs';
import path from 'path';

const reportsPath = './src/database/reports.json';
const RECEIVER_NUMBER = '51913776697';

// Función segura para enviar mensajes
const safeSend = async (conn, jid, text) => {
    try {
        await conn.sendMessage(jid, { text });
        return true;
    } catch (e) {
        console.log('Error enviando mensaje:', e.message);
        return false;
    }
};

function leerReports() {
    try {
        if (fs.existsSync(reportsPath)) {
            return JSON.parse(fs.readFileSync(reportsPath, 'utf8'));
        }
    } catch (e) {
        console.log('Error leyendo reports:', e.message);
    }
    return [];
}

function guardarReports(arr) {
    try {
        const dir = path.dirname(reportsPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(reportsPath, JSON.stringify(arr, null, 2));
    } catch (e) {
        console.log('Error guardando reports:', e.message);
    }
}

let handler = async (m, { conn, args }) => {
    try {
        const text = args.join(' ').trim();
        const sender = m.sender;

        if (!text) {
            await safeSend(conn, m.chat, 'Uso: .report mensaje');
            return;
        }

        if (text === '--list') {
            if (!sender.endsWith(RECEIVER_NUMBER + '@s.whatsapp.net')) {
                await safeSend(conn, m.chat, 'No autorizado');
                return;
            }
            
            const reports = leerReports();
            let listText = '📋 Últimos reportes:\n\n';
            reports.slice(-10).forEach((r, i) => {
                listText += `${i+1}. ${r.from}: ${r.text}\n`;
            });
            
            await safeSend(conn, m.chat, listText);
            return;
        }

        // Guardar reporte
        const reports = leerReports();
        reports.push({
            from: sender.split('@')[0],
            text: text,
            time: new Date().toLocaleString()
        });
        
        guardarReports(reports);
        await safeSend(conn, m.chat, '✅ Reporte enviado al admin');

    } catch (error) {
        console.error('Error en handler report:', error);
    }
};

handler.command = ['report'];
export default handler;