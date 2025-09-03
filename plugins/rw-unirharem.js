// plugins/harem/unirharem.js
import fs from "fs";
import path from "path";

const haremFile = path.resolve("src/database/harem.json");
const mastersFile = path.resolve("src/database/harem_masters.json");

function loadHarem() {
  if (!fs.existsSync(haremFile)) return {};
  return JSON.parse(fs.readFileSync(haremFile, "utf8"));
}

function loadMasters() {
  if (!fs.existsSync(mastersFile)) return {};
  return JSON.parse(fs.readFileSync(mastersFile, "utf8"));
}

function saveHarem(data) {
  fs.writeFileSync(haremFile, JSON.stringify(data, null, 2));
}

function saveMasters(data) {
  fs.writeFileSync(mastersFile, JSON.stringify(data, null, 2));
}

function getHaremMaster(haremId, masters) {
  return Object.entries(masters).find(
    ([, m]) => m.haremId === haremId
  )?.[0];
}

function countHaremMembers(haremId, haremMembers) {
  return Object.values(haremMembers).filter(
    (m) => m.haremId === haremId && m.status === "active"
  ).length;
}

const handler = async (m, { conn }) => {
  const haremMembers = loadHarem();
  const masters = loadMasters();

  const recruit = m.quoted?.sender || m.mentionedJid?.[0];
  const inviter = m.sender;

  if (!recruit) {
    return conn.reply(
      m.chat,
      "《✧》 Debes mencionar a alguien para invitarlo a tu harén.\n> Ejemplo » *.unirharem @usuario*",
      m
    );
  }

  if (inviter === recruit) {
    return conn.reply(m.chat, "《✧》 No puedes invitarte a ti mismo.", m);
  }

  if (!masters[inviter]) {
    return conn.reply(
      m.chat,
      "《✧》 Solo los maestros con harén pueden invitar.\nUsa *.crearharem* para crear el tuyo.",
      m
    );
  }

  if (haremMembers[recruit] && haremMembers[recruit].status === "active") {
    const currentHaremId = haremMembers[recruit].haremId;
    const currentMaster = getHaremMaster(currentHaremId, masters);
    return conn.reply(
      m.chat,
      `《✧》 ${conn.getName(recruit)} ya pertenece al harén de ${conn.getName(currentMaster)}.`,
      m
    );
  }

  // Añadir automáticamente
  const inviterHaremId = masters[inviter].haremId;
  haremMembers[recruit] = {
    master: inviter,
    haremId: inviterHaremId,
    joinDate: new Date().toISOString(),
    status: "active",
    role: "miembro",
  };
  saveHarem(haremMembers);

  // actualizar contador
  masters[inviter].memberCount = countHaremMembers(inviterHaremId, haremMembers);
  saveMasters(masters);

  await conn.reply(
    m.chat,
    `🌸 ¡${conn.getName(recruit)} se ha unido automáticamente al harén de ${conn.getName(inviter)}! 👑`,
    m,
    { mentions: [recruit, inviter] }
  );
};

handler.help = ["unirharem *@usuario*"];
handler.tags = ["rw"];
handler.command = /^unirharem$/i;

export default handler;