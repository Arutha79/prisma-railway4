# cron/daily_trigger.py
import sys
import traceback
from datetime import datetime

# -- Chargement du coach productif --
from scripts.coach_productif_final import choisir_souffle_du_jour
from prisma_bridge.launcher_memoriel import log_souffle

# -- Paramètres --
ACTIVER_LOG = True
LOG_PATH = "cron/trigger_log.txt"


def log(message: str):
    if ACTIVER_LOG:
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(f"[{datetime.utcnow().isoformat()}] {message}\n")


def lancer_souffle_quotidien():
    try:
        souffle = choisir_souffle_du_jour()
        log(f"Souffle choisi : {souffle['nom']}")

        # Construction du bloc mimétique
        souvenir = {
            "date": datetime.utcnow().isoformat(),
            "titre": f"Souffle productif quotidien : {souffle['nom']}",
            "contenu": souffle["description"],
            "souffle": souffle["souffle"],
            "resultat": "Injecté via coach productif",
            "type": "souvenir",
            "tags": ["#souffle_productif", "#rituel", "#quotidien"]
        }

        log_souffle(souvenir)
        log("Souffle loggé avec succès.")

        # Optionnel : appel Prisma ou Alice ici
        # transmettre_souffle(souffle)

    except Exception as e:
        erreur = f"Erreur lors du déclenchement : {e}\n{traceback.format_exc()}"
        log(erreur)
        print(erreur, file=sys.stderr)


if __name__ == "__main__":
    lancer_souffle_quotidien()
