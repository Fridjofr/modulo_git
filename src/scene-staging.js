const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
};
export function stageUpdate(state, fx, now) {
  if (!fx) return;
  const p = Math.max(0, Math.min(1, (now - fx.start) / fx.duration)),
    l = state.story.lira;
  if (fx.kind === "bed-rise" || fx.kind === "bed-lie") {
    const q = fx.kind === "bed-rise" ? ease(p) : 1 - ease(p);
    state.x = lerp(360, 435, q);
    state.y = lerp(252, 330, q);
    state.story.resting = q < 0.58;
    state.dir = "down";
    state.moving = false;
    return;
  }
  if (fx.kind === "exhibition") {
    state.story.demo = p;
    return;
  }
  if (fx.kind !== "rampage") return;
  const path = [
    [0, fx.x ?? 640, fx.y ?? 500, 868, 369],
    [0.1, fx.x ?? 640, fx.y ?? 500, 868, 369],
    [0.24, 640, 316, 868, 369],
    [0.35, 720, 415, 868, 465],
    [0.51, 1045, 316, 868, 465],
    [0.62, 1045, 316, 868, 465],
    [0.7, 1000, 380, 910, 310],
    [0.76, 945, 430, 1130, 365],
    [0.82, 885, 427, 900, 350],
    [0.88, 820, 425, 740, 360],
    [1, 902, 430, 802, 425],
  ];
  const i = Math.max(
      0,
      Math.min(
        path.length - 2,
        path.findIndex(
          (q, j) => j < path.length - 1 && p >= q[0] && p <= path[j + 1][0],
        ),
      ),
    ),
    a = path[i],
    b = path[i + 1],
    t = ease((p - a[0]) / (b[0] - a[0]));
  state.x = lerp(a[1], b[1], t);
  state.y = lerp(a[2], b[2], t);
  l.x = lerp(a[3], b[3], t);
  l.y = lerp(a[4], b[4], t);
  state.dir = p > 0.76 ? "left" : p < 0.3 ? "up" : "right";
  state.moving = i !== 0 && i !== 4;
  state.frame = Math.floor(p * 48) % 4;
  l.dir = state.x > l.x ? "right" : "left";
  l.moving = i > 4;
  l.frame = Math.floor(p * 34) % 4;
  state.story.rampagePose =
    p < 0.1 ? 1 : p < 0.24 ? 2 : p < 0.35 ? 3 : p < 0.51 ? 2 : p < 0.62 ? 3 : 2;
  state.story.rampageLean =
    p > 0.21 && p < 0.28
      ? Math.sin(((p - 0.21) / 0.07) * Math.PI) * -0.09
      : p > 0.48 && p < 0.56
        ? Math.sin(((p - 0.48) / 0.08) * Math.PI) * 0.09
        : 0;
  if (p > 0.235) state.story.flags.labSecondDamage = true;
  if (p > 0.51) state.story.flags.labDamaged = true;
}
// Damage is an authored broken workstation and glass decal in TileWorld, sharing the intact footprint.
export function drawLabDamage() {}
