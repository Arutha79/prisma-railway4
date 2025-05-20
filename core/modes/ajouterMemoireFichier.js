// ✅ Corrections appliquées à tous les fichiers JS (mémoire ➜ memoire)

// ajouterMemoireFichier.js
const fs = require("fs");
const path = require("path");

const MEMORY_DIR = path.resolve("memoire");
const MEMORY_FILE = path.join(MEMORY_DIR, "prisma_memory.json");
const LOG_FILE = path.join(MEMORY_DIR, "log_souvenirs.txt");

function ajouterMemoireEnrichi(data) {
  try {
    if (!fs.existsSync(MEMORY_DIR)) {
      fs.mkdirSync(MEMORY_DIR, { recursive: true });
      console.log("📁 Dossier memoire créé.");
    }

    let mémoire = { historique: [] };

    if (fs.existsSync(MEMORY_FILE)) {
      const contenuExistant = fs.readFileSync(MEMORY_FILE, "utf-8");
      mémoire = JSON.parse(contenuExistant);
    } else {
      console.log("📄 Fichier memoire initialisé.");
    }

    const existe = mémoire.historique.some(
      (e) => e.titre === data.titre && e.contenu === data.contenu
    );
    if (!existe) {
      mémoire.historique.push(data);

      fs.writeFileSync(MEMORY_FILE, JSON.stringify(mémoire, null, 2), "utf-8");
      fs.appendFileSync(
        LOG_FILE,
        `[${data.date}] ${data.titre}\n${data.contenu}\n\n`,
        "utf-8"
      );

      console.log("✅ Souvenir enrichi ajouté !");
    } else {
      console.log("⚠️ Souvenir déjà existant. Non réécrit.");
    }
  } catch (err) {
    console.error("❌ Erreur ajout memoire enrichie :", err.message);
  }
}

module.exports = { ajouterMemoireEnrichi };
