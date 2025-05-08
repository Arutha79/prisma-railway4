// core/mimetique/modules/ZM_SYNTHETISEUR.js

function extraireMutationSymbolique(memoire) {
  const mutations = [];

  for (const bloc of memoire.historique) {
    const contenu = (bloc.contenu || "").toLowerCase();

    if (contenu.includes("Δ") || contenu.includes("mutation")) {
      mutations.push({
        date: bloc.date,
        titre: bloc.titre,
        contenu: bloc.contenu,
        extrait: "🧬 Mutation détectée : " + (contenu.length > 80 ? contenu.slice(0, 80) + "..." : contenu)
      });
    }
  }

  if (mutations.length === 0) {
    return "Aucune mutation symbolique détectée.";
  }

  return mutations;
}

module.exports = { extraireMutationSymbolique };
