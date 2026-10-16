import { expect } from "@playwright/test";
export const snap = (page) =>
  page.evaluate(() => window.zimonsDebug.snapshot());
export async function drive(page, ready, timeout = 90000, choice = 0) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const s = await snap(page);
    if (page.openingCaptures && s.dialogue?.index === 0) {
      const name =
        s.state.story.dream === "mist" ? "v09-09-sonho-nevoa" :
        s.state.world === "forest" && s.state.quest === "arrival"
          ? "v09-02-encontro"
          : s.state.world === "clinic" && s.state.quest === "medical"
            ? "v09-03-enfermaria"
            : s.state.story.resting
              ? "v09-09-segundo-despertar"
              : null;
      if (name && !page.openingCaptures.has(name)) {
        page.openingCaptures.add(name);
        await page.screenshot({ path: `docs/screenshots/${name}.png` });
      }
    }
    if (ready(s) && !s.dialogue && !s.story.active) return s;
    if (await page.locator("#dialogue-next").isVisible())
      await page.locator("#dialogue-next").click();
    else if (
      await page
        .locator("#dialogue:not([hidden]) #dialogue-choices button")
        .count()
    )
      await page
        .locator("#dialogue:not([hidden]) #dialogue-choices button")
        .nth(choice)
        .click();
    else if (
      await page
        .getByRole("button", { name: "Continuar conversa", exact: true })
        .isVisible()
    )
      await page
        .getByRole("button", { name: "Continuar conversa", exact: true })
        .click();
    else await page.waitForTimeout(120);
  }
  throw new Error("Cena não concluiu: " + JSON.stringify(await snap(page)));
}
export async function move(page, axis, target) {
  const from = (await snap(page)).state[axis];
  if (Math.abs(from - target) < 4) return;
  const positive = target > from,
    key =
      axis === "x"
        ? positive
          ? "ArrowRight"
          : "ArrowLeft"
        : positive
          ? "ArrowDown"
          : "ArrowUp";
  await page.keyboard.down(key);
  try {
    await page.waitForFunction(
      ({ axis, target, positive, key }) => {
        const s = window.zimonsDebug.snapshot();
        const reached =
          s.story.active ||
          (positive
            ? s.state[axis] >= target - 2
            : s.state[axis] <= target + 2);
        // Release in the same browser frame; protocol latency must not carry
        // a held arrow past a narrow bend. This still uses the input event path.
        if (reached)
          window.dispatchEvent(
            new KeyboardEvent("keyup", { key, bubbles: true }),
          );
        return reached;
      },
      { axis, target, positive, key },
      { timeout: 20000 },
    );
  } finally {
    await page.keyboard.up(key);
  }
}
export async function begin(page, gender = "female", {brief=true}={}) {
  page.on("pageerror", (error) => console.error("Browser error:", error.stack));
  await page.goto("/?debug=1");
  await expect(page.locator("#title")).toHaveClass(/active/);
  await page.locator("#title-settings").click();await page.getByRole("checkbox",{name:"Animações breves",exact:true}).setChecked(brief);await page.keyboard.press("Escape");
  await page.locator("#title-new").click();
  await page.locator(`[data-gender="${gender}"]`).click();
  await page.locator("#player-name").fill("Nara");
  await page.locator('[data-option="hair"][data-value="2"]').click();
  await page.locator("#start").click();
  return drive(page, (s) => s.state.quest === "forest");
}
export async function toLaboratory(page) {
  const points = await page.evaluate(
    async () => (await import("/src/world.js")).FOREST_POINTS,
  );
  for (const kind of ["stream", "road"]) {
    await navigate(page, points[kind].x, points[kind].y);
    if (kind !== "road") {
      await page.keyboard.press("e");
      await drive(page, () => true);
    }
  }
  await drive(
    page,
    (s) => s.state.quest === "medical" && s.state.world === "clinic",
  );
  await move(page, "x", 640);
  await move(page, "y", 610);
  await page.keyboard.press("e");
  await drive(page, (s) => s.state.quest === "choose");
  await move(page, "y", 454);
  await page.keyboard.press("e");
  await expect(page.locator("#starters")).toHaveClass(/active/);
}
export async function choose(page, key) {
  await page.locator(`[data-starter="${key}"]`).click();
  await page.locator("#confirm-starter").click();
  await drive(page, (s) => s.modal === "sync");
  for (
    let attempt = 0;
    attempt < 12 && (await snap(page)).modal === "sync";
    attempt++
  ) {
    await page.waitForTimeout(380);
    await page.waitForFunction(() => {
      const b = document.querySelector("#sync-pulse"),
        cursor = document.querySelector("#sync-cursor");
      const value = parseFloat(cursor?.style.left || "0");
      return b?.dataset.inRange === "true" && value >= 44 && value <= 56;
    });
    await page.locator("#sync-pulse").click();
  }
  expect((await snap(page)).modal).not.toBe("sync");
  return drive(
    page,
    (s) => s.scene === "battle" && s.battle.phase === "player",
  );
}
export async function contain(page) {
  for (let i = 0; i < 15; i++) {
    const b = (await snap(page)).battle;
    if (b.result) break;
    if (!(await page.locator("#fight-panel").isVisible()))
      await page.locator('[data-battle-tab="fight"]').click();
    await page.locator('[data-action="attack"]').click();
    await expect
      .poll(async () => {
        const b = (await snap(page)).battle;
        return b.result || b.phase === "player";
      }, {timeout:30000})
      .toBeTruthy();
  }
  await expect(page.locator("#result-title")).toHaveText(
    "Sincronia interrompida.",
  );
  await page.locator("#return-world").click();
  return drive(page, (s) => s.state.quest === "orientation");
}
export async function practice(page, {stopAt=null}={}) {
  let state=(await snap(page)).state;
  if(state.world==="clinic"&&state.quest==="orientation"){
    await move(page,"y",470);await move(page,"x",640);await move(page,"y",610);await page.keyboard.press("e");await drive(page,s=>s.state.world==="plaza");
  }
  state=(await snap(page)).state;
  if(state.quest==="orientation") {
    await move(page,"y",395);await move(page,"x",1120);await page.keyboard.press("e");await drive(page,s=>s.state.world==="gardens");
    await move(page,"x",730);await drive(page,s=>s.state.quest==="report");
    await move(page,"x",50);await page.keyboard.press("e");await drive(page,s=>s.state.world==="plaza");
  }
  state=(await snap(page)).state;
  if(state.quest==="report"){
    if(state.world==="plaza"){await move(page,"x",970);await move(page,"y",490);await move(page,"x",640);await move(page,"y",175);await page.keyboard.press("e");await drive(page,s=>s.state.world==="lab");}
    await move(page,"y",450);await move(page,"x",868);await move(page,"y",420);await page.keyboard.press("e");await drive(page,s=>s.state.quest==="practice");
  }
  await page.keyboard.press("t");await drive(page,s=>s.state.quest==="return");
  await page.keyboard.press("t");return drive(page,s=>s.state.quest==="complete");
}
export async function social(page, id) {
  // Approach from the open southern row, then stop beside the NPC.
  // A direct line through a stationary student's occupied space is blocked.
  await move(page, "y", 490);
  for (let i = 0; i < 2; i++) {
    const n = (await snap(page)).actors.find((n) => n.id === id);
    await move(page, "x", n.x + 45);
    const stopped=(await snap(page)).actors.find(n=>n.id===id);
    await move(page, "y", stopped.y + 28);
  }
  await page.keyboard.press("e");
  return drive(page, () => true);
}
export async function complete(page) {
  if((await snap(page)).state.quest!=="complete")return practice(page);
  return snap(page);
}

export async function navigate(page, tx, ty) {
  const path = await page.evaluate(
    async ({ tx, ty }) => {
      const { canStand } = await import("/src/model.js");
      const s = window.zimonsDebug.snapshot().state,
        step = 10;
      const start = [Math.round(s.x / step), Math.round(s.y / step)],
        target = [Math.round(tx / step), Math.round(ty / step)];
      const key = ([x, y]) => x + "," + y,
        queue = [start],
        prev = new Map([[key(start), null]]);
      let found = null;
      for (let i = 0; i < queue.length; i++) {
        const q = queue[i];
        if (Math.hypot(q[0] * step - tx, q[1] * step - ty) < 24) {
          found = q;
          break;
        }
        for (const [dx, dy] of [
          [1, 0],
          [0, 1],
          [-1, 0],
          [0, -1],
        ]) {
          const n = [q[0] + dx, q[1] + dy],
            k = key(n);
          if (!prev.has(k) && canStand(s.world, n[0] * step, n[1] * step, 10)) {
            prev.set(k, q);
            queue.push(n);
          }
        }
      }
      if (!found) throw Error("No path to " + tx + "," + ty);
      const path = [];
      for (let q = found; q; q = prev.get(key(q)))
        path.unshift([q[0] * step, q[1] * step]);
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
    const s = await snap(page);
    if (s.story.active) break;
    await move(page, "x", x);
    await move(page, "y", y);
  }
}
