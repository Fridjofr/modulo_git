// World-space furniture, interaction anchors and animation phases share one source.
// Navigation ends on the floor. Transfer onto a mattress is a local articulated
// pose, never a walking route through the bed collider.
export const CLINIC = Object.freeze({
  bed: { x: 306, y: 150, w: 108, h: 174 },
  blanket: { x: 320, y: 214, w: 80, h: 86 },
  chair: { x: 184, y: 243, w: 52, h: 70 },
  seat: { x: 212, y: 283 },
  playerApproach: [438, 263],
  playerRest: [360, 240],
  liraApproach: [260, 303],
  liraRest: [230, 303],
  bedCollision: [306, 150, 108, 174],
  chairCollision: [184, 243, 52, 58],
});
export const smooth = (t) => {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
};
export const mix = (a, b, t) => a + (b - a) * t;
export function bedPhase(q) {
  q = Math.max(0, Math.min(1, q));
  return {
    q,
    sit: smooth(q / 0.3),
    recline: smooth((q - 0.3) / 0.7),
    phase: q < 0.3 ? "sentar-na-lateral" : q < 1 ? "reclinar" : "deitado",
  };
}
export function chairPhase(q) {
  q = Math.max(0, Math.min(1, q));
  return { q, back: smooth(q / 0.32), bend: smooth((q - 0.2) / 0.8) };
}
