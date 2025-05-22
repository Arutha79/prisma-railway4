from crewai import Crew, Task  # À adapter selon API CREWAI réelle
from .types import ApideIntent

class CrewAIAdapter:
    def __init__(self, crew: Crew):
        self.crew = crew

    def dispatch_intent(self, intent: ApideIntent) -> str:
        task_description = f"{intent.action} {intent.target or ''} -> {intent.effect}"
        task = Task(description=task_description.strip())
        result = self.crew.execute(task)
        return result