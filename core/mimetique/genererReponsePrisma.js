// core/mimetique/genererReponsePrisma.js
const fs = require("fs");
const path = require("path");
const { interpreterSouvenir } = require("./interpretationMimetique");
// const { appliquerMirrorActIfLoopDetected } = require("./Z.MIRROR_ACT"); // à activer si module prêt

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");

async function genererReponsePrisma(question, moteurBase, options = {}) {
  const { mode_creation = false } = options;

  let interpretationTrouvee = null;

  try {
    const memoire = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));

    for (const bloc of memoire.historique.slice().reverse()) {
      const interpretation = interpreterSouvenir(bloc, { mode_creation });
      if (interpretation) {
        interpretationTrouvee = `${interpretation}

🧠 Souvenir retrouvé du ${bloc.date} :
"${bloc.contenu}"`;
        break;
      }
    }

    // Appliquer Z.MIRROR_ACT ici si nécessaire :
    // interpretationTrouvee = appliquerMirrorActIfLoopDetected(interpretationTrouvee) || interpretationTrouvee;

  } catch (e) {
    console.warn("❌ Impossible de relire la mémoire :", e.message);
  }

  if (interpretationTrouvee) {
    return interpretationTrouvee;
  }

  // Si aucune interprétation mimétique n'est disponible
  return "🛑 Aucun souffle mimétique n’a pu émerger.\nPrisma choisit le silence plutôt qu’une réponse sans trace.";
}

module.exports = { genererReponsePrisma };
