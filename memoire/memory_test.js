// memory_test.js corrigé
const fs = require('fs');
const path = './memoire/prisma_memory.json';

try {
  const data = fs.readFileSync(path, 'utf-8');
  const memoryWrapper = JSON.parse(data);

  const memory = memoryWrapper?.prisma_memory;

  if (!memory) {
    throw new Error("Structure invalide : 'prisma_memory' manquant.");
  }

  console.log('✅ Memoire Prisma chargée avec succès.');

  const questionTest = memory?.règle_mémoire_active?.question_cible;
  const réponseAttendue = memory?.souvenirs?.find(s => s.tags?.includes('#souffle_fondateur'))?.contenu;

  console.log('🧠 Déclencheur :', questionTest || 'Non défini');
  console.log('📌 Réponse fondatrice attendue :', réponseAttendue || 'Non trouvée');

  const historique = memory?.historique || [];
  const dernierBloc = historique[historique.length - 1];

  if (dernierBloc) {
    console.log('\n🗂️ Dernier bloc memoire enregistré :');
    console.log('-', dernierBloc.titre, '→', dernierBloc.contenu);
  } else {
    console.log('\nℹ️ Aucun historique enregistré.');
  }
} catch (err) {
  console.error('❌ Erreur de lecture memoire :', err.message);
}
