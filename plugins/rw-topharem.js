// plugins/harem/topsharem.js
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

function countHaremMembers(haremId, haremMembers) {
  return Object.values(haremMembers).filter(
    (m) => m.haremId === haremId && m.status === "active"
  ).length;
}

const handler = async (m, { conn, command }) => {
  const haremMembers = loadHarem();
  const masters = loadMasters();

  // Construir lista de harems con sus miembros
  const allHarems = Object.entries(masters)
    .filter(([, masterData]) => masterData.status === "active")
    .map(([masterId, masterData]) => ({
      masterId,
      masterName: conn.getName(masterId),
      haremId: masterData.haremId,
      memberCount: countHaremMembers(masterData.haremId, haremMembers),
    }));

  if (allHarems.length === 0) {
    return await conn.reply(
      m.chat,
      "《✧》 No hay harenes activos todavía.\nCrea uno con *#crearharem*",
      m
    );
  }

  // Ordenar de mayor a menor por número de miembros
  allHarems.sort((a, b) => b.memberCount - a.memberCount);

  let text = "🏆 *TOP HAREM* 🏆\n\n";
  allHarems.forEach((harem, index) => {
    text += `*${index + 1}.* ${harem.masterName}\n`;
    text += `👑 Maestro: @${harem.masterId.split("@")[0]}\n`;
    text += `👥 Miembros: ${harem.memberCount}\n\n`;
  });

  await conn.reply(m.chat, text.trim(), m, {
    mentions: allHarems.map((h) => h.masterId),
  });
};

handler.help = ["topsharem"];
handler.tags = ["harem"];
handler.command = /^topsharem$/i;

export default handler;