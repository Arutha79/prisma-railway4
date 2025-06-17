// memoire.js corrigé avec intégration du logger secondaire interaction_history.json
const fs = require("fs");
const path = require("path");

const MEMOIRE_PATH = path.resolve("memoire/prisma_memory.json");
const LOG_PATH = path.resolve("memoire/log_souvenirs.txt");
const { ajouterInteraction } = require("./ajouterInteraction");

function chargerMemoire() {
  if (!fs.existsSync(MEMOIRE_PATH)) return { historique: [] };
  try {
    const mem = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    if (!mem || typeof mem !== "object" || !Array.isArray(mem.historique)) {
      console.warn("⚠️ Prisma : 'historique' manquant ou mal formé, initialisation forcée.");
      return { historique: [] };
    }
    return mem;
  } catch (err) {
    console.error("❌ Erreur lecture memoire:", err.message);
    return { historique: [] };
  }
}

function sauvegarderMemoire(data) {
  try {
    fs.writeFileSync(MEMOIRE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("❌ Erreur sauvegarde memoire:", err.message);
  }
}

async function ajouterSouvenir(souvenir) {
  try {
    fs.mkdirSync(path.dirname(MEMOIRE_PATH), { recursive: true });
    if (!fs.existsSync(MEMOIRE_PATH)) {
      fs.writeFileSync(MEMOIRE_PATH, JSON.stringify({ historique: [] }, null, 2), "utf-8");
      console.log("🆕 Fichier memoire initialisé.");
    }

    let data = chargerMemoire();
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
      ajouterInteraction(bloc); // 🔁 Ajout dans interaction_history.json

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

function appliquerRegleMemoireActive(question) {
  const data = chargerMemoire();
  const regle = data.prisma_memory && data.prisma_memory.règle_memoire_active;

  if (regle && question.toLowerCase().includes("premier souffle")) {
    console.log("🎯 Règle memoire active détectée :", regle.nom);
    console.log("📌 Réponse appliquée :", regle.action);
    return regle.action;
  }

  return null;
}

module.exports = {
  ajouterSouvenir,
  ajouterSouvenirObj: ajouterSouvenir,
  chargerMemoire,
  sauvegarderMemoire,
  appliquerRegleMemoireActive
};
