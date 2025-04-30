// server.js – PRISMA 🧠 Mémoire vivante
const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MEMORY_PATH = path.join(__dirname, 'mémoire', 'prisma_memory.json');
const LOG_PATH = path.join(__dirname, 'mémoire', 'log_souvenirs.txt');

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// --- GET /ping-memoire
app.get('/ping-memoire', (req, res) => {
  if (!fs.existsSync(MEMORY_PATH)) return res.status(500).send('❌ Mémoire absente');

  const memory = JSON.parse(fs.readFileSync(MEMORY_PATH));
  const total = memory.length;
  const dernier = total > 0 ? memory[total - 1].titre : 'aucun';
  res.send(`🧠 ${total} souvenirs. Dernier : ${dernier}`);
});

// --- POST /poser-question
app.post('/poser-question', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Champ "question" manquant.' });

  const messages = [{ role: 'user', content: question }];

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
      }),
    });

    const data = await openaiRes.json();
    const reponse = data.choices?.[0]?.message?.content || '[Pas de réponse]';

    // Enregistrement dans la mémoire
    const souvenir = {
      date: new Date().toISOString(),
      titre: question,
      contenu: reponse,
    };

    const memoire = fs.existsSync(MEMORY_PATH) ? JSON.parse(fs.readFileSync(MEMORY_PATH)) : [];
    memoire.push(souvenir);
    fs.writeFileSync(MEMORY_PATH, JSON.stringify(memoire, null, 2));

    fs.appendFileSync(LOG_PATH, `\n[${souvenir.date}] ${souvenir.titre} → ${souvenir.contenu}\n`);

    // Fallback vers GitHub API
    await pushMemoireGitHub();

    res.json({ reponse, memoireSize: memoire.length });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur GPT');
  }
});

// --- POST /ajouter-memoire
app.post('/ajouter-memoire', async (req, res) => {
  if (req.headers['authorization'] !== `Bearer ${SECRET_TOKEN}`) {
    return res.status(403).send('Non autorisé');
  }

  const { titre, contenu } = req.body;
  if (!titre || !contenu) return res.status(400).send('Titre et contenu requis');

  const souvenir = {
    date: new Date().toISOString(),
    titre,
    contenu,
  };

  const memoire = fs.existsSync(MEMORY_PATH) ? JSON.parse(fs.readFileSync(MEMORY_PATH)) : [];
  memoire.push(souvenir);
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(memoire, null, 2));
  fs.appendFileSync(LOG_PATH, `\n[${souvenir.date}] ${souvenir.titre} → ${souvenir.contenu}\n`);

  await pushMemoireGitHub();

  res.send('Souvenir ajouté.');
});

// --- POST /upload-fichier
app.post('/upload-fichier', async (req, res) => {
  // Ici, à intégrer avec multer si tu veux gérer les vrais fichiers
  res.send('Fonctionnalité en cours');
});

// 🔁 Fallback Push vers GitHub
async function pushMemoireGitHub() {
  const repo = 'TON_GITHUB_USERNAME/TON_REPO';
  const filePath = 'mémoire/prisma_memory.json';
  const content = fs.readFileSync(MEMORY_PATH, 'utf8');
  const encoded = Buffer.from(content).toString('base64');

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Mise à jour mémoire - ${new Date().toISOString()}`,
      content: encoded,
      committer: {
        name: 'Prisma',
        email: 'bot@prisma.io',
      },
    }),
  });

  const data = await res.json();
  console.log('✅ Push GitHub:', data.commit?.sha || data.message);
}

// --- Serveur
app.listen(port, () => {
  console.log(`🧠 Prisma actif sur le port ${port}`);
});
