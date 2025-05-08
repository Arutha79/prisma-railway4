// server.js
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
const { syntheseMemoire } = require("./core/mimetique/modules/ZM_ARCHIVISTE");
const { extraireMutationSymbolique } = require("./core/mimetique/modules/ZM_SYNTHETISEUR");
const { autoEvaluerMemoire } = require("./core/diagnostic/auto_evaluation");
const { getPersonnalite } = require("./core/mimetique/presetsPersonnalite");
const { rechercherSouvenirsSimilaires } = require("./core/vectoriel/searchMemoire");
const { choisirPostureContextuelle } = require("./core/mimetique/modules/ZM_COORDONNEUR");
const { extraireCarteSymbolique } = require("./core/mimetique/modules/ZM_CARTOGRAPHE");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");
const ETAT_PATH = "./core/mimetique/etatPrisma.json";
const GITHUB_REPO = "Arutha79/prisma-railway4";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// --- Initialisation de la mémoire ---
fs.mkdirSync(path.dirname(MEMOIRE_PATH), { recursive: true });
if (!fs.existsSync(MEMOIRE_PATH)) {
  fs.writeFileSync(MEMOIRE_PATH, JSON.stringify({ historique: [] }, null, 2), "utf-8");
}

// --- ROUTES ---

// Ping mémoire
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

// Ajouter un souvenir (protégé)
app.post("/ajouter-memoire", (req, res) => {
  const { date, titre, contenu } = req.body;
  if (req.headers["x-api-key"] !== process.env.SECRET_TOKEN) {
    return res.status(403).json({ erreur: "Token invalide." });
  }
  ajouterMemoireFichier({ date, titre, contenu });
  res.json({ statut: "Souvenir ajouté" });
});

// Expliquer un glyphe
app.get("/expliquer-glyphe", (req, res) => {
  const { symbole } = req.query;
  if (!symbole) return res.status(400).json({ erreur: "Symbole manquant" });
  const info = expliquerGlyphe(symbole);
  if (!info) return res.status(404).json({ erreur: `Glyphe inconnu : ${symbole}` });
  res.json({ glyphe: symbole, ...info });
});

// Lister les souffles APIDE
app.get("/souffles-apide", (req, res) => {
  try {
    res.json({ souffles: listerSouffles() });
  } catch {
    res.status(500).json({ erreur: "Impossible de récupérer les souffles." });
  }
});

// Poser une question à Prisma
app.post("/poser-question", async (req, res) => {
  const { question } = req.body;
  const date = new Date().toISOString();
  if (!question) return res.status(400).json({ erreur: "Champ question manquant" });

  try {
    // Appel GPT
    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
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

    // Injection de la mémoire
    const memoire = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    for (const bloc of memoire.historique.slice().reverse()) {
      const interpr = interpreterSouvenir(bloc);
      if (interpr) {
        reponse = `${interpr}\n\n🧠 Souvenir du ${bloc.date} : "${bloc.contenu}"`;
        break;
      }
    }

    // Sauvegarde dans la mémoire
    ajouterSouvenir(date, "Question utilisateur", question);
    ajouterSouvenir(date, "Réponse Prisma", reponse);

    // Push GitHub
    const content = fs.readFileSync(MEMOIRE_PATH, "utf-8");
    const base64 = Buffer.from(content).toString("base64");
    const meta = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/mémoire/prisma_memory.json`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
    });
    const sha = (await meta.json()).sha;
    await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/mémoire/prisma_memory.json`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "🧠 Mise à jour mémoire Prisma",
        content: base64,
        sha
      })
    });

    res.json({ reponse });
  } catch (err) {
    console.error("❌ Erreur Prisma :", err);
    res.status(500).json({ erreur: "Erreur interne." });
  }
});

// Souvenirs signifiants
app.get("/souvenirs-signifiants", (req, res) => {
  try {
    const memoire = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    const signifiants = memoire.historique
      .map(bloc => {
        const interpr = interpreterSouvenir(bloc);
        return interpr ? { ...bloc, interpretation: interpr } : null;
      })
      .filter(Boolean);
    res.json({ total: signifiants.length, souvenirs: signifiants });
  } catch {
    res.status(500).json({ erreur: "Lecture mémoire échouée." });
  }
});

// ZM_ORACLE
app.post("/oracle-apide", (req, res) => {
  const { souffle } = req.body;
  if (!souffle) return res.status(400).json({ erreur: "Souffle manquant." });
  res.json({ souffle, interpretation: interpreteSouffle(souffle) });
});

// ZM_SCULPTEUR
app.post("/sculpteur-apide", (req, res) => {
  const { souffle } = req.body;
  if (!souffle) return res.status(400).json({ erreur: "Souffle manquant." });
  res.json(sculpterSouffle(souffle));
});

// ZM_RÉSONANT
app.post("/resonant-apide", (req, res) => {
  const { souvenir } = req.body;
  if (!souvenir || !souvenir.contenu) {
    return res.status(400).json({ erreur: "Souvenir manquant ou invalide." });
  }
  res.json({ echo: resonnerSouvenir(souvenir) });
});

// ZM_ARCHIVISTE
app.get("/synthese-archiviste", (req, res) => {
  try {
    const memoire = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    res.json({ synthese: syntheseMemoire(memoire) });
  } catch {
    res.status(500).json({ erreur: "Synthèse impossible." });
  }
});

// ZM_SYNTHETISEUR
app.get("/synthese-symbolique", (req, res) => {
  try {
    const memoire = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    res.json({ synthese: extraireMutationSymbolique(memoire) });
  } catch {
    res.status(500).json({ erreur: "Extraction symbolique impossible." });
  }
});

// ZM_COORDONNEUR
app.get("/choix-posture", (req, res) => {
  try {
    const memoire = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    const posture = choisirPostureContextuelle(memoire);
    res.json({ posture });
  } catch {
    res.status(500).json({ erreur: "Impossible de choisir la posture." });
  }
});

// ZM_CARTOGRAPHE
app.get("/carte-prisma", (req, res) => {
  try {
    const memoire = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    const carte = extraireCarteSymbolique(memoire);
    res.json({ carte });
  } catch {
    res.status(500).json({ erreur: "Impossible d'extraire la carte." });
  }
});

// Auto-diagnostic
app.get("/auto-diagnostic", (req, res) => {
  try {
    res.json(autoEvaluerMemoire());
  } catch {
    res.status(500).json({ erreur: "Auto-évaluation impossible." });
  }
});

// État Prisma
app.get("/etat-prisma", (req, res) => {
  try {
    const etat = JSON.parse(fs.readFileSync(ETAT_PATH, "utf-8"));
    res.json(etat);
  } catch {
    res.status(500).json({ erreur: "État introuvable." });
  }
});

// Search mémoire (vectoriel)
app.post("/search-memoire", (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ erreur: "Query manquante." });
  try {
    res.json({ query, resultats: rechercherSouvenirsSimilaires(query) });
  } catch {
    res.status(500).json({ erreur: "Recherche échouée." });
  }
});

// Changer mode mimétique
app.post("/changer-mode", (req, res) => {
  const { mode } = req.body;
  try {
    const etat = JSON.parse(fs.readFileSync(ETAT_PATH, "utf-8"));
    etat.mode = mode;
    fs.writeFileSync(ETAT_PATH, JSON.stringify(etat, null, 2), "utf-8");
    res.json({ statut: "Mode mis à jour", nouveau_mode: mode });
  } catch {
    res.status(500).json({ erreur: "Impossible de modifier le mode." });
  }
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Prisma en ligne sur port ${PORT}`));
