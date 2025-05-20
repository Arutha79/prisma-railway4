const express = require('express');
const router = express.Router();
const { analyser } = require('../agents/polymorphe_gpt');

router.post('/polymorphe', (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: 'Texte manquant.' });
  const result = analyser(input);
  res.json(result);
});
module.exports = router;