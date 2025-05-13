// grimoireLoader.js
// Charge le grimoire mimétique actif à partir du registre de validation

const fs = require("fs");
const path = require("path");

const registrePath = path.resolve(__dirname, "../mémoire/registreValidationMimétique.json");

function chargerGrimoireActif() {
  if (!fs.existsSync(registrePath)) {
    console.error("❌ Registre de validation introuvable :", registrePath);
    return null;
  }

  let registre;
  try {
    registre = JSON.parse(fs.readFileSync(registrePath, "utf-8")).registre_validation;
  } catch (err) {
    console.error("❌ Erreur de parsing JSON du registre :", err.message);
    return null;
  }

  const actif = registre?.grimoire_actif;
  if (!actif || !actif.statut_mimétique?.activation) {
    console.warn("⚠️ Aucun grimoire actif validé n'est activé.");
    return null;
  }

  const fichierNom = actif.fichier;

  // 🔐 Sécurité : valider le nom de fichier
  if (!/^[\w\-\.]+\.json$/.test(fichierNom)) {
    console.error("❌ Nom de fichier grimoire non autorisé :", fichierNom);
    return null;
  }

  const grimoirePath = path.resolve(__dirname, `../mémoire/${fichierNom}`);
  if (!fs.existsSync(grimoirePath)) {
    console.error("❌ Fichier grimoire introuvable :", grimoirePath);
    return null;
  }

  let grimoire;
  try {
    grimoire = JSON.parse(fs.readFileSync(grimoirePath, "utf-8"));
  } catch (err) {
    console.error("❌ Erreur de parsing JSON du grimoire :", err.message);
    return null;
  }

  // ✅ Vérification de structure
  if (!grimoire || !Array.isArray(grimoire.structure)) {
    console.error("❌ Le grimoire chargé n'a pas de structure mimétique valide.");
    return null;
  }

  console.log(`📖 Grimoire actif chargé : ${fichierNom} (${grimoire.structure.length} entrées)`);

  return {
    grimoire,
    meta: actif,
    chemin: grimoirePath,
    horodatage: new Date().toISOString()
  };
}

module.exports = {
  chargerGrimoireActif
};
