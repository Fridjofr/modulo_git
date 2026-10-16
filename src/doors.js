// Sliding leaves are sampled from the approved closed doorway itself. The frame
// stays in the wall. Animation is time-based and shared by manual and guided use.
export function doorway(map, exit) {
  if (map.indoor) {
    if (exit.y < 300) return { x: exit.x - 56, y: 86, w: 112, h: 72 };
    return map.art === "clinicApproved"
      ? { x: 568, y: 611, w: 144, h: 109 }
      : { x: 584, y: 622, w: 112, h: 66 };
  }
  if (exit.id === "plaza-entrance") return { x: 704, y: 20, w: 128, h: 130 };
  return null;
}
export function doorStep(current, target, dt) {
  return Math.max(
    0,
    Math.min(
      1,
      current +
        Math.sign(target - current) *
          Math.min(Math.abs(target - current), dt / 600),
    ),
  );
}
export function drawSlidingDoor(g, terrain, rect, progress) {
  if (progress <= 0) return;
  const { x, y, w, h } = rect,
    half = w / 2,
    shift = half * progress;
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  const depth = g.createLinearGradient(0, y, 0, y + h);
  depth.addColorStop(0, "#193b50");
  depth.addColorStop(0.5, "#3a6377");
  depth.addColorStop(1, "#79929d");
  g.fillStyle = depth;
  g.fillRect(x, y, w, h);
  g.strokeStyle = "#acc3c344";
  g.lineWidth = 1;
  for (let j = 1; j < 5; j++) {
    g.beginPath();
    g.moveTo(x, y + (h * j) / 5);
    g.lineTo(x + w, y + (h * j) / 5);
    g.stroke();
  }
  g.fillStyle = "#8cd5df";
  g.fillRect(x + 2, y, 2, h);
  g.fillRect(x + w - 4, y, 2, h);
  // Leaves retain their authored pixels, seals and gold emblem as they slide.
  g.drawImage(terrain, x, y, half, h, x - shift, y, half, h);
  g.drawImage(terrain, x + half, y, half, h, x + half + shift, y, half, h);
  g.restore();
}
