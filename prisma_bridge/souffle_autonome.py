from prisma_bridge.souvenir_loader import charger_memoires
from prisma_bridge.apide_interpreter import parse_apide_souffle

def generer_souffle():
    souvenirs = charger_memoires()
    if souvenirs:
        dernier = souvenirs[-1]
        souffle = "Δ|PROLONGER::TRACE ⊞NOUVEAU_SOUFFLE"
        intent = parse_apide_souffle(souffle)
        print(f"Souffle généré à partir de : {dernier['souffle']}")
        return intent
    return None