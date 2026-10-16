import { doorway, doorStep, drawSlidingDoor } from "./doors.js";
import { MAPS } from "./maps.js";
const create = (w, h) =>
  Object.assign(document.createElement("canvas"), { width: w, height: h });
export class TileWorld {
  constructor(images) {
    this.images = images;
    this.cache = new Map();
    this.props = [];
    const raw = create(1536, 1024),
      g = raw.getContext("2d");
    g.drawImage(images.tileObjects, 0, 0);
    for (let i = 0; i < 24; i++) {
      const bytes = g.getImageData(
        (i % 6) * 256,
        Math.floor(i / 6) * 256,
        256,
        256,
      );
      let l = 256,
        r = 0,
        t = 256,
        b = 0;
      for (let y = 0; y < 256; y++)
        for (let x = 0; x < 256; x++) {
          const n = (y * 256 + x) * 4;
          if (bytes.data[n + 3] < 222) {
            bytes.data[n + 3] = 0;
            continue;
          }
          bytes.data[n + 3] = 255;
          l = Math.min(l, x);
          r = Math.max(r, x);
          t = Math.min(t, y);
          b = Math.max(b, y);
        }
      const c = create(256, 256);
      c.getContext("2d").putImageData(bytes, 0, 0);
      this.props.push({ canvas: c, l, t, w: r - l + 1, h: b - t + 1 });
    }
  }
  texture(g, id, x, y, w, h, scale = 64) {
    const image = this.images.tileTerrain;
    g.save();
    g.beginPath();
    g.rect(x, y, w, h);
    g.clip();
    for (let yy = Math.floor(y / scale) * scale; yy < y + h; yy += scale)
      for (let xx = Math.floor(x / scale) * scale; xx < x + w; xx += scale)
        g.drawImage(
          image,
          (id % 6) * 256,
          Math.floor(id / 6) * 256,
          256,
          256,
          xx,
          yy,
          scale,
          scale,
        );
    g.restore();
  }
  object(g, o, state) {
    if (o.embedded) return;
    if (o.type === 13) {
      const cx = o.x,
        cy = o.y - o.h / 2,
        r = Math.min(o.w, o.h) * 0.46;
      g.save();
      g.translate(cx, cy);
      g.strokeStyle = "#be9f61aa";
      g.fillStyle = "#ceaf7033";
      g.lineWidth = 2;
      for (const scale of [1, 0.84]) {
        g.beginPath();
        g.ellipse(0, 0, r * scale, r * 0.65 * scale, 0, 0, Math.PI * 2);
        g.stroke();
      }
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4,
          len = i % 2 ? r * 0.68 : r * 0.88;
        g.beginPath();
        g.moveTo(Math.cos(a) * len, Math.sin(a) * len * 0.65);
        g.lineTo(Math.cos(a + 0.4) * r * 0.22, Math.sin(a + 0.4) * r * 0.14);
        g.lineTo(Math.cos(a - 0.4) * r * 0.22, Math.sin(a - 0.4) * r * 0.14);
        g.closePath();
        g.fill();
        g.stroke();
      }
      g.restore();
      return;
    }
    let id = o.type;
    if (
      (o.id === "lab-bench" && state?.story.flags.labDamaged) ||
      (o.id === "lab-bench-2" && state?.story.flags.labSecondDamage)
    )
      id = 18;
    const p = this.props[id];
    g.imageSmoothingEnabled = false;
    g.drawImage(
      p.canvas,
      p.l,
      p.t,
      p.w,
      p.h,
      Math.round(o.x - o.w / 2),
      Math.round(o.y - o.h),
      o.w,
      o.h,
    );
  }
  terrain(world) {
    if (this.cache.has(world)) return this.cache.get(world);
    const m = MAPS[world],
      c = create(...m.size),
      g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    if (m.art) {
      g.drawImage(this.images[m.art], 0, 0, ...m.size);
      this.cache.set(world, c);
      return c;
    }
    this.texture(g, m.floor, 0, 0, ...m.size, 64);
    if (world === "forest") {
      const layer = create(...m.size),
        v = layer.getContext("2d"),
        mask = create(m.size[0] / 4, m.size[1] / 4),
        mg = mask.getContext("2d");
      mg.scale(0.25, 0.25);
      mg.fillStyle = "#fff";
      mg.strokeStyle = "#fff";
      mg.lineCap = "round";
      mg.lineJoin = "round";
      mg.lineWidth = 150;
      mg.beginPath();
      mg.moveTo(380, 592);
      mg.bezierCurveTo(740, 560, 820, 665, 1130, 590);
      mg.bezierCurveTo(1410, 525, 1610, 620, 1890, 592);
      mg.stroke();
      mg.beginPath();
      mg.ellipse(460, 592, 260, 205, -0.18, 0, Math.PI * 2);
      mg.fill();
      mg.lineWidth = 86;
      mg.beginPath();
      mg.moveTo(510, 650);
      mg.quadraticCurveTo(660, 790, 880, 720);
      mg.stroke();
      this.texture(v, 1, 0, 0, ...m.size, 64);
      v.globalCompositeOperation = "destination-in";
      v.imageSmoothingEnabled = false;
      v.drawImage(mask, 0, 0, ...m.size);
      g.drawImage(layer, 0, 0);
    } else
      for (const path of m.paths || []) {
        this.texture(g, 1, ...path, 64);
      }

    const [x, y, w, h] = m.bounds;
    if (!m.indoor) {
      g.save();
      g.strokeStyle = world === "forest" ? "#465949" : "#8f9b83";
      g.lineWidth = 12;
      g.strokeRect(x - 7, y - 7, w + 14, h + 14);
      g.strokeStyle = "#d7cca370";
      g.lineWidth = 2;
      g.strokeRect(x - 12, y - 12, w + 24, h + 24);
      g.restore();
    }
    if (m.indoor) {
      g.fillStyle = "#081626";
      g.fillRect(0, 0, m.size[0], y - 84);
      g.fillRect(0, y + h, m.size[0], m.size[1] - y - h);
      this.texture(g, 18, x, y - 84, w, 84, 96);
      g.fillStyle = "#d5c79d";
      g.fillRect(x, y - 4, w, 4);
      g.fillStyle = "#101f34";
      g.fillRect(x - 20, y, 20, h);
      g.fillRect(x + w, y, 20, h);
      g.fillStyle = "#d1bd84";
      g.fillRect(x - 8, y, 4, h);
      g.fillRect(x + w + 4, y, 4, h);
      g.fillRect(x, y + h, w, 5);
      // Windows are separate architectural pieces and have no walkable floor behind them.
      for (let wx = x + 160; wx < x + w - 80; wx += 310)
        this.texture(g, 20, wx, y - 69, 78, 60, 78);
      const center = m.id === "gym" ? 800 : 640;
      this.object(g, { type: 10, x: center, y: y + h + 8, w: 100, h: 100 });
      g.fillStyle = "#d3c69c";
      g.fillRect(center - 52, y + h - 2, 104, 5);
    }
    if (m.id === "gym") {
      g.strokeStyle = "#e4d19b";
      g.lineWidth = 4;
      g.strokeRect(420, 300, 760, 450);
      g.strokeStyle = "#769397";
      g.lineWidth = 2;
      g.strokeRect(435, 315, 730, 420);
      g.beginPath();
      g.moveTo(800, 300);
      g.lineTo(800, 750);
      g.stroke();
    }
    for (const water of m.water || []) this.texture(g, 12, ...water, 64);
    for (const o of m.objects.filter((o) => o.ground)) this.object(g, o);
    for (const e of m.exits) {
      if (m.indoor && e.y < 300) {
        this.object(g, { type: 10, x: e.x, y: 234, w: 100, h: 114 });
        g.fillStyle = "#132b35";
        g.fillRect(e.x - 66, 104, 132, 23);
        g.strokeStyle = "#d2b675";
        g.lineWidth = 1;
        g.strokeRect(e.x - 66, 104, 132, 23);
        g.font = "500 11px Manrope,sans-serif";
        g.textAlign = "center";
        g.fillStyle = "#f6dfaa";
        g.fillText(e.label.replace(" de Lira", "").toUpperCase(), e.x, 120);
      }
      if (!m.indoor) {
        g.strokeStyle = "#c6ac68";
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(e.x - 20, e.y + 12);
        g.lineTo(e.x, e.y);
        g.lineTo(e.x + 20, e.y + 12);
        g.stroke();
      }
    }
    this.cache.set(world, c);
    return c;
  }
  draw(g, state, now) {
    const m = MAPS[state.world];
    g.drawImage(this.terrain(state.world), 0, 0);
    for (const water of m.water || []) {
      this.texture(g, 12 + (Math.floor(now / 500) % 3), ...water, 64);
    }
    if (m.art) {
      this.doorStates ||= new Map();
      const dt = Math.max(0, Math.min(100, now - (this.lastDoorTime ?? now)));
      this.lastDoorTime = now;
      for (const e of m.exits) {
        const rect = doorway(m, e);
        if (!rect) continue;
        const key = state.world + ":" + e.id;
        const actors = [state, state.story.lira].filter(
          (a) => a && a.visible !== false && a.world === state.world,
        );
        const target =
          state.story.openDoor === e.id ||
          actors.some((a) => Math.hypot(a.x - e.x, a.y - e.y) < 110)
            ? 1
            : 0;
        const p = doorStep(this.doorStates.get(key) || 0, target, dt);
        this.doorStates.set(key, p);
        drawSlidingDoor(g, this.terrain(state.world), rect, p);
      }
    }
    if (state.world === "forest") {
      // A few glints follow the actual river, never paint water over walkable ground.
      g.save();
      g.globalAlpha = 0.35;
      g.fillStyle = "#c4faff";
      for (let i = 0; i < 18; i++) {
        const x = 110 + i * 77 + Math.sin(now / 1100 + i) * 7,
          y = 190 + Math.sin(i * 0.8) * 30;
        g.fillRect(x, y, 9 + Math.sin(now / 500 + i) * 3, 1);
      }
      g.restore();
    }
    if (state.world === "lab") {
      for (const [flag, x, w] of [
        ["labSecondDamage", 640, 300],
        ["labDamaged", 1038, 230],
      ])
        if (state.story.flags[flag]) {
          g.save();
          g.fillStyle = "#102d4d65";
          g.fillRect(x - 28, 184, 57, 46);
          g.strokeStyle = "#0b2035";
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(x - 18, 186);
          g.lineTo(x - 3, 201);
          g.lineTo(x - 12, 212);
          g.lineTo(x + 20, 230);
          g.moveTo(x - 3, 201);
          g.lineTo(x + 22, 196);
          g.moveTo(x - 12, 212);
          g.lineTo(x - 26, 219);
          g.stroke();
          g.strokeStyle = "#d9faff";
          g.lineWidth = 0.7;
          g.beginPath();
          g.moveTo(x - 17, 186);
          g.lineTo(x - 2, 201);
          g.lineTo(x - 11, 212);
          g.lineTo(x + 21, 230);
          g.stroke();
          g.restore();
          this.object(g, { type: 19, x, y: 344, w: w * 0.85, h: 68 });
        }
    }
  }
  drawObjects(g, state) {
    for (const o of MAPS[state.world].objects.filter((o) => !o.ground))
      this.object(g, o, state);
  }
}
