import { crossingPoint, doorProgress, doorAuthorized, doorPath } from "./doors.js";
import { CLINIC } from "./clinic-layout.js";
import { sceneRoute, actorCanStand } from "./actor-path.js";
import { FOREST_POINTS } from "./world.js";
import { MAPS } from "./maps.js";
const STARTERS = {
  fire: { name: "Pyron" },
  water: { name: "Marivon" },
  plant: { name: "Verdrax" },
};
import { SCENES } from "./narrative-v41.js";
export const STORY_QUESTS = {
  awakening: ["O Despertar", "Escute a voz que chama por você."],
  forest: [
    "Uma coisa de cada vez",
    "Acompanhe Lira pela trilha. As marcas da clareira podem ser examinadas.",
  ],
  arrival: ["A caminho da Academia", "Siga a estrada com Lira."],
  entrance: [
    "Academia Zimons",
    "Entre pela porta principal e procure a enfermaria no corredor.",
  ],
  medical: ["Avaliação na enfermaria", "Entre na enfermaria com Lira."],
  prepare: [
    "Conhecendo os Zimons",
    "Encontre Lira no laboratório, pela porta própria no corredor.",
  ],
  choose: [
    "Três respostas",
    "Inicie a calibração na plataforma e escolha sua primeira essência.",
  ],
  crisis: ["A primeira possessão", "Lira tenta interromper a Sincro."],
  recovery: ["O segundo despertar", "Converse com Lira sobre o incidente."],
  sleep: ["Uma noite de descanso", "Descanse. Lira está ao seu lado."],
  recalibrate: [
    "Uma nova calibração",
    "Encontre Lira no laboratório. Seu Z-Link ficou com ela para análise.",
  ],
  practice: [
    "Sincro controlada",
    "Use T para iniciar a Sincro pelo Z-Link; depois caminhe um pouco.",
  ],
  return: [
    "O caminho de volta",
    "Use T outra vez para retornar à forma humana.",
  ],
  tour: [
    "Conhecendo a Academia",
    "Siga até a porta do ginásio no corredor central.",
  ],
  challenge: [
    "O primeiro desafio",
    "Converse com Nico, no ginásio, para sua primeira exibição.",
  ],
  analysis: [
    "Um passo adiante",
    "Volte ao laboratório e converse com Lira sobre os resultados.",
  ],
  room: [
    "Um lugar para começar",
    "Conheça seu quarto, pela porta dos alojamentos.",
  ],
  complete: [
    "Exploração livre",
    "Trecho concluído. As exibições estão disponíveis com os colegas nas laterais.",
  ],
};
export function openingState() {
  return {
    lira: {
      world: "forest",
      x: 530,
      y: 550,
      dir: "left",
      frame: 0,
      moving: false,
      visible: true,
    },
    flags: {},
    visits: [],
    dex: {},
    freeLink: false,
    pose: null,
  };
}
const line = (speaker, text) => ({ speaker, text });
const L = (t) => line("lira", t),
  P = (t) => line("player", t),
  N = (t) => line("narrator", t);
export const SCRIPT = {};
export const SOCIAL = {};
export class OpeningStory {
  constructor(api) {
    this.api = api;
    this.active = false;
    this.motion = null;
  }
  get state() {
    return this.api.state();
  }
  setQuest(quest) {
    this.state.quest = quest;
    this.api.refresh();
  }
  async play(label, action) {
    if (this.active) return;
    this.active = true;
    this.api.cinematic(label, true);
    try {
      await action();
    } catch (error) {
      console.error(error);
      this.api.error(
        "A cena foi interrompida. Abra o menu para reiniciar o capítulo.",
      );
    } finally {
      this.active = false;
      this.api.cinematic("", false);
      this.api.refresh();
    }
  }
  talk(key) {
    return this.api.talk(SCRIPT[key](this.state));
  }
  async walk(actor, points, speed = 100) {
    await new Promise((resolve) => {
      this.motion = {
        actor,
        points: sceneRoute(
          this.state.world,
          actor,
          points,
          this.api.actors().filter((o) => o !== actor),
        ),
        speed,
        resolve,
        distance: 0,
      };
    });
  }
  update(dt) {
    this.escort(dt);
    const m = this.motion;
    if (!m || document.hidden) return;
    const [x, y] = m.points[0],
      a = m.actor,
      dx = x - a.x,
      dy = y - a.y;
    // Authored routes use only orthogonal, collision-free segments.
    const oldX = a.x,
      oldY = a.y;
    const remaining = Math.abs(dx) + Math.abs(dy),
      step = Math.min(remaining, m.speed * dt);
    if (Math.abs(dx) > 0.01) {
      a.dir = dx > 0 ? "right" : "left";
      a.x += Math.sign(dx) * Math.min(Math.abs(dx), step);
    } else if (Math.abs(dy) > 0.01) {
      a.dir = dy > 0 ? "down" : "up";
      a.y += Math.sign(dy) * Math.min(Math.abs(dy), step);
    }
    if (!actorCanStand(this.state.world, a.x, a.y, a, this.api.actors())) {
      a.x = oldX;
      a.y = oldY;
      a.moving = false;
      m.blocked = (m.blocked || 0) + dt;
      if (m.blocked > 0.12) {
        m.points = sceneRoute(
          this.state.world,
          a,
          [m.points.at(-1)],
          this.api.actors().filter((o) => o !== a),
        );
        m.blocked = 0;
      }
      return;
    }
    m.blocked = 0;
    if (this.following && a === this.state.story.lira) {
      const f = this.following,
        trail = f.trail,
        last = trail.at(-1);
      if (!last || Math.hypot(last[0] - a.x, last[1] - a.y) > 12)
        trail.push([a.x, a.y]);
      let remainingTrail = Math.hypot(
        f.actor.x - (trail[0]?.[0] ?? a.x),
        f.actor.y - (trail[0]?.[1] ?? a.y),
      );
      for (let i = 1; i < trail.length; i++)
        remainingTrail += Math.hypot(
          trail[i][0] - trail[i - 1][0],
          trail[i][1] - trail[i - 1][1],
        );
      if (trail.length && remainingTrail > 76) {
        const [tx, ty] = trail[0],
          dx = tx - f.actor.x,
          dy = ty - f.actor.y,
          k = Math.min(dt * 150, Math.abs(dx) + Math.abs(dy));
        const nx =
            f.actor.x +
            (Math.abs(dx) > 0.1
              ? Math.sign(dx) * Math.min(k, Math.abs(dx))
              : 0),
          ny =
            f.actor.y +
            (Math.abs(dx) > 0.1
              ? 0
              : Math.sign(dy) * Math.min(k, Math.abs(dy)));
        if (
          actorCanStand(this.state.world, nx, ny, f.actor, this.api.actors())
        ) {
          f.actor.dir =
            Math.abs(dx) > 0.1
              ? dx > 0
                ? "right"
                : "left"
              : dy > 0
                ? "down"
                : "up";
          f.actor.x = nx;
          f.actor.y = ny;
          f.distance += k;
          f.actor.moving = true;
          f.actor.frame = Math.floor(f.distance / 18) % 4;
        }
        if (Math.abs(dx) + Math.abs(dy) < 2) trail.shift();
      } else f.actor.moving = false;
    }
    m.distance += step;
    a.moving = true;
    a.frame = Math.floor(m.distance / 19) % 4;
    if (remaining <= 0.4) {
      a.x = x;
      a.y = y;
      m.points.shift();
      if (!m.points.length) {
        a.moving = false;
        a.frame = 0;
        this.motion = null;
        m.resolve();
      }
    }
  }
  async location(world, x, y, lx, ly, caption, resting = false) {
    await this.api.transition(caption, () => {
      Object.assign(this.state, { world, x, y, dir: "up" });
      this.state.story.resting = resting;
      Object.assign(this.state.story.lira, {
        world,
        x: lx,
        y: ly,
        dir: "down",
        frame: 0,
        moving: false,
        visible: true,
        transformed: false,
      });
    });
  }
  scene(number, from = 0, to = Infinity) {
    const lines = SCENES[String(number)].slice(from, to).map((l) => ({
      ...l,
      text: l.text
        .replaceAll("[NOME]", this.state.name)
        .replaceAll("[ZIMON]", STARTERS[this.state.starter]?.name || "Zimon"),
    }));
    return this.api.talk(lines);
  }
  begin() {
    return this.play("CAPÍTULO 1 · O DESPERTAR", async () => {
      this.state.story.dream = "parents";
      await this.scene(1, 0, 4);
      this.state.story.dream = false;
      this.state.story.pose = "seated";
      await this.api.stage("wake");
      await this.scene(1, 4, 22);
      await this.api.name();
      await this.scene(1, 22, 31);
      this.state.story.pose = null;
      this.state.dir = "right";
      await this.walk(
        this.state.story.lira,
        [
          [560, 550],
          [560, 500],
        ],
        150,
      );
      this.setQuest("forest");
      await this.api.talk([
        L(
          "Vamos pela trilha. Use as setas para caminhar; E permite conversar comigo e examinar o que encontrar.",
        ),
      ]);
    });
  }
  inspect(kind) {
    return this.play("A CLAREIRA", () =>
      this.api.talk([
        P(
          {
            log: "Essa árvore foi quebrada com muita força...",
            stone: "Até as pedras foram atingidas.",
            stream: "Essas marcas... O que poderia ter feito isso?",
            pond: "As marcas continuam pela terra. O resto da mata parece tranquilo.",
          }[kind] || "O que aconteceu aqui?",
        ),
      ]),
    );
  }
  checkTriggers() {
    if (this.active) return;
    const s = this.state;
    const guidedDoor =
      s.quest === "forest" && s.world === "forest"
        ? MAPS.forest.exits[0]
        : s.quest === "entrance" && s.world === "plaza"
          ? MAPS.plaza.exits[0]
          : null;
    if (
      guidedDoor &&
      Math.hypot(s.x - guidedDoor.x, s.y - guidedDoor.y) < 160 &&
      Math.hypot(s.x - s.story.lira.x, s.y - s.story.lira.y) < 190
    ) {
      this.api.travel(guidedDoor);
      return;
    }
    const portal=MAPS[s.world].doorSpecs?.find(d=>{
      const exit=MAPS[s.world].exits.find(e=>e.id===d.id);
      return doorAuthorized(s,exit) && Math.abs(s.x-exit.x)<28 &&
        (d.upper?s.y<d.y+d.h+10:s.y>d.y-15) && doorProgress(s.world,d.id)>=.96;
    });
    if(portal){this.api.travel(MAPS[s.world].exits.find(e=>e.id===portal.id));return;}
    if (s.quest === "practice" && s.transformed) {
      s.story.flags.steps =
        (s.story.flags.steps || 0) +
        Math.hypot(s.x - (s.story.lastX ?? s.x), s.y - (s.story.lastY ?? s.y));
      s.story.lastX = s.x;
      s.story.lastY = s.y;
      if (s.story.flags.steps > 95)
        this.play("CONSCIÊNCIA", async () => {
          await this.scene(11, 32, 36);
          this.setQuest("return");
          await this.api.talk([
            L(
              "Muito bem. Use T novamente para encerrar a Sincro. No controle, Y.",
            ),
          ]);
        });
    }
  }
  escort(dt) {
    const s = this.state,
      l = s.story.lira;
    if (
      this.active ||
      !["forest", "entrance"].includes(s.quest) ||
      l.world !== s.world
    )
      return;
    const target = s.world === "forest" ? [1400, 480] : [768, 260],
      distance = Math.hypot(l.x - s.x, l.y - s.y);
    if (distance > 185) {
      l.moving = false;
      l.frame = 0;
      l.calling = true;
      return;
    }
    l.calling = false;
    if (!this.escortPath || this.escortWorld !== s.world) {
      this.escortPath = sceneRoute(
        s.world,
        l,
        [target],
        this.api.actors().filter((a) => a !== l),
      );
      this.escortWorld = s.world;
    }
    const point = this.escortPath[0];
    if (!point) {
      l.moving = false;
      l.frame = 0;
      return;
    }
    const dx = point[0] - l.x,
      dy = point[1] - l.y,
      step = Math.min(dt * 154, Math.abs(dx) + Math.abs(dy)),
      nx =
        l.x +
        (Math.abs(dx) > 0.1 ? Math.sign(dx) * Math.min(Math.abs(dx), step) : 0),
      ny =
        l.y +
        (Math.abs(dx) > 0.1 ? 0 : Math.sign(dy) * Math.min(Math.abs(dy), step));
    if (actorCanStand(s.world, nx, ny, l, this.api.actors())) {
      l.x = nx;
      l.y = ny;
      l.dir =
        Math.abs(dx) > 0.1
          ? dx > 0
            ? "right"
            : "left"
          : dy > 0
            ? "down"
            : "up";
      l.moving = step > 0.1;
      l.distance = (l.distance || 0) + step;
      l.frame = Math.floor(l.distance / 18) % 4;
    } else {
      l.moving = false;
      l.frame = 0;
    }
    if (Math.abs(dx) + Math.abs(dy) < 1) this.escortPath.shift();
  }
  async guideExit(exit) {
    const s = this.state,
      l = s.story.lira;
    const authored=!!MAPS[s.world].doorSpecs;
    if(authored)s.story.headingDoor=exit.id;
    else {s.story.openDoor=exit.id;await this.api.stage("door-open");}
    if (Math.hypot(s.x - exit.x, s.y - exit.y) < 55) {
      const point = [
        [exit.x - 78, exit.y + 70],
        [exit.x + 78, exit.y + 70],
        [exit.x, exit.y - 85],
      ].find(([x, y]) => actorCanStand(s.world, x, y, s, this.api.actors()));
      if (point) await this.walk(s, [point], 150);
    }
    // Establish a lead before the follower joins. Starting with a reverse trail
    // through the leader's old position creates a head-on collision at a bend
    // (notably from the chair on the left of the bed).
    const route = sceneRoute(
      s.world,
      l,
      doorPath(MAPS[s.world],l,exit),
      this.api.actors().filter((a) => a !== l),
    );
    const lead = [];
    let from = [l.x, l.y],
      remaining = authored ? 96 : 160;
    for (const point of route) {
      const length = Math.hypot(point[0] - from[0], point[1] - from[1]);
      if (length >= remaining) {
        lead.push([
          from[0] + ((point[0] - from[0]) * remaining) / length,
          from[1] + ((point[1] - from[1]) * remaining) / length,
        ]);
        break;
      }
      lead.push(point);
      remaining -= length;
      from = point;
    }
    await this.walk(l, lead, 154);
    const trail = sceneRoute(
      s.world,
      s,
      [[l.x, l.y]],
      this.api.actors().filter((a) => a !== s && a !== l),
    );
    this.following = { actor: s, trail, distance: 0 };
    await this.walk(l, doorPath(MAPS[s.world],l,exit), 154);
    this.following = null;
    if(authored){s.story.openDoor=exit.id;await this.api.stage("door-open");await this.settleDoor(exit,1);}
    await this.crossDoor(l,exit,false);
    l.visible = false;
    s.moving = false;
  }
  async settleDoor(exit,target) {
    if(!MAPS[this.state.world].doorSpecs)return;
    while(Math.abs(doorProgress(this.state.world,exit.id)-target)>.001)
      await new Promise(requestAnimationFrame);
  }
  async leaveDoor(actor,exit) {
    await this.walk(actor,doorPath(MAPS[this.state.world],actor,exit),150);
    this.state.story.openDoor=exit.id;
    await this.api.stage("door-open");
    await this.settleDoor(exit,1);
    await this.crossDoor(actor,exit);
  }
  async crossDoor(actor,exit,close=true) {
    const map=MAPS[this.state.world];
    if(!map.doorSpecs)return;
    await this.walk(actor,[crossingPoint(map,exit)],150);
    if(close) {
      this.state.story.closingDoor=exit.id;
      await this.api.stage("door-open");
      await this.settleDoor(exit,0);
      // Let the fully closed pose render before the map fade begins.
      await new Promise(resolve=>setTimeout(resolve,120));
      delete this.state.story.closingDoor;
      this.state.story.openDoor=null;
      delete this.state.story.headingDoor;
    }
  }
  async beforeDoor(exit) {
    const s = this.state,
      l = s.story.lira;
    const escorting =
      l.visible &&
      l.world === s.world &&
      ((s.quest === "forest" && exit.to === "plaza") ||
        (s.quest === "entrance" && exit.to === "corridor"));
    if (escorting) {
      await this.guideExit(exit);
      return true;
    }
  }
  enterWithLira(to) {
    const [x, y] = { plaza: [768, 700], corridor: [652, 720] }[to];
    Object.assign(this.state.story.lira, {
      world: to,
      x,
      y,
      visible: true,
      moving: false,
      frame: 0,
    });
  }
  async guidedTransition(exit, lx, ly) {
    await this.guideExit(exit);
    await this.walk(this.state, doorPath(MAPS[this.state.world],this.state,exit), 150);
    await this.crossDoor(this.state,exit);
    await this.api.transition("", () => {
      Object.assign(this.state, {
        world: exit.to,
        x: exit.tx,
        y: exit.ty,
        dir: "up",
      });
      Object.assign(this.state.story.lira, {
        world: exit.to,
        x: lx,
        y: ly,
        visible: true,
        moving: false,
      });
    });
  }
  async afterDoor(from, to) {
    const s = this.state,
      l = s.story.lira;
    if (from === "forest" && to === "plaza" && s.quest === "forest")
      return this.play("ACADEMIA ZIMONS", async () => {
        await this.scene(2);
        await this.scene(3);
        this.setQuest("entrance");
      });
    if (to === "corridor" && s.quest === "entrance")
      return this.play("A ENFERMARIA", async () => {
        await this.api.talk([
          L(
            "Antes de qualquer experimento, você vai descansar. A enfermaria fica aqui. Venha comigo.",
          ),
        ]);
        await this.guidedTransition(
          MAPS.corridor.exits.find((e) => e.to === "clinic"),
          550,
          420,
        );
        await this.walk(l, [[550, 360], [260, 360], CLINIC.liraApproach], 150);
        this.setQuest("medical");
        await this.walk(
          s,
          [[640, 520], [470, 520], [470, 263], CLINIC.playerApproach],
          150,
        );
        await this.scene(4, 0, 1);
        await this.api.stage("bed-lie");
        await this.api.stage("lira-sit");
        l.dir = "right";
        await this.scene(4, 1);
        await this.api.talk([
          L(
            "Pode fechar os olhos um pouco. Eu fico aqui. Depois vamos juntos ao laboratório.",
          ),
          P("Tudo bem... Acho que eu precisava ouvir isso."),
        ]);
        await this.api.stage("close-eyes");
        await this.api.transition("", () => {});
        await this.api.stage("wake");
        await this.api.stage("bed-rise");
        await this.api.stage("lira-stand");
        await this.api.talk([
          L("Melhor? Então vamos. Sem pressa, eu acompanho você."),
        ]);
        await this.guidedTransition(MAPS.clinic.exits[0], 290, 285);
        await this.guidedTransition(
          MAPS.corridor.exits.find((e) => e.to === "lab"),
          720,
          570,
        );
        await this.walk(
          l,
          [
            [868, 570],
            [868, 369],
          ],
          150,
        );
        this.setQuest("prepare");
        await this.prepareScene();
      });
    if (to === "lab" && s.quest === "recalibrate") return this.recalibrate();
    if (to === "gym" && s.quest === "tour") return this.meetStudents();
  }
  prepare() {
    return this.play("CONHECENDO OS ZIMONS", () => this.prepareScene());
  }
  async prepareScene() {
    await this.walk(this.state, [[640, 500]], 150);
    this.state.story.lira.dir = "left";
    await this.scene(5);
    await this.scene(6, 0, 1);
    await this.api.stage("delivery");
    this.state.zlink = true;
    this.api.refresh();
    await this.scene(6, 1, 4);
    this.setQuest("choose");
  }
  calibrate() {
    return this.play("A CALIBRAÇÃO INÉDITA", async () => {
      await this.walk(
        this.state,
        [
          [640, this.state.y],
          [640, 500],
        ],
        150,
      );
      await this.scene(6, 4, 5);
      await this.api.stage("calibration");
      await this.scene(6, 5, 17);
      await this.api.stage("calibration");
      await this.scene(6, 17, 26);
      this.state.story.flags.calibrated = true;
      this.api.choose();
    });
  }
  firstLink() {
    return this.play("O PRIMEIRO PACTO", async () => {
      await this.scene(6, 26);
      this.api.sync();
    });
  }
  crisis() {
    return this.play("A PRIMEIRA POSSESSÃO", async () => {
      this.setQuest("crisis");
      await this.scene(7, 0, 13);
      await this.api.stage("spirit-approach");
      await this.api.transform(true, true);
      this.state.story.possessed = true;
      await this.api.stage("red-eyes");
      await this.scene(7, 13, 15);
      await this.api.stage("rampage");
      await this.scene(7, 15, 21);
      await this.api.stage("partial-world");
      this.state.story.lira.partial = true;
      await this.api.talk([L("Não vou ferir você. Tente escutar minha voz!")]);
      await this.api.containment();
    });
  }
  recovered() {
    return this.play("O SEGUNDO DESPERTAR", async () => {
      const s = this.state;
      s.transformed = false;
      s.story.possessed = false;
      s.story.lira.partial = false;
      s.story.dream = "mist";
      await this.scene(8);
      await this.location(
        "clinic",
        ...CLINIC.playerRest,
        ...CLINIC.liraRest,
        "",
        true,
      );
      s.story.dream = false;
      s.story.lira.dir = "right";
      s.story.lira.seated = true;
      this.setQuest("recovery");
      await this.scene(9);
      await this.api.talk([
        P("Eu ataquei você... Não lembro de decidir fazer aquilo."),
        L(
          "Eu sei. Você não queria me machucar. Mas seu corpo precisa descansar, e eu preciso entender o Z-Link.",
        ),
        P("E se acontecer de novo?"),
        L(
          "Então não vamos enfrentar isso sozinhos. Esta noite, deixe o dispositivo comigo. Amanhã conversamos, quando você estiver melhor.",
        ),
      ]);
      s.zlink = false;
      s.story.freeLink = false;
      await this.api.stage("lira-stand");
      await this.walk(
        s.story.lira,
        [
          [540, 360],
          [640, 360],
          [640, 674],
        ],
        150,
      );
      Object.assign(s.story.lira, {
        world: "lab",
        x: 868,
        y: 369,
        visible: true,
        moving: false,
      });
      await this.api.stage("close-eyes");
      await this.api.transition("", () => {
        s.health = this.api.maxHP();
        s.energy = 60;
      });
      await this.api.stage("wake");
      await this.scene(10);
      await this.api.stage("bed-rise");
      this.setQuest("recalibrate");
    });
  }
  recalibrate() {
    return this.play("A NOVA CALIBRAÇÃO", async () => {
      await this.walk(this.state, [[640, 500]], 150);
      await this.api.talk([
        P("A bancada... e aqueles vidros. Fui eu que fiz tudo isso?"),
        L(
          "Foi. Mas os equipamentos podem ser consertados. Eu estava mais preocupada com você.",
        ),
        P(
          "Eu poderia ter acertado você. E não consigo lembrar de quase nada...",
        ),
        L(
          "Não precisa fingir que está tudo bem. Vamos fazer isso em etapas, com você consciente e comigo aqui.",
        ),
        P("Quero tentar. Só... se eu não conseguir parar, me ajude."),
        L(
          "Eu ajudo. A primeira coisa é você sentir que pode escolher quando voltar.",
        ),
      ]);
      await this.scene(11, 0, 24);
      await this.api.stage("delivery");
      this.state.zlink = true;
      await this.api.talk([
        L(
          "O Z-Link está no seu pulso. Use T para iniciar a Sincro, onde estiver aqui no laboratório. No controle, Y. O mesmo comando traz você de volta.",
        ),
      ]);
      this.setQuest("practice");
    });
  }
  transformed(to) {
    if (this.state.quest === "practice" && to)
      return this.play("SINCRO ESTÁVEL", async () => {
        this.state.story.flags.steps = 0;
        this.state.story.lastX = this.state.x;
        this.state.story.lastY = this.state.y;
        await this.scene(11, 27, 32);
      });
    if (["practice", "return"].includes(this.state.quest) && !to)
      return this.play("UM PASSO ADIANTE", async () => {
        await this.scene(11, 36);
        this.state.story.flags.trainingComplete = true;
        this.state.story.freeLink = true;
        this.state.zimondex = true;
        this.state.story.dex = { [this.state.starter]: "linked" };
        await this.api.talk([
          L(
            "Esta Zimondex registra as essências que você descobre. Um avistamento revela o registro; um pacto é o que permite assumir uma forma.",
          ),
          P("Então continuo com o meu primeiro Zimon."),
          L("Isso! Agora vamos conhecer o ginásio."),
        ]);
        await this.scene(12);
        await this.walk(
          this.state.story.lira,
          [
            [868, 520],
            [640, 520],
            [640, 520],
          ],
          150,
        );
        await this.leaveDoor(this.state.story.lira,MAPS.lab.exits[0]);
        Object.assign(this.state.story.lira, {
          world: "gym",
          x: 1105,
          y: 600,
          visible: true,
          moving: false,
        });
        this.setQuest("tour");
      });
  }
  meetStudents() {
    return this.play("OS PRIMEIROS COLEGAS", async () => {
      await this.walk(this.state, [[1015, 600]], 150);
      await this.scene(13, 0, 16);
      await this.api.stage("exhibition");
      await this.scene(13, 16);
      await this.scene(14, 0, 18);
      this.setQuest("challenge");
    });
  }
  challenge() {
    return this.play("O PRIMEIRO DESAFIO", async () => {
      await this.scene(14, 18, 21);
      this.state.story.flags.nicoTutorial = true;
      await this.api.challenge();
    });
  }
  afterDuel() {
    return this.play("O PRIMEIRO PASSO", async () => {
      await this.scene(14, 25, 29);
      await this.api.talk([
        L(
          "Por hoje, chega. Você conseguiu escolher seus movimentos e voltar a ser você. Isso já é um começo.",
        ),
        P(
          "Ainda estou com medo daquela primeira vez. Mas hoje eu senti que estava aqui.",
        ),
        L(
          "É essa sensação que vamos fortalecer. Quando quiser praticar, os colegas podem fazer outras exibições. Eu fico aqui para supervisionar.",
        ),
      ]);
      Object.assign(this.state.story.lira, {
        world: "gym",
        x: 1105,
        y: 600,
        visible: true,
        moving: false,
      });
      this.state.story.flags.chapterOne = true;
      this.state.story.flags.nicoResolved = true;
      this.setQuest("complete");
      this.api.notify("Trecho concluído · Exibições disponíveis");
    });
  }
  analyze() {
    return this.play("UM PASSO ADIANTE", async () => {
      await this.scene(15);
      await this.walk(
        this.state.story.lira,
        [
          [868, 480],
          [640, 480],
        ],
        120,
      );
      await this.leaveDoor(this.state.story.lira,MAPS.lab.exits[0]);
      Object.assign(this.state.story.lira, {
        world: "dorm",
        x: 530,
        y: 440,
        visible: true,
        moving: false,
      });
      this.setQuest("room");
    });
  }
  newRoom() {
    return this.play("O NOVO QUARTO", async () => {
      await this.walk(this.state, [[640, 440]], 115);
      await this.scene(16, 0, 15);
      await this.walk(
        this.state.story.lira,
        [
          [530, 500],
          [640, 500],
          [640, 640],
        ],
        115,
      );
      Object.assign(this.state.story.lira, {
        world: "gym",
        x: 1105,
        y: 600,
        visible: true,
        moving: false,
      });
      await this.scene(16, 15);
      await this.api.talk([
        P("Vou descansar. Amanhã posso continuar conhecendo a Academia."),
      ]);
      this.state.story.flags.roomReady = true;
      this.setQuest("room");
      this.state.story.flags.awaitFinalRest = true;
    });
  }
  finishChapter() {
    return this.play("UM LUGAR PARA COMEÇAR", async () => {
      const s = this.state;
      await this.api.transition("CAPÍTULO 1 CONCLUÍDO", () => {
        s.health = this.api.maxHP();
        s.energy = 60;
        s.story.flags.chapterOne = true;
        s.story.flags.awaitFinalRest = false;
        s.moving = false;
      });
      this.setQuest("complete");
      this.api.notify("Exploração livre da Academia desbloqueada.");
    });
  }
  social(id) {
    return false;
  }
}
