import { test, expect } from "@playwright/test";
const snapshot = (page) => page.evaluate(() => window.zimonsDebug.snapshot());
async function openFolder(page, name) {
  if (await page.locator(`#${name}-panel`).isVisible()) return;
  if (await page.locator("#folder-back").isVisible())
    await page.locator("#folder-back").click();
  await page.locator(`[data-battle-tab="${name}"]`).click();
}
async function training(page) {
  await page.goto("/?debug=1");
  await expect(page.locator("#title")).toHaveClass(/active/);
  await page.evaluate(async () => {
    const { newGame, SAVE_KEY } = await import("/src/model.js");
    const state = newGame();
    Object.assign(state, {
      zlink: true,
      starter: "plant",
      quest: "battle",
      world: "lab",
      x: 862,
      y: 423,
    });
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  });
  await page.reload();
  await page.locator("#title-continue").click();
  await page.keyboard.press("e");
  await page
    .getByRole("button", { name: "Iniciar treinamento", exact: true })
    .click();
  await expect
    .poll(async () => (await snapshot(page)).battle.phase)
    .toBe("player");
}
test("Batalha, Bolsa e Sair: abertura gratuita, ataque animado, consumo e saída sem recompensa", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await training(page);
  const initial = (await snapshot(page)).battle;
  expect(initial.turn).toBe(1);
  expect(initial.player.transformed).toBe(true);
  expect(initial.player.energy).toBe(60);
  expect(initial.player.hp).toBe(initial.player.maxHP);
  expect(initial.log.some((line) => line.includes("de dano"))).toBe(false);
  await openFolder(page, "bag");
  await expect(page.locator("#bag-panel")).toBeVisible();
  await expect(page.locator("[data-action=tonic]")).toBeDisabled();
  await expect(page.locator("#fight-panel")).toBeHidden();
  await openFolder(page, "fight");
  const image = () =>
    page.locator("#battle-canvas").evaluate((c) => c.toDataURL());
  const before = await image();
  await page.locator("[data-action=attack]").click();
  await expect(page.locator("[data-action=attack]")).toBeDisabled();
  await expect(page.locator("[data-battle-tab=exit]")).toBeDisabled();
  await page.waitForTimeout(180);
  expect(await image()).not.toBe(before);
  await page.screenshot({ path: "docs/screenshots/v04-05-ataque.png" });
  await expect.poll(async () => (await snapshot(page)).battle.turn).toBe(2);
  const { state, battle } = await snapshot(page);
  expect(battle.player.hp).toBeLessThan(battle.player.maxHP);
  await openFolder(page, "bag");
  await page.screenshot({ path: "docs/screenshots/v04-09-bolsa.png" });
  await page.locator("[data-action=tonic]").click();
  await expect.poll(async () => (await snapshot(page)).battle.turn).toBe(3);
  expect((await snapshot(page)).state.inventory.tonic).toBe(
    state.inventory.tonic - 1,
  );
  await openFolder(page, "swap");
  await page.locator("[data-action=transform]").click();
  await expect.poll(async () => (await snapshot(page)).battle.turn).toBe(4);
  expect((await snapshot(page)).battle.player.transformed).toBe(false);
  await openFolder(page, "exit");
  await page.locator("#leave-training").click();
  await page
    .getByRole("button", { name: "Continuar combate", exact: true })
    .click();
  expect((await snapshot(page)).scene).toBe("battle");
  await page.locator("#leave-training").click();
  await page
    .getByRole("button", { name: "Voltar à Academia", exact: true })
    .click();
  await expect(page.locator("#world")).toHaveClass(/active/);
  const end = (await snapshot(page)).state;
  expect(end.xp).toBe(0);
  expect(end.quest).toBe("battle");
  expect(end.inventory.tonic).toBe(state.inventory.tonic - 1);
  expect(end.transformed).toBe(false);
});
test("materiais dos dois protagonistas: paletas preservam silhueta completa e pivôs nas quatro direções", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#title")).toHaveClass(/active/);
  const errors = await page.evaluate(async () => {
    const { Assets } = await import("/src/assets.js");
    const { DEFAULT_APPEARANCE, PALETTES } = await import("/src/model.js");
    const assets = new Assets();
    await assets.load();
    const errors = [];
    const pixels = (canvas) =>
      canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height)
        .data;
    for (const gender of ["male", "female"])
      for (const dir of ["down", "left", "right", "up"])
        for (let frame = 0; frame < 4; frame++) {
          const look = { ...DEFAULT_APPEARANCE, gender, style: 0, bag: 0 };
          const base = assets.frame(gender, dir, frame, look),
            rgba = pixels(base.canvas);
          let minX = 192,
            maxX = 0,
            minY = 192,
            maxY = 0,
            count = 0;
          for (let y = 0; y < 192; y++)
            for (let x = 0; x < 192; x++)
              if (rgba[(y * 192 + x) * 4 + 3] > 180) {
                count++;
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
              }
          if (count < 5000 || minX < 2 || maxX > 189 || minY < 2 || maxY > 181)
            errors.push(`${gender}/${dir}/${frame}: corpo cortado ou ausente`);
          if (
            base.anchor !== 96 ||
            base.baseline !== 180 ||
            base.referenceHeight !== 174
          )
            errors.push("pivô variável");
          for (const region of Object.keys(PALETTES))
            for (let color = 0; color < 4; color++) {
              const changed = pixels(
                assets.frame(gender, dir, frame, { ...look, [region]: color })
                  .canvas,
              );
              for (let i = 3; i < rgba.length; i += 4)
                if (changed[i] !== rgba[i]) {
                  errors.push(
                    `${gender}/${dir}/${frame}/${region}/${color}: buraco na silhueta`,
                  );
                  break;
                }
            }
        }
    return errors;
  });
  expect(errors).toEqual([]);
});
test("praça aberta: humanos e Zimons têm diálogos próprios e Lira é única", async ({
  page,
}) => {
  await page.goto("/?debug=1");
  await page.locator("#title-new").click();
  await page.locator("#start").click();
  await expect(page.locator(".npc-name")).toHaveCount(6);
  await expect(
    page.locator(".npc-name").filter({ hasText: "Mentora Lira" }),
  ).toHaveCount(1);
  // Reach both actors by keyboard on the open paving, without rewriting an active save.
  async function move(axis, target) {
    const initial = (await snapshot(page)).state[axis];
    if (Math.abs(initial - target) < 4) return;
    const positive = initial < target;
    await page.keyboard.down(
      axis === "x" ? (positive ? "d" : "a") : positive ? "s" : "w",
    );
    await page.waitForFunction(
      ({ axis, target, positive }) => {
        const value = window.zimonsDebug.snapshot().state[axis];
        return positive ? value >= target - 2 : value <= target + 2;
      },
      { axis, target, positive },
    );
    await page.keyboard.up(
      axis === "x" ? (positive ? "d" : "a") : positive ? "s" : "w",
    );
  }
  await move("y", 445);
  for (const [x, y, name, text] of [
    [455, 445, "NICO", "Primeiro dia"],
    [1045, 365, "CAIO · PYRON", "estas chamas são parte de mim"],
  ]) {
    await move("x", x);
    if (Math.abs((await snapshot(page)).state.y - y) > 4) await move("y", y);
    const id = name === "NICO" ? "nico" : "caio";
    const actor = (await snapshot(page)).actors.find((n) => n.id === id);
    await move("x", actor.x);
    await page.keyboard.press("e");
    await expect(page.locator("#dialogue")).toBeVisible();
    await expect(page.locator("#dialogue")).toContainText(name);
    await expect(page.locator("#dialogue")).toContainText(text);
    for (let n = 0; n < 5 && (await page.locator("#dialogue").isVisible()); n++)
      await page.locator("#dialogue-next").click();
    await expect(page.locator("#dialogue")).toBeHidden();
  }
});
