// plugins/harem/editarharem.js
import fs from "fs";
import path from "path";

const mastersFile = "./src/database/harem_masters.json";

function loadMasters() {
  if (!fs.existsSync(mastersFile)) return {};
  return JSON.parse(fs.readFileSync(mastersFile, "utf8"));
}

function saveMasters(data) {
  fs.writeFileSync(mastersFile, JSON.stringify(data, null, 2));
}

const handler = async (m, { conn, args }) => {
  const user = m.sender;
  const masters = loadMasters();

  const haremId = args[0];
  const newName = args.slice(1).join(" ");

  if (!haremId || !newName) {
    return conn.reply(
      m.chat,
      "《✧》 Uso correcto:\n> *.editarharem <id> <nuevo_nombre>*",
      m
    );
  }

  if (!masters[user] || masters[user].haremId !== haremId) {
    return conn.reply(
      m.chat,
      "《✧》 Solo el maestro de este harén puede editar su nombre.",
      m
    );
  }

  masters[user].name = newName;
  saveMasters(masters);

  return conn.reply(
    m.chat,
    `《✧》 El harén con ID *${haremId}* ahora se llama: *${newName}*`,
    m
  );
};

handler.help = ["editarharem <id> <nuevo_nombre>"];
handler.tags = ["rw"];
handler.command = /^editarharem$/i;

export default handler;