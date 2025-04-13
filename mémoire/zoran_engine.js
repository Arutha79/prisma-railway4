const memory = require('./zoran_memory.json');
function invokeZoran(trigger) {
  return memory.filter(n => n.déclencheurs.includes(trigger)).map(n => ({
    id: n.neurone_id,
    intention: n.intention,
    mouvement: n.mouvement,
    effet: n.effet
  }));
}
module.exports = { invokeZoran };