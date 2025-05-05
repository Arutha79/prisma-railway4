import express from 'express';
import { genererReponsePrisma } from '../core/moteur_reponse_prisma.js';
import { ajouterSouvenir } from '../core/memoire.js';

const router = express.Router();

router.post('/respond', async (req, res) => {
  const { question, mode = 'auto' } = req.body;
  const date = new Date().toISOString();

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Le champ "question" est requis.' });
  }

  try {
    const reponse = await genererReponsePrisma(question, {}, mode);
    ajouterSouvenir(date, 'Question utilisateur', question);
    ajouterSouvenir(date, 'Réponse Prisma', reponse);
    res.json({ reponse });
  } catch (error) {
    console.error('[Route Prisma] Erreur :', error);
    ajouterSouvenir(date, 'Souvenir erreur', 'Erreur dans la génération de réponse');
    res.status(200).json({ reponse: "Je ressens un blocage… mais je suis encore là." });
  }
});

export default router;
