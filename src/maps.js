// Art, collision and thresholds share world coordinates. Original resources remain archived.
export const TILE = 32;
const solid = (x, y, w, h, id = null) => ({
  type: 0,
  x: x + w / 2,
  y: y + h,
  w,
  h,
  solid: [x, y, w, h],
  id,
  embedded: true,
});
const door = (id, x, y, to, tx, ty, label) => ({ id, x, y, to, tx, ty, label });
export const MAPS = {
  forest: {
    name: "Clareira do Despertar",
    size: [1536, 864],
    art: "forestV11",
    bounds: [102, 310, 1390, 475],
    objects: [
      solid(180, 370, 150, 65, "broken-tree"),
      solid(210, 553, 165, 49, "broken-log"),
      solid(795, 718, 130, 65, "broken-rocks"),
      solid(565, 330, 110, 80),
      solid(1040, 426, 78, 52),
      solid(1250, 350, 90, 65),
      solid(1395, 295, 70, 105),
      solid(1468, 425, 50, 85),
    ],
    exits: [
      door("forest-academy", 1430, 430, "plaza", 768, 780, "Academia Zimons"),
    ],
  },
  plaza: {
    name: "Academia Zimons · Praça da Convergência",
    size: [1536, 864],
    art: "academyApproved",
    bounds: [50, 140, 1436, 700],
    walkZones: [
      [345, 225, 1125, 396],
      [650, 600, 264, 255],
      [688, 145, 160, 150],
    ],
    objects: [],
    exits: [
      door(
        "plaza-entrance",
        768,
        174,
        "corridor",
        640,
        640,
        "Entrada principal",
      ),
      door("plaza-forest", 768, 825, "forest", 1410, 480, "Clareira"),
    ],
  },
  corridor: {
    name: "Academia Zimons · Átrio",
    size: [1280, 720],
    art: "corridorV11",
    indoor: true,
    bounds: [76, 145, 1128, 555],
    walkZones: [
      [90, 174, 1100, 423],
      [584, 580, 112, 120],
      ...[[210, 496, 788, 1070]].flatMap((xs) =>
        xs.map((x) => [x - 42, 145, 84, 65]),
      ),
    ],
    objects: [],
    exits: [
      door("corridor-clinic", 210, 171, "clinic", 640, 640, "Enfermaria"),
      door("corridor-lab", 496, 171, "lab", 640, 640, "Laboratório"),
      door("corridor-gym", 788, 171, "gym", 640, 640, "Ginásio"),
      door(
        "corridor-plaza",
        640,
        680,
        "plaza",
        768,
        275,
        "Praça da Convergência",
      ),
    ],
  },
  clinic: {
    name: "Enfermaria",
    size: [1280, 720],
    art: "clinicApproved",
    indoor: true,
    bounds: [90, 160, 1100, 535],
    walkZones: [
      [105, 160, 1070, 453],
      [584, 600, 112, 95],
    ],
    objects: [
      solid(302, 158, 117, 163, "clinic-bed"),
      solid(235, 194, 55, 85),
      solid(451, 191, 69, 113),
      solid(764, 148, 360, 135),
      solid(101, 168, 80, 100),
    ],
    exits: [door("clinic-corridor", 640, 674, "corridor", 210, 230, "Átrio")],
  },
  lab: {
    name: "Laboratório de Lira",
    size: [1280, 720],
    art: "labApproved",
    indoor: true,
    bounds: [85, 150, 1110, 545],
    walkZones: [
      [95, 150, 1090, 463],
      [584, 600, 112, 95],
    ],
    objects: [
      solid(105, 174, 245, 125, "lab-bench-left"),
      solid(470, 174, 345, 125, "lab-bench-2"),
      solid(920, 174, 235, 125, "lab-bench"),
      solid(110, 420, 140, 130),
      solid(1030, 420, 135, 130),
      {
        type: 12,
        x: 640,
        y: 415,
        w: 192,
        h: 105,
        id: "sync-platform",
        embedded: true,
      },
    ],
    exits: [door("lab-corridor", 640, 674, "corridor", 496, 230, "Átrio")],
  },
  gym: {
    name: "Ginásio de Sincro",
    size: [1280, 720],
    art: "gymV11",
    indoor: true,
    bounds: [95, 162, 1090, 533],
    walkZones: [
      [140, 162, 1000, 460],
      [584, 600, 112, 95],
    ],
    objects: [],
    exits: [door("gym-corridor", 640, 674, "corridor", 788, 230, "Átrio")],
  },
  dorm: {
    name: "Alojamento",
    size: [1280, 720],
    floor: 5,
    indoor: true,
    bounds: [64, 176, 1152, 480],
    objects: [],
    exits: [door("dorm-corridor", 640, 640, "corridor", 1070, 230, "Átrio")],
  },
  gardens: {
    name: "Pátio de descanso",
    size: [1280, 800],
    floor: 2,
    bounds: [48, 176, 1184, 576],
    objects: [],
    water: [[470, 520, 340, 160]],
    exits: [door("garden-plaza", 96, 400, "plaza", 1360, 500, "Academia")],
  },
};
for (const [id, map] of Object.entries(MAPS)) map.id = id;
// Interact with the exposed upper face of these rocks, not beyond the map edge.
MAPS.forest.objects.find((o) => o.id === "broken-rocks").y = 706;
export const FOREST_POINTS = {
  spawn: { x: 460, y: 550 },
  road: { x: 1430, y: 430 },
  log: { x: 370, y: 590 },
  stone: { x: 795, y: 718 },
  stream: { x: 500, y: 335 },
  pond: { x: 1000, y: 330 },
};
export function mapStand(world, x, y, radius = 9) {
  const m = MAPS[world];
  if (!m) return false;
  const [a, b, w, h] = m.bounds;
  if (
    x - radius < a ||
    y - radius < b ||
    x + radius > a + w ||
    y + radius > b + h
  )
    return false;
  if (
    m.walkZones &&
    ![
      [x - radius, y - radius],
      [x + radius, y - radius],
      [x - radius, y + radius],
      [x + radius, y + radius],
    ].every(([px, py]) =>
      m.walkZones.some(
        ([a, b, w, h]) => px >= a && px <= a + w && py >= b && py <= b + h,
      ),
    )
  )
    return false;
  if (
    (m.water || []).some(
      ([a, b, w, h]) =>
        x + radius > a &&
        x - radius < a + w &&
        y + radius > b &&
        y - radius < b + h,
    )
  )
    return false;
  return !m.objects.some(
    (o) =>
      o.solid &&
      x + radius > o.solid[0] &&
      x - radius < o.solid[0] + o.solid[2] &&
      y + radius > o.solid[1] &&
      y - radius < o.solid[1] + o.solid[3],
  );
}
export function objectNear(state, range = 72) {
  return MAPS[state.world]?.objects
    .filter((o) => o.id)
    .find((o) => Math.hypot(state.x - o.x, state.y - o.y) < range);
}
