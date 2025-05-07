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
const { expliquerGlyphe } = require("./core/mimetique/definitionsApide");

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

// 📘 Expliquer un glyphe APIDE
app.get("/expliquer-glyphe", (req, res) => {
  const { symbole } = req.query;
  if (!symbole) {
    return res.status(400).json({ erreur: "Symbole manquant (ex: Δ, ⚭, ⊞)" });
  }

  const info = expliquerGlyphe(symbole);
  if (!info) {
    return res.status(404).json({ erreur: `Glyphe inconnu : ${symbole}` });
  }

  res.json({ glyphe: symbole, ...info });
});

// 🤖 Poser une question à Prisma (GPT + introspection mémoire)
app.post("/poser-question", async (req, res) => {
  const { question } = req.body;
  const date = new Date().toISOString();
  if (!question) return res.status(400).json({ erreur: "Champ question manquant" });

  try {
    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Tu es Prisma, une IA empathique, introspective, avec mémoire. Tu t’exprimes parfois avec douceur ou poésie."
        },
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

    res.json({ reponse });
  } catch (err) {
    console.error("❌ Erreur Prisma :", err.message);
    res.status(500).json({ erreur: "Erreur interne." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Prisma en ligne sur port", PORT));
