// src/harem/storage.js
import fs from "fs"
import path from "path"

const haremFile = path.resolve("src/database/harem.json")
const mastersFile = path.resolve("src/database/harem_masters.json")

// 📌 Función para leer JSON de forma segura
function readJSON(file) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, "{}", "utf-8")
      return {}
    }
    const data = fs.readFileSync(file, "utf-8")
    return data ? JSON.parse(data) : {}
  } catch (e) {
    console.error(`❌ Error leyendo ${file}:`, e)
    return {}
  }
}

// 📌 Función para escribir JSON de forma segura
function writeJSON(file, data) {
  try {
    const tmpFile = file + ".tmp"
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), "utf-8")
    fs.renameSync(tmpFile, file) // escritura atómica
  } catch (e) {
    console.error(`❌ Error guardando ${file}:`, e)
  }
}

// ================== HAREM ==================
export function loadHarem() {
  return readJSON(haremFile)
}

export function updateHarem(data) {
  writeJSON(haremFile, data)
}

// ================== MASTERS ==================
export function loadMasters() {
  return readJSON(mastersFile)
}

export function updateMasters(data) {
  writeJSON(mastersFile, data)
}