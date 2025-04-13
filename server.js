// ✅ server.js avec mémoire multi-fichiers et auto-enrichissement

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
  return historiqueGlobal;
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

app.get("/", (req, res) => {
  res.status(200).send("🎯 Le serveur Express fonctionne !");
});

app.get("/openapi.json", (req, res) => {
  res.json({
    openapi: "3.1.0",
    info: { title: "API Prisma", version: "1.0.0" },
    servers: [{ url: "https://web-production-6594.up.railway.app" }],
    paths: {
      "/ping-memoire": {
        get: {
          operationId: "pingMemoire",
          summary: "Vérifie que la mémoire Prisma est active",
          responses: {
            "200": {
              description: "Succès",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      question_test: { type: "string" },
                      réponse_attendue: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/poser-question": {
        post: {
          operationId: "poserQuestion",
          summary: "Poser une question à Prisma",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    question: { type: "string" }
                  },
                  required: ["question"]
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Réponse de Prisma",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      réponse: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/ajouter-memoire": {
        post: {
          operationId: "ajouterMemoire",
          summary: "Ajouter un souvenir à la mémoire de Prisma",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    date: { type: "string" },
                    titre: { type: "string" },
                    texte: {
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  required: ["date", "titre", "texte"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Confirmation ajout mémoire" }
          }
        }
      }
    }
  });
});

app.post("/poser-question", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ erreur: "❗ Aucune question reçue." });
  }

  try {
    const historique = chargerToutesLesMemoires();
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
    ajouterMemoireAuto(question, gptResponse);
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
  try {
    const historique = chargerToutesLesMemoires();
    const data = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf-8"));
    res.json({
      message: "✅ Mémoire Prisma chargée avec succès.",
      question_test: data.meta?.test_question?.question || "-",
      réponse_attendue: data.meta?.test_question?.réponse_attendue || "-"
    });
  } catch (err) {
    console.error("❌ Erreur lecture mémoire :", err.message);
    res.status(500).json({ error: "Échec de lecture mémoire." });
  }
});

app.post("/ajouter-memoire", (req, res) => {
  try {
    const nouveauBloc = req.body;
    const memory = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf-8"));
    memory.historique.push(nouveauBloc);
    fs.writeFileSync(PRIMARY_MEMORY, JSON.stringify(memory, null, 2), "utf-8");
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
