import { test, expect } from "@playwright/test";
import { start, snap, toLab, select, fight } from "./helpers.js";
test.use({ reducedMotion: "no-preference" });
for (const key of ["water", "plant"])
  test(`essência ${key}: vínculo único, técnica elemental e derrota do protagonista`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.fastStory = true;
    await start(page, {
      gender: key === "water" ? "male" : "female",
      brief: false,
    });
    await toLab(page);
    await select(page, key);
    let s = await snap(page);
    expect(Object.keys(s.state.forms)).toEqual([key]);
    expect(s.battle.storyBattle).toBe(true);
    expect(s.battle.opponent.partial).toBe(true);
    await page.locator('[data-action="skill"]').click();
    await page.waitForFunction(() => {
      const e = window.zimonsDebug.snapshot().effect;
      return e?.kind === "strike" && e.progress > 0.61 && e.progress < 0.8;
    });
    await page.screenshot({
      path: `docs/screenshots/v11/11-${key === "water" ? "bolhas" : "folhas"}.png`,
    });
    await expect
      .poll(async () => (await snap(page)).battle.phase, { timeout: 15000 })
      .toBe("player");
    await fight(page);
    expect((await snap(page)).battle.result).toBe("loss");
    expect(errors).toEqual([]);
  });
