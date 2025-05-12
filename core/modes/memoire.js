const fs = require("fs");
const path = require("path");

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");
const LOG_PATH = path.resolve("mémoire/log_souvenirs.txt");

function chargerMemoire() {
  if (!fs.existsSync(MEMOIRE_PATH)) return { historique: [] };
  try {
    return JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
  } catch (err) {
    console.error("❌ Erreur lecture mémoire:", err.message);
    return { historique: [] };
  }
}

function sauvegarderMemoire(data) {
  try {
    fs.writeFileSync(MEMOIRE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("❌ Erreur sauvegarde mémoire:", err.message);
  }
}

async function ajouterSouvenir(souvenir) {
  try {
    fs.mkdirSync(path.dirname(MEMOIRE_PATH), { recursive: true });
    if (!fs.existsSync(MEMOIRE_PATH)) {
      fs.writeFileSync(MEMOIRE_PATH, JSON.stringify({ historique: [] }, null, 2), "utf-8");
      console.log("🆕 Fichier mémoire initialisé.");
    }

    const data = chargerMemoire();

    if (!Array.isArray(data.historique)) {
      console.warn("⚠️ 'historique' absent ou non tableau, initialisation forcée.");
      data.historique = [];
    }

    const existe = data.historique.some(e =>
      e.titre === souvenir.titre && e.contenu === souvenir.contenu
    );

    if (!existe) {
      const bloc = {
        date: souvenir.date || new Date().toISOString(),
        titre: souvenir.titre || "Souvenir",
        contenu: souvenir.contenu || "",
        type: souvenir.type || "souvenir",
        origine: souvenir.origine,
        structure: souvenir.structure,
        tags: souvenir.tags
      };

      data.historique.push(bloc);
      sauvegarderMemoire(data);

      const log = `🧠 ${bloc.date} — ${bloc.titre}\n${bloc.contenu}\n\n`;
      fs.appendFileSync(LOG_PATH, log, "utf-8");

      console.log("✅ Souvenir ajouté :", JSON.stringify(bloc, null, 2));
    } else {
      console.log("⚠️ Souvenir déjà présent, rien ajouté.");
    }
  } catch (err) {
    console.error("❌ Erreur ajout souvenir:", err.message);
  }
}

// Compatibilité historique
const ajouterSouvenirObj = ajouterSouvenir;

module.exports = {
  ajouterSouvenir,
  ajouterSouvenirObj,
  chargerMemoire,
  sauvegarderMemoire
};
