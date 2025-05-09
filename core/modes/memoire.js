const fs = require("fs");
const path = require("path");

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");
const LOG_PATH = path.resolve("mémoire/log_souvenirs.txt");

function ajouterSouvenir(date, titre, contenu, type = "souvenir") {
  try {
    // S'assurer que le dossier existe
    fs.mkdirSync(path.dirname(MEMOIRE_PATH), { recursive: true });

    // Créer le fichier si nécessaire
    if (!fs.existsSync(MEMOIRE_PATH)) {
      fs.writeFileSync(
        MEMOIRE_PATH,
        JSON.stringify({ historique: [] }, null, 2),
        "utf-8"
      );
    }

    // Lecture de la mémoire actuelle
    const data = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));

    // Vérifier si le souvenir existe déjà
    const existe = data.historique.some(
      (e) => e.titre === titre && e.contenu === contenu
    );

    if (!existe) {
      const bloc = { date, titre, contenu, type };
      data.historique.push(bloc);

      // Écriture sur disque
      fs.writeFileSync(MEMOIRE_PATH, JSON.stringify(data, null, 2), "utf-8");
      console.log(`✅ Souvenir ajouté : ${titre}`);
      console.log(`💾 Mémoire enregistrée sur disque.`);

      // Log secondaire
      const log = `🧠 ${date} — ${titre}\n${contenu}\n\n`;
      fs.appendFileSync(LOG_PATH, log, "utf-8");
    } else {
      console.log("⚠️ Souvenir déjà présent, rien ajouté.");
    }
  } catch (err) {
    console.error("❌ Erreur écriture mémoire :", err.message);
    console.error("📍 Stack trace :", err.stack);
  }
}

module.exports = { ajouterSouvenir };
