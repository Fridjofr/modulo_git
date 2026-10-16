import * as THREE from "../vendor/three.module.min.js";
import { createZimonModel, createHumanModel } from "./models3d.js";
import { DEFAULT_APPEARANCE, PALETTES } from "./model.js";
export class Battle3D {
  constructor() {
    this.models = new Map();
    this.actors = {};
    this.available = false;
    try {
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
        preserveDrawingBuffer: true,
      });
      this.renderer.setSize(1280, 720);
      this.renderer.setPixelRatio(1);
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(
        -5.4,
        5.4,
        3.04,
        -3.04,
        0.1,
        40,
      );
      this.camera.position.set(0, 5.2, 9);
      this.camera.lookAt(0, 1.16, 0);
      this.scene.add(new THREE.HemisphereLight(0xd9f3ff, 0x455064, 2.1));
      const sun = new THREE.DirectionalLight(0xffedc6, 2.7);
      sun.position.set(-3, 6, 5);
      this.scene.add(sun);
      const rim = new THREE.DirectionalLight(0x7de6f0, 1.5);
      rim.position.set(4, 3, -3);
      this.scene.add(rim);
      this.models = new Map();
      this.actors = {};
      this.available = true;
      this.renderer.domElement.addEventListener("webglcontextlost", (e) => {
        e.preventDefault();
        this.available = false;
      });
    } catch {
      this.available = false;
    }
  }
  begin(state, battle) {
    if (!this.available) return;
    for (const a of Object.values(this.actors)) {
      this.scene.remove(a.human.root);
      this.dispose(a.human.root);
    }
    this.actors = {};
    for (const side of ["player", "opponent"]) {
      const human = createHumanModel(
        side === "player"
          ? state.appearance
          : battle.opponentAppearance || DEFAULT_APPEARANCE,
        PALETTES,
        (side === "player" && battle.playerSprite === "lira") ||
          (side === "opponent" && battle.opponentId === "lira"),
      );
      this.scene.add(human.root);
      this.actors[side] = { human };
    }
    this.currentBattle = battle;
  }
  model(key, side) {
    const id = side + key;
    if (!this.models.has(id)) {
      const model = createZimonModel(key);
      this.scene.add(model.root);
      this.models.set(id, model);
    }
    return this.models.get(id);
  }
  render(state, battle, now, fx, reduced = false) {
    if (!this.available) return null;
    if (this.currentBattle !== battle) this.begin(state, battle);
    for (const model of this.models.values()) model.root.visible = false;
    const t = now / 1000;
    this.forms = {};
    let focus = 0;
    if (fx?.kind === "strike" && !reduced) {
      const p = Math.min(1, (now - fx.start) / fx.duration);
      focus = Math.sin(p * Math.PI) * 0.045;
    }
    this.camera.zoom = 1 + focus;
    this.camera.updateProjectionMatrix();
    for (const side of ["player", "opponent"]) {
      const player = side === "player",
        key = player ? battle.starter : battle.enemy;
      const beast = this.model(key, side),
        human = this.actors[side].human;
      let transformed = battle[side].transformed,
        scale = 1,
        gesture = 0;
      const activeTransform =
        fx?.kind === "transform" && (fx.side === side || fx.side === "both");
      let q = 0;
      if (activeTransform) {
        q = Math.max(0, Math.min(1, (now - fx.start) / fx.duration));
        const already = fx.already?.[side];
        if (!already) {
          transformed = fx.to ? q > 0.57 : q < 0.57;
          gesture = Math.min(1, q / 0.26);
          scale = fx.to
            ? transformed
              ? 0.65 + 0.35 * Math.max(0, Math.min(1, (q - 0.57) / 0.34))
              : 1
            : transformed
              ? 1 - 0.25 * Math.min(1, q / 0.57)
              : 0.75 + 0.25 * Math.max(0, Math.min(1, (q - 0.57) / 0.34));
        }
      }
      this.forms[side] = transformed;
      human.root.visible = false;
      beast.root.visible = transformed;
      const model = transformed ? beast : human,
        root = model.root;
      root.position.set(player ? -2.55 : 2.3, 0, player ? 0.55 : -1.4);
      root.rotation.y = transformed
        ? player
          ? 0.48
          : Math.PI + 0.48
        : player
          ? 0.25
          : -0.25;
      root.scale.setScalar(scale * (transformed ? 0.86 : 0.9));
      const strike = fx?.kind === "strike" && fx.side === side,
        p = strike
          ? Math.max(0, Math.min(1, (now - fx.start) / fx.duration))
          : 0;
      if (strike && !reduced) {
        const lunge =
          p < 0.23
            ? -0.08 * Math.sin((p / 0.23) * Math.PI)
            : p < 0.63
              ? Math.sin((((p - 0.23) / 0.4) * Math.PI) / 2)
              : Math.cos((((p - 0.63) / 0.37) * Math.PI) / 2);
        root.position.x +=
          (player ? 1 : -1) *
          lunge *
          (fx.action === "attack"
            ? battle[player ? "opponent" : "player"].transformed
              ? 3.2
              : 4.0
            : 0.36);
        root.position.z +=
          (player ? -1 : 1) * lunge * (fx.action === "attack" ? 1.6 : 0.2);
        root.position.y += Math.sin(p * Math.PI) * 0.12;
      }
      const hit =
        fx?.kind === "hit" && fx.target === side
          ? Math.min(1, (now - fx.start) / fx.duration)
          : 0;
      model.animate(t, {
        gesture,
        action: strike ? fx.action : null,
        progress: p,
        hit,
        reduced,
      });
      if ((battle.displayHP?.[side] ?? battle[side].hp) <= 0) {
        root.rotation.z = (player ? -1 : 1) * 0.3;
        root.position.y = -0.15;
      } else root.rotation.z = 0;
    }
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement;
  }
  dispose(root) {
    const geometries = new Set(),
      materials = new Set();
    root.traverse((o) => {
      if (o.isMesh) {
        geometries.add(o.geometry);
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          materials.add(m);
      }
    });
    for (const g of geometries) g.dispose();
    for (const m of materials) m.dispose();
  }
  screen(side) {
    const p = new THREE.Vector3(
      side === "player" ? -2.55 : 2.3,
      0,
      side === "player" ? 0.55 : -1.4,
    ).project(this.camera);
    return { x: (p.x + 1) * 640, y: (1 - p.y) * 360 };
  }
  stats() {
    return {
      rig: "volumetric-primal-v06",
      available: this.available,
      triangles: this.renderer?.info.render.triangles || 0,
      models: this.models.size,
      drawCalls: this.renderer?.info.render.calls || 0,
    };
  }
}
