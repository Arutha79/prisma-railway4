
import json
from datetime import datetime
from pathlib import Path

memory_path = Path("memoire/prisma_memory.json")

def ajouter_souffle(souffle, contenu, titre="Souffle manuel", effet="À définir"):
    if not memory_path.exists():
        print("❌ Mémoire introuvable.")
        return

    with open(memory_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    nouveau = {
        "date": datetime.utcnow().isoformat(),
        "titre": titre,
        "contenu": contenu,
        "souffle": souffle,
        "type": "souvenir",
        "result": effet
    }
    data["souvenirs"].append(nouveau)

    with open(memory_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("✅ Souffle ajouté.")

if __name__ == "__main__":
    ajouter_souffle("Δ|POSER::INTENTION ÷JOUR=ACTIF ⊞AXE_DE_COHÉRENCE",
                    "Intention posée pour la journée.",
                    "Souffle de l'aube")
