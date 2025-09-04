import fs from "fs";
import path from "path";

const unifiedFile = path.resolve("src/database/harems.json");

export function loadHarems() {
  if (!fs.existsSync(unifiedFile)) return {};
  return JSON.parse(fs.readFileSync(unifiedFile, "utf8"));
}

export function saveHarems(data) {
  fs.writeFileSync(unifiedFile, JSON.stringify(data, null, 2));
} 