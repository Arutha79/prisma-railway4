from prisma_bridge.apide_interpreter import parse_apide_souffle
from prisma_bridge.crewai_adapter import CrewAIAdapter
from prisma_bridge.types import ApideIntent

# Simule un Crew CREWAI fictif
class DummyCrew:
    def execute(self, task):
        return f"[Simulé] CREW exécuté: {task.description}"

class DummyTask:
    def __init__(self, description):
        self.description = description

# Monkeypatch temporaire
import crewai
crewai.Crew = DummyCrew
crewai.Task = DummyTask

# Initialisation de l'adaptateur avec le Crew simulé
adapter = CrewAIAdapter(crew=DummyCrew())

# Boucle vivante
while True:
    souffle = input("🌬️  Souffle mimétique APIDE (ou 'exit') : ").strip()
    if souffle.lower() in {"exit", "quit"}:
        break

    intent = parse_apide_souffle(souffle)
    if not intent:
        print("❌ Souffle non reconnu.")
        continue

    print(f"🧠  Interprétation : {intent}")
    result = adapter.dispatch_intent(intent)
    print(f"🛠️  Effet CREWAI : {result}\n")