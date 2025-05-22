# test_mimetique.py
from diagnostic_mimetique import ecouter_environnement
from souffle_autonome import generer_souffle
from prisma_bridge.crewai_adapter import CrewAIAdapter
from crewai import Crew  # simulation de CrewAI réel

print("\n🔍 Étape 1 : Écoute mimétique du système...")
intent_diagnostic = ecouter_environnement({"contexte": "simulé"})
print(f"🧠 Intent généré : {intent_diagnostic}\n")

print("\n🌱 Étape 2 : Génération autonome d'un souffle depuis la mémoire...")
intent_souffle = generer_souffle()
print(f"🌀 Intent auto-produit : {intent_souffle}\n")

print("\n🤝 Étape 3 : Délégation opérative à un agent CREWAI...")
dummy_crew = Crew()  # placeholder
adapter = CrewAIAdapter(crew=dummy_crew)
result = adapter.dispatch_intent(intent_diagnostic)
print(f"🎯 Résultat exécutif : {result}\n")

print("\n🗺️ Étape 4 : Accès visuel au souffle_map.html prêt à consulter.")
print("Ouvre le fichier 'souffle_map.html' dans ton navigateur pour voir la carte des souffles enregistrés.")