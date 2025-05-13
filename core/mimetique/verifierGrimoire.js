// verifierGrimoire.js
// Vérifie la cohérence entre le grimoire indexé et les fichiers présents

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function hashFile(filepath) {
  const file = fs.readFileSync(filepath);
  return crypto.createHash("sha256").update(file).digest("hex");
}

function verifierGrimoire(fichier, hashAttendu) {
  const filePath = path.resolve(__dirname, `../mémoire/${fichier}`);
  const archivePath = path.resolve(__dirname, `../grimoire/archives/${fichier}`);

  const pathsToTry = [filePath, archivePath];
  for (const file of pathsToTry) {
    if (fs.existsSync(file)) {
      try {
        const contenu = fs.readFileSync(file, "utf-8");
        const grimoire = JSON.parse(contenu);

        const hashCalculé = hashFile(file);
        const estValide = hashCalculé === hashAttendu;
        const aStructure = Array.isArray(grimoire.structure);

        return {
          trouvé: true,
          hash: hashCalculé,
          hashValide: estValide,
          structureValide: aStructure,
          chemin: file
        };
      } catch (err) {
        return { trouvé: true, erreur: `Erreur de lecture ou parsing : ${err.message}` };
      }
    }
  }

  return { trouvé: false };
}

function run() {
  const indexPath = path.resolve(__dirname, "../grimoire/grimoireIndex.json");

  if (!fs.existsSync(indexPath)) {
    console.error("❌ grimoireIndex.json introuvable.");
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(indexPath, "utf-8")).grimoire_index;
  const resultats = [];

  const tous = [index.actif, ...(index.archives || [])];
  console.log(`🔍 Vérification de ${tous.length} fichiers de grimoire...`);

  tous.forEach(entry => {
    const resultat = verifierGrimoire(entry.fichier, entry.hash_fichier);
    resultats.push({ version: entry.version, ...resultat });
  });

  for (const r of resultats) {
    console.log(`\n📘 Grimoire v${r.version}`);
    if (!r.trouvé) {
      console.warn("   ❌ Fichier introuvable.");
    } else if (r.erreur) {
      console.error(`   ❌ ${r.erreur}`);
    } else {
      console.log(`   📍 Chemin     : ${r.chemin}`);
      console.log(`   🔑 Hash       : ${r.hash}`);
      console.log(`   ✅ Hash ok     : ${r.hashValide ? "✔️" : "❌"}`);
      console.log(`   ✅ Structure   : ${r.structureValide ? "✔️" : "❌"}`);
    }
  }
}

if (require.main === module) {
  run();
}
