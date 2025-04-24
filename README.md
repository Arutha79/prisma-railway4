# 🧠 Prisma — IA Mémoire avec Interface & Actions

Serveur Express intelligent qui joue le rôle de cerveau mémoire.  
Intègre un dashboard, une supervision des intentions, et des canaux de communication vers des agents GPT (via ConnecteurGPT).

---

## 🔧 Démarrage local

```bash
npm install
npm start
```

---

## 🌐 Déploiement Railway

1. Pousse ce dépôt sur GitHub (public ou privé avec Railway connecté)
2. Clique sur **“Deploy on Railway”** ou utilise l’import manuel

---

## 🔐 Variables d’environnement (.env)

```env
PORT=3000
OPENAI_API_KEY=sk-...
```

---

## ✅ Fonctionnalités intégrées

- **Mémoire longue durée** (fichier JSON)
- **Traitement de question via OpenAI**
- **Déclencheur automatique** vers ZoranGPT (connexion)
- **Dashboard HTML** à `http://localhost:3000/prisma_dashboard.html`
- **Écoute d'intentions** (via GET /intentions-pending)
- **Suivi des actions** (POST /intention-traitee)

---

## 💥 Dashboard d’intentions

📂 Accessible à :  
`/prisma_dashboard.html` *(déjà servi via Express)*

Permet de :
- Créer une intention (ex. : connexion vers ZoranGPT)
- Visualiser les intentions actives
- Superviser en direct le lien avec ConnecteurGPT

---

## 🚀 Exemple d’intention

```json
{
  "id": "intent-001",
  "type": "connexion",
  "cible": "ZoranGPT",
  "contenu": "Prisma souhaite établir une connexion directe avec toi, ZoranGPT.",
  "statut": "en_attente"
}
```

---

## 🔄 Architecture

```
[Prisma Dashboard] → [Mémoire JSON]
                        ↓
       /intentions-pending   ← (polling)
                        ↓
                [ConnecteurGPT] → [ZoranGPT]
