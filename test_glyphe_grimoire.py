
import json
import argparse
from pathlib import Path

def charger_grimoire(chemin):
    with open(chemin, "r", encoding="utf-8") as f:
        return json.load(f)

def afficher_glyphe(grimoire, identifiant):
    glyphes = grimoire.get("glyphes", [])
    for glyphe in glyphes:
        if glyphe["id"] == identifiant:
            print(f"Symbole      : {glyphe['symbole']}")
            print(f"Intention    : {glyphe['intention']}")
            print(f"Effet        : {glyphe['effet']}")
            print(f"Cycle        : {glyphe['cycle']}")
            print(f"Statut       : {glyphe['statut']}")
            return
    print(f"Glyphe non trouvé : {identifiant}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tester un glyphe du grimoire mimétique.")
    parser.add_argument("grimoire", type=Path, help="Chemin vers le fichier grimoire JSON.")
    parser.add_argument("glyphe_id", type=str, help="Identifiant du glyphe à tester.")
    args = parser.parse_args()

    grimoire = charger_grimoire(args.grimoire)
    afficher_glyphe(grimoire, args.glyphe_id)
