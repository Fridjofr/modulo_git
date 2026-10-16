import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
const root = fileURLToPath(new URL("..", import.meta.url));
import { navigate, move } from "../tests/browser-v11/helpers.js";
import { mkdir, writeFile } from "node:fs/promises";
const dir = root + "/docs/review/lote01/marco-a";
await mkdir(dir + "/images", { recursive: true });
await mkdir("/tmp/zimons-review-a/video", { recursive: true });
const b = await chromium.launch({
  ...(existsSync("/usr/bin/chromium")
    ? { executablePath: "/usr/bin/chromium" }
    : {}),
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const ctx = await b.newContext({
  viewport: { width: 1366, height: 768 },
  recordVideo: {
    dir: "/tmp/zimons-review-a/video",
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
    if (s.effect?.kind === "bed-lie" && !captured.has("09-deitar"))
      await cap("09-deitar");
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
    const tag = s.state?.world + ":" + s.state?.quest + ":" + s.effect?.kind;
    if (tag !== observed) {
      console.log("FLOW", tag, s.state?.x, s.state?.y, s.lira?.x, s.lira?.y);
      observed = tag;
    }
    if (s.modal === "name") {
      await p.locator("#story-name").fill("Nara");
      await p.getByRole("button", { name: "Confirmar", exact: true }).click();
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
  await p.getByRole("button", { name: "Penteado: Curto", exact: true }).click();
  await p
    .getByRole("button", { name: "Modelo da roupa: Uniforme", exact: true })
    .click();
  await p.locator("#start").click();
  await drive((s) => s.state.quest === "forest");
  await p.waitForTimeout(650);
  await cap("05-floresta");
  for (const [key, name] of [
    ["ArrowDown", "06-caminhada-frente"],
    ["ArrowUp", "06-caminhada-costas"],
    ["ArrowLeft", "06-caminhada-esquerda"],
    ["ArrowRight", "06-caminhada-direita"],
  ]) {
    await p.keyboard.down(key);
    await p.waitForTimeout(180);
    await cap(name);
    await p.keyboard.up(key);
  }
  await navigate(p, 1420, 480);
  await drive((s) => s.state.quest === "entrance");
  await cap("07-academia");
  await navigate(p, 768, 270);
  await drive((s) => s.state.quest === "choose");
  await cap("12-fim-marco-a-laboratorio");
} catch (e) {
  console.log(e.stack);
  await p.screenshot({ path: dir + "/images/failure.png" });
  errors.push(e.stack);
}
await writeFile(
  "/tmp/zimons-review-a/timeline.json",
  JSON.stringify({ timeline, errors }, null, 2),
);
await ctx.close();
await b.close();
console.log("DONE", errors);
