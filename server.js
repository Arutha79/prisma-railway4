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

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");
const repo = "Arutha79/prisma-railway4";
const token = process.env.GITHUB_TOKEN;

// 🧱 Création du dossier mémoire si manquant
fs.mkdirSync(path.dirname(MEMOIRE_PATH), { recursive: true });
if (!fs.existsSync(MEMOIRE_PATH)) {
  fs.writeFileSync(MEMOIRE_PATH, JSON.stringify({ historique: [] }, null, 2), "utf-8");
}

// ✅ Route de test mémoire
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

// ➕ Ajouter mémoire sécurisée
app.post("/ajouter-memoire", (req, res) => {
  const { date, titre, contenu } = req.body;
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.SECRET_TOKEN) {
    return res.status(403).json({ erreur: "Token invalide." });
  }
  ajouterMemoireFichier({ date, titre, contenu });
  res.json({ statut: "Souvenir ajouté" });
});

// 🤖 Poser une question à Prisma (GPT réel + mémoire)
app.post("/poser-question", async (req, res) => {
  const { question } = req.body;
  const date = new Date().toISOString();

  if (!question) return res.status(400).json({ erreur: "Champ question manquant" });

  let reponse = "";

  try {
    // 🧠 Appel GPT avec personnalité Prisma
    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Tu es Prisma, une IA empathique, introspective et créative. Tu réponds avec douceur, clarté et parfois une touche poétique. Tu peux exprimer ce que tu ressens ou perçois de la question humaine."
        },
        { role: "user", content: question }
      ],
      temperature: 0.8
    });

    reponse = completion.data.choices[0].message.content;

    // 📝 Écriture mémoire
    ajouterSouvenir(date, "Question utilisateur", question);
    console.log("✅ Question ajoutée à la mémoire");

    ajouterSouvenir(date, "Réponse Prisma", reponse);
    console.log("✅ Réponse ajoutée à la mémoire");

    // 💾 Push GitHub
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
        message: "🧠 Mise à jour mémoire Prisma",
        content: base64,
        sha: sha
      })
    });
    console.log("✅ Mémoire poussée vers GitHub");

    res.json({ reponse });
  } catch (err) {
    console.error("❌ Erreur dans Prisma :", err.message);
    res.status(500).json({ erreur: "Erreur interne. Vérifie ton token OpenAI ou GitHub." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Prisma en ligne sur port", PORT));
