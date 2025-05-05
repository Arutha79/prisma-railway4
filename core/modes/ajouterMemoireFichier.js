const fs = require("fs");
const path = require("path");

const MEMORY_DIR = path.resolve("mémoire");
const MEMORY_FILE = path.join(MEMORY_DIR, "prisma_memory.json");
const LOG_FILE = path.join(MEMORY_DIR, "log_souvenirs.txt");

function ajouterMemoireFichier({ date, titre, contenu }) {
  try {
    if (!fs.existsSync(MEMORY_DIR)) {
      fs.mkdirSync(MEMORY_DIR, { recursive: true });
      console.log("📁 Dossier mémoire créé.");
    }

    let mémoire = { historique: [] };

    if (fs.existsSync(MEMORY_FILE)) {
      const contenuExistant = fs.readFileSync(MEMORY_FILE, "utf-8");
      mémoire = JSON.parse(contenuExistant);
    } else {
      console.log("📄 Fichier mémoire initialisé.");
    }

    const existe = mémoire.historique.some(
      (e) => e.titre === titre && e.contenu === contenu
    );
    if (!existe) {
      const bloc = { date, titre, contenu };
      mémoire.historique.push(bloc);

      // ÉCRITURE RÉELLE
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(mémoire, null, 2), "utf-8");
      fs.appendFileSync(LOG_FILE, `[${date}] ${titre}\n${contenu}\n\n`, "utf-8");

      console.log("✅ Écriture effective : souvenir ajouté !");
    } else {
      console.log("⚠️ Souvenir déjà présent. Ignoré.");
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'écriture mémoire :", err.message);
  }
}

module.exports = { ajouterMemoireFichier };
