# souvenir_loader.py

import json
from datetime import datetime
from pathlib import Path

MEMORY_FILE = Path("prisma_memory.json")

def charger_memoires():
    if not MEMORY_FILE.exists():
        print("❌ Aucun fichier de mémoire trouvé.")
        return []
    with open(MEMORY_FILE, "r", encoding="utf-8") as f:
        contenu = json.load(f)
        # Si le fichier contient un objet avec 'historique'
        if isinstance(contenu, dict) and "historique" in contenu:
            return contenu["historique"]
        elif isinstance(contenu, list):
            return contenu
        else:
            print("❌ Format de mémoire inconnu.")
            return []

def lister_souffles(memoires):
    for i, entree in enumerate(memoires):
        ts = entree.get("timestamp", entree.get("date", "?"))
        souffle = entree.get("souffle", "—")
        print(f"[{i}] 🗓 {ts} | 🌬️ {souffle}")

def filtrer_par_action(memoires, action):
    resultats = [e for e in memoires if e.get("intent", {}).get("action") == action]
    for e in resultats:
        print(f"🌬️ {e.get('souffle', '—')}  →  🛠️ {e.get('result', '')}")

def filtrer_par_cible(memoires, cible):
    resultats = [e for e in memoires if e.get("intent", {}).get("target") == cible]
    for e in resultats:
        print(f"🎯 {e.get('souffle', '—')}  →  🛠️ {e.get('result', '')}")

def rejouer_souffle(memoires, index):
    try:
        souffle = memoires[index].get("souffle", None)
        if souffle:
            print(f"🔁 Souffle à rejouer : {souffle}")
            return souffle
        else:
            print("❌ Aucun souffle trouvé à cet index.")
            return None
    except IndexError:
        print("❌ Index invalide.")
        return None

# Exemple d’usage
if __name__ == "__main__":
    memoires = charger_memoires()
    print("\n📚 Souvenirs de Prisma :")
    lister_souffles(memoires)

    print("\n🔎 Filtres disponibles :")
    print("- filtrer_par_action(memoires, '⊞')")
    print("- filtrer_par_cible(memoires, 'SYSTÈME')")
    print("- rejouer_souffle(memoires, 0)")
