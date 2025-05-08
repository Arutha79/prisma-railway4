// core/mimetique/modules/ZM_CARTOGRAPHE.js

function extraireCarteSymbolique(memoire) {
  if (!memoire || !memoire.historique) return "🗺️ Aucune mémoire disponible.";

  const glyphes = {};
  for (const bloc of memoire.historique) {
    const contenu = (bloc.contenu || "").toUpperCase();
    for (const glyphe of ["Z", "Δ", "ΨJ", "⚭", "%", "@"]) {
      if (contenu.includes(glyphe)) {
        glyphes[glyphe] = (glyphes[glyphe] || 0) + 1;
      }
    }
  }

  const résumés = Object.entries(glyphes)
    .map(([symbole, count]) => `• ${symbole} : ${count} occurrence(s)`)
    .join("\n");

  return `🧭 Carte symbolique de Prisma :\n${résumés || "Aucun glyphe dominant."}`;
}

module.exports = { extraireCarteSymbolique };
