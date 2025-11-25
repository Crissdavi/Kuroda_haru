import fetch from 'node-fetch';

// Guarda el historial de consultas por usuario { userId: [timestamps] }
const userQueryTimestamps = {};

// Límite de consultas y tiempo (en ms)
const MAX_QUERIES = 3;
const TIME_WINDOW = 60 * 1000; // 1 minuto

let handler = async (m, { conn, args }) => {
  const userId = m.sender;

  if (!args.length) {
    return conn.reply(m.chat, 'Por favor, especifica un nombre. Ejemplo:\n.nombre Javier Milei', m);
  }

  // Limpiar consultas viejas
  const now = Date.now();
  if (!userQueryTimestamps[userId]) userQueryTimestamps[userId] = [];
  userQueryTimestamps[userId] = userQueryTimestamps[userId].filter(ts => now - ts < TIME_WINDOW);

  if (userQueryTimestamps[userId].length >= MAX_QUERIES) {
    return conn.reply(m.chat, `⚠️ Has alcanzado el límite de ${MAX_QUERIES} consultas por minuto. Por favor, espera un momento antes de intentar de nuevo.`, m);
  }

  // Agregar consulta actual
  userQueryTimestamps[userId].push(now);

  const nombre = args.join(' ');
  const url = 'https://informes.nosis.com/Home/Buscar';

  const headers = {
    'User-Agent': 'Mozilla/5.0',
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  const body = new URLSearchParams({
    Texto: nombre,
    Tipo: '-1',
    EdadDesde: '-1',
    EdadHasta: '-1',
    IdProvincia: '-1',
    Localidad: '',
    recaptcha_response_field: 'enganio al captcha',
    recaptcha_challenge_field: 'enganio al captcha',
    encodedResponse: ''
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body
    });

    if (!res.ok) throw new Error(`Código HTTP: ${res.status}`);

    const data = await res.json();

    if (!Array.isArray(data.EntidadesEncontradas) || data.EntidadesEncontradas.length === 0) {
      return conn.reply(m.chat, '❌ No se encontraron resultados para tu búsqueda.', m);
    }

    let mensaje = `*Resultados encontrados para "${nombre}":*\n\n`;

    data.EntidadesEncontradas.forEach((entidad, i) => {
      mensaje += `
Entidad #${i + 1}:
- Documento: ${entidad.Documento}
- Razón Social: ${entidad.RazonSocial}
- Actividad: ${entidad.Actividad}
- Provincia: ${entidad.Provincia}
`.trim() + '\n\n';
    });

    conn.reply(m.chat, mensaje.trim(), m);
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, `⚠️ Error al consultar el nombre: ${e.message}`, m);
  }
};

handler.help = ['nombre <nombre>'];
handler.command = ['nombre'];
handler.admin = true;
handler.botAdmin = true;
handler.rowner = false;

export default handler;