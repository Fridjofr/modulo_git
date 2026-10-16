let attackAtlas = null;
export const setAttackAtlas = (image) => {
  attackAtlas = image;
};
// Elemental particles composited over the approved animated sprites.
const cache = new Map();
export function effectSprite(type, color) {
  const id = type + color;
  if (cache.has(id)) return cache.get(id);
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d");
  x.translate(64, 64);
  if (type === "leaf") {
    x.rotate(-0.6);
    const g = x.createLinearGradient(0, -47, 0, 42);
    g.addColorStop(0, "#ecffd5");
    g.addColorStop(0.4, color);
    g.addColorStop(1, "#326234");
    x.fillStyle = g;
    x.beginPath();
    x.moveTo(0, -51);
    x.bezierCurveTo(-48, -5, -34, 32, 0, 47);
    x.bezierCurveTo(35, 18, 30, -20, 0, -51);
    x.fill();
    x.strokeStyle = "#f0ffb9";
    x.lineWidth = 3;
    x.beginPath();
    x.moveTo(0, -38);
    x.lineTo(0, 35);
    x.stroke();
  } else if (type === "slash") {
    x.rotate(-0.45);
    x.fillStyle = "#f5fff8";
    x.shadowColor = color;
    x.shadowBlur = 16;
    x.beginPath();
    x.moveTo(-45, 49);
    x.quadraticCurveTo(9, -44, 48, -49);
    x.quadraticCurveTo(7, -5, -45, 49);
    x.fill();
  } else {
    const g = x.createRadialGradient(-7, -5, 3, 0, 0, 55);
    g.addColorStop(0, "#fffbe2");
    g.addColorStop(0.25, color);
    g.addColorStop(0.6, color + "c0");
    g.addColorStop(1, color + "00");
    x.fillStyle = g;
    x.fillRect(-64, -64, 128, 128);
    if (type === "water") {
      x.strokeStyle = "#e5ffff";
      x.lineWidth = 4;
      x.beginPath();
      x.arc(0, 0, 27, -2.6, 1.3);
      x.stroke();
    }
    if (type === "fire") {
      x.fillStyle = "#fff8a8";
      x.beginPath();
      x.moveTo(0, -37);
      x.quadraticCurveTo(-26, 12, 0, 24);
      x.quadraticCurveTo(30, 11, 0, -37);
      x.fill();
    }
  }
  cache.set(id, c);
  return c;
}
const clamp = (v) => Math.max(0, Math.min(1, v));
function bubble(g, x, y, r, alpha = 1) {
  g.save();
  g.globalAlpha = alpha;
  const f = g.createRadialGradient(x - r * 0.32, y - r * 0.35, 1, x, y, r);
  f.addColorStop(0, "#e8ffff88");
  f.addColorStop(0.45, "#4bc8f333");
  f.addColorStop(0.82, "#218bbf99");
  f.addColorStop(1, "#c6f9ffe8");
  g.fillStyle = f;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#a4f0ff";
  g.lineWidth = 1.8;
  g.stroke();
  g.strokeStyle = "#ffffff";
  g.lineWidth = 2.4;
  g.beginPath();
  g.arc(x - r * 0.07, y - r * 0.05, r * 0.66, 3.6, 4.75);
  g.stroke();
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(x - r * 0.36, y - r * 0.36, r * 0.12, 0, Math.PI * 2);
  g.fill();
  g.restore();
}
export function drawStrike(ctx, fx, now, from, to, reduced = false) {
  const p = clamp((now - fx.start) / fx.duration),
    physical = fx.delivery === "melee" || fx.action === "attack",
    color = fx.color || "#d2ecd9",
    travel = clamp((p - 0.28) / 0.4),
    hit = clamp((p - 0.68) / 0.32),
    angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.save();
  if (!physical && p < 0.28) {
    ctx.globalAlpha = Math.sin((p / 0.28) * Math.PI) * 0.65;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(from.x, from.y, 6 + p * 45, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (!physical && fx.element === "Fogo" && p > 0.28 && p < 0.91) {
    const reach = clamp((p - 0.28) / 0.4),
      fade = clamp((0.91 - p) / 0.13),
      distance = Math.hypot(to.x - from.x, to.y - from.y) * reach;
    ctx.save();
    ctx.translate(from.x, from.y);
    ctx.rotate(angle);
    ctx.globalCompositeOperation = "source-over";
    // A continuous widening plume, built from coherent flame sheets and hot cores.
    for (let layer = 3; layer >= 0; layer--) {
      const width = (18 + layer * 13) * reach,
        grad = ctx.createLinearGradient(0, 0, Math.max(1, distance), 0);
      grad.addColorStop(0, layer < 2 ? "#ffe5a4" : "#ffb03d");
      grad.addColorStop(0.2, layer < 2 ? "#ffce5b" : "#ff8c22");
      grad.addColorStop(0.72, layer < 2 ? "#ffad30" : "#ef5016");
      grad.addColorStop(1, "#e53e1000");
      ctx.fillStyle = grad;
      ctx.globalAlpha = fade * (layer === 3 ? 0.8 : 0.9);
      ctx.beginPath();
      ctx.moveTo(0, -3);
      for (let i = 0; i <= 32; i++) {
        const q = i / 32,
          x = q * distance,
          w = 3 + Math.pow(q, 0.8) * width,
          wave = Math.sin(q * 32 - now / 66 + layer) * Math.min(12, q * 17);
        ctx.lineTo(x, -w + wave);
      }
      for (let i = 32; i >= 0; i--) {
        const q = i / 32,
          w = 3 + Math.pow(q, 0.8) * width,
          wave = Math.sin(q * 28 - now / 73 + layer) * Math.min(13, q * 20);
        ctx.lineTo(q * distance, w + wave);
      }
      ctx.closePath();
      ctx.fill();
    }
    for (let i = 0; i < (reduced ? 12 : 30); i++) {
      const q = (now / 450 + i * 0.037) % 1,
        x = q * distance,
        y = Math.sin(i * 2.4 + now / 130) * q * reach * 65;
      ctx.globalAlpha = fade * (1 - q) * 0.85;
      ctx.fillStyle = i % 3 ? "#ffca55" : "#fff7c0";
      ctx.beginPath();
      ctx.ellipse(x, y, 4 + q * 8, 2 + q * 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  if (!physical && fx.element === "Água") {
    for (let i = 0; i < (reduced ? 5 : 9); i++) {
      const t = (p - 0.28 - i * 0.019) / 0.4,
        r = 12 + (i % 3) * 5;
      if (t < 0) continue;
      if (t < 1) {
        const x = from.x + (to.x - from.x) * t,
          y =
            from.y +
            (to.y - from.y) * t +
            Math.sin(t * Math.PI * 2 + i * 1.7) * 13;
        bubble(ctx, x, y, r, 0.9);
      } else if (t < 1.4) {
        const q = (t - 1) / 0.4;
        ctx.globalAlpha = 1 - q;
        ctx.strokeStyle = "#b8f5ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(to.x, to.y, r + q * 22, 0, Math.PI * 2);
        ctx.stroke();
        for (let j = 0; j < 5; j++) {
          const a = j * 1.256 + i;
          ctx.fillStyle = "#8de6ff";
          ctx.beginPath();
          ctx.ellipse(
            to.x + Math.cos(a) * q * 36,
            to.y + Math.sin(a) * q * 28 + q * q * 15,
            2,
            4,
            a,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }
    }
  }
  if (!physical && fx.element === "Planta" && p > 0.28 && p < 0.91) {
    const leaf = effectSprite("leaf", "#85d65d");
    for (let i = 0; i < (reduced ? 4 : 8); i++) {
      const t = (p - 0.28 - i * 0.016) / 0.4;
      if (t < 0 || t > 1.25) continue;
      const q = clamp(t),
        x = from.x + (to.x - from.x) * q,
        y =
          from.y +
          (to.y - from.y) * q +
          Math.sin(q * Math.PI) * (i % 2 ? 1 : -1) * (12 + i * 3),
        size = 22 + (i % 3) * 5;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + now / 130 + i);
      ctx.globalAlpha = t <= 1 ? 1 : clamp((1.25 - t) / 0.25);
      ctx.drawImage(leaf, -size / 2, -size / 2, size, size);
      ctx.strokeStyle = "#e7ffc3";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-size * 0.8, 0);
      ctx.lineTo(-size * 0.3, 0);
      ctx.stroke();
      ctx.restore();
    }
  }
  if (p >= 0.68) {
    const fade = 1 - hit;
    ctx.globalAlpha = fade;
    if (!physical && fx.element === "Fogo") {
      ctx.save();
      ctx.translate(to.x, to.y);
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI) / 5 + now / 450,
          r = 12 + hit * 30;
        ctx.rotate(Math.PI / 5);
        ctx.fillStyle = i % 2 ? "#ff8d2ecc" : "#ffd067dd";
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.bezierCurveTo(-14, -r * 0.45, 6, -r * 0.65, Math.sin(a) * 8, -r);
        ctx.quadraticCurveTo(20, -r * 0.28, 5, 4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    if (physical) {
      ctx.fillStyle = "#fff9dd";
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI) / 8,
          r = i % 2 ? 12 + hit * 12 : 35 + hit * 24;
        const x = to.x + Math.cos(a) * r,
          y = to.y + Math.sin(a) * r * 0.7;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#f7dfaa";
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(to.x - 25 + i * 15, to.y - 27);
        ctx.lineTo(to.x - 9 + i * 15, to.y + 23);
        ctx.stroke();
      }
    }
    const count = reduced ? 5 : 14;
    for (let i = 0; i < count; i++) {
      const a = i * 2.399,
        r = 12 + hit * 75;
      ctx.fillStyle = physical ? "#fae6af" : color;
      ctx.fillRect(to.x + Math.cos(a) * r, to.y + Math.sin(a) * r * 0.6, 2, 3);
    }
    if (fx.damage) {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = Math.min(1, fade * 2);
      ctx.font = "600 28px Sora,sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#142b32";
      ctx.strokeText("−" + fx.damage, to.x, to.y - 35 - hit * 30);
      ctx.fillStyle = "#fff2ce";
      ctx.fillText("−" + fx.damage, to.x, to.y - 35 - hit * 30);
    }
  }
  ctx.restore();
}
export function drawTransformation(ctx, fx, now, reduced = false) {
  const p = clamp((now - fx.start) / fx.duration);
  if (p >= 1) return;
  const h = fx.height || 100,
    c = fx.color || "#78e8ec",
    reverse = fx.to === false,
    center = fx.y - h * 0.5;
  const cover = Math.sin(clamp((p - 0.1) / 0.8) * Math.PI),
    opacity = reverse ? cover * 0.24 : Math.min(1, cover * 1.6);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  if (!reverse && p < 0.22) {
    ctx.globalAlpha = Math.sin((p / 0.22) * Math.PI);
    ctx.strokeStyle = "#dfffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(fx.x + h * 0.12, fx.y - h * 0.34, 5 + p * 25, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (!reverse) {
    const glow = ctx.createRadialGradient(
      fx.x,
      center,
      1,
      fx.x,
      center,
      h * 0.82,
    );
    glow.addColorStop(0, "#edffff");
    glow.addColorStop(0.4, c + "d9");
    glow.addColorStop(1, c + "00");
    ctx.globalAlpha = cover * 0.75;
    ctx.fillStyle = glow;
    ctx.fillRect(fx.x - h, fx.y - h * 1.5, h * 2, h * 1.7);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = opacity;
    const fill = ctx.createLinearGradient(0, fx.y - h * 1.12, 0, fx.y);
    fill.addColorStop(0, "#f2ffff");
    fill.addColorStop(0.5, "#d8ffff");
    fill.addColorStop(1, c);
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(fx.x - h * 0.33, fx.y);
    for (let i = 0; i <= 22; i++) {
      const q = i / 22,
        x = fx.x - h * 0.34 + q * h * 0.68,
        y =
          fx.y -
          h *
            (0.91 + 0.15 * Math.sin(q * 15 + now / 150) ** 2) *
            Math.sin(q * Math.PI) ** 0.2;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(fx.x + h * 0.34, fx.y);
    ctx.closePath();
    ctx.fill();
  }
  const count = reduced ? 12 : 38;
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < count; i++) {
    const q = (p * 1.7 + i / count) % 1,
      a = i * 2.399 + p * 2,
      x =
        fx.x +
        Math.cos(a) * h * (reverse ? 0.22 + q * 0.65 : 0.38 * (1 - q * 0.5)),
      y = fx.y - q * h * 1.2;
    ctx.globalAlpha = cover * (0.3 + 0.6 * q);
    ctx.fillStyle = i % 3 ? c : "#efffff";
    ctx.fillRect(x, y, 2 + (i % 2), 4 + (i % 4));
  }
  ctx.globalAlpha = cover * 0.65;
  ctx.strokeStyle = c;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(fx.x, fx.y, h * 0.48, h * 0.13, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
