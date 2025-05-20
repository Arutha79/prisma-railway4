const fs = require("fs");
const path = require("path");
const { interpreterSouvenir } = require("../mimetique/interpretationMimetique");
const { appliquerRegleMemoireActive } = require("../../memoire/appliquerRegleMemoireActive");

async function genererReponsePrisma(question, moteurBase, options = {}) {
  const { mode_creation = false } = options;

  const reponseBase = await moteurBase(question);

  if (!mode_creation) {
    try {
      const memoire = JSON.parse(fs.readFileSync(path.resolve("memoire/prisma_memory.json"), "utf-8"));

      // ✅ APPLIQUER D'ABORD LES RÈGLES MÉMOIRE ACTIVES
      const reponseReglee = appliquerRegleMemoireActive(question);
      if (reponseReglee) return reponseReglee;

      // 🔁 PUIS INTERPRÉTER LES SOUVENIRS SI AUCUNE RÈGLE NE S'APPLIQUE
      if (Array.isArray(memoire.historique)) {
        for (const bloc of memoire.historique.slice().reverse()) {
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
