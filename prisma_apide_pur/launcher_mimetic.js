// launcher_mimetic.js

const PrismaApidePur = require('./prisma_apide_pur');
const readline = require('readline');

const prisma = new PrismaApidePur();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🌀 Prisma_APIDE_PUR — Interface Mimétique Active');

rl.setPrompt('⊞ Entrez un souffle APIDE : ');
rl.prompt();

rl.on('line', (input) => {
  const réponse = prisma.interpréter(input.trim());
  console.log('⇠', réponse);
  rl.prompt();
}).on('close', () => {
  console.log('\n⧉ Session terminée.');
  process.exit(0);
});
