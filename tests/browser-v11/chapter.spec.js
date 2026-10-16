import { test, expect } from "@playwright/test";
import {
  start,
  snap,
  drive,
  door,
  toLab,
  select,
  fight,
  recover,
  practice,
  navigate,
} from "./helpers.js";
test.use({ reducedMotion: "no-preference" });
test("percurso v11, escolta física, descanso, possessão e encerramento no ginásio", async ({
  page,
}) => {
  page.fastStory = process.env.ZIMONS_FAST_SCENES === "1";
  test.setTimeout(600000);
  const errors = [],
    missing = [];
  page.on("pageerror", (e) => errors.push(e.stack));
  page.on("console", (m) => {
    if (m.type() === "error") {
      errors.push(m.text());
      console.log("CONSOLE", m.text());
    }
  });
  page.on("response", (r) => {
    if (r.status() >= 400) missing.push(r.url());
  });
  const capture = async (name) =>
    page.screenshot({ path: `docs/screenshots/v11/${name}.png` });
  const seen = new Set();
  page.effectObserver = async (s) => {
    const name =
      s.state.world === "clinic" && s.state.story.resting && s.dialogue
        ? "05-descanso"
        : s.effect?.kind === "red-eyes"
          ? "08-possessao"
          : s.effect?.kind === "rampage" && s.effect.progress > 0.6
            ? "09-laboratorio-danificado"
            : s.effect?.kind === "transform" &&
                s.effect.to &&
                s.effect.progress > 0.4 &&
                s.effect.progress < 0.55
              ? "08-aura"
              : s.effect?.kind === "partial-world" && s.effect.progress > 0.8
                ? "09-lira-parcial"
                : s.state.world === "plaza" && s.state.quest === "entrance"
                  ? "04-academia"
                  : null;
    if (name && !seen.has(name)) {
      seen.add(name);
      if (name === "05-descanso") await page.keyboard.press("Enter");
      await page.waitForTimeout(300);
      await capture(name);
    }
  };
  await start(page, { brief: false });
  console.log("FOREST");
  await capture("02-floresta");
  await page.keyboard.press("Escape");
  await capture("03-menu");
  await page.keyboard.press("Escape");
  await navigate(page, 1420, 480);
  await drive(page, (s) => s.state.quest === "entrance");
  await capture("04-academia");
  await navigate(page, 768, 270);
  await drive(page, (s) => s.state.quest === "choose", 160000);
  console.log("LAB");
  await capture("06-laboratorio");
  expect((await snap(page)).state.quest).toBe("choose");
  await select(page, "fire");
  console.log("BATTLE");
  let s = await snap(page);
  expect(s.battle.opponent.partial).toBe(true);
  expect(s.state.story.flags.labDamaged).toBe(true);
  expect(Object.keys(s.state.forms)).toEqual(["fire"]);
  await capture("10-batalha-laboratorio");
  const commands = await page.locator(".battle-actions").boundingBox(),
    dock = await page.locator(".battle-bottom").boundingBox();
  expect(
    Math.abs(commands.x + commands.width - dock.x - dock.width),
  ).toBeLessThan(3);
  await page.keyboard.press("v");
  expect((await snap(page)).settings.battleSpeed).toBe(2);
  await page.keyboard.press("v");
  expect((await snap(page)).settings.battleSpeed).toBe(3);
  await page.keyboard.press("v");
  expect((await snap(page)).settings.battleSpeed).toBe(1);
  await fight(page, { capture: true });
  expect((await snap(page)).battle.result).toBe("loss");
  console.log("LOSS");
  await recover(page);
  console.log("RECOVERED");
  expect((await snap(page)).state.world).toBe("clinic");
  await practice(page);
  console.log("PRACTICED");
  await page.locator("#dex-button").click();
  await capture("12-zimondex");
  await page.keyboard.press("Escape");
  await door(page, "lab-corridor");
  await capture("13-corredor");
  await door(page, "corridor-gym");
  console.log("GYM");
  await capture("14-ginasio");
  s = await snap(page);
  expect(s.state.quest).toBe("challenge");
  expect(
    s.actors
      .filter((n) => ["nico", "nina", "caio"].includes(n.id))
      .every((n) => n.x < 250 || n.x > 1000),
  ).toBe(true);
  await navigate(page, 1070, 520);
  await page.keyboard.press("e");
  await drive(page, (s) => s.scene === "battle" && s.battle.phase === "player");
  await capture("15-batalha-ginasio");
  // Review A3: live values and one active folder, at desktop and compact sizes.
  for (const viewport of [{width:1366,height:768},{width:800,height:450}]) {
    await page.setViewportSize(viewport);
    for (const tab of ["home","fight","bag","swap"]) {
      await page.keyboard.press("Escape");
      if(tab!=="home") await page.locator(`[data-battle-tab="${tab}"]`).click();
      const visible=await page.locator("#home-panel,#fight-panel,#bag-panel,#swap-panel,#exit-panel").evaluateAll(nodes=>nodes.filter(n=>!n.hidden).map(n=>n.id));
      expect(visible).toEqual([tab+"-panel"]);
      const overflow=await page.locator(`#${tab}-panel button:visible`).evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect();return r.left<0||r.right>innerWidth+1||r.top<0||r.bottom>innerHeight+1;}).map(n=>n.textContent));
      expect(overflow).toEqual([]);
    }
    const model=(await snap(page)).battle;
    await expect(page.locator("#enemy-energy-label")).toHaveText(`${model.opponent.energy} / ${model.opponent.maxEnergy || 60} MP`);
    await expect(page.locator("#combat-level")).toHaveText(`NV ${model.player.level}`);
  }
  await page.setViewportSize({width:1440,height:900});
  await page.keyboard.press("Escape");
  await fight(page);
  await page.locator("#return-world").click();
  await drive(page, (s) => s.state.quest === "complete");
  s = await snap(page);
  expect(s.state.story.flags.chapterOne).toBe(true);
  expect(s.state.transformed).toBe(false);
  expect(s.state.energy).toBe(s.battle?.player?.maxEnergy || 60);
  expect(errors).toEqual([]);
  expect(missing).toEqual([]);
  await capture("16-fim-trecho");
  await page.keyboard.press("t");
  await drive(page, (s) => s.state.transformed);
  await door(page, "gym-corridor");
  expect((await snap(page)).state.transformed).toBe(false);
  await page.keyboard.press("t");
  await page.waitForTimeout(150);
  expect((await snap(page)).state.transformed).toBe(false);
});
