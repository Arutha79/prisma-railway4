# moteur_memoire_prisma.py

import os
import json
from datetime import datetime

MEMOIRE_PATH = os.path.join("mémoire", "prisma_memory.json")
LOG_PATH = os.path.join("mémoire", "log_souvenirs.txt")

def charger_memoire():
    if not os.path.exists(MEMOIRE_PATH):
        return {"historique": []}
    try:
        with open(MEMOIRE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data.get("historique", []), list):
            print("⚠️ Prisma : 'historique' mal formé. Réinitialisation forcée.")
            data["historique"] = []
        return data
    except Exception as e:
        print(f"❌ Erreur lecture mémoire : {e}")
        return {"historique": []}

def sauvegarder_memoire(data):
    try:
        with open(MEMOIRE_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"❌ Erreur sauvegarde mémoire : {e}")

def nettoyer_reponse(contenu):
    import re
    return re.sub(r'🧠 Souvenir du .*?: ".*?"', '', contenu).strip()

def est_deja_present(contenu, historique):
    return any(s.get("contenu") == contenu for s in historique)

def ajouter_souvenir(souvenir):
    os.makedirs(os.path.dirname(MEMOIRE_PATH), exist_ok=True)
    memoire = charger_memoire()
    historique = memoire.get("historique", [])

    contenu_nettoye = nettoyer_reponse(souvenir.get("contenu", ""))
    if not contenu_nettoye or len(contenu_nettoye) < 10:
        return

    if est_deja_present(contenu_nettoye, historique):
        print("⚠️ Souvenir déjà présent, rien ajouté.")
        return

    bloc = {
        "date": souvenir.get("date", datetime.utcnow().isoformat() + "Z"),
        "titre": souvenir.get("titre", "Souvenir"),
        "contenu": contenu_nettoye,
        "type": souvenir.get("type", "souvenir"),
        "origine": souvenir.get("origine"),
        "structure": souvenir.get("structure"),
        "tags": souvenir.get("tags")
    }

    historique.append(bloc)
    memoire["historique"] = historique
    sauvegarder_memoire(memoire)

    with open(LOG_PATH, "a", encoding="utf-8") as log_file:
        log_file.write(f"🧠 {bloc['date']} — {bloc['titre']}\n{bloc['contenu']}\n\n")

    print("✅ Souvenir ajouté :", bloc["titre"])

def appliquer_regle_memoire_active(question):
    data = charger_memoire()
    regle = data.get("prisma_memory", {}).get("règle_mémoire_active", None)
    if regle and "premier souffle" in question.lower():
        print(f"🎯 Règle mémoire active détectée : {regle.get('nom')}")
        print(f"📌 Réponse appliquée : {regle.get('action')}")
        return regle.get("action")
    return None
