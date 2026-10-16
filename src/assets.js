import { CreatureAtlas } from "./creature-atlas.js";
import { ClinicRenderer } from "./clinic-renderer.js";
import { NpcAtlas } from "./npc-atlas.js";
import { setAttackAtlas } from "./effects.js";
import { PALETTES } from "./model.js";
import { TileWorld } from "./tilemap.js";
import { CharacterAtlas, extractSprite } from "./character-atlas.js";
import { BattleAtlas } from "./battle-atlas.js";
import { drawHairBack, drawClothing } from "./appearance.js";
export class Assets {
  constructor() {
    this.images = {};
    this.frames = new Map();
    this.meta = null;
  }
  async load() {
    const response = await fetch("assets/sprites.json");
    if (!response.ok) throw new Error("Metadados dos sprites indisponíveis.");
    this.meta = await response.json();
    const files = new Map(
      Object.entries(this.meta).map(([k, v]) => [k, v.file]),
    );
    for (const [key, data] of Object.entries(this.meta))
      for (const [region, file] of Object.entries(data.layers || {}))
        files.set(`${key}:${region}`, file);
    for (const [key, file] of Object.entries({
      forestV11: "assets/world/v11/forest.png",
      gymV11: "assets/world/v11/gym.png",
      corridorV11: "assets/world/review-a2/corridor.png",
      academyApproved: "assets/world/academy.png",
      labApproved: "assets/world/laboratory.png",
      clinicApproved: "assets/world/review-a2/infirmary-floor.png",
      clinicProps: "assets/world/review-a2/clinic-props.png",
      maraWalk: "assets/characters/review-a2/mara-walk.png",
      ayaWalk: "assets/characters/review-a2/aya-walk.png",
      liraSeated: "assets/characters/review-a/lira-seated.png",
      tileTerrain: "assets/tiles/v10/terrain.png",
      tileObjects: "assets/tiles/v10/objects.png",
      heads: "assets/characters/v10/heads.png",
      bodies: "assets/characters/v10/bodies.png",
      bags: "assets/characters/v10/bags.png",
      npcs: "assets/characters/v10/npcs.png",
      attackEffects: "assets/battle/effects-v10.png",
      wallpaper: "assets/world/review-a/title.png",
    }))
      files.set(key, file);
    for (const [key, file] of Object.entries({
      fire: "pyron",
      water: "marivon",
      plant: "verdrax",
      lira: "lira-verdrax",
    }))
      files.set("battle:" + key, `assets/battle/${file}.png`);
    await Promise.all(
      [...files].map(async ([key, file]) => {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () =>
            reject(new Error(`Não foi possível carregar ${file}.`));
          img.src = file;
        });
        this.images[key] = img;
      }),
    );
    setAttackAtlas(this.images.attackEffects);
    this.tiles = new TileWorld(this.images);
    this.battle = new BattleAtlas(this.images);
    this.looks = new CharacterAtlas(this.images);
    this.creatures = new CreatureAtlas(this.images, this.meta);
    this.cast = new NpcAtlas(this.images.npcs, this.images);
    this.clinic = new ClinicRenderer(this);
    const columns = [0, 420, 768, 1110, 1536];
    this.bags = Array.from({ length: 2 }, (_, row) =>
      Array.from({ length: 4 }, (_, col) =>
        extractSprite(this.images.bags, [
          columns[col],
          row * 512,
          columns[col + 1] - columns[col],
          512,
        ]),
      ),
    );
    for (const [key, data] of Object.entries(this.meta))
      for (const [dir, frames] of Object.entries(data.directions))
        for (const [x, y, w, h] of frames)
          if (
            x < 0 ||
            y < 0 ||
            w <= 0 ||
            h <= 0 ||
            x + w > this.images[key].width ||
            y + h > this.images[key].height
          )
            throw new Error(`Recorte inválido: ${key}/${dir}`);
  }
  frame(
    key,
    direction,
    index = 0,
    appearance = null,
    zlink = false,
    possessed = false,
  ) {
    if (possessed && ["fire", "water", "plant"].includes(key)) {
      const cacheKey = ["red", key, direction, index].join(":");
      if (this.frames.has(cacheKey)) return this.frames.get(cacheKey);
      const base = this.frame(key, direction, index, null, false, false),
        c = document.createElement("canvas");
      c.width = base.w;
      c.height = base.h;
      const g = c.getContext("2d");
      g.drawImage(base.canvas, 0, 0);
      if (direction !== "up") {
        const image = g.getImageData(0, 0, c.width, c.height),
          d = image.data,
          front = direction === "down";
        const centers = front
          ? [
              [0.34, 0.54],
              [0.67, 0.54],
            ]
          : [
              [
                direction === "left" ? 0.29 : 0.7,
                key === "plant" ? 0.37 : 0.43,
              ],
            ];
        for (let y = 0; y < c.height; y++)
          for (let x = 0; x < c.width; x++)
            if (
              centers.some(
                ([cx, cy]) =>
                  ((x / c.width - cx) / 0.14) ** 2 +
                    ((y / c.height - cy) / 0.105) ** 2 <
                  1,
              )
            ) {
              const i = (y * c.width + x) * 4,
                r = d[i],
                gr = d[i + 1],
                b = d[i + 2],
                iris =
                  key === "fire"
                    ? r > 125 && gr > 65 && gr < 205 && b < 100
                    : key === "water"
                      ? b > 120 && r < 140 && gr < 205
                      : gr > 75 && gr > r * 1.05 && gr > b * 1.12 && r < 190;
              if (d[i + 3] > 220 && iris) {
                d[i] = 255;
                d[i + 1] = 25;
                d[i + 2] = 44;
              }
            }
        g.putImageData(image, 0, 0);
      }
      const f = { ...base, canvas: c };
      this.frames.set(cacheKey, f);
      return f;
    }
    if (["fire", "water", "plant"].includes(key))
      return this.creatures.frame(key, direction, index);
    if (key.startsWith("npc:")) return this.cast.frame(key, direction, index);
    if (this.looks && appearance && ["male", "female"].includes(key))
      return this.looks.frame(key, direction, index, appearance, zlink, this);
    if (appearance?.style >= 1 && ["male", "female"].includes(key))
      key += "-short";
    const cacheKey = `${key}:${direction}:${index}:${appearance ? JSON.stringify(appearance) : ""}:${zlink}`;
    if (this.frames.has(cacheKey)) return this.frames.get(cacheKey);
    const data = this.meta[key];
    let dir = direction,
      flip = false;
    if (!data.directions[dir]) {
      dir = "right";
      flip = direction === "left";
    }
    if (data.mirrorSide && ["right", "left"].includes(direction)) flip = !flip;
    const frameIndex = index % data.directions[dir].length;
    const [x, y, w, h] = data.directions[dir][frameIndex];
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    if (flip) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    if (appearance) drawHairBack(ctx, direction, appearance, frameIndex);
    ctx.drawImage(this.images[key], x, y, w, h, 0, 0, w, h);
    if (data.layers) {
      const a = appearance || {
        hair: 0,
        skin: 0,
        top: 0,
        bottom: 0,
        accent: 0,
        style: 0,
        bag: 1,
      };
      for (const region of ["skin", "top", "bottom", "accent"])
        ctx.drawImage(
          this.images[`${key}:${region}`],
          x + data.strideWidth * a[region],
          y,
          w,
          h,
          0,
          0,
          w,
          h,
        );
      if (a.outfit || a.legwear) {
        const layers = {};
        for (const region of ["skin", "top", "bottom"]) {
          const layer = document.createElement("canvas");
          layer.width = w;
          layer.height = h;
          layer
            .getContext("2d")
            .drawImage(
              this.images[`${key}:${region}`],
              x + data.strideWidth * a[region],
              y,
              w,
              h,
              0,
              0,
              w,
              h,
            );
          layers[region] = layer;
        }
        drawClothing(ctx, a, direction, frameIndex, layers);
      }
      this.drawBag(ctx, direction, a);
      ctx.drawImage(
        this.images[`${key}:hair`],
        x + data.strideWidth * a.hair,
        y,
        w,
        h,
        0,
        0,
        w,
        h,
      );
      if (zlink) {
        ctx.save();
        ctx.translate(32, 0);
        this.drawLink(ctx, direction);
        ctx.restore();
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const sourceAnchor = data.anchors?.[dir]?.[frameIndex] ?? w / 2;
    const result = {
      canvas,
      w,
      h,
      anchor: flip ? w - sourceAnchor : sourceAnchor,
      baseline: data.baseline ?? h,
      referenceHeight:
        key === "lira" ? this.liraHeight(dir) : (data.referenceHeight ?? h),
    };
    this.frames.set(cacheKey, result);
    if (this.frames.size > 128)
      this.frames.delete(this.frames.keys().next().value);
    return result;
  }
  liraHeight(dir) {
    this.liraHeights ||= {};
    if (this.liraHeights[dir]) return this.liraHeights[dir];
    const data = this.meta.lira,
      [x, y, w, h] = data.directions[dir][0],
      c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    g.drawImage(this.images.lira, x, y, w, h, 0, 0, w, h);
    const d = g.getImageData(0, 0, w, h).data;
    let top = h;
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++)
        if (d[(j * w + i) * 4 + 3] > 220) top = Math.min(top, j);
    return (this.liraHeights[dir] = (data.baseline ?? h) - top);
  }
  drawSeatedLira(ctx, x, y, progress = 0) {
    this.seatedFrames ||= [0, 1].map((col) =>
      extractSprite(this.images.liraSeated, [
        (col * this.images.liraSeated.width) / 2,
        0,
        this.images.liraSeated.width / 2,
        this.images.liraSeated.height,
      ]),
    );
    const f = this.seatedFrames[progress > 0.5 ? 1 : 0];
    // Both poses use the same scale. Measure standing pose once, never normalize
    // a seated figure to full standing height.
    const scale =
      (84 / (this.seatedFrames[1].b - this.seatedFrames[1].t + 1)) * 0.91;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // Mirror the approved left-facing seated pose toward the bed on her right.
    ctx.translate(x, y);
    ctx.scale(-1, 1);
    ctx.drawImage(
      f.canvas,
      f.l,
      f.t,
      f.r - f.l + 1,
      f.b - f.t + 1,
      Math.round(-(f.r - f.l + 1) * scale * 0.5),
      Math.round(-(f.b - f.t + 1) * scale),
      Math.round((f.r - f.l + 1) * scale),
      Math.round((f.b - f.t + 1) * scale),
    );
    ctx.restore();
  }
  sleeping(ctx, appearance, x, y, height, zlink = false, eyesClosed = false) {
    const key = "sleep:" + JSON.stringify([appearance, zlink, eyesClosed]);
    let f = this.frames.get(key);
    if (!f) {
      const base = this.frame(appearance.gender, "down", 0, appearance, zlink),
        c = document.createElement("canvas");
      c.width = c.height = 192;
      const g = c.getContext("2d");
      g.drawImage(base.canvas, 0, 0);
      // Close the eyes inside the face. Sample adjacent cheek material so all
      // skin palettes retain the same shading instead of applying a pale patch.
      const pixels = g.getImageData(0, 0, 192, 192);
      for (const ex of eyesClosed ? [84, 108] : []) {
        const n = (80 * 192 + ex) * 4;
        const color = `rgb(${pixels.data[n]},${pixels.data[n + 1]},${pixels.data[n + 2]})`;
        g.fillStyle = color;
        g.fillRect(ex - 5, 67, 11, 13);
        g.strokeStyle = "#4b322d";
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(ex - 4, 74);
        g.quadraticCurveTo(ex, 77, ex + 4, 74);
        g.stroke();
      }
      f = { ...base, canvas: c };
      this.frames.set(key, f);
    }
    const scale = height / f.referenceHeight;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // The authored mattress already has its single blanket. Only the uncovered
    // head and upper shoulders are above it; no copied rectangle of bedding.
    ctx.beginPath();
    ctx.rect(x - 48, y - 92, 96, 56);
    ctx.clip();
    ctx.drawImage(
      f.canvas,
      Math.round(x - f.anchor * scale),
      Math.round(y - f.baseline * scale),
      Math.round(192 * scale),
      Math.round(192 * scale),
    );
    ctx.restore();
  }
  drawBag(ctx, dir, a) {
    if (!a.bag) return;
    if (this.bags) {
      const di = { down: 0, left: 1, right: 2, up: 3 }[dir],
        p = this.bags[a.bag - 1][di],
        height = a.bag === 2 ? 34 : 21,
        width = p.r - p.l + 1,
        w = (height * width) / (p.b - p.t + 1);
      const x =
          a.bag === 2
            ? dir === "up"
              ? 96
              : dir === "left"
                ? 111
                : dir === "right"
                  ? 80
                  : 96
            : dir === "left"
              ? 109
              : dir === "right"
                ? 80
                : 114,
        y = a.bag === 2 ? 142 : 145;
      if (a.bag === 2 && dir === "down") {
        ctx.save();
        ctx.strokeStyle = PALETTES.accent[a.accent || 0];
        ctx.lineWidth = 2.5;
        for (const sign of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(96 + sign * 14, 105);
          ctx.lineTo(96 + sign * 12, 133);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }
      if (a.bag === 1 && ["down", "up"].includes(dir)) {
        ctx.save();
        ctx.strokeStyle = "#192b34";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(78, 105);
        ctx.lineTo(x, y - 9);
        ctx.stroke();
        ctx.strokeStyle = PALETTES.accent[a.accent || 0];
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        p.canvas,
        p.l,
        p.t,
        width,
        p.b - p.t + 1,
        Math.round(x - w / 2),
        Math.round(y - height),
        Math.round(w),
        height,
      );
      return;
    }
    const color = PALETTES.accent[a.accent];
    ctx.save();
    ctx.translate(32, 0);
    const fill = (x, y, w, h, c) => {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, w, h);
    };
    if (a.bag === 2) {
      if (dir === "down") {
        fill(43, 98, 5, 30, "#172a34");
        fill(82, 98, 5, 30, "#172a34");
        fill(44, 99, 3, 26, color);
        fill(83, 99, 3, 26, color);
        fill(44, 119, 42, 3, "#172a34");
        fill(62, 118, 6, 5, "#e6e2ca");
      } else {
        const x = dir === "up" ? 47 : dir === "left" ? 78 : 27,
          width = dir === "up" ? 34 : 22;
        fill(x + 3, 101, width - 6, 5, "#172a34");
        fill(x, 106, width, 36, "#172a34");
        fill(x + 3, 108, width - 6, 30, color);
        fill(x + 4, 128, width - 8, 9, "#5d5149");
        fill(x + 6, 130, width - 12, 5, color);
        fill(x + width / 2 - 2, 119, 4, 7, "#eef0d5");
        fill(x + 4, 110, 3, 10, "#ffffff40");
      }
    } else {
      const bx =
        dir === "left" ? 79 : dir === "right" ? 29 : dir === "up" ? 77 : 84;
      if (dir === "down" || dir === "up") {
        ctx.strokeStyle = "#182d38";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(44, 98);
        ctx.lineTo(bx + 5, 135);
        ctx.stroke();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      fill(bx - 2, 126, 20, 19, "#172a34");
      fill(bx, 128, 16, 14, color);
      fill(bx - 1, 128, 18, 5, "#66553c");
      fill(bx + 6, 131, 4, 5, "#e4e0c8");
      fill(bx + 1, 136, 2, 4, "#ffffff30");
    }
    ctx.restore();
  }
  drawLink(ctx, dir) {
    if (dir === "up") return;
    const x = dir === "left" ? 43 : dir === "right" ? 83 : 94,
      y = dir === "down" ? 125 : 121;
    ctx.fillStyle = "#162e3e";
    ctx.fillRect(x - 4, y, 9, 7);
    ctx.fillStyle = "#8af3e7";
    ctx.fillRect(x - 2, y + 1, 5, 4);
    ctx.fillStyle = "#eaffed";
    ctx.fillRect(x - 1, y + 1, 2, 2);
  }
  walkIndex(key, dir, phase) {
    if (key.startsWith("npc:")) return [0, 1, 0, 3][phase % 4];
    return (this.meta[key].walkFrames?.[dir] || [0, 1, 0, 2])[phase % 4];
  }
  draw(
    ctx,
    key,
    dir,
    frame,
    x,
    feetY,
    height,
    appearance = null,
    zlink = false,
    alpha = 1,
    possessed = false,
  ) {
    const f = this.frame(key, dir, frame, appearance, zlink, possessed);
    const scale = height / f.referenceHeight;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      f.canvas,
      Math.round(x - f.anchor * scale),
      Math.round(feetY - f.baseline * scale),
      Math.round(f.w * scale),
      Math.round(f.h * scale),
    );
    ctx.restore();
  }
}
