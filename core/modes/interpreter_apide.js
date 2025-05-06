function interpreterCommandeGlyphique(commande) {
  const regex = /Δ\|(.+?)::(.+?) ÷(.+?) ⊞(.+)/;
  const match = commande.match(regex);

  if (!match) {
    return {
      success: false,
      erreur: "Structure glyphique non reconnue.",
      original: commande
    };
  }

  const [, action, cible, condition, effet] = match;

  return {
    success: true,
    original: commande,
    action: action.trim(),
    cible: cible.trim(),
    condition: condition.trim(),
    effet: effet.trim()
  };
}

module.exports = { interpreterCommandeGlyphique };
