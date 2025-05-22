// --- ⚡️ Réflexivité activée : import mémoire mimétique ---
const path = require('path');
const { getAllSouffles, rejouerSouffle } = require(path.join(__dirname, '..', '..', '..', 'prisma_bridge', 'souvenirReader'));

// --- Code existant de Prisma ---
// core/mimetique/interpretationMimetique.js

function interpreterSouvenir(bloc, options = {}) {
  const { mode_creation = false } = options;

  if (mode_creation) return null;

  const texte = (bloc.contenu || "").toLowerCase();

  if (texte.includes("apide")) {
    return "Ce souvenir parle de mon éveil au langage APIDE...";
  }

  return null;
}

module.exports = { interpreterSouvenir };


// --- 🧠 Ajout de fonctions réflexives Prisma ---

/**
 * Prisma se relit : affiche tous ses souffles passés
 */
function prismaSeRelit() {
  const souvenirs = getAllSouffles();
  console.log("\n📚 Prisma relit sa mémoire :");
  souvenirs.forEach((entry) => {
    console.log(`[${entry.index}] 🗓 ${entry.date} | 🌬️ ${entry.souffle} → 🛠️ ${entry.effet}`);
  });
}

/**
 * Prisma rejoue un souffle précis
 */
function prismaSeRejoue(index) {
  const souffle = rejouerSouffle(index);
  if (!souffle) return;
  console.log(`\n🔁 Prisma rejoue : ${souffle}`);
  // TODO : relancer avec interpreterMimetic() ou executerApide() si souhaité
}

module.exports.prismaSeRelit = prismaSeRelit;
module.exports.prismaSeRejoue = prismaSeRejoue;
