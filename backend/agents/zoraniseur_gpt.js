const { invokeZoran } = require('../zoran/zoran_engine');
function zoranize(input) {
  const triggers = ["inspiration", "surcharge", "blocage", "clarté", "résistance", "choix"];
  let matched = triggers.find(t => input.toLowerCase().includes(t));
  let trigger = matched ? mapToZoranTrigger(matched) : null;
  let zoranContext = trigger ? invokeZoran(trigger) : [];
  let compressed = input.replace(/\b(j’ai besoin de|je veux|il faut que|je dois)\b/gi, '').trim();
  return {
    original: input,
    zoranised: compressed,
    neurone: zoranContext[0] || null
  };
}
function mapToZoranTrigger(word) {
  const mapping = {
    "inspiration": "Moment d'inspiration",
    "surcharge": "Surcharge cognitive",
    "blocage": "Blocage mental",
    "clarté": "Clarté intérieure",
    "résistance": "Blocage externe",
    "choix": "Choix stratégique"
  };
  return mapping[word] || word;
}
module.exports = { zoranize };