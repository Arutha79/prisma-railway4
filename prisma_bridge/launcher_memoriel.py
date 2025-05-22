import json
from datetime import datetime
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

# Initialisation de l'adaptateur
adapter = CrewAIAdapter(crew=DummyCrew())

MEMORY_FILE = "prisma_memory.json"

def enregistrer_trace(souffle, intent, result):
    try:
        with open(MEMORY_FILE, "r", encoding="utf-8") as f:
            memoire = json.load(f)
    except FileNotFoundError:
        memoire = []

    trace = {
        "souffle": souffle,
        "intent": intent.__dict__,
        "result": result,
        "timestamp": datetime.utcnow().isoformat()
    }
    memoire.append(trace)

    with open(MEMORY_FILE, "w", encoding="utf-8") as f:
        json.dump(memoire, f, ensure_ascii=False, indent=2)

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

    enregistrer_trace(souffle, intent, result)