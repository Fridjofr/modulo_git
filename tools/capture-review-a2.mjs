import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
const root = fileURLToPath(new URL("..", import.meta.url));
const gender = process.env.ZIMONS_REVIEW_GENDER || "female",
  starter = process.env.ZIMONS_REVIEW_STARTER || "fire",
  tag = gender + "-" + starter;
import { navigate, move } from "../tests/browser-v11/helpers.js";
import { mkdir, writeFile } from "node:fs/promises";
const dir = root + "/docs/review/lote01/marco-a-r2/runs/" + tag;
await mkdir(dir + "/images", { recursive: true });
await mkdir("/tmp/zimons-review-a2/" + tag + "/video", { recursive: true });
const b = await chromium.launch({
  ...(existsSync("/usr/bin/chromium")
    ? { executablePath: "/usr/bin/chromium" }
    : {}),
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const ctx = await b.newContext({
  viewport: { width: 1366, height: 768 },
  recordVideo: {
    dir: "/tmp/zimons-review-a2/" + tag + "/video",
    size: { width: 1366, height: 768 },
  },
});
const p = await ctx.newPage();
let errors = [];
p.on("pageerror", (e) => {
  errors.push(e.message);
  console.log("ERROR", e.message);
});
p.on("response", (r) => {
  if (r.status() >= 400) errors.push(r.status() + " " + r.url());
});
const snap = () => p.evaluate(() => window.zimonsDebug.snapshot());
const captured = new Set(),
  timeline = [];
const origin = Date.now();
const cap = async (name) => {
  if (captured.has(name)) return;
  captured.add(name);
  await p.screenshot({ path: dir + "/images/" + name + ".png" });
  timeline.push({ name, time: (Date.now() - origin) / 1000 });
  console.log("CAP", name);
};
let observed = "";
async function drive(pred, ms = 180000) {
  let deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    let s = await snap();
    if (pred(s) && !s.dialogue && !s.story.active) return s;
    if (s.effect?.kind === "bed-lie") {
      if (s.effect.progress > 0.08 && !captured.has("09a-lateral"))
        await cap("09a-lateral");
      if (s.effect.progress > 0.32 && !captured.has("09b-sentar-na-cama"))
        await cap("09b-sentar-na-cama");
      if (s.effect.progress > 0.72 && !captured.has("09c-reclinar"))
        await cap("09c-reclinar");
    }
    if (
      s.effect?.kind === "lira-sit" &&
      s.effect.progress > 0.45 &&
      !captured.has("09d-lira-sentando")
    )
      await cap("09d-lira-sentando");
    if (
      s.state?.world === "clinic" &&
      s.lira?.seated &&
      s.dialogue &&
      !captured.has("10-enfermaria-sentada")
    ) {
      await p.waitForTimeout(1400);
      await cap("10-enfermaria-sentada");
      await p.setViewportSize({ width: 1920, height: 1080 });
      await p.waitForTimeout(350);
      await cap("10-enfermaria-1920");
      await p.screenshot({
        path: dir + "/images/10-detalhe-cama.png",
        clip: { x: 310, y: 155, width: 500, height: 370 },
      });
      await p.setViewportSize({ width: 1366, height: 768 });
    }
    if (
      s.effect?.kind === "door-open" &&
      s.state.world === "corridor" &&
      s.effect.progress > 0.5 &&
      !captured.has("08-porta-abrindo")
    )
      await cap("08-porta-abrindo");
    if (
      s.state?.world === "clinic" &&
      s.effect?.kind === "wake" &&
      s.effect.progress > 0.85 &&
      !captured.has("11-acordar")
    )
      await cap("11-acordar");
    if (
      s.state?.world === "corridor" &&
      !s.dialogue &&
      s.lira?.y < 430 &&
      !captured.has("08a-corredor") &&
      (await p.locator("#scene-fade").isHidden())
    )
      await cap("08a-corredor");
    if (
      s.state?.world === "clinic" &&
      s.effect?.kind === "bed-rise" &&
      s.effect.progress > 0.45 &&
      !captured.has("11b-levantar")
    )
      await cap("11b-levantar");
    if (
      s.state?.world === "clinic" &&
      s.effect?.kind === "lira-stand" &&
      s.effect.progress > 0.45 &&
      !captured.has("11c-lira-levantando")
    )
      await cap("11c-lira-levantando");
    if (
      s.state?.world === "clinic" &&
      s.story.motion &&
      s.lira?.y > 450 &&
      !captured.has("11d-saida-caminhando")
    )
      await cap("11d-saida-caminhando");
    const tag = s.state?.world + ":" + s.state?.quest + ":" + s.effect?.kind;
    if (tag !== observed) {
      console.log("FLOW", tag, s.state?.x, s.state?.y, s.lira?.x, s.lira?.y);
      observed = tag;
    }
    if (s.modal === "name") {
      await p.locator("#story-name").fill("Nara");
      await p.getByRole("button", { name: "Confirmar", exact: true }).click();
    } else if (s.modal === "sync") {
      // The normal UI handler decides whether a pulse counts. Dispatch in the
      // same frame as the visible cursor check, avoiding protocol latency.
      await p.waitForFunction(() => {
        const b = document.querySelector("#sync-pulse"),
          v = parseFloat(
            document.querySelector("#sync-cursor")?.style.left || "0",
          );
        if (!b) return true;
        if (b.dataset.inRange === "true" && v >= 44 && v <= 56) {
          b.click();
          return true;
        }
        return false;
      });
      await p.waitForTimeout(400);
    } else if (await p.locator("#dialogue-choices button").count())
      await p.locator("#dialogue-choices button").first().click();
    else if (s.dialogue) {
      await p.locator("#dialogue-next").click();
    } else await p.waitForTimeout(60);
  }
  throw Error("STALLED " + JSON.stringify(await snap()));
}
try {
  await p.goto(
    (process.env.ZIMONS_REVIEW_URL || "http://127.0.0.1:4173") + "/?debug=1",
  );
  await p.locator("#title.active").waitFor();
  await cap("01-entrada-1366");
  await p.setViewportSize({ width: 1920, height: 1080 });
  await cap("02-entrada-1920");
  await p.setViewportSize({ width: 1366, height: 768 });
  await p.locator("#title-new").click();
  await cap("03-personalizacao-feminina");
  await p.locator("[data-gender=male]").click();
  await cap("04-personalizacao-masculina");
  await p.locator("[data-gender=female]").click();
  await p.locator('[data-gender="' + gender + '"]').click();
  if (gender === "male") {
    await p
      .getByRole("button", { name: "Penteado: Undercut", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Modelo da roupa: Uniforme", exact: true })
      .click();
  }
  await cap("04b-aparencia-escolhida");
  await p.locator("#start").click();
  await drive((s) => s.state.quest === "forest");
  await p.waitForTimeout(650);
  await cap("05-floresta");
  await p.locator("#quest-toggle").click();
  await p.waitForTimeout(400);
  await cap("05b-missao-recolhida");
  await p.locator("#quest-toggle").click();
  await p.waitForTimeout(400);
  await cap("05c-protagonista-e-lira");
  timeline.push({
    name: "inicio-caminhada-humana",
    time: (Date.now() - origin) / 1000,
  });
  for (let cycle = 0; cycle < 2; cycle++)
    for (const [axis, target, name] of [
      ["y", 650, "frente"],
      ["x", 560, "direita"],
      ["y", 550, "costas"],
      ["x", 460, "esquerda"],
    ]) {
      const walking = move(p, axis, target);
      await p.waitForTimeout(150);
      await cap("06-caminhada-" + name);
      await walking;
      await p.waitForTimeout(120);
    }
  timeline.push({
    name: "fim-caminhada-humana",
    time: (Date.now() - origin) / 1000,
  });
  await move(p, "y", 600);
  await move(p, "x", 1160);
  await move(p, "y", 500);
  await move(p, "x", 1420);
  await drive((s) => s.state.quest === "entrance");
  await cap("07-academia");
  await navigate(p, 768, 270);
  await drive((s) => s.state.quest === "choose");
  await cap("12-fim-marco-a-laboratorio");
  // Continue only to document the EXISTING Zimon movement and battle renderer.
  // Normal controls; no story skip, teleport, storage injection or model swaps.
  await navigate(p, 640, 470);
  await p.keyboard.press("e");
  await drive((s) => s.scene === "starters");
  await p.locator('[data-starter="' + starter + '"]').click();
  await cap("13-escolha-" + starter);
  await p.locator("#confirm-starter").click();
  await drive((s) => s.modal === "sync");
  await drive((s) => s.scene === "battle" && s.battle.phase === "player");
  await cap("14-batalha-" + starter);
  timeline.push({ name: "inicio-ataques", time: (Date.now() - origin) / 1000 });
  for (const [action, name] of [
    ["attack", "fisico"],
    ["skill", "elemental"],
  ]) {
    if (!(await p.locator("#fight-panel").isVisible()))
      await p.locator('[data-battle-tab="fight"]').click();
    await p.locator('[data-action="' + action + '"]').click();
    await p.waitForFunction(() => {
      const s = window.zimonsDebug.snapshot();
      return (
        s.effect?.kind === "strike" &&
        s.effect.progress > 0.5 &&
        s.effect.progress < 0.8
      );
    });
    await cap("15-ataque-" + name + "-" + starter);
    await p.waitForFunction(
      () => {
        const s = window.zimonsDebug.snapshot();
        return s.battle.result || s.battle.phase === "player";
      },
      { timeout: 30000 },
    );
  }
  timeline.push({ name: "fim-ataques", time: (Date.now() - origin) / 1000 });
  for (let i = 0; i < 35; i++) {
    const s = await snap();
    if (s.battle.result) break;
    if (s.battle.phase !== "player") {
      await p.waitForTimeout(100);
      continue;
    }
    if (!(await p.locator("#fight-panel").isVisible()))
      await p.locator('[data-battle-tab="fight"]').click();
    await p.locator('[data-action="attack"]').click();
    await p.waitForFunction(
      () => {
        const s = window.zimonsDebug.snapshot();
        return s.battle.result || s.battle.phase === "player";
      },
      { timeout: 30000 },
    );
  }
  await p.locator("#battle-result").waitFor({ timeout: 30000 });
  await p.locator("#return-world").click();
  await drive((s) => s.state.quest === "recalibrate");
  // Follow real doors to the monitored lab, unlock practice through dialogue.
  await navigate(p, 640, 674);
  await p.keyboard.press("e");
  await drive((s) => s.state.world === "corridor");
  if (!captured.has("08a-corredor")) await cap("08a-corredor");
  await navigate(p, 496, 171);
  await p.keyboard.press("e");
  await drive((s) => s.state.quest === "practice");
  await p.keyboard.press("t");
  await drive((s) => s.state.transformed);
  await navigate(p, 760, 500);
  await drive((s) => s.state.quest === "return");
  await navigate(p, 760, 500);
  await cap("16-zimon-em-repouso-" + starter);
  timeline.push({
    name: "inicio-caminhada-zimon",
    time: (Date.now() - origin) / 1000,
  });
  for (let cycle = 0; cycle < 2; cycle++)
    for (const [axis, target, name] of [
      ["y", 580, "frente"],
      ["x", 870, "direita"],
      ["y", 500, "costas"],
      ["x", 760, "esquerda"],
    ]) {
      const walking = move(p, axis, target);
      await p.waitForTimeout(150);
      await cap("17-zimon-" + name + "-" + starter);
      await walking;
      await p.waitForTimeout(120);
    }
  timeline.push({
    name: "fim-caminhada-zimon",
    time: (Date.now() - origin) / 1000,
  });
  const last = await snap();
  if (!last.state.transformed || last.state.starter !== starter)
    throw Error("Forma inesperada na evidência");
} catch (e) {
  console.log(e.stack);
  await writeFile(
    dir + "/failure-state.json",
    JSON.stringify(await snap(), null, 2),
  );
  await p.screenshot({ path: dir + "/images/failure.png" });
  errors.push(e.stack);
  process.exitCode = 1;
}
await writeFile(
  dir + "/timeline.json",
  JSON.stringify({ timeline, errors }, null, 2),
);
const video = p.video();
await ctx.close();
console.log("VIDEO", await video.path());
await b.close();
console.log("DONE", errors);
