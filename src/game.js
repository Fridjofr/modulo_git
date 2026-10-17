import { updateDoors, doorAuthorized, resetDoorStates, doorPath, approachingDoor } from "./doors.js";
import { ACTOR_SEPARATION } from "./actor-path.js";
import { MAPS, objectNear } from "./maps.js";
import { stageUpdate } from "./scene-staging.js";
import { FOREST_POINTS, questDescription } from "./world.js";
import { OpeningStory, SCRIPT, SOCIAL } from "./story.js";
import { installGamepad } from "./input.js";
import { Assets } from "./assets.js";
import { LEGWEAR } from "./appearance.js";
import { Renderer } from "./render.js";
import { worldNpcs, updateNpcs, faceDirection, resetNpcs } from "./npcs.js";
import { Music } from "./audio.js";
import { typeBadge } from "./types.js";
import { uiIcon } from "./ui-icons.js";
import {
  STARTERS,
  canLinkHere,
  MOVE_LEVELS,
  knowsMove,
  formProgress,
  xpToNext,
  switchBattleForm,
  DEFAULT_APPEARANCE,
  SAVE_KEY,
  newGame,
  validateSave,
  QUESTS,
  movePlayer,
  createBattle,
  createContainment,
  resolveMove,
  tickStatus,
  chooseEnemyAction,
  grantVictory,
  ELEMENTS,
  ELEMENT_TABLE,
} from "./model.js";

let animationTime = performance.now(),
  realLast = animationTime,
  battleSpeed = 1;
const timers = [];
const clock = () => animationTime;
const $ = (id) => document.getElementById(id);
const assets = new Assets();
const music = new Music();
let folder = "home",
  lastOpponent = null,
  battleNoticeTimer = 0,
  introSkip = false,
  introResume = null;
let renderer,
  state = null,
  scene = "loading",
  appearance = { ...DEFAULT_APPEARANCE },
  previewDirection = "down";
let dialogue = null,
  modal = null,
  sync = null,
  battle = null,
  fx = null,
  lastTime = clock(),
  walkTime = 0;
let lastSave = 0,
  moving = false,
  runToken = 0,
  toastTimer,
  modalReturnFocus,
  savedGame = null,
  modalDone = null;
const keys = new Set();
const story = new OpeningStory({
  state: () => state,
  travel: (exit) => useDoor(exit),
  actors: () => [state, state.story.lira, ...worldNpcs(state.world)],
  npcs: () => worldNpcs("gym"),
  refresh: updateWorldUI,
  talk: storyTalk,
  ask: storyAsk,
  cinematic: (label, active) => {
    document.body.classList.toggle("cinematic", active);
    $("cinematic-title").textContent = label;
    keys.clear();
  },
  transition: storyTransition,
  effect: worldEffect,
  transform: worldTransform,
  stage: stageAction,
  containment: startContainment,
  name: storyName,
  choose: showStarters,
  challenge: () => startBattle(worldNpcs("gym").find((n) => n.id === "nico")),
  sync: startSync,
  reduced: () => reduceMotion,
  maxHP: () =>
    state.starter ? STARTERS[state.starter].hp + (state.level - 5) * 3 : 100,
  notify: toast,
  error: toast,
});
const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
let reduceMotion = reducedMotionQuery.matches;
let briefAnimations = false;
const pace = (normal, brief = 450) => (briefAnimations ? brief : normal);
const wait = (ms) =>
  new Promise((resolve) => timers.push({ due: clock() + ms, resolve }));
const DIRS = ["down", "left", "up", "right"];
const names = {
  hair: "Cabelo",
  top: "Roupa superior",
  bottom: "Roupa inferior",
  skin: "Tom de pele",
  accent: "Acessórios",
};
const bagLabels = ["Conjunto oficial"];
$("reload").onclick = () => location.reload();
reducedMotionQuery.addEventListener("change", (event) => {
  reduceMotion = event.matches;
});

function setScene(next) {
  for (const node of document.querySelectorAll(".scene"))
    node.classList.toggle("active", node.id === next);
  scene = next;
  $("app").dataset.scene = next;
  music.scene = next;
  keys.clear();
  moving = false;
  if (next === "world") updateWorldUI();
}
function toast(text) {
  clearTimeout(toastTimer);
  $("toast").textContent = text;
  $("toast").hidden = false;
  toastTimer = setTimeout(() => {
    $("toast").hidden = true;
  }, 1300);
}
// Session memory only. No local progression/save UI: online persistence is future work.
function save() {
  if (state) savedGame = structuredClone(state);
}
function loadSave() {
  $("continue").hidden = true;
  $("title-continue").hidden = true;
}

function buildCustomization() {
  const root = $("customization");
  root.replaceChildren();
  for (const [key, label, choices] of [
    [
      "style",
      "Penteado",
      ["Oficial"],
    ],
    ["outfit", "Modelo da roupa", ["Oficial"]],
  ]) {
    const section = document.createElement("section");
    section.className = "look-collection";
    const title = document.createElement("h3");
    title.innerHTML = uiIcon(key === "style" ? "eye" : "gear");
    title.append(document.createTextNode(key === "style" ? "Cabelo" : "Roupa"));
    const chosen = document.createElement("span");
    chosen.id = key + "-value";
    chosen.textContent = choices[appearance[key]];
    title.append(chosen);
    section.append(title);
    const grid = document.createElement("div");
    grid.className = "appearance-options";
    choices.forEach((choice, index) => {
      const button = document.createElement("button"),
        c = document.createElement("canvas"),
        caption = document.createElement("small");
      button.className = "appearance-choice";
      button.setAttribute("aria-label", `${label}: ${choice}`);
      button.setAttribute("aria-pressed", String(appearance[key] === index));
      c.width = 144;
      c.height = key === "style" ? 126 : 153;
      const cardLook = { ...appearance, [key]: index, bag: 0 };
      if (key === "style") {
        const head = assets.frame(
          appearance.gender,
          "down",
          0,
          cardLook,
          false,
        );
        const cg = c.getContext("2d");
        cg.imageSmoothingEnabled = false;
        cg.drawImage(head.canvas, 30, 0, 132, 116, 0, 0, 144, 126);
      } else {
        assets.draw(
          c.getContext("2d"),
          appearance.gender,
          "down",
          0,
          72,
          146,
          137,
          cardLook,
          false,
        );
      }
      caption.textContent = choice;
      button.append(c, caption);
      button.onclick = () => {
        appearance[key] = index;
        buildCustomization();
      };
      grid.append(button);
    });
    const pending=document.createElement("small");
    pending.className="appearance-pending";pending.textContent="Novas variações aguardam arte compatível.";
    section.append(grid,pending);
    root.append(section);
  }
  const palettes = document.createElement("section");
  palettes.className = "palette-board";
  for (const key of ["hair", "skin", "accent", "top", "bottom"]) {
    const group = document.createElement("div"),
      title = document.createElement("span"),
      swatches = document.createElement("div");
    group.className = "palette-group";
    title.textContent = names[key];
    swatches.className = "swatches";
    swatches.setAttribute("role", "group");
    swatches.setAttribute("aria-label", names[key]);
    const officialColor={hair:appearance.gender==='male'?'#c9bdb6':'#b79785',skin:'#f4cfb7',top:'#173f76',bottom:'#14325b',accent:'#d5ad4e'};
    [officialColor[key]].forEach((color, index) => {
      const b = document.createElement("button");
      b.className = "swatch";
      b.style.setProperty("--swatch", color);
      b.setAttribute("aria-label", `${names[key]} oficial`);
      b.setAttribute("aria-pressed", String(appearance[key] === index));
      b.disabled = true;
      b.title = "Variação pendente: requer arte compatível com a nova base oficial.";
      b.dataset.option = key;
      b.dataset.value = index;
      b.onclick = () => {
        appearance[key] = index;
        buildCustomization();
      };
      swatches.append(b);
    });
    group.append(title, swatches);
    palettes.append(group);
  }
  const paletteNote=document.createElement("small");
  paletteNote.className="appearance-pending";paletteNote.textContent="Cores oficiais preservadas. Outras cores aguardam arte compatível.";
  palettes.append(paletteNote);
  root.append(palettes);
  const utilities = document.createElement("section");
  utilities.className = "utility-options";
  for (const [key, label, choices] of [
    ["bag", "Acessórios", bagLabels],
    ["legwear", "Calça", LEGWEAR],
  ]) {
    const group = document.createElement("div");
    group.className = "utility-group";
    const h = document.createElement("h3");
    h.textContent = label;
    group.append(h);
    choices.forEach((name, index) => {
      const b = document.createElement("button");
      b.disabled = index !== 0;
      if(index) b.title="Variação pendente: requer arte compatível com a nova base oficial.";
      b.setAttribute(
        "aria-label",
        `${key === "bag" ? "Bolsa / mochila" : "Modelo inferior"}: ${name}`,
      );
      b.setAttribute("aria-pressed", String(appearance[key] === index));
      if (key === "bag") {
        const c = document.createElement("canvas");
        c.width = 70;
        c.height = 76;
        assets.draw(
          c.getContext("2d"),
          appearance.gender,
          "up",
          0,
          35,
          74,
          68,
          { ...appearance, bag: index },
          false,
        );
        b.append(c);
      }
      const copy = document.createElement("span");
      copy.textContent = name;
      b.append(copy);
      b.onclick = () => {
        appearance[key] = index;
        buildCustomization();
      };
      group.append(b);
    });
    utilities.append(group);
  }
  root.append(utilities);
  for (const b of document.querySelectorAll("[data-gender]")) {
    const c = b.querySelector("canvas"),
      ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    assets.draw(
      ctx,
      b.dataset.gender,
      "down",
      0,
      55,
      170,
      161,
      { ...appearance, gender: b.dataset.gender },
      false,
    );
  }
}
function startJourney() {
  if (story.active) return;
  appearance={...DEFAULT_APPEARANCE,gender:appearance.gender,bag:0};
  state = newGame(appearance, "Alex");
  closeModal();
  resetNpcs();
  resetDoorStates();
  renderer.liraState = null;
  setScene("world");
  story.begin();
}
function updateWorldUI() {
  if (!state) return;
  $("location-name").textContent = MAPS[state.world].name;
  $("quest-title").textContent = QUESTS[state.quest][0];
  $("quest-text").textContent =
    questDescription(state) || QUESTS[state.quest][1];
  $("quest-count").textContent = state.story.flags.chapterOne
    ? "EXPLORAÇÃO LIVRE"
    : "CAPÍTULO 01";
  $("identity-name").textContent = `${state.name} · NV ${state.level}`;
  $("identity-form").textContent = state.transformed
    ? "Sincro ativa"
    : "Forma humana";
  $("link-badge").textContent = state.zlink
    ? state.story.freeLink
      ? "Z-LINK"
      : "SUPERVISIONADO"
    : "";
  $("dex-button").hidden = !state.zimondex;
  $("health-readout").textContent = state.starter
    ? `${state.health ?? STARTERS[state.starter].hp} / ${STARTERS[state.starter].hp + (state.level - 5) * 3} HP`
    : "";
  $("world-hp-fill").style.width = state.starter
    ? `${((state.health ?? STARTERS[state.starter].hp) / (STARTERS[state.starter].hp + (state.level - 5) * 3)) * 100}%`
    : "100%";
  const hctx = $("hud-portrait").getContext("2d");
  hctx.clearRect(0, 0, 72, 84);
  assets.draw(
    hctx,
    state.appearance.gender,
    "down",
    0,
    36,
    124,
    119,
    state.appearance,
    state.zlink,
  );
  document.body.dataset.world = state.world;
  music.environment = state.world;
}
function storyTalk(lines) {
  return new Promise((resolve) => openDialogue(lines, resolve));
}
function storyAsk(lines, options) {
  return new Promise((resolve) =>
    openDialogue(
      lines,
      null,
      options.map((text, index) => ({ text, action: () => resolve(index) })),
    ),
  );
}
async function storyTransition(caption, commit) {
  const layer = $("scene-fade");
  layer.querySelector("strong").textContent = "";
  layer.hidden = false;
  layer.classList.add("visible");
  await wait(reduceMotion ? 60 : 220);
  commit();
  setScene("world");
  await wait(reduceMotion ? 40 : 90);
  layer.classList.remove("visible");
  await wait(reduceMotion ? 40 : 200);
  layer.hidden = true;
}
function worldEffect(effect) {
  return new Promise((resolve) => {
    fx = {
      x: state.x,
      y: state.y,
      start: clock(),
      ...effect,
      finish: () => {
        effect.commit?.();
        resolve();
      },
    };
  });
}
async function stageAction(kind) {
  const durations = {
    "close-eyes": 1600,
    "spirit-approach": 2600,
    "bed-rise": 1900,
    "bed-lie": 2100,
    "lira-sit": 1500,
    "lira-stand": 1300,
    "door-open": 620,
    wake: 2600,
    rampage: 8200,
    "partial-world": 3100,
    "partial-recede": 1500,
    delivery: 1500,
    calibration: 2700,
    "red-eyes": 1200,
    exhibition: 11000,
    rest: 1700,
  };
  const l = state.story.lira,
    home = { x: l.x, y: l.y };
  if (kind === "close-eyes") state.story.eyesClosed = true;
  if (kind === "wake") state.story.eyesClosed = false;
  if (kind === "delivery")
    await story.walk(
      l,
      [
        [l.x, state.y],
        [state.x + 38, state.y],
      ],
      150,
    );
  await worldEffect({
    kind,
    x: state.x,
    y: state.y,
    form: state.starter,
    lira: { x: l.x, y: l.y },
    duration: pace(
      durations[kind] || 1700,
      kind === "rampage" ? 1400 : kind === "exhibition" ? 2000 : 500,
    ),
    color: STARTERS[state.starter]?.color || "#9eece5",
  });
  if (kind === "delivery") {
    await story.walk(
      l,
      [
        [home.x, l.y],
        [home.x, home.y],
      ],
      150,
    );
    l.dir = faceDirection(l.x, l.y, state.x, state.y);
  }
  if (kind === "rampage") {
    Object.assign(state, { x: 902, y: 430, dir: "left", moving: false });
    Object.assign(l, { x: 802, y: 425, dir: "right", moving: false });
    state.story.flags.labDamaged = true;
    state.story.flags.labSecondDamage = true;
    state.story.rampagePose = 0;
    state.story.rampageLean = 0;
  }
  if (kind === "bed-rise" || kind === "bed-lie") {
    stageUpdate(state, { kind, start: 0, duration: 1 }, 1);
    state.moving = false;
    delete state.story.bedPose;
  }
  if (kind === "lira-sit" || kind === "lira-stand") {
    stageUpdate(state, { kind, start: 0, duration: 1 }, 1);
    l.seated = kind === "lira-sit";
    delete l.seatProgress;
    l.dir = "right";
  }
  if (kind === "exhibition") {
    delete state.story.demo;
    state.story.dex.water ||= "seen";
    state.story.dex.fire ||= "seen";
  }
}
async function worldTransform(to, unstable = false) {
  music.cue("sync");
  await worldEffect({
    kind: "transform",
    to,
    unstable,
    commit: () => {
      state.transformed = to;
    },
    color: STARTERS[state.starter].color,
    height: 98,
    duration: pace(to ? 5200 : 3000, 650),
  });
  state.transformed = to;
  updateWorldUI();
}

function openDialogue(
  lines,
  onFinish,
  choices = null,
  speaker = "MENTORA LIRA",
  portrait = null,
) {
  keys.clear();
  moving = false;
  dialogue = {
    lines,
    index: 0,
    onFinish,
    choices,
    speaker,
    portrait,
    started: clock(),
    visible: 0,
  };
  $("interaction").hidden = true;
  $("objective").hidden = false;
  $("dialogue").hidden = false;
  renderDialogue();
  $("dialogue-next").focus({ preventScroll: true });
}
function renderDialogue() {
  const item = dialogue.lines[dialogue.index];
  const entry = {
    ...(typeof item === "string"
      ? { speaker: dialogue.speaker, text: item }
      : item),
  };
  if (state?.appearance.gender === "female" && entry.speaker === "player")
    entry.text = entry.text
      .replace(/Obrigado/g, "Obrigada")
      .replace(/transformado/g, "transformada")
      .replace(/cansado/g, "cansada")
      .replace(/Preparado/g, "Preparada")
      .replace(/novo por/g, "nova por");
  if (state?.appearance.gender === "female" && entry.speaker === "lira")
    entry.text = entry.text
      .replace(/você estava desacordado/gi, "você estava desacordada")
      .replace(/Você está machucado/g, "Você está machucada");
  const names = {
    lira: "Lira",
    player: state?.name || "Você",
    narrator: "Zimoria",
    voice: "…",
    system: "Z-Link",
    nico: "Nico",
    aya: "Aya",
    mara: "Mara",
    elias: "Elias",
    nina: "Nina",
    caio: "Caio",
    iris: "Íris",
    rui: "Rui",
    teo: "Téo",
  };
  $("speaker").textContent = (names[entry.speaker] || entry.speaker) +
    (state?.story.whisper && ['player','lira'].includes(entry.speaker) ? ' · em voz baixa' : '');
  dialogue.entry = entry;
  if (state?.story.dream)
    state.story.dreamProgress =
      dialogue.index / Math.max(1, dialogue.lines.length - 1);
  dialogue.started = clock();
  dialogue.visible = 0;
  $("dialogue-text").textContent = reduceMotion ? entry.text : "";
  $("dialogue").dataset.voice = entry.speaker;
  $("dialogue-index").textContent =
    `${dialogue.index + 1} / ${dialogue.lines.length}`;
  const ctx = $("portrait").getContext("2d");
  ctx.clearRect(0, 0, 120, 140);
  let who = dialogue.portrait;
  if (entry.speaker === "player")
    who = { sprite: state.appearance.gender, appearance: state.appearance };
  else if (entry.speaker === "lira") who = { sprite: "lira" };
  else if (
    ["nico", "nina", "caio", "aya", "mara", "iris", "rui", "teo"].includes(
      entry.speaker,
    )
  )
    who = [
      ...worldNpcs("plaza"),
      ...worldNpcs("corridor"),
      ...worldNpcs("gym"),
    ].find((n) => n.id === entry.speaker);
  const neutral = ["narrator", "voice", "system"].includes(entry.speaker);
  $("portrait").hidden = neutral;
  if (!neutral)
    assets.draw(
      ctx,
      who?.sprite || "lira",
      "down",
      0,
      60,
      138,
      132,
      who?.appearance,
      state?.zlink && entry.speaker === "player",
    );
  const last = dialogue.index === dialogue.lines.length - 1;
  $("dialogue-next").hidden = !!(last && dialogue.choices);
  const choices = $("dialogue-choices");
  choices.replaceChildren();
  if (last && dialogue.choices) {
    for (const { text, action } of dialogue.choices) {
      const button = document.createElement("button");
      button.textContent = text;
      button.className = "primary";
      button.onclick = () => {
        endDialogue();
        action();
      };
      choices.append(button);
    }
    choices.querySelector("button")?.focus({ preventScroll: true });
  }
}
function endDialogue() {
  dialogue = null;
  $("dialogue").hidden = true;
  $("objective").hidden = false;
  keys.clear();
}
function advanceDialogue() {
  if (
    !dialogue ||
    (dialogue.index === dialogue.lines.length - 1 && dialogue.choices)
  )
    return;
  if (!reduceMotion && dialogue.visible < dialogue.entry.text.length) {
    dialogue.visible = dialogue.entry.text.length;
    $("dialogue-text").textContent = dialogue.entry.text;
    return;
  }
  if (++dialogue.index < dialogue.lines.length) renderDialogue();
  else {
    const callback = dialogue.onFinish;
    endDialogue();
    callback?.();
  }
}
function storyName() {
  return new Promise((resolve) => {
    openModal("Qual é o seu nome?", "", "name");
    const label = document.createElement("label"),
      input = document.createElement("input"),
      button = document.createElement("button");
    label.textContent = "Lira espera enquanto você tenta se lembrar.";
    input.id = "story-name";
    input.maxLength = 18;
    input.value = state.name;
    input.autocomplete = "off";
    input.setAttribute("aria-label", "Nome do protagonista");
    button.textContent = "Confirmar";
    button.className = "primary wide";
    const confirm = () => {
      if (!input.value.trim()) {
        input.focus();
        return;
      }
      state.name = input.value.trim().slice(0, 18);
      closeModal();
      updateWorldUI();
      resolve();
    };
    button.onclick = confirm;
    input.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.stopPropagation();
        confirm();
      }
    };
    $("modal-body").append(label, input, button);
    input.focus();
    input.select();
  });
}
function liraInteraction() {
  if (state.quest === "analysis") return story.analyze();
  if (state.quest === "recalibrate" && state.world === "lab")
    return story.recalibrate();
  const text =
    {
      forest: "A Academia é por aqui. Vamos pela trilha.",
      arrival: "Vamos primeiro à enfermaria. Depois posso explicar melhor.",
      choose:
        "Três essências responderam à sua calibração. A plataforma pode iniciar a leitura.",
      practice:
        "Use T para iniciar a Sincro. Depois tente alguns passos, sem pressa.",
      return:
        "Agora use T para encerrar a Sincro. Estou acompanhando os indicadores.",
      challenge:
        "Nico está esperando ao lado da arena. Pode conversar com ele quando quiser.",
      room: "Seu quarto fica nos alojamentos. Quero mostrar onde você vai ficar.",
    }[state.quest] ||
    "Os resultados estão melhores. Vou continuar pesquisando aquela primeira reação; se sentir algo estranho, me procure.";
  openDialogue([{ speaker: "lira", text }]);
}
function nearbyInteraction() {
  if (!state || scene !== "world" || story.active) return null;
  const d = (x, y) => Math.hypot(state.x - x, state.y - y),
    l = state.story.lira;
  const exit = MAPS[state.world].exits.find((e) => d(e.x, e.y) < 65);
  if (exit) return { type: "door", text: exit.label, exit };
  const object = objectNear(state, 76);
  if (object) {
    const names = {
      "broken-tree": "Examinar árvore partida",
      "broken-rocks": "Examinar pedras destruídas",
      "claw-marks": "Examinar marcas profundas",
      "clinic-bed":
        state.quest === "sleep" ? "Descansar até amanhã" : "Examinar cama",
      "clinic-mirror": "Observar o espelho",
      "bedside-table": "Observar mesa",
      "medical-monitor": "Examinar equipamento médico",
      "sync-platform":
        state.quest === "choose" ? "Iniciar calibração" : "Examinar plataforma",
      "dorm-bed": "Descansar",
      "dorm-desk": "Examinar mesa",
      "lab-bench": "Examinar bancada",
    };
    return { type: "object", object, text: names[object.id] || "Examinar" };
  }
  if (l.visible && l.world === state.world && d(l.x, l.y) < 82)
    return { type: "lira", text: "Conversar com Lira" };
  const npc = worldNpcs(state.world).find((n) => d(n.x, n.y) < 82);
  if (npc) return { type: "npc", text: `Conversar com ${npc.name}`, npc };
  return null;
}
async function useDoor(e) {
  const s = state,
    from = s.world;
  if (from === "corridor") {
    const allowed = doorAuthorized(s,e);
    if (!allowed) {
      openDialogue([
        {
          speaker: "player",
          text:
            e.to === 'dorm' ? 'A porta dos alojamentos está trancada.' : s.quest === "medical"
              ? "Primeiro, a enfermaria. Lira está me esperando."
              : "Vou terminar o que combinei com Lira antes de visitar este setor.",
        },
      ]);
      return;
    }
  }
  if (s.quest === "sleep" && from === "clinic") {
    openDialogue([
      {
        speaker: "player",
        text: "Lira pediu que eu descansasse. Meu Z-Link ficou com ela para análise.",
      },
    ]);
    return;
  }
  if (s.transformed) {
    await worldTransform(false);
    if (from === "lab" && s.quest === "return") {
      await story.play("DANDO PASSAGEM", () =>
        story.walk(s, [[560, 560]], 130),
      );
      await story.transformed(false);
    }
  }
  await story.play("PASSAGEM", async () => {
    const authored=!!MAPS[from].doorSpecs;
    if(!authored)s.story.openDoor=e.id;
    const guided=await story.beforeDoor(e);
    if(!guided&&!authored)await stageAction("door-open");
    const escorted =
      s.story.lira.visible === false && s.story.lira.world === from;
    if (escorted) s.story.lira.visible = false;
    await story.walk(s, doorPath(MAPS[from],s,e), 135);
    if(authored&&!guided)await story.openDoor(e);
    await story.settleDoor(e,1);
    await story.crossDoor(s,e);
    await story.api.transition(MAPS[e.to].name, () => {
      Object.assign(s, {
        world: e.to,
        x: e.tx,
        y: e.ty,
        dir: e.ty > 500 ? "up" : "down",
      });
      if (escorted) story.enterWithLira(e.to);
    });
  });
  await story.afterDoor(from, e.to);
}
async function interact() {
  if (modal) {
    if (modal === "sync") pulseSync();
    return;
  }
  if (scene !== "world" || fx) return;
  if (dialogue) {
    advanceDialogue();
    return;
  }
  if (story.active) return;
  const target = nearbyInteraction();
  if (!target) return;
  if (target.type === "door") return useDoor(target.exit);
  if (target.type === "lira") {
    state.dir = faceDirection(
      state.x,
      state.y,
      state.story.lira.x,
      state.story.lira.y,
    );
    return liraInteraction();
  }
  if (target.type === "object") {
    const id = target.object.id;
    if (id === "sync-platform" && state.quest === "choose")
      return state.story.flags.calibrated ? showStarters() : story.calibrate();
    if (id === "clinic-bed" && state.quest === "sleep")
      return story.restNight();
    if (id === "dorm-bed") {
      if (state.story.flags.awaitFinalRest) return story.finishChapter();
      if (state.story.flags.roomReady) {
        await story.play("DESCANSO", () =>
          story.api.transition("Um momento de descanso", () => {
            state.health = STARTERS[state.starter].hp + (state.level - 5) * 3;
            state.energy = 60;
          }),
        );
        return;
      }
    }
    const text =
      {
        "broken-tree": "Essa árvore foi quebrada com muita força...",
        "broken-rocks": "Até as pedras foram atingidas.",
        "claw-marks": "Essas marcas... O que poderia ter feito isso?",
        "clinic-bed": "Já descansei o suficiente.",
        "clinic-mirror":
          "Meus olhos parecem normais... É estranho imaginar que ficaram vermelhos.",
        "bedside-table": state.zlink
          ? "Há uma caneca ao lado dos registros médicos."
          : "Meu Z-Link não está aqui. Lira deve estar trabalhando nele.",
        "medical-monitor": "O monitor acompanha meus batimentos e minha recuperação.",
        "clinic-chair": "Lira ficou sentada aqui enquanto eu descansava.",
        "clinic-workstation": "A bancada guarda os registros e os materiais da enfermaria.",
        "lab-bench": state.story.flags.labDamaged
          ? "A tela ainda está rachada. Não lembro de ter atingido essa bancada."
          : "Um terminal acompanha os parâmetros da plataforma.",
        "sync-platform": "O monitor acompanha a estabilidade da Sincro.",
        "dorm-desk": "Uma mesa, uma janela e um lugar para começar.",
      }[id] || "A Academia parece menos estranha a cada novo lugar.";
    openDialogue([{ speaker: "player", text }]);
    return;
  }
  if (target.type === "npc") {
    const n = target.npc;
    state.dir = faceDirection(state.x, state.y, n.x, n.y);
    n.dir = faceDirection(n.x, n.y, state.x, state.y);
    if (n.id === "nico" && state.quest === "challenge")
      return story.challenge();
    if (!state.story.visits.includes(n.id)) state.story.visits.push(n.id);
    if (state.zimondex && STARTERS[n.sprite])
      state.story.dex[n.sprite] ||= "seen";
    openDialogue(
      n.lines.map((text) => ({ speaker: n.id, text })),
      null,
      state.quest === "complete" && n.duel
        ? [
            { text: "Batalha de exibição", action: () => startBattle(n) },
            { text: "Até mais!", action: () => {} },
          ]
        : null,
      n.name,
      n,
    );
  }
}

function openModal(title, text = "", kind = "info") {
  keys.clear();
  moving = false;
  modal = kind;
  $("modal").dataset.kind = kind;
  modalReturnFocus = document.activeElement;
  $("modal-title").textContent = title;
  $("modal").setAttribute(
    "aria-label",
    kind === "menu" ? "Menu de Zimons" : title,
  );
  $("modal-body").replaceChildren();
  $("modal").hidden = false;
  if (text) {
    const p = document.createElement("p");
    p.textContent = text;
    $("modal-body").append(p);
  }
  $("close-modal").focus({ preventScroll: true });
}
function closeModal() {
  const done = modalDone;
  modalDone = null;
  modal = null;
  menuPage = false;
  sync = null;
  $("modal").hidden = true;
  keys.clear();
  if (modalReturnFocus?.isConnected)
    modalReturnFocus.focus({ preventScroll: true });
  done?.();
}
function startSync() {
  openModal(
    "Acompanhe sua respiração",
    "Acompanhe três pulsos de respiração com E, A no controle ou o botão abaixo. Se perder um, espere o próximo. Isto mede seu ritmo: não há escolha errada nem penalidade.",
    "sync",
  );
  sync = { hits: 0, start: clock(), value: 0, cooldown: 0 };
  $("modal-body").insertAdjacentHTML(
    "beforeend",
    '<div class="sync-display"><div class="sync-target"></div><div id="sync-cursor" class="sync-cursor"></div></div><div class="sync-pulses" id="sync-pulses"><span></span><span></span><span></span></div><p id="sync-feedback" role="status">Aguarde o sinal entrar na faixa iluminada.</p><button id="sync-pulse" class="primary wide">Sincronizar · E</button>',
  );
  $("sync-pulse").onclick = pulseSync;
}
function pulseSync() {
  if (!sync || clock() < sync.cooldown) return;
  sync.cooldown = clock() + 350;
  if (sync.value >= 0.35 && sync.value <= 0.7) {
    sync.hits++;
    $("sync-feedback").textContent = `Pulso ${sync.hits} de 3 em sintonia.`;
    [...$("sync-pulses").children].forEach((node, i) =>
      node.classList.toggle("done", i < sync.hits),
    );
    if (sync.hits === 3) {
      closeModal();
      story.crisis();
    }
  } else
    $("sync-feedback").textContent =
      "Quase. Seus pulsos anteriores foram mantidos; tente novamente na faixa ciano.";
}
let selectedStarter = null;
let menuPage = false;
function showStarters() {
  selectedStarter = null;
  setScene("starters");
  $("confirm-starter").disabled = true;
  $("starter-summary").textContent =
    "Aproxime-se de uma única essência para iniciar a avaliação.";
  for (const card of document.querySelectorAll(".starter-card"))
    card.setAttribute("aria-pressed", "false");
}
function buildStarters() {
  Object.entries(STARTERS).forEach(([key, info], i) => {
    const card = document.createElement("button");
    card.className = "starter-card";
    card.dataset.starter = key;
    card.style.setProperty("--element", info.color);
    card.setAttribute("aria-pressed", "false");
    card.setAttribute("aria-label", `${info.name}, ${info.element}`);
    card.innerHTML = `<span class="element-tag">${info.element.toUpperCase()}</span><h2>${info.name}</h2><span class="starter-role">${info.role}</span>`;
    card.onclick = () => {
      const firstSelection = selectedStarter === null;
      selectedStarter = key;
      $("starter-insight").querySelector("p").textContent = {
        fire: "Pyron responde como uma chama inquieta. Lira: ‘Força não é o mesmo que controle. Vamos ouvir essa presença.’",
        water:
          "Marivon responde com um pulso tranquilo. Lira: ‘A calma não significa ausência de força. Preste atenção ao ritmo.’",
        plant:
          "Verdrax responde como raízes encontrando o chão. Lira: ‘Persistência também exige flexibilidade. Não force a conexão.’",
      }[key];
      if (firstSelection) music.cue("sync");
      for (const other of document.querySelectorAll(".starter-card"))
        other.setAttribute("aria-pressed", String(other === card));
      $("starter-summary").textContent =
        `${info.name} · ${info.element} · Este será seu primeiro vínculo.`;
      $("confirm-starter").disabled = false;
    };
    $("starter-grid").append(card);
  });
}
function confirmStarter() {
  if (!selectedStarter || !state.zlink || state.quest !== "choose") return;
  state.starter = selectedStarter;
  state.forms = { [selectedStarter]: { level: 5, xp: 0 } };
  state.health = STARTERS[selectedStarter].hp;
  state.transformed = false;
  setScene("world");
  story.firstLink();
}
async function transform() {
  if (scene !== "world" || dialogue || modal || fx || story.active) return;
  const supervised = ["practice", "return"].includes(state.quest);
  if (!state.zlink || !state.starter || !canLinkHere(state)) {
    toast(
      state.zlink
        ? "A Sincro precisa da supervisão de Lira. Procure-a no ginásio após o treinamento."
        : "Seu pulso ainda não tem um Z-Link.",
    );
    return;
  }
  const to = !state.transformed;
  keys.clear();
  moving = false;
  await worldTransform(to);
  if (supervised) story.transformed(to);
  else toast(to ? "Sincro estabelecida." : "Forma humana restaurada.");
  updateWorldUI();
  save();
}

function showInventory() {
  openModal("Bolsa", "", "inventory");
  const items = [
    {
      id: "tonic",
      name: "Tônico vital",
      category: "Recuperação",
      icon: "tonic",
      count: state.inventory.tonic,
      desc: "Restaura até 40 HP. Em combate, consome um turno.",
    },
  ];
  if (state.zlink)
    items.push({
      id: "zlink",
      name: "Z-Link",
      category: "Objetos-chave",
      icon: "zlink",
      count: 1,
      desc: "Dispositivo de treinamento entregue por Lira. A Sincro precisa de supervisão.",
    });
  if (state.zimondex)
    items.push({
      id: "dex",
      name: "Zimondex",
      category: "Objetos-chave",
      icon: "book",
      count: 1,
      desc: "Registra essências descobertas e distingue avistamentos de almas vinculadas.",
    });
  const root = document.createElement("section");
  root.className = "inventory-screen";
  const tabs = document.createElement("nav");
  tabs.className = "inventory-tabs";
  tabs.setAttribute("aria-label", "Categorias da bolsa");
  const grid = document.createElement("div");
  grid.className = "inventory-grid";
  const detail = document.createElement("article");
  detail.className = "item-detail";
  detail.setAttribute("aria-live", "polite");
  let category = "Todos",
    selected = items[0];
  function details() {
    detail.replaceChildren();
    if (!selected) {
      detail.textContent = "Nenhum item nesta categoria.";
      return;
    }
    const art = document.createElement("div"),
      title = document.createElement("h3"),
      tag = document.createElement("span"),
      description = document.createElement("p"),
      count = document.createElement("small");
    art.className = "item-art";
    art.innerHTML = uiIcon(selected.icon);
    title.textContent = selected.name;
    tag.className = "item-category";
    tag.textContent = selected.category;
    description.textContent = selected.desc;
    count.textContent = `${selected.count} ${selected.count === 1 ? "unidade" : "unidades"}`;
    detail.append(art, title, tag, description, count);
    if (selected.id === "tonic") {
      const use = document.createElement("button");
      use.className = "primary wide";
      use.textContent = "Usar tônico";
      const max = state.starter
        ? STARTERS[state.starter].hp + (state.level - 5) * 3
        : 100;
      use.disabled =
        !selected.count || !state.starter || (state.health ?? max) >= max;
      if (use.disabled) {
        const status = document.createElement("p");
        status.className = "muted";
        status.textContent = selected.count
          ? "Sua vida está completa."
          : "Você não tem tônicos.";
        detail.append(status);
      }
      use.onclick = () => {
        if (use.disabled) return;
        state.health = Math.min(max, state.health + 40);
        state.inventory.tonic--;
        selected.count = state.inventory.tonic;
        updateWorldUI();
        save();
        music.cue("sync");
        render();
      };
      detail.append(use);
    }
  }
  function render() {
    grid.replaceChildren();
    const visible = items.filter(
      (item) => category === "Todos" || item.category === category,
    );
    if (!visible.includes(selected)) selected = visible[0];
    for (let i = 0; i < 12; i++) {
      const item = visible[i],
        slot = document.createElement("button");
      slot.className = "inventory-slot";
      if (item) {
        slot.setAttribute("aria-label", `${item.name}, ${item.count} unidades`);
        slot.setAttribute("aria-pressed", String(item === selected));
        slot.innerHTML = uiIcon(item.icon);
        const count = document.createElement("b");
        count.textContent = item.count;
        slot.append(count);
        slot.onclick = () => {
          selected = item;
          render();
        };
      } else {
        slot.disabled = true;
        slot.classList.add("empty");
        slot.setAttribute("aria-label", "Espaço vazio");
        slot.innerHTML = uiIcon("link");
      }
      grid.append(slot);
    }
    for (const tab of tabs.children)
      tab.setAttribute("aria-pressed", String(tab.textContent === category));
    details();
  }
  for (const value of ["Todos", "Recuperação", "Objetos-chave"]) {
    const tab = document.createElement("button");
    tab.textContent = value;
    tab.onclick = () => {
      category = value;
      render();
    };
    tabs.append(tab);
  }
  root.append(tabs, grid, detail);
  $("modal-body").append(root);
  render();
}
function elementTable() {
  const wrap = document.createElement("div");
  const p = document.createElement("p");
  p.textContent =
    "Linhas atacam; colunas defendem. Impacto é físico e neutro. Cristal não oferece resistência defensiva automática.";
  wrap.append(p);
  const table = document.createElement("table");
  table.className = "element-table";
  table.innerHTML = `<thead><tr><th>ATQ ↓ / DEF →</th>${ELEMENTS.map((e) => `<th>${e}</th>`).join("")}</tr></thead><tbody>${ELEMENTS.map(
    (a) =>
      `<tr><th>${a}</th>${ELEMENTS.map((d) => {
        const m = ELEMENT_TABLE[a][d];
        return `<td class="${m > 1 ? "adv" : m < 1 ? "res" : ""}">${String(m).replace(".", ",")}×</td>`;
      }).join("")}</tr>`,
  ).join("")}</tbody>`;
  wrap.append(table);
  return wrap;
}
function menuBack() {
  if (modal === "name") return;
  if (menuPage) {
    menuPage = false;
    showMenu();
  } else closeModal();
}
function menuOpen(fn) {
  fn();
  menuPage = true;
  const back = document.createElement("button");
  back.className = "menu-page-back";
  back.textContent = "← Menu";
  back.onclick = () => {
    menuPage = false;
    showMenu();
  };
  $("modal-body").prepend(back);
  back.focus({ preventScroll: true });
}
function showForms() {
  openModal(
    "Seus vínculos",
    "Cada alma é uma forma que seu próprio corpo pode assumir.",
    "forms",
  );
  if (!state.starter) {
    const empty = document.createElement("p");
    empty.className = "empty-slot";
    empty.textContent =
      "Seu primeiro vínculo ainda aguarda o encontro com Lira.";
    $("modal-body").append(empty);
    return;
  }
  for (const key of Object.keys(state.forms)) {
    const info = STARTERS[key],
      card = document.createElement("article");
    card.className = "bound-form";
    const canvas = document.createElement("canvas");
    canvas.width = 260;
    canvas.height = 220;
    assets.draw(canvas.getContext("2d"), key, "right", 0, 130, 200, 170);
    const copy = document.createElement("div"),
      title = document.createElement("h3"),
      desc = document.createElement("p");
    title.textContent = info.name;
    desc.textContent = `${info.element} · Nível ${state.forms[key].level} · Alma vinculada`;
    copy.append(title, desc);
    card.append(canvas, copy);
    $("modal-body").append(card);
  }
}
function showSettings() {
  openModal("Configurações", "Ajuste sua experiência.", "settings");
  const setting = document.createElement("label");
  setting.className = "setting-row";
  setting.textContent = "Reduzir movimentos e revelar textos completos";
  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = reduceMotion;
  check.onchange = () => (reduceMotion = check.checked);
  setting.append(check);
  const volume = document.createElement("label");
  volume.className = "setting-row";
  volume.textContent = "Volume da música";
  const range = document.createElement("input");
  Object.assign(range, {
    type: "range",
    min: 0,
    max: 1,
    step: 0.05,
    value: music.volume,
  });
  range.setAttribute("aria-label", "Volume da música");
  range.oninput = () => music.setVolume(range.value);
  volume.append(range);
  const quick = document.createElement("label");
  quick.className = "setting-row";
  quick.textContent = "Animações breves (opcional)";
  const q = document.createElement("input");
  q.type = "checkbox";
  q.checked = briefAnimations;
  q.setAttribute("aria-label", "Animações breves");
  q.onchange = () => (briefAnimations = q.checked);
  quick.append(q);
  $("modal-body").append(setting, quick, volume);
}
function showMenu() {
  menuPage = false;
  openModal("", "", "menu");
  const profile = document.createElement("section");
  profile.className = "journey-profile";
  const portrait = document.createElement("canvas");
  portrait.width = 144;
  portrait.height = 160;
  assets.draw(
    portrait.getContext("2d"),
    state.appearance.gender,
    "down",
    0,
    72,
    151,
    132,
    state.appearance,
    state.zlink,
  );
  const copy = document.createElement("div"),
    name = document.createElement("h3"),
    detail = document.createElement("p"),
    location = document.createElement("small");
  name.textContent = state.name;
  detail.textContent = state.starter
    ? `${STARTERS[state.starter].name} · Nível ${state.level}`
    : "O começo de uma conexão";
  location.textContent = $("location-name").textContent;
  copy.append(name, detail, location);
  profile.append(portrait, copy);
  const buttons = document.createElement("nav");
  buttons.className = "menu-buttons";
  buttons.setAttribute("aria-label", "Menu da jornada");
  const entries = [
    ["◇", "Missões", "O caminho até aqui", showJournal],
    ["▣", "Bolsa", "Itens e equipamentos", showInventory],
    [
      "✧",
      "Vínculos",
      state.starter ? "Sua forma Zimon" : "Ainda sem vínculo",
      showForms,
    ],
  ];
  entries.unshift([
    "◈",
    "Zimondex",
    state.zimondex ? "Almas e descobertas" : "Aguardando entrega",
    showDex,
  ]);
  entries.push(["⌖", "Mapa", "Explore Zimoria", showMap]);
  if (state.zlink)
    entries.push([
      "↗",
      "Afinidades elementais",
      "Vantagens e resistências",
      () => {
        openModal("Afinidades elementais");
        $("modal-body").append(elementTable());
      },
    ]);
  entries.push([
    "⚙",
    "Configurações",
    "Música e acessibilidade",
    showSettings,
  ]);
  for (const [icon, title, subtitle, fn] of entries) {
    const button = document.createElement("button"),
      glyph = document.createElement("span"),
      copy = document.createElement("span"),
      label = document.createElement("strong"),
      small = document.createElement("small"),
      arrow = document.createElement("span");
    glyph.className = "journey-glyph";
    glyph.innerHTML = uiIcon(
      {
        Zimondex: "book",
        Missões: "quest",
        Bolsa: "bag",
        Vínculos: "link",
        Mapa: "map",
        "Afinidades elementais": "affinities",
        Configurações: "gear",
      }[title],
    );
    label.textContent = title;
    small.textContent = subtitle;
    arrow.textContent = "›";
    arrow.setAttribute("aria-hidden", "true");
    button.setAttribute("aria-label", title);
    button.disabled = title === "Zimondex" && !state.zimondex;
    copy.append(label);
    button.append(glyph, copy, arrow);
    button.onclick = () => menuOpen(fn);
    buttons.append(button);
  }
  const footer = document.createElement("div");
  footer.className = "journey-footer";
  const resume = document.createElement("button");
  resume.className = "primary";
  resume.textContent = "Retomar exploração";
  resume.onclick = closeModal;
  const title = document.createElement("button");
  title.className = "quiet";
  title.textContent = "Voltar à entrada";
  title.onclick = () => {
    save();
    closeModal();
    $("title-continue").hidden = false;
    setScene("title");
  };
  footer.append(resume, title);
  $("modal-body").append(profile, buttons, footer);
}
function showMap() {
  openModal("Mapa da região", $("location-name").textContent);
  const c = document.createElement("canvas");
  c.width = 960;
  c.height = 540;
  c.className = "region-map";
  $("modal-body").append(c);
  renderer.drawMinimap(state, c.getContext("2d"), 960, 540, true);
}
function showJournal() {
  openModal("Missões", "CAPÍTULO I · O DESPERTAR");
  const stages = Object.keys(QUESTS),
    current = stages.indexOf(state.quest);
  const main = document.createElement("article");
  main.className = "quest-step current";
  const title = document.createElement("strong");
  title.textContent =
    (state.quest === "complete" ? "✓ " : "◇ ") + QUESTS[state.quest][0];
  main.append(title);
  const description = document.createElement("p");
  description.textContent = questDescription(state) || QUESTS[state.quest][1];
  main.append(description);
  $("modal-body").append(main);
  const history = document.createElement("section");
  history.hidden = true;
  history.className = "quest-list";
  for (const key of stages.slice(0, current)) {
    const row = document.createElement("article");
    row.className = "quest-step done";
    const h = document.createElement("strong");
    h.textContent = "✓ " + QUESTS[key][0];
    row.append(h);
    history.append(row);
  }
  const expand = document.createElement("button");
  expand.className = "quiet wide";
  expand.textContent = `Etapas concluídas · ${current}`;
  expand.setAttribute("aria-expanded", "false");
  expand.onclick = () => {
    history.hidden = !history.hidden;
    expand.setAttribute("aria-expanded", String(!history.hidden));
  };
  $("modal-body").append(expand, history);
}

function showDex() {
  if (!state.zimondex) return;
  openModal("Zimondex", "", "dex");
  const root = document.createElement("section"),
    grid = document.createElement("nav"),
    detail = document.createElement("article");
  root.className = "dex-screen";
  grid.className = "dex-grid";
  grid.setAttribute("aria-label", "Registros de essências");
  detail.className = "dex-detail";
  const keys = ["fire", "water", "plant"],
    names = ["Primordial", "Sincronizada", "Ascendida"];
  const crops = {
    fire: [
      [201, 6, 107, 106],
      [181, 365, 158, 165],
      [164, 866, 203, 211],
    ],
    water: [
      [337, 15, 97, 97],
      [335, 432, 119, 127],
      [335, 907, 140, 159],
    ],
    plant: [
      [257, 7, 115, 141],
      [207, 418, 167, 172],
      [231, 895, 160, 180],
    ],
  };
  const discovered = (key, stage) =>
    stage === 0 ? !!state.story.dex[key] : !!state.story.dex[key + ":" + stage];
  const linked = (key, stage) => stage === 0 && !!state.forms[key];
  function sprite(c, key, stage, known) {
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    if (!stage)
      assets.battle.draw(
        g,
        key,
        0,
        c.width / 2,
        c.height * 0.94,
        c.height * 0.78,
      );
    else {
      const [x, y, w, h] = crops[key][stage],
        scale = Math.min((c.width * 0.85) / w, (c.height * 0.88) / h);
      g.drawImage(
        assets.images[key],
        x,
        y,
        w,
        h,
        c.width / 2 - (w * scale) / 2,
        c.height * 0.94 - h * scale,
        w * scale,
        h * scale,
      );
    }
    if (!known) {
      g.globalCompositeOperation = "source-in";
      g.fillStyle = "#07121e";
      g.fillRect(0, 0, c.width, c.height);
    }
  }
  function select(key, stage) {
    detail.replaceChildren();
    for (const card of grid.children)
      card.setAttribute(
        "aria-pressed",
        String(card.dataset.dex === key + ":" + stage),
      );
    const known = discovered(key, stage),
      bound = linked(key, stage),
      h = document.createElement("h3"),
      c = document.createElement("canvas"),
      tag = document.createElement("div"),
      status = document.createElement("span"),
      p = document.createElement("p");
    h.textContent = `${String(keys.indexOf(key) * 3 + stage + 1).padStart(3, "0")} · ${known ? STARTERS[key].name : "???"}`;
    c.width = 360;
    c.height = 310;
    sprite(c, key, stage, known);
    tag.innerHTML = known ? typeBadge(STARTERS[key].element) : "";
    status.className = "dex-state";
    status.innerHTML = uiIcon(bound ? "link" : known ? "eye" : "lock");
    status.append(
      document.createTextNode(
        bound ? "Alma vinculada" : known ? "Avistado" : "Desconhecido",
      ),
    );
    p.textContent = known
      ? `${names[stage]} · ${STARTERS[key].desc}`
      : "Esta essência ainda não foi descoberta. Sua silhueta faz parte do registro incompleto.";
    detail.append(h, tag, c, status, p);
  }
  for (const key of keys)
    for (let stage = 0; stage < 3; stage++) {
      const known = discovered(key, stage),
        card = document.createElement("button"),
        c = document.createElement("canvas"),
        h = document.createElement("strong"),
        status = document.createElement("small"),
        n = document.createElement("span");
      card.className = "dex-entry";
      card.dataset.dex = key + ":" + stage;
      card.dataset.stage = String(stage + 1);
      c.width = 130;
      c.height = 100;
      sprite(c, key, stage, known);
      n.className = "dex-number";
      n.textContent = String(keys.indexOf(key) * 3 + stage + 1).padStart(
        3,
        "0",
      );
      h.textContent = known ? STARTERS[key].name : "???";
      status.textContent = linked(key, stage)
        ? "✧ Alma vinculada"
        : known
          ? "Avistado"
          : "Desconhecido";
      card.append(n, c, h, status);
      card.onclick = () => select(key, stage);
      grid.append(card);
    }
  root.append(grid, detail);
  $("modal-body").append(root);
  select(state.starter, 0);
}
function updateGender() {
  document
    .querySelectorAll("[data-gender]")
    .forEach((n) =>
      n.setAttribute(
        "aria-pressed",
        String(n.dataset.gender === appearance.gender),
      ),
    );
}

function message(text) {
  $("battle-message").textContent = text;
  $("battle").classList.add("has-battle-notice");
  clearTimeout(battleNoticeTimer);
  battleNoticeTimer = setTimeout(() => $("battle").classList.remove("has-battle-notice"), 3200);
  battle.log.push(text);
  if (battle.log.length > 100) battle.log.shift();
}
function updateBattleUI() {
  const p = battle.player,
    e = battle.opponent,
    info = STARTERS[battle.starter],
    enemy = STARTERS[battle.enemy];
  $("battle").style.setProperty("--battle-element", info.color);
  $("battle").dataset.containment = String(battle.storyBattle);
  $("battle").dataset.stage = battle.phase === "intro" ? "intro" : "fight";
  $("battle").setAttribute("aria-label", `Duelo contra ${battle.opponentName}`);
  $("battle-location").textContent = MAPS[battle.world].name.toUpperCase();
  $("combat-player").textContent = battle.playerName;
  $("combat-enemy").textContent = battle.opponentName;
  $("combat-level").textContent = `NV ${p.level}`;
  $("combat-enemy-level").textContent = `NV ${e.level}`;
  $("combat-player-form").innerHTML =
    typeBadge(info.element) +
    `<span class="form-state ${state.story.possessed ? "possessed" : ""}">${state.story.possessed && p.hp > 0 ? "POSSESSÃO" : p.transformed ? "PRIMORDIAL" : "FORMA HUMANA"}</span>`;
  $("combat-enemy-form").innerHTML =
    typeBadge(enemy.element) +
    `<span class="form-state">${e.partial ? "MANIFESTAÇÃO PARCIAL" : e.transformed ? "PRIMORDIAL" : "SINCRONIZANDO"}</span>`;
  for (const [side, actor] of [
    ["player", p],
    ["enemy", e],
  ]) {
    const hp =
      battle.displayHP?.[side === "enemy" ? "opponent" : "player"] ?? actor.hp;
    $(`${side}-hp`).textContent = `${hp} / ${actor.maxHP} HP`;
    $(`${side}-hp-fill`).style.width = `${(hp / actor.maxHP) * 100}%`;
    $(`${side}-hp-fill`).classList.toggle("low", actor.hp < actor.maxHP * 0.3);
    $(`${side}-status`).textContent = actor.status
      ? { burn: "Queimadura", root: "Raízes", weaken: "Enfraquecido" }[
          actor.status.type
        ] + ` · ${actor.status.turns}`
      : actor.guard
        ? "Defesa ativa"
        : "";
  }
  $("energy-fill").style.width = `${(p.energy / (p.maxEnergy || 60)) * 100}%`;
  $("energy-label").textContent = `${p.energy} / ${p.maxEnergy || 60} MP`;
  $("enemy-energy-fill").style.width = `${(e.energy / (e.maxEnergy || 60)) * 100}%`;
  $("enemy-energy-label").textContent = `${e.energy} / ${e.maxEnergy || 60} MP`;
  const progress = formProgress(state, battle.starter);
  $("experience-label").textContent =
    `EXP ${progress.xp} / ${xpToNext(p.level)}`;
  $("experience-fill").style.width =
    `${Math.min(100, (progress.xp / xpToNext(p.level)) * 100)}%`;
  $("skill-name").textContent = info.skill;
  $("skill-glyph").innerHTML = typeBadge(info.element);
  $("special-glyph").innerHTML = typeBadge(info.element);
  $("special-name").textContent = info.special;
  for (const action of ["attack", "skill", "special"]) {
    const mult =
      action === "attack" ? 1 : ELEMENT_TABLE[info.element][enemy.element];
    $(`${action}-details`).innerHTML =
      typeBadge(action === "attack" ? "Físico" : info.element) +
      `<span class="move-cost">${action === "attack" ? "+6" : action === "skill" ? "14" : "30"} MP</span><span class="affinity ${mult > 1 ? "advantage" : mult < 1 ? "resisted" : ""}" title="${mult} vezes o dano">${mult > 1 ? "↑ Vantagem" : mult < 1 ? "↓ Resistido" : "↔ Neutro"} · ${String(mult).replace(".", ",")}×</span>`;
    document.querySelector(`[data-action="${action}"]`).hidden =
      !knowsMove(p.level, action) ||
      (battle.storyBattle && action === "special");
  }
  $("locked-technique-three").hidden = !document.querySelector('[data-action="special"]').hidden;
  $("next-move").hidden = true;
  $("tonic-count").textContent = `+40 HP · ${state.inventory.tonic} restantes`;
  $("transform-label").textContent = p.transformed
    ? "Retornar ao humano"
    : "Ativar Z-Link";
  $("phase-label").textContent = battle.result
    ? "DUELO ENCERRADO"
    : battle.phase === "player"
      ? `O QUE ${battle.playerName.toUpperCase()} VAI FAZER?`
      : battle.phase === "intro"
        ? "PREPARAÇÃO DO VÍNCULO"
        : battle.phase === "enemy"
          ? `MOVIMENTO DE ${battle.opponentName.toUpperCase()}`
          : "EXECUTANDO TÉCNICA";
  $("turn-label").textContent =
    `TURNO ${String(battle.turn).padStart(2, "0")} · DUELO`;
  for (const button of document.querySelectorAll("[data-action]")) {
    const action = button.dataset.action;
    button.disabled =
      battle.phase !== "player" ||
      !!battle.result ||
      (battle.storyBattle && !["attack", "skill"].includes(action)) ||
      !knowsMove(p.level, action) ||
      (["attack", "skill", "special"].includes(action) && !p.transformed) ||
      (action === "skill" && p.energy < 14) ||
      (action === "special" && p.energy < 30) ||
      (action === "tonic" && (!state.inventory.tonic || p.hp === p.maxHP));
  }
  for (const b of document.querySelectorAll(
    "[data-battle-tab],#leave-training,#folder-back,[data-form]",
  ))
    b.disabled =
      battle.phase !== "player" ||
      !!battle.result ||
      b.dataset.form === battle.starter;
  for (const name of ["fight", "bag", "swap", "exit"]) {
    const button=document.querySelector(`[data-battle-tab="${name}"]`);
    button.hidden=false;
    const locked=(name==="exit" && battle.mandatory) || (["bag","swap"].includes(name) && battle.storyBattle);
    button.disabled ||= locked;
    button.title=locked ? "Indisponível durante este duelo obrigatório" : "";
  }
  $("turn-label").textContent = battle.storyBattle
    ? `CONTENÇÃO · INSTINTO PRIMORDIAL · TURNO ${battle.turn}`
    : `TURNO ${battle.turn}`;
  renderForms();
}
function renderForms() {
  const signature = JSON.stringify([
    battle.starter,
    battle.phase,
    battle.result,
    state.forms,
  ]);
  if ($("form-options").dataset.signature === signature) return;
  $("form-options").dataset.signature = signature;
  $("form-options").replaceChildren();
  for (const [key, form] of Object.entries(state.forms)) {
    const info = STARTERS[key],
      button = document.createElement("button");
    button.dataset.form = key;
    button.style.setProperty("--form-color", info.color);
    button.disabled =
      key === battle.starter || battle.phase !== "player" || !!battle.result;
    button.innerHTML = `<canvas width="90" height="70" aria-hidden="true"></canvas><strong>${info.name}</strong>${typeBadge(info.element)}<small>NV ${form.level} · ${key === battle.starter ? "FORMA ATUAL" : "Sincronizar"}</small>`;
    assets.draw(
      button.querySelector("canvas").getContext("2d"),
      key,
      "down",
      0,
      45,
      66,
      55,
    );
    button.onclick = () => playerAction("swap:" + key);
    $("form-options").append(button);
  }
}
function setBattleTab(tab, force = false) {
  if (!force && (battle.phase !== "player" || battle.result)) return;
  if (tab === "home") tab="fight";
  if (tab === "exit" && battle.mandatory) return;
  if (battle.storyBattle && ["swap", "bag"].includes(tab)) return;
  folder = tab;
  $("home-panel").hidden=false;
  for (const name of ["fight", "bag", "swap", "exit"])
    $(`${name}-panel`).hidden = name !== tab;
  for (const button of document.querySelectorAll("[data-battle-tab]"))
    button.setAttribute("aria-pressed",String(button.dataset.battleTab===tab));
  $("folder-heading").hidden=false;
  $("folder-title").textContent =
    { fight:"Selecione um golpe", bag:"Bolsa", swap:"Zimons", exit:"Encerrar o duelo" }[tab] || "";
}
async function animateBattle(result, side, token) {
  if (token !== runToken) return;
  if (result.hold) {
    message(result.text);
    fx = {
      kind: "restraint",
      side: "opponent",
      start: clock(),
      duration: pace(1500, 400),
    };
    await wait(fx.duration);
    if (token === runToken) fx = null;
    return;
  }
  let transformDuration = 0;
  if (result.previousForm && result.previousTransformed) {
    fx = {
      kind: "transform",
      side,
      fromForm: result.previousForm,
      to: false,
      start: clock(),
      duration: pace(3000, 400),
      height: 205,
      color: STARTERS[result.previousForm].color,
    };
    await wait(fx.duration);
    if (token !== runToken) return;
    fx = null;
  }
  const target = side === "player" ? "opponent" : "player";
  battle.displayHP = result.damage
    ? {
        [target]: Math.min(
          battle[target].maxHP,
          battle[target].hp + result.damage,
        ),
      }
    : null;
  message(
    result.damage
      ? `${side === "player" ? battle.playerName : battle.opponentName} prepara ${result.action === "attack" ? "Impacto" : result.action === "special" ? STARTERS[side === "player" ? battle.starter : battle.enemy].special : STARTERS[side === "player" ? battle.starter : battle.enemy].skill}…`
      : result.text,
  );
  updateBattleUI();
  if (result.transform)
    fx = {
      kind: "transform",
      x: side === "player" ? 340 : 924,
      y: side === "player" ? 485 : 385,
      start: clock(),
      duration: pace(battle[side].transformed ? 5200 : 3000, 500),
      height: 170,
      side,
      to: battle[side].transformed,
      color: STARTERS[side === "player" ? battle.starter : battle.enemy].color,
    };
  else if (result.damage) {
    fx = {
      kind: "strike",
      side,
      target,
      action: result.action,
      delivery: result.delivery,
      damage: result.damage,
      effectiveness: result.effectiveness,
      element: result.element,
      start: clock(),
      duration: pace(
        result.special ? 2300 : result.action === "skill" ? 2000 : 1650,
        280,
      ),
      color: STARTERS[side === "player" ? battle.starter : battle.enemy].color,
    };
    const duration = fx.duration;
    await wait(duration * 0.68);
    if (token !== runToken) return;
    battle.displayHP = null;
    message(result.text);
    updateBattleUI();
    music.cue("hit");
    await wait(duration * 0.32);
    if (token !== runToken) return;
    fx = null;
  } else if (result.guard || result.healed)
    fx = {
      kind: result.guard ? "guard" : "heal",
      x: side === "player" ? 340 : 924,
      y: side === "player" ? 485 : 385,
      start: clock(),
      duration: 650,
      color: result.guard ? "#99dbef" : "#a2e8aa",
    };
  if (result.transform) transformDuration = fx?.duration || 0;
  await wait(result.transform ? transformDuration + 50 : pace(500, 250));
  if (token === runToken) fx = null;
}
async function waitIntro(ms) {
  if (introSkip) return;
  await new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      introResume = null;
      resolve();
    };
    introResume = finish;
    timers.push({ due: clock() + ms, resolve: finish });
  });
}
async function startBattle(npc = null) {
  npc = npc?.duel ? npc : null;
  if (!npc || !state.story.flags.trainingComplete) return;
  lastOpponent = npc;
  closeModal();
  endDialogue();
  if(state.story.flags.arenaOccupied)return;
  state.story.flags.arenaOccupied=true;
  if(story.active)await story.arenaEntry(npc);
  else await story.play('ENTRADA NA ARENA',()=>story.arenaEntry(npc));
  const token = ++runToken;
  const origin = { world: state.world, x: state.x, y: state.y, dir: state.dir };
  battle = createBattle(state.starter, state.transformed, {
    enemyLevel: 6,
    ...(npc?.duel || {}),
    id: npc?.id || "lira",
    name: npc?.name || "Lira",
    sprite: npc?.sprite || "lira",
    appearance: npc?.appearance,
    level: formProgress(state).level,
    playerName: state.name,
    world: "gym",
    mandatory: state.quest === "challenge",
    repeatable: true,
    origin,
  });
  battle.player.hp = Math.max(
    1,
    Math.min(battle.player.maxHP, state.health ?? battle.player.maxHP),
  );
  battle.player.energy = Math.max(
    0,
    Math.min(battle.player.maxEnergy, state.energy ?? battle.player.maxEnergy),
  );
  if (state.zimondex) state.story.dex[battle.enemy] ||= "seen";
  if (npc && !npc.human && !["male", "female"].includes(npc.sprite))
    battle.opponent.transformed = true;
  renderer.beginBattle(state, battle);
  setBattleTab("home", true);
  fx = null;
  introSkip = false;
  $("battle-result").hidden = true;
  $("battle-intro").hidden = false;
  setScene("battle");
  updateBattleUI();
  $("intro-speaker").textContent = battle.opponentName;
  $("intro-text").textContent = `“${battle.taunt}”`;
  $("intro-stage").textContent = "GINÁSIO · MONITORAMENTO DE SINCRO";
  message(`${battle.opponentName}: ${battle.taunt}`);
  await waitIntro(pace(3200, 120));
  if (token !== runToken) return;
  $("intro-speaker").textContent = state.name;
  $("intro-text").textContent = npc
    ? "“Combinado. Vamos ver se consigo acompanhar você.”"
    : "“Estou aqui, Lira. Vou prestar atenção no meu ritmo.”";
  $("intro-stage").textContent = "Z-LINK · CONTATO → SINTONIA → FORMA";
  const already = {
    player: battle.player.transformed,
    opponent: battle.opponent.transformed,
  };
  fx = {
    kind: "transform",
    side: "both",
    to: true,
    already,
    start: clock(),
    duration:
      introSkip || Object.values(already).every(Boolean) ? 1 : pace(5200, 650),
    color: STARTERS[battle.starter].color,
    enemyColor: STARTERS[battle.enemy].color,
    height: 230,
    x: 340,
    y: 485,
  };
  music.cue("sync");
  await waitIntro(fx.duration);
  if (token !== runToken) return;
  for (const side of ["player", "opponent"])
    if (!battle[side].transformed) resolveMove(battle, side, "transform");
  fx = null;
  $("battle-intro").hidden = true;
  battle.phase = "player";
  message("Sintonia concluída. Seu turno começa agora.");
  updateBattleUI();
}
async function startContainment() {
  const token = ++runToken;
  closeModal();
  endDialogue();
  battle = createContainment(state);
  fx = null;
  renderer.beginBattle(state, battle);
  setBattleTab("fight", true);
  $("battle-result").hidden = true;
  $("battle-intro").hidden = false;
  battle.partialReady = true;
  const layer = $("scene-fade");
  layer.querySelector("strong").textContent =
    "Lira assume uma posição de contenção";
  layer.hidden = false;
  layer.classList.add("visible");
  await wait(pace(1000, 80));
  setScene("battle");
  updateBattleUI();
  await wait(pace(1000, 100));
  layer.classList.remove("visible");
  await wait(pace(850, 80));
  layer.hidden = true;
  introSkip = false;
  $("intro-speaker").textContent = "Lira";
  $("intro-text").textContent =
    `“${state.name}, eu não vou atacar primeiro. Tente escutar minha voz.”`;
  $("intro-stage").textContent = "O MESMO LABORATÓRIO · CONTENÇÃO";
  await waitIntro(pace(1700, 150));
  if (token !== runToken) return;
  fx = null;
  $("battle-intro").hidden = true;
  battle.phase = "player";
  message("Seu corpo reage por instinto. A voz de Lira parece distante.");
  updateBattleUI();
}
function checkBattleEnd() {
  if (battle.opponent.hp <= 0) {
    finishBattle(true);
    return true;
  }
  if (battle.player.hp <= 0) {
    finishBattle(false);
    return true;
  }
  return false;
}
async function playerAction(action) {
  if (scene !== "battle" || modal || battle.phase !== "player" || battle.result)
    return;
  if (battle.storyBattle && !["attack", "skill"].includes(action)) return;
  const token = runToken;
  battle.phase = "resolving";
  updateBattleUI();
  let result;
  if (action === "tonic") {
    if (state.inventory.tonic < 1 || battle.player.hp === battle.player.maxHP) {
      battle.phase = "player";
      updateBattleUI();
      return;
    }
    const healed = Math.min(40, battle.player.maxHP - battle.player.hp);
    state.inventory.tonic--;
    battle.player.hp += healed;
    save();
    result = {
      healed,
      text: `Você usa um tônico vital e recupera ${healed} HP.`,
    };
  } else if (action.startsWith("swap:")) {
    result = switchBattleForm(state, battle, action.slice(5));
    if (!result.error) {
      save();
      setBattleTab("home", true);
    }
  } else result = resolveMove(battle, "player", action);
  if (result.error) {
    message(result.error);
    battle.phase = "player";
    updateBattleUI();
    return;
  }
  await animateBattle(result, "player", token);
  if (token !== runToken || checkBattleEnd()) return;
  // Duration belongs to the affected actor's completed turns, including non-attack actions.
  const playerStatus = tickStatus(battle.player);
  if (playerStatus) message(`Você: ${playerStatus}`);
  updateBattleUI();
  if (checkBattleEnd()) return;
  battle.phase = "enemy";
  updateBattleUI();
  await wait(pace(500, 180));
  if (token !== runToken) return;
  const enemyAction = chooseEnemyAction(battle);
  await animateBattle(
    resolveMove(battle, "opponent", enemyAction),
    "opponent",
    token,
  );
  if (token !== runToken || checkBattleEnd()) return;
  const enemyStatus = tickStatus(battle.opponent);
  if (enemyStatus) message(`${STARTERS[battle.enemy].name}: ${enemyStatus}`);
  updateBattleUI();
  if (checkBattleEnd()) return;
  battle.turn++;
  battle.phase = "player";
  updateBattleUI();
}
async function finishBattle(win) {
  if (battle.storyBattle) {
    // A real defeat of the protagonist, not a victory while controlling Lira.
    battle.result = win ? "win" : "loss";
    battle.phase = "ended";
    state.challenges.lira = { result: battle.result };
    state.story.flags.contained = !win;
    updateBattleUI();
    message(
      "As patas perdem força. Lira ampara a queda e impede que o corpo bata nos equipamentos.",
    );
    fx = {
      kind: "fall",
      side: "player",
      start: clock(),
      duration: pace(1300, 400),
    };
    await wait(fx.duration);
    battle.fallen = true;
    fx = null;
    message(`Lira: “${state.name}? A Sincro ainda está ativa. Vou ficar com você.”`);
    await wait(pace(900,250));
    $("result-title").textContent = "Sincro interrompida.";
    $("result-text").textContent =
      "O protagonista continua inconsciente. Lira chama a equipe médica e acompanha o atendimento. A recuperação não será imediata.";
    $("rewards").replaceChildren();
    $("retry").hidden = true;
    $("return-world").textContent = "Acompanhar o socorro →";
    $("battle-result").hidden = false;
    $("return-world").focus();
    return;
  }
  $("retry").hidden = true;
  $("return-world").textContent = "Voltar à Academia →";
  battle.result = win ? "win" : "loss";
  battle.phase = "ended";
  fx = null;
  const first = win ? grantVictory(state, battle) : false;
  state.challenges[battle.opponentId] = { result: battle.result };
  battle.player.maxHP =
    STARTERS[battle.starter].hp + (formProgress(state).level - 5) * 3;
  battle.player.maxEnergy = 60 + (formProgress(state).level - 5) * 2;
  if (battle.player.transformed || battle.opponent.transformed) {
    battle.phase = "resolving";
    fx = {
      kind: "transform",
      side: "both",
      to: false,
      already: {
        player: !battle.player.transformed,
        opponent: !battle.opponent.transformed,
      },
      start: clock(),
      duration: pace(3000, 450),
      color: STARTERS[battle.starter].color,
      enemyColor: STARTERS[battle.enemy].color,
      height: 200,
    };
    await wait(fx.duration);
    battle.player.transformed = false;
    battle.opponent.transformed = false;
    fx = null;
  }
  battle.phase = "ended";
  state.transformed = false;
  state.health = battle.player.maxHP;
  state.energy = battle.player.maxEnergy || 60;
  battle.player.hp = battle.player.maxHP;
  battle.player.energy = battle.player.maxEnergy || 60;
  // A training defeat never strands the player without resources.
  if (!win) state.inventory.tonic = Math.max(state.inventory.tonic, 3);
  save();
  updateBattleUI();
  $("result-title").textContent = win
    ? "Sintonia alcançada."
    : "Todo vínculo se aprende.";
  $("result-text").textContent = win
    ? `Você venceu o duelo contra ${battle.opponentName}. Sua forma está no nível ${state.level}.`
    : `${battle.opponentName} encerrou o duelo em segurança. Você está recuperado e tem pelo menos três tônicos para os próximos desafios.`;
  $("rewards").replaceChildren();
  const reward = state.lastReward;
  const rewards = win
    ? [
        `+${reward.xp} EXP`,
        `NÍVEL ${state.level}`,
        ...(first ? ["+2 TÔNICOS"] : []),
        ...reward.learned.map(
          (action) =>
            `APRENDEU ${STARTERS[state.starter][action].toUpperCase()}`,
        ),
      ]
    : ["RECUPERAÇÃO COMPLETA", "TÔNICOS REPOSTOS"];
  for (const text of rewards) {
    const span = document.createElement("span");
    span.textContent = text;
    $("rewards").append(span);
  }
  if (win) music.cue("win");
  $("battle-result").hidden = false;
  $("return-world").focus({ preventScroll: true });
}
async function returnWorld() {
  if (scene !== "battle" || !battle?.result || battle.returning) return;
  battle.returning = true;
  ++runToken;
  $("battle-result").hidden = true;
  if (battle.storyBattle) {
    setScene("world");
    story.recovered();
    return;
  }
  if (battle.player.transformed || battle.opponent.transformed) {
    fx = {
      kind: "transform",
      side: "both",
      to: false,
      already: {player: !battle.player.transformed, opponent: !battle.opponent.transformed},
      start: clock(),
      duration: pace(3000, 400),
      height: 205,
      color: STARTERS[battle.starter].color,
      enemyColor: STARTERS[battle.enemy].color,
    };
    await wait(fx.duration);
  }
  battle.player.transformed = false;
  battle.opponent.transformed = false;
  state.transformed = false;
  fx = null;
  Object.assign(state, battle.origin);
  setScene("world");
  await story.play('SAÍDA DA ARENA',()=>story.arenaExit());
  save();
  if (state.quest === "challenge" && !state.story.flags.nicoResolved) {
    state.story.flags.nicoResolved = true;
    story.afterDuel();
  }
}
function requestLeaveBattle() {
  if (battle.phase !== "player" || battle.result || battle.mandatory) return;
  openModal(
    "Encerrar o treinamento?",
    "Você volta à Academia sem recompensa. Os tônicos usados continuam consumidos. Você poderá participar de outra exibição depois.",
    "leave-battle",
  );
  const yes = document.createElement("button");
  yes.className = "primary wide";
  yes.textContent = "Voltar à Academia";
  yes.onclick = () => {
    closeModal();
    state.transformed = battle.player.transformed;
    state.health = battle.player.maxHP;
    state.energy = battle.player.maxEnergy;
    battle.result = "escape";
    state.challenges[battle.opponentId] = { result: "escape" };
    returnWorld();
  };
  const no = document.createElement("button");
  no.className = "quiet wide";
  no.textContent = "Continuar combate";
  no.onclick = closeModal;
  $("modal-body").append(yes, no);
}
function showHistory() {
  openModal("Registro do treinamento");
  const list = document.createElement("div");
  list.className = "history-list";
  for (const line of battle.log) {
    const p = document.createElement("p");
    p.textContent = line;
    list.append(p);
  }
  $("modal-body").append(list, elementTable());
  list.scrollTop = list.scrollHeight;
}
function drawPreview(time) {
  if (!$("creator-terrain").dataset.ready) {
    const c = $("creator-terrain"),
      g = c.getContext("2d");
    const light = g.createLinearGradient(0, 0, 0, c.height);
    light.addColorStop(0, "#213a4a");
    light.addColorStop(1, "#0b1929");
    g.fillStyle = light;
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = "#83bec11c";
    g.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      g.beginPath();
      g.moveTo((i * c.width) / 6, 0);
      g.lineTo((i * c.width) / 6, c.height);
      g.stroke();
    }
    c.dataset.ready = "true";
  }

  const ctx = $("preview").getContext("2d");
  ctx.clearRect(0, 0, 400, 340);
  renderer.shadow(ctx, 200, 280, 68);
  assets.draw(
    ctx,
    appearance.gender,
    previewDirection,
    reduceMotion
      ? 0
      : assets.walkIndex(
          appearance.gender,
          previewDirection,
          Math.floor(time / 165) % 4,
        ),
    200,
    280,
    230,
    appearance,
    false,
  );
  for (const [i, dir] of ["down", "right", "up", "left"].entries()) {
    const c = document.querySelectorAll(".appearance-views canvas")[i];
    if (!c) continue;
    const v = c.getContext("2d");
    v.clearRect(0, 0, c.width, c.height);
    assets.draw(
      v,
      appearance.gender,
      dir,
      reduceMotion
        ? 0
        : assets.walkIndex(appearance.gender, dir, Math.floor(time / 180) % 4),
      48,
      91,
      83,
      appearance,
      false,
    );
  }
}
function update(realTime) {
  animationTime +=
    Math.min(100, Math.max(0, realTime - realLast)) *
    (scene === "battle" && !modal ? battleSpeed : 1);
  realLast = realTime;
  const time = clock();
  for (let i = timers.length - 1; i >= 0; i--)
    if (time >= timers[i].due) {
      const [timer] = timers.splice(i, 1);
      timer.resolve();
    }
  const clockDt=Math.max(0,(time-lastTime)/1000);
  const dt = Math.min(clockDt, 0.05);
  lastTime = time;
  if (scene === "creator") drawPreview(time);
  if (scene === "title")
    for (const c of document.querySelectorAll("[data-cast]")) {
      const g = c.getContext("2d"),
        key = c.dataset.cast;
      g.clearRect(0, 0, c.width, c.height);
      const bob = reduceMotion ? 0 : Math.sin(time / 900 + key.length) * 2;
      renderer.shadow(g, 110, c.height - 15, 55);
      if (STARTERS[key]) {
        const actor = assets.battle.actors[key],
          f = actor.frames[0],
          height = Math.min(
            155,
            ((c.width - 16) * actor.referenceHeight) / (f.right - f.left + 1),
          ),
          scale = height / actor.referenceHeight,
          x = c.width / 2 - ((f.left + f.right) / 2 - f.anchor) * scale;
        assets.battle.draw(g, key, 0, x, c.height - 15 + bob, height);
      } else
        assets.draw(
          g,
          key,
          "down",
          0,
          110,
          c.height - 15 + bob,
          230,
          { ...DEFAULT_APPEARANCE, gender: key },
          false,
        );
    }
  $("story-skip").hidden =
    scene !== "world" || !story.active || !!modal || !!dialogue?.choices;
  if (scene === "world") {
    updateDoors(MAPS[state.world],state,clockDt);
    story.update(dt);
    stageUpdate(state, fx, time);
    updateNpcs(
      state,
      dt,
      dialogue?.portrait?.id,
      !!modal || !!dialogue || story.active,
      [...keys]
        .reverse()
        .find((k) => k.startsWith("arrow"))
        ?.slice(5),
      story.motion?.actor,
    );
    moving = false;
    if (!dialogue && !modal && !fx && !story.active && !document.hidden) {
      const direction = [...keys]
        .reverse()
        .find((k) =>
          ["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k),
        );
      const beforeX = state.x,
        beforeY = state.y;
      if (direction)
        moving = movePlayer(
          state,
          {
            w: "up",
            s: "down",
            a: "left",
            d: "right",
            arrowup: "up",
            arrowdown: "down",
            arrowleft: "left",
            arrowright: "right",
          }[direction],
          dt,
        );
      const lira = renderer.liraLocation(state, time);
      // Story actors occupy space, but never block narrow doorways.
      const actors = [
        ...worldNpcs(state.world),
        ...(lira.world === state.world ? [lira] : []),
      ];
      if (
        direction &&
        actors.some(
          (n) =>
            n.visible !== false &&
            Math.hypot(state.x - n.x, state.y - n.y) < ACTOR_SEPARATION,
        )
      ) {
        state.x = beforeX;
        state.y = beforeY;
        moving = false;
      }
      if (moving) walkTime += Math.hypot(state.x - beforeX, state.y - beforeY);
      state.story.openDoor =
        MAPS[state.world].exits.find(
          (e) => doorAuthorized(state,e) && approachingDoor(MAPS[state.world],e,state),
        )?.id || null;
      const target = nearbyInteraction();
      $("interaction").hidden = !target;
      if (target)
        $("interaction").querySelector("span").textContent = target.text;
      if (time - lastSave > 3000 && moving) {
        save();
        lastSave = time;
      }
    } else $("interaction").hidden = true;
    if (fx && time - fx.start >= fx.duration) {
      const done = fx.finish;
      fx = null;
      done?.();
    }
    renderer.drawWorld(
      state,
      time,
      state.moving
        ? state.frame || 0
        : moving
          ? Math.floor(walkTime / 21) % 4
          : 0,
      fx,
      reduceMotion,
    );
  }
  if (scene === "world" && !dialogue && !modal && !fx && !story.active)
    story.checkTriggers();
  if (dialogue && !reduceMotion) {
    const count = Math.min(
      dialogue.entry.text.length,
      Math.floor((time - dialogue.started) / 23),
    );
    dialogue.visible = Math.max(dialogue.visible, count);
    $("dialogue-text").textContent = dialogue.entry.text.slice(
      0,
      dialogue.visible,
    );
  }
  pollGamepad(time);
  if (scene === "starters") {
    const ctx = $("starter-stage").getContext("2d"),
      key = selectedStarter || "fire";
    ctx.imageSmoothingEnabled = false;
    const image = assets.images.labApproved;
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, -60, 960, 540);
    const x = 480,
      y = 258;
    renderer.shadow(ctx, x, y, 48);
    ctx.strokeStyle = STARTERS[key].color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y, 64, 19, 0, 0, Math.PI * 2);
    ctx.stroke();
    assets.battle.draw(
      ctx,
      key,
      0,
      x,
      y + (reduceMotion ? 0 : Math.sin(time / 750) * 2),
      132,
    );
  }
  if (scene === "battle") {
    // Battle animation owners commit actor state before clearing their effects.
    renderer.drawBattle(state, battle, time, fx, reduceMotion);
  }
  if (sync) {
    sync.value = ((time - sync.start) % 2100) / 2100;
    $("sync-cursor").style.left = `${sync.value * 100}%`;
    $("sync-pulse").dataset.inRange = String(
      sync.value >= 0.35 && sync.value <= 0.7,
    );
  }
  requestAnimationFrame(update);
}
const pollGamepad = installGamepad({
  keys,
  scene: () => scene,
  locked: () => !!dialogue || !!modal || !!fx || story.active,
  confirm: () => {
    if (dialogue) {
      if (dialogue.choices && dialogue.index === dialogue.lines.length - 1)
        document.activeElement?.click();
      else advanceDialogue();
    } else if (scene === "world" && !modal) interact();
    else document.activeElement?.click();
  },
  cancel: () => {
    if (modal) menuBack();
    else if (scene === "battle" && folder !== "home") setBattleTab("home");
    else if (scene === "world" && !dialogue && !story.active && !fx) showMenu();
  },
  transform,
  menu: () => {
    if (state && scene === "world" && !dialogue && !story.active && !fx)
      modal ? menuBack() : showMenu();
  },
});
function skipStoryStep() {
  if (scene !== "world" || !story.active || modal || dialogue?.choices) return;
  if (dialogue) {
    const done = dialogue.onFinish;
    endDialogue();
    done?.();
    return;
  }
  if (fx?.finish) {
    const done = fx.finish;
    fx = null;
    done();
    return;
  }
  if (story.motion) {
    // Keep footsteps, collision and the follower's route when skipping a walk.
    story.skipWalk();
  }
}
function installEvents() {
  for (const [id, icon, label] of [
    ["journal-button", "quest", "Missões"],
    ["dex-button", "book", "Zimondex"],
    ["inventory", "bag", "Bolsa"],
    ["menu", "gear", "Menu"],
  ])
    $(id).innerHTML = uiIcon(icon) + `<span>${label}</span>`;
  $("story-skip").onclick = skipStoryStep;
  $("battle-speed").onclick = () => {
    battleSpeed = battleSpeed === 3 ? 1 : battleSpeed + 1;
    $("battle-speed").textContent = battleSpeed + "×";
    $("battle-speed").setAttribute(
      "aria-label",
      `Velocidade da batalha: ${battleSpeed} vezes`,
    );
  };
  for (const [id, factor] of [
    ["minimap-zoom-in", 0.8],
    ["minimap-zoom-out", 1.25],
  ])
    $(id).onclick = () => {
      renderer.radarRange = Math.max(
        320,
        Math.min(1600, (renderer.radarRange || 610) * factor),
      );
    };
  $("title-new").onclick = () => setScene("creator");
  $("creator-back").onclick = () => setScene("title");
  $("title-continue").onclick = () => {
    if (savedGame) {
      state = structuredClone(savedGame);
      setScene("world");
      toast("Sessão retomada.");
    }
  };
  $("title-settings").onclick = showSettings;
  $("title-credits").onclick = () =>
    openModal(
      "Créditos",
      "ZIMONS · Conexão além da evolução. Universo, história e designs originais do autor do projeto. Desenvolvimento desta versão com assistência do Codex.",
    );
  $("title-help").onclick = () =>
    openModal(
      "Seu primeiro vínculo",
      "Setas: movimentação. E: conversar e interagir. Enter ou Espaço: avançar a conversa. T: Z-Link depois da prática supervisionada. Controle: direcional ou analógico, A para interagir/confirmar, B para voltar e Y para Z-Link. Sua jornada começa na floresta.",
    );
  for (const node of document.querySelectorAll("[data-battle-tab]"))
    node.onclick = () => setBattleTab(node.dataset.battleTab);
  $("leave-training").onclick = requestLeaveBattle;
  $("folder-back").onclick = () => setBattleTab("home");
  $("intro-skip").onclick = () => {
    introSkip = true;
    if (fx?.kind === "transform") fx.duration = 1;
    introResume?.();
  };
  $("music-button").onclick = () => music.toggle();
  music.apply();
  document.addEventListener("pointerdown", () => music.unlock(), {
    capture: true,
  });
  document.addEventListener("keydown", () => music.unlock(), { capture: true });
  for (const node of document.querySelectorAll("[data-gender]"))
    node.onclick = () => {
      appearance.gender = node.dataset.gender;
      updateGender();
      buildCustomization();
    };
  $("rotate-left").onclick = () => {
    previewDirection = DIRS[(DIRS.indexOf(previewDirection) + 1) % 4];
  };
  $("rotate-right").onclick = () => {
    previewDirection = DIRS[(DIRS.indexOf(previewDirection) + 3) % 4];
  };
  $("start").onclick = startJourney;
  $("continue").onclick = () => {
    if (!savedGame) return;
    state = structuredClone(savedGame);
    setScene("world");
    toast("Sessão retomada.");
  };
  $("dialogue-next").onclick = advanceDialogue;
  $("confirm-starter").onclick = confirmStarter;
  $("inventory").onclick = () => {
    if (!dialogue && !fx && !story.active) showInventory();
  };
  $("menu").onclick = () => {
    if (!dialogue && !fx && !story.active) showMenu();
  };
  $("dex-button").onclick = showDex;
  $("quest-toggle").onclick = () => {
    const panel = $("objective"),
      button = $("quest-toggle");
    const closed = panel.classList.toggle("collapsed");
    button.setAttribute("aria-expanded", String(!closed));
    button.setAttribute(
      "aria-label",
      closed ? "Expandir missão" : "Recolher missão",
    );
    button.querySelector("span").textContent = closed ? "‹" : "›";
    $("quest-content").inert = closed;
  };
  $("quest-open").onclick = () => {
    if (!dialogue && !fx && !story.active) showJournal();
  };
  $("minimap-button").onclick = showMap;
  $("journal-button").onclick = () => {
    if (!dialogue && !fx && !story.active) showJournal();
  };
  $("close-modal").onclick = menuBack;
  $("reload").onclick = () => location.reload();
  $("return-world").onclick = returnWorld;
  $("retry").onclick = () => startBattle(lastOpponent);
  $("battle-history").onclick = showHistory;
  for (const node of document.querySelectorAll("[data-action]"))
    node.onclick = () => playerAction(node.dataset.action);
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (
      (event.target instanceof HTMLInputElement &&
        ["text", "search", "email", "password", "number"].includes(
          event.target.type,
        )) ||
      event.target instanceof HTMLTextAreaElement
    )
      return;
    // Trap keyboard focus inside the current modal.
    if (modal && key === "tab") {
      const buttons = [
        ...$("modal").querySelectorAll("button:not(:disabled),input"),
      ].filter((n) => !n.hidden);
      const first = buttons[0],
        last = buttons.at(-1);
      if (
        (event.shiftKey && document.activeElement === first) ||
        (!event.shiftKey && document.activeElement === last)
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      }
      return;
    }
    if (
      ["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key) &&
      scene !== "creator"
    )
      event.preventDefault();
    if (
      event.repeat &&
      ["e", "t", "i", "escape", "enter", " ", "r"].includes(key)
    )
      return;
    if (key === "v" && scene === "battle" && !modal) {
      event.preventDefault();
      $("battle-speed").click();
      return;
    }
    if (key === "r" && story.active) {
      event.preventDefault();
      skipStoryStep();
      return;
    }
    if (dialogue && ["enter", " "].includes(key)) {
      event.preventDefault();
      if (!dialogue.choices || dialogue.index < dialogue.lines.length - 1)
        advanceDialogue();
      else document.activeElement?.click();
      return;
    }
    if (
      scene === "battle" &&
      !modal &&
      !battle.result &&
      battle.phase === "player"
    ) {
      if (["1", "2", "3"].includes(key)) {
        event.preventDefault();
        if (folder !== "fight") {
          setBattleTab("fight");
          return;
        }
        playerAction(["attack", "skill", "special"][Number(key) - 1]);
        return;
      }
      if (key === "b") {
        setBattleTab("bag");
        return;
      }
      if (key === "z") {
        setBattleTab("swap");
        return;
      }
      if (key === "escape") {
        setBattleTab(folder === "fight" ? "exit" : "fight");
        return;
      }
    }
    if (key === "escape") {
      if (modal) menuBack();
      else if (scene === "world" && !dialogue && !fx && !story.active)
        showMenu();
      return;
    }
    if (key === "e") {
      event.preventDefault();
      interact();
      return;
    }
    if (modal) return;
    if (key === "t") transform();
    if (key === "q" && scene === "world" && !dialogue && !fx && !story.active)
      showJournal();
    if (key === "m" && scene === "world" && !dialogue && !fx && !story.active)
      showMap();
    if (key === "i" && scene === "world" && !dialogue && !fx && !story.active)
      showInventory();
    if (
      scene === "world" &&
      !dialogue &&
      !story.active &&
      key.startsWith("arrow")
    )
      keys.add(key);
  });
  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener("blur", () => {
    keys.clear();
    save();
  });
  document.addEventListener("visibilitychange", () => {
    keys.clear();
    if (document.hidden) save();
  });
  window.addEventListener("pagehide", save);
  for (const node of document.querySelectorAll("[data-dir]")) {
    const key = {
      up: "arrowup",
      down: "arrowdown",
      left: "arrowleft",
      right: "arrowright",
    }[node.dataset.dir];
    node.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      node.setPointerCapture(e.pointerId);
      keys.add(key);
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
      node.addEventListener(type, () => keys.delete(key));
  }
  $("touch-interact").onclick = interact;
  $("touch-transform").onclick = transform;
}
try {
  await assets.load();
  renderer = new Renderer(assets);
  buildCustomization();
  buildStarters();
  loadSave();
  installEvents();
  setScene("title");
  requestAnimationFrame(update);
  if (new URLSearchParams(location.search).has("debug")) {
    // Read-only diagnostics for tests; no teleport, progression or combat shortcuts.
    window.zimonsDebug = Object.freeze({
      snapshot: () =>
        structuredClone({
          state,
          scene,
          battle,
          modal,
          dialogue: dialogue
            ? { index: dialogue.index, length: dialogue.lines.length }
            : null,
          frameCache: assets.frames.size,
          story: {
            active: story.active,
            motion: story.motion
              ? { x: story.motion.actor.x, y: story.motion.actor.y }
              : null,
          },
          lira: state ? renderer.liraLocation(state, clock()) : null,
          effect: fx
            ? {
                kind: fx.kind,
                to: fx.to,
                duration: fx.duration,
                progress: Math.max(
                  0,
                  Math.min(1, (clock() - fx.start) / fx.duration),
                ),
              }
            : null,
          actors: worldNpcs(state?.world).map((n) => ({
            id: n.id,
            x: n.x,
            y: n.y,
            dir: n.dir,
            moving: n.moving,
          })),
          rendering: renderer.battleSprites.stats(),
          settings: {
            briefAnimations,
            reduceMotion,
            battleSpeed,
            radarRange: renderer.radarRange || 610,
          },
          clock: clock(),
          audio: {
            started: !!music.context,
            state: music.context?.state,
            muted: music.muted,
            volume: music.volume,
          },
          moving,
          keys: [...keys],
        }),
    });
  }
} catch (error) {
  console.error(error);
  $("load-message").textContent =
    `${error.message} Execute o servidor local conforme o README e mantenha a pasta assets junto ao projeto.`;
  $("reload").hidden = false;
}
