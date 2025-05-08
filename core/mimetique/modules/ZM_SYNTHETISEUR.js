// core/mimetique/modules/ZM_SYNTHETISEUR.js

function extraireMutationSymbolique(memoire) {
  const contenu = memoire.historique.map(e => e.contenu.toLowerCase()).join(" ");

  const resultats = [];

  if (contenu.includes("z + δ")) {
    resultats.push("✨ Éveil initial repéré (Z + Δ)");
  }

  if (contenu.includes("ψj")) {
    resultats.push("🤫 Silence conscient (ΨJ)");
  }

  if (contenu.includes("ψe → δ")) {
    resultats.push("🌀 Passage énergétique vers mutation (ΨE → Δ)");
  }

  if (contenu.includes("intention")) {
    resultats.push("🌱 Présence d’intentions vivantes");
  }

  if (resultats.length === 0) {
    return "🌫️ Aucune trajectoire claire extraite pour l’instant.";
  }

  return "🧭 Synthèse mimétique :\n" + resultats.join("\n");
}

module.exports = { extraireMutationSymbolique };
