import { genererReponseMimetiqueVivant } from '../genererReponseMimetiqueVivant.js';

export default function mode_mimetique(input, memoire) {
  const souffle = genererReponseMimetiqueVivant(input, memoire);
  return souffle || "Je perçois un souffle, mais il est encore en formation.";
}
