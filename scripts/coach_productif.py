# coach_productif.py
import json
import random
from datetime import datetime
from pathlib import Path

from prisma_bridge.launcher_memoriel import log_souffle  # suppose que ce module est accessible

# Chargement des souffles
souffles_file = Path("ressources/souffles_productivite.json")
if not souffles_file.exists():
    raise FileNotFoundError("souffles_productivite.json manquant dans 'ressources/'.")

with open(souffles_file, "r", encoding="utf-8") as f:
    souffles = json.load(f)

def choisir_souffle_du_jour():
    today_index = datetime.utcnow().toordinal() % len(souffles)
    return souffles[today_index]

def coacher():
    souffle = choisir_souffle_du_jour()
    print("\n🌤️ Coach Productif — Souffle du jour :")
    print(f"\n📛 {souffle['nom']}")
    print(f"🧠 Description : {souffle['description']}")
    print(f"🌀 Souffle : {souffle['souffle']}")
    print(f"🔁 Déclencheur prévu : {souffle['déclencheur']}")
    print(f"🔧 Module cible : {souffle['module']}")

    # Log dans la mémoire de Prisma
    log_souffle({
        "souffle": souffle["souffle"],
        "titre": f"Souffle productif : {souffle['nom']}",
        "contenu": souffle["description"],
        "result": "Proposé à Prisma par le coach productif."
    })

    print("\n✅ Action : Souffle transmis à la mémoire de Prisma.")

if __name__ == "__main__":
    coacher()
