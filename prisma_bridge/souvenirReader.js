// souvenirReader.js
const fs = require("fs");
const path = require("path");

const MEMORY_PATH = path.join(__dirname, "..", "..", "prisma_memory.json");

function chargerMemoire() {
  if (!fs.existsSync(MEMORY_PATH)) {
    console.error("❌ Fichier prisma_memory.json introuvable.");
    return [];
  }
  const raw = fs.readFileSync(MEMORY_PATH, "utf-8");
  const contenu = JSON.parse(raw);
  if (Array.isArray(contenu)) {
    return contenu;
  } else if (typeof contenu === "object" && Array.isArray(contenu.historique)) {
    return contenu.historique;
  } else {
    console.error("❌ Format de mémoire non reconnu.");
    return [];
  }
}

function getAllSouffles() {
  return chargerMemoire().map((entry, index) => ({
    index,
    date: entry.timestamp || entry.date || "?",
    souffle: entry.souffle || "—",
    effet: entry.intent?.effect || "—"
  }));
}

function filterByAction(glyphe) {
  return chargerMemoire().filter((entry) => entry.intent?.action === glyphe);
}

function filterByCible(cible) {
  return chargerMemoire().filter((entry) => entry.intent?.target === cible);
}

function rejouerSouffle(index) {
  const memoire = chargerMemoire();
  if (index < 0 || index >= memoire.length) {
    console.warn("❌ Index invalide.");
    return null;
  }
  return memoire[index].souffle || null;
}

module.exports = {
  getAllSouffles,
  filterByAction,
  filterByCible,
  rejouerSouffle,
};
