import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return conn.reply(m.chat, 'Por favor, especifica un DNI. Ejemplo:\n.dni 44444444', m);
  }

  const dni = args[0];
  const url = `https://clientes.credicuotas.com.ar/v1/onboarding/resolvecustomers/${dni}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Código HTTP: ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return conn.reply(m.chat, 'No se encontró información para este DNI.', m);
    }

    let mensaje = `*Información asociada al DNI ${dni}:*\n`;

    data.forEach((persona, i) => {
      mensaje += `
Persona #${i + 1}:
- Nombre: ${persona.nombrecompleto}
- CUIT: ${persona.cuit}
- Fecha de nacimiento: ${persona.fechanacimiento}
- Sexo: ${persona.sexo}
`.trim() + '\n\n';
    });

    conn.reply(m.chat, mensaje.trim(), m);
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, `Error al consultar el DNI: ${e.message}`, m);
  }
};

handler.help = ['dni <número>'];
handler.command = ['dni'];
handler.admin = true;
handler.botAdmin = true;
handler.rowner = false;

export default handler;