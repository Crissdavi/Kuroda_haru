let handler = async (m, { conn, usedPrefix, command, text }) => {
    let q = text ? text.trim() : '';
    let e = "`";

    if (!q) {
        return conn.reply(m.chat, `⚠️ *CPF inválido!*\n> Para realizar la consulta, escribe el CPF *solo con números*, sin puntos ni guiones.\n> 🔑 Ejemplo de uso: *${e + usedPrefix + command} 12345678909${e}*`, m, rcanal);
    }

    const validarCPF = (cpf) => /^\d{11}$/.test(cpf);
    if (!validarCPF(q)) {
        return conn.reply(m.chat, `🚫 *CPF No Reconocido!*\n> *Error:* ingresa *solo los números* del CPF, sin puntos ni guiones.\n> 📝 Ejemplo: *12345678909*`, m, rcanal);
    }

    await conn.reply(m.chat, `🔍 *Consultando los datos asociados al CPF...* ¡Espera un momento!`, m, rcanal);
    try {
        const response = await fetch(`http://premium.primaryhost.shop:2134/cpf.php?consulta=${q}`);
        const cpf = await response.json();

        if (!cpf.sucess || !cpf.data) {
            return conn.reply(m.chat, "❌ *Error:* No se encontraron datos para este CPF.", m, rcanal);
        }

        let dados = Object.assign({}, ...cpf.data);
        let Jose = `✅ *Consulta Realizada* ✅\n\n`;
        Jose += `\`\`\`CPF:\`\`\` ${q}\n`;
        Jose += `------------------------------\n`;
        Jose += `\`\`\`NOMBRE:\`\`\` ${dados.nome || "No informado"}\n`;
        Jose += `------------------------------\n`;
        Jose += `\`\`\`NACIMIENTO:\`\`\` ${dados.nascimento || "No informado"}\n`;
        Jose += `------------------------------\n`;
        Jose += `\`\`\`SEXO:\`\`\` ${dados.sexo || "No informado"}\n`;
        Jose += `------------------------------\n`;
        Jose += `\`\`\`MADRE:\`\`\` ${dados.mae || "No informado"}\n`;
        Jose += `------------------------------\n`;
        Jose += `\`\`\`PADRE:\`\`\` ${dados.pai || "No informado"}\n`;
        Jose += `------------------------------\n`;
        Jose += `\`\`\`DIRECCIÓN:\`\`\` ${dados.logradouro || "No informado"}\n`;
        Jose += `------------------------------\n`;
        Jose += `\`\`\`BARRIO:\`\`\` ${dados.bairro || "No informado"}\n`;
        Jose += `------------------------------\n`;
        Jose += `\`\`\`CIUDAD:\`\`\` ${dados.cidade || "No informado"}\n`;
        Jose += `------------------------------\n`;
        Jose += `\`\`\`ESTADO:\`\`\` ${dados.estado || "No informado"}\n`;
        Jose += `------------------------------\n`;
        Jose += `\`\`\`PAÍS:\`\`\` ${dados.país || "No informado"}\n`;
        Jose += `------------------------------\n`;
        Jose += `\`\`\`CÓDIGO POSTAL:\`\`\` ${dados.cep || "No informado"}\n`;
        Jose += `------------------------------\n`;
        Jose += `\`\`\`TELÉFONO:\`\`\` ${dados.telefone || "No informado"}`;

        await conn.reply(m.chat, Jose, m, rcanal);
    } catch (error) {
        console.error(error);
        return conn.reply(m.chat, `🤖 ⚠️ ¡Atención! El módulo de PNSApi no devolvió resultados para esta consulta de *CPF*, posiblemente no contiene un registro normalizado, o no se encuentra en nuestras bases de datos.`, m, rcanal);
    }
}

handler.tags = ['consultor'];
handler.help = ['cpf *<numero>*'];
handler.command = ['cpf', 'consultacpf'];
handler.register = true;

export default handler;