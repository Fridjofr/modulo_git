import { actorCanStand } from "./actor-path.js";
import { DEFAULT_APPEARANCE, canStand } from "./model.js";
const look = (gender, style, outfit, hair = 0) => ({
  ...DEFAULT_APPEARANCE,
  gender,
  style,
  outfit,
  hair,
  bag: 0,
});
export const NPCS = [
  {
    id: "nico",
    name: "Nico",
    world: "gym",
    x: 1105,
    y: 500,
    dir: "left",
    sprite: "male",
    appearance: look("male", 0, 0, 1),
    duel: {
      enemy: "plant",
      enemyLevel: 5,
      hp: 110,
      taunt: "Preparado? Prometo não cobrar o suco se eu perder!",
    },
    lines: [
      "Boa luta é aquela em que a gente aprende alguma coisa. Quer fazer uma exibição?",
    ],
  },
  {
    id: "nina",
    name: "Nina",
    world: "gym",
    x: 175,
    y: 400,
    dir: "right",
    sprite: "female",
    appearance: look("female", 1, 1, 2),
    duel: {
      enemy: "water",
      enemyLevel: 6,
      hp: 116,
      taunt: "Vamos ver quem consegue acompanhar a corrente!",
    },
    lines: [
      "Sou a Nina. Depois de cair três vezes na primeira Sincro, aprendi a rir um pouco de mim.",
      "Quer treinar comigo? O monitoramento da arena cuida dos indicadores.",
    ],
  },
  {
    id: "caio",
    name: "Caio",
    world: "gym",
    x: 1105,
    y: 350,
    dir: "left",
    sprite: "male",
    appearance: look("male", 3, 3),
    duel: {
      enemy: "fire",
      enemyLevel: 7,
      hp: 126,
      taunt: "Minhas chamas estão prontas. E você?",
    },
    lines: [
      "Gostou da exibição? A gente treina esses movimentos antes de aumentar a força.",
      "No começo tudo parece estranho. O importante é conseguir escolher o que fazer.",
    ],
  },
  {
    id: "mara",
    name: "Mara",
    world: "corridor",
    x: 450,
    y: 520,
    dir: "right",
    sprite: "female",
    appearance: look("female", 4, 4, 1),
    patrol: [
      [450, 520],
      [710, 520],
      [710, 450],
      [450, 450],
    ],
    lines: [
      "Olá! Sou Mara. Estou indo entregar um relatório.",
      "A professora Lira passou aqui com uma caneca enorme. Acho que dormiu pouco outra vez.",
    ],
  },
  {
    id: "aya",
    name: "Aya",
    world: "corridor",
    x: 1090,
    y: 450,
    dir: "down",
    sprite: "female",
    appearance: look("female", 2, 2, 3),
    lines: [
      "Prazer, sou Aya. Estou organizando os registros de pesquisa.",
      "As exibições do ginásio ajudam a estudar como o controle melhora com a prática.",
    ],
  },
  {
    id: "rui",
    name: "Rui",
    world: "plaza",
    x: 1120,
    y: 500,
    dir: "up",
    sprite: "plant",
    patrol: [
      [1120, 500],
      [1250, 500],
      [1250, 570],
      [1120, 570],
    ],
    lines: [
      "Sou Rui. Continuo sendo eu, mesmo nesta forma de Verdrax.",
      "Estou tentando caminhar sem deixar raízes agarradas no chão. Um passo de cada vez.",
    ],
  },
  {
    id: "iris",
    name: "Íris",
    world: "plaza",
    x: 480,
    y: 540,
    dir: "right",
    sprite: "water",
    lines: [
      "Oi! Eu sou Íris. Estou na forma de Marivon para praticar equilíbrio.",
      "Desta vez consegui ficar longe dos sapatos dos outros. É um progresso!",
    ],
  },
];
for (const n of NPCS)
  if (["nico", "nina", "caio", "mara", "aya", "iris"].includes(n.id)) {
    n.sprite = "npc:" + n.id;
    n.human = true;
    n.appearance = null;
  }
const iris = NPCS.find((n) => n.id === "iris");
Object.assign(iris, {
  x: 1050,
  y: 570,
  lines: [
    "Sou Íris. Estou praticando a Sincro com uma essência de Água.",
    "Já consegui atravessar o pátio sem tropeçar. Parece pouco, mas estou comemorando!",
  ],
});
NPCS.push({
  id: "teo",
  name: "Téo",
  world: "plaza",
  x: 480,
  y: 540,
  dir: "right",
  sprite: "water",
  lines: [
    "Olá! Sou Téo. Estou na forma de Marivon para praticar equilíbrio.",
    "Quando comecei, só conseguia pensar no som da água. Agora consigo ouvir as outras pessoas também.",
  ],
});
const live = NPCS.map((n) => ({
  ...n,
  waypoint: 1,
  distance: 0,
  frame: 0,
  moving: false,
  pause: 0,
}));
export function resetNpcs() {
  live.forEach((n, i) =>
    Object.assign(n, NPCS[i], {
      waypoint: 1,
      distance: 0,
      frame: 0,
      moving: false,
      pause: 0,
    }),
  );
}
export function faceDirection(x, y, tx, ty) {
  return Math.abs(tx - x) > Math.abs(ty - y)
    ? tx > x
      ? "right"
      : "left"
    : ty > y
      ? "down"
      : "up";
}
export function worldNpcs(world) {
  return live.filter((n) => n.world === world);
}
export function updateNpcs(
  state,
  dt,
  focusId = null,
  paused = false,
  intent = null,
  controlledActor = null,
) {
  for (const n of worldNpcs(state.world)) {
    if(paused){
      if(n!==controlledActor){n.moving=false;n.frame=0;}
      continue;
    }
    n.moving = false;
    const near = Math.hypot(n.x - state.x, n.y - state.y) < 85;
    if (near && !paused && intent && n.patrol && !n.yieldTarget) {
      const [vx, vy] = {
          up: [0, -1],
          down: [0, 1],
          left: [-1, 0],
          right: [1, 0],
        }[intent] || [0, 0],
        dx = n.x - state.x,
        dy = n.y - state.y;
      if (
        dx * vx + dy * vy > 0 &&
        dx * vx + dy * vy < 70 &&
        Math.abs(dx * vy - dy * vx) < 36
      )
        for (const sign of [-1, 1]) {
          const point = [n.x + vy * sign * 56, n.y - vx * sign * 56];
          if (
            actorCanStand(n.world, ...point, n, [
              state,
              state.story.lira,
              ...worldNpcs(n.world),
            ])
          ) {
            n.yieldTarget = point;
            break;
          }
        }
    }
    if ((near || n.id === focusId) && !n.yieldTarget) {
      n.dir = faceDirection(n.x, n.y, state.x, state.y);
      n.frame = 0;
      continue;
    }
    if (!n.patrol || paused) {
      n.frame = 0;
      continue;
    }
    if (n.pause > 0) {
      n.pause -= dt;
      n.frame = 0;
      continue;
    }
    const [tx, ty] = n.yieldTarget || n.patrol[n.waypoint],
      dx = tx - n.x,
      dy = ty - n.y,
      remaining = Math.abs(dx) + Math.abs(dy),
      step = Math.min(remaining, dt * 65);
    if (remaining < 1) {
      if (n.yieldTarget) delete n.yieldTarget;
      else n.waypoint = (n.waypoint + 1) % n.patrol.length;
      n.pause = 0.65;
      continue;
    }
    const x =
        Math.abs(dx) > 0.1
          ? n.x + Math.sign(dx) * Math.min(step, Math.abs(dx))
          : n.x,
      y =
        Math.abs(dx) > 0.1
          ? n.y
          : n.y + Math.sign(dy) * Math.min(step, Math.abs(dy));
    if (
      actorCanStand(n.world, x, y, n, [
        state,
        state.story.lira,
        ...worldNpcs(n.world),
      ])
    ) {
      n.dir = faceDirection(n.x, n.y, x, y);
      n.x = x;
      n.y = y;
      n.distance += step;
      n.frame = Math.floor(n.distance / 19) % 4;
      n.moving = true;
    }
  }
}
