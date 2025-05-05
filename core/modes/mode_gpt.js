import { generateGPTResponse } from '../generateGPTResponse.js';

export default async function mode_gpt(input) {
  return await generateGPTResponse(input);
}
