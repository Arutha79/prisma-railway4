from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import requests

class ActionInteractWithAlice(Action):
    def name(self) -> Text:
        return "action_interact_with_alice"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        user_message = tracker.latest_message.get("text")
        if not user_message:
            dispatcher.utter_message(text="Je n'ai pas compris.")
            return []

        try:
            response = requests.post(
                "http://localhost:3000/api/interact",
                json={"prompt": user_message, "sender": tracker.sender_id},
                timeout=10,
            )
            data = response.json()
            reply = data.get("gpt_4") or data.get("gpt_3_5")
            dispatcher.utter_message(text=reply)
        except Exception as e:
            dispatcher.utter_message(text=f"Erreur lors de l'appel à Alice: {e}")

        return []
