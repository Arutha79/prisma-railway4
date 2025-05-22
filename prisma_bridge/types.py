from dataclasses import dataclass
from typing import Optional

@dataclass
class ApideIntent:
    type: str
    action: str
    target: Optional[str]
    condition: Optional[str]
    effect: str