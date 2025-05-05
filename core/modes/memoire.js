import fs from 'fs';
import path from 'path';

const MEMOIRE_PATH = path.resolve('mémoire/prisma_memory.json');
const LOG_PATH = path.resolve('mémoire/log_souvenirs.txt');

/**
 * Ajoute un souvenir dans la mémoire persistante
 * Format attendu :
 * {
 *   historique: [
 *     { date, titre, contenu, type }
 *   ]
 * }
 */
export function ajouterSouvenir(date, titre, contenu, type = 'souvenir') {
  try {
    // Lire ou initier la mémoire
    const data = fs.existsSync(MEMOIRE_PATH)
      ? JSON.parse(fs.readFileSync(MEMOIRE_PATH, 'utf-8'))
      : { historique: [] };

    // Vérifie si le souvenir existe déjà (évite les doublons)
    const existe = data.historique.some(
      e => e.titre === titre && e.contenu === contenu
    );

    if (!existe) {
      const bloc = { date, titre, contenu, type };
      data.historique.push(bloc);

      // Sauvegarde dans le fichier JSON
      fs.writeFileSync(MEMOIRE_PATH, JSON.stringify(data, null, 2), 'utf-8');

      // Ajout dans le log texte lisible
      const log = `🧠 ${date} — ${titre}\n${contenu}\n\n`;
      fs.appendFileSync(LOG_PATH, log, 'utf-8');

      console.log(`✅ Souvenir enregistré : ${titre}`);
    } else {
      console.log("⚠️ Souvenir déjà présent, rien ajouté.");
    }
  } catch (err) {
    console.error('❌ Erreur écriture mémoire :', err);
  }
}
