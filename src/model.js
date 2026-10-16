import { FOREST_POINTS, forestStand } from "./world.js";
import { MAPS, mapStand } from "./maps.js";
import { STORY_QUESTS, openingState } from "./story.js";
export const VERSION = 4;
export const SAVE_KEY = "zimons.academia.v2";
export const ELEMENTS = [
  "Água",
  "Fogo",
  "Terra",
  "Planta",
  "Elétrico",
  "Luz",
  "Sombra",
  "Cristal",
];
// Linhas: ataque. Colunas: defesa. Valores omitidos são neutros.
const advantages = {
  Água: { Fogo: 1.5, Terra: 1.5, Planta: 0.75, Elétrico: 0.75 },
  Fogo: { Planta: 1.5, Elétrico: 1.5, Água: 0.75, Terra: 0.75 },
  Terra: { Fogo: 1.5, Elétrico: 1.5, Água: 0.75, Planta: 0.75 },
  Planta: { Água: 1.5, Terra: 1.5, Fogo: 0.75, Elétrico: 0.75 },
  Elétrico: { Água: 1.5, Planta: 1.5, Terra: 0.75, Fogo: 0.75 },
  Luz: { Sombra: 1.5, Luz: 0.75 },
  Sombra: { Luz: 1.5, Sombra: 0.75 },
  Cristal: {
    Água: 1.25,
    Fogo: 1.25,
    Terra: 1.25,
    Planta: 1.25,
    Elétrico: 1.25,
  },
};
export const ELEMENT_TABLE = Object.fromEntries(
  ELEMENTS.map((a) => [
    a,
    Object.fromEntries(ELEMENTS.map((d) => [d, advantages[a]?.[d] ?? 1])),
  ]),
);
export const STARTERS = {
  fire: {
    name: "Pyron",
    element: "Fogo",
    color: "#ff985e",
    role: "Impulso vulcânico",
    desc: "Garras de obsidiana e um coração em brasa. Veloz, feroz e ofensivo.",
    hp: 106,
    power: 1.14,
    defense: 0.96,
    skill: "Lança-chamas",
    delivery: "projectile",
    special: "Explosão primal",
    effect: "burn",
  },
  water: {
    name: "Marivon",
    element: "Água",
    color: "#66d9ff",
    role: "Precisão das marés",
    desc: "Correntes rápidas, movimentos precisos. Técnica e equilíbrio em cada golpe.",
    hp: 116,
    power: 1.04,
    defense: 1.04,
    skill: "Bolhas",
    delivery: "projectile",
    special: "Pulso das marés",
    effect: "weaken",
  },
  plant: {
    name: "Verdrax",
    element: "Planta",
    color: "#a8e477",
    role: "Vontade da floresta",
    desc: "Raízes profundas e uma armadura viva. Resiste, protege e contra-ataca.",
    hp: 132,
    power: 0.98,
    defense: 1.16,
    skill: "Lâminas de folhas",
    delivery: "projectile",
    special: "Raízes ancestrais",
    effect: "root",
  },
};
export const PALETTES = {
  hair: ["#754331", "#292d49", "#d1a35d", "#9d628e"],
  top: ["#244558", "#a45455", "#666282", "#4f776b"],
  bottom: ["#396f9c", "#353e54", "#77585d", "#68816b"],
  skin: ["#edb186", "#c58960", "#8e5a40", "#f5caaa"],
  accent: ["#f3c76a", "#71e3de", "#d99acf", "#e6ebf5"],
};
export const DEFAULT_APPEARANCE = {
  gender: "female",
  hair: 0,
  style: 0,
  outfit: 0,
  legwear: 0,
  top: 0,
  bottom: 0,
  skin: 0,
  accent: 0,
  bag: 1,
};
export function canLinkHere(state) {
  if (!state?.zlink || !state.starter) return false;
  const l = state.story?.lira,
    supervised = l?.visible !== false && l?.world === state.world && !l?.moving;
  if (!supervised) return false;
  return (
    (state.world === "lab" && ["practice", "return"].includes(state.quest)) ||
    (!!state.story.flags.trainingComplete &&
      ["lab", "gym"].includes(state.world))
  );
}
export function newGame(appearance = DEFAULT_APPEARANCE, name = "Alex") {
  return {
    version: VERSION,
    name: name.trim().slice(0, 18) || "Alex",
    appearance: { ...DEFAULT_APPEARANCE, ...appearance },
    world: "forest",
    x: FOREST_POINTS.spawn.x,
    y: FOREST_POINTS.spawn.y,
    dir: "down",
    quest: "awakening",
    story: openingState(),
    zimondex: false,
    health: null,
    energy: 60,
    zlink: false,
    starter: null,
    transformed: false,
    inventory: { tonic: 3 },
    level: 5,
    forms: {},
    duelWins: [],
    challenges: {},
    xp: 0,
    victories: 0,
    seenTransformation: false,
  };
}
export const QUESTS = STORY_QUESTS;
export const WALKABLE = Object.fromEntries(
  Object.entries(MAPS).map(([id, m]) => [id, [m.bounds]]),
);
export const OBSTACLES = Object.fromEntries(
  Object.entries(MAPS).map(([id, m]) => [
    id,
    m.objects.filter((o) => o.solid).map((o) => o.solid),
  ]),
);
export const canStand = (world, x, y, radius = 9) =>
  mapStand(world, x, y, radius);
export function movePlayer(state, direction, seconds) {
  const velocity = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[
    direction
  ];
  if (!velocity) return false;
  state.dir = direction;
  const distance = Math.min(seconds, 0.05) * (state.transformed ? 150 : 150);
  // Small steps prevent tunneling even after a dropped frame.
  const steps = Math.ceil(distance / 3);
  let moved = false;
  for (let i = 0; i < steps; i++) {
    const x = state.x + (velocity[0] * distance) / steps,
      y = state.y + (velocity[1] * distance) / steps;
    if (!canStand(state.world, x, y)) break;
    state.x = x;
    state.y = y;
    moved = true;
  }
  return moved;
}
export function validateSave(input) {
  if (
    !input ||
    input.version !== VERSION ||
    !Object.keys(WALKABLE).includes(input.world) ||
    !Object.keys(QUESTS).includes(input.quest)
  )
    return null;
  const s = newGame();
  if (
    typeof input.name !== "string" ||
    !input.appearance ||
    !Number.isFinite(input.x) ||
    !Number.isFinite(input.y)
  )
    return null;
  for (const k of Object.keys(DEFAULT_APPEARANCE)) {
    const v = input.appearance[k];
    if (
      k === "gender"
        ? !["female", "male"].includes(v)
        : !Number.isInteger(v) ||
          v < 0 ||
          v >=
            (["style", "outfit"].includes(k) ? 5 : (PALETTES[k]?.length ?? 3))
    )
      return null;
  }
  if (input.starter !== null && !Object.keys(STARTERS).includes(input.starter))
    return null;
  if (
    typeof input.zlink !== "boolean" ||
    typeof input.transformed !== "boolean" ||
    (input.transformed && (!input.zlink || !input.starter))
  )
    return null;
  const rank = Object.keys(QUESTS).indexOf(input.quest);
  if (
    (rank >= 4 && !input.zlink) ||
    (rank >= 5 && !input.starter) ||
    (rank < 4 && input.zlink)
  )
    return null;
  Object.assign(s, input, {
    name: input.name.slice(0, 18),
    appearance: { ...input.appearance },
  });
  s.inventory = {
    tonic: Math.max(
      0,
      Math.min(99, Math.trunc(Number(input.inventory?.tonic) || 0)),
    ),
  };
  s.version = VERSION;
  s.forms = {};
  for (const key of Object.keys(STARTERS)) {
    const form = input.forms?.[key];
    if (
      form &&
      Number.isInteger(form.level) &&
      form.level >= 5 &&
      form.level <= 50 &&
      Number.isFinite(form.xp) &&
      form.xp >= 0
    )
      s.forms[key] = {
        level: form.level,
        xp: Math.min(99999, Math.trunc(form.xp)),
      };
  }
  if (s.starter && !s.forms[s.starter])
    s.forms[s.starter] = {
      level: Math.max(5, Math.min(50, Math.trunc(Number(input.level) || 5))),
      xp: 0,
    };
  s.duelWins = Array.isArray(input.duelWins)
    ? [
        ...new Set(
          input.duelWins.filter((id) =>
            ["nico", "aya", "caio", "iris", "rui"].includes(id),
          ),
        ),
      ]
    : [];
  s.level = s.starter ? s.forms[s.starter].level : 5;
  s.xp = Math.max(0, Math.min(99999, Math.trunc(Number(input.xp) || 0)));
  s.victories = Math.max(
    0,
    Math.min(99999, Math.trunc(Number(input.victories) || 0)),
  );
  if (!["up", "down", "left", "right"].includes(s.dir)) s.dir = "down";
  if (!canStand(s.world, s.x, s.y)) {
    const spawn = {
      forest: [FOREST_POINTS.spawn.x, FOREST_POINTS.spawn.y],
      gardens: [80, 395],
      clinic: [640, 560],
      lab: [640, 580],
      plaza: [640, 640],
    }[s.world];
    [s.x, s.y] = spawn;
  }
  return s;
}
export function multiplier(attack, defend) {
  return ELEMENT_TABLE[attack]?.[defend] ?? 1;
}
export const MOVE_LEVELS = { attack: 5, skill: 5, special: 8 };
export const TYPE_ICONS = {
  Fogo: "◆",
  Água: "◉",
  Planta: "❧",
  Terra: "⬡",
  Elétrico: "ϟ",
  Luz: "✧",
  Sombra: "☾",
  Cristal: "◇",
  Físico: "✦",
};
export function knowsMove(level, action) {
  return !MOVE_LEVELS[action] || level >= MOVE_LEVELS[action];
}
export function formProgress(state, key = state.starter) {
  return state.forms?.[key] || { level: Math.max(5, state.level || 5), xp: 0 };
}
export function xpToNext(level) {
  return 80 + (level - 5) * 30;
}
export function addFormXP(state, amount) {
  state.forms ||= {};
  const form = (state.forms[state.starter] ||= {
    level: Math.max(5, state.level || 5),
    xp: 0,
  });
  const previous = form.level;
  form.xp += amount;
  state.xp += amount;
  while (form.level < 50 && form.xp >= xpToNext(form.level)) {
    form.xp -= xpToNext(form.level);
    form.level++;
  }
  state.level = form.level;
  return Object.entries(MOVE_LEVELS)
    .filter(([, level]) => level > previous && level <= form.level)
    .map(([action]) => action);
}
export function createBattle(starter, transformed = false, options = {}) {
  const enemy =
    options.enemy || { fire: "plant", water: "fire", plant: "water" }[starter];
  const level = Math.max(5, options.level || 5),
    enemyLevel = options.enemyLevel || 5;
  const hp = STARTERS[starter].hp + (level - 5) * 3;
  return {
    starter,
    enemy,
    phase: "intro",
    turn: 1,
    result: null,
    world: options.world || "lab",
    origin: options.origin || {
      world: options.world || "lab",
      x: 862,
      y: 451,
      dir: "up",
    },
    storyBattle: options.storyBattle || false,
    mandatory: options.mandatory || false,
    playerName: options.playerName || "Você",
    playerSprite: options.playerSprite || null,
    opponentId: options.id || "lira",
    opponentName: options.name || "Lira",
    opponentSprite: options.sprite || "lira",
    opponentAppearance: options.appearance || null,
    taunt: options.taunt || "Prometo pegar leve… até você me surpreender!",
    rewardForm: options.rewardForm || null,
    repeatable: !!options.repeatable,
    player: {
      hp,
      maxHP: hp,
      energy: 60 + (level - 5) * 2,
      maxEnergy: 60 + (level - 5) * 2,
      transformed,
      level,
      guard: false,
      status: null,
    },
    opponent: {
      hp: options.hp || 118,
      maxHP: options.hp || 118,
      energy: 60 + (enemyLevel - 5) * 2,
      maxEnergy: 60 + (enemyLevel - 5) * 2,
      transformed: false,
      level: enemyLevel,
      guard: false,
      status: null,
    },
    log: [],
  };
}
export function switchBattleForm(state, battle, key) {
  if (!Object.keys(state.forms || {}).includes(key) || key === battle.starter)
    return { error: "Essa forma ainda não está disponível para troca." };
  const previousForm = battle.starter,
    previousTransformed = battle.player.transformed;
  const p = battle.player,
    oldHP = p.hp,
    oldMax = p.maxHP,
    form = state.forms[key];
  p.maxHP = STARTERS[key].hp + (form.level - 5) * 3;
  p.hp = Math.max(oldHP > 0 ? 1 : 0, Math.floor((p.hp / oldMax) * p.maxHP));
  const energyRatio = p.energy / (p.maxEnergy || 60);
  p.maxEnergy = 60 + (form.level - 5) * 2;
  p.energy = Math.floor(energyRatio * p.maxEnergy);
  p.level = form.level;
  p.transformed = true;
  state.starter = key;
  state.level = form.level;
  state.transformed = true;
  battle.starter = key;
  return {
    transform: true,
    to: true,
    previousForm,
    previousTransformed,
    text: `Você sincroniza com ${STARTERS[key].name}. A troca usa um turno.`,
  };
}
export function damageFor(
  attacker,
  defender,
  power,
  element = null,
  enemy = false,
) {
  const factor = element ? multiplier(element, defender.element) : 1;
  return Math.max(
    1,
    Math.round(
      ((power * attacker.power) / defender.defense) *
        factor *
        (enemy ? 0.76 : 1),
    ),
  );
}
export function resolveMove(battle, side, action) {
  const isEnemy = side === "opponent",
    actor = battle[side],
    target = battle[isEnemy ? "player" : "opponent"];
  if (action === "hold" && isEnemy && battle.storyBattle && battle.turn === 1) {
    const text =
      "Lira recua e mantém os braços abertos. Ela tenta alcançar sua consciência, sem revidar.";
    battle.log.push(text);
    return { hold: true, text };
  }
  const key = isEnemy ? battle.enemy : battle.starter,
    targetKey = isEnemy ? battle.starter : battle.enemy;
  const info = STARTERS[key],
    targetInfo = STARTERS[targetKey];
  const name = isEnemy ? battle.opponentName : battle.playerName;
  if (!["transform", "attack", "skill", "special"].includes(action))
    return { error: "Ação inválida." };
  if (!knowsMove(actor.level, action))
    return { error: `Técnica aprendida no nível ${MOVE_LEVELS[action]}.` };
  if (action === "transform") {
    actor.transformed = !actor.transformed;
    return {
      text: `${name} ${actor.transformed ? `sincroniza com ${info.name}` : "retorna à forma humana"}.`,
      transform: true,
    };
  }
  if (!actor.transformed && !actor.partial)
    return { error: "Ative o Z-Link antes de usar técnicas." };
  const cost = action === "special" ? 30 : action === "skill" ? 14 : 0;
  if (actor.energy < cost)
    return {
      error: "Energia insuficiente. Impacto recupera energia.",
    };
  actor.energy = Math.min(
    actor.maxEnergy || 60,
    actor.energy - cost + (action === "attack" ? 6 : 0),
  );
  let damage = damageFor(
    info,
    targetInfo,
    action === "special" ? 30 : action === "skill" ? 24 : 16,
    action === "attack" ? null : info.element,
    isEnemy,
  );
  damage = Math.max(
    1,
    Math.round(
      (damage * (1 + (actor.level - 5) * 0.035)) /
        (1 + (target.level - 5) * 0.018),
    ),
  );
  if (battle.storyBattle && isEnemy) damage = Math.round(damage * 2.4);
  if (actor.status?.type === "weaken") damage = Math.round(damage * 0.75);
  if (target.guard) {
    damage = Math.max(1, Math.round(damage * 0.45));
    target.guard = false;
  }
  const effectiveness =
    action === "attack" ? 1 : multiplier(info.element, targetInfo.element);
  target.hp = Math.max(0, target.hp - damage);
  if (action === "special" && target.hp > 0) {
    target.status = { type: info.effect, turns: 2 };
    if (info.effect === "root") actor.hp = Math.min(actor.maxHP, actor.hp + 12);
  }
  return {
    action,
    delivery: action === "attack" ? "melee" : info.delivery,
    damage,
    effectiveness,
    element: info.element,
    special: action === "special",
    text: `${name}: ${action === "attack" ? "Impacto" : action === "skill" ? info.skill : info.special}. ${damage} de dano.${effectiveness > 1 ? " Vantagem elemental!" : effectiveness < 1 ? " Energia resistida." : ""}${action === "special" ? ` ${info.effect === "burn" ? "Queimadura" : info.effect === "root" ? "Enraizamento" : "Enfraquecimento"} por 2 turnos.` : ""}`,
  };
}
export function tickStatus(actor) {
  if (!actor.status) return "";
  const type = actor.status.type;
  const damage = type === "burn" ? 5 : type === "root" ? 3 : 0;
  actor.hp = Math.max(0, actor.hp - damage);
  actor.status.turns--;
  if (actor.status.turns <= 0) actor.status = null;
  return damage
    ? `${type === "burn" ? "Queimadura" : "Raízes"}: ${damage} de dano residual.`
    : "";
}
export function chooseEnemyAction(battle) {
  if (battle.storyBattle && battle.turn === 1) return "hold";
  const e = battle.opponent;
  if (!e.transformed && !e.partial) return "transform";
  if (!knowsMove(e.level, "skill")) return "attack";
  if (e.energy < 14 || (e.hp < 40 && battle.turn % 3 === 0 && !e.guard))
    return "attack";
  if (knowsMove(e.level, "special") && battle.turn % 3 === 0 && e.energy >= 30)
    return "special";
  return battle.turn % 2 ? "skill" : "attack";
}
export function grantVictory(state, battle = null) {
  if (battle?.storyBattle) return false;
  const tutorial = !battle || battle.opponentId === "lira";
  const first = tutorial
    ? state.quest !== "complete"
    : !state.duelWins.includes(battle.opponentId);
  if (
    (!first || (battle && state.challenges?.[battle.opponentId])) &&
    !battle?.repeatable
  ) {
    state.lastReward = { xp: 0, learned: [], unlocked: null, first: false };
    return false;
  }
  state.victories++;
  if (tutorial) state.quest = "complete";
  else if (first) state.duelWins.push(battle.opponentId);
  const xp = first ? 80 : 25;
  const learned = addFormXP(state, xp);
  if (first) state.inventory.tonic += 2;
  let unlocked = null;
  if (battle?.rewardForm && !state.forms[battle.rewardForm]) {
    unlocked = battle.rewardForm;
    state.forms[unlocked] = { level: 5, xp: 0 };
  }
  state.lastReward = { xp, learned, unlocked, first };
  return first;
}

export function createContainment(state) {
  const b = createBattle(state.starter, true, {
    enemy: "plant",
    level: 5,
    enemyLevel: 18,
    hp: 320,
    id: "lira",
    name: "Lira",
    playerName: state.name,
    sprite: "lira",
    storyBattle: true,
    mandatory: true,
    world: "lab",
  });
  b.opponent.partial = true;
  return b;
}
