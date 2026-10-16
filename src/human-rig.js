// One anatomical source per outfit, including its own hips, knees and boots.
// Row-wise articulation keeps the garment/leg seam continuous. No rotated strips,
// foreign walking legs or changes to the character's scale between poses.
export function drawHumanGait(g, source, direction, index = 0) {
  const stride = [0, 1, 0, -1][index % 4];
  g.imageSmoothingEnabled = false;
  if (!stride) {
    g.drawImage(source, 0, 0);
    return;
  }
  const profile = direction === "left" || direction === "right";
  const hip = 140,
    knee = 160,
    heel = 180;
  g.drawImage(source, 0, 0, 192, hip, 0, 0, 192, hip);
  for (let side = 0; side < 2; side++) {
    const sign = side ? 1 : -1;
    for (let y = hip; y < 192; y++) {
      const q = Math.max(0, Math.min(1, (y - hip) / (heel - hip)));
      const bend = Math.sin((q * Math.PI) / 2);
      const dx = profile
        ? Math.round(sign * stride * bend * 9)
        : Math.round(sign * stride * Math.sin(q * Math.PI) * 2);
      const lift = sign * stride > 0 ? (profile ? 3 : 4) : 0;
      const dy = Math.round(-lift * Math.max(0, (y - knee) / (heel - knee)));
      g.drawImage(source, side * 96, y, 96, 1, side * 96 + dx, y + dy, 96, 1);
    }
  }
}
