import { test, expect } from "@playwright/test";
const snapshot = (page) => page.evaluate(() => window.zimonsDebug.snapshot());
async function openCreator(page) {
  await expect(page.locator("#title")).toHaveClass(/active/);
  await page.locator("#title-new").click();
  await expect(page.locator("#creator")).toHaveClass(/active/);
}
async function openFolder(page, name) {
  if (await page.locator(`#${name}-panel`).isVisible()) return;
  if (await page.locator("#folder-back").isVisible())
    await page.locator("#folder-back").click();
  await page.locator(`[data-battle-tab="${name}"]`).click();
}
async function battleAction(page, action) {
  await openFolder(
    page,
    action === "tonic" ? "bag" : action === "transform" ? "swap" : "fight",
  );
  await page.locator(`[data-action="${action}"]`).click();
}
async function move(page, axis, target) {
  const current = (await snapshot(page)).state[axis];
  if (Math.abs(current - target) < 4) return;
  const positive = current < target,
    key = axis === "x" ? (positive ? "d" : "a") : positive ? "s" : "w";
  await page.keyboard.down(key);
  try {
    await page.waitForFunction(
      ({ axis, target, positive }) => {
        const value = window.zimonsDebug.snapshot().state[axis];
        return positive ? value >= target - 2 : value <= target + 2;
      },
      { axis, target, positive },
      { timeout: 10000 },
    );
  } finally {
    await page.keyboard.up(key);
  }
}
async function finishDialogue(page) {
  for (let i = 0; i < 8; i++) {
    if (!(await page.locator("#dialogue").isVisible())) return;
    if (await page.locator("#dialogue-next").isVisible())
      await page.locator("#dialogue-next").click();
    else return;
  }
}
async function goLab(page) {
  await move(page, "x", 640);
  await move(page, "y", 155);
  await page.keyboard.press("e");
}
async function newJourney(page, gender = "female") {
  await page.goto("/?debug=1");
  await openCreator(page);
  await page.locator(`[data-gender="${gender}"]`).click();
  await page.locator("#player-name").fill("Nara");
  await page.locator('[data-option="hair"][data-value="2"]').click();
  await page.locator('[data-option="top"][data-value="1"]').click();
  await page.locator("#start").click();
}
async function chooseForm(page, key = "fire") {
  // Direct route over clear paving; the former planters are outside the path.
  await move(page, "y", 380);
  await move(page, "x", 695);
  await page.keyboard.press("e");
  await finishDialogue(page);
  expect((await snapshot(page)).state.quest).toBe("lab");
  await goLab(page);
  await finishDialogue(page);
  expect((await snapshot(page)).state.world).toBe("lab");
  expect((await snapshot(page)).state.zlink).toBe(false);
  await move(page, "y", 454);
  await page.keyboard.press("e");
  await expect(page.locator("#sync-pulse")).toBeVisible();
  // A missed pulse is recoverable, without granting the device prematurely.
  await page.waitForFunction(
    () => document.querySelector("#sync-pulse").dataset.inRange === "false",
  );
  await page.locator("#sync-pulse").click();
  expect((await snapshot(page)).state.zlink).toBe(false);
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(370);
    await page.waitForFunction(
      () => document.querySelector("#sync-pulse")?.dataset.inRange === "true",
    );
    await page.locator("#sync-pulse").click();
  }
  await finishDialogue(page);
  await expect(page.locator("#starters")).toHaveClass(/active/);
  await page.locator(`[data-starter="${key}"]`).click();
  await page.locator("#confirm-starter").click();
  await finishDialogue(page);
  expect((await snapshot(page)).state.starter).toBe(key);
}
async function firstTransformation(page) {
  await move(page, "y", 592);
  await page.keyboard.press("e");
  await expect
    .poll(async () => (await snapshot(page)).state.world)
    .toBe("plaza");
  await page.keyboard.press("t");
  await expect
    .poll(async () => (await snapshot(page)).state.transformed)
    .toBe(true);
  expect((await snapshot(page)).state.quest).toBe("battle");
  await page.screenshot({ path: "docs/screenshots/03-transformacao.png" });
  await page.keyboard.press("t");
  await expect
    .poll(async () => (await snapshot(page)).state.transformed)
    .toBe(false);
}
async function initiateTraining(page) {
  await goLab(page);
  await move(page, "y", 454);
  await move(page, "x", 860);
  await move(page, "y", 416);
  await page.keyboard.press("e");
  await page
    .getByRole("button", { name: "Iniciar treinamento", exact: true })
    .click();
  await expect
    .poll(async () => (await snapshot(page)).battle.phase)
    .toBe("player");
  await openFolder(page, "fight");
  await expect(page.locator('[data-action="attack"]')).toBeEnabled();
  const b = (await snapshot(page)).battle;
  expect(b.turn).toBe(1);
  expect(b.player.transformed).toBe(true);
  expect(b.player.hp).toBe(b.player.maxHP);
  expect(b.player.energy).toBe(60);
  expect(b.opponent.hp).toBe(b.opponent.maxHP);
  expect(b.log.some((line) => /de dano/.test(line))).toBe(false);
}
test("jornada real: personalização → missão → Z-Link → transformação → vitória → save", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const missing = [];
  page.on("response", (r) => {
    if (r.status() >= 400) missing.push(r.url());
  });
  await newJourney(page, "male");
  const before = (await snapshot(page)).state.appearance;
  await page.keyboard.press("t");
  expect((await snapshot(page)).state.transformed).toBe(false);
  await chooseForm(page, "fire");
  await firstTransformation(page);
  await initiateTraining(page);
  await expect(page.locator('[data-action="special"]')).toBeHidden();
  // Many rapid clicks still execute exactly one player action and one enemy response.
  const hp = (await snapshot(page)).battle.opponent.hp;
  await page.locator('[data-action="attack"]').evaluate((button) => {
    for (let i = 0; i < 12; i++) button.click();
  });
  await expect.poll(async () => (await snapshot(page)).battle.turn).toBe(2);
  expect((await snapshot(page)).battle.opponent.hp).toBeLessThan(hp);
  expect(
    (await snapshot(page)).battle.log.filter((s) =>
      s.startsWith("Você: Impacto"),
    ).length,
  ).toBe(1);
  await page.screenshot({ path: "docs/screenshots/04-batalha.png" });
  for (let i = 0; i < 18; i++) {
    const b = (await snapshot(page)).battle;
    if (b.result) break;
    await expect
      .poll(async () => (await snapshot(page)).battle.phase)
      .toBe("player");
    const { battle: current, state } = await snapshot(page);
    const action =
      current.player.hp < 45 && state.inventory.tonic
        ? "tonic"
        : current.player.level >= 8 && current.player.energy >= 30
          ? "special"
          : current.player.level >= 6 && current.player.energy >= 14
            ? "skill"
            : "attack";
    await battleAction(page, action);
    await expect
      .poll(async () => {
        const b = (await snapshot(page)).battle;
        return b.result || b.phase === "player";
      })
      .toBeTruthy();
  }
  await expect(page.locator("#result-title")).toHaveText("Sintonia alcançada.");
  const final = (await snapshot(page)).state;
  expect(final.quest).toBe("complete");
  expect(final.level).toBe(6);
  expect(final.xp).toBe(80);
  expect(final.appearance).toEqual(before);
  await page.screenshot({ path: "docs/screenshots/05-vitoria.png" });
  await page.locator("#return-world").click();
  await page.reload();
  await expect(page.locator("#title-continue")).toBeVisible();
  await page.locator("#title-continue").click();
  const restored = (await snapshot(page)).state;
  expect(restored.quest).toBe("complete");
  expect(restored.appearance).toEqual(before);
  expect(restored.starter).toBe("fire");
  expect(errors).toEqual([]);
  expect(missing).toEqual([]);
});
test("exploradora: todas as opções mudam a prévia, seleção e save preservam aparência", async ({
  page,
}) => {
  await page.goto("/?debug=1");
  await openCreator(page);
  // Freeze the idle animation to compare only customization, not consecutive animation frames.
  await page.emulateMedia({ reducedMotion: "reduce" });
  const image = () =>
    page.locator("#preview").evaluate(async (c) => {
      const data = c
        .getContext("2d")
        .getImageData(0, 0, c.width, c.height).data;
      const hash = await crypto.subtle.digest("SHA-256", data);
      return [...new Uint8Array(hash)]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
    });
  for (const key of ["hair", "top", "bottom", "skin", "accent"]) {
    const initial = await image();
    await page.locator(`[data-option="${key}"][data-value="2"]`).click();
    await expect.poll(image).not.toBe(initial);
  }
  const initial = await image();
  await page.getByRole("button", { name: "Penteado: próximo" }).click();
  await expect.poll(image).not.toBe(initial);
  const withBag = await image();
  await page.getByRole("button", { name: "Bolsa / mochila: próximo" }).click();
  await expect.poll(image).not.toBe(withBag);
  await page.locator("#start").click();
  expect((await snapshot(page)).state.appearance.gender).toBe("female");
  await page.keyboard.down("a");
  await page.waitForTimeout(1500);
  await page.keyboard.up("a");
  expect((await snapshot(page)).state.x).toBeGreaterThanOrEqual(579);
  await page.keyboard.press("i");
  await expect(page.locator("#modal-title")).toHaveText("Sua bolsa");
  await expect(page.locator("#modal-body")).toContainText("Ainda não obtido");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Salvar agora" }).click();
  await page.reload();
  await page.locator("#title-continue").click();
  const a = (await snapshot(page)).state.appearance;
  expect(a.hair).toBe(2);
  expect(a.style).toBe(1);
  expect(a.bag).toBe(2);
});
for (const key of ["water", "plant"])
  test(`${key}: transformação no mapa e batalha completas com derrota e nova tentativa`, async ({
    page,
  }) => {
    // Fixture represents a legitimately completed synchronization; the first test covers obtaining it through the UI.
    await page.goto("/?debug=1");
    await page.evaluate(async (key) => {
      const { newGame, SAVE_KEY } = await import("/src/model.js");
      const s = newGame();
      Object.assign(s, {
        zlink: true,
        starter: key,
        level: 8,
        forms: { [key]: { level: 8, xp: 0 } },
        quest: "battle",
        world: "lab",
        x: 862,
        y: 423,
      });
      localStorage.setItem(SAVE_KEY, JSON.stringify(s));
    }, key);
    await page.reload();
    await page.locator("#title-continue").click();
    await page.keyboard.press("t");
    await expect
      .poll(async () => (await snapshot(page)).state.transformed)
      .toBe(true);
    await page.keyboard.press("e");
    await page
      .getByRole("button", { name: "Iniciar treinamento", exact: true })
      .click();
    await expect
      .poll(async () => (await snapshot(page)).battle.phase)
      .toBe("player");
    await openFolder(page, "fight");
    await expect(page.locator('[data-action="guard"]')).toBeEnabled();
    // Refusing to attack eventually loses; the complete defeat branch must remain playable.
    for (let i = 0; i < 45; i++) {
      if ((await snapshot(page)).battle.result) break;
      await openFolder(page, "swap");
      await expect(page.locator('[data-action="transform"]')).toBeEnabled();
      await battleAction(page, "transform");
      await expect
        .poll(async () => {
          const b = (await snapshot(page)).battle;
          return b.result || b.phase === "player";
        })
        .toBeTruthy();
    }
    await expect(page.locator("#result-title")).toHaveText(
      "Todo vínculo se aprende.",
    );
    expect((await snapshot(page)).state.quest).toBe("battle");
    expect((await snapshot(page)).state.xp).toBe(0);
    await page.locator("#retry").click();
    await expect
      .poll(async () => (await snapshot(page)).battle.phase)
      .toBe("player");
    await openFolder(page, "fight");
    await expect(page.locator('[data-action="guard"]')).toBeEnabled();
    if (!(await snapshot(page)).battle.player.transformed) {
      await battleAction(page, "transform");
      await expect(page.locator('[data-action="special"]')).toBeEnabled();
    }
    for (let i = 0; i < 25; i++) {
      const { battle: b, state: s } = await snapshot(page);
      if (b.result) break;
      await expect
        .poll(async () => (await snapshot(page)).battle.phase)
        .toBe("player");
      const action =
        b.player.hp < 55 && s.inventory.tonic
          ? "tonic"
          : b.player.energy >= 30
            ? "special"
            : b.player.energy >= 14
              ? "skill"
              : "guard";
      await battleAction(page, action);
      await expect
        .poll(async () => {
          const b = (await snapshot(page)).battle;
          return b.result || b.phase === "player";
        })
        .toBeTruthy();
    }
    await expect(page.locator("#result-title")).toHaveText(
      "Sintonia alcançada.",
    );
  });
test("falha de asset apresenta erro recuperável em vez de tela preta", async ({
  page,
}) => {
  await page.route("**/assets/characters/layers/female-base.png", (r) =>
    r.abort(),
  );
  await page.goto("/");
  await expect(page.locator("#load-message")).toContainText(
    "Não foi possível carregar",
  );
  await expect(page.locator("#reload")).toBeVisible();
  await page.unroute("**/assets/characters/layers/female-base.png");
  await page.locator("#reload").click();
  await expect(page.locator("#title")).toHaveClass(/active/);
});
test("save corrompido não impede uma nova jornada", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("zimons.academia.v2", "{bad"));
  await page.reload();
  await openCreator(page);
  await expect(page.locator("#save-warning")).toContainText(
    "Não foi possível ler",
  );
  await page.locator("#start").click();
  await expect(page.locator("#world")).toHaveClass(/active/);
});
test("sprites: os dois protagonistas animam em quatro direções e todas as opções frontais têm efeito visual", async ({
  page,
}) => {
  await page.goto("/?debug=1");
  await openCreator(page);
  const problems = await page.evaluate(async () => {
    const { Assets } = await import("/src/assets.js");
    const { DEFAULT_APPEARANCE, PALETTES } = await import("/src/model.js");
    const assets = new Assets();
    await assets.load();
    const problems = [];
    const hash = async (canvas) => {
      const data = canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height).data;
      return [
        ...new Uint8Array(await crypto.subtle.digest("SHA-256", data)),
      ].join(",");
    };
    for (const gender of ["male", "female"]) {
      const a = { ...DEFAULT_APPEARANCE, gender };
      const baseline = await hash(
        assets.frame(gender, "down", 0, a, false).canvas,
      );
      for (const [key, values] of [
        ...Object.entries(PALETTES),
        ["style", [0, 1, 2]],
        ["bag", [0, 1, 2]],
      ]) {
        for (let value = 0; value < values.length; value++) {
          if (value === a[key]) continue;
          if (
            (await hash(
              assets.frame(gender, "down", 0, { ...a, [key]: value }, false)
                .canvas,
            )) === baseline
          )
            problems.push(`${gender}/${key}/${value}`);
        }
      }
      for (const dir of ["up", "down", "left", "right"]) {
        const hashes = [];
        for (let f = 0; f < 4; f++)
          hashes.push(
            await hash(assets.frame(gender, dir, f, a, false).canvas),
          );
        if (new Set(hashes).size < 4)
          problems.push(`${gender}/${dir}: frames repetidos`);
      }
      const zlink = await hash(assets.frame(gender, "down", 0, a, true).canvas);
      if (zlink === baseline)
        problems.push(`${gender}: dispositivo não aparece após obtido`);
    }
    return problems;
  });
  expect(problems).toEqual([]);
});
test("tela pequena horizontal: criação acessível e controles de toque funcionais", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 800, height: 450 },
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await newJourney(page);
  await expect(page.locator("#world")).toHaveClass(/active/);
  const start = (await snapshot(page)).state;
  const pad = page.locator('[data-dir="up"]');
  await expect(pad).toBeVisible();
  const box = await pad.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(200);
  await page.mouse.up();
  expect((await snapshot(page)).state.y).toBeLessThan(start.y);
  await page.locator("#menu").click();
  await expect(page.locator("#modal-title")).toHaveText("Pausa na jornada");
  await page.locator("#close-modal").click();
  await context.close();
});
test("enfraquecimento reduz exatamente dois ataques da mentora e expira no fim dos turnos dela", async ({
  page,
}) => {
  await page.goto("/?debug=1");
  await openCreator(page);
  await page.evaluate(async () => {
    const { newGame, SAVE_KEY } = await import("/src/model.js");
    const s = newGame();
    Object.assign(s, {
      zlink: true,
      starter: "water",
      level: 8,
      forms: { water: { level: 8, xp: 0 } },
      transformed: true,
      quest: "battle",
      world: "lab",
      x: 862,
      y: 423,
    });
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
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
  await openFolder(page, "fight");
  await expect(page.locator('[data-action="special"]')).toBeEnabled();
  await page.locator('[data-action="special"]').click();
  await expect.poll(async () => (await snapshot(page)).battle.turn).toBe(2);
  expect((await snapshot(page)).battle.opponent.status).toEqual({
    type: "weaken",
    turns: 1,
  });
  await page.locator('[data-action="attack"]').click();
  await expect.poll(async () => (await snapshot(page)).battle.turn).toBe(3);
  expect((await snapshot(page)).battle.opponent.status).toBe(null);
  await page.locator('[data-action="guard"]').click();
  await expect.poll(async () => (await snapshot(page)).battle.turn).toBe(4);
  const damage = (await snapshot(page)).battle.log.filter((line) =>
    /^Pyron: .* de dano\./.test(line),
  );
  expect(damage[0]).toContain("11 de dano");
  expect(damage[1]).toContain("10 de dano");
  // The third strike has no weakening multiplier; guard applies its independent reduction.
  expect(damage[2]).toContain("7 de dano");
});
