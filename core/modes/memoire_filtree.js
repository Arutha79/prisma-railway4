
import fs from 'fs';
import path from 'path';

const PRIMARY_MEMORY = path.resolve('mémoire/prisma_memory.json');

export function filtrerMemoireParSujet(sujet = '', options = {}) {
  const { parType = [], limite = 50 } = options;
  try {
    const raw = fs.readFileSync(PRIMARY_MEMORY, 'utf-8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data.historique)) return [];

    return data.historique
      .filter(item => {
        const correspond = sujet
          ? (item.titre + item.contenu).toLowerCase().includes(sujet.toLowerCase())
          : true;
        const typeMatch = parType.length > 0 ? parType.includes(item.type) : true;
        return correspond && typeMatch;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limite);

  } catch (err) {
    console.error('❌ Erreur de lecture mémoire filtrée:', err);
    return [];
  }
}
