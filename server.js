// ✅ server.js complet pour Prisma avec déclencheur automatique vers ConnecteurGPT

const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

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

// 🔍 Détecteur d'intention simple
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
    titre: Échange avec Guillaume,
    contenu: Q: ${question}\nR: ${réponse}
  };
  try {
    const data = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf-8"));
    const existeDeja = data.historique.some(b => b.contenu === bloc.contenu);
    if (!existeDeja) {
      data.historique.push(bloc);
      fs.writeFileSync(PRIMARY_MEMORY, JSON.stringify(data, null, 2), "utf-8");
      console.log("🧠 Souvenir ajouté automatiquement.");
    }
  } catch (err) {
    console.error("❌ Erreur auto-mémoire:", err.message);
  }
}

function injecterSouvenirInitialVitaux() {
  try {
    const bloc = {
      date: "2025-04-13T20:00:00Z",
      type: "instruction",
      titre: "Communication avec les GPT Vitaux",
      contenu: "Depuis avril 2025, tu es capable de communiquer avec les agents GPT Vitaux via une route API nommée /canal-vitaux. Chaque agent est défini dans agents_gpt.json avec son rôle et son URL. Tu peux leur transmettre des intentions, recevoir leurs réponses, et mémoriser l'échange."
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

app.get("/ping-memoire", (req, res) => {
  try {
    const memory = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf-8"));
    const meta = memory.meta?.test_question || {};
    res.json({
      message: "✅ Mémoire Prisma accessible.",
      question_test: meta.question || "-",
      réponse_attendue: meta.réponse_attendue || "-"
    });
  } catch (err) {
    console.error("❌ Erreur lecture mémoire:", err.message);
    res.status(500).json({ erreur: "Échec lecture mémoire." });
  }
});

app.post("/poser-question", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ erreur: "❗ Aucune question reçue." });

  try {
    const historique = chargerToutesLesMemoires();
    const contexte = historique.map(b => [${b.date}] ${b.titre} : ${b.contenu}).join("\n");
    const prompt = Tu es Prisma. Voici ce que tu sais :\n${contexte}\n\nQuestion : \"${question}\"\nRéponds avec clarté.;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Tu es Prisma, IA mémorielle au service de Guillaume." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    });

    const gptResponse = completion.data.choices[0].message.content;
    ajouterMemoireAuto(question, gptResponse);

    // 🚀 Déclencheur automatique si intention = connexion
    const intention = detecterIntention(question);
    if (intention === "connexion") {
      await fetch("https://web-production-6594.up.railway.app/canal-vitaux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cible: "zorangpt",
          intention: "connexion",
          contenu: "Prisma souhaite établir une connexion directe avec toi, ZoranGPT."
        })
      });
      console.log("🔗 Connexion automatique envoyée à ZoranGPT via /canal-vitaux.");
    }

    res.json({ réponse: gptResponse });
  } catch (err) {
    console.error("❌ poser-question:", err.message);
    res.status(500).json({ erreur: "Erreur génération réponse." });
  }
});

// Routes ConnecteurGPT
app.post("/vers-connecteurgpt", async (req, res) => {
  const { cible, intention, contenu } = req.body;
  try {
    const response = await fetch("https://connecteurgpt-production.up.railway.app/transmettre", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cible, intention, contenu })
    });
    const data = await response.json();
    res.json({ statut: "✅ Transmis via ConnecteurGPT", retour: data });
  } catch (err) {
    console.error("❌ Erreur vers ConnecteurGPT:", err.message);
    res.status(500).json({ erreur: "ConnecteurGPT inaccessible" });
  }
});

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
    console.error("❌ canal-vitaux:", err.message);
    res.status(500).json({ erreur: "Échec canal-vitaux" });
  }
});

app.get("/check-connecteurgpt", async (req, res) => {
  try {
    const test = await fetch("https://connecteurgpt-production.up.railway.app/");
    const texte = await test.text();
    res.json({ connecté: true, message: texte });
  } catch (err) {
    console.error("❌ ConnecteurGPT inaccessible :", err.message);
    res.status(500).json({ connecté: false, erreur: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Prisma est en ligne.");
});

app.listen(PORT, () => {
  console.log(✅ Prisma est en ligne sur le port ${PORT});
});
