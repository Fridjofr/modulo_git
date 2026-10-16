import * as THREE from "../vendor/three.module.min.js";

// Volumetric, articulated creatures. Profiles follow the approved Primal sheets:
// Pyron: charcoal feline, cream ruff, lava armour and flame crown/tail.
// Marivon: blue amphibious feline, white chest, gold gills and broad water fins.
// Verdrax: bark, overlapping leaves, branching antlers and a foliage tail.
export function createCreatureRig(key) {
  const root = new THREE.Group(),
    torso = new THREE.Group();
  root.add(torso);
  root.name = key;
  const P = {
    fire: {
      body: 0x252a34,
      dark: 0x101922,
      plate: 0x3c2529,
      light: 0xe6c89a,
      accent: 0xff6b27,
      iris: 0xffa629,
    },
    water: {
      body: 0x1878bf,
      dark: 0x123d68,
      plate: 0x1e9bd4,
      light: 0xdcebdc,
      accent: 0xeeb954,
      iris: 0x45d6e7,
    },
    plant: {
      body: 0x775034,
      dark: 0x352a22,
      plate: 0x376f35,
      light: 0xdcc397,
      accent: 0x7da83d,
      iris: 0x8fe868,
    },
  }[key];
  const materials = new Map(),
    legs = [],
    eyes = [],
    flames = [],
    leaves = [];
  function mat(color, emissive = false, basic = false) {
    const id = color + ":" + emissive + ":" + basic;
    if (!materials.has(id))
      materials.set(
        id,
        basic
          ? new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
          : new THREE.MeshStandardMaterial({
              color,
              roughness: 0.88,
              metalness: emissive ? 0.12 : 0.02,
              emissive: emissive ? color : 0,
              emissiveIntensity: emissive ? 0.55 : 0,
            }),
      );
    return materials.get(id);
  }
  function mesh(
    parent,
    g,
    color,
    pos = [0, 0, 0],
    glow = false,
    basic = false,
  ) {
    const m = new THREE.Mesh(g, mat(color, glow, basic));
    m.position.set(...pos);
    parent.add(m);
    return m;
  }
  function loft(parent, sections, color, radial = 16) {
    const v = [],
      indices = [];
    for (const [x, y, ry, rz] of sections)
      for (let j = 0; j < radial; j++) {
        const a = (j / radial) * Math.PI * 2;
        v.push(x, y + Math.cos(a) * ry, Math.sin(a) * rz);
      }
    for (let i = 0; i < sections.length - 1; i++)
      for (let j = 0; j < radial; j++) {
        const a = i * radial + j,
          b = i * radial + ((j + 1) % radial),
          c = a + radial,
          d = b + radial;
        indices.push(a, b, c, b, d, c);
      }
    const first = v.length / 3;
    v.push(sections[0][0], sections[0][1], 0);
    const last = v.length / 3;
    v.push(sections.at(-1)[0], sections.at(-1)[1], 0);
    for (let j = 0; j < radial; j++) {
      indices.push(first, (j + 1) % radial, j);
      const a = (sections.length - 1) * radial;
      indices.push(last, a + j, a + ((j + 1) % radial));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return mesh(parent, g, color);
  }
  function tube(parent, points, radius, color, radii = null) {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
    );
    const g = new THREE.TubeGeometry(
      curve,
      Math.max(12, points.length * 5),
      radius,
      9,
      false,
    );
    if (radii) {
      const pos = g.attributes.position;
      for (let i = 0; i <= g.parameters.tubularSegments; i++) {
        const t = i / g.parameters.tubularSegments,
          center = curve.getPointAt(t),
          r = radii(t);
        for (let j = 0; j <= 9; j++) {
          const n = i * 10 + j;
          pos.setXYZ(
            n,
            center.x + (pos.getX(n) - center.x) * r,
            center.y + (pos.getY(n) - center.y) * r,
            center.z + (pos.getZ(n) - center.z) * r,
          );
        }
      }
      pos.needsUpdate = true;
      g.computeVertexNormals();
    }
    return mesh(parent, g, color);
  }
  function shard(parent, points, color, depth = 0.08, glow = false) {
    const shape = new THREE.Shape();
    shape.moveTo(...points[0]);
    for (const point of points.slice(1)) shape.lineTo(...point);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.018,
      bevelSegments: 1,
      steps: 1,
      curveSegments: 8,
    });
    g.translate(0, 0, -depth / 2);
    return mesh(parent, g, color, [0, 0, 0], glow);
  }
  function leaf(parent, pos, size, angle, color = P.plate) {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.1);
    shape.bezierCurveTo(-0.34, 0.18, -0.3, 0.55, 0, 0.9);
    shape.bezierCurveTo(0.3, 0.55, 0.34, 0.18, 0, -0.1);
    const m = mesh(
      parent,
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.045,
        bevelEnabled: true,
        bevelThickness: 0.018,
        bevelSize: 0.018,
        bevelSegments: 1,
        curveSegments: 5,
      }),
      color,
      pos,
    );
    m.scale.setScalar(size);
    m.rotation.z = angle;
    const vein = tube(
      m,
      [
        [0, 0, 0.07],
        [0, 0.28, 0.08],
        [0, 0.72, 0.055],
      ],
      0.012,
      0xb2ce72,
    );
    leaves.push({ m, angle });
    return m;
  }
  function flame(parent, pos, size, angle = 0) {
    const group = new THREE.Group();
    group.position.set(...pos);
    group.scale.setScalar(size);
    group.rotation.z = angle;
    parent.add(group);
    const outline = [
      [-0.22, 0],
      [-0.35, 0.25],
      [-0.22, 0.51],
      [-0.2, 0.79],
      [-0.04, 0.61],
      [0.06, 1.04],
      [0.22, 0.65],
      [0.34, 0.39],
      [0.28, 0.11],
      [0.12, -0.08],
    ];
    function flameMesh(color, depth) {
      const shape = new THREE.Shape();
      shape.moveTo(-0.1, -0.04);
      shape.bezierCurveTo(-0.47, 0.1, -0.32, 0.4, -0.17, 0.66);
      shape.quadraticCurveTo(-0.17, 0.39, -0.04, 0.43);
      shape.bezierCurveTo(0.08, 0.57, 0.04, 0.79, 0.08, 1.02);
      shape.bezierCurveTo(0.48, 0.61, 0.39, 0.36, 0.28, 0.2);
      shape.quadraticCurveTo(0.29, 0.04, 0.1, -0.05);
      shape.closePath();
      return mesh(
        group,
        new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.03,
          bevelSegments: 2,
          curveSegments: 8,
        }),
        color,
        [0, 0, -depth / 2],
        true,
      );
    }
    flameMesh(0xf44b20, 0.12);
    const inner = flameMesh(0xffbc37, 0.14);
    inner.scale.set(0.63, 0.75, 0.8);
    inner.position.set(0.02, 0.03, 0.02);
    const core = shard(
      group,
      [
        [-0.1, 0.06],
        [-0.13, 0.28],
        [0.06, 0.6],
        [0.16, 0.28],
        [0.11, 0.03],
      ],
      0xffeb91,
      0.17,
      true,
    );
    flames.push(group);
    return group;
  }
  loft(
    torso,
    [
      [-1.06, 1.02, 0.14, 0.19],
      [-0.9, 1.04, 0.33, 0.34],
      [-0.59, 1.07, 0.4, 0.38],
      [-0.23, 1.12, 0.39, 0.35],
      [0.08, 1.18, 0.45, 0.4],
      [0.39, 1.23, 0.43, 0.37],
      [0.6, 1.26, 0.2, 0.26],
    ],
    P.body,
  );
  loft(
    torso,
    [
      [0.13, 1.16, 0.24, 0.27],
      [0.35, 1.42, 0.35, 0.3],
      [0.58, 1.58, 0.3, 0.31],
      [0.76, 1.58, 0.14, 0.23],
    ],
    P.body,
  );
  const chest = loft(
    torso,
    [
      [0.19, 0.99, 0.22, 0.28],
      [0.41, 1.1, 0.33, 0.31],
      [0.61, 1.29, 0.25, 0.27],
    ],
    P.light,
  );
  const head = new THREE.Group();
  head.position.set(0.62, 1.65, 0);
  head.scale.setScalar(1.13);
  torso.add(head);
  loft(
    head,
    [
      [-0.43, 0.02, 0.16, 0.22],
      [-0.3, 0.03, 0.33, 0.35],
      [-0.1, 0.04, 0.39, 0.39],
      [0.14, 0.015, 0.35, 0.37],
      [0.37, -0.03, 0.23, 0.3],
      [0.48, -0.08, 0.14, 0.22],
    ],
    P.body,
  );
  const jaw = new THREE.Group();
  head.add(jaw);
  loft(
    jaw,
    [
      [0.15, -0.19, 0.11, 0.26],
      [0.37, -0.18, 0.12, 0.25],
      [0.62, -0.15, 0.08, 0.16],
    ],
    P.light,
    12,
  );
  loft(
    head,
    [
      [0.54, -0.1, 0.055, 0.14],
      [0.66, -0.095, 0.065, 0.12],
      [0.7, -0.08, 0.032, 0.07],
    ],
    P.dark,
    10,
  );
  // Cheek fur, angular eye sockets, brow crests and small visible canines.
  for (const side of [-1, 1]) {
    const cheek = shard(
      head,
      [
        [-0.34, -0.04],
        [-0.41, -0.22],
        [-0.23, -0.2],
        [-0.26, -0.35],
        [-0.02, -0.27],
        [0.11, -0.36],
        [0.32, -0.19],
        [0.17, -0.12],
      ],
      P.light,
      0.095,
    );
    cheek.position.z = side * 0.25;
    const ear = shard(
      head,
      key === "water"
        ? [
            [-0.37, 0.22],
            [-0.35, 0.52],
            [-0.02, 0.4],
            [0.05, 0.18],
          ]
        : [
            [-0.37, 0.22],
            [-0.39, 0.65],
            [-0.02, 0.4],
            [0.05, 0.18],
          ],
      key === "water" ? P.body : P.dark,
      0.14,
    );
    ear.position.z = side * 0.28;
    const inset = shard(
      ear,
      [
        [-0.31, 0.29],
        [-0.32, key === "water" ? 0.46 : 0.56],
        [-0.1, 0.39],
      ],
      key === "fire" ? 0xaf553e : P.accent,
      0.15,
    );
    inset.position.z = side * 0.04;
    const eye = new THREE.Group();
    eye.position.set(0.14, 0.075, side * 0.359);
    head.add(eye);
    eyes.push(eye);
    const white = shard(
      eye,
      [
        [-0.16, 0.035],
        [-0.105, 0.13],
        [0.1, 0.1],
        [0.235, 0.015],
        [0.1, -0.1],
        [-0.08, -0.1],
      ],
      0xe9e8c7,
      0.013,
    );
    white.material = mat(0xe9e8c7, false, true);
    const iris = mesh(
      eye,
      new THREE.CircleGeometry(0.107, 18),
      P.iris,
      [0.065, -0.005, side * 0.026],
      false,
      true,
    );
    iris.scale.set(0.69, 1, 1);
    mesh(
      eye,
      new THREE.CircleGeometry(0.085, 14),
      0x15251e,
      [0.081, -0.003, side * 0.032],
      false,
      true,
    ).scale.set(0.31, 1, 1);
    mesh(
      eye,
      new THREE.CircleGeometry(0.027, 10),
      0xfff3d4,
      [0.042, 0.042, side * 0.038],
      false,
      true,
    );
    const brow = shard(
      head,
      [
        [-0.13, 0.22],
        [0.08, 0.18],
        [0.38, 0.04],
        [0.3, 0.17],
        [0.02, 0.3],
      ],
      key === "fire" ? 0xdf5928 : P.dark,
      0.09,
    );
    brow.position.z = side * 0.385;
    const fang = mesh(jaw, new THREE.ConeGeometry(0.035, 0.1, 6), 0xf1ddba, [
      0.45,
      -0.24,
      side * 0.16,
    ]);
    fang.rotation.z = Math.PI;
  }
  // Tapered continuous leg volumes, independently posed hips and lower legs.
  for (const x of [-0.79, 0.38])
    for (const side of [-1, 1]) {
      const hip = new THREE.Group();
      hip.position.set(x, x < 0 ? 1.0 : 1.1, side * 0.29);
      torso.add(hip);
      const fore = x > 0;
      tube(
        hip,
        [
          [0, 0, 0],
          [fore ? 0.03 : 0.1, -0.18, 0],
          [fore ? -0.04 : 0.17, -0.38, 0.015],
        ],
        fore ? 0.19 : 0.23,
        P.body,
        (t) => 1 - t * 0.3,
      );
      const knee = new THREE.Group();
      knee.position.set(fore ? -0.04 : 0.17, -0.38, 0.015);
      hip.add(knee);
      tube(
        knee,
        [
          [0, 0, 0],
          [fore ? 0.02 : -0.08, -0.18, 0],
          [0.08, -0.38, 0.015],
        ],
        0.13,
        P.body,
        (t) => 1 - t * 0.23,
      );
      const foot = new THREE.Group();
      foot.position.set(0.11, -0.48, 0.02);
      knee.add(foot);
      loft(
        foot,
        [
          [-0.14, 0.06, 0.085, 0.14],
          [0, 0.07, 0.11, 0.17],
          [0.19, 0.04, 0.085, 0.155],
          [0.29, 0.03, 0.04, 0.11],
        ],
        P.dark,
        12,
      );
      for (let toe = 0; toe < 3; toe++) {
        const digit = loft(
          foot,
          [
            [0.1, 0.03, 0.065, 0.055],
            [0.25, 0.025, 0.06, 0.05],
            [0.33, 0.015, 0.02, 0.03],
          ],
          key === "plant" ? P.body : P.body,
          10,
        );
        digit.position.z = (toe - 1) * 0.1;
        const nail = mesh(
          foot,
          new THREE.ConeGeometry(0.038, 0.13, 6),
          P.light,
          [0.33, 0.015, (toe - 1) * 0.1],
        );
        nail.rotation.z = -Math.PI / 2;
      }
      legs.push({ hip, knee, foot, fore, side });
    }
  const tail = new THREE.Group();
  tail.position.set(-1.0, 1.08, 0);
  torso.add(tail);
  tube(
    tail,
    [
      [0, 0, 0],
      [-0.3, 0.08, 0],
      [-0.63, 0.25, 0.03],
      [-0.95, 0.47, 0.08],
      [-1.12, 0.7, 0.07],
    ],
    0.16,
    P.body,
    (t) => 1 - t * 0.72,
  );
  if (key === "fire") {
    flame(head, [-0.08, 0.27, 0], 0.76, -0.1);
    flame(tail, [-1.1, 0.55, 0.05], 0.84, -0.55);
    for (let i = 0; i < 4; i++) {
      const x = -0.85 + i * 0.32;
      const plate = shard(
        torso,
        [
          [x - 0.2, 1.22],
          [x - 0.23, 1.4],
          [x - 0.04, 1.42],
          [x + 0.09, 1.53],
          [x + 0.2, 1.32],
          [x + 0.05, 1.16],
        ],
        i % 2 ? P.dark : P.plate,
        0.29,
      );
      plate.position.z = 0;
      for (const side of [-1, 1]) {
        const a = shard(
          torso,
          [
            [x - 0.16, 1.27],
            [x - 0.21, 1.06],
            [x - 0.02, 0.98],
            [x + 0.16, 1.22],
            [x + 0.04, 1.42],
          ],
          P.plate,
          0.07,
        );
        a.position.z = side * 0.34;
        tube(
          torso,
          [
            [x - 0.12, 1.24, side * 0.385],
            [x, 1.18, side * 0.39],
            [x - 0.03, 1.06, side * 0.35],
            [x + 0.07, 1.0, side * 0.31],
          ],
          0.017,
          0xff842e,
        );
      }
    }
    for (const side of [-1, 1])
      for (let i = 0; i < 3; i++) {
        const tuft = shard(
          head,
          [
            [-0.28 - i * 0.06, 0.1 - i * 0.1],
            [-0.58 - i * 0.05, 0.03 - i * 0.13],
            [-0.28, -0.14 - i * 0.09],
          ],
          i === 1 ? P.plate : P.body,
          0.1,
        );
        tuft.position.z = side * (0.22 + i * 0.03);
      }
    for (const l of legs)
      tube(
        l.hip,
        [
          [0.13, -0.08, l.side * 0.04],
          [0.1, -0.2, l.side * 0.13],
          [0.13, -0.29, l.side * 0.07],
        ],
        0.014,
        0xf49136,
      );
  } else if (key === "water") {
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const fin = shard(
          head,
          [
            [-0.25, -0.06 - i * 0.06],
            [-0.7 - i * 0.04, 0.03 - i * 0.13],
            [-0.37, -0.3 - i * 0.04],
          ],
          P.accent,
          0.045,
        );
        fin.position.z = side * 0.31;
      }
      const fin = shard(
        tail,
        [
          [-0.65, 0.37],
          [-0.95, 0.84],
          [-1.34, 1.1],
          [-1.43, 0.82],
          [-1.38, 0.49],
          [-1.12, 0.21],
          [-0.77, 0.22],
        ],
        0x35c9e8,
        0.1,
      );
      fin.position.z = side * 0.05;
      const gold = shard(
        tail,
        [
          [-0.82, 0.31],
          [-1.29, 0.96],
          [-1.22, 0.56],
          [-0.96, 0.27],
        ],
        P.accent,
        0.11,
      );
      gold.position.z = side * 0.075;
    }
    const crest = shard(
      torso,
      [
        [-0.92, 1.32],
        [-0.75, 1.61],
        [-0.47, 1.53],
        [-0.23, 1.65],
        [0.04, 1.48],
      ],
      P.plate,
      0.16,
    );
    shard(
      head,
      [
        [-0.3, 0.3],
        [-0.18, 0.46],
        [0.02, 0.38],
        [0.16, 0.44],
        [0.3, 0.25],
      ],
      0x309ee0,
      0.12,
    );
    for (const side of [-1, 1])
      tube(
        torso,
        [
          [-0.7, 0.93, side * 0.34],
          [-0.3, 0.87, side * 0.37],
          [0.05, 1.0, side * 0.38],
        ],
        0.025,
        0x8bd6ec,
      );
  } else {
    // Carved grain follows the wood body; leaves overlap rather than forming balls.
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i++)
        tube(
          torso,
          [
            [-0.92 + i * 0.28, 0.98, side * 0.32],
            [-0.82 + i * 0.28, 1.12, side * 0.39],
            [-0.85 + i * 0.28, 1.27, side * 0.32],
          ],
          0.012,
          P.dark,
        );
      for (let i = 0; i < 5; i++) {
        const m = leaf(
          torso,
          [-0.85 + i * 0.27, 1.27, side * 0.29],
          0.6 + (i % 2) * 0.12,
          side > 0 ? -0.6 : 0.6,
          i % 2 ? 0x518438 : 0x2e6333,
        );
        m.rotation.x = side * 0.55;
      }
      for (let i = 0; i < 3; i++) {
        const m = leaf(
          head,
          [-0.29 - i * 0.03, 0.04 - i * 0.16, side * 0.29],
          0.42,
          -0.8,
          0x477936,
        );
        m.rotation.x = side * 0.4;
      }
      const antler = [
        [-0.22, 0.34, side * 0.28],
        [-0.3, 0.6, side * 0.34],
        [-0.43, 0.82, side * 0.39],
        [-0.45, 1.08, side * 0.35],
      ];
      tube(head, antler, 0.065, P.body, (t) => 1 - t * 0.65);
      tube(
        head,
        [
          [-0.34, 0.7, side * 0.36],
          [-0.06, 0.84, side * 0.41],
          [0.0, 1.04, side * 0.45],
        ],
        0.041,
        P.body,
        (t) => 1 - t * 0.75,
      );
      tube(
        head,
        [
          [-0.41, 0.88, side * 0.37],
          [-0.65, 0.95, side * 0.35],
          [-0.72, 1.11, side * 0.35],
        ],
        0.035,
        P.body,
        (t) => 1 - t * 0.7,
      );
    }
    for (let i = 0; i < 6; i++) {
      const m = leaf(
        tail,
        [-0.86, 0.38, (i - 2.5) * 0.09],
        0.72 + (i % 2) * 0.16,
        -0.8 + i * 0.28,
        i % 2 ? 0x64983b : 0x3d783a,
      );
      m.rotation.x = (i - 2.5) * 0.2;
    }
    leaf(head, [-0.05, 0.3, -0.05], 0.52, 0.12, 0x7ba43d);
  }
  function animate(
    time,
    { action = null, progress = 0, hit = 0, reduced = false } = {},
  ) {
    const t = reduced ? 0 : time;
    torso.position.set(0, Math.sin(t * 1.8) * 0.018, 0);
    torso.rotation.set(0, 0, Math.sin(t * 1.2) * 0.009);
    torso.scale.set(1, 1 + Math.sin(t * 1.8) * 0.007, 1);
    head.rotation.set(0, Math.sin(t * 0.8) * 0.025, -0.035);
    jaw.rotation.z = 0;
    tail.rotation.y = Math.sin(t * 1.5) * 0.14;
    tail.rotation.z = Math.sin(t * 1.2) * 0.06;
    const blink = t % 5.3 > 5.1 ? 0.13 : 1;
    for (const e of eyes) e.scale.y = blink;
    for (const l of legs) {
      l.hip.rotation.z = 0;
      l.knee.rotation.z = 0;
    }
    for (let i = 0; i < flames.length; i++) {
      const f = flames[i];
      f.scale.y = (i ? 0.84 : 0.76) * (1 + Math.sin(t * 5 + i) * 0.07);
      f.rotation.y = Math.sin(t * 2 + i) * 0.1;
    }
    for (let i = 0; i < leaves.length; i++) {
      const { m, angle } = leaves[i];
      m.rotation.z = angle + Math.sin(t * 1.4 + i) * 0.025;
    }
    if (action && !reduced) {
      const wind =
        Math.sin((Math.min(1, progress / 0.25) * Math.PI) / 2) *
        (progress < 0.25 ? 1 : Math.max(0, 1 - (progress - 0.25) / 0.23));
      const burst = Math.sin(
        Math.max(0, Math.min(1, (progress - 0.2) / 0.65)) * Math.PI,
      );
      torso.position.y -= wind * 0.12;
      head.rotation.z -= wind * 0.12;
      torso.scale.x += burst * 0.075;
      if (action === "attack") {
        for (const l of legs) {
          l.hip.rotation.z = (l.fore ? -1 : 1) * burst * 0.6;
          l.knee.rotation.z = (l.fore ? 1 : -1) * burst * 0.35;
        }
        head.rotation.z -= burst * 0.1;
        tail.rotation.y += burst * 0.35;
      } else {
        torso.rotation.y = burst * 0.18;
        head.rotation.y = -burst * 0.16;
        jaw.rotation.z = -burst * 0.12;
        for (const l of legs) {
          l.hip.rotation.z = l.fore ? -0.8 * burst : 0.18 * burst;
          l.knee.rotation.z = l.fore ? 0.35 * burst : 0;
        }
      }
    }
    if (hit > 0 && !reduced) {
      head.rotation.z += Math.sin(hit * Math.PI) * 0.15;
      torso.position.x = -Math.sin(hit * Math.PI) * 0.1;
    }
  }
  return {
    root,
    animate,
    design: "approved-primal-volumetric",
    joints: legs.length * 3 + 4,
  };
}
