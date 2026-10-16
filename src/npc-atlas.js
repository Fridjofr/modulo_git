import { drawHumanGait } from "./human-rig.js";
import { extractSprite } from "./character-atlas.js";
const IDS = ["nico", "nina", "caio", "mara", "aya", "iris"],
  DIRS = ["down", "left", "right", "up"];
const make = () =>
  Object.assign(document.createElement("canvas"), { width: 192, height: 192 });
export class NpcAtlas {
  constructor(image, images = {}) {
    this.authored = {};
    this.cache = new Map();
    this.frames = {};
    for (let col = 0; col < IDS.length; col++)
      this.frames[IDS[col]] = DIRS.map((dir, row) => {
        const rows = [0, 286, 546, 800, 1024],
          f = extractSprite(image, [
            col * 256,
            rows[row],
            256,
            rows[row + 1] - rows[row],
          ]),
          c = make(),
          g = c.getContext("2d"),
          scale = 174 / (f.b - f.t + 1),
          w = (f.r - f.l + 1) * scale;
        g.imageSmoothingEnabled = false;
        g.drawImage(
          f.canvas,
          f.l,
          f.t,
          f.r - f.l + 1,
          f.b - f.t + 1,
          96 - w / 2,
          6,
          w,
          174,
        );
        return c;
      });
    if (images.maraWalk) this.prepareAuthored("mara", images.maraWalk);
    if (images.ayaWalk) this.prepareAuthored("aya", images.ayaWalk);
  }
  prepareAuthored(id, image) {
    const cols = [180, 440, 730, 1020, 1350],
      rows = [0, 285, 543, 803, 1086];
    const pieces = DIRS.map((dir, row) =>
      Array.from({ length: 4 }, (_, col) =>
        extractSprite(image, [
          cols[col],
          rows[row],
          cols[col + 1] - cols[col],
          rows[row + 1] - rows[row],
        ]),
      ),
    );
    const scale = 174 / Math.max(...pieces.flat().map((f) => f.b - f.t + 1));
    this.authored[id] = pieces.map((row) =>
      row.map((f) => {
        const c = make(),
          g = c.getContext("2d");
        g.imageSmoothingEnabled = false;
        const w = (f.r - f.l + 1) * scale,
          h = (f.b - f.t + 1) * scale;
        g.drawImage(
          f.canvas,
          f.l,
          f.t,
          f.r - f.l + 1,
          f.b - f.t + 1,
          96 - w / 2,
          180 - h,
          w,
          h,
        );
        return {
          canvas: c,
          w: 192,
          h: 192,
          anchor: 96,
          baseline: 180,
          referenceHeight: 174,
        };
      }),
    );
  }
  frame(key, dir, index = 0) {
    const id = key.replace("npc:", ""),
      signature = [id, dir, index].join(":");
    if (this.cache.has(signature)) return this.cache.get(signature);
    if (this.authored[id])
      return this.authored[id][DIRS.indexOf(dir)][index % 4];
    const source = this.frames[id][DIRS.indexOf(dir)],
      c = make(),
      g = c.getContext("2d"),
      stride = [0, 1, 0, -1][index % 4];
    g.imageSmoothingEnabled = false;
    drawHumanGait(g, source, dir, index);
    const frame = {
      canvas: c,
      w: 192,
      h: 192,
      anchor: 96,
      baseline: 180,
      referenceHeight: 174,
    };
    this.cache.set(signature, frame);
    return frame;
  }
}
