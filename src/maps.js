import { doorBlocks } from "./doors.js";
import { CLINIC } from "./clinic-layout.js";
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
        652,
        790,
        "Entrada principal",
      ),
      door("plaza-forest", 768, 825, "forest", 1410, 480, "Clareira"),
    ],
  },
  corridor: {
    name: "Academia Zimons · Átrio",
    // Uniform 1280/1446 scale. Do not squash the approved 1446×1087 art.
    size: [1280, 962], art: "corridorV11", indoor: true,
    bounds: [52, 78, 1176, 874],
    walkZones: [
      [76, 218, 1128, 560],
      ...[242,551,824,1112].map(x => [x-48,78,96,164]),
      [600,756,104,196],
    ],
    objects: [],
    exits: [
      door("corridor-clinic",242,215,"clinic",640,640,"Enfermaria"),
      door("corridor-lab",551,215,"lab",640,600,"Laboratório"),
      door("corridor-gym",824,215,"gym",640,640,"Ginásio"),
      door("corridor-dorm",1112,215,"dorm",640,580,"Alojamentos"),
      door("corridor-plaza",652,776,"plaza",768,275,"Praça da Convergência"),
    ],
    doorSpecs: [
      // The first opening uses the unchanged glass leaves sampled from door 2.
      {id:"corridor-clinic",x:180,y:106,w:124,h:79,source:{x:499,y:106,w:111,h:79},openSource:{x:180,y:106,w:124,h:79},upper:true},
      {id:"corridor-lab",x:499,y:106,w:111,h:79,openSource:{x:180,y:106,w:124,h:79},upper:true},
      {id:"corridor-gym",x:766,y:106,w:116,h:79,openSource:{x:180,y:106,w:124,h:79},upper:true},
      {id:"corridor-dorm",x:1054,y:106,w:116,h:79,openSource:{x:180,y:106,w:124,h:79},upper:true},
      {id:"corridor-plaza",x:598,y:800,w:110,h:84,openSource:{x:180,y:106,w:124,h:79},upper:false},
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
      solid(...CLINIC.bedCollision, "clinic-bed"),
      solid(435, 155, 90, 58, "clinic-monitor"),
      solid(...CLINIC.chairCollision, "clinic-chair"),
      solid(783, 152, 217, 118, "clinic-workstation"),
    ],
    exits: [door("clinic-corridor", 640, 674, "corridor", 242, 242, "Átrio")],
  },
  lab: {
    name: "Laboratório de Lira", size: [1280, 722], art: "labApproved", indoor: true,
    bounds: [55, 142, 1170, 605],
    walkZones: [[65,142,1150,482],[575,610,130,137]],
    objects: [
      solid(102,142,176,97,"lab-bench-left"),
      solid(457,160,365,139,"lab-bench-2"),
      solid(619,277,42,40,"lab-chair-central"),
      solid(934,175,266,126,"lab-bench"),
      solid(1048,277,44,40,"lab-chair-right"),
      {type:12,x:640,y:390,w:140,h:87,id:"sync-platform",embedded:true},
    ],
    exits: [door("lab-corridor",640,626,"corridor",551,242,"Átrio")],
    doorSpecs: [{id:"lab-corridor",x:566,y:642,w:147,h:80,upper:false}],
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
    exits: [door("gym-corridor", 640, 674, "corridor", 824, 242, "Átrio")],
  },
  dorm: {
    name: "Alojamento",
    size: [1280, 720],
    floor: 5,
    indoor: true,
    bounds: [64, 176, 1152, 480],
    objects: [],
    exits: [door("dorm-corridor", 640, 640, "corridor", 1112, 242, "Átrio")],
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
  if (doorBlocks(m, x, y, radius)) return false;
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
