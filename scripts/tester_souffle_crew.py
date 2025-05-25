import json
from prisma_bridge.apide_interpreter import parse_souffle
from prisma_bridge.crewAI_adapter import intention_de_repartition

def tester_souffle(souffle_str: str):
    print("\n[SOUFFLE REÇU]\n", souffle_str)
    intent = parse_souffle(souffle_str)
    print("\n[INTENTION PARSÉE]\n", intent)
    result = intention_de_repartition(intent)
    print("\n[RÉSULTAT DE L'AGENT]\n", result)
    return result

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python tester_souffle_crew.py \"Δ|FAIRE::EMAIL(Bonjour)\"")
        exit(1)
    souffle = sys.argv[1]
    tester_souffle(souffle)
