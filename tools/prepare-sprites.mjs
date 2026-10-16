// Build indexed material atlases from the authored sheets. Runtime never guesses
// body regions or cuts pixels out of the player. Originals are retained.
import { chromium } from "@playwright/test";
import { writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
const root = new URL("../", import.meta.url);
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH || existsSync("/usr/bin/chromium")
    ? { executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium" }
    : {}),
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4173/");
  const result = await page.evaluate(async () => {
    const { PALETTES } = await import("/src/model.js");
    const load = (src) =>
      new Promise((yes, no) => {
        const i = new Image();
        i.onload = () => yes(i);
        i.onerror = no;
        i.src = src;
      });
    const make = (w, h) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      c.getContext("2d").imageSmoothingEnabled = false;
      return c;
    };
    const products = {},
      metadata = {};
    function hsl(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      const hi = Math.max(r, g, b),
        lo = Math.min(r, g, b),
        d = hi - lo,
        l = (hi + lo) / 2;
      let h = 0,
        s = 0;
      if (d) {
        s = d / (1 - Math.abs(2 * l - 1));
        h =
          (hi === r
            ? ((g - b) / d + 6) % 6
            : hi === g
              ? (b - r) / d + 2
              : (r - g) / d + 4) * 60;
      }
      return [h, s, l];
    }
    function colorRGB(h, s, l) {
      const c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = l - c / 2;
      const rgb =
        h < 60
          ? [c, x, 0]
          : h < 120
            ? [x, c, 0]
            : h < 180
              ? [0, c, x]
              : h < 240
                ? [0, x, c]
                : h < 300
                  ? [x, 0, c]
                  : [c, 0, x];
      return rgb.map((n) => Math.round((n + m) * 255));
    }
    const rgbHex = (hex) => hex.match(/\w\w/g).map((v) => parseInt(v, 16));
    const legacy = await (await fetch("/original/sprites_meta.json")).json();
    const old = {
      lira: {
        directions: {
          down: legacy.male.down,
          left: legacy.male.right,
          right: legacy.male.left,
          up: legacy.male.up,
        },
      },
    };
    for (const gender of ["female", "male", "lira", "female-short", "male-short"]) {
      const custom = gender !== "lira";
      const baseGender = gender.split("-")[0];
      const image = await load(
        custom
          ? `/assets/characters/source/${gender}-materials.png`
          : "/assets/male_sheet.png",
      );
      const rowDirs = custom
        ? baseGender === "female"
          ? ["down", "right", "left", "up"]
          : ["down", "left", "right", "up"]
        : Object.keys(old.lira.directions);
      const sourceRects = custom
        ? (
            await (
              await fetch("/assets/characters/source/source-rects.json")
            ).json()
          )[gender]
        : null;
      const samples = [];
      for (let row = 0; row < 4; row++)
        for (let frame = 0; frame < 4; frame++) {
          const rect = custom
            ? sourceRects[rowDirs[row]][frame]
            : old.lira.directions[rowDirs[row]][frame];
          const c = make(rect[2], rect[3]),
            ctx = c.getContext("2d");
          ctx.drawImage(image, ...rect, 0, 0, rect[2], rect[3]);
          const data = ctx.getImageData(0, 0, c.width, c.height);
          let left = c.width,
            top = c.height,
            right = 0,
            bottom = 0;
          for (let y = 0; y < c.height; y++)
            for (let x = 0; x < c.width; x++)
              if (data.data[(y * c.width + x) * 4 + 3] > 180) {
                left = Math.min(left, x);
                right = Math.max(right, x);
                top = Math.min(top, y);
                bottom = Math.max(bottom, y);
              }
          if (right - left < 20 || bottom - top < 60)
            throw new Error(`Empty sprite: ${gender}/${row}/${frame}`);
          // Anchor to the torso, never to the swinging feet.
          const torso = [];
          for (
            let y = top + Math.round((bottom - top) * 0.53);
            y < top + Math.round((bottom - top) * 0.64);
            y++
          )
            for (let x = left; x <= right; x++)
              if (data.data[(y * c.width + x) * 4 + 3] > 180) torso.push(x);
          torso.sort((a, b) => a - b);
          samples.push({
            canvas: c,
            left,
            top,
            right,
            bottom,
            anchor: torso[Math.floor(torso.length / 2)],
            dir: rowDirs[row],
            frame,
          });
        }
      const heights = samples
        .map((s) => s.bottom - s.top + 1)
        .sort((a, b) => a - b);
      const scale = 174 / heights[heights.length - 1],
        atlas = make(768, 768),
        ctx = atlas.getContext("2d");
      const directions = {};
      for (let row = 0; row < 4; row++) {
        const dir = ["down", "left", "right", "up"][row];
        directions[dir] = [];
        for (let frame = 0; frame < 4; frame++) {
          const s = samples.find((s) => s.dir === dir && s.frame === frame);
          const x = frame * 192,
            y = row * 192;
          ctx.drawImage(
            s.canvas,
            s.left,
            s.top,
            s.right - s.left + 1,
            s.bottom - s.top + 1,
            Math.round(x + 96 - (s.anchor - s.left) * scale),
            Math.round(y + 180 - (s.bottom - s.top + 1) * scale),
            Math.round((s.right - s.left + 1) * scale),
            Math.round((s.bottom - s.top + 1) * scale),
          );
          directions[dir].push([x, y, 192, 192]);
        }
      }
      const entry = {
        file: `assets/characters/layers/${gender}-base.png`,
        directions,
        anchors: Object.fromEntries(
          ["down", "left", "right", "up"].map((d) => [d, [96, 96, 96, 96]]),
        ),
        referenceHeight: 174,
        baseline: 180,
        prepared: true,
        strideWidth: 768,
      };
      entry.walkFrames = Object.fromEntries(
        ["down", "left", "right", "up"].map((dir) => [
          dir,
          (baseGender === "male" && dir !== "up") ||
          (baseGender === "female" && ["left", "right"].includes(dir))
            ? [0, 1, 0, 3]
            : [0, 1, 0, 2],
        ]),
      );
      if (!custom) {
        products[`${gender}-base.png`] = atlas.toDataURL();
        metadata[gender] = entry;
        continue;
      }
      const all = ctx.getImageData(0, 0, 768, 768),
        regions = new Uint8Array(768 * 768),
        regionNames = ["hair", "skin", "top", "bottom", "accent"];
      const light = Object.fromEntries(regionNames.map((n) => [n, []]));
      for (let i = 0; i < regions.length; i++) {
        const o = i * 4;
        if (all.data[o + 3] < 80) {
          all.data[o + 3] = 0;
          continue;
        }
        const [h, s, l] = hsl(all.data[o], all.data[o + 1], all.data[o + 2]);
        if (s < 0.18 || l < 0.13 || l > 0.94) continue;
        let region =
          h >= 258 && h < 345
            ? "hair"
            : h >= 76 && h < 185
              ? "top"
              : h >= 185 && h < 258
                ? "bottom"
                : h >= 43 && h < 76
                  ? "accent"
                  : h < 43 || h >= 345
                    ? "skin"
                    : null;
        // Neutral dark eyes and outlines retain their authored pixels.
        if (region === "skin" && l < 0.23) region = null;
        const px = ((i % 768) % 192) - 32,
          py = Math.floor(i / 768) % 192;
        if (region === "bottom" && py > 100 && py < 145 && (px < 40 || px > 90))
          region = "skin";
        if (region) {
          regions[i] = regionNames.indexOf(region) + 1;
          light[region].push(l);
        }
      }
      entry.layers = {};
      const body = make(768, 768),
        bodyCtx = body.getContext("2d"),
        bd = new ImageData(new Uint8ClampedArray(all.data), 768, 768);
      for (let i = 0; i < regions.length; i++)
        if (regions[i]) bd.data[i * 4 + 3] = 0;
      bodyCtx.putImageData(bd, 0, 0);
      products[`${gender}-base.png`] = body.toDataURL();
      const masks = {};
      for (const [ri, region] of regionNames.entries()) {
        const variants = make(3072, 768),
          vctx = variants.getContext("2d");
        light[region].sort((a, b) => a - b);
        const median =
          light[region][Math.floor(light[region].length / 2)] || 0.5;
        for (let color = 0; color < 4; color++) {
          const dest = new ImageData(768, 768),
            target = hsl(...rgbHex(PALETTES[region][color]));
          for (let i = 0; i < regions.length; i++)
            if (regions[i] === ri + 1) {
              const o = i * 4,
                [h, s, l] = hsl(all.data[o], all.data[o + 1], all.data[o + 2]);
              const rgb = colorRGB(
                target[0],
                Math.min(1, target[1] * (0.85 + 0.2 * s)),
                Math.max(0.03, Math.min(0.92, (l / median) * target[2])),
              );
              for (let ch = 0; ch < 3; ch++) dest.data[o + ch] = rgb[ch];
              dest.data[o + 3] = all.data[o + 3];
            }
          vctx.putImageData(dest, color * 768, 0);
        }
        products[`${gender}-${region}.png`] = variants.toDataURL();
        entry.layers[region] =
          `assets/characters/layers/${gender}-${region}.png`;
        masks[region] = light[region].length;
      }
      entry.materialPixels = masks;
      metadata[gender] = entry;
    }
    return { products, metadata };
  });
  for (const [name, data] of Object.entries(result.products))
    await writeFile(
      new URL(`assets/characters/layers/${name}`, root),
      Buffer.from(data.split(",")[1], "base64"),
    );
  const manifest = JSON.parse(
    await readFile(new URL("assets/sprites.json", root)),
  );
  Object.assign(manifest, result.metadata);
  await writeFile(
    new URL("assets/sprites.json", root),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log(
    "Sprites preparados:",
    Object.entries(result.metadata).map(([n, v]) => ({
      name: n,
      materials: v.materialPixels,
      referenceHeight: v.referenceHeight,
    })),
  );
} finally {
  await browser.close();
}
