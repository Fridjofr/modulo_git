import { test, expect } from "@playwright/test";
test("Zimons usam pixels originais, poses distintas e índices inteiros nas quatro direções", async ({
  page,
}) => {
  await page.goto("/?debug=1");
  await expect(page.locator("#title")).toHaveClass(/active/);
  const failures = await page.evaluate(async () => {
    const { Assets } = await import("/src/assets.js");
    const a = new Assets();
    await a.load();
    const problems = [];
    for (const key of ["fire", "water", "plant"])
      for (const dir of ["down", "up", "left", "right"]) {
        const hashes = new Set(),
          data = a.meta[key];
        const srcdir = data.directions[dir] ? dir : "right";
        let flip = !data.directions[dir] && dir === "left";
        if (data.mirrorSide && ["left", "right"].includes(dir)) flip = !flip;
        for (let phase = 0; phase < 4; phase++) {
          const index = a.walkIndex(key, dir, phase);
          if (!Number.isInteger(index))
            problems.push(key + "/" + dir + ": índice não inteiro");
          const f = a.frame(key, dir, index),
            r = data.directions[srcdir][index],
            c = document.createElement("canvas");
          c.width = r[2];
          c.height = r[3];
          const g = c.getContext("2d");
          if (flip) {
            g.translate(c.width, 0);
            g.scale(-1, 1);
          }
          g.drawImage(a.images[key], ...r, 0, 0, c.width, c.height);
          const original = g.getImageData(0, 0, c.width, c.height).data,
            actual = f.canvas
              .getContext("2d")
              .getImageData(0, 0, f.w, f.h).data;
          let h = 2166136261,
            bottom = 0;
          for (let n = 0; n < actual.length; n += 4) {
            if (actual[n + 3]) {
              if (
                original[n + 3] < 224 ||
                actual[n] !== original[n] ||
                actual[n + 1] !== original[n + 1] ||
                actual[n + 2] !== original[n + 2]
              )
                problems.push(key + "/" + dir + ": pixel inventado");
              bottom = Math.max(bottom, Math.floor(n / 4 / f.w));
            }
            h = Math.imul(h ^ actual[n], 16777619);
          }
          if (f.baseline !== bottom + 1)
            problems.push(key + "/" + dir + ": patas fora do chão");
          if (f.referenceHeight !== data.referenceHeight)
            problems.push(key + ": escala alterada");
          hashes.add(h);
        }
        if (hashes.size < 3)
          problems.push(key + "/" + dir + ": menos de três poses desenhadas");
      }
    return [...new Set(problems)];
  });
  expect(failures).toEqual([]);
});
