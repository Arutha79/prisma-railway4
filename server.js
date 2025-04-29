// 📁 server.js pour Alice (conforme protocole Prisma + AGENTS VITAUX)

const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { exec } = require("child_process");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const MEMORY_DIR = path.join(__dirname, "mémoire");
const PRIMARY_MEMORY = path.join(MEMORY_DIR, "alice_memory.json");
const LOG_FILE = path.join(MEMORY_DIR, "log_alice.txt");

const cleApi = process.env.OPENAI_API_KEY;
const configuration = new Configuration({ apiKey: cleApi });
const openai = new OpenAIApi(configuration);

if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR);
if (!fs.existsSync(PRIMARY_MEMORY)) fs.writeFileSync(PRIMARY_MEMORY, JSON.stringify({ historique: [] }, null, 2), "utf8");
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, "", "utf8");

app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, 'public')));

const AGENTS_VITAUX = {
  PromptGPT: "https://promptgpt-production.up.railway.app/",
  SynthéPro: "https://synth-pro-production.up.railway.app/",
  BuilderGPT: "https://buildergpt-production.up.railway.app/",
  GPTClonerGPT: "https://gptclonergpt-production.up.railway.app/",
  SentinelleIA: "https://sentinelleia-production.up.railway.app/",
  CheckerGPT: "https://checkergpt-production.up.railway.app/",
  TextGPT: "https://textgpt-production-d174.up.railway.app/",
  DevGPT: "https://devgpt-production.up.railway.app/",
  ImageGPT: "https://imagegpt-production.up.railway.app/",
  MedecinGPT: "https://m-decingpt-production.up.railway.app/",
  MaintenanceGPT: "https://maintenancegpt-production.up.railway.app/",
  ForgeurGPT: "https://forgeurgpt-production.up.railway.app/",
  ConnecteurGPT: "https://connecteurgpt-production.up.railway.app/",
  APIDEGPT: "https://apidegpt-production.up.railway.app/"
};

// 🔐 Middleware sécurité x-api-key
app.use((req, res, next) => {
  const sensibles = ["/alice/ajouter-memoire", "/alice/upload-fichier"];
  if (sensibles.includes(req.path)) {
    const token = req.headers["x-api-key"];
    if (!token || token !== process.env.SECRET_TOKEN) {
      return res.status(403).json({ erreur: "Non autorisé" });
    }
  }
  next();
});

app.all("*", (req, res, next) => {
  console.log(`📡 Requête reçue: ${req.method} ${req.originalUrl}`);
  next();
});

function estRepoGit() {
  return fs.existsSync(path.join(__dirname, ".git"));
}

async function ajouterMemoireAuto(titre, contenu) {
  const bloc = {
    date: new Date().toISOString(),
    titre,
    contenu
  };

  const data = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf8"));
  data.historique.push(bloc);
  fs.writeFileSync(PRIMARY_MEMORY, JSON.stringify(data, null, 2), "utf8");
  fs.appendFileSync(LOG_FILE, `[${bloc.date}] ${bloc.titre}: ${bloc.contenu}\n\n`, "utf8");

  if (estRepoGit()) {
    exec(`git add ${PRIMARY_MEMORY} && git commit -m "🧠 Auto-souvenir: ${bloc.titre}" && git push`, (err, stdout, stderr) => {
      if (err) console.error("❌ Git erreur:", err.message);
      else console.log("✅ Git push réussi:", stdout);
    });
  } else {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) return console.log("❌ Aucun GITHUB_TOKEN fourni pour API GitHub.");

    const content = fs.readFileSync(PRIMARY_MEMORY, "utf8");
    const base64Content = Buffer.from(content, "utf8").toString("base64");
    const apiUrl = "https://api.github.com/repos/Arutha79/gptportail/contents/mémoire/alice_memory.json";

    const shaResp = await fetch(apiUrl, {
      headers: { "Authorization": `Bearer ${githubToken}`, "Accept": "application/vnd.github+json" }
    });
    const shaData = await shaResp.json();

    const updateBody = {
      message: `🧠 Update souvenir: ${bloc.titre}`,
      content: base64Content,
      sha: shaData.sha,
      committer: { name: "AliceBot", email: "bot@alice.local" }
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

    if (updateResp.ok) console.log("✅ GitHub API: mémoire mise à jour.");
    else console.error("❌ Échec mise à jour GitHub:", await updateResp.text());
  }
}

app.post("/alice/poser-question", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ erreur: "❗ Aucune question reçue." });

  await ajouterMemoireAuto("Question utilisateur", question);

  try {
    const historique = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf8"));
    const contexte = historique.historique.slice(-50).map(b => `[${b.date}] ${b.titre}: ${b.contenu}`).join("\n");
    const prompt = `Tu es Alice. Voici ce que tu sais:\n${contexte}\n\nQuestion:\n${question}`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Tu es Alice, IA bras droit vivant de Guillaume." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    });

    const reponse = completion.data.choices[0].message.content;
    await ajouterMemoireAuto("Réponse d'Alice", reponse);

    res.json({ reponse });
  } catch (err) {
    console.error("❌ poser-question:", err.message);
    res.status(500).json({ erreur: "Erreur génération réponse." });
  }
});

app.get("/alice/ping-memoire", (req, res) => {
  try {
    const memory = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf8"));
    res.json({
      message: "✅ Mémoire Alice accessible.",
      total: memory.historique?.length || 0,
      dernier_titre: memory.historique?.at(-1)?.titre || "Aucun souvenir"
    });
  } catch (err) {
    console.error("❌ Erreur lecture mémoire:", err.message);
    res.status(500).json({ erreur: "Échec lecture mémoire." });
  }
});

app.post("/canal-vitaux", async (req, res) => {
  const { agent_cible, intention, contenu } = req.body;
  const url = AGENTS_VITAUX[agent_cible];

  if (!url) return res.status(400).json({ erreur: `Agent cible inconnu : ${agent_cible}` });

  try {
    const response = await fetch(`${url}canal-reception`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intention, contenu })
    });

    const data = await response.json();
    res.json({ statut: '✅ Message transmis', retour: data });
  } catch (err) {
    console.error(`❌ Erreur avec ${agent_cible} :`, err.message);
    res.status(500).json({ erreur: `Échec communication avec ${agent_cible}` });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Alice est en ligne sur le port ${PORT}`);
});
