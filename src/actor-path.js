import { CHARACTER_SCALE } from './official-characters.js';
import { mapStand } from "./maps.js";
export const ACTOR_SEPARATION = CHARACTER_SCALE.separation;
export function actorCanStand(world, x, y, actor, others, radius = CHARACTER_SCALE.radius) {
  return (
    mapStand(world, x, y, radius) &&
    others.every(
      (o) =>
        o === actor ||
        o.visible === false ||
        o.world !== world ||
        Math.hypot(x - o.x, y - o.y) >= ACTOR_SEPARATION,
    )
  );
}
// Validate the whole swept path, including the off-grid endpoints. Testing only
// grid nodes lets a narrow corner or another actor fall between two samples.
export function clearSegment(clear, a, b) {
  if (a[0] !== b[0] && a[1] !== b[1]) return false;
  const count = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3);
  for (let i = 0; i <= count; i++) {
    const t = count ? i / count : 0;
    if (!clear(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
      return false;
  }
  return true;
}
function connector(clear, a, b) {
  for (const corner of [
    [b[0], a[1]],
    [a[0], b[1]],
  ])
    if (clearSegment(clear, a, corner) && clearSegment(clear, corner, b))
      return [corner, b].filter((p, i, arr) =>
        (i ? arr[i - 1] : a).some((v, k) => v !== p[k]),
      );
  return null;
}
export function sceneRoute(world, start, goals, others = []) {
  const step = 16,
    result = [];
  let from = [start.x, start.y];
  const clear = (x, y) =>
    mapStand(world, x, y, 11) &&
    others.every(
      (o) =>
        o.visible === false ||
        o.world !== world ||
        Math.hypot(x - o.x, y - o.y) >= ACTOR_SEPARATION,
    );
  for (const goal of goals) {
    if (!clear(...goal))
      throw Error(`Destino de cena ocupado: ${world} ${goal}`);
    if (from[0] === goal[0] && from[1] === goal[1]) continue;
    if(clearSegment(clear,from,goal)){result.push(goal);from=goal;continue;}
    const direct = connector(clear, from, goal);
    if (direct) { result.push(...direct); from = goal; continue; }
    const queue = [],
      prev = new Map(),
      prefixes = new Map();
    for (const gx of [
      ...new Set([Math.floor(from[0] / step), Math.ceil(from[0] / step)]),
    ])
      for (const gy of [
        ...new Set([Math.floor(from[1] / step), Math.ceil(from[1] / step)]),
      ]) {
        const q = [gx, gy],
          prefix = connector(
            clear,
            from,
            q.map((v) => v * step),
          );
        if (prefix) {
          queue.push(q);
          prev.set(q.join(), null);
          prefixes.set(q.join(), prefix);
        }
      }
    let found, end;
    for (let i = 0; i < queue.length; i++) {
      const q = queue[i],
        point = q.map((v) => v * step);
      if (Math.hypot(point[0] - goal[0], point[1] - goal[1]) <= step * 1.5) {
        end = connector(clear, point, goal);
        if (end) {
          found = q;
          break;
        }
      }
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
      ]) {
        const n = [q[0] + dx, q[1] + dy],
          key = n.join();
        if (
          !prev.has(key) &&
          clearSegment(
            clear,
            point,
            n.map((v) => v * step),
          )
        ) {
          prev.set(key, q);
          queue.push(n);
        }
      }
    }
    if (!found) throw Error(`Sem passagem para a cena: ${world} ${goal}`);
    const path = [];
    let root;
    for (let q = found; q; q = prev.get(q.join())) {
      path.unshift(q.map((v) => v * step));
      root = q;
    }
    const points = [
      from,
      ...prefixes.get(root.join()),
      ...path.slice(1),
      ...end,
    ];
    const unique = points.filter(
      (p, i) => !i || p.some((v, k) => v !== points[i - 1][k]),
    );
    const simplified = unique.filter(
      (p, i) =>
        i > 0 &&
        (i === unique.length - 1 ||
          (unique[i - 1][0] === p[0]) !== (unique[i + 1][0] === p[0])),
    );
    result.push(...simplified);
    from = goal;
  }
  return result.length ? result : [...goals];
}
