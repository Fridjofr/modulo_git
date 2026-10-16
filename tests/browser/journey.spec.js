import { test, expect } from "@playwright/test";
import {
  snap,
  begin,
  move,
  toLaboratory,
  choose,
  contain,
  practice,
  complete,
  social,
  drive,
} from "./helpers.js";

test("arco completo real: floresta, entrega, crise, enfermaria, prática, recuperação e relato", async ({
  page,
}) => {
  test.setTimeout(240000);
  page.openingCaptures = new Set();
  const errors = [],
    missing = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) missing.push(r.url());
  });
  await begin(page, "male");
  const appearance = (await snap(page)).state.appearance;
  expect((await snap(page)).state.zlink).toBe(false);
  await page.screenshot({ path: "docs/screenshots/v09-01-floresta.png" });
  await toLaboratory(page);
  expect((await snap(page)).state.zlink).toBe(true);
  await choose(page, "fire");
  let s = await snap(page);
  expect(Object.keys(s.state.forms)).toEqual(["fire"]);
  expect(s.battle.playerName).toBe("Nara");
  expect(s.battle.opponentName).toBe("Mentora Lira");
  expect(s.battle.mandatory).toBe(true);
  await expect(page.locator('[data-action="guard"]')).toHaveCount(0);
  await expect(page.locator('[data-battle-tab="exit"]')).toBeHidden();
  await page.keyboard.press("Escape");
  expect((await snap(page)).battle.result).toBe(null);
  await page.screenshot({ path: "docs/screenshots/v09-04-contencao.png" });
  expect(s.battle.opponent.partial).toBe(true);
  expect(s.battle.enemy).toBe("plant");
  expect(s.state.story.possessed).toBe(true);
  expect(s.battle.opponent.transformed).toBe(false);
  await contain(page);
  expect((await snap(page)).state.challenges.lira.result).toBe("loss");
  expect((await snap(page)).battle.player.hp).toBe(0);
  expect((await snap(page)).state.story.freeLink).toBe(false);
  expect((await snap(page)).state.story.flags.mistDream).toBe(true);
  expect((await snap(page)).state.quest).toBe("orientation");
  await page.screenshot({ path: "docs/screenshots/v09-05-pratica.png" });
  await practice(page);
  s = await snap(page);
  expect(s.state.zimondex).toBe(true);
  expect(s.state.story.freeLink).toBe(false);
  expect(s.state.health).toBe(106);
  expect(s.state.appearance).toEqual(appearance);
  await page.locator("#dex-button").click();
  await expect(page.locator(".dex-entry")).toHaveCount(3);
  await expect(
    page.locator(".dex-entry").filter({ hasText: "Alma vinculada" }),
  ).toHaveCount(1);
  await page.screenshot({ path: "docs/screenshots/v09-06-zimondex.png" });
  await page.keyboard.press("Escape");
  await complete(page);
  s = await snap(page);
  expect(s.state.story.flags.chapterOne).toBe(true);
  expect(s.state.appearance).toEqual(appearance);
  expect(Object.keys(s.state.forms)).toEqual(["fire"]);
  await page.screenshot({ path: "docs/screenshots/v09-07-capitulo.png" });
  await move(page, "x", 930);
  await move(page, "y", 580);
  await move(page, "x", 640);
  await page.keyboard.press("e");
  await drive(page, (s) => s.state.world === "plaza");
  await move(page, "y", 430);
  await social(page, "nico");
  await expect.poll(async () => (await snap(page)).battle.phase).toBe("player");
  await expect(page.locator("#combat-player")).toHaveText("Nara");
  await expect(page.locator("#combat-enemy")).toHaveText("Nico");
  await page.locator('[data-battle-tab="fight"]').click();
  await expect(page.locator('[data-action="attack"]')).toBeVisible();
  await expect(page.locator('[data-action="skill"]')).toBeVisible();
  await page.locator('[data-action="attack"]').evaluate((b) => {
    for (let i = 0; i < 8; i++) b.click();
  });
  await expect.poll(async () => (await snap(page)).battle.turn).toBe(2);
  expect(
    (await snap(page)).battle.log.filter((t) => t.startsWith("Nara: Impacto"))
      .length,
  ).toBe(1);
  for (let i = 0; i < 15; i++) {
    const b = (await snap(page)).battle;
    if (b.result) break;
    await page
      .locator(`[data-action="${b.player.energy >= 14 ? "skill" : "attack"}"]`)
      .click();
    await expect
      .poll(async () => {
        const b = (await snap(page)).battle;
        return b.result || b.phase === "player";
      })
      .toBeTruthy();
  }
  await expect(page.locator("#result-title")).toHaveText("Sintonia alcançada.");
  await page.locator("#return-world").click();
  await expect.poll(async()=>(await snap(page)).scene).toBe("world");
  expect((await snap(page)).state.transformed).toBe(false);
  expect((await snap(page)).state.quest).toBe("complete");
  expect((await snap(page)).state.challenges.nico.result).toBe("win");
  await page.keyboard.press("e");
  await drive(page, () => true);
  await expect(
    page.getByRole("button", { name: "Vamos treinar?", exact: true }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(missing).toEqual([]);
});
