const fs = require('fs');
const path = require('path');

const PRIMARY_MEMORY = path.resolve('mémoire/prisma_memory.json');

function nettoyerRéponseAvantMémoire(contenu) {
  return contenu.replace(/🧠 Souvenir du .*?: ".*?"/gs, '').trim();
}

function estSouvenirDéjàPrésent(contenu, historique) {
  return historique.some(s => s.contenu === contenu);
}

function ajouterSouvenirSécurisé(reponseBrute) {
  const contenuNettoye = nettoyerRéponseAvantMémoire(reponseBrute);
  if (!contenuNettoye || contenuNettoye.length < 10) return;

  let data;
  try {
    data = fs.readFileSync(PRIMARY_MEMORY, 'utf-8');
  } catch (err) {
    console.error('❌ Impossible de lire la mémoire :', err);
    return;
  }

  let memoire;
  try {
    memoire = JSON.parse(data);
  } catch (err) {
    console.error('❌ Erreur de parsing JSON mémoire :', err);
    return;
  }

  if (!Array.isArray(memoire.historique)) memoire.historique = [];

  if (estSouvenirDéjàPrésent(contenuNettoye, memoire.historique)) return;

  const nouveauSouvenir = {
    date: new Date().toISOString(),
    type: 'souvenir',
    titre: 'Réponse Prisma',
    contenu: contenuNettoye
  };

  memoire.historique.push(nouveauSouvenir);

  try {
    fs.writeFileSync(PRIMARY_MEMORY, JSON.stringify(memoire, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Échec d’écriture mémoire :', err);
  }
}

module.exports = {
  ajouterSouvenirSécurisé
};
