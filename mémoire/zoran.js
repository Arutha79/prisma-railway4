const express = require('express');
const router = express.Router();
const { zoranize } = require('../agents/zoraniseur_gpt');

router.post('/zoran', (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: 'Texte manquant.' });
  const result = zoranize(input);
  res.json(result);
});
module.exports = router;