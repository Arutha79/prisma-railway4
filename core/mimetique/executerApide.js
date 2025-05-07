// core/mimetique/executerApide.js

/**
 * Parse une commande APIDE de type :
 * Δ|ACTION::CIBLE ÷CONDITION ⊞EFFET
 * Δ|ACTION::CIBLE ⊞EFFET
 * ⊞EFFET
 */
function parserCommandeApide(commande) {
  // Format complet avec ou sans condition
  const match = commande.match(/^Δ\|(\w+)::(\w+)(?:\s*÷(.+?))?\s*⊞(.+)$/);
  if (match) {
    return {
      type: "instruction glyphique",
      action: match[1],
      cible: match[2],
      condition: match[3] || null,
      effet: match[4]
    };
  }

  // Format minimal : ⊞EFFET seul
  const shortMatch = commande.match(/^⊞(.+)$/);
  if (shortMatch) {
    return {
      type: "activation simple",
      action: "⊞",
      cible: null,
      condition: null,
      effet: shortMatch[1]
    };
  }

  return null;
}

/**
 * Exécution simulée d'une commande glyphique
 */
function executerCommandeGlyphique(commande) {
  const parsed = parserCommandeApide(commande);
  if (!parsed) {
    return {
      status: "erreur",
      message: "❌ Commande glyphique non reconnue.",
      commande
    };
  }

  const { action, cible, condition, effet, type } = parsed;

  const message =
    type === "activation simple"
      ? `🧠 Prisma a compris : activer "${effet}".`
      : `🧠 Prisma a compris : effectuer "${action}" sur "${cible}"` +
        (condition ? ` si "${condition}"` : "") +
        ` pour appliquer "${effet}".`;

  return {
    status: "ok",
    message,
    type,
    structure: parsed
  };
}

module.exports = {
  parserCommandeApide,
  executerCommandeGlyphique
};
