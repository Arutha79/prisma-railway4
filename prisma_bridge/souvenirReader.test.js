const { getAllSouffles, filterByAction, rejouerSouffle } = require('./souvenirReader');

console.log("📦 TEST : Chargement mémoire Prisma");

try {
  const souvenirs = getAllSouffles();
  console.log(`🧠 ${souvenirs.length} souvenirs retrouvés.`);

  console.log("\n🔎 TEST : Filtres mimétiques (action = ⊞)");
  const activations = filterByAction('⊞');
  activations.forEach((s, i) => {
    console.log(`[${i}] 🌬️ ${s.souffle} → 🛠️ ${s.result}`);
  });

  if (souvenirs.length > 0) {
    console.log("\n🔁 TEST : Rejouer un souffle (index 0)");
    const replayed = rejouerSouffle(0);
    console.log(`🌬️ Souffle rejoué : ${replayed}`);
  }

} catch (err) {
  console.error("❌ Erreur pendant les tests :", err);
}