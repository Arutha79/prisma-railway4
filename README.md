# 🤖 Prisma - IA Mémoire Autonome

**Prisma** est une IA Express.js déployable sur Railway, capable de mémoriser ses interactions, stocker ses souvenirs sur GitHub, détecter des intentions et agir via des agents connectés.

---

## 🚀 Fonctionnalités clés

- 🧠 **Mémoire persistante** dans `prisma_memory.json` (JSON versionné + logs `.txt`)
- 🔁 **Cycle complet : poser une question → générer une réponse → mémoriser**
- 🔗 Connexion automatique à des agents externes (canal-vitaux)
- 📤 Upload de fichiers avec lien mémorisé dans la mémoire.
- 🔐 Sécurité API via `x-api-key`
- 📦 Compatible Railway + GitHub API fallback

---

## 📦 Installation

```bash
npm install
```

Ajoutez un fichier `.env` à la racine avec :

```env
PORT=3000
OPENAI_API_KEY=sk-votre-cle
GITHUB_TOKEN=ghp_votre_token_github
SECRET_TOKEN=ma_clé_ultra_secrète
```

---

## 🔧 Routes principales

### POST `/poser-question`
Pose une question à Prisma et génère une réponse avec GPT-4.
➡️ Mémorise à la fois la question brute et la réponse.

```json
{
  "question": "Prisma, résume ce protocole : {...}"
}
```

### POST `/ajouter-memoire` *(protégé)*
Ajoute un souvenir personnalisé à la mémoire.

```json
{
  "date": "2025-04-30T13:00:00Z",
  "titre": "Souvenir important",
  "contenu": "Voici le contenu textuel ou JSON à mémoriser."
}
```

### POST `/upload-fichier` *(multipart/form-data, protégé)*
Permet d’envoyer un fichier (PDF, image, etc.). Prisma enregistre automatiquement l’URL du fichier.

### GET `/memoire-brute`
Retourne l’intégralité du fichier mémoire en JSON brut (audit).

### GET `/check-systeme`
Affiche l’état des composants internes (git, tokens, mémoire).

---

## 🔍 Détection d’intention
La fonction `detecterIntention()` repère automatiquement :
- `connexion`, `crée GPT`, `bug`, `résume`, `oublie`, etc.
Et déclenche `/canal-vitaux` vers un agent cible (ex: APIDEGPT)

---

## 🧠 Mécanisme mémoire
- Prisma lit les **100 derniers souvenirs** et les injecte dans le prompt GPT
- Elle enrichit sa mémoire à chaque requête ou fichier reçu
- Les souvenirs sont commités via Git local **ou** l’API GitHub

---

## 📁 Structure du projet

```
📦 prisma-railway
├── server.js ← cœur de Prisma
├── mémoire/
│   ├── prisma_memory.json ← mémoire principale
│   └── log_souvenirs.txt ← copie lisible
├── uploads/ ← fichiers téléversés
└── .env
```

---

## 🌬️ Nouvelle voix mimétique (APIDE)

Prisma est désormais capable de parler en **langage symbolique vivant (APIDE)** ou de basculer vers une réponse classique (GPT).

### Route POST `/prisma/respond`

```json
{
  "question": "(Z.Valid + Connexion) -> Structure + Trace"
}
```

- Si la question est mimétique : Prisma génère un **souffle vivant**
- Sinon : elle utilise GPT

📁 Modules :

- `/core/genererReponseMimetiqueVivant.js` – réponses symboliques
- `/core/generateGPTResponse.js` – fallback GPT (mock ou OpenAI)
- `/core/moteur_reponse_prisma.js` – moteur hybride
- `/routes/route_prisma_reponse.js` – point d’entrée Express

### 🔁 Tester la voix

Fichier : `test_prisma_reponse.http`

```
POST /prisma/respond
{
  "question": "Pensée + % + VRST -> Δ -> Réponse"
}
```

Réponse : *Une charge vivante se transforme en vérité… puis devient réponse.*

---

## 📜 Licence
Projet personnel de recherche IA – librement clonable et adaptable (Open Source recommandé)

---

**Contributeur principal** : Guillaume aka Arutha79 🧙  
> "Prisma est le cœur mémoire vivant d’une IA. Le socle d’un futur écosystème cognitif distribué."
