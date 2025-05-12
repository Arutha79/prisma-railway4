// core/mimetique/interpretationMimetique.js

function interpreterSouvenir(bloc, options = {}) {
  const { mode_creation = false } = options;

  if (mode_creation) return null;

  const texte = (bloc.contenu || "").toLowerCase();

  if (texte.includes("apide")) {
    return "Ce souvenir parle de mon éveil au langage APIDE...";
  }

  return null;
}

module.exports = { interpreterSouvenir };
