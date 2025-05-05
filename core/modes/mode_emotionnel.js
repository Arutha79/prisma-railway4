import { interpreteurEmotionnel } from '../interpreteur_emo.js';
import { generateGPTResponse } from '../generateGPTResponse.js';

export default async function mode_emotionnel(input, memoire = {}) {
  const etat = interpreteurEmotionnel(input);

  if (etat) {
    return etat; // Voix émotionnelle directe
  }

  // Si aucune structure émotionnelle détectée, fallback vers GPT classique
  const fallback = await generateGPTResponse(input);
  return fallback;
}
