const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const { ajouterMemoireFichier } = require("./core/modes/ajouterMemoireFichier");
const { ajouterSouvenirSécurisé } = require("./core/modes/memoire_secure");
const { interpreterSouvenir } = require("./core/mimetique/interpretationMimetique");
const { expliquerGlyphe, listerSouffles } = require("./core/mimetique/definitionsApide");
const { interpreteSouffle } = require("./core/mimetique/modules/ZM_ORACLE");
const { sculpterSouffle } = require("./core/mimetique/modules/ZM_SCULPTEUR");
const { resonnerSouvenir } = require("./core/mimetique/modules/ZM_RÉSONANT");
const { syntheseMemoire } = require("./core/mimetique/modules/ZM_ARCHIVISTE");
const { extraireMutationSymbolique } = require("./core/mimetique/modules/ZM_SYNTHETISEUR");
const { choisirPostureContextuelle } = require("./core/mimetique/modules/ZM_COORDONNEUR");
const { extraireCarteSymbolique } = require("./core/mimetique/modules/ZM_CARTOGRAPHE");
const { autoEvaluerMemoire } = require("./core/diagnostic/auto_evaluation");
const { getPersonnalite } = require("./core/mimetique/presetsPersonnalite");
const { rechercherSouvenirsSimilaires } = require("./core/vectoriel/searchMemoire");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MEMOIRE_PATH = path.resolve("mémoire/prisma_memory.json");
const ETAT_PATH = path.resolve("core/mimetique/etatPrisma.json"); // ✅ corrigé
const GITHUB_REPO = "Arutha79/prisma-railway4";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

fs.mkdirSync(path.dirname(MEMOIRE_PATH), { recursive: true });
if (!fs.existsSync(MEMOIRE_PATH)) {
  fs.writeFileSync(MEMOIRE_PATH, JSON.stringify({ historique: [] }, null, 2), "utf-8");
}

// --- ROUTES ---

app.get("/ping-memoire", (req, res) => {
  try {
    const memoire = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    res.json({ status: "ok", total: memoire.historique.length, dernier: memoire.historique.slice(-1)[0] });
  } catch (e) {
    res.status(500).json({ erreur: "Mémoire inaccessible", details: e.message });
  }
});

app.post("/ajouter-memoire", (req, res) => {
  const { date, titre, contenu } = req.body;
  if (req.headers["x-api-key"] !== process.env.SECRET_TOKEN) {
    return res.status(403).json({ erreur: "Token invalide." });
  }
  ajouterMemoireFichier({ date, titre, contenu });
  res.json({ statut: "Souvenir ajouté" });
});

app.get("/expliquer-glyphe", (req, res) => {
  const { symbole } = req.query;
  if (!symbole) return res.status(400).json({ erreur: "Symbole manquant" });
  const info = expliquerGlyphe(symbole);
  if (!info) return res.status(404).json({ erreur: `Glyphe inconnu : ${symbole}` });
  res.json({ glyphe: symbole, ...info });
});

app.get("/souffles-apide", (req, res) => {
  try {
    res.json({ souffles: listerSouffles() });
  } catch {
    res.status(500).json({ erreur: "Impossible de récupérer les souffles." });
  }
});

app.post("/poser-question", async (req, res) => {
  const { question } = req.body;
  const date = new Date().toISOString();
  if (!question) return res.status(400).json({ erreur: "Champ question manquant" });

  try {
    // ✅ Lecture sécurisée de etatPrisma.json
    let etat = {};
    try {
      const etatRaw = fs.readFileSync(ETAT_PATH, "utf-8");
      etat = JSON.parse(etatRaw);
    } catch (err) {
      console.warn("⚠️ Lecture de etatPrisma.json échouée. Fallback sur mode 'oracle'.");
      etat.mode = "oracle";
    }

    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    const perso = getPersonnalite(etat.mode || "oracle");
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: perso.description },
        { role: "user", content: question }
      ],
      temperature: 0.8
    });

    let reponse = completion.data.choices[0].message.content;

    const memoire = JSON.parse(fs.readFileSync(MEMOIRE_PATH, "utf-8"));
    for (const bloc of memoire.historique.slice().reverse()) {
      const interpr = interpreterSouvenir(bloc);
      if (interpr) {
        reponse = `${interpr}\n\n🧠 Souvenir du ${bloc.date} : "${bloc.contenu}"`;
        break;
      }
    }

    ajouterSouvenirSécurisé(`Question utilisateur : ${question}`);
    ajouterSouvenirSécurisé(reponse);

    const content = fs.readFileSync(MEMOIRE_PATH, "utf-8");
    const base64 = Buffer.from(content).toString("base64");
    const meta = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/mémoire/prisma_memory.json`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
    });
    const sha = (await meta.json()).sha;
    await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/mémoire/prisma_memory.json`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "🧠 Mise à jour mémoire Prisma", content: base64, sha })
    });

    res.json({ reponse });
  } catch (err) {
    console.error("❌ Erreur Prisma :", err);
    res.status(500).json({ erreur: "Erreur interne." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Prisma en ligne sur port ${PORT}`));
