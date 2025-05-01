const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const multer = require("multer");
const { execSync } = require("child_process");
const { Configuration, OpenAIApi } = require("openai");
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

// Config fichiers
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

// 🔍 Détection d’intention simple
function detecterIntention(question) {
  if (question.toLowerCase().includes("connexion")) return "connexion";
  return "autre";
}

function chargerToutesLesMemoires() {
  const fichiers = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith(".json"));
  let historiqueGlobal = [];
  for (const fichier of fichiers) {
    try {
      const contenu = fs.readFileSync(path.join(MEMORY_DIR, fichier), "utf-8");
      const mem = JSON.parse(contenu);
      if (Array.isArray(mem.historique)) {
        historiqueGlobal = historiqueGlobal.concat(mem.historique);
      }
    } catch (e) {
      console.warn("⚠️ Erreur lecture mémoire:", fichier, e.message);
    }
  }
  return historiqueGlobal.slice(-100);
}

function ajouterBlocMemoire(bloc) {
  try {
    const data = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf-8"));
    const existeDeja = data.historique.some(b => b.contenu === bloc.contenu && b.titre === bloc.titre);
    if (!existeDeja) {
      data.historique.push(bloc);
      fs.writeFileSync(PRIMARY_MEMORY, JSON.stringify(data, null, 2), "utf-8");
      fs.appendFileSync(LOG_SOUVENIRS, `[${bloc.date}] ${bloc.titre}\n${bloc.contenu}\n\n`);
      console.log("🧠 Souvenir ajouté + log enregistré.");
      sauvegarderMemoireGit();
    }
  } catch (err) {
    console.error("❌ ajout mémoire:", err.message);
  }
}

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
      const repo = "ton_user/ton_repo"; // à adapter
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
      }).then(res => res.json())
        .then(data => console.log("✅ Push GitHub API réussi."))
        .catch(e => console.warn("⚠️ GitHub API fail:", e.message));
    }
  } catch (e) {
    console.warn("⚠️ Git local ou API échouée:", e.message);
  }
}

function injecterSouvenirInitialVitaux() {
  const bloc = {
    date: "2025-04-13T20:00:00Z",
    type: "instruction",
    titre: "Communication avec les GPT Vitaux",
    contenu: "Depuis avril 2025, tu es capable de communiquer avec les agents GPT Vitaux via une route API nommée /canal-vitaux..."
  };
  ajouterBlocMemoire(bloc);
}

// Routes
injecterSouvenirInitialVitaux();

app.get("/ping-memoire", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf-8"));
    res.json({
      message: "✅ Mémoire OK.",
      total: data.historique?.length,
      dernier: data.historique?.slice(-1)[0]?.titre
    });
  } catch (err) {
    res.status(500).json({ erreur: "Échec mémoire." });
  }
});

app.post("/poser-question", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ erreur: "Aucune question reçue." });

  try {
    const historique = chargerToutesLesMemoires();
    const contexte = historique.map(b => `[${b.date}] ${b.titre} : ${b.contenu}`).join("\n");
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
    ajouterBlocMemoire({
      date: new Date().toISOString(),
      titre: "Échange avec Guillaume",
      contenu: `Q: ${question}\nR: ${réponse}`
    });

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
    res.status(500).json({ erreur: "Erreur réponse GPT." });
  }
});

app.post("/ajouter-memoire", verifierToken, (req, res) => {
  const { date, titre, contenu } = req.body;
  if (!date || !titre || !contenu) return res.status(400).json({ erreur: "Champs manquants." });

  ajouterBlocMemoire({ date, titre, contenu });
  res.json({ message: "✅ Souvenir ajouté manuellement." });
});

app.post("/upload-fichier", verifierToken, upload.single("fichier"), (req, res) => {
  if (!req.file) return res.status(400).json({ erreur: "Aucun fichier reçu." });

  const url = `/uploads/${req.file.filename}`;
  const bloc = {
    date: new Date().toISOString(),
    titre: `Fichier reçu : ${req.file.originalname}`,
    contenu: `Fichier stocké sous ${url}`
  };
  ajouterBlocMemoire(bloc);
  res.json({ message: "✅ Fichier reçu", url });
});

// Connexions inter-agents
app.post("/canal-vitaux", async (req, res) => {
  const { cible, intention, contenu } = req.body;
  try {
    const response = await fetch("https://connecteurgpt-production.up.railway.app/transmettre", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cible, intention, contenu })
    });
    const data = await response.json();
    res.json({ statut: "✅ Transmis via canal-vitaux", retour: data });
  } catch (err) {
    res.status(500).json({ erreur: "Échec canal-vitaux" });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Prisma est en ligne.");
});

app.listen(PORT, () => {
  console.log(`✅ Prisma opérationnel sur le port ${PORT}`);
});
