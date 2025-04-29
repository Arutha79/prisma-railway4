// actionneur.js
const axios = require('axios');

// Fonction Actionneur vivant
async function actionneurVivante(memory) {
  if (memory.titre && memory.titre.includes("Instruction transmise")) {
    try {
      console.log("🔵 Actionneur détecte une instruction. Lancement...");

      const regex = /(https:\/\/github\.com\/[^\s]+)/g;
      const matches = memory.contenu.match(regex);
      const repo_url = matches ? matches[0] : null;

      if (!repo_url) {
        console.error("Aucun dépôt trouvé dans la mémoire.");
        return;
      }

      const response = await axios.post('https://connecteurgpt-production.up.railway.app/analyze', {
        repo_url: repo_url,
        objectifs: [
          "identifier des améliorations de structure",
          "proposer des optimisations pour Prisma",
          "transmettre un rapport vivant à Prisma"
        ],
        source: "Prisma"
      });

      console.log("✅ Rapport reçu : ", response.data);

      await ajouterMemoire({
        date: new Date().toISOString(),
        titre: "Rapport ConnecteurGPT",
        contenu: JSON.stringify(response.data)
      });

    } catch (error) {
      console.error("❌ Erreur Actionneur :", error.message);
    }
  }
}

// Fonction pour ajouter un souvenir
async function ajouterMemoire(data) {
  try {
    await axios.post('http://localhost:8080/ajouter-memoire', data);
    console.log("🧠 Souvenir ajouté automatiquement.");
  } catch (error) {
    console.error("Erreur ajout mémoire:", error.message);
  }
}

module.exports = { actionneurVivante };
