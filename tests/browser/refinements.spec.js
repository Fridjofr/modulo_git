import { test, expect } from "@playwright/test";
import { snap, begin, drive } from "./helpers.js";

test("texto é revelado com calma e nunca avança sozinho; Enter revela e depois avança", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?debug=1");
  await page.locator("#title-new").click();
  await page.locator("#start").click();
  await expect(page.locator("#dialogue")).toBeVisible();
  const index = (await snap(page)).dialogue.index;
  await page.waitForTimeout(900);
  const partial = await page.locator("#dialogue-text").textContent();
  expect(partial.length).toBeGreaterThan(5);
  expect(partial.length).toBeLessThan(110);
  await page.waitForTimeout(2500);
  expect((await snap(page)).dialogue.index).toBe(index);
  await page.keyboard.press("Enter");
  expect((await snap(page)).dialogue.index).toBe(index + 1);
  await page.keyboard.press("Enter");
  expect((await snap(page)).dialogue.index).toBe(index + 1);
  await page.keyboard.press("Enter");
  expect((await snap(page)).dialogue.index).toBe(index + 2);
});

test("movimento só usa setas, bolsa e diário são acessíveis e não há progresso persistido", async ({
  page,
}) => {
  await begin(page);
  const before = (await snap(page)).state;
  await page.keyboard.down("d");
  await page.waitForTimeout(300);
  await page.keyboard.up("d");
  expect((await snap(page)).state.x).toBe(before.x);
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(300);
  await page.keyboard.up("ArrowRight");
  expect((await snap(page)).state.x).toBeGreaterThan(before.x);
  await page.locator("#journal-button").click();
  await expect(page.locator("#modal-title")).toHaveText(
    "Missões",
  );
  await page.keyboard.press("Escape");
  await page.keyboard.press("i");
  await expect(page.locator("#modal-title")).toHaveText("Bolsa");
  await expect(page.locator("#modal-body")).toContainText("Tônico vital");
  await page.keyboard.press("Escape");
  const zlinkBefore = (await snap(page)).state.zlink;
  await page.keyboard.press("t");
  expect((await snap(page)).state.zlink).toBe(zlinkBefore);
  expect((await snap(page)).state.transformed).toBe(false);
  const stored = await page.evaluate(() =>
    localStorage.getItem("zimons.academia.v2"),
  );
  expect(stored).toBe(null);
  await page.reload();
  await expect(page.locator("#title-continue")).toBeHidden();
});

test("controle padrão navega menus, avança cenas, move e interage com a bolsa", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.testPad = {
      axes: [0, 0],
      buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })),
    };
    Object.defineProperty(navigator, "getGamepads", {
      value: () => [window.testPad],
    });
  });
  async function press(index) {
    await page.evaluate((index) => {
      window.testPad.buttons[index] = { pressed: true, value: 1 };
    }, index);
    await page.waitForTimeout(90);
    await page.evaluate((index) => {
      window.testPad.buttons[index] = { pressed: false, value: 0 };
    }, index);
    await page.waitForTimeout(100);
  }
  await page.goto("/?debug=1");
  await expect(page.locator("#title")).toHaveClass(/active/);
  await press(13);
  await press(0);
  await expect(page.locator("#creator")).toHaveClass(/active/);
  await page.locator("#start").focus();
  await press(0);
  await expect(page.locator("#dialogue")).toBeVisible();
  for (let i = 0; i < 12; i++) {
    if ((await snap(page)).state.quest === "forest") break;
    await press(0);
  }
  await expect.poll(async () => (await snap(page)).state.quest).toBe("forest");
  const x = (await snap(page)).state.x;
  await page.evaluate(() => (window.testPad.axes[0] = 1));
  await page.waitForTimeout(350);
  await page.evaluate(() => (window.testPad.axes[0] = 0));
  expect((await snap(page)).state.x).toBeGreaterThan(x);
  await press(9);
  await expect(page.locator("#modal-title")).toHaveText("");
  await press(13);
  await press(0);
  await expect(page.locator("#modal-title")).toHaveText(
    "Missões",
  );
  await press(1);
  await expect(page.locator("#modal-title")).toHaveText("");
  await press(1);
  await expect(page.locator("#modal")).toBeHidden();
});

test("falha no cenário apresenta erro recuperável; os sprites aprovados continuam carregando", async ({
  page,
}) => {
  await page.route("**/assets/world/forest-v09.png", (r) => r.abort());
  await page.goto("/");
  await expect(page.locator("#load-message")).toContainText(
    "Não foi possível carregar",
  );
  await expect(page.locator("#reload")).toBeVisible();
  await page.unroute("**/assets/world/forest-v09.png");
  await page.locator("#reload").click();
  await expect(page.locator("#title")).toHaveClass(/active/);
  const problems = await page.evaluate(async () => {
    const { Assets } = await import("/src/assets.js");
    const { DEFAULT_APPEARANCE } = await import("/src/model.js");
    const a = new Assets();
    await a.load();
    const issues = [];
    for (const gender of ["male", "female"])
      for (const dir of ["up", "down", "left", "right"]) {
        const hashes = [];
        for (let f = 0; f < 4; f++) {
          const c = a.frame(gender, dir, f, {
            ...DEFAULT_APPEARANCE,
            gender,
          }).canvas;
          const bytes = c
            .getContext("2d")
            .getImageData(0, 0, c.width, c.height).data;
          hashes.push(
            [
              ...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
            ].join(),
          );
        }
        if (new Set(hashes).size < 4) issues.push(gender + "/" + dir);
      }
    return issues;
  });
  expect(problems).toEqual([]);
});

test.describe("Interface de toque",()=>{
 test.use({viewport:{width:800,height:450},hasTouch:true});
 test("tela de toque 800×450 mantém conversa, decisões e movimentação acessíveis", async ({
  page,
}) => {
  await begin(page);
  const start = (await snap(page)).state.x;
  const b = await page.locator('[data-dir="right"]').boundingBox();
  expect(b).not.toBe(null);
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(350);
  await page.mouse.up();
  expect((await snap(page)).state.x).toBeGreaterThan(start);
  await page.locator("#menu").click();
  await expect(page.locator("#modal-title")).toHaveText("");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  expect(overflow).toBe(false);
  await page.screenshot({ path: "docs/screenshots/v09-08-toque.png" });
});

});

test("combate usa sprites originais sem WebGL e conserva a manifestação parcial", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      return String(kind).startsWith("webgl")
        ? null
        : original.call(this, kind, ...args);
    };
  });
  await page.goto("/?debug=1");
  await expect(page.locator("#title")).toHaveClass(/active/);
  const result = await page.evaluate(async () => {
    const { Assets } = await import("/src/assets.js"),
      { Renderer } = await import("/src/render.js"),
      { newGame, createContainment } = await import("/src/model.js");
    const a = new Assets();
    await a.load();
    const r = new Renderer(a),
      s = newGame();
    s.starter = "fire";
    s.zlink = true;
    const b = createContainment(s);
    b.phase = "player";
    r.beginBattle(s, b);
    r.drawBattle(s, b, 8000, null, true);
    const bytes = r.battle.getImageData(0, 0, 1280, 720).data;
    let bright = 0;
    for (let i = 0; i < bytes.length; i += 4)
      if (bytes[i] + bytes[i + 1] + bytes[i + 2] > 180) bright++;
    r.drawBattle(
      s,
      b,
      9000,
      {
        kind: "partial",
        side: "opponent",
        start: 8000,
        duration: 2000,
        color: "#9beb88",
      },
      true,
    );
    return { mode: r.battleSprites.stats().mode, bright };
  });
  expect(result.mode).toBe("sprite-atlases");
  expect(result.bright).toBeGreaterThan(100000);
  expect(errors).toEqual([]);
});
