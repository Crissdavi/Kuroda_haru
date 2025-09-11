import fs from 'fs';
import path from 'path';

const mascotasFile = path.resolve('src/database/mascotas.json');

function loadMascotas() {
    try {
        return fs.existsSync(mascotasFile) ? JSON.parse(fs.readFileSync(mascotasFile, 'utf8')) : {};
    } catch (error) {
        console.error('Error loading mascotas:', error);
        return {};
    }
}

function saveMascotas(data) {
    try {
        fs.writeFileSync(mascotasFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving mascotas:', error);
    }
}

function verificarNivel(userId, mascotas) {
    const mascota = mascotas[userId];
    const expNecesaria = mascota.nivel * 100;
    
    if (mascota.experiencia >= expNecesaria) {
        const viejoNivel = mascota.nivel;
        mascota.nivel++;
        mascota.experiencia = 0;
        // Recompensas por subir de nivel
        mascota.hambre = Math.max(0, mascota.hambre - 10);
        mascota.energia = Math.max(0, mascota.energia - 20);
        return viejoNivel;
    }
    return null;
}

const handler = async (m, { conn, usedPrefix }) => {
    const userId = m.sender;
    let mascotas = loadMascotas();

    if (!mascotas[userId]) {
        return await conn.reply(m.chat, 
            `✧ No tienes una mascota.\n` +
            `✧ Usa *${usedPrefix}adoptar* para obtener una.`, m);
    }

    const mascota = mascotas[userId];

    // Verificar si tiene suficiente energía para entrenar
    if (mascota.energia < 30) {
        return await conn.reply(m.chat, 
            `✧ ${mascota.nombre} está muy cansado para entrenar 😴\n` +
            `✧ Energía: ${Math.round(mascota.energia)}%\n` +
            `✧ Necesita al menos 30% de energía para entrenar.`, m);
    }

    // Verificar si no tiene mucha hambre
    if (mascota.hambre < 20) {
        return await conn.reply(m.chat, 
            `✧ ${mascota.nombre} tiene mucha hambre para entrenar 😵\n` +
            `✧ Hambre: ${Math.round(mascota.hambre)}%\n` +
            `✧ Aliméntalo primero con *${usedPrefix}alimentar*.`, m);
    }

    // Calcular recompensas de entrenamiento
    const expGanada = 25 + Math.floor(Math.random() * 10); // 25-34 EXP
    const energiaPerdida = 25;
    const hambrePerdida = 15;

    // Aplicar entrenamiento
    mascota.experiencia += expGanada;
    mascota.energia = Math.max(0, mascota.energia - energiaPerdida);
    mascota.hambre = Math.max(0, mascota.hambre - hambrePerdida);
    mascota.estadisticas.entrenado = (mascota.estadisticas.entrenado || 0) + 1;

    // Verificar si subió de nivel
    const subioNivel = verificarNivel(userId, mascotas);
    
    let mensaje = `💪 *${mascota.nombre} ha completado un entrenamiento!*\n\n` +
                 `✧ EXP: +${expGanada}\n` +
                 `✧ Energía: -${energiaPerdida}%\n` +
                 `✧ Hambre: -${hambrePerdida}%\n\n` +
                 `📊 Estado actual:\n` +
                 `✧ EXP: ${mascota.experiencia}/${mascota.nivel * 100}\n` +
                 `✧ Energía: ${Math.round(mascota.energia)}%\n` +
                 `✧ Hambre: ${Math.round(mascota.hambre)}%`;

    // Mensaje por subir de nivel
    if (subioNivel) {
        mensaje += `\n\n🎉 *¡NIVEL SUBIDO!* ${subioNivel} → ${mascota.nivel}\n` +
                  `✨ ¡${mascota.nombre} es más fuerte ahora!`;
    }

    // Consejos según el estado
    if (mascota.energia < 20) {
        mensaje += `\n\n💡 *Consejo:* ${mascota.nombre} necesita descansar. Usa *${usedPrefix}dormir*`;
    }

    if (mascota.hambre < 30) {
        mensaje += `\n\n💡 *Consejo:* ${mascota.nombre} tiene hambre. Usa *${usedPrefix}alimentar*`;
    }

    saveMascotas(mascotas);
    await conn.reply(m.chat, mensaje, m);
};

handler.tags = ['rpg', 'mascotas'];
handler.help = ['entrenar - Entrenar a tu mascota para ganar más EXP'];
handler.command = ['entrenar', 'train', 'exercise'];

export default handler;