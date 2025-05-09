const fs = require("fs");
const path = require("path");

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");
const LOG_PATH = path.resolve("mémoire/log_souvenirs.txt");

function ajouterSouvenir(date, titre, contenu, type = "souvenir") {
  try {
    fs.mkdirSync(path.dirname(MEMOIRE_PATH), { recursive: true });

    if (!fs.existsSync(MEMOIRE_PATH)) {
      fs.writeFileSync(MEMOIRE_PATH, JSON.stringify({ historique: [] }, null, 2), "utf-8");
    }

    const data = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    const existe = data.historique.some(e => e.titre === titre && e.contenu === contenu);

    if (!existe) {
      const bloc = { date, titre, contenu, type };
      data.historique.push(bloc);
      fs.writeFileSync(MEMOIRE_PATH, JSON.stringify(data, null, 2), "utf-8");

      const log = `🧠 ${date} — ${titre}\n${contenu}\n\n`;
      fs.appendFileSync(LOG_PATH, log, "utf-8");

      console.log(`✅ Souvenir ajouté : ${titre}`);
    } else {
      console.log("⚠️ Déjà présent, rien ajouté.");
    }
  } catch (err) {
    console.error("❌ Erreur écriture mémoire :", err.message);
  }
}

module.exports = { ajouterSouvenir };
