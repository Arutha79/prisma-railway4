import re
from .types import ApideIntent

def parse_apide_souffle(command: str) -> ApideIntent | None:
    match = re.match(r"^\u0394\|(\w+)::(\w+)(?:\s*\u00F7(.+?))?\s*\u229E(.+)$", command)
    if match:
        return ApideIntent(
            type="instruction_glyphique",
            action=match.group(1),
            target=match.group(2),
            condition=match.group(3),
            effect=match.group(4)
        )
    short_match = re.match(r"^\u229E(.+)$", command)
    if short_match:
        return ApideIntent(
            type="activation_simple",
            action="⊞",
            target=None,
            condition=None,
            effect=short_match.group(1)
        )
    return None