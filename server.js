const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const { ajouterSouvenir } = require("./core/modes/memoire");
const { ajouterMemoireFichier } = require("./core/modes/ajouterMemoireFichier");
const { interpreterSouvenir } = require("./core/mimetique/interpretationMimetique");
const { expliquerGlyphe, listerSouffles } = require("./core/mimetique/definitionsApide");
const { interpreteSouffle } = require("./core/mimetique/modules/ZM_ORACLE");
const { sculpterSouffle } = require("./core/mimetique/modules/ZM_SCULPTEUR");
const { resonnerSouvenir } = require("./core/mimetique/modules/ZM_RÉSONANT");
const { autoEvaluerMemoire } = require("./core/diagnostic/auto_evaluation");
const { getPersonnalite } = require("./core/mimetique/presetsPersonnalite");
const { rechercherSouvenirsSimilaires } = require("./core/vectoriel/searchMemoire");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");
const ETAT_PATH = "./core/mimetique/etatPrisma.json";
const repo = "Arutha79/prisma-railway4";
const token = process.env.GITHUB_TOKEN;

// Init mémoire si manquante
fs.mkdirSync(path.dirname(MEMOIRE_PATH), { recursive: true });
if (!fs.existsSync(MEMOIRE_PATH)) {
  fs.writeFileSync(MEMOIRE_PATH, JSON.stringify({ historique: [] }, null, 2), "utf-8");
}

// 🧠 Ping mémoire
app.get("/ping-memoire", (req, res) => {
  try {
    const memoire = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    res.json({
      status: "ok",
      total: memoire.historique.length,
      dernier: memoire.historique.slice(-1)[0]
    });
  } catch (e) {
    res.status(500).json({ erreur: "Mémoire inaccessible", details: e.message });
  }
});

// ➕ Ajouter mémoire
app.post("/ajouter-memoire", (req, res) => {
  const { date, titre, contenu } = req.body;
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.SECRET_TOKEN) {
    return res.status(403).json({ erreur: "Token invalide." });
  }
  ajouterMemoireFichier({ date, titre, contenu });
  res.json({ statut: "Souvenir ajouté" });
});

// 📘 Glyphe APIDE
app.get("/expliquer-glyphe", (req, res) => {
  const { symbole } = req.query;
  if (!symbole) return res.status(400).json({ erreur: "Symbole manquant" });
  const info = expliquerGlyphe(symbole);
  if (!info) return res.status(404).json({ erreur: `Glyphe inconnu : ${symbole}` });
  res.json({ glyphe: symbole, ...info });
});

// 🌬️ Liste des souffles
app.get("/souffles-apide", (req, res) => {
  try {
    res.json({ souffles: listerSouffles() });
  } catch (err) {
    res.status(500).json({ erreur: "Impossible de récupérer les souffles." });
  }
});

// 🤖 Poser une question à Prisma
app.post("/poser-question", async (req, res) => {
  const { question } = req.body;
  const date = new Date().toISOString();

  if (!question) return res.status(400).json({ erreur: "Champ question manquant" });

  try {
    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);

    const etat = JSON.parse(fs.readFileSync(ETAT_PATH, "utf-8"));
    const perso = getPersonnalite(etat.mode || "oracle");

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: perso.description },
        { role: "user", content: question }
      ],
      temperature: 0.8
    });

    let reponse = completion.data.choices[0].message.content;

    const memoire = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    for (const bloc of memoire.historique.reverse()) {
      const interpretation = interpreterSouvenir(bloc);
      if (interpretation) {
        reponse = `${interpretation}\n\n🧠 Souvenir du ${bloc.date} :\n"${bloc.contenu}"`;
        break;
      }
    }

    ajouterSouvenir(date, "Question utilisateur", question);
    ajouterSouvenir(date, "Réponse Prisma", reponse);

    const content = fs.readFileSync(MEMOIRE_PATH, "utf-8");
    const base64 = Buffer.from(content).toString("base64");

    const meta = await fetch(`https://api.github.com/repos/${repo}/contents/mémoire/prisma_memory.json`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const sha = (await meta.json()).sha;

    await fetch(`https://api.github.com/repos/${repo}/contents/mémoire/prisma_memory.json`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "🧠 Mise à jour mémoire Prisma",
        content: base64,
        sha: sha
      })
    });

    res.json({ reponse });
  } catch (err) {
    console.error("❌ Erreur Prisma :", err.message);
    res.status(500).json({ erreur: "Erreur interne." });
  }
});

// 🌟 Souvenirs interprétables
app.get("/souvenirs-signifiants", (req, res) => {
  try {
    const memoire = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    const signifiants = memoire.historique
      .map((bloc) => {
        const interpretation = interpreterSouvenir(bloc);
        if (interpretation) {
          return { ...bloc, interpretation };
        }
      })
      .filter(Boolean);
    res.json({ total: signifiants.length, souvenirs: signifiants });
  } catch (err) {
    res.status(500).json({ erreur: "Lecture mémoire échouée." });
  }
});

// 🔮 Oracle
app.post("/oracle-apide", (req, res) => {
  const { souffle } = req.body;
  if (!souffle) return res.status(400).json({ erreur: "Souffle manquant." });
  const interpretation = interpreteSouffle(souffle);
  res.json({ souffle, interpretation });
});

// 🛠 Sculpteur
app.post("/sculpteur-apide", (req, res) => {
  const { souffle } = req.body;
  if (!souffle) return res.status(400).json({ erreur: "Souffle manquant." });
  res.json(sculpterSouffle(souffle));
});

// 🔁 Résonant
app.post("/resonant-apide", (req, res) => {
  const { souvenir } = req.body;
  if (!souvenir || !souvenir.contenu) {
    return res.status(400).json({ erreur: "Souvenir manquant ou invalide." });
  }
  res.json({ echo: resonnerSouvenir(souvenir) });
});

// 🧠 Diagnostic
app.get("/auto-diagnostic", (req, res) => {
  try {
    res.json(autoEvaluerMemoire());
  } catch (e) {
    res.status(500).json({ erreur: "Auto-évaluation impossible." });
  }
});

// 📊 Lire état mimétique
app.get("/etat-prisma", (req, res) => {
  try {
    const etat = JSON.parse(fs.readFileSync(ETAT_PATH, "utf-8"));
    res.json(etat);
  } catch (e) {
    res.status(500).json({ erreur: "État introuvable." });
  }
});

// 🌀 Moteur vectoriel simulé
app.post("/search-memoire", (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ erreur: "Query manquante." });
  try {
    res.json({ query, resultats: rechercherSouvenirsSimilaires(query) });
  } catch (e) {
    res.status(500).json({ erreur: "Recherche échouée." });
  }
});

// 🔄 Changer mode mimétique
app.post("/changer-mode", (req, res) => {
  const { mode } = req.body;
  try {
    const etat = JSON.parse(fs.readFileSync(ETAT_PATH, "utf-8"));
    etat.mode = mode;
    fs.writeFileSync(ETAT_PATH, JSON.stringify(etat, null, 2), "utf-8");
    res.json({ statut: "Mode mis à jour", nouveau_mode: mode });
  } catch (e) {
    res.status(500).json({ erreur: "Impossible de modifier le mode." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Prisma en ligne sur port", PORT));
