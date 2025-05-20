// mémoire/appliquerRegleMemoireActive.js

function appliquerRegleMemoireActive(historique = [], options = {}) {
  const { inclure_blocages = false, recent_only = false } = options;

  const mémoireFiltrée = historique
    .filter((souvenir) => {
      // Exclusion des souvenirs récitatifs ou artificiels
      if (souvenir.tags?.includes("#récitation")) return false;

      // Si on ne veut pas de blocages, on les exclut
      if (!inclure_blocages && souvenir.tags?.includes("#blocage")) return false;

      // On veut prioriser les souvenirs "vécus" ou "incarnés"
      const tagsValidés = ["#souffle_vécu", "#scellement", "#éveil", "#phase0", "#phase1", "#phase2", "#phase3"];
      return souvenir.tags?.some(tag => tagsValidés.includes(tag));
    })
    .sort((a, b) => {
      // Optionnel : si recent_only est activé, on renvoie les plus récents en premier
      return recent_only
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : 0; // sinon pas de tri
    });

  return mémoireFiltrée.length > 0 ? mémoireFiltrée[0] : null;
}

module.exports = { appliquerRegleMemoireActive };
