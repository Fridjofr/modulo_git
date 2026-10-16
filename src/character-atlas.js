import { drawHumanGait } from "./human-rig.js";
import { PALETTES } from "./model.js";
const DIRS = ["down", "left", "right", "up"];
const make = (w = 192, h = 192) =>
  Object.assign(document.createElement("canvas"), { width: w, height: h });
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const clean = (image, rect) => {
  const c = make(rect[2], rect[3]),
    g = c.getContext("2d");
  g.drawImage(image, ...rect, 0, 0, c.width, c.height);
  const data = g.getImageData(0, 0, c.width, c.height),
    seen = new Uint8Array(c.width * c.height),
    groups = [];
  for (let seed = 0; seed < seen.length; seed++)
    if (!seen[seed] && data.data[seed * 4 + 3] >= 224) {
      const q = [seed];
      seen[seed] = 1;
      for (let k = 0; k < q.length; k++) {
        const n = q[k],
          x = n % c.width,
          y = Math.floor(n / c.width);
        for (const j of [
          x ? n - 1 : -1,
          x < c.width - 1 ? n + 1 : -1,
          y ? n - c.width : -1,
          y < c.height - 1 ? n + c.width : -1,
        ])
          if (j >= 0 && !seen[j] && data.data[j * 4 + 3] >= 224) {
            seen[j] = 1;
            q.push(j);
          }
      }
      groups.push(q);
    }
  groups.sort((a, b) => b.length - a.length);
  for (const group of groups.slice(1))
    for (const n of group) data.data[n * 4 + 3] = 0;
  let l = c.width,
    r = 0,
    t = c.height,
    b = 0;
  for (let y = 0; y < c.height; y++)
    for (let x = 0; x < c.width; x++) {
      const n = (y * c.width + x) * 4;
      if (data.data[n + 3] < 224) {
        data.data[n + 3] = 0;
        continue;
      }
      data.data[n + 3] = 255;
      l = Math.min(l, x);
      r = Math.max(r, x);
      t = Math.min(t, y);
      b = Math.max(b, y);
    }
  g.putImageData(data, 0, 0);
  return { canvas: c, l, r, t, b };
};
export class CharacterAtlas {
  constructor(images) {
    this.cache = new Map();
    this.heads = {};
    this.bodies = {};
    const columns = [0, 174, 325, 472, 628, 778, 930, 1081, 1235, 1387, 1536],
      bodyCols = [0, 163, 315, 467, 622, 778, 931, 1086, 1235, 1392, 1536];
    const hr = [90, 336, 551, 771, 1024],
      br = [80, 310, 546, 768, 1024];
    for (const [gender, offset] of [
      ["female", 0],
      ["male", 5],
    ]) {
      this.heads[gender] = [];
      this.bodies[gender] = [];
      for (let look = 0; look < 5; look++) {
        const col = look + offset;
        this.heads[gender][look] = [];
        this.bodies[gender][look] = [];
        let faceScale;
        for (let row = 0; row < 4; row++) {
          const head = clean(images.heads, [
              columns[col],
              hr[row],
              columns[col + 1] - columns[col],
              hr[row + 1] - hr[row],
            ]),
            body = clean(images.bodies, [
              bodyCols[col],
              br[row],
              bodyCols[col + 1] - bodyCols[col],
              br[row + 1] - br[row],
            ]);
          // Find the exposed neck/face material in the authored component. Never cut a full character's head off.
          const d = head.canvas
            .getContext("2d")
            .getImageData(0, 0, head.canvas.width, head.canvas.height).data;
          const skin = [];
          let skinBottom = 0;
          for (let y = head.t; y <= head.b; y++)
            for (let x = head.l; x <= head.r; x++) {
              const n = (y * head.canvas.width + x) * 4;
              if (
                d[n + 3] &&
                d[n] > 185 &&
                d[n + 1] > 100 &&
                d[n + 1] < 220 &&
                d[n + 2] < 185 &&
                d[n] > d[n + 1] * 1.15
              ) {
                skin.push([x, y]);
                skinBottom = Math.max(skinBottom, y);
              }
            }
          if (!skin.length) skinBottom = 171;
          const neck = skin.filter(([x, y]) => y > skinBottom - 8),
            anchor = neck.length
              ? neck.reduce((sum, p) => sum + p[0], 0) / neck.length
              : (head.l + head.r) / 2;
          const face = skin.filter(([x, y]) => y < skinBottom - 8),
            faceWidth = face.length
              ? Math.max(...face.map((p) => p[0])) -
                Math.min(...face.map((p) => p[0]))
              : 70;
          // Scale by face anatomy, not by the outer height of a ponytail/bun.
          // One scale for all views of this cut prevents head-size changes on turns.
          if (row === 0) {
            const ys = skin.map((p) => p[1]).sort((a, b) => a - b);
            faceScale =
              34 / Math.max(1, skinBottom - ys[Math.floor(ys.length * 0.02)]);
          }
          const scale = faceScale;
          const hc = make(),
            hg = hc.getContext("2d");
          hg.imageSmoothingEnabled = false;
          hg.drawImage(
            head.canvas,
            Math.round(96 - anchor * scale),
            Math.round(92 - skinBottom * scale),
            Math.round(head.canvas.width * scale),
            Math.round(head.canvas.height * scale),
          );
          // The authored female double-bun right cell faces away. Use the true
          // left profile mirrored, preserving the face rather than that bad cell.
          if (gender === "female" && look === 3 && row === 2) {
            hg.clearRect(0, 0, 192, 192);
            hg.save();
            hg.translate(192, 0);
            hg.scale(-1, 1);
            hg.drawImage(this.heads[gender][look][1], 0, 0);
            hg.restore();
          }
          this.heads[gender][look].push(hc);
          const bc = make(),
            bg = bc.getContext("2d");
          bg.imageSmoothingEnabled = false;
          const bs = 94 / (body.b - body.t + 1),
            bw = (body.r - body.l + 1) * bs;
          bg.drawImage(
            body.canvas,
            body.l,
            body.t,
            body.r - body.l + 1,
            body.b - body.t + 1,
            Math.round(96 - bw / 2),
            86,
            Math.round(bw),
            94,
          );
          this.bodies[gender][look].push(bc);
        }
      }
    }
  }
  tint(source, a, isHead) {
    const c = make(),
      g = c.getContext("2d");
    g.drawImage(source, 0, 0);
    const image = g.getImageData(0, 0, 192, 192),
      d = image.data;
    for (let y = 0; y < 192; y++)
      for (let x = 0; x < 192; x++) {
        const n = (y * 192 + x) * 4;
        if (!d[n + 3]) continue;
        const r = d[n],
          gr = d[n + 1],
          b = d[n + 2],
          lum = r * 0.3 + gr * 0.59 + b * 0.11;
        let material = null,
          base = 100;
        const warm = r > gr * 1.1 && gr > b * 1.08;
        if (
          warm &&
          r > 165 &&
          gr > 80 &&
          b > 48 &&
          r > gr * 1.2 &&
          b > gr * 0.56
        ) {
          material = "skin";
          base = 185;
        } else if (isHead && warm && r < 210 && gr < 160) {
          material = "hair";
          base = 85;
        } else if (!isHead && r > 130 && gr > 95 && b < gr * 0.8) {
          material = "accent";
          base = 168;
        } else if (!isHead && y >= 103 && y < 144 && lum > 25 && lum < 155) {
          material = "top";
          base = 70;
        } else if (!isHead && y >= 144 && y < 167 && lum > 25 && !warm) {
          material = "bottom";
          base = 60;
        }
        if (
          !isHead &&
          a.legwear &&
          y >= 143 &&
          y < 171 &&
          material === "skin"
        ) {
          material = "bottom";
          base = 185;
        }
        if (material) {
          const color = rgb(PALETTES[material][a[material] || 0]),
            shade = Math.max(0.25, Math.min(1.25, 0.35 + (lum / base) * 0.65));
          for (let k = 0; k < 3; k++)
            d[n + k] = Math.min(255, Math.round(color[k] * shade));
        }
      }
    g.putImageData(image, 0, 0);
    if (!isHead && a.legwear) {
      // Stitching and cargo pockets are clipped to the authored leg silhouette;
      // trouser models remain visibly distinct even when the base already has pants.
      g.globalCompositeOperation = "source-atop";
      g.fillStyle = a.legwear === 2 ? "#9bb7b080" : "#c5d2cf66";
      for (let y = 149; y < 168; y++) {
        const spans = [];
        let begin = -1;
        for (let x = 58; x < 136; x++) {
          const filled = d[(y * 192 + x) * 4 + 3] > 220;
          if (filled && begin < 0) begin = x;
          if (begin >= 0 && (!filled || x === 135)) {
            spans.push([begin, x - 1]);
            begin = -1;
          }
        }
        for (const [left, right] of spans) {
          if (right - left < 3) continue;
          const seam = left + Math.max(1, Math.floor((right - left) * 0.3));
          g.fillRect(seam, y, 1, 1);
          if (a.legwear === 2 && y >= 151 && y < 156)
            g.fillRect(Math.max(left + 1, right - 4), y, 3, 1);
        }
      }
      g.globalCompositeOperation = "source-over";
    }
    return c;
  }
  frame(gender, dir, index, a, zlink, assets) {
    const key = JSON.stringify([gender, dir, index, a, zlink]);
    if (this.cache.has(key)) return this.cache.get(key);
    const di = Math.max(0, DIRS.indexOf(dir)),
      head = this.tint(this.heads[gender][a.style || 0][di], a, true),
      body = this.tint(this.bodies[gender][a.outfit || 0][di], a, false);
    const c = make(),
      g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    const bob = 0;
    drawHumanGait(g, body, dir, index);
    // Bags are behind back hair and use the same 192px anchor as every other component.
    assets.drawBag(g, dir, a);
    g.drawImage(head, 0, bob);
    if (zlink) {
      g.save();
      g.translate(32, bob);
      assets.drawLink(g, dir);
      g.restore();
    }
    const pixels = g.getImageData(0, 0, 192, 192).data;
    let top = 180;
    for (let y = 0; y < 180; y++) {
      let count = 0;
      for (let x = 50; x < 142; x++)
        if (pixels[(y * 192 + x) * 4 + 3] > 220) count++;
      if (count > 2) {
        top = y;
        break;
      }
    }
    const result = {
      canvas: c,
      w: 192,
      h: 192,
      anchor: 96,
      baseline: 180,
      referenceHeight: 164,
    };
    this.cache.set(key, result);
    if (this.cache.size > 320)
      this.cache.delete(this.cache.keys().next().value);
    return result;
  }
}

export { clean as extractSprite };
