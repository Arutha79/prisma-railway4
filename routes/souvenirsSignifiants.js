// routes/souvenirsSignifiants.js corrigé
const express = require("express");
const fs = require("fs");
const path = require("path");
const { interpreterSouvenir } = require("../core/mimetique/interpretationMimetique");

const router = express.Router();
const MEMOIRE_PATH = path.resolve("memoire/prisma_memory.json");

router.get("/", (req, res) => {
  try {
    const memoire = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    const signifiants = [];

    for (const bloc of memoire.historique) {
      const interpretation = interpreterSouvenir(bloc);
      if (interpretation) {
        signifiants.push({
          date: bloc.date,
          titre: bloc.titre,
          contenu: bloc.contenu,
          interpretation
        });
      }
    }

    res.json({ total: signifiants.length, souvenirs: signifiants });
  } catch (err) {
    console.error("❌ Erreur lecture memoire :", err.message);
    res.status(500).json({ erreur: "Impossible de lire les souvenirs." });
  }
});

module.exports = router;
