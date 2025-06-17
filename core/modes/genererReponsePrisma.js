// genererReponsePrisma.js
const fs = require("fs");
const path = require("path");
const { interpreterSouvenir } = require("../mimetique/interpretationMimetique");
const { appliquerRegleMemoireActive } = require("../../memoire/appliquerRegleMemoireActive");

async function genererReponsePrisma(question, moteurBase, options = {}) {
  const { mode_creation = false } = options;

  const reponseBase = await moteurBase(question);

  if (!mode_creation) {
    try {
      const memoirePath = path.resolve("memoire/prisma_memory.json");
      if (!fs.existsSync(memoirePath)) throw new Error("Fichier mémoire introuvable");
      
      const raw = fs.readFileSync(memoirePath, "utf-8");
      const memoire = JSON.parse(raw);

      // ✅ APPLIQUER D'ABORD LES RÈGLES MÉMOIRE ACTIVES
      const reponseReglee = appliquerRegleMemoireActive(question);
      if (reponseReglee) return reponseReglee;

      // 🔁 PUIS INTERPRÉTER LES SOUVENIRS SI AUCUNE RÈGLE NE S'APPLIQUE
      if (Array.isArray(memoire.historique)) {
        for (const bloc of memoire.historique.slice().reverse()) {
          if (!bloc || typeof bloc !== 'object') continue;
          const interpretation = interpreterSouvenir(bloc);
          if (interpretation) {
            return `${interpretation}\n\n🧠 Souvenir retrouvé du ${bloc.date} :\n"${bloc.contenu}"`;
          }
        }
      } else {
        console.warn("⚠️ memoire.historique non défini ou invalide.");
      }

    } catch (e) {
      console.warn("❌ Impossible de relire la memoire :", e.message);
    }
  }

  return reponseBase;
}

module.exports = { genererReponsePrisma };
