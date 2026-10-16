// Technical sheets, explicitly not gameplay screenshots. Uses exactly Assets
// and its runtime atlas assembly. No drawing/repainting of character anatomy.
import { chromium } from "playwright-core";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
const target = new URL(
  "../docs/review/lote01/marco-a-r2/sprites/",
  import.meta.url,
);
await mkdir(target, { recursive: true });
const browser = await chromium.launch({
  ...(existsSync("/usr/bin/chromium")
    ? { executablePath: "/usr/bin/chromium" }
    : {}),
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage();
  await page.goto(process.env.ZIMONS_REVIEW_URL || "http://127.0.0.1:4173");
  const results = await page.evaluate(async () => {
    const { Assets } = await import("/src/assets.js"),
      { DEFAULT_APPEARANCE } = await import("/src/model.js");
    const a = new Assets();
    await a.load();
    await document.fonts.ready;
    const dirs = ["down", "up", "left", "right"],
      labels = ["Frente", "Costas", "Esquerda", "Direita"];
    function sheet(w, h, title, sub) {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const g = c.getContext("2d");
      g.imageSmoothingEnabled = false;
      g.fillStyle = "#142b3a";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#e8d4a4";
      g.font = "600 21px Manrope";
      g.fillText(title, 26, 34);
      g.font = "12px Manrope";
      g.fillStyle = "#abc6d6";
      g.fillText(sub, 26, 59);
      return [c, g];
    }
    const out = {};
    for (const gender of ["female", "male"]) {
      let [c, g] = sheet(
        1040,
        980,
        gender === "female"
          ? "Protagonista feminino · quadros usados na caminhada"
          : "Protagonista masculino · quadros usados na caminhada",
        "Folha técnica do atlas de execução · células 192 px · escala uniforme · Lira como referência à direita",
      );
      dirs.forEach((dir, row) => {
        for (let phase = 0; phase < 4; phase++) {
          const x = 112 + phase * 195,
            y = 274 + row * 222;
          g.strokeStyle = "#63859a40";
          g.beginPath();
          g.moveTo(x - 86, y);
          g.lineTo(x + 86, y);
          g.stroke();
          a.draw(g, gender, dir, a.walkIndex(gender, dir, phase), x, y, 174, {
            ...DEFAULT_APPEARANCE,
            gender,
            bag: 0,
          });
          g.fillStyle = "#d2e4ee";
          g.fillText(labels[row] + " · passo " + (phase + 1), x - 72, y + 24);
        }
        const x = 900,
          y = 274 + row * 222;
        a.draw(g, "lira", dir, a.walkIndex("lira", dir, 0), x, y, 174);
        g.fillText("Lira · proporção", x - 60, y + 24);
      });
      out[gender + "-caminhada.png"] = c.toDataURL();
      for (const [key, label] of [
        ["style", "Cinco cortes"],
        ["outfit", "Cinco roupas"],
      ]) {
        [c, g] = sheet(
          1040,
          1150,
          (gender === "female" ? "Feminino" : "Masculino") + " · " + label,
          "Folha técnica · mesmas camadas usadas no mapa e no criador · sem bolsa para inspecionar anatomia",
        );
        for (let value = 0; value < 5; value++)
          dirs.forEach((dir, col) => {
            const x = 120 + col * 246,
              y = 270 + value * 212;
            a.draw(g, gender, dir, 0, x, y, 174, {
              ...DEFAULT_APPEARANCE,
              gender,
              [key]: value,
              bag: 0,
            });
            g.fillStyle = "#d2e4ee";
            g.fillText(
              (key === "style" ? "Corte " : "Roupa ") +
                (value + 1) +
                " · " +
                labels[col],
              x - 82,
              y + 22,
            );
          });
        out[gender + "-" + key + ".png"] = c.toDataURL();
      }
    }
    let [c, g] = sheet(
      1200,
      510,
      "Escala de exploração · 84 unidades de altura de referência",
      "Bancada técnica · todas as figuras passam por Assets.draw · cenário e câmera não foram simulados",
    );
    for (let row = 0; row < 4; row++)
      ["female", "male", "lira", "fire", "water", "plant"].forEach(
        (key, col) => {
          const x = 118 + col * 192,
            y = 165 + row * 99;
          a.draw(
            g,
            key,
            dirs[row],
            0,
            x,
            y,
            84,
            ["female", "male"].includes(key)
              ? { ...DEFAULT_APPEARANCE, gender: key, bag: 0 }
              : null,
          );
          g.fillStyle = "#bad2df";
          g.fillText(key, x - 30, y + 16);
        },
      );
    out["escala-84.png"] = c.toDataURL();
    for (const [key, name] of [
      ["fire", "Pyron"],
      ["water", "Marivon"],
      ["plant", "Verdrax"],
    ]) {
      [c, g] = sheet(
        1440,
        900,
        name + " · Forma Primordial · quadros originais",
        "Folha técnica · repouso e três fases de movimento disponíveis na fonte · espelhamento lateral quando necessário",
      );
      dirs.forEach((dir, row) => {
        for (let frame = 0; frame < 4; frame++) {
          const x = 210 + frame * 350,
            y = 245 + row * 200;
          a.draw(g, key, dir, frame, x, y, 110);
          g.fillStyle = "#d2e4ee";
          g.fillText(labels[row] + " · quadro " + frame, x - 83, y + 24);
        }
      });
      out[key + "-mapa.png"] = c.toDataURL();
      [c, g] = sheet(
        1140,
        760,
        name + " · poses do atlas de combate em uso",
        "Folha técnica · seis poses desenhadas, não 3D · nenhuma substituição por malha geométrica",
      );
      for (let pose = 0; pose < 6; pose++) {
        const x = 170 + (pose % 3) * 380,
          y = 365 + Math.floor(pose / 3) * 340;
        a.battle.draw(g, key, pose, x, y, 215);
        g.fillStyle = "#d2e4ee";
        g.fillText(
          [
            "Prontidão",
            "Antecipação",
            "Salto",
            "Elemental",
            "Recuperação",
            "Dano",
          ][pose],
          x - 70,
          y + 24,
        );
      }
      out[key + "-combate.png"] = c.toDataURL();
    }
    return out;
  });
  for (const [name, data] of Object.entries(results)) {
    await writeFile(
      new URL(name, target),
      Buffer.from(data.split(",")[1], "base64"),
    );
    console.log(name);
  }
} finally {
  await browser.close();
}
