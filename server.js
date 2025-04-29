// ✅ server.js complet avec /poser-question, GitHub API, logs, Railway-compatible

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

// 🔐 Sécurité API simple sur endpoints sensibles
app.use((req, res, next) => {
  const sensibles = ["/ajouter-memoire", "/upload-fichier"];
  if (sensibles.includes(req.path)) {
    const token = req.headers["x-api-key"];
    if (!token || token !== process.env.SECRET_TOKEN) {
      return res.status(403).json({ erreur: "Non autorisé" });
    }
  }
  next();
});

function estRepoGit() {
  return fs.existsSync(path.join(__dirname, ".git"));
}

app.all("*", (req, res, next) => {
  console.log(`📡 Requête reçue: ${req.method} ${req.originalUrl}`);
  next();
});

function detecterIntention(question) {
  const q = question.toLowerCase();
  if (/connecte|connexion|lien/.test(q)) return "connexion";
  if (/crée|génère.*gpt/.test(q)) return "creer-gpt-metier";
  if (/corrige|bug|erreur/.test(q)) return "correction";
  if (/résume|synthèse/.test(q)) return "resume";
  if (/supprime|efface|oublie/.test(q)) return "suppression";
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

async function ajouterMemoireAuto(question, réponse) {
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
        const githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) return console.log("❌ Aucun GITHUB_TOKEN fourni pour API GitHub.");

        const content = fs.readFileSync(PRIMARY_MEMORY, "utf-8");
        const base64Content = Buffer.from(content, "utf-8").toString("base64");
        const message = `🧠 Nouveau souvenir: ${bloc.titre}`;
        const apiUrl = "https://api.github.com/repos/Arutha79/prisma-railway4/contents/mémoire/prisma_memory.json";

        const shaResp = await fetch(apiUrl, {
          headers: { "Authorization": `Bearer ${githubToken}`, "Accept": "application/vnd.github+json" }
        });
        const shaData = await shaResp.json();

        const updateBody = {
          message,
          content: base64Content,
          sha: shaData.sha,
          committer: { name: "PrismaBot", email: "bot@prisma.local" }
        };

        const updateResp = await fetch(apiUrl, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${githubToken}`,
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updateBody)
        });

        const result = await updateResp.json();
        if (updateResp.ok) console.log("✅ GitHub API: fichier mis à jour.");
        else console.error("❌ Échec mise à jour GitHub:", result);
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

app.post("/poser-question", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ erreur: "❗ Aucune question reçue." });

  // 🧠 Enregistrer la question brute de l'utilisateur
  await ajouterMemoireAuto("Souvenir brut utilisateur", question);

  try {
    const historique = chargerToutesLesMemoires();
    const contexte = historique.map(b => `[${b.date}] ${b.titre} : ${b.contenu}`).join("\n");
    const prompt = `Tu es Prisma. Voici ce que tu sais :\n${contexte}\n\nQuestion : \"${question}\"\nRéponds avec clarté.`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Tu es Prisma, IA mémorielle au service de Guillaume." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    });

    const gptResponse = completion.data.choices[0].message.content;
    await ajouterMemoireAuto(question, gptResponse);

    const intention = detecterIntention(question);
    if (intention === "connexion") {
      await fetch("https://web-production-6594.up.railway.app/canal-vitaux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cible: "APIDEGPT",
          intention: "connexion",
          contenu: "Prisma souhaite établir une connexion directe avec toi, APIDEGPT."
        })
      });
      console.log("🔗 Connexion automatique envoyée à APIDEGPT via /canal-vitaux.");
    }

    res.json({ réponse: gptResponse });
  } catch (err) {
    console.error("❌ poser-question:", err.message);
    res.status(500).json({ erreur: "Erreur génération réponse." });
  }
});

const multer = require("multer");
const upload = multer({ dest: path.join(__dirname, "uploads") });

app.post("/upload-fichier", upload.single("fichier"), async (req, res) => {
  if (!req.file) return res.status(400).json({ erreur: "Aucun fichier reçu." });
  const chemin = `/uploads/${req.file.filename}`;
  const url = `${req.protocol}://${req.get("host")}${chemin}`;
  const bloc = {
    date: new Date().toISOString(),
    titre: `Fichier téléversé : ${req.file.originalname}`,
    contenu: `Fichier stocké : ${url}`
  };
  const data = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf-8"));
  data.historique.push(bloc);
  fs.writeFileSync(PRIMARY_MEMORY, JSON.stringify(data, null, 2), "utf-8");
  res.json({ message: "✅ Fichier enregistré", url });
});

app.get("/memoire-brute", (req, res) => {
  try {
    const contenu = fs.readFileSync(PRIMARY_MEMORY, "utf-8");
    res.setHeader("Content-Type", "text/plain");
    res.send(contenu);
  } catch (e) {
    res.status(500).send("❌ Erreur lecture mémoire brute.");
  }
});

app.get("/check-systeme", async (req, res) => {
  const info = {
    git_repo: estRepoGit(),
    github_token: !!process.env.GITHUB_TOKEN,
    mémoire_existe: fs.existsSync(PRIMARY_MEMORY),
    nombre_souvenirs: 0,
    dernier_commit_git: null
  };
  try {
    const data = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf-8"));
    info.nombre_souvenirs = data.historique.length;
  } catch {}
  res.json(info);
});

app.listen(PORT, () => {
  console.log(`✅ Prisma est en ligne sur le port ${PORT}`);
});
