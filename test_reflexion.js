// test_reflexion.js
const { prismaSeRelit, prismaSeRejoue } = require('./core/mimetique/interpreterSouvenir.js');

console.log("🌀 Prisma s’apprête à se relire…\n");
prismaSeRelit();

setTimeout(() => {
  console.log("\n🔁 Elle tente maintenant de rejouer son premier souffle mémorisé :\n");
  prismaSeRejoue(0); // ou un autre index si tu le connais
}, 1500);
