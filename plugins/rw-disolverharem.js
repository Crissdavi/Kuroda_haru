// plugins/harem/disolverharem.js
import fs from "fs";
import path from "path";

const haremFile = "./src/database/harem.json");
const mastersFile = "./src/database/harem_masters.json";

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

const handler = async (m, { conn, args }) => {
  const haremMembers = loadHarem();
  const masters = loadMasters();
  const user = m.sender;

  const haremId = args[0];
  if (!haremId) {
    return conn.reply(
      m.chat,
      "《✧》 Debes indicar la *ID del harén* que quieres disolver.\n> Ejemplo » *.disolverharem harem123*",
      m
    );
  }

  if (!masters[user] || masters[user].haremId !== haremId) {
    return conn.reply(
      m.chat,
      "《✧》 Solo el maestro de este harén puede disolverlo.",
      m
    );
  }

  // eliminar miembros del harem
  Object.keys(haremMembers).forEach((member) => {
    if (haremMembers[member].haremId === haremId) {
      delete haremMembers[member];
    }
  });

  // eliminar al maestro
  delete masters[user];

  saveHarem(haremMembers);
  saveMasters(masters);

  return conn.reply(
    m.chat,
    `《✧》 El harén con ID *${haremId}* ha sido disuelto exitosamente.`,
    m
  );
};

handler.help = ["disolverharem <id>"];
handler.tags = ["harem"];
handler.command = /^disolverharem$/i;

export default handler;