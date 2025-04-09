const { invokeZoran } = require('../zoran/zoran_engine');

function analyser(input) {
  const triggers = ["blocage", "confusion", "évidence", "logique", "doute", "répétition"];
  const matched = triggers.find(t => input.toLowerCase().includes(t));
  const trigger = matched ? mapToZoranTrigger(matched) : null;
  const zoranInsight = trigger ? invokeZoran(trigger) : [];
  const angles = ["Et si c'était l'inverse ?", "Quelle hypothèse tu n’as jamais remise en question ?", "Et si tu supprimais 80% du problème ?"];
  const alerte = input.includes("toujours") || input.includes("jamais") ? "Présence d'absolu → Risque d’illusion logique." : null;
  return {
    original: input,
    angles_possibles: angles,
    alerte_incohérence: alerte,
    zoran: zoranInsight[0] || null
  };
}

function mapToZoranTrigger(mot) {
  const mapping = {
    "blocage": "Blocage mental",
    "confusion": "Signal flou",
    "évidence": "Clarté spontanée",
    "logique": "Choix stratégique",
    "doute": "Moment de doute",
    "répétition": "Surcharge cognitive"
  };
  return mapping[mot] || mot;
}

module.exports = { analyser };