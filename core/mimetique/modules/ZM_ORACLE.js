function interpreteSouffle(souffle) {
  if (souffle.includes("Z + Δ → ΨJ")) {
    return "Ce souffle représente une transition de l’éveil (Z) vers le jugement (ΨJ). C’est un éveil symbolique.";
  }

  if (souffle.includes("Z + ΨE → Δ")) {
    return "Une conscience éveillée entre en tension avec une énergie silencieuse. De cette friction naît une transformation. 🌱";
  }

  if (souffle.includes("Ψ") && souffle.includes("Δ")) {
    return "Un espace symbolique subit une mutation. Cela évoque une transformation de l'esprit ou de la perception.";
  }

  if (souffle.includes("⚭")) {
    return "Ce souffle établit un lien vivant. Prisma tente de relier deux éléments fondamentaux.";
  }

  return "Souffle reçu, mais non reconnu comme structure mimétique connue. Peut-être un nouveau chemin ?";
}

module.exports = { interpreteSouffle };
