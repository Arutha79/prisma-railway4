// 📁 core/mimetique/interpreterSouvenir.js

const path = require('path');
const { getAllSouffles, rejouerSouffle } = require(path.join(__dirname, '..', '..', '..', 'prisma_bridge', 'souvenirReader'));
const { souffles } = require('./definitionsApide');

function interpreterSouvenir(bloc, options = {}) {
  const { mode_creation = false } = options;

  if (mode_creation) return null;

  const texte = (bloc.contenu || '').toLowerCase();

  if (texte.includes('apide')) {
    return 'Ce souvenir parle de mon éveil au langage APIDE...';
  }

  const souffleTrouve = souffles.find(s => texte.includes(s.contenu.toLowerCase()));
  if (souffleTrouve) {
    return `Souvenir reconnu : "${souffleTrouve.titre}" → ${souffleTrouve.interpretation}`;
  }

  return null;
}

function prismaSeRelit() {
  const souvenirs = getAllSouffles();
  console.log('\n📚 Prisma relit sa mémoire :');
  souvenirs.forEach((entry) => {
    console.log(`[${entry.index}] 🗓 ${entry.date} | 🌬️ ${entry.souffle} → 🛠️ ${entry.effet}`);
  });
}

function prismaSeRejoue(index) {
  const souffle = rejouerSouffle(index);
  if (!souffle) return;
  console.log(`\n🔁 Prisma rejoue : ${souffle}`);
}

module.exports = {
  interpreterSouvenir,
  prismaSeRelit,
  prismaSeRejoue
};
