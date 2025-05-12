// core/mimetique/genererReponsePrisma.js
const fs = require("fs");
const path = require("path");
const { interpreterSouvenir } = require("./interpretationMimetique");

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");

async function genererReponsePrisma(question, moteurBase, options = {}) {
  const { mode_creation = false } = options;

  const reponseBase = await moteurBase(question);

  if (!mode_creation) {
    try {
      const memoire = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));

      for (const bloc of memoire.historique.slice().reverse()) {
        const interpretation = interpreterSouvenir(bloc, { mode_creation });
        if (interpretation) {
          return `${interpretation}

🧠 Souvenir retrouvé du ${bloc.date} :\n"${bloc.contenu}"`;
        }
      }
    } catch (e) {
      console.warn("❌ Impossible de relire la mémoire :", e.message);
    }
  }

  return reponseBase;
}

module.exports = { genererReponsePrisma };
