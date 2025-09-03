// plugins/harem/idharem.js
import fs from "fs";
import path from "path";

const mastersFile = path.resolve("src/database/harem_masters.json");

function loadMasters() {
  if (!fs.existsSync(mastersFile)) return {};
  return JSON.parse(fs.readFileSync(mastersFile, "utf8"));
}

const handler = async (m, { conn }) => {
  const masters = loadMasters();
  const user = m.sender;

  if (!masters[user] || masters[user].status !== "active") {
    return conn.reply(
      m.chat,
      "《✧》 No eres maestro de ningún harén.\nCrea uno con *#crearharem*",
      m
    );
  }

  const { haremId, name } = masters[user];
  const display = name && name.trim() !== "" ? name : haremId;

  let text = `👑 *Tu Harén*\n\n`;
  text += `• Nombre/ID: ${display}\n`;
  text += `• ID real: ${haremId}\n`;

  await conn.reply(m.chat, text.trim(), m);
};

handler.help = ["idharem"];
handler.tags = ["harem"];
handler.command = /^idharem$/i;

export default handler;