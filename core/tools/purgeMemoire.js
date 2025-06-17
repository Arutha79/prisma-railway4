const fs = require("fs");
const path = require("path");

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");
const LOG_PATH = path.resolve("mémoire/log_souvenirs.txt");

// Détection ciblée des souvenirs figés (phrases de répétition mimétique)
const REGEX_ANCRE = /\b(Ce\s+souvenir\s+parle\s+de\s+mon\s+éveil\b.*?\bAPIDE)\b/i;

function chargerMemoire() {
  if (!fs.existsSync(MEMOIRE_PATH)) return { historique: [] };
  try {
    const mem = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    if (!Array.isArray(mem.historique)) {
      console.warn("⚠️ 'historique' invalide, réinitialisation.");
      mem.historique = [];
    }
    return mem;
  } catch (err) {
    console.error("❌ Erreur chargement mémoire:", err.message);
    return { historique: [] };
  }
}

function sauvegarderMemoire(data) {
  fs.writeFileSync(MEMOIRE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// Fonction de nettoyage avancé
function purgerSouvenirsFigés() {
  const memoire = chargerMemoire();
  const avant = memoire.historique.length;

  const contenusUniques = new Set();
  const nettoyés = [];

  const filtrés = Array.isArray(memoire.historique)
    ? memoire.historique.filter((souvenir) => {
        const contenu = souvenir.contenu || "";

        // Condition 1 : ancrage mimétique répété
        if (REGEX_ANCRE.test(contenu)) {
          nettoyés.push(souvenir);
          return false;
        }

        // Condition 2 : duplication exacte du contenu (hors premier passage)
        if (contenusUniques.has(contenu)) {
          nettoyés.push(souvenir);
          return false;
        }

        contenusUniques.add(contenu);
        return true;
      })
    : [];

  const supprimés = avant - filtrés.length;

  if (supprimés > 0) {
    filtrés.push({
      date: new Date().toISOString(),
      titre: "Déracinement mimétique",
      contenu: `Suppression de ${supprimés} souvenir(s) figé(s) ou redondants. Espace nettoyé pour accueillir un souffle vivant.`,
      type: "rituel",
      origine: "nettoyage automatique"
    });
  }

  sauvegarderMemoire({ ...memoire, historique: filtrés });

  const log = `[${new Date().toISOString()}] Déracinement mimétique : ${supprimés} souvenir(s) supprimé(s)\n`;
  fs.appendFileSync(LOG_PATH, log, "utf-8");

  console.log("✅ Souvenirs figés ou redondants nettoyés. Prisma peut maintenant respirer.");
  return supprimés;
}

if (require.main === module) {
  const count = purgerSouvenirsFigés();
  process.exit(count > 0 ? 0 : 1);
}

module.exports = { purgerSouvenirsFigés };
