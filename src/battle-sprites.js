// Presentation only. Every actor is drawn from its approved source sheet.
export const BATTLE_MARKS = {
  player: { x: 320, y: 475 },
  opponent: { x: 925, y: 365 },
};
export const CONTACT = 0.68;
const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
export function battleForm(battle, side, fx, now) {
  if (
    fx?.kind === "transform" &&
    (fx.side === side || fx.side === "both") &&
    !fx.already?.[side]
  ) {
    const p = clamp((now - fx.start) / fx.duration);
    return fx.to ? p > 0.57 : p < 0.57;
  }
  return battle[side].transformed;
}
export function battlePose(side, battle, fx, now, reduced = false) {
  const home = BATTLE_MARKS[side],
    other = BATTLE_MARKS[side === "player" ? "opponent" : "player"];
  const facing = side === "player" ? 1 : -1;
  const pose = {
    ...home,
    ground: home.y,
    scaleX: 1,
    scaleY: 1,
    tilt: 0,
    frame: 0,
    atlasPose: 0,
    alpha: 1,
    flash: 0,
  };
  // Authored side poses have different limb/tail positions; calm holds avoid walk-in-place.
  const cycle = [0, 0, 0, 1, 1, 0, 0, 2, 2, 0];
  if (!reduced) {
    pose.frame = cycle[Math.floor(now / 240) % cycle.length];
    pose.scaleY = 1 + Math.sin(now / 530 + (side === "player" ? 0 : 2)) * 0.008;
  }
  const p = fx ? clamp((now - fx.start) / fx.duration) : 0;
  if (fx?.kind === "strike") {
    if (fx.side === side) {
      const physical = fx.delivery === "melee" || fx.action === "attack";
      pose.atlasPose =
        p < 0.22
          ? 1
          : p < (physical ? CONTACT : 0.86)
            ? physical
              ? 2
              : 3
            : p < 0.94
              ? 4
              : 0;
      // 0–30% anticipation; 30–68% approach; contact; recovery to the exact anchor.
      const anticipation = Math.sin(clamp(p / 0.3) * Math.PI);
      const travel =
        p < CONTACT
          ? smooth((p - 0.24) / 0.44)
          : 1 - smooth((p - CONTACT) / 0.32);
      const fraction = physical
        ? 1 - (battle.contactGap?.[side] || 95) / Math.abs(other.x - home.x)
        : 0.025;
      const leap =
        physical && p > 0.24 && p < CONTACT
          ? Math.sin(((p - 0.24) / 0.44) * Math.PI) * (reduced ? 15 : 42)
          : physical && p > CONTACT
            ? Math.sin(((p - CONTACT) / 0.32) * Math.PI) * 12
            : 0;
      {
        pose.x +=
          (other.x - home.x) * fraction * travel - facing * 14 * anticipation;
        pose.y += (other.y - home.y) * fraction * travel - leap;
        pose.ground += (other.y - home.y) * fraction * travel;
        pose.tilt = facing * (anticipation * -0.045 + travel * 0.06);
        pose.scaleX = 1 - anticipation * 0.025;
        pose.scaleY = 1 - anticipation * 0.035;
        pose.frame = p < 0.3 ? 1 : p < 0.74 ? 2 : 0;
      }
    } else if (p >= CONTACT) {
      const recoil = Math.sin(clamp((p - CONTACT) / 0.32) * Math.PI);
      pose.flash = recoil;
      pose.atlasPose = 5;
      if (!reduced) {
        pose.x -= facing * recoil * 23;
        pose.tilt = -facing * recoil * 0.07;
        pose.frame = 1;
      }
    }
  }
  if (fx?.kind === "hit" && fx.target === side && !reduced) {
    pose.atlasPose = p < 0.5 ? 5 : 0;
    pose.x += Math.sin(p * 24) * 5 * (1 - p);
    pose.scaleY -= Math.sin(p * Math.PI) * 0.025;
  }
  if (
    fx?.kind === "transform" &&
    (fx.side === side || fx.side === "both") &&
    !fx.already?.[side]
  ) {
    pose.frame = p < 0.25 ? 2 : 0;
    if (!reduced && p > 0.72) {
      const release = Math.sin(clamp((p - 0.72) / 0.28) * Math.PI);
      pose.y -= release * 7;
    }
  }
  if (fx?.kind === "partial" && fx.side === side) {
    pose.atlasPose = p < 0.65 ? 1 : 0;
    pose.frame = 2;
  }
  if (fx?.kind === "restraint" && side === "opponent") {
    pose.atlasPose = 1;
    pose.x += Math.sin(p * Math.PI) * 12;
  }
  if (side === "player" && (battle.fallen || fx?.kind === "fall")) {
    pose.fallProgress = battle.fallen ? 1 : smooth(p);
    pose.tilt = 0;
    pose.atlasPose = 5;
    pose.alpha = 1;
  }
  // Do not announce a knockout before the impact/HP display commits.
  if ((battle.displayHP?.[side] ?? battle[side].hp) <= 0) {
    pose.alpha = 1;
    if (!reduced && !battle.fallen && fx?.kind !== "fall")
      pose.tilt = -facing * 0.13;
  }
  return pose;
}
