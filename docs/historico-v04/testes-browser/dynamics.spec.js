import { test, expect } from "@playwright/test";
const snap = (p) => p.evaluate(() => window.zimonsDebug.snapshot());
async function fixture(page, values = {}) {
  await page.goto("/?debug=1");
  await expect(page.locator("#title")).toHaveClass(/active/);
  await page.evaluate(async (values) => {
    const { newGame, SAVE_KEY } = await import("/src/model.js");
    const s = newGame();
    Object.assign(s, {
      zlink: true,
      starter: "water",
      quest: "complete",
      world: "lab",
      x: 862,
      y: 423,
      ...values,
    });
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  }, values);
  await page.reload();
  await page.locator("#title-continue").click();
}
async function folder(page, name) {
  if (await page.locator(`#${name}-panel`).isVisible()) return;
  if (await page.locator("#folder-back").isVisible())
    await page.locator("#folder-back").click();
  await page.locator(`[data-battle-tab=${name}]`).click();
}
async function lira(page) {
  await page.keyboard.press("e");
  await page
    .getByRole("button", { name: "Iniciar treinamento", exact: true })
    .click();
  await expect.poll(async () => (await snap(page)).battle.phase).toBe("player");
}
test("três formas, pastas exclusivas, nomes e afinidades nos ataques e Troca com resposta inimiga", async ({
  page,
}) => {
  await fixture(page, {
    forms: {
      water: { level: 8, xp: 0 },
      fire: { level: 5, xp: 0 },
      plant: { level: 5, xp: 0 },
    },
    level: 8,
  });
  await lira(page);
  expect((await snap(page)).rendering.available).toBe(true);
  expect((await snap(page)).rendering.triangles).toBeGreaterThan(1000);
  await expect(page.locator("#combat-player")).toHaveText("Marivon");
  await expect(page.locator("#combat-enemy")).toHaveText("Pyron");
  await expect(page.locator("#home-panel")).toBeVisible();
  await folder(page, "fight");
  await expect(page.locator("#home-panel")).toBeHidden();
  await expect(page.locator("#skill-details")).toContainText("Água");
  await expect(page.locator("#skill-details")).toContainText("↑ Vantagem");
  await page.setViewportSize({ width: 800, height: 450 });
  const outside = await page.evaluate(() => {
    const app = document.querySelector("#app").getBoundingClientRect();
    return [...document.querySelectorAll("#fight-panel button")]
      .filter((n) => !n.hidden)
      .filter((n) => n.getBoundingClientRect().bottom > app.bottom + 0.5)
      .length;
  });
  expect(outside).toBe(0);
  await page.screenshot({ path: "docs/screenshots/v04-12-batalha-800.png" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await folder(page, "swap");
  await expect(page.locator("#fight-panel")).toBeHidden();
  await expect(page.locator("#bag-panel")).toBeHidden();
  await expect(page.locator("[data-form]")).toHaveCount(3);
  const before = (await snap(page)).battle.player.hp;
  await page.locator("[data-form=fire]").click();
  await expect.poll(async () => (await snap(page)).battle.turn).toBe(2);
  const after = await snap(page);
  expect(after.battle.starter).toBe("fire");
  expect(after.battle.player.level).toBe(5);
  expect(after.battle.player.hp).toBeLessThan(before);
  expect(after.battle.player.energy).toBe(60);
  await folder(page, "fight");
  await expect(page.locator("[data-action=skill]")).toBeHidden();
  await expect(page.locator("[data-action=special]")).toBeHidden();
  await expect(page.locator("#next-move")).toContainText("nível 6");
});
test("NPC caminha, para e olha para o jogador; duelo usa a praça e retorna ao mesmo local", async ({
  page,
}) => {
  await fixture(page, { world: "plaza", x: 640, y: 640 });
  const start = (await snap(page)).actors.find((n) => n.id === "nico");
  await expect
    .poll(async () =>
      Math.abs(
        (await snap(page)).actors.find((n) => n.id === "nico").x - start.x,
      ),
    )
    .toBeGreaterThan(3);
  // Reinitialize from the title so normal pagehide saving cannot overwrite the fixture.
  await page.reload();
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("zimons.academia.v2"));
    s.x = 455;
    s.y = 445;
    localStorage.setItem("zimons.academia.v2", JSON.stringify(s));
  });
  await page.reload();
  await page.locator("#title-continue").click();
  await expect
    .poll(
      async () => (await snap(page)).actors.find((n) => n.id === "nico").dir,
    )
    .toBe("down");
  expect((await snap(page)).actors.find((n) => n.id === "nico").moving).toBe(
    false,
  );
  await page.keyboard.press("e");
  await page.locator("#dialogue-next").click();
  await page
    .getByRole("button", { name: "Desafiar para um duelo", exact: true })
    .click();
  await expect.poll(async () => (await snap(page)).battle.phase).toBe("player");
  expect((await snap(page)).battle.world).toBe("plaza");
  expect((await snap(page)).battle.opponentId).toBe("nico");
  await expect(page.locator("#battle-location")).toContainText("PRAÇA");
  await page.screenshot({ path: "docs/screenshots/v04-10-duelo-praca.png" });
  await folder(page, "exit");
  await page.locator("#leave-training").click();
  await page
    .getByRole("button", { name: "Voltar à Academia", exact: true })
    .click();
  expect((await snap(page)).state.world).toBe("plaza");
  expect((await snap(page)).state.x).toBe(455);
  expect((await snap(page)).state.y).toBe(445);
});
test("música começa com gesto, sintetiza notas e conserva preferência de silêncio", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const proto = AudioContext.prototype,
      old = proto.createOscillator;
    proto.createOscillator = function (...args) {
      window.__notes = (window.__notes || 0) + 1;
      return old.apply(this, args);
    };
  });
  await page.goto("/?debug=1");
  await expect(page.locator("#title")).toHaveClass(/active/);
  expect((await snap(page)).audio.started).toBe(false);
  await page.locator("#title-new").click();
  await expect
    .poll(() => page.evaluate(() => window.__notes || 0))
    .toBeGreaterThan(4);
  expect((await snap(page)).audio.state).toBe("running");
  await page.locator("#music-button").click();
  await expect(page.locator("#music-button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.reload();
  await expect(page.locator("#music-button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  expect((await snap(page)).audio.started).toBe(false);
  await page.locator("#music-button").click();
  await expect.poll(async () => (await snap(page)).audio.state).toBe("running");
});
test("sequência completa: provocação, gesto, energia e turno 1 sem ataque gratuito da IA", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await fixture(page);
  await page.keyboard.press("e");
  await page
    .getByRole("button", { name: "Iniciar treinamento", exact: true })
    .click();
  await expect(page.locator("#intro-text")).toContainText("pegar leve");
  await expect(page.locator("#intro-skip")).toBeVisible();
  const before = await snap(page);
  expect(before.battle.phase).toBe("intro");
  expect(before.battle.player.transformed).toBe(false);
  await page.waitForTimeout(2800);
  await page.screenshot({ path: "docs/screenshots/v04-02-relogio.png" });
  expect((await snap(page)).battle.phase).toBe("intro");
  await expect.poll(async () => (await snap(page)).battle.phase).toBe("player");
  const after = await snap(page);
  expect(after.battle.turn).toBe(1);
  expect(after.battle.player.hp).toBe(after.battle.player.maxHP);
  expect(after.battle.player.energy).toBe(60);
  expect(after.battle.player.transformed).toBe(true);
  expect(after.battle.log.some((l) => l.includes("de dano"))).toBe(false);
});
test("modo sem WebGL mantém batalha jogável e cenário do laboratório", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === "webgl2" || type === "webgl"
        ? null
        : get.call(this, type, ...args);
    };
  });
  await fixture(page);
  await lira(page);
  expect((await snap(page)).rendering.available).toBe(false);
  await expect(page.locator("#battle-location")).toContainText("LABORATÓRIO");
  await folder(page, "fight");
  await page.locator("[data-action=attack]").click();
  await expect.poll(async () => (await snap(page)).battle.turn).toBe(2);
  expect((await snap(page)).battle.opponent.hp).toBeLessThan(
    (await snap(page)).battle.opponent.maxHP,
  );
});
test("penteado muda cabelo e preserva a bolsa; corte curto acompanha o personagem no mapa", async ({
  page,
}) => {
  await page.goto("/?debug=1");
  await page.locator("#title-new").click();
  await page.locator('[data-option=accent][data-value="2"]').click();
  await page.getByRole("button", { name: "Penteado: próximo" }).click();
  await expect(page.locator("#style-value")).toHaveText("Curto");
  await expect(page.locator("#bag-value")).toHaveText("Bolsa lateral");
  const problems = await page.evaluate(async () => {
    const { Assets } = await import("/src/assets.js"),
      { DEFAULT_APPEARANCE } = await import("/src/model.js");
    const a = new Assets();
    await a.load();
    const errors = [];
    for (const gender of ["male", "female"]) {
      const appearance = { ...DEFAULT_APPEARANCE, gender, accent: 2 };
      const old = a
          .frame(gender, "down", 0, appearance)
          .canvas.getContext("2d"),
        short = a
          .frame(gender, "down", 0, { ...appearance, style: 1 })
          .canvas.getContext("2d");
      const hair0 = old.getImageData(0, 0, 192, 90).data,
        hair1 = short.getImageData(0, 0, 192, 90).data;
      let changes = 0;
      for (let i = 0; i < hair0.length; i++)
        if (hair0[i] !== hair1[i]) changes++;
      if (changes < 1000) errors.push(gender + ": cabelo não mudou");
      const bag0 = old.getImageData(118, 135, 5, 4).data,
        bag1 = short.getImageData(118, 135, 5, 4).data;
      if (bag0.some((v, i) => v !== bag1[i]))
        errors.push(gender + ": bolsa mudou");
    }
    return errors;
  });
  expect(problems).toEqual([]);
  await page.locator("#start").click();
  const { appearance } = (await snap(page)).state;
  expect(appearance.style).toBe(1);
  expect(appearance.accent).toBe(2);
  expect(appearance.bag).toBe(1);
  await page.keyboard.down("w");
  await page.waitForTimeout(200);
  await page.keyboard.up("w");
  await page.screenshot({ path: "docs/screenshots/v04-11-cabelo-no-mapa.png" });
});
