from prisma_bridge.apide_interpreter import parse_apide_souffle

example_souffles = [
    "Δ|RÉVEILLER::AGENT ÷DORMANT ⊞ACTIVER",
    "⊞LANCER_ANALYSE"
]

for souffle in example_souffles:
    intent = parse_apide_souffle(souffle)
    print(f"Souffle: {souffle}\nIntent: {intent}\n")