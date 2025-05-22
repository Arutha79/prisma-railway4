from crewai import Crew, Task
from .types import ApideIntent

class CrewAIAdapter:
    def __init__(self, crew: Crew):
        self.crew = crew

    def dispatch_intent(self, intent: ApideIntent) -> str:
        agent = getattr(intent, "agent_target", "default")
        task_description = f"{intent.action} {intent.target or ''} -> {intent.effect}"
        task = Task(description=task_description.strip())
        if agent != "default":
            return self.appeler_agent_specifique(agent, task)
        return self.crew.execute(task)

    def appeler_agent_specifique(self, agent_name, task):
        print(f"Transfert à l'agent {agent_name} pour tâche : {task.description}")
        return f"[SIMULATION] Agent {agent_name} a reçu : {task.description}"