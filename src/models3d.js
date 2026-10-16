import * as THREE from "../vendor/three.module.min.js";
// Authored, jointed low-poly meshes. No character image is mapped onto a plane.
export { createCreatureRig as createZimonModel } from "./creature-rig.js";
export function createHumanModel(appearance, palettes, mentor = false) {
  if (mentor)
    appearance = { ...appearance, bag: 0, style: 0, gender: "female" };
  const root = new THREE.Group(),
    body = new THREE.Group();
  root.add(body);
  const color = (key) => new THREE.Color(palettes[key][appearance[key]]);
  const skin = new THREE.MeshToonMaterial({
      color: mentor ? 0xf0ba93 : color("skin"),
    }),
    hair = new THREE.MeshToonMaterial({
      color: mentor ? 0x252746 : color("hair"),
    });
  const shirt = new THREE.MeshToonMaterial({
      color: mentor ? 0xe4f0ef : color("top"),
    }),
    pants = new THREE.MeshToonMaterial({
      color: mentor ? 0x253c69 : color("bottom"),
    });
  function oval(parent, mat, pos, size) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 7), mat);
    m.position.set(...pos);
    m.scale.set(...size);
    parent.add(m);
    return m;
  }
  function box(parent, mat, pos, size) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
    m.position.set(...pos);
    parent.add(m);
    return m;
  }
  const boots = new THREE.MeshToonMaterial({ color: 0x192b3e }),
    white = new THREE.MeshToonMaterial({ color: 0xeaf4ed });
  oval(body, shirt, [0, 1.18, 0], [0.32, 0.45, 0.2]);
  oval(body, pants, [0, 0.78, 0], [0.3, 0.2, 0.2]);
  const legs = [];
  for (const x of [-0.16, 0.16]) {
    const leg = new THREE.Group();
    leg.position.set(x, 0.74, 0);
    body.add(leg);
    oval(leg, pants, [0, -0.22, 0], [0.115, 0.28, 0.13]);
    oval(leg, mentor ? pants : skin, [0, -0.46, 0], [0.1, 0.16, 0.11]);
    oval(leg, boots, [0, -0.62, 0.05], [0.14, 0.115, 0.23]);
    legs.push(leg);
  }
  const head = new THREE.Group();
  head.position.set(0, 1.91, 0);
  body.add(head);
  oval(head, skin, [0, 0, 0], [0.32, 0.38, 0.28]);
  oval(head, hair, [0, 0.18, -0.035], [0.35, 0.27, 0.3]);
  const feminine = mentor || appearance.gender === "female";
  if (feminine) {
    oval(
      head,
      hair,
      [0, -0.03, -0.19],
      [0.35, appearance.style === 1 ? 0.24 : 0.51, 0.19],
    );
    if (appearance.style !== 1 && !mentor)
      oval(head, hair, [-0.23, 0.28, -0.08], [0.19, 0.2, 0.18]);
    if (mentor) oval(head, hair, [0.27, -0.14, -0.16], [0.15, 0.5, 0.16]);
  } else
    for (let i = 0; i < 6; i++) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.13, appearance.style === 1 ? 0.2 : 0.34, 4),
        hair,
      );
      spike.position.set(
        ((i % 3) - 1) * 0.2,
        0.37,
        Math.floor(i / 3) * 0.22 - 0.12,
      );
      spike.rotation.z = ((i % 3) - 1) * -0.3;
      head.add(spike);
    }
  for (const x of [-0.13, 0.13]) {
    oval(head, white, [x, 0.015, 0.254], [0.065, 0.09, 0.024]);
    oval(head, boots, [x, 0.015, 0.277], [0.033, 0.065, 0.015]);
  }
  oval(head, skin, [0, -0.075, 0.28], [0.055, 0.065, 0.045]);
  const accessory = new THREE.MeshToonMaterial({ color: color("accent") });
  if (!feminine || mentor) {
    box(body, boots, [0, 1.18, 0.195], [0.21, 0.55, 0.035]);
    for (const x of [-0.16, 0.16])
      box(body, white, [x, 1.25, 0.202], [0.035, 0.56, 0.04]);
  }
  if (appearance.style === 2 && !mentor) {
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.325, 0.025, 5, 18),
      white,
    );
    band.position.set(0, 0.15, -0.025);
    band.rotation.x = Math.PI / 2;
    head.add(band);
  }
  if (appearance.bag === 2) {
    box(body, boots, [0, 1.15, -0.24], [0.46, 0.55, 0.19]);
    box(body, accessory, [0, 1.16, -0.28], [0.4, 0.45, 0.19]);
    for (const x of [-0.2, 0.2])
      box(body, accessory, [x, 1.27, 0.2], [0.045, 0.51, 0.04]);
  }
  if (appearance.bag === 1) {
    box(body, boots, [0.35, 0.9, 0.05], [0.27, 0.27, 0.18]);
    box(body, accessory, [0.35, 0.92, 0.12], [0.23, 0.21, 0.08]);
    const strap = box(
      body,
      accessory,
      [0.045, 1.25, 0.22],
      [0.035, 0.78, 0.025],
    );
    strap.rotation.z = 0.77;
  }
  oval(head, boots, [0, -0.18, 0.265], [0.065, 0.012, 0.012]);
  const arms = [];
  for (const x of [-0.34, 0.34]) {
    const arm = new THREE.Group();
    arm.position.set(x, 1.48, 0);
    body.add(arm);
    oval(arm, shirt, [0, -0.15, 0], [0.115, 0.22, 0.12]);
    const forearm = new THREE.Group();
    forearm.position.y = -0.29;
    arm.add(forearm);
    oval(forearm, skin, [0, -0.14, 0], [0.09, 0.19, 0.09]);
    oval(forearm, skin, [0, -0.3, 0], [0.095, 0.1, 0.09]);
    arms.push({ arm, forearm });
  }
  const watch = new THREE.MeshToonMaterial({ color: 0x264451 }),
    screen = new THREE.MeshBasicMaterial({ color: 0x87fff4 });
  box(arms[0].forearm, watch, [0, -0.23, 0.035], [0.22, 0.13, 0.15]);
  const display = box(
    arms[0].forearm,
    screen,
    [0, -0.23, 0.12],
    [0.14, 0.085, 0.035],
  );
  root.userData = { arms, legs, head, body };
  return {
    root,
    animate(time, { gesture = 0, reduced = false } = {}) {
      const t = reduced ? 0 : time;
      body.position.y = Math.sin(t * 1.7) * 0.012;
      head.rotation.y = Math.sin(t) * 0.06;
      const reach = Math.sin(Math.min(1, gesture) * Math.PI * 0.5);
      arms[0].arm.rotation.z = 0.95 * reach;
      arms[1].arm.rotation.z = -1.06 * reach;
      arms[0].forearm.rotation.x = -1.1 * reach;
      arms[1].forearm.rotation.x = -1.4 * reach;
      display.scale.setScalar(1 + reach * Math.sin(t * 9) * 0.12);
    },
  };
}
