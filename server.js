const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { ajouterSouvenir } = require("./memoire");
const { ajouterMemoireFichier } = require("./ajouterMemoireFichier");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");
const repo = "Arutha79/prisma-railway4"; // 🔧 Ton vrai repo GitHub
const token = process.env.GITHUB_TOKEN;

// ✅ Initialisation mémoire
fs.mkdirSync(path.dirname(MEMOIRE_PATH), { recursive: true });
if (!fs.existsSync(MEMOIRE_PATH)) {
  fs.writeFileSync(MEMOIRE_PATH, JSON.stringify({ historique: [] }, null, 2), "utf-8");
}

// ✅ PING-MEMOIRE
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

// ➕ Ajouter mémoire (sécurisé)
app.post("/ajouter-memoire", (req, res) => {
  const { date, titre, contenu } = req.body;
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.SECRET_TOKEN) {
    return res.status(403).json({ erreur: "Token invalide." });
  }
  ajouterMemoireFichier({ date, titre, contenu });
  res.json({ statut: "Souvenir ajouté" });
});

// 🧪 Poser une question à Prisma
app.post("/poser-question", async (req, res) => {
  const { question } = req.body;
  const date = new Date().toISOString();
  if (!question) return res.status(400).json({ erreur: "Champ question manquant" });

  const reponse = `🤖 (mock) Voici une réponse à ta question : ${question}`;
  ajouterSouvenir(date, "Question utilisateur", question);
  ajouterSouvenir(date, "Réponse Prisma", reponse);

  try {
    const content = fs.readFileSync(MEMOIRE_PATH, "utf-8");
    const base64 = Buffer.from(content).toString("base64");

    const meta = await fetch(`https://api.github.com/repos/${repo}/contents/mémoire/prisma_memory.json`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const metaData = await meta.json();
    const sha = metaData.sha;

    await fetch(`https://api.github.com/repos/${repo}/contents/mémoire/prisma_memory.json`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Mise à jour mémoire Prisma",
        content: base64,
        sha: sha
      })
    });
  } catch (err) {
    console.warn("❌ Push GitHub échoué :", err.message);
  }

  res.json({ reponse });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Prisma en ligne sur port", PORT));
