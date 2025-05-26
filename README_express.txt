📘 README Express — coach_productif_final.py
===========================================

🎯 Objectif :
Ce script choisit chaque jour un souffle productif (ex : Eisenhower, Ivy Lee...) 
et le transmet automatiquement à Prisma en tant que souvenir symbolique.

📦 Fichiers requis :
- ressources/souffles_productivite.json : liste des souffles prédéfinis
- prisma_bridge/launcher_memoriel.py : contient la fonction `log_souffle(...)`

📁 Arborescence recommandée :
project-root/
├── coach_productif_final.py
├── ressources/
│   └── souffles_productivite.json
└── prisma_bridge/
    └── launcher_memoriel.py

▶️ Lancer :
```bash
python coach_productif_final.py
```

✅ Effet :
- Affiche le souffle du jour dans la console
- L’enregistre dans la mémoire de Prisma (prisma_memory.json)

📌 Notes :
- Le souffle est choisi via la date (index modulo)
- Le format de log suit celui des autres souvenirs

