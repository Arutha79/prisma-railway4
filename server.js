const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const MEMORY_PATH = path.join(__dirname, "mémoire", "prisma_memory.json");

// 🔐 Configuration OpenAI (clé adaptée à Railway)
const configuration = new Configuration({
  apiKey: process.env["CLÉ_API_OPENAI"], // ✅ Avec crochets pour supporter les accents
});
const openai = new OpenAIApi(configuration);

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// ✅ Route d’accueil
app.get("/", (req, res) => {
  res.status(200).send("🎯 Le serveur Express fonctionne !");
});

// ✅ Route : poser une question
app.post("/poser-question", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ erreur: "❗ Aucune question reçue." });
  }

  if (!fs.existsSync(MEMORY_PATH)) {
    return res.status(404).json({ erreur: "❌ Mémoire introuvable." });
  }

  try {
    const memory = JSON.parse(fs.readFileSync(MEMORY_PATH, "utf-8"));
    const historique = memory.historique || [];

    const contexte = historique
      .map((bloc) => `[${bloc.date}] ${bloc.titre} : ${bloc.contenu}`)
      .join("\n");

    const prompt = `
Tu es Prisma, une IA structurée et mémorielle au service de Guillaume. Voici ce que tu sais :
${contexte}

Maintenant, voici la question de Guillaume :
"${question}"

Réponds avec rigueur, clarté et concision.
`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Tu es Prisma, une IA sérieuse, rigoureuse et fidèle à la vision de Guillaume." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    });

    const gptResponse = completion.data.choices[0].message.content;
    res.json({ réponse: gptResponse });
  } catch (err) {
    console.error("❌ Erreur GPT ou mémoire :", err.response?.data || err.message);
    res.status(500).json({
      erreur: `💥 Erreur serveur pendant le traitement.`,
      détail: err.response?.data || err.message
    });
  }
});

// ✅ Route : ping-memoire
app.get("/ping-memoire", (req, res) => {
  if

