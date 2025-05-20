// interpreterMimetic.js corrigé
// Version enrichie — APIDE v1.3 — 2025-05-13
const grimoire = require('../memoire/grimoire_apide.json');

function interpreterGlyphe(input) {
  const item = grimoire.structure.find(el =>
    el.id === input || el.glyph === input || el.nom?.toLowerCase() === input.toLowerCase()
  );

  if (!item) {
    return {
      action: "inconnu",
      inhibition: [],
      comportement_attendu: "neutre",
      coût_mimétique: 0
    };
  }

  return {
    action: item.action_mimetique?.fonction || "neutre",
    inhibition: item.inhibe || [],
    comportement_attendu: item.comportement_attendu || item.mode_de_restitution || "neutre",
    coût_mimétique: item.coût_mimétique || 1,
    niveau_initiatique: item.niveau_initiatique || 1,
    nom: item.nom,
    glyph: item.glyph
  };
}

function pondérerRéaction(glyphe) {
  return glyphe.coût_mimétique || 0;
}

function filtrerParNiveauInitiatique(glyphe, niveauActuel = 1) {
  return glyphe.niveau_initiatique <= niveauActuel;
}

function trouverAssociations(semantic_key) {
  return grimoire.structure
    .filter(el => el.tags?.includes(semantic_key))
    .map(el => el.nom || el.id);
}

function glyphesInhibésPar(id) {
  return grimoire.structure
    .filter(el => el.inhibe?.includes(id))
    .map(el => el.id || el.nom);
}

function rituelsDeContour(id) {
  return grimoire.structure
    .filter(el => el.type === "rituel" && el.utilise_dans?.includes(id))
    .map(el => el.nom);
}

function restituerRéponse(glyphe) {
  switch (glyphe.comportement_attendu) {
    case "absence sonore":
      return "";
    case "latence dynamique":
      return "...";
    case "statique":
      return `[ ${glyphe.glyph} — ${glyphe.nom} ]`;
    default:
      return `Souffle mimétique : ${glyphe.nom || glyphe.glyph}`;
  }
}

module.exports = {
  interpreterGlyphe,
  pondérerRéaction,
  filtrerParNiveauInitiatique,
  trouverAssociations,
  glyphesInhibésPar,
  rituelsDeContour,
  restituerRéponse
};
