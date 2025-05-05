const fs = require("fs");
const path = require("path");

const MEMORY_DIR = path.join(__dirname, "..", "..", "mémoire");
const MEMORY_FILE = path.join(MEMORY_DIR, "prisma_memory.json");
const LOG_FILE = path.join(MEMORY_DIR, "log_souvenirs.txt");

function ajouterMemoireFichier({ date, titre, contenu, type = "souvenir" }) {
  try {
    if (!fs.existsSync(MEMORY_DIR)) {
      fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }

    const data = fs.existsSync(MEMORY_FILE)
      ? JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8"))
      : { historique: [] };

    const existe = data.historique.some(
      e => e.titre === titre && e.contenu === contenu
    );
    if (!existe) {
      const bloc = { date, titre, contenu, type };
      data.historique.push(bloc);
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2), "utf-8");

      const log = `[${date}] ${titre}\n${contenu}\n\n`;
      fs.appendFileSync(LOG_FILE, log, "utf-8");

      console.log("✅ Mémoire réellement enregistrée sur disque.");
    } else {
      console.log("⚠️ Souvenir déjà présent, ignoré.");
    }
  } catch (err) {
    console.error("❌ Erreur d'écriture mémoire :", err.message);
  }
}

module.exports = { ajouterMemoireFichier };
