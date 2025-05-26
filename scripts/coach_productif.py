# coach_productif.py
import json
import random
import time
from datetime import datetime
from pathlib import Path

# Chargement des souffles
souffles_file = Path("souffles_productivite.json")
if not souffles_file.exists():
    raise FileNotFoundError("souffles_productivite.json manquant.")

with open(souffles_file, "r", encoding="utf-8") as f:
    souffles = json.load(f)

# Fonction principale

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

    # Simuler une activation (à remplacer par appel à Prisma ou CREWAI)
    print("\n✅ Action : Souffle prêt à être transmis à Prisma ou Alice.")

# Lance le coach
if __name__ == "__main__":
    coacher()
