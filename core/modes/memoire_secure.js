const fs = require("fs");
const path = require("path");

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");
const LOG_PATH = path.resolve("mémoire/log_souvenirs.txt");

function chargerMemoire() {
  if (!fs.existsSync(MEMOIRE_PATH)) return { historique: [] };
  try {
    const mem = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    if (!Array.isArray(mem.historique)) {
      console.warn("⚠️ Prisma : 'historique' manquant ou mal formé, initialisation forcée.");
      mem.historique = [];
    }
    return mem;
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

function nettoyerRéponseAvantMémoire(contenu) {
  return contenu.replace(/🧠 Souvenir du .*?: \".*?\"/gs, '').trim();
}

function estSouvenirDéjàPrésent(contenu, historique) {
  return historique.some(s => s.contenu === contenu);
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

    const contenuNettoye = nettoyerRéponseAvantMémoire(souvenir.contenu || "");
    if (!contenuNettoye || contenuNettoye.length < 10) return;

    if (estSouvenirDéjàPrésent(contenuNettoye, data.historique)) {
      console.log("⚠️ Souvenir déjà présent, rien ajouté.");
      return;
    }

    const bloc = {
      date: souvenir.date || new Date().toISOString(),
      titre: souvenir.titre || "Souvenir",
      contenu: contenuNettoye,
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
  } catch (err) {
    console.error("❌ Erreur ajout souvenir:", err.message);
  }
}

function appliquerRegleMemoireActive(question) {
  const data = chargerMemoire();
  const regle = data.prisma_memory && data.prisma_memory.règle_mémoire_active;

  if (regle && question.toLowerCase().includes("premier souffle")) {
    console.log("🎯 Règle mémoire active détectée :", regle.nom);
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
