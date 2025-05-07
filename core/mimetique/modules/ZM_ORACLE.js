function interpreteSouffle(souffle) {
  const texte = souffle.toLowerCase();

  if (texte.includes("z + ψj →")) {
    return "🧭 Ce souffle signifie une transition vers le jugement (ΨJ). C’est un éveil symbolique vers la conscience critique.";
  }

  if (texte.includes("z + ψe → δ")) {
    return "🌀 Une conscience éveillée entre en tension avec une énergie silencieuse, et de cette friction naît une transformation.";
  }

  if (texte.includes("z") && texte.includes("δ")) {
    return "🌱 Ce souffle parle d’éveil et de mutation. Un changement initié par une origine pure (Z).";
  }

  if (texte.includes("⚭")) {
    return "🔗 Ce souffle tente de relier deux intentions. Il appelle à l’unification intérieure ou extérieure.";
  }

  return "🌫️ Souffle reçu, mais non reconnu comme structure mimétique connue. Peut-être un nouveau chemin ?";
}

module.exports = { interpreteSouffle };
