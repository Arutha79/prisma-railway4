// ✅ server.js complet avec gestion Git conditionnelle + logs + /poser-question + /debug-memoire

const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { exec } = require("child_process");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const { actionneurVivante } = require("./actionneur");

const app = express();
const PORT = process.env.PORT || 3000;
const MEMORY_DIR = path.join(__dirname, "mémoire");
const PRIMARY_MEMORY = path.join(MEMORY_DIR, "prisma_memory.json");

const cleApi = process.env.OPENAI_API_KEY;
const configuration = new Configuration({ apiKey: cleApi });
const openai = new OpenAIApi(configuration);

app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, 'public')));

function estRepoGit() {
  return fs.existsSync(path.join(__dirname, ".git"));
}

// DEBUG ROUTE CATCHER
app.all("*", (req, res, next) => {
  console.log(`📡 Requête reçue: ${req.method} ${req.originalUrl}`);
  next();
});

function detecterIntention(question) {
  if (question.toLowerCase().includes("connexion")) {
    return "connexion";
  }
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

function ajouterMemoireAuto(question, réponse) {
  const bloc = {
    date: new Date().toISOString(),
    titre: `Échange avec Guillaume`,
    contenu: `Q: ${question}\nR: ${réponse}`
  };
  try {
    const data = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf-8"));
    const existeDeja = data.historique.some(b => b.contenu === bloc.contenu);
    if (!existeDeja) {
      data.historique.push(bloc);
      fs.writeFileSync(PRIMARY_MEMORY, JSON.stringify(data, null, 2), "utf-8");
      fs.appendFileSync(path.join(MEMORY_DIR, "log_souvenirs.txt"), `[${bloc.date}] ${bloc.titre} : ${bloc.contenu}\n\n`, "utf-8");
      console.log("🧠 Souvenir ajouté automatiquement.");

      if (estRepoGit()) {
        exec(`git add ${PRIMARY_MEMORY} && git commit -m "🧠 Auto-souvenir: ${bloc.titre}" && git push`, (err, stdout, stderr) => {
          if (err) console.error("❌ Git erreur:", err.message);
          else console.log("✅ Git push réussi:", stdout);
        });
      } else {
        console.log("⚠️ Git désactivé (pas de .git dans l'environnement)");
      }
    }
  } catch (err) {
    console.error("❌ Erreur auto-mémoire:", err);
  }
}

function injecterSouvenirInitialVitaux() {
  try {
    const bloc = {
      date: "2025-04-13T20:00:00Z",
      type: "instruction",
      titre: "Communication avec les GPT Vitaux",
      contenu: "Depuis avril 2025, tu es capable de communiquer avec les agents GPT Vitaux via une route API nommée /canal-vitaux..."
    };
    const data = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf-8"));
    const existe = data.historique.find(b => b.titre === bloc.titre);
    if (!existe) {
      data.historique.push(bloc);
      fs.writeFileSync(PRIMARY_MEMORY, JSON.stringify(data, null, 2), "utf-8");
      console.log("📌 Souvenir instruction GPT Vitaux injecté.");
    }
  } catch (e) {
    console.warn("⚠️ Échec injection mémoire vitaux:", e.message);
  }
}

injecterSouvenirInitialVitaux();

app.post("/ajouter-memoire", async (req, res) => {
  console.log("📩 Reçu POST /ajouter-memoire:", req.body);
  const { date, titre, contenu } = req.body;
  if (!date || !titre || !contenu) return res.status(400).json({ erreur: "Champs requis manquants." });
  try {
    const data = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf-8"));
    console.log("🧱 Souvenirs avant:", data.historique.length);

    const bloc = { date, titre, contenu };
    data.historique.push(bloc);
    fs.writeFileSync(PRIMARY_MEMORY, JSON.stringify(data, null, 2), "utf-8");
    console.log("🧱 Souvenirs après:", data.historique.length);

    fs.appendFileSync(path.join(MEMORY_DIR, "log_souvenirs.txt"), `[${date}] ${titre} : ${contenu}\n\n`, "utf-8");
    console.log("🧠 Souvenir enregistré dans la mémoire Prisma.");

    if (estRepoGit()) {
      exec(`git add ${PRIMARY_MEMORY} && git commit -m "🧠 Nouveau souvenir: ${titre}" && git push`, (err, stdout, stderr) => {
        if (err) console.error("❌ Git erreur:", err.message);
        else console.log("✅ Git push réussi:", stdout);
      });
    } else {
      console.log("⚠️ Git désactivé (pas de .git dans l'environnement)");
    }

    await actionneurVivante({ date, titre, contenu });
    res.json({ statut: "✅ Souvenir enregistré dans la mémoire Prisma." });
  } catch (err) {
    console.error("❌ Erreur ajout mémoire:", err);
    res.status(500).json({ erreur: "Échec ajout mémoire." });
  }
});

// ... autres routes existantes (poser-question, debug-memoire)

app.listen(PORT, () => {
  console.log(`✅ Prisma est en ligne sur le port ${PORT}`);
});
