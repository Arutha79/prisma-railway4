const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MEMORY_PATH = path.join(__dirname, "mémoire", "prisma_memory.json");

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Route de test
app.get("/", (req, res) => {
  res.status(200).send("🎯 Le serveur Express fonctionne !");
});

// ➕ Route : vérifier la mémoire
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
    console.error("❌ Erreur de lecture mémoire :", err.message);
    res.status(500).json({ error: "Échec de lecture mémoire." });
  }
});

// ➕ Route : ajouter un bloc mémoire
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

// Route 404 par défaut
app.use((req, res) => {
  res.status(404).json({ error: "🔍 La route demandée est introuvable." });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error("❗ Erreur interne :", err);
  res.status(500).json({ error: "💥 Une erreur interne est survenue." });
});

// Lancement du serveur
const server = app.listen(PORT, () => {
  console.log(`✅ Serveur Express en ligne sur le port ${PORT}`);
});

server.on("error", (err) => {
  console.error("❌ Erreur serveur :", err);
});
