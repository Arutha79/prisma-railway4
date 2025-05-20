const fs = require('fs');
const path = './mémoire/prisma_memory.json';

try {
  const data = fs.readFileSync(path, 'utf-8');
  const memory = JSON.parse(data);

  console.log('✅ Mémoire Prisma chargée avec succès.');

  const questionTest = memory?.prisma_memory?.règle_mémoire_active?.déclencheur;
  const réponseAttendue = memory?.prisma_memory?.souvenirs?.find(s => s.tags?.includes('#souffle_fondateur'))?.contenu;

  console.log('🧠 Déclencheur :', questionTest || 'Non défini');
  console.log('📌 Réponse fondatrice attendue :', réponseAttendue || 'Non trouvée');

  const dernierBloc = memory?.historique?.[memory.historique.length - 1];
  if (dernierBloc) {
    console.log('\n🗂️ Dernier bloc mémoire enregistré :');
    console.log('-', dernierBloc.titre, '→', dernierBloc.contenu);
  } else {
    console.log('\nℹ️ Aucun historique enregistré.');
  }
} catch (err) {
  console.error('❌ Erreur de lecture mémoire :', err.message);
}
