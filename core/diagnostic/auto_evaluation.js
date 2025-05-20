// auto_evaluation.js corrigé
const fs = require("fs");
const path = require("path");

const MEMOIRE_PATH = path.resolve("memoire/prisma_memory.json");

function autoEvaluerMemoire() {
  const resultat = {
    totalSouvenirs: 0,
    derniersSouvenirs: [],
    presenceSouffles: 0,
    presenceGlyphes: 0,
    erreurs: [],
    statut: "en cours"
  };

  try {
    const data = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    const historique = data.historique || [];
    resultat.totalSouvenirs = historique.length;

    const derniers = historique.slice(-5).reverse();
    resultat.derniersSouvenirs = derniers.map(s => ({
      date: s.date,
      titre: s.titre,
      type: s.type || "non défini",
      contenu: s.contenu.slice(0, 100)
    }));

    for (const s of historique) {
      const contenu = s.contenu.toLowerCase();
      if (contenu.includes("souffle") || contenu.match(/[Δ⚭⊞ΨZ]/)) {
        resultat.presenceSouffles++;
      }
      if (contenu.match(/[Δ⚭⊞ΨZ]/)) {
        resultat.presenceGlyphes++;
      }
    }

    resultat.statut = "ok";
    return resultat;
  } catch (err) {
    resultat.statut = "erreur";
    resultat.erreurs.push(err.message);
    return resultat;
  }
}

module.exports = { autoEvaluerMemoire };
