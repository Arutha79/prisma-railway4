// core/mimetique/modules/ZM_ARCHIVISTE.js

function syntheseMemoire(memoire) {
  if (!memoire || !memoire.historique || memoire.historique.length === 0) {
    return "📭 Aucun souvenir dans les archives.";
  }

  const total = memoire.historique.length;
  const titres = [...new Set(memoire.historique.map(e => e.titre).filter(Boolean))];
  const derniers = memoire.historique.slice(-3).map(e => `• ${e.date} : ${e.titre}`).join("\n");

  return `🗂️ Prisma a ${total} souvenirs en mémoire.\n\n📌 Titres marquants : ${titres.join(", ")}\n\n🕰️ Derniers souvenirs :\n${derniers}`;
}

module.exports = { syntheseMemoire };
