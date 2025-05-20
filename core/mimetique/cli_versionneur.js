// cli_versionneur.js corrigé
// Script mimétique - versionneur symbolique pour grimoire

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hashFile(filepath) {
  const file = fs.readFileSync(filepath);
  return crypto.createHash('sha256').update(file).digest('hex');
}

function archiveGrimoire(version) {
  const filename = `grimoire_apide_v${version}.json`;
  const grimoirePath = path.resolve(__dirname, `../memoire/${filename}`);
  const archivePath = path.resolve(__dirname, `../grimoire/archives/v${version}.json`);
  const indexPath = path.resolve(__dirname, `../grimoire/grimoireIndex.json`);

  if (!fs.existsSync(grimoirePath)) {
    console.error("❌ Fichier grimoire introuvable :", grimoirePath);
    return;
  }

  const hash = hashFile(grimoirePath);
  const archive = fs.readFileSync(grimoirePath);
  fs.writeFileSync(archivePath, archive);

  let index;
  try {
    index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  } catch (err) {
    console.error("❌ Erreur de lecture index :", err.message);
    return;
  }

  if (index.grimoire_index?.actif?.version === version) {
    index.grimoire_index.actif.hash_fichier = hash;
  }

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`✅ Archive créée pour v${version} avec hash : ${hash}`);
}

module.exports = { archiveGrimoire };
