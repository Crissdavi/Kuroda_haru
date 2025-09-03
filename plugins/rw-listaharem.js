// plugins/harem/listarharem.js
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

const handler = async (m, { conn, args }) => {
  const haremId = args[0];
  if (!haremId) {
    return conn.reply(
      m.chat,
      "《✧》 Uso correcto:\n> *.listarharem <id>*",
      m
    );
  }

  const haremMembers = loadHarem();
  const masters = loadMasters();
  const masterEntry = Object.entries(masters).find(
    ([, data]) => data.haremId === haremId
  );

  if (!masterEntry) {
    return conn.reply(m.chat, "《✧》 No existe ningún harén con esa ID.", m);
  }

  const [masterId, masterData] = masterEntry;
  const haremName = masterData.name && masterData.name.trim() !== "" 
    ? masterData.name 
    : masterData.haremId;

  const members = Object.entries(haremMembers)
    .filter(([, m]) => m.haremId === haremId && m.status === "active")
    .map(([id]) => id);

  let text = `👑 *Harén*: ${haremName}\n`;
  text += `👑 Maestro: @${masterId.split("@")[0]}\n`;
  text += `👥 Miembros (${members.length}):\n`;

  if (members.length === 0) {
    text += "— (Vacío)\n";
  } else {
    members.forEach((m, i) => {
      text += ` ${i + 1}. @${m.split("@")[0]}\n`;
    });
  }

  await conn.reply(m.chat, text.trim(), m, {
    mentions: [masterId, ...members],
  });
};

handler.help = ["listarharem <id>"];
handler.tags = ["harem"];
handler.command = /^listarharem$/i;

export default handler;