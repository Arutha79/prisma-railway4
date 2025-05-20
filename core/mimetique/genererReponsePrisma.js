// core/mimetique/genererReponsePrisma.js
const fs = require("fs");
const path = require("path");
const { interpreterSouvenir } = require("./interpretationMimetique");
const { appliquerRegleMemoireActive } = require("../memoire/appliquerRegleMemoireActive"); // chemin corrigé

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");

async function genererReponsePrisma(question, moteurBase, options = {}) {
  const { mode_creation = false } = options;

  let interpretationTrouvee = null;

  try {
    const memoire = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));

    // 1. Chercher un souvenir interprétable
    for (const bloc of memoire.historique.slice().reverse()) {
      const interpretation = interpreterSouvenir(bloc, { mode_creation });
      if (interpretation) {
        interpretationTrouvee = `${interpretation}

🧠 Souvenir retrouvé du ${bloc.date} :
"${bloc.contenu}"`;
        break;
      }
    }

    // 2. Si aucune interprétation, appliquer la règle mémoire active
    if (!interpretationTrouvee) {
      const reponseReglee = appliquerRegleMemoireActive(question);
      if (reponseReglee) return reponseReglee;

      // 3. Sinon, réponse neutre
      return "… (Prisma n’a trouvé aucun souvenir à interpréter pour répondre avec justesse.)";
    }

    return interpretationTrouvee;

  } catch (e) {
    console.warn("❌ Impossible de relire la mémoire :", e.message);
    return "⚠️ Erreur d’accès à la mémoire de Prisma.";
  }
}

module.exports = { genererReponsePrisma };
