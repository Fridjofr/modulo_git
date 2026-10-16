import { test, expect } from "@playwright/test";
import {
  snap,
  begin,
  toLaboratory,
  choose,
  contain,
  practice,
  drive,
} from "./helpers.js";
for (const [key, gender] of [
  ["water", "female"],
  ["plant", "male"],
])
  test(`${key}: crise e retorno conscientes preservam aparência e apenas uma alma`, async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await begin(page, gender);
    const appearance = (await snap(page)).state.appearance;
    await toLaboratory(page);
    await choose(page, key);
    await page.screenshot({
      path: `docs/screenshots/v09-${key === "water" ? "15-marivon" : "16-verdrax"}.png`,
    });
    expect((await snap(page)).battle.starter).toBe(key);
    await expect(page.locator("#combat-player")).toHaveText("Nara");
    await expect(page.locator("#combat-enemy")).toHaveText("Mentora Lira");
    await expect(page.locator('[data-action="skill"]')).toBeVisible();
    await expect(page.locator('[data-action="special"]')).toBeHidden();
    await contain(page);
    expect((await snap(page)).state.story.freeLink).toBe(false);
    await page.keyboard.press("Escape");
    await expect(page.locator("#modal")).toBeVisible();
    await expect(page.locator("#modal-body")).not.toContainText("Salvar agora");
    await page.keyboard.press("Escape");
    await practice(page);
    let s = await snap(page);
    expect(s.state.appearance).toEqual(appearance);
    expect(Object.keys(s.state.forms)).toEqual([key]);
    expect(s.state.transformed).toBe(false);
    const lira = s.lira;
    await page.waitForTimeout(900);
    s = await snap(page);
    expect(s.lira.x).toBe(lira.x);
    expect(s.lira.y).toBe(lira.y);
    expect(s.lira.moving).toBe(false);
    await page.keyboard.press("t");
    await expect
      .poll(async () => (await snap(page)).state.transformed)
      .toBe(true);
    await page.keyboard.press("t");
    await expect
      .poll(async () => (await snap(page)).state.transformed)
      .toBe(false);
    expect((await snap(page)).state.appearance).toEqual(appearance);
    expect(errors).toEqual([]);
  });
