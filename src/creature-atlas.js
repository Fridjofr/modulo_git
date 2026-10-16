// Original Primal sheets only. No generated geometry, limb stretching or runtime
// leg cut-outs. Anchors are the midpoint of the weight-bearing paws, not the
// moving tail, leaf crown or changing transparent bounding box.
export const CREATURE_ANCHORS = {
  fire: {
    down: [42, 43, 43, 43],
    right: [53, 49, 51, 51],
    up: [42, 40, 44, 43],
  },
  water: {
    down: [32, 33, 31, 32],
    left: [53, 49, 54, 49],
    right: [51, 53, 51, 52],
    up: [36, 48, 44, 47],
  },
  plant: {
    down: [57, 59, 55, 52],
    right: [74, 78, 91, 106],
    up: [56, 57, 55, 54],
  },
};
export class CreatureAtlas {
  constructor(images, meta) {
    this.frames = {};
    for (const key of ["fire", "water", "plant"]) {
      const data = meta[key];
      this.frames[key] = {};
      for (const dir of ["down", "left", "right", "up"]) {
        const sourceDir = data.directions[dir] ? dir : "right";
        let flip = !data.directions[dir] && dir === "left";
        if (data.mirrorSide && ["left", "right"].includes(dir)) flip = !flip;
        this.frames[key][dir] = data.directions[sourceDir].map(
          ([x, y, w, h], index) => {
            const c = document.createElement("canvas");
            c.width = w;
            c.height = h;
            const g = c.getContext("2d");
            g.imageSmoothingEnabled = false;
            if (flip) {
              g.translate(w, 0);
              g.scale(-1, 1);
            }
            g.drawImage(images[key], x, y, w, h, 0, 0, w, h);
            g.setTransform(1, 0, 0, 1, 0, 0);
            // Remove translucent export halos, leaving every opaque authored pixel.
            const pixels = g.getImageData(0, 0, w, h);
            let baseline = 0;
            for (let i = 0; i < w * h; i++) {
              const a = i * 4 + 3;
              if (pixels.data[a] < 224) pixels.data[a] = 0;
              else {
                pixels.data[a] = 255;
                baseline = Math.max(baseline, Math.floor(i / w));
              }
            }
            g.putImageData(pixels, 0, 0);
            const anchor = CREATURE_ANCHORS[key][sourceDir][index];
            return {
              canvas: c,
              w,
              h,
              anchor: flip ? w - anchor : anchor,
              baseline: baseline + 1,
              referenceHeight: data.referenceHeight,
            };
          },
        );
      }
    }
  }
  frame(key, dir, index) {
    const frames = this.frames[key][dir];
    return frames[index % frames.length];
  }
}
