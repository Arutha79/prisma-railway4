import fs from 'fs';
import path from 'path';

const MEMOIRE_PATH = path.resolve('mémoire/prisma_memory.json');
const LOG_PATH = path.resolve('mémoire/log_souvenirs.txt');

export function ajouterSouvenir(date, titre, contenu, type = 'souvenir') {
  try {
    const data = fs.existsSync(MEMOIRE_PATH)
      ? JSON.parse(fs.readFileSync(MEMOIRE_PATH, 'utf-8'))
      : {};

    data[date] = { titre, contenu, type };

    fs.writeFileSync(MEMOIRE_PATH, JSON.stringify(data, null, 2));
    console.log(`✅ Mémoire écrite dans prisma_memory.json [${titre}]`);

    const log = `🧠 ${date} — ${titre}\n${contenu}\n\n`;
    fs.appendFileSync(LOG_PATH, log, 'utf-8');
    console.log(`📝 Log ajouté dans log_souvenirs.txt`);
  } catch (err) {
    console.error('❌ Erreur écriture mémoire :', err);
  }
}
