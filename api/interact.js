const express = require('express')
const router = express.Router()
const { Configuration, OpenAIApi } = require('openai')

// Initialisation OpenAI via variable d'environnement
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

router.post('/interact', async (req, res) => {
  const { prompt, sender } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt manquant.' })
  }

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4', // ou 'gpt-3.5-turbo'
      messages: [{ role: 'user', content: prompt }],
    })

    const reply = completion.data.choices[0].message.content

    // (optionnel) console log de trace
    console.log(`[Alice] ${sender || '??'}: ${prompt} → ${reply}`)

    res.json({
      gpt_4: reply,
      sender: sender || null,
    })
  } catch (err) {
    console.error('[Alice ERROR]', err)
    res.status(500).json({ error: 'Erreur lors de l’appel à OpenAI' })
  }
})

module.exports = router
