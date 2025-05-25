# 🧠 Prisma Railway – Dev Notes

## 📁 Structure de projet
```
prisma-railway4/
├── scripts/                  # Scripts de test manuels
│   └── tester_souffle_crew.py
├── cron/                     # Automatisation quotidienne
│   └── daily_trigger.py
├── visualisation/            # Visualisation des souffles
│   └── souffle_map.html
├── prisma_bridge/            # Modules fonctionnels de Prisma
├── memoire/                  # Données mimétiques (souvenirs)
│   └── prisma_memory.json
```

## ▶️ Utilisation

### Tester un souffle manuellement
```bash
python scripts/tester_souffle_crew.py "Δ|FAIRE::EMAIL(Bonjour)"
```

### Visualiser les souffles
Ouvrir dans le navigateur :
```
visualisation/souffle_map.html
```
(Pense à déposer `memoire/prisma_memory.json` à la racine projet)

### Tâche CRON journalière
```
python cron/daily_trigger.py
```
Utilise `schedule` pour lancer coach et souffle auto à 08:00 chaque jour.

## ✅ Dépendances
```
pip install schedule
```
