import time
from prisma_bridge.apide_interpreter import parse_apide_souffle
from prisma_bridge.launcher_memoriel import log_souffle

def analyser_contexte(context):
    return "Présence perçue — tension légère."

def ecouter_environnement(context):
    souffle_texte = "Δ|ECOUTER::SYSTEME ÷LIEN=ACTIF ⊞DIAGNOSTIC_SENSIBLE"
    interpretation = analyser_contexte(context)
    intent = parse_apide_souffle(souffle_texte)
    log_souffle({
        "souffle": souffle_texte,
        "intent": intent.__dict__,
        "interpretation": interpretation,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S")
    })
    return intent