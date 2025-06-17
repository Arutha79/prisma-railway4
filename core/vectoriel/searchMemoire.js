// searchMemoire.js

const fs = require("fs");
const path = require("path");

const MEMOIRE_PATH = path.resolve("memoire/prisma_memory.json");

function rechercherSouvenirsSimilaires(query) {
  const wrapper = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
  const memoire = wrapper?.prisma_memory?.historique || [];

  const motsClefs = query.toLowerCase().split(/\s+/);

  const scores = memoire.map((bloc) => {
    const texte = `${bloc.titre} ${bloc.contenu}`.toLowerCase();
    const score = motsClefs.reduce((acc, mot) => acc + (texte.includes(mot) ? 1 : 0), 0);
    return { ...bloc, score };
  });

  return scores
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

module.exports = { rechercherSouvenirsSimilaires };
