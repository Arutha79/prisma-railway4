// 📦 Fichier : check_and_send_token.js
// 📅 Généré le 2025-04-24 11:20:03
// 🎯 Mission : Vérifier que GITHUB_TOKEN est présent et préparer l'appel sécurisé à ConnecteurGPT

const fs = require('fs');
const path = require('path');

// Charge le token depuis le fichier .env
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_LIST = ['gptcloner', 'devgpt', 'imagegpt', 'maitrebatisseur']; // à adapter si besoin

function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync('log_connexions.txt', `[${timestamp}] ${message}\n`);
}

function checkAndSendToken() {
  if (!GITHUB_TOKEN) {
    const err = '❌ GITHUB_TOKEN manquant dans .env. Action annulée.';
    log(err);
    console.error(err);
    return;
  }

  const payload = {
    task: 'add_collaborators',
    token: GITHUB_TOKEN,
    repoList: REPO_LIST
  };

  log('✅ Token détecté. Préparation de l'appel à ConnecteurGPT avec payload sécurisé.');
  console.log('Payload prêt à envoyer à ConnecteurGPT:', payload);

  // Ici tu pourrais faire un appel HTTP ou lancer un script avec le payload
}

checkAndSendToken();
