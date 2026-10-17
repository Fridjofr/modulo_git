// World-space furniture, interaction anchors and animation phases share one source.
// Navigation ends on the floor. Transfer onto a mattress is a local articulated
// pose, never a walking route through the bed collider.
export const CLINIC = Object.freeze({
  // Uniform 768/1444 scale: a bed remains about two human sprite heights.
  size: [768, 579],
  bed: { x: 133, y: 128, w: 106, h: 180 },
  mattress: { x: 144, y: 146, w: 84, h: 119 },
  chair: { x: 78, y: 219, w: 34, h: 49 },
  seat: { x: 94, y: 240 },
  playerApproach: [266, 225],
  playerRest: [186, 224],
  sideHip: [230, 208],
  // Sole contact of the unmodified approved seated frame, at scale .11.
  liraApproach: [112.38188524590164, 259.36],
  liraRest: [112.38188524590164, 259.36],
  bedCollision: [133, 128, 106, 180],
  chairCollision: [78, 219, 23, 49],
  monitorCollision: [59, 128, 63, 72],
  workstationCollision: [516, 130, 208, 87],
  entry: [384, 440],
  liraEntry: [384, 400],
  door: { id: "clinic-corridor", x: 338, y: 474, w: 91, h: 61, upper: false },
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
