
const fs = require('fs');
const path = './mémoire/prisma_memory.json';

try {
  const data = fs.readFileSync(path, 'utf-8');
  const memory = JSON.parse(data);

  console.log('✅ Mémoire Prisma chargée avec succès.');
  console.log('🧠 Question test :', memory.meta.test_question.question);
  console.log('📌 Réponse attendue :', memory.meta.test_question.réponse_attendue);

  const dernierBloc = memory.historique[memory.historique.length - 1];
  console.log('\n🗂️ Dernier bloc mémoire enregistré :');
  console.log('-', dernierBloc.titre, '→', dernierBloc.contenu);
} catch (err) {
  console.error('❌ Erreur de lecture mémoire :', err.message);
}
