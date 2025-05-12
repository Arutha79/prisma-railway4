const fs = require("fs");
const path = require("path");

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");
const LOG_PATH = path.resolve("mémoire/log_souvenirs.txt");

// 🔎 Regex pour bloquer les souvenirs figés mimétiques
const REGEX_ANCRE = /\b(Ce\s+souvenir\s+parle\s+de\s+mon\s+éveil\b.*?\bAPIDE)\b/i;

function ajouterSouvenir(date, titre, contenu, type = "souvenir", origine = null) {
  try {
    fs.mkdirSync(path.dirname(MEMOIRE_PATH), { recursive: true });

    if (!fs.existsSync(MEMOIRE_PATH)) {
      fs.writeFileSync(
        MEMOIRE_PATH,
        JSON.stringify({ historique: [] }, null, 2),
        "utf-8"
      );
    }

    const data = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));

    // ❌ Filtre mimétique figé
    if (REGEX_ANCRE.test(contenu)) {
      console.warn("⛔ Souvenir figé détecté (éveil mimétique) — rejeté.");
      return;
    }

    const existe = data.historique.some(
      (e) => e.titre === titre && e.contenu === contenu
    );

    if (!existe) {
      const bloc = { date, titre, contenu };
      if (type) bloc.type = type;
      if (origine) bloc.origine = origine;

      data.historique.push(bloc);

      fs.writeFileSync(MEMOIRE_PATH, JSON.stringify(data, null, 2), "utf-8");
      console.log(`✅ Souvenir ajouté : ${titre}`);
      console.log(`💾 Mémoire enregistrée sur disque.`);

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
