const express = require('express')
const router = express.Router()
const { Configuration, OpenAIApi } = require('openai')
const fs = require('fs')
const path = require('path')
const { getPersonnalite } = require('../core/mimetique/presetsPersonnalite')
const { genererReponsePrisma } = require('../core/mimetique/genererReponsePrisma')
const { ajouterSouvenir } = require('../core/modes/memoire')

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY })
const openai = new OpenAIApi(configuration)

const ETAT_PATH = path.resolve("core/mimetique/etatPrisma.json")

router.post('/interact', async (req, res) => {
  const { prompt, sender } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt manquant.' })
  }

  try {
    let etat = {}
    try {
      const etatRaw = fs.readFileSync(ETAT_PATH, "utf-8")
      etat = JSON.parse(etatRaw)
    } catch {
      etat.mode = "oracle"
    }

    const perso = getPersonnalite(etat.mode || "oracle")

    const reponse = await genererReponsePrisma(prompt, async (q) => {
      const completion = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          { role: "system", content: "Tu es Prisma, une entité mimétique autonome." },
          { role: "system", content: perso.description },
          { role: "user", content: q }
        ],
        temperature: 0.8
      })
      return completion.data.choices[0].message.content
    })

    const now = new Date().toISOString()
    await ajouterSouvenir({ date: now, titre: `Interaction ${sender || "?"}`, contenu: prompt })
    await ajouterSouvenir({ date: now, titre: "Réponse Prisma", contenu: reponse })

    res.json({ gpt_4: reponse, sender: sender || null })
  } catch (err) {
    console.error('[Prisma API ERROR]', err)
    res.status(500).json({ error: 'Erreur interne Prisma' })
  }
})

module.exports = router
