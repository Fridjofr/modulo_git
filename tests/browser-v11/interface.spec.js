import { test, expect } from "@playwright/test";
import { start, snap } from "./helpers.js";
test("criador usa as bases oficiais e sinaliza variações sem arte, sem oferecer partes antigas", async ({page}) => {
 await page.goto('/?debug=1');await expect(page.locator('#title')).toHaveClass(/active/);
 await page.locator('#title-new').click();
 for(const gender of ['female','male']) {
  await page.locator(`[data-gender="${gender}"]`).click();
  await expect(page.getByRole('button',{name:'Penteado: Oficial',exact:true})).toBeEnabled();
  await expect(page.getByRole('button',{name:'Modelo da roupa: Oficial',exact:true})).toBeEnabled();
  await expect(page.locator('.appearance-choice')).toHaveCount(2);
  expect(await page.locator('.swatch').evaluateAll(ns=>ns.every(n=>n.disabled))).toBe(true);
  expect(await page.locator('.look-collection .appearance-pending').count()).toBe(2);
 }
});
test("HUD, minimapa com zoom e menu preservam legibilidade e bloqueiam movimento ao abrir", async ({
  page,
}) => {
  await start(page);
  const s = (await snap(page)).state;
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(100);
    const geometry = await page.locator("#world-canvas").evaluate((c) => {
      const r = c.getBoundingClientRect();
      return {
        w: r.width,
        h: r.height,
        sx: r.width / c.width,
        sy: r.height / c.height,
      };
    });
    expect(geometry.w).toBe(viewport.width);
    expect(geometry.h).toBe(viewport.height);
    expect(Math.abs(geometry.sx - geometry.sy)).toBeLessThan(0.002);
  }
  await page.keyboard.press("Escape");
  await expect(page.locator(".menu-buttons button").first()).toHaveAttribute(
    "aria-label",
    "Zimondex",
  );
  await expect(page.locator("#modal")).not.toContainText("Sua jornada");
  await page.getByRole("button", { name: "Bolsa", exact: true }).click();
  await expect(page.locator(".inventory-slot")).toHaveCount(12);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(130);
  expect((await snap(page)).state.x).toBe(s.x);
  await page.keyboard.press("Escape");
  await expect(page.locator("#modal")).toHaveAttribute("data-kind", "menu");
  await page.keyboard.press("Escape");
  const previous = (await snap(page)).settings.radarRange;
  await page.locator("#minimap-zoom-in").click();
  expect((await snap(page)).settings.radarRange).toBeLessThan(previous);
  await page.locator("#minimap-zoom-out").click();
  expect((await snap(page)).settings.radarRange).toBe(previous);
  const colors = await page.locator("#objective").evaluate((n) => ({
    bg: getComputedStyle(n).backgroundImage,
    text: getComputedStyle(n.querySelector("strong")).color,
  }));
  expect(colors.bg).toContain("linear-gradient");
});
test("falha real de um tileset apresenta recuperação e não fica em tela preta", async ({
  page,
}) => {
  await page.route("**/assets/tiles/v10/terrain.png", (r) => r.abort());
  await page.goto("/");
  await expect(page.locator("#load-message")).toContainText("terrain.png");
  await expect(page.locator("#reload")).toBeVisible();
});
test.describe("toque", () => {
  test.use({ hasTouch: true, viewport: { width: 800, height: 450 } });
  test("personalização e menus cabem em 800×450, sem cortar o botão de iniciar", async ({
    page,
  }) => {
    await page.goto("/?debug=1");
    await expect(page.locator("#title")).toHaveClass(/active/);
    await page.locator("#title-new").tap();
    const clipped = await page
      .locator("#customization button,#start")
      .evaluateAll((nodes) =>
        nodes
          .filter((n) => {
            const r = n.getBoundingClientRect();
            return (
              r.width < 8 ||
              r.height < 8 ||
              r.left < 0 ||
              r.right > innerWidth ||
              r.bottom > innerHeight
            );
          })
          .map((n) => n.getAttribute("aria-label") || n.id),
      );
    expect(clipped).toEqual([]);
    await page.screenshot({
      path: "docs/screenshots/v11/10-personalizacao-toque.png",
    });
  });
});
test("abertura usa composição única, sem slogan, e preenche a viewport após resize", async ({
  page,
}) => {
  await page.goto("/?debug=1");
  await expect(page.locator("#title")).toHaveClass(/active/);
  await expect(page.locator("#title h1")).toHaveText("ZIMONS");
  await expect(
    page.locator("[data-cast],.title-tagline,.title-description"),
  ).toHaveCount(0);
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    const app = await page.locator("#app").boundingBox();
    expect(app.x).toBe(0);
    expect(app.y).toBe(0);
    expect(app.width).toBe(viewport.width);
    expect(app.height).toBe(viewport.height);
    const controls = await page
      .locator("#title button:not([hidden])")
      .evaluateAll((nodes) =>
        nodes.every((n) => {
          const r = n.getBoundingClientRect();
          return (
            r.left >= 0 &&
            r.top >= 0 &&
            r.right <= innerWidth &&
            r.bottom <= innerHeight
          );
        }),
      );
    expect(controls).toBe(true);
  }
});

test("painel de missão recolhe mantendo a aba acessível, preserva o objetivo e expande por teclado", async ({
  page,
}) => {
  await start(page);
  const content = page.locator("#quest-content"),
    toggle = page.locator("#quest-toggle");
  const text = await content.innerText();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await page.waitForTimeout(400);
  expect(await content.evaluate((n) => n.inert)).toBe(true);
  const tab = await toggle.boundingBox();
  expect(tab.x).toBeGreaterThan(0);
  expect(tab.x + tab.width).toBeLessThanOrEqual(1441);
  const panel = await page.locator("#objective").boundingBox();
  expect(panel.x).toBeGreaterThanOrEqual(1438);
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(await content.evaluate((n) => n.inert)).toBe(false);
  expect(await content.innerText()).toBe(text);
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(
      () =>
        document.fonts.check("16px Manrope") &&
        document.fonts.check("40px Michroma"),
    ),
  ).toBe(true);
});
