import { battleEnvironment } from "./battle-environment.js";
import { MAPS } from "./maps.js";
import { drawLabDamage } from "./scene-staging.js";
import { WORLD_SIZE, FOREST_POINTS, questTarget } from "./world.js";
import { STARTERS } from "./model.js";
import { worldNpcs, faceDirection } from "./npcs.js";
import { battlePose, battleForm, BATTLE_MARKS } from "./battle-sprites.js";
import { drawStrike, drawTransformation } from "./effects.js";
const TAU = Math.PI * 2;
export class Renderer {
  constructor(assets) {
    this.assets = assets;
    this.world = document.querySelector("#world-canvas").getContext("2d");
    this.battle = document.querySelector("#battle-canvas").getContext("2d");
    this.lab = assets.images.laboratory;
    this.arena = assets.images.arena;
    this.battleSprites = assets.battle;
    this.battlePoints = null;
    this.labels = document.getElementById("npc-labels");
    this.labelNodes = new Map();
  }
  shadow(ctx, x, y, w = 19) {
    ctx.fillStyle = "#03122045";
    ctx.beginPath();
    ctx.ellipse(x, y + 1, w, w * 0.33, 0, 0, TAU);
    ctx.fill();
  }
  diamond(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.6, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.6, y);
    ctx.closePath();
    ctx.fill();
  }
  marker(ctx, x, y, time, text = "!") {
    const bob = Math.sin(time / 300) * 3;
    ctx.fillStyle = "#0c2436ed";
    ctx.beginPath();
    ctx.arc(x, y + bob, 13, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#edcb83";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#edcb83";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, x, y + bob + 5);
  }
  liraLocation(state, time) {
    const l = state.story?.lira;
    if (l) {
      if (
        l.visible &&
        !l.moving &&
        !l.seated &&
        l.world === state.world &&
        Math.hypot(l.x - state.x, l.y - state.y) < 110
      )
        l.dir = faceDirection(l.x, l.y, state.x, state.y);
      return l;
    }
    return {
      world: "lab",
      x: 868,
      y: 369,
      dir: "down",
      frame: 0,
      visible: true,
    };
  }
  drawWorld(state, now, walkFrame, fx, reducedMotion = false) {
    const ctx = this.world;
    // World geometry and DOM labels share this responsive logical viewport.
    const rect = ctx.canvas.getBoundingClientRect();
    const viewW = 1280,
      viewH = Math.round((1280 * rect.height) / Math.max(1, rect.width));
    if (ctx.canvas.width !== viewW || ctx.canvas.height !== viewH) {
      ctx.canvas.width = viewW;
      ctx.canvas.height = viewH;
    }
    this.view = { width: viewW, height: viewH };
    ctx.imageSmoothingEnabled = false;
    const [width, height] = WORLD_SIZE[state.world];
    let zoom =
      fx?.kind === "transform"
        ? 1 +
          Math.sin(Math.min(1, (now - fx.start) / fx.duration) * Math.PI) * 0.12
        : 1;
    if (reducedMotion) zoom = 1;
    zoom *= Math.max(1, viewW / width, viewH / height);
    const camera = {
      x: Math.max(
        0,
        Math.min(width - viewW / zoom, state.x - viewW / (2 * zoom)),
      ),
      y: Math.max(
        0,
        Math.min(height - viewH / zoom, state.y - viewH / (2 * zoom)),
      ),
      zoom,
    };
    this.camera = camera;
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-camera.x, -camera.y);
    this.assets.tiles.draw(ctx, state, now);
    if (state.world === "clinic") this.assets.clinic.furniture(ctx, state);
    if (state.world === "forest" && state.quest === "forest") {
      const point = questTarget(state);
      if (point)
        this.marker(ctx, point.x, point.y - 55, reducedMotion ? 0 : now, "◇");
    }
    const lira = this.liraLocation(state, now);
    const demo = state.story.demo;
    const demoActors = worldNpcs(state.world).map((n) => {
      if (demo === undefined || !["nina", "caio"].includes(n.id)) return n;
      const smooth = (t) => {
          t = Math.max(0, Math.min(1, t));
          return t * t * (3 - 2 * t);
        },
        left = n.id === "nina",
        home = { x: n.x, y: n.y },
        station = left ? { x: 400, y: 465 } : { x: 875, y: 350 };
      const enter = smooth(demo / 0.18),
        leave = smooth((demo - 0.89) / 0.11),
        mix = enter * (1 - leave),
        phase = Math.max(0, Math.min(1, (demo - 0.3) / 0.3)),
        travel =
          phase < 0.68
            ? smooth((phase - 0.12) / 0.56)
            : 1 - smooth((phase - 0.68) / 0.32);
      return {
        ...n,
        x: home.x + (station.x - home.x) * mix + (left ? travel * 370 : 0),
        y: home.y + (station.y - home.y) * mix - (left ? travel * 85 : 0),
        dir: left ? "right" : "left",
        moving: demo < 0.18 || demo > 0.89,
        frame: Math.floor(demo * 60) % 4,
        demoForm: demo > 0.23 && demo < 0.86 ? (left ? "water" : "fire") : null,
        demoPose: travel > 0.05 ? 2 : 0,
      };
    });
    const entities = [
      { type: "player", x: state.x, y: state.y },
      ...demoActors.map((n) => ({ ...n, type: "npc" })),
      ...MAPS[state.world].objects
        .filter((o) => !o.ground)
        .map((o) => ({ ...o, propType: o.type, type: "object" })),
    ];
    for (const node of this.labelNodes.values()) node.hidden = true;
    if (lira.visible !== false && lira.world === state.world)
      entities.push({ type: "lira", ...lira });
    for (const e of entities.sort((a, b) => a.y - b.y)) {
      if (e.type === "object") {
        this.assets.tiles.object(ctx, { ...e, type: e.propType }, state);
        continue;
      }
      if (
        !(
          e.type === "player" &&
          (state.story?.resting || state.story?.bedPose !== undefined)
        ) &&
        !(e.type === "lira" && e.seated)
      )
        this.shadow(
          ctx,
          e.x,
          e.y,
          e.type === "player" && state.transformed ? 27 : 22,
        );
      if (e.type === "lira") {
        const changing = fx?.kind === "transform" && fx.actor === "lira";
        const beast =
          e.transformed || (changing && (now - fx.start) / fx.duration >= 0.55);
        const partialProgress =
          fx?.kind === "partial-world"
            ? Math.min(1, (now - fx.start) / fx.duration)
            : e.partial
              ? 1
              : 0;
        if (e.seated || e.seatProgress !== undefined) {
          this.assets.clinic.seatedLira(ctx, e.seatProgress ?? 1);
          continue;
        }
        if (partialProgress < 1)
          this.assets.draw(
            ctx,
            beast ? e.form : "lira",
            e.dir,
            beast ? 0 : this.assets.walkIndex("lira", e.dir, e.frame || 0),
            e.x,
            e.y,
            beast ? 84 : 84,
            null,
            false,
            1 - partialProgress,
          );
        if (partialProgress > 0) {
          this.assets.battle.draw(
            ctx,
            "lira",
            partialProgress < 0.7 ? 1 : 0,
            e.x,
            e.y,
            84,
            { flip: e.dir === "right", alpha: partialProgress },
          );
          if (partialProgress < 1) {
            ctx.save();
            ctx.globalAlpha = Math.sin(partialProgress * Math.PI) * 0.9;
            ctx.strokeStyle = "#c5ec9a";
            ctx.lineWidth = 1.5;
            for (const sign of [-1, 1]) {
              ctx.beginPath();
              ctx.ellipse(
                e.x + sign * 18,
                e.y - 34,
                7 + partialProgress * 9,
                4 + partialProgress * 5,
                0,
                0,
                TAU,
              );
              ctx.stroke();
            }
            ctx.restore();
          }
        }

        if (["report", "complete"].includes(state.quest))
          this.marker(
            ctx,
            e.x,
            e.y - 78,
            reducedMotion ? 0 : now,
            state.quest === "complete" ? "·" : "!",
          );
        if (e.calling) {
          ctx.font = "500 12px Manrope";
          ctx.textAlign = "center";
          ctx.fillStyle = "#102b3de8";
          ctx.beginPath();
          ctx.roundRect(e.x - 50, e.y - 118, 100, 24, 6);
          ctx.fill();
          ctx.fillStyle = "#eafaff";
          ctx.fillText("Por aqui! Vem!", e.x, e.y - 102);
        }
        this.label("lira", "Lira", e.x, e.y, true);
      } else if (e.type === "npc") {
        const human = e.human || ["male", "female"].includes(e.sprite);
        const idle = e.moving
          ? this.assets.walkIndex(e.sprite, e.dir, e.frame)
          : human
            ? 0
            : Math.floor(now / 420) % 3;
        if (e.demoForm)
          this.assets.battle.draw(ctx, e.demoForm, e.demoPose, e.x, e.y, 82, {
            flip: e.id === "caio",
          });
        else
          this.assets.draw(
            ctx,
            e.sprite,
            e.dir,
            e.moving ? idle : reducedMotion ? 0 : idle,
            e.x,
            e.y,
            human ? 84 : 84,
            e.appearance,
          );
        if (e.id === "nico" && state.story?.partialStudent) {
          ctx.save();
          ctx.strokeStyle = "#92f4e5";
          ctx.fillStyle = "#d9ffdc";
          ctx.globalAlpha = reducedMotion
            ? 0.6
            : 0.6 + Math.sin(now / 450) * 0.2;
          ctx.beginPath();
          ctx.arc(e.x + 12, e.y - 20, 8, 0, TAU);
          ctx.stroke();
          for (let i = 0; i < 3; i++)
            ctx.fillRect(e.x + 8 + i * 3, e.y - 31, 2, 8);
          ctx.restore();
        }
        this.label(e.id, e.name, e.x, e.y);
      } else {
        if (state.story?.pose === "seated") {
          ctx.save();
          ctx.translate(e.x, e.y);
          ctx.scale(1, 0.79);
          this.assets.draw(
            ctx,
            state.appearance.gender,
            state.dir,
            0,
            0,
            0,
            82,
            state.appearance,
            false,
          );
          ctx.restore();
          continue;
        }
        if (
          state.world === "clinic" &&
          (state.story.resting || state.story.bedPose !== undefined)
        ) {
          this.assets.clinic.patient(ctx, state);
          continue;
        }
        const fading =
          fx?.kind === "transform" && fx.actor !== "lira"
            ? (now - fx.start) / fx.duration
            : null;
        const changed = fading === null || fading >= 0.5;
        const transformed =
          fading === null ? state.transformed : changed ? fx.to : !fx.to;
        const key = transformed ? state.starter : state.appearance.gender;
        if (transformed && state.story.possessed) {
          ctx.save();
          ctx.translate(state.x, state.y);
          ctx.rotate(state.story.rampageLean || 0);
          this.assets.draw(
            ctx,
            key,
            state.dir,
            this.assets.walkIndex(
              key,
              state.dir,
              state.moving ? state.frame || 0 : 0,
            ),
            0,
            0,
            84,
            null,
            false,
            1,
            true,
          );
          ctx.restore();
        } else
          this.assets.draw(
            ctx,
            key,
            state.dir,
            fading !== null && !transformed && fading < 0.3
              ? 2
              : this.assets.walkIndex(key, state.dir, walkFrame),
            state.x,
            state.y,
            transformed ? 84 : 84,
            transformed ? null : state.appearance,
            state.zlink,
          );
      }
    }
    if (state.world === "plaza" && state.quest === "lab")
      this.marker(ctx, 640, 105, reducedMotion ? 0 : now, "↑");
    if (state.story?.presenceUntil > now) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.6, (state.story.presenceUntil - now) / 3500);
      ctx.fillStyle = "#a5e6da";
      for (let i = 0; i < 8; i++) {
        const a = i * 2.4 + now / 1900;
        ctx.fillRect(
          (state.world === "forest" ? FOREST_POINTS.stream.x : 960) +
            Math.cos(a) * 20,
          (state.world === "forest" ? FOREST_POINTS.stream.y - 80 : 180) +
            Math.sin(a) * 8,
          2,
          2,
        );
      }
      ctx.restore();
    }
    if (state.world === "clinic") this.assets.clinic.blanketLayer(ctx, state);
    if (fx) this.drawFX(ctx, fx, now, reducedMotion);
    ctx.restore();
    this.drawMinimap(
      state,
      document.getElementById("minimap").getContext("2d"),
      256,
      256,
    );
    if (state.story?.dream) this.drawDream(state, now, reducedMotion);
    if (fx?.kind === "wake" || fx?.kind === "close-eyes")
      this.drawWake(fx, now, reducedMotion);
  }
  drawWake(fx, now, reduced) {
    const g = this.world,
      p = Math.max(0, Math.min(1, (now - fx.start) / fx.duration)),
      open =
        fx.kind === "close-eyes"
          ? 1 - p * p * (3 - 2 * p)
          : p * p * (3 - 2 * p);
    for (const node of this.labelNodes.values()) node.hidden = true;
    const w = g.canvas.width,
      h = g.canvas.height;
    g.save();
    g.fillStyle = "#000";
    if (reduced) {
      g.globalAlpha = 1 - open;
      g.fillRect(0, 0, w, h);
    } else {
      const edge = h / 2 - open ** 3 * h,
        center = h / 2 - open * h * 1.67;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(w, 0);
      g.lineTo(w, edge);
      g.quadraticCurveTo(w / 2, center, 0, edge);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(0, h);
      g.lineTo(w, h);
      g.lineTo(w, h - edge);
      g.quadraticCurveTo(w / 2, h - center, 0, h - edge);
      g.closePath();
      g.fill();
    }
    g.restore();
  }
  drawDream(state, now, reducedMotion) {
    const ctx = this.world,
      mist = state.story.dream === "mist";
    this.dreamApproach =
      (this.dreamApproach || 0) +
      ((state.story.dreamProgress || 0) - (this.dreamApproach || 0)) * 0.055;
    for (const node of this.labelNodes.values()) node.hidden = true;
    ctx.fillStyle = "#050d19";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    const dreamScale = Math.min(
      ctx.canvas.width / 1280,
      ctx.canvas.height / 720,
    );
    ctx.translate(
      (ctx.canvas.width - 1280 * dreamScale) / 2,
      (ctx.canvas.height - 720 * dreamScale) / 2,
    );
    ctx.scale(dreamScale, dreamScale);
    ctx.fillRect(0, 0, 1280, 720);
    const glow = ctx.createRadialGradient(640, 300, 8, 640, 340, 470);
    glow.addColorStop(0, "#305360");
    glow.addColorStop(1, "#050d19");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1280, 720);
    if (mist) {
      ctx.strokeStyle = "#779ca02b";
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.ellipse(640, 520, 80 + i * 60, 12 + i * 18, 0, 0, TAU);
        ctx.stroke();
      }
      // A featureless silhouette: deliberately no portrait, name or reflected face.
      ctx.save();
      ctx.translate(650, 360);
      ctx.fillStyle = "#06101b";
      ctx.beginPath();
      ctx.ellipse(0, -91, 16, 22, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-14, -71);
      ctx.lineTo(15, -71);
      ctx.lineTo(24, -17);
      ctx.lineTo(13, -3);
      ctx.lineTo(8, 58);
      ctx.lineTo(-3, 58);
      ctx.lineTo(-9, 7);
      ctx.lineTo(-14, 58);
      ctx.lineTo(-25, 58);
      ctx.lineTo(-19, -7);
      ctx.lineTo(-28, -20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      this.assets.draw(
        ctx,
        state.appearance.gender,
        "up",
        Math.floor(now / 200) % 4,
        610 + this.dreamApproach * 25,
        470 - this.dreamApproach * 65,
        92,
        state.appearance,
        state.zlink,
      );
      for (let i = 0; i < 7; i++) {
        const drift = reducedMotion ? 0 : Math.sin(now / 4200 + i) * 48;
        ctx.fillStyle = `rgba(142,174,179,${0.035 + (i % 3) * 0.012})`;
        ctx.beginPath();
        ctx.ellipse(
          210 + i * 158 + drift,
          330 + (i % 3) * 72,
          240,
          37,
          0,
          0,
          TAU,
        );
        ctx.fill();
      }
    } else {
      ctx.save();
      ctx.globalAlpha = 0.48;
      this.parentShadows ||= new Map();
      for (const [key, x, style, outfit] of [
        ["male", 585, state.appearance.style, 4],
        ["female", 690, 2, 1],
      ]) {
        const signature = [key, style, outfit].join(":");
        let silhouette = this.parentShadows.get(signature);
        if (!silhouette) {
          const frame = this.assets.frame(
              key,
              "down",
              0,
              { ...state.appearance, gender: key, style, outfit, bag: 0 },
              false,
            ),
            c = document.createElement("canvas");
          c.width = c.height = 192;
          const g = c.getContext("2d");
          g.drawImage(frame.canvas, 0, 0);
          g.globalCompositeOperation = "source-in";
          g.fillStyle = "#b7cfd0";
          g.fillRect(0, 0, 192, 192);
          silhouette = { ...frame, canvas: c };
          this.parentShadows.set(signature, silhouette);
        }
        const scale = (key === "male" ? 182 : 174) / silhouette.referenceHeight;
        ctx.drawImage(
          silhouette.canvas,
          x - silhouette.anchor * scale,
          430 - silhouette.baseline * scale,
          192 * scale,
          192 * scale,
        );
      }
      ctx.restore();
    }
    ctx.restore();
  }

  drawFX(ctx, fx, now, reducedMotion) {
    const p = Math.max(0, Math.min(1, (now - fx.start) / fx.duration));
    if (p >= 1) return;
    const color = fx.color || "#8fe8df";
    ctx.save();
    if (fx.kind === "transform") {
      if (fx.side === "both") {
        for (const side of ["player", "opponent"]) {
          if (fx.already?.[side]) continue;
          const point = this.battlePoints?.[side] || {
            x: side === "player" ? 340 : 924,
            y: side === "player" ? 485 : 385,
          };
          drawTransformation(
            ctx,
            {
              ...fx,
              ...point,
              color: side === "player" ? fx.color : fx.enemyColor || "#71dbe6",
            },
            now,
            reducedMotion,
          );
        }
      } else drawTransformation(ctx, fx, now, reducedMotion);
    } else if (fx.kind === "delivery") {
      const l = fx.lira || { x: fx.x + 38, y: fx.y },
        q = Math.max(0, Math.min(1, (p - 0.18) / 0.62)),
        start = { x: l.x - 15, y: l.y - 34 },
        end = { x: fx.x + 12, y: fx.y - 34 },
        x = start.x + (end.x - start.x) * q,
        y = start.y + (end.y - start.y) * q;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.15);
      ctx.fillStyle = "#142b3d";
      ctx.fillRect(-3, -8, 6, 16);
      ctx.fillStyle = "#b5c2ca";
      ctx.beginPath();
      ctx.roundRect(-7, -5, 14, 10, 3);
      ctx.fill();
      ctx.fillStyle = "#0d4d62";
      ctx.beginPath();
      ctx.roundRect(-5, -3, 10, 6, 2);
      ctx.fill();
      ctx.strokeStyle = "#86f8ee";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.lineTo(3, 0);
      ctx.stroke();
      ctx.restore();
    } else if (fx.kind === "calibration") {
      const index = Math.min(2, Math.floor(p * 3)),
        key = ["fire", "water", "plant"][index],
        phase = p * 3 - index;
      ctx.globalAlpha = Math.min(1, Math.sin(phase * Math.PI) * 2);
      this.assets.battle.draw(ctx, key, 0, 640, 400, 85);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = ["#ffb777", "#8ce9ff", "#c6f49e"][index];
      ctx.beginPath();
      ctx.ellipse(640, 404, 55, 17, 0, 0, TAU);
      ctx.stroke();
    } else if (fx.kind === "spirit-approach") {
      const q = p * p * (3 - 2 * p),
        x = 640 + (fx.x - 640) * q,
        y = 400 + (fx.y - 400) * q - Math.sin(p * Math.PI) * 38;
      ctx.globalAlpha = 1 - p * 0.55;
      this.assets.battle.draw(
        ctx,
        fx.form || "fire",
        p < 0.3 ? 0 : 2,
        x,
        y,
        84 * (1 - p * 0.3),
      );
      ctx.globalAlpha = 1;
    } else if (fx.kind === "red-eyes") {
      ctx.globalAlpha = Math.sin(p * Math.PI) * 0.22;
      const g = ctx.createRadialGradient(
        fx.x,
        fx.y - 45,
        10,
        fx.x,
        fx.y - 45,
        100,
      );
      g.addColorStop(0, "#f52135");
      g.addColorStop(1, "#f5213500");
      ctx.fillStyle = g;
      ctx.fillRect(fx.x - 100, fx.y - 145, 200, 200);
    } else if (fx.kind === "exhibition") {
      for (const [key, x] of [
        ["water", 400],
        ["fire", 875],
      ])
        if (p < 0.24 || p > 0.88)
          drawTransformation(
            ctx,
            {
              ...fx,
              x,
              y: x === 400 ? 465 : 350,
              height: 98,
              to: p < 0.24,
              start: fx.start + (p > 0.88 ? fx.duration * 0.88 : 0),
              duration: fx.duration * (p > 0.88 ? 0.12 : 0.24),
            },
            now,
            reducedMotion,
          );
      if (p > 0.3 && p < 0.6)
        drawStrike(
          ctx,
          {
            ...fx,
            start: fx.start + fx.duration * 0.3,
            duration: fx.duration * 0.3,
            action: "attack",
            color: "#94e7ff",
          },
          now,
          { x: 760, y: 370 },
          { x: 875, y: 310 },
          reducedMotion,
        );
      if (p > 0.63 && p < 0.85)
        drawStrike(
          ctx,
          {
            ...fx,
            start: fx.start + fx.duration * 0.63,
            duration: fx.duration * 0.22,
            action: "skill",
            element: "Fogo",
            color: "#ffad57",
          },
          now,
          { x: 875, y: 305 },
          { x: 400, y: 420 },
          reducedMotion,
        );
    } else if (fx.kind === "rampage") {
      for (const [mark, cx] of [
        [0.235, 640],
        [0.51, 1049],
      ])
        if (p > mark && p < mark + 0.16) {
          const t = (p - mark) / 0.16;
          for (let i = 0; i < (reducedMotion ? 7 : 24); i++) {
            const a = i * 2.4;
            ctx.globalAlpha = 1 - t;
            ctx.fillStyle = i % 3 ? "#b9eafa" : "#f7e9bf";
            ctx.save();
            ctx.translate(
              cx + Math.cos(a) * t * (30 + (i % 5) * 14),
              260 + Math.sin(a) * t * 35 + t * t * 65,
            );
            ctx.rotate(a + t * 4);
            ctx.beginPath();
            ctx.moveTo(-3, -4);
            ctx.lineTo(4, -1);
            ctx.lineTo(-1, 5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        }
    } else if (fx.kind === "restraint") {
      ctx.globalAlpha = Math.sin(p * Math.PI) * 0.65;
      ctx.strokeStyle = "#c7df9b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(891, 281, 33, 0.3, 2.2);
      ctx.stroke();
    } else if (fx.kind === "partial") {
      ctx.globalAlpha = Math.sin(p * Math.PI) * 0.6;
      ctx.strokeStyle = "#b9e6a2";
      ctx.lineWidth = 2;
      for (const sign of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(
          fx.x + sign * 14,
          fx.y - 70,
          7 + p * 11,
          4 + p * 7,
          0,
          0,
          TAU,
        );
        ctx.stroke();
      }
    } else if (fx.kind === "strike") {
      const from = this.battlePoints?.[fx.side] || {
        x: fx.side === "player" ? 340 : 924,
        y: fx.side === "player" ? 485 : 385,
      };
      const to = this.battlePoints?.[fx.target] || {
        x: fx.target === "player" ? 340 : 924,
        y: fx.target === "player" ? 485 : 385,
      };
      drawStrike(
        ctx,
        fx,
        now,
        this.strikeOrigin || { x: from.x, y: from.y - 90 },
        this.strikeTarget || { x: to.x, y: to.y - 90 },
        reducedMotion,
      );
    } else if (fx.kind === "guard" || fx.kind === "heal") {
      ctx.globalAlpha = Math.sin(p * Math.PI) * 0.8;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(fx.x, fx.y - 70, 65, 100, 0, 0, TAU);
      ctx.stroke();
      for (let i = 0; i < 8; i++)
        ctx.fillRect(fx.x + Math.sin(i * 2) * 40, fx.y - p * 150 - i * 8, 3, 7);
    } else if (fx.kind === "hit") {
      ctx.globalAlpha = 1 - p;
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      for (let i = 0; i < (reducedMotion ? 5 : 16); i++) {
        const angle = i * 2.39996,
          radius = 5 + p * (fx.special ? 125 : 75);
        this.diamond(
          ctx,
          fx.x + Math.cos(angle) * radius,
          fx.y - 70 + Math.sin(angle) * radius * 0.6,
          3 + (1 - p) * 5,
          color,
        );
      }
      if (!reducedMotion) {
        ctx.strokeStyle = "#fff4d9";
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          ctx.moveTo(fx.x - 45 + i * 20, fx.y - 120);
          ctx.lineTo(fx.x - 15 + i * 20, fx.y - 45);
        }
        ctx.stroke();
      }
      ctx.font = "600 30px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.strokeStyle = "#102233";
      ctx.lineWidth = 5;
      ctx.strokeText(`−${fx.damage}`, fx.x, fx.y - 110 - p * 30);
      ctx.fillStyle = "#fff2da";
      ctx.fillText(`−${fx.damage}`, fx.x, fx.y - 110 - p * 30);
      if (fx.effectiveness && fx.effectiveness !== 1) {
        ctx.font = "600 13px Manrope, sans-serif";
        ctx.fillStyle = fx.effectiveness > 1 ? "#c7ff99" : "#ffd39e";
        ctx.fillText(
          fx.effectiveness > 1 ? "VANTAGEM" : "RESISTIDO",
          fx.x,
          fx.y - 83 - p * 30,
        );
      }
    }
    ctx.restore();
  }
  drawBattle(state, battle, now, fx, reducedMotion = false) {
    const ctx = this.battle;
    ctx.imageSmoothingEnabled = false;
    const environment = this.assets.images[
      battleEnvironment(battle.world, state.story.flags)
    ];
    ctx.drawImage(environment, 0, 0, 1280, 720);
    this.battlePoints = BATTLE_MARKS;
    const actors = ["opponent", "player"].map((side) => {
      const transformed = battleForm(battle, side, fx, now);
      const player = side === "player";
      return {
        side,
        transformed,
        player,
        key: transformed
          ? player
            ? fx?.fromForm || battle.starter
            : battle.enemy
          : player
            ? battle.playerSprite || state.appearance.gender
            : battle.opponentSprite,
        pose: battlePose(side, battle, fx, now, reducedMotion),
        height: player ? (transformed ? 165 : 180) : transformed ? 151 : 180,
      };
    });
    this.strikeOrigin = null;
    this.strikeTarget = null;
    if (fx?.kind === "strike") {
      const source = actors.find((a) => a.side === fx.side),
        target = actors.find((a) => a.side === fx.target),
        points = { fire: [387, 249], water: [352, 263], plant: [463, 267] };
      if (points[source.key]) {
        const offset = this.assets.battle.point(
          source.key,
          3,
          source.height,
          points[source.key],
          !source.player,
        );
        this.strikeOrigin = {
          x: source.pose.x + offset.x,
          y: source.pose.y + offset.y,
        };
      }
      this.strikeTarget = {
        x: target.pose.x,
        y: target.pose.y - target.height * 0.48,
      };
    }
    // Sort by feet, including the approach: the attacker passes in front naturally.
    actors.sort((a, b) => a.pose.y - b.pose.y);
    for (const actor of actors) {
      const { side, player, transformed, pose, key, height } = actor;
      this.shadow(ctx, pose.x, pose.ground, player ? 61 : 49);
      ctx.save();
      if (pose.fallProgress) {
        ctx.translate(pose.x, pose.ground - 18);
        ctx.rotate((-Math.PI / 2) * pose.fallProgress);
        ctx.translate(0, height * 0.46 * pose.fallProgress);
      } else ctx.translate(pose.x, pose.y);
      ctx.rotate(pose.tilt);
      ctx.scale(pose.scaleX, pose.scaleY);
      const appearance = transformed
        ? null
        : player
          ? state.appearance
          : battle.opponentAppearance;
      const partial =
        battle[side].partial &&
        (battle.partialReady ||
          battle.phase !== "intro" ||
          (fx?.kind === "partial" && (now - fx.start) / fx.duration > 0.42));
      const partialFade =
        partial && fx?.kind === "partial" && fx.to === false && fx.side === side
          ? Math.max(0, 1 - (now - fx.start) / fx.duration)
          : 1;
      if (partial && partialFade < 1)
        this.assets.draw(
          ctx,
          key,
          player ? "right" : "left",
          0,
          0,
          0,
          height,
          appearance,
          true,
          1 - partialFade,
        );
      if (transformed || partial) {
        this.assets.battle.draw(
          ctx,
          partial ? "lira" : key,
          pose.atlasPose,
          0,
          0,
          height,
          {
            flip: transformed && !player,
            possessed:
              player && !!state.story.possessed && battle.player.hp > 0,
            alpha: pose.alpha * partialFade,
            flash: pose.flash,
          },
        );
      } else {
        if (player && battle.fallen)
          this.assets.sleeping(
            ctx,
            state.appearance,
            0,
            0,
            height,
            state.zlink,
          );
        else
          this.assets.draw(
            ctx,
            key,
            player ? "right" : "left",
            pose.frame === 2 ? 2 : 0,
            0,
            0,
            height,
            appearance,
            true,
            pose.alpha,
          );
      }
      ctx.restore();
    }
    if (fx) {
      const point = BATTLE_MARKS[fx.target || fx.side];
      if (fx.fallen && point) {
        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.rotate(-1.35);
        this.drawFX(
          ctx,
          { ...fx, x: 0, y: 0, height: 185 },
          now,
          reducedMotion,
        );
        ctx.restore();
      } else
        this.drawFX(
          ctx,
          point && fx.kind !== "strike" ? { ...fx, ...point, height: 215 } : fx,
          now,
          reducedMotion,
        );
    }
  }
  drawMinimap(state, ctx, w, h, large = false) {
    if (!large) return this.drawRadar(state, ctx, w, h);
    const [mw, mh] = WORLD_SIZE[state.world],
      image = this.mapImage(state);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(image, 0, 0, w, h);
    ctx.fillStyle = "#051b2350";
    ctx.fillRect(0, 0, w, h);
    const sx = w / mw,
      sy = h / mh;
    if (this.camera && state.world === "forest") {
      ctx.strokeStyle = "#b7e1e080";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        this.camera.x * sx,
        this.camera.y * sy,
        ((this.view?.width || 1280) * sx) / this.camera.zoom,
        ((this.view?.height || 720) * sy) / this.camera.zoom,
      );
    }
    const target = questTarget(state);
    if (target) {
      this.diamond(
        ctx,
        target.x * sx,
        target.y * sy,
        large ? 11 : 6,
        "#ffe1a0",
      );
      if (large) {
        ctx.font = "600 16px Manrope, sans-serif";
        ctx.fillStyle = "#ffe6ae";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#091b2b";
        ctx.lineWidth = 4;
        ctx.strokeText(target.label, target.x * sx, target.y * sy - 17);
        ctx.fillText(target.label, target.x * sx, target.y * sy - 17);
      }
    }
    for (const n of worldNpcs(state.world)) {
      ctx.fillStyle = "#b6d1d6";
      ctx.beginPath();
      ctx.arc(n.x * sx, n.y * sy, large ? 4 : 2, 0, TAU);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(state.x * sx, state.y * sy);
    ctx.rotate(
      { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 }[
        state.dir
      ],
    );
    ctx.fillStyle = "#8cfff0";
    ctx.strokeStyle = "#05202b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 5);
    ctx.lineTo(0, 2);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  drawRadar(state, ctx, w, h) {
    const image = this.mapImage(state);
    const [mw, mh] = WORLD_SIZE[state.world],
      range = Math.min(this.radarRange || 610, Math.min(mw, mh) * 0.96),
      scale = w / range,
      cx = w / 2,
      cy = h / 2,
      r = w / 2 - 3,
      centerX = Math.max(range / 2, Math.min(mw - range / 2, state.x)),
      centerY = Math.max(range / 2, Math.min(mh - range / 2, state.y));
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.clip();
    ctx.fillStyle = "#092132";
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      image,
      cx - centerX * scale,
      cy - centerY * scale,
      mw * scale,
      mh * scale,
    );
    ctx.fillStyle = "#03172b35";
    ctx.fillRect(0, 0, w, h);
    const at = (x, y, clamped = false) => {
      let dx = (x - centerX) * scale,
        dy = (y - centerY) * scale;
      const d = Math.hypot(dx, dy);
      if (d > r - 15) {
        if (!clamped) return null;
        dx *= (r - 15) / d;
        dy *= (r - 15) / d;
      }
      return [cx + dx, cy + dy];
    };
    const target = questTarget(state);
    if (target) {
      const [x, y] = at(target.x, target.y, true);
      ctx.strokeStyle = "#08182b";
      ctx.lineWidth = 3;
      this.diamond(ctx, x, y, 11, "#ffe097");
      ctx.stroke();
    }
    for (const n of worldNpcs(state.world)) {
      const point = at(n.x, n.y);
      if (!point) continue;
      ctx.fillStyle = "#dae6f0";
      ctx.beginPath();
      ctx.arc(...point, 3, 0, TAU);
      ctx.fill();
    }
    const l = state.story.lira;
    if (l.visible && l.world === state.world) {
      const p = at(l.x, l.y);
      if (p) {
        ctx.fillStyle = "#f7cc75";
        ctx.font = "17px Manrope";
        ctx.textAlign = "center";
        ctx.fillText("✦", p[0], p[1] + 5);
      }
    }
    const exits = MAPS[state.world].exits.map((e) => [e.x, e.y]);
    ctx.strokeStyle = "#a8c8f2";
    ctx.lineWidth = 2;
    for (const e of exits) {
      const p = at(...e);
      if (p) ctx.strokeRect(p[0] - 4, p[1] - 4, 8, 8);
    }
    ctx.save();
    ctx.translate(...at(state.x, state.y, true));
    ctx.rotate(
      { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 }[
        state.dir
      ],
    );
    ctx.fillStyle = "#84fff0";
    ctx.strokeStyle = "#092233";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(7, 7);
    ctx.lineTo(0, 3);
    ctx.lineTo(-7, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = "#ead49699";
    ctx.lineWidth = 1;
    for (let i = 0; i < 24; i++) {
      const a = (i * TAU) / 24;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2));
      ctx.lineTo(
        cx + Math.cos(a) * (r - (i % 6 ? 5 : 10)),
        cy + Math.sin(a) * (r - (i % 6 ? 5 : 10)),
      );
      ctx.stroke();
    }
    ctx.restore();
  }
  mapImage(state) {
    const key =
      state.world +
      ":" +
      !!state.story.flags.labDamaged +
      ":" +
      !!state.story.flags.labSecondDamage;
    this.mapCache ||= new Map();
    if (this.mapCache.has(key)) return this.mapCache.get(key);
    const map = MAPS[state.world],
      c = document.createElement("canvas");
    [c.width, c.height] = map.size;
    const g = c.getContext("2d");
    g.drawImage(this.assets.tiles.terrain(state.world), 0, 0);
    this.assets.tiles.drawObjects(g, state);
    this.mapCache.set(key, c);
    return c;
  }
  beginBattle(state, battle) {
    this.battlePoints = BATTLE_MARKS;
    const opponent = battle.opponent.partial ? "lira" : battle.enemy;
    battle.contactGap = {
      player: Math.max(
        70,
        Math.min(
          125,
          (this.assets.battle.reach(battle.starter, 2, 165) +
            this.assets.battle.reach(opponent, 0, 151)) *
            0.83,
        ),
      ),
      opponent: Math.max(
        70,
        Math.min(
          125,
          (this.assets.battle.reach(opponent, 2, 151) +
            this.assets.battle.reach(battle.starter, 0, 165)) *
            0.83,
        ),
      ),
    };
  }
  label(id, name, x, y, important = false) {
    if (!this.labels) return;
    let node = this.labelNodes.get(id);
    if (!node) {
      node = document.createElement("span");
      node.className = "npc-name" + (important ? " important" : "");
      node.textContent = name;
      this.labels.append(node);
      this.labelNodes.set(id, node);
    }
    const c = this.camera || { x: 0, y: 0, zoom: 1 };
    x = (x - c.x) * c.zoom;
    y = (y - c.y) * c.zoom;
    const vw = this.view?.width || 1280,
      vh = this.view?.height || 720;
    node.hidden = x < 15 || x > vw - 15 || y < 50 || y > vh - 30;
    node.style.left = `${(x / vw) * 100}%`;
    node.style.top = `${((y + 7) / vh) * 100}%`;
  }
}
