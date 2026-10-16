import { expect } from "@playwright/test";
import { move } from "../browser/helpers.js";
export { move };
export const snap = (p) => p.evaluate(() => window.zimonsDebug.snapshot());
export async function drive(page, predicate, timeout = 110000) {
  const end = Date.now() + timeout;
  let reported = Date.now();
  while (Date.now() < end) {
    const s = await snap(page);
    if (Date.now() - reported > 10000) {
      console.log(
        "FLOW",
        s.state.world,
        s.state.quest,
        s.state.x,
        s.state.y,
        s.lira?.x,
        s.lira?.y,
        s.story,
        s.effect,
      );
      reported = Date.now();
    }
    if (page.effectObserver) await page.effectObserver(s);
    if (predicate(s) && !s.dialogue && !s.story.active) return s;
    if (s.modal === "name") {
      await page.locator("#story-name").fill("Nara");
      await page
        .getByRole("button", { name: "Confirmar", exact: true })
        .click();
    } else if (s.dialogue || (page.fastStory && s.story.motion))
      await page.keyboard.press("r");
    else await page.waitForTimeout(70);
  }
  throw Error("Story stalled " + JSON.stringify(await snap(page)));
}
export async function start(page, { gender = "female", brief = true, style="Curto", outfit="Uniforme" } = {}) {
  await page.goto("/?debug=1");
  await expect(page.locator("#title")).toHaveClass(/active/, {timeout:30000});
  await page.locator("#title-settings").click();
  await page
    .getByRole("checkbox", { name: "Animações breves", exact: true })
    .setChecked(brief);
  await page.keyboard.press("Escape");
  await page.locator("#title-new").click();
  await page.locator(`[data-gender='${gender}']`).click();
  await page
    .getByRole("button", { name: `Penteado: ${style}`, exact: true })
    .click();
  await page
    .getByRole("button", { name: `Modelo da roupa: ${outfit}`, exact: true })
    .click();
  await page.locator("#start").click();
  return drive(page, (s) => s.state.quest === "forest");
}
export async function door(page, id) {
  const e = await page.evaluate(async (id) => {
    const { MAPS } = await import("/src/maps.js");
    return MAPS[window.zimonsDebug.snapshot().state.world].exits.find(
      (e) => e.id === id,
    );
  }, id);
  if (!e) throw Error("Missing door " + id);
  await navigate(page, e.x, e.y);
  await page.keyboard.press("e");
  return drive(page, (s) => s.state.world === e.to);
}
export async function toLab(page) {
  await navigate(page, 1420, 480);
  await drive(page, (s) => s.state.quest === "entrance");
  await navigate(page, 768, 270);
  await drive(page, (s) => s.state.quest === "choose", 160000);
  return snap(page);
}
export async function select(page, key) {
  const target=await page.evaluate(async()=>{const {MAPS}=await import("/src/maps.js");const o=MAPS.lab.objects.find(o=>o.id==="sync-platform");return {x:o.x,y:o.y+45};});
  await navigate(page, target.x, target.y);
  await page.keyboard.press("e");
  await drive(page, (s) => s.scene === "starters");
  if (key === "fire" && page.reviewScreenshots !== false)
    await page.screenshot({
      path: "docs/screenshots/v11/07-escolha-essencia.png",
    });
  await page.locator(`[data-starter='${key}']`).click();
  await page.locator("#confirm-starter").click();
  await drive(page, (s) => s.modal === "sync");
  for (let i = 0; i < 8 && (await snap(page)).modal === "sync"; i++) {
    // Click in the SAME visible cursor frame. A protocol round trip between
    // observing the moving needle and clicking could miss under recording load.
    await page.waitForFunction(() => {
      const button = document.querySelector("#sync-pulse"),
        value = parseFloat(document.querySelector("#sync-cursor")?.style.left || "0");
      if (!button || button.closest("[hidden]")) return true;
      if (button.dataset.inRange === "true" && value >= 44 && value <= 56) {
        button.click();
        return true;
      }
      return false;
    });
    await page.waitForTimeout(400);
  }
  expect((await snap(page)).modal).not.toBe("sync");
  return drive(
    page,
    (s) => s.scene === "battle" && s.battle.phase === "player",
  );
}
export async function fight(page, { capture = false } = {}) {
  for (let i = 0; i < 35; i++) {
    const s = await snap(page);
    if (s.battle.result) break;
    if (s.battle.phase !== "player") {
      await page.waitForTimeout(150);
      continue;
    }
    if (!(await page.locator("#fight-panel").isVisible()))
      await page.locator('[data-battle-tab="fight"]').click();
    const skill = page.locator('[data-action="skill"]'),
      b = await snap(page);
    await (
      b.battle.player.energy >= 14 && (!b.battle.storyBattle || i % 2)
        ? skill
        : page.locator('[data-action="attack"]')
    ).click();
    if (capture && i < 2) {
      await page.waitForFunction(() => {
        const e = window.zimonsDebug.snapshot().effect;
        return e?.kind === "strike" && e.progress > 0.7 && e.progress < 0.86;
      });
      await page.screenshot({
        path: `docs/screenshots/v11/${i === 0 ? "11-impacto" : "11-lanca-chamas"}.png`,
      });
    }
    await expect
      .poll(
        async () => {
          const s = await snap(page);
          return s.battle.result || s.battle.phase === "player";
        },
        { timeout: 20000 },
      )
      .toBeTruthy();
  }
  if (capture && !(await page.locator("#battle-result").isVisible())) {
    await page.waitForFunction(
      () => {
        const s = window.zimonsDebug.snapshot();
        return (
          s.battle.fallen &&
          s.battle.player.transformed &&
          !s.effect
        );
      },
      { timeout: 20000 },
    );
    await page.screenshot({
      path: "docs/screenshots/v11/11-derrota-no-chao.png",
    });
  }
  await expect(page.locator("#battle-result")).toBeVisible({ timeout: 20000 });
  return snap(page);
}
export async function recover(page) {
  await page.locator("#return-world").click();
  await drive(page, (s) => s.state.quest === "recalibrate");
  return snap(page);
}
export async function practice(page, { exitInstead = false } = {}) {
  await door(page, "clinic-corridor");
  await door(page, "corridor-lab");
  expect((await snap(page)).state.quest).toBe("practice");
  await page.keyboard.press("t");
  await drive(page, (s) => s.state.transformed);
  await navigate(page, 760, 500);
  await drive(page, (s) => s.state.quest === "return");
  if (exitInstead) await door(page, "lab-corridor");
  else await page.keyboard.press("t");
  return drive(page, (s) => s.state.quest === "challenge");
}

export async function navigate(page, tx, ty) {
  const path = await page.evaluate(
    async ({ tx, ty }) => {
      const { canStand } = await import("/src/model.js"),
        s = window.zimonsDebug.snapshot(),
        step = 10,
        actors = [
          ...s.actors,
          ...(s.lira?.visible && s.lira.world === s.state.world
            ? [s.lira]
            : []),
        ];
      const start = [
          Math.round(s.state.x / step),
          Math.round(s.state.y / step),
        ],
        queue = [start],
        prev = new Map([[start.join(), null]]);
      let found;
      const clear = (x, y) =>
        canStand(s.state.world, x, y, 15) &&
        actors.every((n) => Math.hypot(x - n.x, y - n.y) > 43);
      for (let i = 0; i < queue.length; i++) {
        const q = queue[i];
        if (Math.hypot(q[0] * step - tx, q[1] * step - ty) < 22) {
          found = q;
          break;
        }
        for (const [dx, dy] of [
          [0, -1],
          [1, 0],
          [-1, 0],
          [0, 1],
        ]) {
          const n = [q[0] + dx, q[1] + dy],
            k = n.join();
          if (!prev.has(k) && clear(n[0] * step, n[1] * step)) {
            prev.set(k, q);
            queue.push(n);
          }
        }
      }
      if (!found)
        throw Error(
          "No accessible route " + s.state.world + ": " + tx + "," + ty,
        );
      const path = [];
      for (let q = found; q; q = prev.get(q.join()))
        path.unshift(q.map((v) => v * step));
      return path.filter(
        (p, i) =>
          i === 0 ||
          i === path.length - 1 ||
          (path[i - 1][0] === p[0]) !== (path[i + 1][0] === p[0]),
      );
    },
    { tx, ty },
  );
  for (const [x, y] of path) {
    if ((await snap(page)).story.active) break;
    await move(page, "x", x);
    await move(page, "y", y);
  }
}
