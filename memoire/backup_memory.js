// backup_memory.js corrigé
const fs = require('fs');
const path = './memoire/prisma_memory.json';
const backupDir = './memoire/backups/';
const now = new Date();
const timestamp = now.toISOString().slice(0, 10).replace(/-/g, '');
const backupFile = `${backupDir}prisma_memory_backup_${timestamp}.json`;

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

try {
  fs.copyFileSync(path, backupFile);
  console.log('✅ Sauvegarde réussie :', backupFile);
} catch (err) {
  console.error('❌ Erreur lors de la sauvegarde mémoire :', err.message);
}
