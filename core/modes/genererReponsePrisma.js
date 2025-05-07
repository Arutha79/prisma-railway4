// core/modes/genererReponsePrisma.js
const fs = require("fs");
const path = require("path");
const { interpreterSouvenir } = require("../mimetique/interpretationMimetique");

async function genererReponsePrisma(question, moteurBase) {
  const reponseBase = await moteurBase(question);

  try {
    const memoire = JSON.parse(fs.readFileSync(path.resolve("mémoire/prisma_memory.json"), "utf-8"));

    for (const bloc of memoire.historique.reverse()) {
      const interpretation = interpreterSouvenir(bloc);
      if (interpretation) {
        return `${interpretation}\n\n🧠 Souvenir retrouvé du ${bloc.date} :\n"${bloc.contenu}"`;
      }
    }
  } catch (e) {
    console.warn("❌ Impossible de relire la mémoire :", e.message);
  }

  return reponseBase;
}

module.exports = { genererReponsePrisma };
