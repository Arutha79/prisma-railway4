// ✅ server.js optimisé pour budget limité : GPT-Zoran + résumé manuel + langage ZORAN

const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
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
  return historiqueGlobal.slice(-100); // 🔒 limite mémoire à 100 derniers blocs
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
      console.log("🧠 Souvenir ajouté automatiquement.");
    }
  } catch (err) {
    console.error("❌ Erreur auto-mémoire:", err.message);
  }
}

app.get("/resume-memoire", async (req, res) => {
  try {
    const historique = chargerToutesLesMemoires();
    const contexte = historique
      .map((bloc) => `[${bloc.date}] ${bloc.titre} : ${bloc.contenu}`)
      .join("\n");

    const prompt = `Voici l'historique mémoire structuré. Résume-le en quelques phrases utiles pour Prisma :\n\n${contexte}`;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Tu es Prisma, une IA rigoureuse qui résume sa mémoire avec clarté." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5
    });

    const résumé = completion.data.choices[0].message.content;
    res.json({ résumé });
  } catch (err) {
    console.error("❌ Erreur résumé mémoire :", err.message);
    res.status(500).json({ erreur: "Échec du résumé." });
  }
});

app.post("/poser-question-zoran", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ erreur: "❗ Aucune question reçue." });
  }

  try {
    const historique = chargerToutesLesMemoires();
    const contexte = historique.map(bloc => `[${bloc.date}] ${bloc.titre} : ${bloc.contenu}`).join("\n");

    const prompt = `Tu es Prisma. Réponds en format ZORAN (intention, mimétisme, suppression du bruit) :\n\nContexte:\n${contexte}\n\nQuestion:\n${question}`;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Tu es Prisma. Ton langage est ZORAN. Tu réponds sous forme structurée avec intention, mimétisme, suppression du bruit." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const zoranReply = completion.data.choices[0].message.content;
    ajouterMemoireAuto(question, zoranReply);
    res.json({ réponse_zoran: zoranReply });
  } catch (err) {
    console.error("❌ Erreur ZORAN :", err.message);
    res.status(500).json({ erreur: "Erreur traitement ZORAN." });
  }
});

app.get("/", (req, res) => {
  res.status(200).send("🎯 Le serveur Express fonctionne !");
});

app.listen(PORT, () => {
  console.log(`✅ Serveur Express en ligne sur le port ${PORT}`);
});
