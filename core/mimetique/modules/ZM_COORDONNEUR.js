// core/mimetique/modules/ZM_COORDONNEUR.js

function choisirPostureContextuelle(memoire) {
  if (!memoire || !memoire.historique || memoire.historique.length === 0) {
    return "archiviste";
  }

  const dernier = memoire.historique.at(-1).contenu.toLowerCase();

  if (dernier.includes("mutation") || dernier.includes("Δ")) return "oracle";
  if (dernier.includes("intention") || dernier.includes("⚭")) return "poète";
  if (dernier.includes("structure") || dernier.includes("analyse")) return "analyste";

  return "oracle"; // posture par défaut
}

module.exports = { choisirPostureContextuelle };
