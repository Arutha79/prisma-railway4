const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const { ajouterSouvenir } = require("./core/modes/memoire");
const { interpreterSouvenir } = require("./core/mimetique/interpretationMimetique");
const { expliquerGlyphe, listerSouffles } = require("./core/mimetique/definitionsApide");
const { getPersonnalite } = require("./core/mimetique/presetsPersonnalite");
const { genererReponsePrisma } = require("./core/mimetique/genererReponsePrisma");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");
const ETAT_PATH = path.resolve("core/mimetique/etatPrisma.json");
const GITHUB_REPO = "Arutha79/prisma-railway4";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Création automatique du fichier mémoire
fs.mkdirSync(path.dirname(MEMOIRE_PATH), { recursive: true });
if (!fs.existsSync(MEMOIRE_PATH)) {
  fs.writeFileSync(
    MEMOIRE_PATH,
    JSON.stringify({
      meta: {
        origine: "Réinitialisation système",
        message_ancre: "Mémoire créée automatiquement",
        date_creation: new Date().toISOString(),
        contexte: "Initialisation Railway"
      },
      historique: []
    }, null, 2),
    "utf-8"
  );
}

// 🔄 Sync GitHub
async function syncGithubMemoire() {
  try {
    const content = fs.readFileSync(MEMOIRE_PATH, "utf-8");
    const base64 = Buffer.from(content).toString("base64");

    const meta = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/mémoire/prisma_memory.json`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
    });

    if (!meta.ok) {
      const errText = await meta.text();
      console.error("❌ GitHub API error (SHA) :", errText);
      return;
    }

    const metaJson = await meta.json();
    const sha = metaJson.sha;

    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/mémoire/prisma_memory.json`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "🧠 Sync auto après ajout mémoire",
        content: base64,
        sha
      })
    });

    if (response.ok) {
      console.log("✅ Mémoire synchronisée avec GitHub.");
    } else {
      const errorText = await response.text();
      console.error("❌ Erreur GitHub PUSH :", errorText);
    }
  } catch (err) {
    console.error("❌ Erreur syncGithubMemoire :", err.message);
  }
}

// Routes
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

// ✅ Route corrigée — accepte tous les champs du souvenir
app.post("/ajouter-memoire", async (req, res) => {
  if (req.headers["x-api-key"] !== process.env.SECRET_TOKEN) {
    return res.status(403).json({ erreur: "Token invalide." });
  }

  const bloc = { ...req.body, date: req.body.date || new Date().toISOString() };
  console.log("📥 Reçu :", bloc);

  ajouterSouvenir(bloc);
  await syncGithubMemoire();
  res.json({ statut: "Souvenir ajouté et synchronisé" });
});

// Route enrichie directe (alternative)
app.post("/ajouter-memoire-enrichi", async (req, res) => {
  const { date, titre, contenu, type, origine, ...extra } = req.body;

  if (req.headers["x-api-key"] !== process.env.SECRET_TOKEN) {
    return res.status(403).json({ erreur: "Token invalide." });
  }

  try {
    const bloc = {
      date: date || new Date().toISOString(),
      titre,
      contenu,
      ...(type && { type }),
      ...(origine && { origine }),
      ...extra
    };

    const data = JSON.parse(fs.readFileSync
