// glyph_parser.js

function analyser(input) {
  if (!input || typeof input !== 'string') return null;

  const souffleMatch = input.match(/🌬️\s*(.+)/);
  if (souffleMatch) return { type: 'souffle', valeur: souffleMatch[1] };

  const glypheMatch = input.match(/[⧉⚭∇⇠⚱️ϟ⊘→∴∵⇢⏁✿⬛]+/);
  if (glypheMatch) return { type: 'glyphe', valeur: glypheMatch[0] };

  const mutationMatch = input.match(/Δ\|(.*?)⊞(.*)/);
  if (mutationMatch) {
    return {
      type: 'mutation',
      action: mutationMatch[1].trim(),
      effet: mutationMatch[2].trim(),
      description: `${mutationMatch[1].trim()} → ${mutationMatch[2].trim()}`
    };
  }

  return null;
}

module.exports = { analyser };
