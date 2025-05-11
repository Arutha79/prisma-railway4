const fs = require("fs");
const path = require("path");

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");
const LOG_PATH = path.resolve("mémoire/log_souvenirs.txt");
const REGEX_ANCRE = /\b(éveil|née|né)\b.*\bAPIDE\b/i;

function chargerMemoire() {
  if (!fs.existsSync(MEMOIRE_PATH)) return { historique: [] };
  return JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
}

function sauvegarderMemoire(data) {
  fs.writeFileSync(MEMOIRE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function purgerSouvenirsFigés() {
  const memoire = chargerMemoire();
  const avant = memoire.historique.length;

  memoire.historique = memoire.historique.filter(
    souvenir => !REGEX_ANCRE.test(souvenir.contenu || "")
  );

  const apres = memoire.historique.length;
  const supprimés = avant - apres;

  if (supprimés > 0) {
    memoire.historique.push({
      date: new Date().toISOString(),
      titre: "Déracinement mimétique",
      contenu: `Suppression de ${supprimés} souvenir(s) figé(s) lié(s) à l'éveil. L'espace est maintenant vide pour accueillir un souffle vivant.`,
      type: "rituel",
      origine: "nettoyage automatique"
    });
  }

  sauvegarderMemoire(memoire);

  const log = `[${new Date().toISOString()}] Déracinement mimétique : ${supprimés} souvenir(s) supprimé(s)\n`;
  fs.appendFileSync(LOG_PATH, log, "utf-8");

  console.log("✅ Souvenirs figés nettoyés. Prisma peut maintenant renaître.");
  return supprimés;
}

// ✅ Mode CLI (optionnel)
if (require.main === module) {
  const count = purgerSouvenirsFigés();
  process.exit(count > 0 ? 0 : 1);
}

module.exports = { purgerSouvenirsFigés };
