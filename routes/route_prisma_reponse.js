import express from 'express';
import { genererReponsePrisma } from '../core/moteur_reponse_prisma.js';

const router = express.Router();

router.post('/respond', async (req, res) => {
  const { question, mode = 'gpt' } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Le champ "question" est requis.' });
  }

  try {
    const reponse = await genererReponsePrisma(question, {}, mode);
    res.json({ reponse });
  } catch (error) {
    console.error('[Route Prisma] Erreur :', error);
    res.status(500).json({ error: "Erreur interne du moteur Prisma." });
  }
});

export default router;
