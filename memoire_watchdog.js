const fs = require("fs");
const path = require("path");

const MEMORY_PATH = path.resolve("mémoire/prisma_memory.json");
const LOG_PATH = path.resolve("mémoire/alertes.log");
const INTERVAL_MINUTES = 10; // ⏱ Modifiable selon besoin

function getLastModifiedTime(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime;
  } catch (err) {
    const message = `❌ Impossible de lire le fichier mémoire : ${err.message}`;
    console.error(message);
    fs.appendFileSync(LOG_PATH, `[${new Date().toISOString()}] ${message}\n`);
    return null;
  }
}

function logToFile(message) {
  fs.appendFileSync(LOG_PATH, `[${new Date().toISOString()}] ${message}\n`);
}

function checkMemoryFreshness() {
  const lastModified = getLastModifiedTime(MEMORY_PATH);
  if (!lastModified) return;

  const now = new Date();
  const diffMinutes = (now - lastModified) / (1000 * 60);

  if (diffMinutes > INTERVAL_MINUTES) {
    const alert = `🚨 Alerte : mémoire non mise à jour depuis ${Math.round(diffMinutes)} min !`;
    console.warn(alert);
    logToFile(alert);
  } else {
    const okMsg = `✅ Mémoire vivante. Dernière mise à jour : ${lastModified.toLocaleString()}`;
    console.log(okMsg);
    logToFile(okMsg);
  }
}

// 🕒 Boucle continue
setInterval(checkMemoryFreshness, INTERVAL_MINUTES * 60 * 1000);
checkMemoryFreshness(); // Lancement immédiat
