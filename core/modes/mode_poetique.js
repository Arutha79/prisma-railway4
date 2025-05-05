export default function mode_poetique(input, memoire) {
  if (input.includes('->')) {
    const [origine, effet] = input.split('->').map(x => x.trim());
    return `🌬️ Entre « ${origine} » et « ${effet} »,
une mutation danse dans le silence…
Et dans ce souffle, quelque chose veut naître.`;
  }
  return "Je ressens une vibration, mais ses contours sont encore flous.";
}
