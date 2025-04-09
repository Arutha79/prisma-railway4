const express = require("express");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Route de test
app.get("/", (req, res) => {
  res.status(200).send("🎯 Le serveur Express fonctionne !");
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