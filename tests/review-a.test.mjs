import { test } from "node:test";
import assert from "node:assert/strict";
import { actorCanStand, sceneRoute, clearSegment } from "../src/actor-path.js";
import { MAPS, mapStand } from "../src/maps.js";
import { doorStep, doorway } from "../src/doors.js";
import { CLINIC } from "../src/clinic-layout.js";
import { stageUpdate } from "../src/scene-staging.js";

test("rotas da enfermaria verificam segmentos completos entre pontos fora da grade", () => {
  const routes = [
    [
      [550.7, 420.3],
      [[550, 360], [260, 360], CLINIC.liraApproach],
      { world: "clinic", x: 640, y: 640 },
    ],
    [
      [435.3, 520.7],
      [[470, 263], CLINIC.playerApproach],
      { world: "clinic", x: CLINIC.liraApproach[0], y: CLINIC.liraApproach[1] },
    ],
    [
      CLINIC.liraApproach,
      [
        [540, 360],
        [640, 360],
        [640, 674],
      ],
      { world: "clinic", x: CLINIC.playerRest[0], y: CLINIC.playerRest[1] },
    ],
  ];
  for (const [from, goals, other] of routes) {
    const actor = { world: "clinic", x: from[0], y: from[1] },
      path = sceneRoute("clinic", actor, goals, [other]);
    let previous = from;
    for (const point of path) {
      assert.ok(
        clearSegment(
          (x, y) => actorCanStand("clinic", x, y, actor, [other]),
          previous,
          point,
        ),
        `${previous} -> ${point}`,
      );
      previous = point;
    }
    assert.deepEqual(previous, goals.at(-1));
  }
});
test("a animação da cadeira termina com Lira em piso livre e continua orientada para a cama", () => {
  const s = { story: { lira: {} } };
  stageUpdate(s, { kind: "lira-sit", start: 0, duration: 900 }, 900);
  assert.deepEqual([s.story.lira.x, s.story.lira.y], CLINIC.liraRest);
  assert.equal(s.story.lira.dir, "right");
  stageUpdate(s, { kind: "lira-stand", start: 0, duration: 900 }, 900);
  assert.deepEqual([s.story.lira.x, s.story.lira.y], CLINIC.liraApproach);
  assert.ok(mapStand("clinic", ...CLINIC.liraApproach, 11));
});
test("folhas de portas abrem e fecham sem depender da taxa de quadros", () => {
  for (const fps of [30, 60, 120]) {
    let p = 0;
    for (let i = 0; i < fps; i++) p = doorStep(p, 1, 1000 / fps);
    assert.equal(p, 1);
    for (let i = 0; i < fps; i++) p = doorStep(p, 0, 1000 / fps);
    assert.equal(p, 0);
  }
  for (const map of Object.values(MAPS))
    for (const exit of map.exits) {
      const r = doorway(map, exit);
      if (r) {
        assert.ok(r.x >= 0 && r.y >= 0);
        assert.ok(r.x + r.w <= map.size[0] && r.y + r.h <= map.size[1]);
      }
    }
});
test("aproximação à cama é lateral; transferência articulada não é caminhada através do móvel", () => {
  const s = {
    x: CLINIC.playerApproach[0],
    y: CLINIC.playerApproach[1],
    story: { lira: {} },
  };
  stageUpdate(s, { kind: "bed-lie", start: 0, duration: 1800 }, 0);
  assert.deepEqual([s.x, s.y], CLINIC.playerApproach);
  for (let t = 25; t < 1800; t += 25) {
    stageUpdate(s, { kind: "bed-lie", start: 0, duration: 1800 }, t);
    assert.deepEqual([s.x, s.y], CLINIC.playerApproach);
    assert.equal(s.moving, false);
    assert.ok(mapStand("clinic", s.x, s.y, 11));
  }
  stageUpdate(s, { kind: "bed-lie", start: 0, duration: 1800 }, 1800);
  assert.deepEqual([s.x, s.y], CLINIC.playerRest);
  assert.equal(s.story.resting, true);
  stageUpdate(s, { kind: "bed-rise", start: 0, duration: 1500 }, 1500);
  assert.deepEqual([s.x, s.y], CLINIC.playerApproach);
  assert.equal(s.story.resting, false);
  assert.ok(mapStand("clinic", s.x, s.y, 11));
});
