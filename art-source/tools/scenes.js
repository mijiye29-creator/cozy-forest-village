// Wordless Korean-history storybook scenes (2026-10-09). Built from the same procedural models as the game
// (models.js), rendered by scene.html -> build_story_scenes.py -> art-source/storybook-korea/*.jpg.
// Story: a 2026 Korean boy reads a Korean history book at night, falls into it, helps the villages of
// 임꺽정 · 이순신 · 광개토대왕, and wakes at his desk in the morning. No text anywhere (AGENTS.md).
import * as THREE from 'three';
import { MODELS, PAL, mat, box, rbox, ball, cyl, cone, torus } from './models.js';

const S = Math.sin, C = Math.cos, TAU = Math.PI * 2;
function put(scene, name, x, y, z, ry = 0, s = 1, anim = 'idle', u = 0, poseFn) {
  const m = MODELS[name](); if (anim && m.anims[anim]) m.anims[anim].fn(u, m.nodes); if (poseFn) poseFn(m.nodes);
  m.root.position.set(x, y, z); m.root.rotation.y = ry; m.root.scale.multiplyScalar(s); scene.add(m.root);
  m.root.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); return m;
}
function glowMat(c, ei = 2) { return mat(c, { emissive: c, ei }); }
function sparkles(p, n, cx, cy, cz, r, c, size = 0.03, seed = 1) {
  let k = seed; const rnd = () => (k = (k * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) { const a = rnd() * TAU, h = rnd(), d = Math.sqrt(rnd()) * r; ball(p, size * (0.5 + rnd()), c, cx + C(a) * d, cy + h * r * 1.2, cz + S(a) * d, 6, { emissive: c, ei: 3 }); }
}
function snowGround(p, w, d, y = 0) { const g = box(p, w, 0.1, d, PAL.snow, 0, y - 0.05, 0); g.receiveShadow = true; for (let i = 0; i < 18; i++) ball(p, 0.4 + (i % 4) * 0.2, PAL.snow, -w / 2 + (i * 37 % 100) / 100 * w, y - 0.25, -d / 2 + (i * 53 % 100) / 100 * d, 10).scale.set(1.6, 0.5, 1.2); }
function mountains(p, z, c = '#9fb4c8', n = 7, h = 5) { for (let i = 0; i < n; i++) { const m = cone(p, 3 + (i % 3), h + (i % 2) * 2, c, -14 + i * 4.6, (h + (i % 2) * 2) / 2 - 0.2, z - (i % 2) * 2, 7, { flat: true }); cone(p, 1.2 + (i % 3) * 0.3, (h + (i % 2) * 2) * 0.35, PAL.snow, -14 + i * 4.6, h + (i % 2) * 2 - (h + (i % 2) * 2) * 0.17 - 0.2, z - (i % 2) * 2, 7, { flat: true }); } }

/* ---- Korean buildings */
function hanok(p, x, z, ry = 0, s = 1, lit = true, giwa = true) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; g.scale.setScalar(s); p.add(g);
  rbox(g, 3.4, 0.35, 2.2, '#b7b0a2', 0, 0.17, 0, 0.05, { flat: true });                               // 기단 stone base
  box(g, 3.0, 1.3, 1.8, '#efe6d2', 0, 1.0, 0);                                                          // white walls
  [-1.5, -0.5, 0.5, 1.5].forEach(px => box(g, 0.12, 1.4, 0.12, '#6d4126', px, 1.0, 0.92));               // 기둥
  box(g, 3.1, 0.12, 0.14, '#6d4126', 0, 1.62, 0.92); box(g, 3.1, 0.1, 0.12, '#6d4126', 0, 0.42, 0.92);
  [-1, 0, 1].forEach(i => { const w = box(g, 0.75, 0.8, 0.04, lit ? '#ffd68a' : '#e9e0cc', i * 1.0, 1.0, 0.92, lit ? { emissive: '#ffb54a', ei: 1.4 } : undefined);
    for (let a = 0; a < 4; a++) box(g, 0.02, 0.8, 0.05, '#6d4126', i * 1.0 - 0.3 + a * 0.2, 1.0, 0.94); for (let b = 0; b < 4; b++) box(g, 0.75, 0.02, 0.05, '#6d4126', i * 1.0, 0.7 + b * 0.2, 0.94); }); // 창호 lattice
  if (giwa) { // 기와 roof with up-swept eaves
    [-1, 1].forEach(sd => { const r = rbox(g, 4.0, 0.16, 1.7, '#4a4f58', 0, 2.1, sd * 0.62, 0.05); r.rotation.x = sd * 0.5; for (let i = 0; i < 12; i++) { const t = box(r, 0.06, 0.1, 1.72, '#3a3e46', -1.9 + i * 0.35, 0.08, 0); }
      rbox(r, 4.06, 0.1, 0.6, PAL.snow, 0, 0.13, -sd * 0.3, 0.04); });
    rbox(g, 4.2, 0.22, 0.26, '#3a3e46', 0, 2.55, 0, 0.08);                                                // 용마루 ridge
    [-1, 1].forEach(sx => [-1, 1].forEach(sz => { const c = cone(g, 0.18, 0.5, '#4a4f58', sx * 2.0, 1.95, sz * 1.15, 6); c.rotation.z = -sx * 0.9; c.rotation.x = sz * 0.6; })); // 추녀 curl
  } else { const th = ball(g, 2.0, '#c9a45c', 0, 1.65, 0, 16); th.scale.set(1.0, 0.42, 0.75); const sn = ball(g, 1.9, PAL.snow, 0, 1.78, 0, 16); sn.scale.set(0.9, 0.36, 0.66); // 초가 thatch
    for (let i = 0; i < 6; i++) torus(g, 1.85 - i * 0.05, 0.02, '#8a6a3a', 0, 1.7 + i * 0.12, 0, TAU).rotation.x = Math.PI / 2; }
  if (lit) { const l = cyl(g, 0.12, 0.12, 0.3, '#c8382c', 1.75, 1.4, 1.0, 10, { emissive: '#ff7a3a', ei: 1.6 }); }
  return g;
}
function lanternString(p, x0, x1, y, z, n, cols) { const r = cyl(p, 0.01, 0.01, x1 - x0, '#3a2a20', (x0 + x1) / 2, y, z, 4); r.rotation.z = Math.PI / 2;
  for (let i = 0; i < n; i++) { const x = x0 + (i + 0.5) * (x1 - x0) / n, sag = S((i + 0.5) / n * Math.PI) * 0.3; const c = cols[i % cols.length]; ball(p, 0.14, c, x, y - 0.2 - sag, z, 10, { emissive: c, ei: 1.8 }).scale.set(1, 1.3, 1); } }
function book(p, x, y, z, ry, open = 1, glow = 0) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; p.add(g);
  rbox(g, 1.0, 0.05, 0.72, '#7a2f22', 0, 0.025, 0, 0.02);                                               // cover
  [-1, 1].forEach(sd => { const pg = rbox(g, 0.47, 0.06, 0.68, glow ? '#fff4c8' : '#f6efdc', sd * 0.245, 0.07, 0, 0.02, glow ? { emissive: '#ffd27a', ei: glow } : undefined); pg.rotation.z = -sd * 0.08 * open;
    for (let i = 0; i < 5; i++) box(g, 0.32, 0.004, 0.012, '#c9b98e', sd * 0.25, 0.104, -0.22 + i * 0.1); }); // faint lines, no letters
  box(g, 0.02, 0.08, 0.7, '#5a2318', 0, 0.06, 0);
  return g;
}

/* ---- modern Korean bedroom (2026) */
function bedroom(scene, night = true) {
  const room = new THREE.Group(); scene.add(room);
  box(room, 8, 0.1, 6, '#c99a66', 0, -0.05, 0).receiveShadow = true;                                    // wooden floor (장판-tone)
  box(room, 8, 4.4, 0.1, night ? '#e8dcc4' : '#f4ead6', 0, 2.2, -3);                                    // back wall
  box(room, 0.1, 4.4, 6, night ? '#e2d4ba' : '#efe3cb', -4, 2.2, 0);                                     // left wall
  // window with apartment blocks outside
  box(room, 2.6, 1.9, 0.06, night ? '#1d2a4a' : '#bfe4ff', 1.6, 2.5, -2.94, night ? undefined : { emissive: '#ffe9b0', ei: 0.6 });
  box(room, 2.8, 0.1, 0.14, '#f4f4f2', 1.6, 3.48, -2.9); box(room, 2.8, 0.1, 0.14, '#f4f4f2', 1.6, 1.52, -2.9); box(room, 0.08, 1.9, 0.14, '#f4f4f2', 1.6, 2.5, -2.9);
  for (let b = 0; b < 4; b++) { const bx = 0.6 + b * 0.62, bh = 0.7 + (b % 2) * 0.45; box(room, 0.46, bh, 0.02, night ? '#2c3a5c' : '#9fb6cc', bx, 1.6 + bh / 2, -2.92);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) if ((r + c + b) % 3 !== 0) box(room, 0.07, 0.06, 0.01, '#ffd27a', bx - 0.1 + c * 0.2, 1.72 + r * 0.17, -2.905, night ? { emissive: '#ffb54a', ei: 1.5 } : undefined); }
  if (night) { for (let i = 0; i < 14; i++) ball(room, 0.025, '#ffffff', 0.5 + (i * 0.37) % 2.3, 1.7 + (i * 0.53) % 1.6, -2.88, 6, { emissive: '#ffffff', ei: 1 }); ball(room, 0.14, '#fff4d0', 2.5, 3.1, -2.9, 12, { emissive: '#fff4d0', ei: 2 }); }
  // desk, chair, lamp, shelf, bed
  rbox(room, 2.2, 0.08, 1.0, '#e9e2d4', 0.4, 1.1, -2.2, 0.02); [-0.6, 1.4].forEach(x => box(room, 0.08, 1.1, 0.9, '#d9d2c4', x, 0.55, -2.2));
  const chair = new THREE.Group(); chair.position.set(0.4, 0, -1.3); room.add(chair); rbox(chair, 0.7, 0.08, 0.6, '#3a5a8a', 0, 0.68, 0, 0.03); cyl(chair, 0.04, 0.04, 0.66, '#9aa4ad', 0, 0.34, 0, 6); rbox(chair, 0.7, 0.7, 0.08, '#3a5a8a', 0, 1.05, 0.3, 0.04);
  const lamp = new THREE.Group(); lamp.position.set(-0.35, 1.14, -2.45); room.add(lamp); cyl(lamp, 0.14, 0.16, 0.04, '#2b2f36', 0, 0.02, 0, 12); const arm = cyl(lamp, 0.02, 0.02, 0.7, '#2b2f36', 0.1, 0.35, 0, 6); arm.rotation.z = -0.3;
  cone(lamp, 0.16, 0.2, '#2b2f36', 0.25, 0.68, 0.12, 12).rotation.x = -0.6; ball(lamp, 0.06, '#fff2c8', 0.25, 0.62, 0.18, 8, { emissive: '#ffd27a', ei: 3 });
  for (let i = 0; i < 7; i++) rbox(room, 0.12, 0.42 + (i % 3) * 0.06, 0.32, ['#c8382c', '#3f7fb8', '#f2c14e', '#4f9a6a', '#7a4a24', '#e2583e', '#5d7e8f'][i], -3.8, 2.6, -1.8 + i * 0.16, 0.01);
  box(room, 0.4, 0.06, 1.4, '#d9d2c4', -3.75, 2.36, -1.3);
  const bed = new THREE.Group(); bed.position.set(-2.6, 0, 0.6); room.add(bed); rbox(bed, 1.8, 0.45, 3.0, '#d9c4a0', 0, 0.22, 0, 0.06); rbox(bed, 1.7, 0.2, 2.9, '#f4f1ea', 0, 0.55, 0, 0.08); rbox(bed, 1.72, 0.18, 1.9, night ? '#5a7bb5' : '#7aa3d9', 0, 0.68, 0.45, 0.08); rbox(bed, 0.9, 0.2, 0.5, '#ffffff', 0, 0.75, -1.1, 0.1);
  box(room, 2.2, 0.03, 1.6, '#c8b18a', 0.6, 0.02, 0.6); // rug
  return { room, lampPos: new THREE.Vector3(-0.1, 1.82, -2.27) };
}
function seatHero(n) { n.legL.rotation.x = -1.45; n.legR.rotation.x = -1.45; n.armL.rotation.x = -1.1; n.armR.rotation.x = -1.1; n.armL.rotation.z = 0.25; n.armR.rotation.z = -0.25; n.head.rotation.x = 0.35; n.body.position.y = -0.04; }

/* ---- scenes: each returns { scene, camera, fog?, bloom } */
function lightsNight(scene, warmPos) {
  scene.add(new THREE.HemisphereLight('#7d90c4', '#3a2a20', 0.9));
  const k = new THREE.PointLight('#ffc77a', 5, 9, 1.4); k.position.copy(warmPos); k.castShadow = true; k.shadow.mapSize.set(1024, 1024); k.shadow.bias = -0.002; scene.add(k);
  const m = new THREE.DirectionalLight('#8fb0ff', 0.6); m.position.set(3, 5, -6); scene.add(m);
}
function lightsDay(scene, warm = '#fff0d8', inten = 2.4, dir = [-6, 9, 6]) {
  scene.add(new THREE.HemisphereLight('#dfeaff', '#f0cfa4', 1.4));
  const k = new THREE.DirectionalLight(warm, inten); k.position.set(...dir); k.castShadow = true; k.shadow.mapSize.set(2048, 2048);
  Object.assign(k.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 0.5, far: 60 }); k.shadow.bias = -0.0015; scene.add(k);
}
function cam(fov, pos, look) { const c = new THREE.PerspectiveCamera(fov, 944 / 1680, 0.1, 200); c.position.set(...pos); c.lookAt(...look); return c; }

export const SCENES = {
  'intro-01'() { // winter night, 2026: reading a Korean history book at his desk
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#1a1830');
    const { lampPos } = bedroom(scene, true); lightsNight(scene, lampPos);
    put(scene, 'hero', 0.4, 0.62, -1.45, Math.PI, 1, 'idle', 0, seatHero);
    book(scene, 0.4, 1.16, -1.95, 0, 1, 0.15);
    put(scene, 'corgi', -0.8, 0, -0.9, 0.6, 1.2, 'idle', 0.3);
    return { scene, camera: cam(44, [2.9, 2.1, 0.2], [0.2, 1.3, -1.9]), bloom: 0.35 };
  },
  'intro-02'() { // the history book wakes up: tiny turtle ship, king on horseback and a hanok rise out of the pages
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#14122a');
    rbox(scene, 6, 0.1, 4, '#e9e2d4', 0, -0.05, 0, 0.02);
    book(scene, 0, 0, 0.2, 0, 1, 0.7);
    const pl = new THREE.PointLight('#ffd27a', 2.5, 8, 1.4); pl.position.set(0, 1.6, 1.2); scene.add(pl); scene.add(new THREE.HemisphereLight('#6d82b8', '#2a2018', 0.4));
    const vis = new THREE.Group(); vis.position.set(0, 0.5, 0.1); scene.add(vis);
    put(vis, 'turtle_ship', -0.45, 0.2, 0.1, 0.7, 0.24, 'walk', 0.3); put(vis, 'gwanggaeto', 0.45, 0.12, 0.15, -0.7, 0.24, 'walk', 0.4); hanok(vis, 0, 0.62, -0.3, 0, 0.16, true, true); put(vis, 'imkkeokjeong', 0, 0.05, 0.35, 0, 0.26, 'cheer', 0.3);
    sparkles(scene, 70, 0, 0.15, 0.2, 0.9, '#ffe7a0', 0.012, 3); sparkles(scene, 30, 0, 0.3, 0.2, 0.7, '#9fd8ff', 0.01, 9);
    for (let i = 0; i < 3; i++) { const t = torus(scene, 0.35 + i * 0.18, 0.006, '#ffe7a0', 0, 0.35 + i * 0.25, 0.2, TAU, { emissive: '#ffd27a', ei: 2, opacity: 0.6 }); t.rotation.x = Math.PI / 2; }
    return { scene, camera: cam(40, [0, 1.6, 2.4], [0, 0.55, 0.05]), bloom: 0.55 };
  },
  'intro-03'() { // he steps into a glowing page
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#141a34'); scene.fog = new THREE.Fog('#141a34', 6, 18);
    box(scene, 10, 0.1, 10, '#1f2a48', 0, -0.05, 0);
    const page = rbox(scene, 2.2, 3.2, 0.08, '#fff4c8', 0, 1.6, -1.2, 0.04, { emissive: '#ffd27a', ei: 0.9 });
    const page2 = rbox(scene, 2.2, 3.2, 0.08, '#fff8e0', -1.3, 1.6, -0.9, 0.04, { emissive: '#ffe7a0', ei: 0.45 }); page2.rotation.y = 0.9;
    const pl = new THREE.PointLight('#ffd27a', 7, 10, 1.4); pl.position.set(0.6, 1.8, 0.8); scene.add(pl); scene.add(new THREE.HemisphereLight('#4a5a90', '#1a1a2a', 0.5));
    for (let i = 0; i < 10; i++) { const r = box(scene, 0.04, 6, 0.04, '#ffe7a0', -1.2 + i * 0.27, 1.6, -1.25, { emissive: '#ffe7a0', ei: 1.5, opacity: 0.35 }); r.rotation.z = (i - 4.5) * 0.12; }
    put(scene, 'hero', 0.0, 0, 0.3, Math.PI, 1, 'walk', 0.25);
    sparkles(scene, 90, 0, 0.2, -0.6, 2.2, '#ffe7a0', 0.025, 5); sparkles(scene, 50, 0, 0, 1.5, 4, '#cfe6ff', 0.02, 13);
    return { scene, camera: cam(48, [1.6, 1.7, 4.2], [0, 1.4, -0.6]), bloom: 0.6 };
  },
  'intro-04'() { // arrival: a snowy Joseon village at dusk
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#f2b98c'); scene.fog = new THREE.Fog('#e9b896', 14, 46);
    lightsDay(scene, '#ffcf9a', 1.6, [-8, 6, 4]);
    snowGround(scene, 60, 60); mountains(scene, -24, '#8aa0b8');
    hanok(scene, -3.2, -6, 0.3, 1, true, true); hanok(scene, 2.6, -7.5, -0.25, 1, true, false); hanok(scene, -0.4, -11, 0.05, 1.1, true, true); hanok(scene, 5.5, -12, -0.4, 1, true, false);
    [[-6, -3], [6, -4], [-7.5, -9], [8, -8], [-4, -14], [2, -15]].forEach(([x, z], i) => put(scene, i % 2 ? 'pine_small' : 'pine', x, 0, z, i, 1.3));
    put(scene, 'hero', 0.2, 0, 1.2, 2.9, 1, 'idle', 0.2); put(scene, 'corgi', 1.1, 0, 1.0, 2.6, 1.1, 'idle', 0.4);
    for (let i = 0; i < 6; i++) ball(scene, 0.12, '#ffb54a', -4 + i * 1.6, 1.4, -4.5 - (i % 2), 8, { emissive: '#ff9a3a', ei: 2 });
    return { scene, camera: cam(46, [2.2, 3.6, 6.2], [0, 1.2, -4]), bloom: 0.45 };
  },
  'ending-01'() { // lantern festival: the three heroes and the villagers say goodbye
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#2a3358'); scene.fog = new THREE.Fog('#2a3358', 16, 44);
    lightsDay(scene, '#ffd6a0', 0.9, [-6, 8, 6]); scene.add(new THREE.HemisphereLight('#7a8cc8', '#4a3020', 0.8));
    snowGround(scene, 60, 60); mountains(scene, -26, '#4a5a80');
    hanok(scene, -4.2, -6, 0.35, 1.1, true, true); hanok(scene, 3.8, -6.5, -0.35, 1.1, true, true); hanok(scene, 0, -10.5, 0, 1.2, true, true);
    lanternString(scene, -5, 5, 3.3, -3.4, 11, ['#e8463a', '#3f7fb8', '#f2c14e', '#4f9a6a']);
    const fire = new THREE.PointLight('#ffb05a', 6, 12, 1.4); fire.position.set(0, 1.2, -1.5); scene.add(fire);
    put(scene, 'hero', 0, 0, 0.6, 0.15, 1, 'cheer', 0.3);
    put(scene, 'imkkeokjeong', -1.7, 0, -0.4, 0.5, 1, 'cheer', 0.6); put(scene, 'yi_sunsin', 1.7, 0, -0.4, -0.5, 1, 'idle', 0.2);
    put(scene, 'gwanggaeto', 0.2, 0, -2.6, 0.2, 1, 'cheer', 0.15);
    put(scene, 'lumberjack', -3.0, 0, -1.6, 0.6, 1, 'cheer', 0.1); put(scene, 'shopkeeper', 3.0, 0, -1.8, -0.6, 1, 'cheer', 0.5); put(scene, 'fisher', -2.6, 0, 0.8, 0.5, 1, 'idle', 0.3); put(scene, 'corgi', 0.9, 0, 1.2, -0.3, 1.1, 'happy', 0.2);
    sparkles(scene, 40, 0, 4, -6, 5, '#ffe7a0', 0.04, 21);
    return { scene, camera: cam(50, [0.6, 2.4, 6.4], [0, 1.4, -1.5]), bloom: 0.7 };
  },
  'ending-02'() { // he rises back into the book above the village
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#1f2850'); scene.fog = new THREE.Fog('#1f2850', 14, 40);
    scene.add(new THREE.HemisphereLight('#7a8cc8', '#2a2018', 0.7));
    snowGround(scene, 60, 60); hanok(scene, -3.5, -5, 0.35, 1, true, true); hanok(scene, 3.5, -5.5, -0.35, 1, true, false); mountains(scene, -24, '#3a4a70');
    const bk = book(scene, 0, 4.6, -2.5, 0, 1, 2.6); bk.rotation.x = 1.0; bk.scale.setScalar(2.4);
    const pl = new THREE.PointLight('#ffd27a', 9, 14, 1.3); pl.position.set(0, 4.2, -1); scene.add(pl);
    for (let i = 0; i < 8; i++) { const r = box(scene, 0.05, 4.4, 0.05, '#ffe7a0', -0.6 + i * 0.17, 2.4, -1.6, { emissive: '#ffe7a0', ei: 1.4, opacity: 0.3 }); r.rotation.z = (i - 3.5) * 0.05; }
    put(scene, 'hero', 0, 2.2, -1.2, 0.2, 1, 'cheer', 0.25);
    put(scene, 'imkkeokjeong', -1.6, 0, 0.6, 0.4, 1, 'cheer', 0.4); put(scene, 'yi_sunsin', 1.6, 0, 0.6, -0.4, 1, 'cheer', 0.6); put(scene, 'corgi', 0.5, 0, 1.0, 0, 1.1, 'happy', 0.4);
    sparkles(scene, 110, 0, 1.5, -1.6, 2.4, '#ffe7a0', 0.03, 33);
    return { scene, camera: cam(52, [0, 1.6, 6.6], [0, 2.7, -1.5]), bloom: 0.6 };
  },
  'ending-03'() { // morning at home: asleep on the history book, a red helmet tassel on the desk
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#f7e6c4');
    bedroom(scene, false); lightsDay(scene, '#ffe2a8', 2.6, [4, 5, -8]);
    const sun = new THREE.PointLight('#ffe7b0', 3, 9, 1.4); sun.position.set(1.6, 2.6, -2.2); scene.add(sun);
    put(scene, 'hero', 0.4, 0.62, -1.45, Math.PI, 1, 'idle', 0, n => { seatHero(n); n.torso.rotation.x = 0.45; n.head.rotation.x = 0.35; n.head.rotation.z = 0.3; n.armL.rotation.x = -1.6; n.armR.rotation.x = -1.6; n.armL.rotation.z = 0.6; n.armR.rotation.z = -0.6; });
    book(scene, 0.4, 1.16, -1.95, 0, 1, 0);
    const tas = new THREE.Group(); tas.position.set(1.15, 1.16, -1.95); scene.add(tas); cyl(tas, 0.015, 0.02, 0.1, PAL.gold, 0, 0.05, 0, 8, { metal: 0.6, rough: 0.3 }); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, f = box(tas, 0.025, 0.16, 0.008, '#c8382c', S(a) * 0.04, 0.02, C(a) * 0.04); f.rotation.x = C(a) * 1.2; f.rotation.z = -S(a) * 1.2; } // 상모 souvenir
    put(scene, 'corgi', -0.8, 0, -0.9, 0.6, 1.2, 'idle', 0.6);
    for (let i = 0; i < 5; i++) { const r = box(scene, 0.06, 3.4, 0.06, '#fff2c8', 1.0 + i * 0.3, 1.4, -1.6 + i * 0.1, { emissive: '#fff2c8', ei: 0.8, opacity: 0.07 }); r.rotation.z = 0.55; r.rotation.x = -0.3; r.position.z -= 0.9; }
    return { scene, camera: cam(44, [2.9, 2.1, 0.2], [0.2, 1.3, -1.9]), bloom: 0.25 };
  },
};
