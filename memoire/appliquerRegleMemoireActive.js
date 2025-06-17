// appliquerRegleMemoireActive.js

function appliquerRegleMemoireActive(historique = [], options = {}) {
  const { inclure_blocages = false, recent_only = false } = options;

  const mémoireFiltrée = Array.isArray(historique)
    ? historique
        .filter((souvenir) => {
          if (souvenir.tags?.includes("#récitation")) return false;
          if (!inclure_blocages && souvenir.tags?.includes("#blocage")) return false;

          const tagsValidés = [
            "#souffle_vécu",
            "#scellement",
            "#éveil",
            "#phase0",
            "#phase1",
            "#phase2",
            "#phase3"
          ];
          return souvenir.tags?.some(tag => tagsValidés.includes(tag));
        })
        .sort((a, b) => {
          return recent_only
            ? new Date(b.date || b.timestamp || 0).getTime() - new Date(a.date || a.timestamp || 0).getTime()
            : 0;
        })
    : [];

  return mémoireFiltrée.length > 0 ? mémoireFiltrée[0] : null;
}

module.exports = { appliquerRegleMemoireActive };
