import mode_mimetique from './mode_mimetique.js';
import mode_poetique from './mode_poetique.js';
import mode_gpt from './mode_gpt.js';

export async function choisirMoteurParLangage(input, mode = 'gpt', memoire = {}) {
  switch (mode) {
    case 'mimetique':
      return mode_mimetique(input, memoire);
    case 'poetique':
      return mode_poetique(input, memoire);
    case 'gpt':
    default:
      return mode_gpt(input);
  }
}
