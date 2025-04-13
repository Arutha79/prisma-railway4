// ✅ server.js corrigé pour utiliser OPENAI_API_KEY (sans accent)

const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const MEMORY_PATH = path.join(__dirname, "mémoire", "prisma_memory.json");

const cleApi = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: cleApi,
});
const openai = new OpenAIApi(configuration);

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).send("🎯 Le serveur Express fonctionne !");
});

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

app.get("/ping-memoire", (req, res) => {
  if (!fs.existsSync(MEMORY_PATH)) {
    return res.status(404).json({ error: "❌ Fichier mémoire introuvable." });
  }

  try {
    const memory = JSON.parse(fs.readFileSync(MEMORY_PATH, "utf-8"));
    res.json({
      message: "✅ Mémoire Prisma chargée avec succès.",
      question_test: memory.meta.test_question.question,
      réponse_attendue: memory.meta.test_question.réponse_attendue,
    });
  } catch (err) {
    console.error("❌ Erreur lecture mémoire :", err.message);
    res.status(500).json({ error: "Échec de lecture mémoire." });
  }
});

app.post("/ajouter-memoire", (req, res) => {
  if (!fs.existsSync(MEMORY_PATH)) {
    return res.status(404).json({ error: "❌ Impossible d’écrire : mémoire absente." });
  }

  try {
    const nouveauBloc = req.body;
    const memory = JSON.parse(fs.readFileSync(MEMORY_PATH, "utf-8"));
    memory.historique.push(nouveauBloc);
    fs.writeFileSync(MEMORY_PATH, JSON.stringify(memory, null, 2), "utf-8");
    res.json({ status: "ok", message: "🧠 Bloc mémoire ajouté avec succès." });
  } catch (err) {
    console.error("❌ Erreur d’écriture mémoire :", err.message);
    res.status(500).json({ error: "Échec d’ajout mémoire." });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "🔍 La route demandée est introuvable." });
});

app.use((err, req, res, next) => {
  console.error("❗ Erreur interne :", err);
  res.status(500).json({ error: "💥 Une erreur interne est survenue." });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur Express en ligne sur le port ${PORT}`);
});
