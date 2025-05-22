import json
from datetime import datetime
from pathlib import Path

MEMORY_FILE = Path("prisma_memory.json")

def charger_memoires():
    if not MEMORY_FILE.exists():
        print("❌ Aucun fichier de mémoire trouvé.")
        return []
    with open(MEMORY_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def resume_symbolique(memoires):
    print("\n🧾 Résumé symbolique des souffles de Prisma :\n")
    for m in memoires:
        souffle = m.get("souffle", "—")
        effet = m.get("intent", {}).get("effect", "…")
        ts = m.get("timestamp", "?")[:10]
        print(f"[{ts}] « J’ai soufflé {souffle}… il en est né {effet}. »")

if __name__ == "__main__":
    memoires = charger_memoires()
    resume_symbolique(memoires)