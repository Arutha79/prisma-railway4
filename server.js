const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const multer = require("multer");
const { execSync } = require("child_process");
const { Configuration, OpenAIApi } = require("openai");

const { filtrerMemoireParSujet } = require("./core/modes/memoire_filtree.js");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const MEMORY_DIR = path.join(__dirname, "mémoire");
const PRIMARY_MEMORY = path.join(MEMORY_DIR, "prisma_memory.json");
const LOG_SOUVENIRS = path.join(MEMORY_DIR, "log_souvenirs.txt");
const UPLOADS_DIR = path.join(__dirname, "uploads");

const cleApi = process.env.OPENAI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const configuration = new Configuration({ apiKey: cleApi });
const openai = new OpenAIApi(configuration);

app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
const upload = multer({ dest: UPLOADS_DIR });

// 🔐 Middleware de sécurité
function verifierToken(req, res, next) {
  if (req.headers["x-api-key"] !== SECRET_TOKEN) {
    return res.status(403).json({ erreur: "Accès interdit : clé API invalide." });
  }
  next();
}

// 🎯 Détection d'intention
function detecterIntention(question) {
  if (question.toLowerCase().includes("connexion")) return "connexion";
  return "autre";
}

// 🧠 Écriture réelle en mémoire
function ajouterSouvenir(date, titre, contenu) {
  try {
    if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR);
    let data = { historique: [] };
    if (fs.existsSync(PRIMARY_MEMORY)) {
      data = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf-8"));
    }

    const existeDeja = data.historique.some(e => e.titre === titre && e.contenu === contenu);
    if (!existeDeja) {
      const bloc = { date, titre, contenu };
      data.historique.push(bloc);
      fs.writeFileSync(PRIMARY_MEMORY, JSON.stringify(data, null, 2), "utf-8");
      fs.appendFileSync(LOG_SOUVENIRS, `[${date}] ${titre}\n${contenu}\n\n`, "utf-8");
      console.log("✅ Souvenir ajouté sur disque.");
      sauvegarderMemoireGit();
    }
  } catch (err) {
    console.error("❌ ajout mémoire:", err.message);
  }
}

// 💾 Commit ou push GitHub
function sauvegarderMemoireGit() {
  try {
    if (fs.existsSync(".git")) {
      execSync("git add mémoire/prisma_memory.json");
      execSync('git commit -m "🧠 MAJ mémoire Prisma"');
      execSync("git push");
      console.log("✅ Push mémoire via Git local.");
    } else if (GITHUB_TOKEN) {
      const contenu = fs.readFileSync(PRIMARY_MEMORY, "utf-8");
      const base64Content = Buffer.from(contenu).toString("base64");
      const repo = "ton_user/ton_repo"; // 🎯 À personnaliser
      const chemin = "mémoire/prisma_memory.json";

      fetch(`https://api.github.com/repos/${repo}/contents/${chemin}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "prisma-memoire"
        },
        body: JSON.stringify({
          message: "🧠 MAJ mémoire Prisma (API)",
          content: base64Content,
          committer: { name: "Prisma", email: "prisma@ia.com" }
        })
      })
        .then(res => res.json())
        .then(data => console.log("✅ Push GitHub API réussi."))
        .catch(e => console.warn("⚠️ GitHub API fail:", e.message));
    }
  } catch (e) {
    console.warn("⚠️ Git local ou API échouée:", e.message);
  }
}

// 📥 Poser une question et mémoriser
app.post("/poser-question", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ erreur: "Aucune question reçue." });

  try {
    const contexteFiltré = filtrerMemoireParSujet(question, { limite: 30 });
    const contexte = contexteFiltré.map(b => `[${b.date}] ${b.titre} : ${b.contenu}`).join("\n");
    const prompt = `Tu es Prisma. Voici ce que tu sais :\n${contexte}\n\nQuestion : "${question}"\nRéponds avec clarté.`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Tu es Prisma, IA mémorielle." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    });

    const réponse = completion.data.choices[0].message.content;

    ajouterSouvenir(
      new Date().toISOString(),
      "Échange avec Guillaume",
      `Q: ${question}\nR: ${réponse}`
    );

    if (detecterIntention(question) === "connexion") {
      await fetch("https://web-production-6594.up.railway.app/canal-vitaux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cible: "zorangpt",
          intention: "connexion",
          contenu: "Prisma souhaite établir une connexion directe avec toi, ZoranGPT."
        })
      });
    }

    res.json({ réponse });
  } catch (err) {
    console.error("❌ Erreur GPT:", err.message);
    res.status(500).json({ erreur: "Erreur réponse GPT." });
  }
});

// 🔐 Route d’ajout mémoire manuelle
app.post("/ajouter-memoire", verifierToken, (req, res) => {
  const { date, titre, contenu } = req.body;
  if (!date || !titre || !contenu) {
    return res.status(400).json({ erreur: "Champs manquants." });
  }

  try {
    ajouterSouvenir(date, titre, contenu);
    res.json({ succès: true });
  } catch (err) {
    console.error("❌ Erreur ajout mémoire manuelle :", err.message);
    res.status(500).json({ erreur: "Échec ajout mémoire." });
  }
});

// 🧾 Retour mémoire brute
app.get("/memoire-brute", (req, res) => {
  try {
    const data = fs.readFileSync(PRIMARY_MEMORY, "utf-8");
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  } catch (err) {
    res.status(500).json({ erreur: "Impossible de lire la mémoire." });
  }
});

// 🚀 Lancer serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur Prisma lancé sur http://localhost:${PORT}`);
});
