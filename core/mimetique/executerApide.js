// core/mimetique/executerApide.js

function parserCommandeApide(commande) {
  const match = commande.match(/^Δ\|(\w+)::(\w+)\s*÷(.+)\s*⊞(.+)$/);
  if (!match) return null;

  return {
    action: match[1],
    cible: match[2],
    condition: match[3],
    effet: match[4]
  };
}

function executerCommandeGlyphique(commande) {
  const parsed = parserCommandeApide(commande);
  if (!parsed) return { status: "erreur", message: "Commande glyphique invalide." };

  // Pour l'instant, exécution simulée
  const { action, cible, condition, effet } = parsed;

  return {
    status: "ok",
    message: `🧠 Prisma a compris : effectuer "${action}" sur "${cible}" si "${condition}" pour appliquer "${effet}".`,
    structure: parsed
  };
}

module.exports = { executerCommandeGlyphique };
