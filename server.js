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

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");
const ETAT_PATH = path.resolve("core/mimetique/etatPrisma.json");
const GITHUB_REPO = "Arutha79/prisma-railway4";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// ✅ Création automatique du dossier mémoire et fichier JSON
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

// 🔄 Fonction de synchronisation GitHub
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

// --- ROUTES ---

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

app.post("/ajouter-memoire", async (req, res) => {
  const { date, titre, contenu } = req.body;
  if (req.headers["x-api-key"] !== process.env.SECRET_TOKEN) {
    return res.status(403).json({ erreur: "Token invalide." });
  }

  ajouterSouvenir(date, titre, contenu);
  await syncGithubMemoire(); // ⬅️ ajout ici
  res.json({ statut: "Souvenir ajouté et synchronisé" });
});

app.get("/expliquer-glyphe", (req, res) => {
  const { symbole } = req.query;
  if (!symbole) return res.status(400).json({ erreur: "Symbole manquant" });
  const info = expliquerGlyphe(symbole);
  if (!info) return res.status(404).json({ erreur: `Glyphe inconnu : ${symbole}` });
  res.json({ glyphe: symbole, ...info });
});

app.get("/souffles-apide", (req, res) => {
  try {
    res.json({ souffles: listerSouffles() });
  } catch {
    res.status(500).json({ erreur: "Impossible de récupérer les souffles." });
  }
});

app.post("/poser-question", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ erreur: "Champ question manquant" });

  try {
    let etat = {};
    try {
      const etatRaw = fs.readFileSync(ETAT_PATH, "utf-8");
      etat = JSON.parse(etatRaw);
    } catch (err) {
      console.warn("⚠️ Lecture de etatPrisma.json échouée. Fallback sur mode 'oracle'.");
      etat.mode = "oracle";
    }

    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
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

    for (const bloc of memoire.historique.slice().reverse()) {
      const interpr = interpreterSouvenir(bloc);
      if (interpr) {
        reponse = `${interpr}\n\n🧠 Souvenir du ${bloc.date} : "${bloc.contenu}"`;
        break;
      }
    }

    const now = new Date().toISOString();
    ajouterSouvenir(now, "Question utilisateur", question);
    ajouterSouvenir(now, "Réponse Prisma", reponse);

    await syncGithubMemoire(); // garde la synchro ici aussi
    res.json({ reponse });
  } catch (err) {
    console.error("❌ Erreur Prisma :", err);
    res.status(500).json({ erreur: "Erreur interne." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Prisma en ligne sur port ${PORT}`));
