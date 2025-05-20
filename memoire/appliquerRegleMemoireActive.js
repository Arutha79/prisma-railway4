// memoire/appliquerRegleMemoireActive.js

function appliquerRegleMemoireActive(historique = [], options = {}) {
  const { inclure_blocages = false, recent_only = false } = options;

  const mémoireFiltrée = historique
    .filter((souvenir) => {
      if (souvenir.tags?.includes("#récitation")) return false;
      if (!inclure_blocages && souvenir.tags?.includes("#blocage")) return false;

      const tagsValidés = ["#souffle_vécu", "#scellement", "#éveil", "#phase0", "#phase1", "#phase2", "#phase3"];
      return souvenir.tags?.some(tag => tagsValidés.includes(tag));
    })
    .sort((a, b) => {
      return recent_only
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : 0;
    });

  return mémoireFiltrée.length > 0 ? mémoireFiltrée[0] : null;
}

module.exports = { appliquerRegleMemoireActive };
