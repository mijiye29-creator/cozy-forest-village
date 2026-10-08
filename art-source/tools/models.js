// Cozy Forest Village — procedural low-poly storybook 3D model library.
// Every model is built from code (no downloaded assets), so GPT/Codex can tweak
// colours, proportions or poses here and re-run `python3 art-source/tools/build_3d.py`.
//
// Conventions
//  * Units: 1 unit ≈ 1 metre. Characters are ~1.5 units tall, origin at the feet.
//  * +Y up, characters face +Z. Facilities are centred on the origin, front face +Z.
//  * Every animated part is a named Object3D pivot so the same pose functions
//    drive both the exported glTF AnimationClips and the rendered sprite sheets.
//  * anims: { name: {dur, frames, fn(t /*0..1*/, nodes)} }  (loops seamlessly)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const PAL = {
  // Storybook palette sampled from the intro paintings: warm lamp amber vs cold blue snow.
  skin: '#f6cfae', cheek: '#ef9a8a', eye: '#2b211c', hairBrown: '#5a3a26', hairDark: '#2f2420', hairGinger: '#b8612e',
  heroCoat: '#4f7a3a', heroHat: '#3e6b45', heroScarf: '#c8382c', satchel: '#8a5a32', boots: '#5a3b26', pants: '#3a4a5c',
  lumber: '#2f8f55', fisher: '#2a86b8', miner: '#d39a2a', hunter: '#3d7a4a', hunter2: '#2c6fa5', hunter3: '#6a5bb5',
  wood: '#a8683a', woodDark: '#6d4126', woodLight: '#d9a066', log: '#8b5a35', logEnd: '#e7c08a',
  roofRed: '#b8473a', roofBlue: '#3f6f91', snow: '#f4f8fc', snowShade: '#cfe0ee', stone: '#9aa4ad', stoneDark: '#6d7680',
  metal: '#8d98a3', metalDark: '#4b545d', glow: '#ffb54a', glowHot: '#ff7a2a', window: '#ffd27a',
  pine: '#1f6b4f', pineLight: '#2f8c63', trunk: '#6b4128', grass: '#9ccf7e',
  bear: '#eef3f6', bearShade: '#c9d6df', bearNose: '#2a2a30', boss: '#d7e6f2', ice: '#8fd6ff', iceGlow: '#bff0ff',
  corgi: '#d9893b', corgiWhite: '#fbf3e6', fish: '#8fa9b8', fishBelly: '#e6eef2', ore: '#7fd0ff', gold: '#ffcf4a',
  awningA: '#d9483b', awningB: '#fbf1e1', awningC: '#2f7fb0', canvas: '#efe2c8', truck: '#d9573b', tire: '#2b2b30',
  // added with the 2026-10 set (machines, market extras, aurora hot-spring village); earlier colours unchanged
  machineYellow: '#f0bb3f', machineGreen: '#4f9a6a', rigBlue: '#3f7fb8', track: '#2b2f36', glass: '#bfe8ff',
  spring: '#3fc6c0', springDeep: '#2a8f9e', steam: '#eef6f8', keeper: '#2f9e9a', brick: '#b86a4a', rust: '#9a5a3a',
  auroraG: '#6ef0b0', auroraB: '#5ad1ff', auroraV: '#9a86f2', paper: '#f6ecd2',
};

const mats = new Map();
export function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!mats.has(key)) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: opts.rough ?? 0.85, metalness: opts.metal ?? 0, flatShading: !!opts.flat });
    if (opts.opacity !== undefined) { m.transparent = true; m.opacity = opts.opacity; m.depthWrite = false; }
    if (opts.emissive) { m.emissive = new THREE.Color(opts.emissive); m.emissiveIntensity = opts.ei ?? 1; }
    m.name = opts.name || color;
    mats.set(key, m);
  }
  return mats.get(key);
}
function add(parent, mesh, x = 0, y = 0, z = 0) { mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh; }
export function rbox(p, w, h, d, c, x, y, z, r = 0.04, o) { return add(p, new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.2, h / 2.2, d / 2.2)), mat(c, o)), x, y, z); }
export function box(p, w, h, d, c, x, y, z, o) { return add(p, new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, o)), x, y, z); }
export function ball(p, r, c, x, y, z, seg = 12, o) { return add(p, new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg * 0.75 | 0)), mat(c, o)), x, y, z); }
export function cyl(p, r1, r2, h, c, x, y, z, seg = 10, o) { return add(p, new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat(c, o)), x, y, z); }
export function cone(p, r, h, c, x, y, z, seg = 10, o) { return add(p, new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat(c, o)), x, y, z); }
export function torus(p, r, t, c, x, y, z, arc = Math.PI * 2, o) { return add(p, new THREE.Mesh(new THREE.TorusGeometry(r, t, 6, 16, arc), mat(c, o)), x, y, z); }
function pivot(parent, name, x = 0, y = 0, z = 0) { const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); parent.add(g); return g; }
const S = Math.sin, C = Math.cos, TAU = Math.PI * 2;
function artShadeHex(hex, k) { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); }
const SMOKE = { name: 'smoke', opacity: 0.92, emissive: '#d8dee6', ei: 0.35 };

/* ------------------------------------------------------------------ humans */
export function capsule(p, r, len, c, x, y, z, o) { return add(p, new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 12), mat(c, o)), x, y, z); }
// lathe: profile [[radius, y], ...] turned around Y, squashed front-to-back by depth (bodies are not round tubes)
export function lathe(p, prof, c, x, y, z, depth = 0.74, o) { const m = add(p, new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r, h]) => new THREE.Vector2(r, h)), 20), mat(c, { ...(o || {}) })), x, y, z); m.material.side = THREE.DoubleSide; m.scale.z = depth; return m; }
const FZ = 0.145; // front surface of the chest, for collars, ribbons and aprons
/* 2026-10-09 rebuild: rounded, human-proportioned body (head ≈ 1/5 of height) instead of stacked boxes.
   Node names (body, legL/R, torso, armL/R, handL/R, head, scarfTail) are unchanged, so every clip still drives it. */
function humanoid(o) {
  const root = new THREE.Group(); root.name = o.name;
  const body = pivot(root, 'body', 0, 0, 0);
  const N = { root, body }, HIP = 0.7, baggy = !!o.hanbok || o.pantsW > 0.18;
  // legs
  [-1, 1].forEach(s => {
    const leg = pivot(body, s < 0 ? 'legL' : 'legR', s * 0.095, HIP, 0);
    if (baggy) lathe(leg, [[0.0, -0.6], [0.06, -0.6], [0.075, -0.52], [0.11, -0.3], [0.11, -0.08], [0.095, 0.02], [0.0, 0.03]], o.pants || PAL.pants, 0, 0, 0, 0.95);
    else capsule(leg, 0.072, 0.46, o.pants || PAL.pants, 0, -0.3, 0);
    if (o.daenim) cyl(leg, 0.068, 0.068, 0.04, o.daenim, 0, -0.56, 0, 12);                                    // 대님 ankle tie
    ball(leg, 0.072, o.boots || PAL.boots, 0, -0.64, 0.035, 12).scale.set(0.95, 0.62, 1.55);                      // shoe
    N[leg.name] = leg;
  });
  const torso = pivot(body, 'torso', 0, HIP, 0); N.torso = torso;
  lathe(torso, [[0.0, -0.02], [0.16, -0.02], [0.175, 0.08], [0.165, 0.2], [0.19, 0.34], [0.2, 0.43], [0.15, 0.5], [0.07, 0.53], [0.0, 0.535]], o.coat, 0, 0, 0);
  lathe(torso, [[0.17, 0.1], [0.19, 0.0], [0.205, -0.08], [0.0, -0.08]], o.coat, 0, 0, 0, 0.8);                 // jacket hem
  cyl(torso, 0.05, 0.055, 0.1, PAL.skin, 0, 0.55, 0, 10);                                                          // neck
  if (o.hanbok) hanbokFront(torso, o);                                                                              // 동정 collar + 고름 ribbon
  else if (o.puffer) pufferFront(torso, o);
  else { box(torso, 0.05, 0.4, 0.02, o.trim || PAL.woodLight, 0, 0.25, FZ);                                        // placket
    [0.36, 0.24, 0.12].forEach(y => ball(torso, 0.02, o.trim || PAL.woodLight, 0.04, y, FZ + 0.008, 6)); }
  if (o.robe) lathe(torso, [[0.18, 0.06], [0.2, -0.05], [0.25, -0.3], [0.28, -0.46], [0.0, -0.46]], o.robe, 0, 0, 0, 0.82);   // 도포/철릭 skirt
  if (o.skirt) { const sk = lathe(torso, [[0.0, -0.66], [0.33, -0.66], [0.3, -0.4], [0.22, -0.1], [0.17, 0.12], [0.0, 0.14]], o.skirt, 0, 0, 0, 0.85); N.skirt = sk; } // 치마
  if (o.apron) rbox(torso, 0.3, 0.34, 0.02, o.apron, 0, 0.1, FZ + 0.03, 0.01);
  // scarf
  if (o.scarf) torus(torso, 0.1, 0.045, o.scarf, 0, 0.5, 0.0).rotation.x = Math.PI / 2;
  const tail = pivot(torso, 'scarfTail', -0.07, 0.47, FZ - 0.02); N.scarfTail = tail;
  if (o.scarf) rbox(tail, 0.08, 0.24, 0.035, o.scarf, 0, -0.12, 0, 0.015);
  // arms
  [-1, 1].forEach(s => {
    const arm = pivot(torso, s < 0 ? 'armL' : 'armR', s * 0.215, 0.43, 0);
    ball(arm, 0.075, o.coat, 0, 0, 0, 12);                                                                          // shoulder
    if (o.hanbok) lathe(arm, [[0.0, 0.02], [0.065, 0.02], [0.075, -0.15], [0.09, -0.3], [0.07, -0.37], [0.0, -0.37]], o.coat, 0, 0, 0, 0.9); // wide 배래 sleeve
    else capsule(arm, 0.06, 0.28, o.coat, 0, -0.18, 0);
    ball(arm, 0.052, o.mitten || PAL.skin, 0, -0.4, 0.005, 10);                                                    // hand
    const hand = pivot(arm, s < 0 ? 'handL' : 'handR', 0, -0.4, 0.02); N[hand.name] = hand;
    N[arm.name] = arm;
  });
  // head (same local frame as before, so hats and hairdos still fit)
  const head = pivot(torso, 'head', 0, 0.565, 0); N.head = head; head.scale.setScalar(o.headScale || 0.8);
  ball(head, 0.2, PAL.skin, 0, 0.2, 0, 18).scale.set(0.9, 1.04, 0.94);
  ball(head, 0.13, PAL.skin, 0, 0.1, 0.03, 14).scale.set(1, 0.8, 1);                                              // jaw
  [-1, 1].forEach(s => {
    ball(head, 0.04, PAL.skin, s * 0.18, 0.2, 0, 8).scale.set(0.5, 1, 0.8);                                        // ears
    ball(head, 0.026, PAL.eye, s * 0.066, 0.215, 0.168, 10).scale.set(1, 1.2, 0.5);
    ball(head, 0.009, '#ffffff', s * 0.066 + 0.008, 0.225, 0.178, 6);
    const brow = box(head, 0.06, 0.012, 0.012, o.hair || PAL.hairDark, s * 0.068, 0.262, 0.172); brow.rotation.z = -s * 0.12;
    ball(head, 0.032, PAL.cheek, s * 0.1, 0.15, 0.15, 8).scale.set(1, 0.6, 0.35);
  });
  ball(head, 0.026, '#eab494', 0, 0.17, 0.188, 8).scale.set(0.9, 1.1, 1);                                          // nose
  box(head, 0.06, 0.011, 0.01, '#9a4a3a', 0, 0.1, 0.168);                                                            // mouth
  ball(head, 0.205, o.hair || PAL.hairBrown, 0, 0.29, -0.035, 16).scale.set(1.0, 0.8, 1.0);                         // hair cap
  ball(head, 0.17, o.hair || PAL.hairBrown, 0, 0.2, -0.08, 14).scale.set(1.05, 1.0, 0.85);                          // back of the head
  if (o.hairdo) hairdos[o.hairdo](head, o);
  if (o.beard) { [-1, 1].forEach(sx => { const m = box(head, 0.07, 0.016, 0.018, o.hair, sx * 0.04, 0.125, 0.18); m.rotation.z = -sx * 0.3; });
    const g = cone(head, 0.05, 0.2, o.hair, 0, -0.02, 0.15, 8); g.rotation.x = Math.PI + 0.25;                       // 수염
    if (o.beard > 1) [-1, 1].forEach(sx => ball(head, 0.06, o.hair, sx * 0.12, 0.08, 0.09, 8).scale.set(0.6, 1.2, 0.7)); } // 구레나룻
  o.hat(head, o);
  if (o.skirt) { N.legL.scale.setScalar(0.0001); N.legR.scale.setScalar(0.0001); [-1, 1].forEach(sx => ball(N.body, 0.07, o.boots || '#f4f1ea', sx * 0.08, 0.035, 0.1, 10).scale.set(0.9, 0.6, 1.5)); }
  if (o.extra) o.extra(N, o);
  return N;
}
/* ---- Korean-style dress (2026-10-09: the boy falls into a Korean history book) */
function hanbokFront(t, o) {
  const c = o.collar || '#f7f4ec';
  [-1, 1].forEach(sx => { const b = box(t, 0.045, 0.3, 0.02, c, sx * 0.055, 0.36, FZ + 0.005); b.rotation.z = sx * 0.55; });      // crossed 동정 collar
  const g = o.goreum || '#c8382c'; rbox(t, 0.045, 0.045, 0.03, g, 0.07, 0.24, FZ + 0.012, 0.01);                                     // 고름 knot
  [[0.06, 0.18], [0.11, 0.2]].forEach(([x, h], i) => { const r = box(t, 0.035, h, 0.012, g, x - 0.01, 0.24 - h / 2, FZ + 0.016); r.rotation.z = i ? -0.18 : 0.08; });
  cyl(t, 0.172, 0.172, 0.035, o.band || artShadeHex(o.coat, 0.75), 0, 0.06, 0, 18).scale.z = 0.74;                                                 // 허리 band
}
function pufferFront(t, o) {  // 2026 padded jacket: zip + quilting + hood
  box(t, 0.025, 0.46, 0.02, '#d9dde2', 0, 0.25, FZ + 0.005, { metal: 0.5, rough: 0.4 });
  [0.4, 0.29, 0.18, 0.07].forEach(y => { const q = cyl(t, 0.2, 0.2, 0.016, artShadeHex(o.coat, 0.72), 0, y, 0, 18); q.scale.z = 0.76; });
  ball(t, 0.16, artShadeHex(o.coat, 0.9), 0, 0.5, -0.11, 12).scale.set(1.1, 0.55, 0.7);                                    // hood folded at the neck
}
const hairdos = {
  topknot(h, o) { ball(h, 0.075, o.hair, 0, 0.46, -0.03, 10).scale.set(1, 1.35, 1); torus(h, 0.19, 0.022, '#1d1a18', 0, 0.3, -0.01, TAU).rotation.x = Math.PI / 2 - 0.15; }, // 상투 + 망건                                       // 상투
  bun(h, o) { ball(h, 0.11, o.hair, 0, 0.24, -0.24, 10); cyl(h, 0.012, 0.012, 0.32, o.binyeo || PAL.gold, 0, 0.24, -0.26, 6).rotation.z = Math.PI / 2; }, // 쪽머리 + 비녀
  braid(h, o) { const b = cyl(h, 0.04, 0.03, 0.42, o.hair, 0, 0.0, -0.22, 6); b.rotation.x = 0.15; rbox(h, 0.1, 0.06, 0.02, o.daenggi || '#c8382c', 0, -0.2, -0.25, 0.01); }, // 댕기머리
  short(h, o) { ball(h, 0.25, o.hair, 0, 0.36, -0.02, 14).scale.set(0.95, 0.62, 0.92); [-0.12, 0, 0.12].forEach((x, i) => { const t = cone(h, 0.07, 0.14, o.hair, x, 0.34, 0.17, 6); t.rotation.x = 2.2; t.rotation.z = (i - 1) * 0.3; }); }, // 2026 short cut with a soft fringe                                                   // 2026 short cut
};
const hats = {
  none() {},
  gat(h, o) { cyl(h, 0.4, 0.4, 0.015, '#1d1a18', 0, 0.44, 0, 20, { opacity: 0.9 }); cyl(h, 0.13, 0.15, 0.22, '#1d1a18', 0, 0.56, 0, 14, { opacity: 0.92 }); [-1, 1].forEach(s => box(h, 0.008, 0.36, 0.008, '#1d1a18', s * 0.2, 0.26, 0.12)); }, // 갓
  satgat(h, o) { cone(h, 0.42, 0.2, o.hatColor || '#d8b46a', 0, 0.52, 0, 16); torus(h, 0.4, 0.012, '#b08c48', 0, 0.43, 0).rotation.x = Math.PI / 2; },   // 삿갓
  paeraengi(h, o) { cyl(h, 0.32, 0.32, 0.02, o.hatColor || '#cfa865', 0, 0.42, 0, 16); cyl(h, 0.14, 0.17, 0.13, o.hatColor || '#cfa865', 0, 0.5, 0, 12); if (o.flower) ball(h, 0.05, o.flower, 0.14, 0.52, 0.05, 8); }, // 패랭이
  headband(h, o) { rbox(h, 0.46, 0.06, 0.42, o.hatColor || '#f2efe6', 0, 0.31, 0, 0.03); [-1, 1].forEach(s => { const t = box(h, 0.05, 0.16, 0.015, o.hatColor || '#f2efe6', s * 0.05, 0.22, -0.22); t.rotation.z = s * 0.35; }); }, // 머리띠
  dugeon(h, o) { ball(h, 0.25, o.hatColor || '#f2efe6', 0, 0.36, -0.01, 14).scale.set(1, 0.6, 1); rbox(h, 0.47, 0.07, 0.43, o.hatColor || '#f2efe6', 0, 0.34, 0, 0.03); [-1, 1].forEach(s => { const t = box(h, 0.05, 0.16, 0.015, o.hatColor || '#f2efe6', s * 0.06, 0.26, -0.24); t.rotation.z = s * 0.3; }); }, // 두건/머리띠
  jeollip(h, o) { cyl(h, 0.32, 0.32, 0.02, '#262426', 0, 0.42, 0, 16); ball(h, 0.17, '#262426', 0, 0.48, 0, 12).scale.set(1, 0.8, 1); ball(h, 0.05, o.hatColor || '#c8382c', 0, 0.62, 0, 8); cone(h, 0.06, 0.14, o.hatColor || '#c8382c', 0, 0.56, -0.05, 8).rotation.x = Math.PI; }, // 전립 + 상모
  tugu(h, o) { ball(h, 0.26, o.hatColor || '#3a3532', 0, 0.38, 0, 14).scale.set(1, 0.85, 1); cone(h, 0.035, 0.24, PAL.gold, 0, 0.7, 0, 6, { metal: 0.6, rough: 0.3 }); ball(h, 0.05, '#c8382c', 0, 0.83, 0, 8); torus(h, 0.24, 0.025, PAL.gold, 0, 0.32, 0, TAU, { metal: 0.6, rough: 0.3 }).rotation.x = Math.PI / 2; rbox(h, 0.46, 0.2, 0.08, o.hatColor || '#3a3532', 0, 0.16, -0.2, 0.03); }, // 투구
  goguryeo(h, o) { cone(h, 0.24, 0.42, o.hatColor || '#6d7680', 0, 0.56, 0, 10, { metal: 0.5, rough: 0.4 }); [-1, 1].forEach(s => { const f = box(h, 0.03, 0.26, 0.015, '#f4f1ea', s * 0.06, 0.82, -0.02); f.rotation.z = s * 0.25; }); rbox(h, 0.46, 0.18, 0.1, o.hatColor || '#6d7680', 0, 0.2, -0.2, 0.03); }, // 고구려 투구 + 깃
  crown(h, o) { cyl(h, 0.24, 0.24, 0.1, PAL.gold, 0, 0.42, 0, 16, { metal: 0.7, rough: 0.3 }); [-2, -1, 0, 1, 2].forEach(i => { const a = i * 0.45, t = box(h, 0.04, 0.24 + (i === 0 ? 0.08 : 0), 0.015, PAL.gold, Math.sin(a) * 0.23, 0.56, Math.cos(a) * 0.23, { metal: 0.7, rough: 0.3 }); t.rotation.y = a; ball(h, 0.03, '#5ac46a', Math.sin(a) * 0.24, 0.48, Math.cos(a) * 0.24 + 0.01, 6); });
    [-1, 1].forEach(s => { const f = box(h, 0.03, 0.3, 0.015, '#f4f1ea', s * 0.08, 0.72, -0.12); f.rotation.z = s * 0.3; }); }, // 금동관 + 조우관 깃
  gangju(h, o) { // 간주형 투구 (Joseon)
    ball(h, 0.235, '#2b2626', 0, 0.36, 0, 18).scale.set(1, 0.82, 1); torus(h, 0.225, 0.022, '#d9b25a', 0, 0.31, 0, TAU, { metal: 0.6, rough: 0.35 }).rotation.x = Math.PI / 2;
    const v = cyl(h, 0.21, 0.21, 0.012, '#2b2626', 0, 0.31, 0.06, 18); v.scale.z = 0.75;                                                          // front visor
    cyl(h, 0.02, 0.025, 0.16, '#d9b25a', 0, 0.6, 0, 8, { metal: 0.6, rough: 0.35 }); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, f = box(h, 0.03, 0.14, 0.01, '#c8382c', Math.sin(a) * 0.05, 0.6, Math.cos(a) * 0.05); f.rotation.x = Math.cos(a) * 0.7; f.rotation.z = -Math.sin(a) * 0.7; } // red 상모
    [-0.05, 0, 0.05].forEach((x, i) => cone(h, 0.012, i === 1 ? 0.14 : 0.1, '#e8d08a', x, 0.74 + (i === 1 ? 0.02 : 0), 0, 6, { metal: 0.7, rough: 0.3 }));                // trident tip
    [[-1, 0], [1, 0], [0, -1]].forEach(([sx, sz]) => { const d = rbox(h, sz ? 0.34 : 0.04, 0.3, sz ? 0.04 : 0.22, o.drim || '#a8432f', sx * 0.21, 0.14, sz * 0.19, 0.02); if (sz) studs(h, 0.28, 0.24, 4, 6, 0, 0.26, -0.215); else studs(h, 0.0001, 0.24, 4, 1, sx * 0.235, 0.26, 0); }); }, // 드림
  jongjang(h, o) { // 고구려 종장판주
    const c = o.hatColor || '#6d7680'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, p = box(h, 0.07, 0.24, 0.02, i % 2 ? artShadeHex(c, 0.85) : c, Math.sin(a) * 0.205, 0.4, Math.cos(a) * 0.205, { metal: 0.5, rough: 0.4 }); p.rotation.y = a; p.rotation.x = -Math.cos(a) * 0.25; p.rotation.z = Math.sin(a) * 0.25; }
    ball(h, 0.13, c, 0, 0.52, 0, 12, { metal: 0.5, rough: 0.4 }).scale.set(1, 0.5, 1); cyl(h, 0.018, 0.022, 0.2, o.trim || c, 0, 0.64, 0, 8, { metal: 0.5, rough: 0.4 });
    for (let i = 0; i < 5; i++) { const f = box(h, 0.035, 0.2, 0.008, o.plume || '#f4f1ea', (i - 2) * 0.025, 0.82, -0.02); f.rotation.z = (i - 2) * 0.22; }             // feathers on the tube finial
    [-1, 1].forEach(sx => { const g = rbox(h, 0.03, 0.18, 0.14, c, sx * 0.19, 0.16, 0.05, 0.01, { metal: 0.5, rough: 0.4 }); g.rotation.z = sx * 0.12; });              // cheek guards
    lathe(h, [[0.2, 0.3], [0.22, 0.15], [0.25, 0.02], [0.0, 0.02]], c, 0, 0, -0.04, 0.9, { metal: 0.45, rough: 0.45 }).rotation.y = Math.PI;                        // neck guard
    if (o.trim) torus(h, 0.205, 0.018, o.trim, 0, 0.3, 0, TAU, { metal: 0.7, rough: 0.3 }).rotation.x = Math.PI / 2; },
  beanie(h, o) { const c = o.hatColor || o.coat; ball(h, 0.25, c, 0, 0.36, 0, 14).scale.set(1, 0.72, 1); rbox(h, 0.48, 0.09, 0.44, o.hatBand || artShadeHex(c, 0.78), 0, 0.36, 0, 0.04); ball(h, 0.07, o.pom || PAL.snow, 0, 0.56, 0, 10); },
  cap(h, o) { rbox(h, 0.46, 0.12, 0.42, o.hatColor, 0, 0.44, 0, 0.05); rbox(h, 0.3, 0.03, 0.18, o.hatColor, 0, 0.39, 0.25, 0.01); },
  helmet(h, o) { ball(h, 0.25, o.hatColor, 0, 0.38, 0, 14).scale.set(1, 0.7, 1); cyl(h, 0.06, 0.06, 0.06, PAL.window, 0, 0.42, 0.22, 10, { emissive: PAL.glow, ei: 0.8 }).rotation.x = Math.PI / 2; },
  hood(h, o) { ball(h, 0.27, o.hatColor, 0, 0.32, -0.06, 14).scale.set(1, 0.9, 1); torus(h, 0.21, 0.045, '#f3ead9', 0, 0.3, 0.1, Math.PI).rotation.z = 0; },
  fur(h, o) { cyl(h, 0.24, 0.24, 0.2, o.hatColor, 0, 0.44, 0, 14); rbox(h, 0.5, 0.1, 0.46, PAL.snow, 0, 0.36, 0, 0.05); [-1, 1].forEach(s => rbox(h, 0.07, 0.18, 0.14, o.hatColor, s * 0.24, 0.27, -0.03, 0.04)); },
};
const tools = {
  axe(hand) { const t = pivot(hand, 'tool', 0, 0, 0.02); t.rotation.x = Math.PI / 2; cyl(t, 0.025, 0.03, 0.62, PAL.woodLight, 0, 0.2, 0, 6); rbox(t, 0.06, 0.16, 0.18, PAL.metal, 0, 0.46, 0.06, 0.02, { metal: 0.5, rough: 0.4 }); return t; },
  rod(hand) { const t = pivot(hand, 'tool', 0, 0, 0.02); t.rotation.x = Math.PI / 2.6; cyl(t, 0.012, 0.022, 1.1, PAL.woodDark, 0, 0.5, 0, 6); torus(t, 0.04, 0.012, PAL.metalDark, 0.03, 0.1, 0); ball(t, 0.035, '#e8463a', 0, 1.06, 0, 8); return t; },
  pick(hand) { const t = pivot(hand, 'tool', 0, 0, 0.02); t.rotation.x = Math.PI / 2; cyl(t, 0.025, 0.03, 0.6, PAL.woodLight, 0, 0.2, 0, 6); const hd = rbox(t, 0.05, 0.05, 0.42, PAL.metal, 0, 0.47, 0, 0.02, { metal: 0.5, rough: 0.4 }); hd.rotation.x = 0.15; return t; },
  bow(hand) { const t = pivot(hand, 'tool', 0, 0, 0.04); const b = torus(t, 0.36, 0.02, PAL.woodDark, 0, 0, 0, Math.PI * 0.9); b.rotation.z = Math.PI / 2 + Math.PI * 0.05; box(t, 0.005, 0.7, 0.005, '#eee', -0.06, 0, 0); return t; },
  rainbowAxe(hand) { const t = tools.axe(hand); const hd = t.children[1]; hd.material = mat(PAL.gold, { metal: 0.6, rough: 0.3 }); ['#e8463a', '#f2c14e', '#5ac46a', '#3fa3e0', '#9a86f2'].forEach((c, i) => box(t, 0.065, 0.028, 0.19, c, 0, 0.4 + i * 0.03, 0.07, { emissive: c, ei: 0.5 })); return t; },
  rainbowRod(hand) { const t = tools.rod(hand); ['#e8463a', '#f2c14e', '#5ac46a', '#3fa3e0', '#9a86f2'].forEach((c, i) => cyl(t, 0.026, 0.026, 0.05, c, 0, 0.3 + i * 0.12, 0, 6, { emissive: c, ei: 0.4 })); torus(t, 0.16, 0.012, '#f4e5b4', 0, 1.15, 0.12).rotation.x = 1.2; return t; },
  ladle(hand) { const t = pivot(hand, 'tool', 0, 0, 0.02); t.rotation.x = Math.PI / 2; cyl(t, 0.022, 0.026, 0.8, PAL.woodLight, 0, 0.3, 0, 6); const cup = cyl(t, 0.1, 0.07, 0.1, PAL.wood, 0, 0.72, 0.06, 10); cup.rotation.x = Math.PI / 2; return t; },
  mokgeom(hand) { const t = pivot(hand, 'tool', 0, 0, 0.02); t.rotation.x = Math.PI / 2; cyl(t, 0.03, 0.03, 0.16, '#3a2a1e', 0, 0.06, 0, 6); rbox(t, 0.16, 0.025, 0.05, '#2b211c', 0, 0.15, 0, 0.01); rbox(t, 0.045, 0.62, 0.02, PAL.woodLight, 0, 0.47, 0, 0.015); return t; }, // 목검
  club(hand) { const t = pivot(hand, 'tool', 0, 0, 0.02); t.rotation.x = Math.PI / 2; cyl(t, 0.03, 0.06, 0.8, PAL.woodDark, 0, 0.3, 0, 8); for (let i = 0; i < 4; i++) ball(t, 0.035, PAL.metalDark, Math.cos(i * 1.6) * 0.05, 0.6 + i * 0.03, Math.sin(i * 1.6) * 0.05, 6); return t; }, // 임꺽정 몽둥이
  sword(hand) { const t = pivot(hand, 'tool', 0, 0, 0.02); t.rotation.x = Math.PI / 2; cyl(t, 0.025, 0.025, 0.18, '#3a2a1e', 0, 0.06, 0, 6); torus(t, 0.05, 0.015, PAL.gold, 0, 0.16, 0).rotation.x = Math.PI / 2; const b = rbox(t, 0.05, 0.75, 0.015, '#d9dee4', 0, 0.55, 0, 0.01, { metal: 0.8, rough: 0.25 }); b.rotation.z = 0.04; return t; }, // 환도
  spear(hand) { const t = pivot(hand, 'tool', 0, 0, 0.02); t.rotation.x = Math.PI / 2; cyl(t, 0.022, 0.022, 1.2, PAL.woodLight, 0, 0.3, 0, 6); cone(t, 0.05, 0.16, PAL.metal, 0, 0.98, 0, 6, { metal: 0.5, rough: 0.4 }); return t; },
};
function humanAnims(kind) {
  const walk = { dur: 0.8, frames: 8, fn(t, n) { const a = S(t * TAU); n.legL.rotation.x = a * 0.6; n.legR.rotation.x = -a * 0.6; n.armL.rotation.x = -a * 0.5; n.armR.rotation.x = a * 0.5; n.body.position.y = Math.abs(S(t * TAU)) * 0.05; n.torso.rotation.y = a * 0.06; n.scarfTail.rotation.x = 0.25 + Math.abs(a) * 0.25; n.head.rotation.z = a * 0.04; } };
  const idle = { dur: 2, frames: 6, fn(t, n) { const a = S(t * TAU); n.body.position.y = 0; n.torso.scale.y = 1 + a * 0.015; n.head.rotation.x = a * 0.04; n.armL.rotation.z = -0.06 - a * 0.03; n.armR.rotation.z = 0.06 + a * 0.03; n.scarfTail.rotation.x = 0.1 + a * 0.08; } };
  const work = {
    axe: { dur: 0.9, frames: 8, fn(t, n) { const k = t < 0.55 ? -Math.pow(t / 0.55, 0.7) * 2.6 : -2.6 + Math.pow((t - 0.55) / 0.45, 0.5) * 3.1; n.armR.rotation.x = k; n.armL.rotation.x = k * 0.85; n.armL.rotation.z = 0.35; n.torso.rotation.x = t < 0.55 ? -0.12 * t / 0.55 : 0.18; n.legL.rotation.x = 0.25; n.legR.rotation.x = -0.15; } },
    rod: { dur: 1.6, frames: 8, fn(t, n) { const k = t < 0.3 ? -2.2 * (t / 0.3) : t < 0.45 ? -2.2 + 2.6 * ((t - 0.3) / 0.15) : 0.4 + S(t * 18) * 0.03; n.armR.rotation.x = k - 0.6; n.armL.rotation.x = k * 0.6 - 0.6; n.armL.rotation.z = 0.3; n.torso.rotation.x = k * -0.05; } },
    pick: { dur: 0.8, frames: 8, fn(t, n) { const k = t < 0.5 ? -2.9 * (t / 0.5) : -2.9 + 3.5 * Math.pow((t - 0.5) / 0.5, 0.6); n.armR.rotation.x = k; n.armL.rotation.x = k * 0.9; n.armL.rotation.z = 0.3; n.torso.rotation.x = t < 0.5 ? -0.1 : 0.22; n.legL.rotation.x = 0.3; } },
    bow: { dur: 1.0, frames: 8, fn(t, n) { const d = t < 0.6 ? t / 0.6 : 1 - (t - 0.6) / 0.4; n.armL.rotation.x = -1.5; n.armL.rotation.z = 0.15; n.armR.rotation.x = -1.4 - d * 0.1; n.armR.rotation.z = -0.15 - d * 0.55; n.torso.rotation.y = -0.35; n.head.rotation.y = 0.3; } },
    spear: { dur: 0.7, frames: 8, fn(t, n) { const d = S(Math.min(1, t * 1.6) * Math.PI); n.armR.rotation.x = -1.2 - d * 0.4; n.armR.position.z = d * 0.12; n.armL.rotation.x = -1.0; n.torso.rotation.x = d * 0.15; n.legR.rotation.x = -d * 0.4; n.legL.rotation.x = d * 0.3; } },
  }[kind];
  const cheer = { dur: 1.0, frames: 8, fn(t, n) { const j = Math.abs(S(t * TAU)); n.body.position.y = j * 0.18; n.armL.rotation.x = -2.8; n.armR.rotation.x = -2.8; n.armL.rotation.z = -0.3 - j * 0.2; n.armR.rotation.z = 0.3 + j * 0.2; n.legL.rotation.x = j * 0.3; n.legR.rotation.x = j * 0.3; } };
  const a = { idle, walk, cheer }; if (work) a.work = work; return a;
}
function character(name, o, toolKind) {
  return () => {
    const N = humanoid({ name, ...o });
    if (toolKind) N.tool = tools[toolKind](N.handR);
    const anims = humanAnims(o.animKind || toolKind || 'axe');
    if (o.toolOnlyAtWork && N.tool) Object.entries(anims).forEach(([k, A]) => { if (k === 'work') return; const f = A.fn; A.fn = (t, n) => { f(t, n); n.tool.scale.setScalar(0.0001); }; });
    if (!toolKind) delete anims.work;
    return { root: N.root, nodes: N, anims, kind: 'actor' };
  };
}
const heroExtra = (N) => { // satchel + strap like the intro paintings
  const s = rbox(N.torso, 0.2, 0.18, 0.08, PAL.satchel, 0.27, 0.06, 0.12, 0.03); s.rotation.y = -0.4;
  box(N.torso, 0.04, 0.62, 0.36, PAL.satchel, 0.02, 0.3, 0).rotation.z = 0.75;
};
const quiver = (N, o) => { const q = cyl(N.torso, 0.07, 0.06, 0.4, PAL.woodDark, -0.12, 0.3, -0.2, 8); q.rotation.z = 0.4; [-0.02, 0.03].forEach(x => cone(N.torso, 0.03, 0.08, o.scarf, -0.2 + x, 0.55, -0.2, 6)); };

/* ------------------------------------------------------------------ animals */
function quadruped(name, o) {
  const root = new THREE.Group(); root.name = name; const body = pivot(root, 'body', 0, 0, 0), N = { root, body };
  const L = o.len, H = o.hip, B = o.bodyH;
  rbox(body, o.wid, B, L, o.fur, 0, H + B * 0.4, 0, B * 0.45);
  if (o.belly) rbox(body, o.wid * 0.8, B * 0.5, L * 0.8, o.belly, 0, H + B * 0.05, 0.02, B * 0.2);
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz], i) => {
    const leg = pivot(body, ['legFL', 'legFR', 'legBL', 'legBR'][i], sx * o.wid * 0.32, H + 0.02, sz * L * 0.33); N[leg.name] = leg;
    rbox(leg, o.legW, H + 0.02, o.legW * 1.1, o.legC || o.fur, 0, -H / 2, 0, o.legW * 0.4);
    rbox(leg, o.legW * 1.15, o.legW * 0.45, o.legW * 1.4, o.paw || o.legC || o.fur, 0, -H + o.legW * 0.2, o.legW * 0.15, o.legW * 0.2);
  });
  const head = pivot(body, 'head', 0, H + B * 0.75, L * 0.5); N.head = head;
  rbox(head, o.headW, o.headW * 0.85, o.headW * 0.9, o.fur, 0, 0, 0.05, o.headW * 0.35);
  rbox(head, o.headW * 0.5, o.headW * 0.4, o.snout, o.muzzle || o.fur, 0, -o.headW * 0.15, o.headW * 0.45 + o.snout * 0.3, o.headW * 0.15);
  ball(head, o.headW * 0.11, o.nose || PAL.bearNose, 0, -o.headW * 0.02, o.headW * 0.45 + o.snout * 0.8, 8);
  [-1, 1].forEach(s => {
    ball(head, o.headW * 0.07, o.eyeC || PAL.eye, s * o.headW * 0.24, o.headW * 0.12, o.headW * 0.45, 8, o.eyeGlow ? { emissive: o.eyeC, ei: 2 } : undefined);
    if (o.earCone) { const e = cone(head, o.headW * 0.2, o.headW * 0.45, o.fur, s * o.headW * 0.28, o.headW * 0.55, -0.02, 6); e.rotation.z = -s * 0.25; cone(head, o.headW * 0.11, o.headW * 0.3, PAL.cheek, s * o.headW * 0.28, o.headW * 0.53, 0.02, 6).rotation.z = -s * 0.25; }
    else ball(head, o.headW * 0.16, o.fur, s * o.headW * 0.36, o.headW * 0.42, -0.02, 8).scale.set(1, 1, 0.6);
  });
  const tail = pivot(body, 'tail', 0, H + B * 0.7, -L * 0.5); N.tail = tail;
  ball(tail, o.tailR, o.tailC || o.fur, 0, 0, -o.tailR * 0.6, 8);
  if (o.extra) o.extra(N, o);
  return N;
}
function quadAnims(o) {
  return {
    idle: { dur: 2, frames: 6, fn(t, n) { const a = S(t * TAU); n.body.scale.y = 1 + a * 0.02; n.head.rotation.x = a * 0.06; n.tail.rotation.y = a * (o.wag || 0.1); } },
    walk: { dur: o.walkDur || 0.7, frames: 8, fn(t, n) { const a = S(t * TAU); n.legFL.rotation.x = a * 0.55; n.legBR.rotation.x = a * 0.55; n.legFR.rotation.x = -a * 0.55; n.legBL.rotation.x = -a * 0.55; n.body.position.y = Math.abs(C(t * TAU)) * 0.03 * o.scale; n.head.rotation.x = a * 0.05; n.tail.rotation.y = a * (o.wag || 0.15); } },
    ...(o.attack ? { attack: { dur: 0.9, frames: 8, fn(t, n) { const up = t < 0.45 ? t / 0.45 : 1 - (t - 0.45) / 0.55, sw = S(Math.min(1, t / 0.6) * Math.PI); n.body.rotation.x = -up * 0.5; n.body.position.y = up * 0.15 * o.scale; n.legFL.rotation.x = -up * 1.3 - sw * 0.6; n.legFR.rotation.x = -up * 1.1; n.legFL.rotation.z = sw * 0.5; n.head.rotation.x = -up * 0.3; n.head.position.z = o.len * 0.5 + sw * 0.05; } } } : {}),
    ...(o.happy ? { happy: { dur: 0.6, frames: 6, fn(t, n) { n.tail.rotation.y = S(t * TAU * 2) * 0.8; n.body.position.y = Math.abs(S(t * TAU)) * 0.05; n.head.rotation.z = S(t * TAU) * 0.15; } } } : {}),
    ...(o.hurt ? { hurt: { dur: 0.5, frames: 5, fn(t, n) { const k = S(t * Math.PI); n.body.rotation.z = k * 0.2; n.body.position.x = -k * 0.08; n.head.rotation.x = k * 0.3; } } } : {}),
  };
}
function bear(name, boss) { // 반달가슴곰 (Asiatic black bear) - native to Korea, white crescent on the chest
  return () => {
    const o = { len: 1.15, wid: 0.72, hip: 0.42, bodyH: 0.62, legW: 0.22, headW: 0.58, snout: 0.24, fur: boss ? '#2a262c' : '#3a3640', belly: boss ? '#332e36' : '#46414c', muzzle: '#c9a27a', tailR: 0.09, attack: 1, hurt: 1, scale: 1, walkDur: 0.9,
      eyeC: boss ? '#ffb54a' : PAL.eye, eyeGlow: boss, nose: '#151418',
      extra: (N) => {
        const cres = pivot(N.body, 'crescent', 0, 0.42 + 0.62 * 0.22, 0.6); [-1, 1].forEach(sx => { const w = rbox(cres, 0.3, 0.07, 0.04, '#f4f1ea', sx * 0.12, 0, 0, 0.03, boss ? { emissive: '#fff3d0', ei: 0.6 } : undefined); w.rotation.z = sx * 0.45; });
        [-1, 1].forEach(sx => ball(N.head, 0.58 * 0.17, '#2c2a30', sx * 0.58 * 0.36, 0.58 * 0.44, -0.02, 8).scale.set(1.15, 1.15, 0.6));            // big round ears
        if (boss) {
          for (let i = 0; i < 5; i++) { const a = (i / 4 - 0.5) * 1.4; cone(N.head, 0.05, 0.16 + (i === 2 ? 0.08 : 0), PAL.gold, S(a) * 0.2, 0.27 + (i === 2 ? 0.04 : 0), C(a) * 0.02 - 0.02, 5, { metal: 0.6, rough: 0.3 }); }
          torus(N.head, 0.2, 0.025, PAL.gold, 0, 0.22, -0.02, TAU, { metal: 0.6, rough: 0.3 }).rotation.x = Math.PI / 2;
          ball(N.head, 0.04, '#c8382c', 0, 0.3, 0.17, 8, { emissive: '#ff6a4a', ei: 1.2 });
          for (let i = 0; i < 4; i++) { const m = rbox(N.body, 0.5, 0.08, 0.12, '#8e2a22', 0, 0.42 + 0.62 + 0.02, 0.35 - i * 0.22, 0.03); m.rotation.x = -0.2; }  // red war cloth over the back
        }
      } };
    const N = quadruped(name, o); if (boss) N.root.scale.setScalar(2.1);
    return { root: N.root, nodes: N, anims: quadAnims(o), kind: 'actor', scale: boss ? 2.1 : 1 };
  };
}
function corgi() { // 진돗개 (Jindo dog) - model name kept as 'corgi' for runtime compatibility
  const o = { len: 0.66, wid: 0.3, hip: 0.24, bodyH: 0.28, legW: 0.09, headW: 0.3, snout: 0.15, fur: '#f1e6d2', belly: '#fbf6ec', muzzle: '#fbf6ec', legC: '#f1e6d2', paw: '#fbf6ec', tailR: 0.07, tailC: '#f1e6d2', earCone: 1, wag: 0.5, happy: 1, scale: 0.4, walkDur: 0.45, nose: '#2b211c',
    extra(N) { const t = torus(N.tail, 0.07, 0.03, '#f1e6d2', 0, 0.06, -0.02, TAU * 0.75); t.rotation.y = Math.PI / 2; rbox(N.body, 0.2, 0.05, 0.1, PAL.heroScarf, 0, 0.24 + 0.28 * 0.75, 0.3, 0.02); } }; // curled tail + red collar
  const N = quadruped('corgi', o);
  return { root: N.root, nodes: N, anims: quadAnims(o), kind: 'actor' };
}
function fishModel() {
  const root = new THREE.Group(); root.name = 'fish'; const body = pivot(root, 'body', 0, 0.12, 0); const N = { root, body };
  ball(body, 0.12, PAL.fish, 0, 0, 0, 12).scale.set(0.7, 0.9, 2);
  ball(body, 0.1, PAL.fishBelly, 0, -0.03, 0.01, 10).scale.set(0.6, 0.6, 1.8);
  const tail = pivot(body, 'tail', 0, 0, -0.22); N.tail = tail; cone(tail, 0.1, 0.16, PAL.fish, 0, 0, -0.06, 4).rotation.x = Math.PI / 2;
  [-1, 1].forEach(s => ball(body, 0.022, PAL.eye, s * 0.06, 0.03, 0.17, 6));
  return { root, nodes: N, kind: 'prop', anims: { swim: { dur: 0.8, frames: 6, fn(t, n) { n.tail.rotation.y = S(t * TAU) * 0.6; n.body.rotation.y = -S(t * TAU) * 0.12; } }, flop: { dur: 0.5, frames: 5, fn(t, n) { n.body.rotation.z = S(t * TAU) * 0.6; n.body.position.y = 0.12 + Math.abs(S(t * TAU)) * 0.12; n.tail.rotation.y = S(t * TAU * 2) * 0.8; } } } };
}

/* ------------------------------------------------------------------ nature */
function pine(name, s = 1, snowy = true) {
  return () => {
    const root = new THREE.Group(); root.name = name; const sway = pivot(root, 'sway');
    cyl(sway, 0.1 * s, 0.14 * s, 0.5 * s, PAL.trunk, 0, 0.25 * s, 0, 8);
    [[0.75, 0.9, 0.55], [0.6, 0.8, 1.0], [0.42, 0.7, 1.42]].forEach(([r, h, y], i) => {
      cone(sway, r * s, h * s, i % 2 ? PAL.pineLight : PAL.pine, 0, y * s, 0, 9, { flat: true });
      if (snowy) cone(sway, r * s * 0.55 * 1.1, h * s * 0.55, PAL.snow, 0, (y + h / 2 - h * 0.55 / 2 + 0.01) * s, 0, 9, { flat: true }); // snow cap shares the apex, sits just outside the cone
    });
    if (snowy) ball(root, 0.5 * s, PAL.snow, 0, 0, 0, 10).scale.set(1.2, 0.12, 1.2);
    return { root, nodes: { sway }, kind: 'prop', anims: { idle: { dur: 3, frames: 6, fn(t, n) { n.sway.rotation.z = S(t * TAU) * 0.025; } }, chop: { dur: 0.4, frames: 5, fn(t, n) { n.sway.rotation.z = S(t * TAU * 2) * 0.09 * (1 - t); } } } };
  };
}
function stump() { const root = new THREE.Group(); root.name = 'stump'; cyl(root, 0.17, 0.2, 0.22, PAL.trunk, 0, 0.11, 0, 10); cyl(root, 0.16, 0.16, 0.01, PAL.logEnd, 0, 0.225, 0, 10); ball(root, 0.3, PAL.snow, 0, 0, 0, 8).scale.set(1.1, 0.1, 1.1); return { root, nodes: {}, kind: 'prop', anims: {} }; }
function rock(name, ore) {
  return () => {
    const root = new THREE.Group(); root.name = name;
    [[0, 0.22, 0, 0.32], [0.25, 0.14, 0.08, 0.2], [-0.22, 0.12, 0.1, 0.17]].forEach(([x, y, z, r], i) => { const m = add(root, new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), mat(i ? PAL.stoneDark : PAL.stone, { flat: true })), x, y, z); m.rotation.set(i, i * 2, 0); });
    ball(root, 0.22, PAL.snow, -0.02, 0.42, -0.02, 8, { flat: true }).scale.set(1, 0.35, 1);
    if (ore) for (let i = 0; i < 5; i++) { const c = cone(root, 0.05, 0.22, ore, -0.15 + i * 0.08, 0.3 + (i % 2) * 0.05, 0.22, 5, { emissive: ore, ei: 0.45, rough: 0.2 }); c.rotation.set(0.4, 0, (i - 2) * 0.25); }
    return { root, nodes: {}, kind: 'prop', anims: {} };
  };
}
function logPile() { const root = new THREE.Group(); root.name = 'log_pile'; [[-0.2, 0.12], [0.2, 0.12], [0, 0.34]].forEach(([x, y]) => { const l = cyl(root, 0.12, 0.12, 0.8, PAL.log, x, y, 0, 10); l.rotation.x = Math.PI / 2; [-1, 1].forEach(s => { const e = cyl(root, 0.11, 0.11, 0.01, PAL.logEnd, x, y, s * 0.401, 10); e.rotation.x = Math.PI / 2; }); }); return { root, nodes: {}, kind: 'prop', anims: {} }; }

/* ------------------------------------------------------------------ buildings */
function snowRoof(p, w, d, h, color, y, z = 0) {
  // gable roof: two slabs + snow caps
  [-1, 1].forEach(s => {
    const sd = d / 2 / C(0.6) + 0.14, slab = rbox(p, w + 0.2, 0.09, sd, color, 0, y + h / 2, z + s * d / 4, 0.03); slab.rotation.x = s * 0.6;
    rbox(slab, w + 0.26, 0.07, sd * 0.6, PAL.snow, 0, 0.07, -s * sd * 0.2, 0.03);            // snow cap leaves the coloured eave visible
    for (let i = 0; i < 4; i++) rbox(slab, 0.05, 0.03, sd * 0.42, artShadeHex(color, 0.8), -w / 2 + (i + 0.5) * w / 4, 0.05, s * sd * 0.27, 0.01); // shingle ribs
  });
  const gable = new THREE.Shape(); gable.moveTo(-d / 2, 0); gable.lineTo(d / 2, 0); gable.lineTo(0, h); gable.closePath();
  [-1, 1].forEach(s => { const g = add(p, new THREE.Mesh(new THREE.ExtrudeGeometry(gable, { depth: 0.04, bevelEnabled: false }), mat(PAL.wood)), s * w / 2 - (s > 0 ? 0.04 : 0), y, z); g.rotation.y = Math.PI / 2; });
}
function logWalls(p, w, d, h, color = PAL.log) {
  const n = Math.round(h / 0.16);
  for (let i = 0; i < n; i++) {
    const y = 0.08 + i * 0.16;
    [-1, 1].forEach(s => { const l = cyl(p, 0.085, 0.085, w + 0.18, i % 2 ? color : PAL.wood, 0, y, s * d / 2, 8); l.rotation.z = Math.PI / 2; });
    [-1, 1].forEach(s => { const l = cyl(p, 0.085, 0.085, d + 0.18, i % 2 ? PAL.wood : color, s * w / 2, y + 0.08, 0, 8); l.rotation.x = Math.PI / 2; });
  }
  box(p, w - 0.05, h, d - 0.05, PAL.woodDark, 0, h / 2, 0);
}
function windowGlow(p, x, y, z, w = 0.3, h = 0.3) { box(p, w + 0.08, h + 0.08, 0.04, PAL.woodDark, x, y, z); box(p, w, h, 0.05, PAL.window, x, y, z + 0.01, { emissive: PAL.glow, ei: 1.1 }); box(p, 0.03, h, 0.06, PAL.woodDark, x, y, z + 0.02); box(p, w, 0.03, 0.06, PAL.woodDark, x, y, z + 0.02); }
function door(p, x, z, h = 0.7) { rbox(p, 0.42, h, 0.06, PAL.woodDark, x, h / 2, z, 0.03); ball(p, 0.03, PAL.gold, x + 0.13, h * 0.5, z + 0.04, 6); }
function base(p, w, d, c = PAL.stone) { rbox(p, w + 0.3, 0.12, d + 0.3, c, 0, 0.06, 0, 0.04); ball(p, Math.max(w, d) * 0.7, PAL.snow, 0, 0, 0, 12).scale.set(1, 0.06, d / w); }

function cabin() {
  const root = new THREE.Group(); root.name = 'cabin'; base(root, 2.2, 1.7);
  const walls = pivot(root, 'walls', 0, 0.12, 0); logWalls(walls, 2.2, 1.7, 1.15);
  snowRoof(walls, 2.2, 1.9, 0.9, PAL.roofRed, 1.15);
  door(walls, -0.45, 0.9); windowGlow(walls, 0.45, 0.62, 0.89, 0.46, 0.4); { const sw = new THREE.Group(); windowGlow(sw, 0, 0, 0, 0.42, 0.36); sw.position.set(1.15, 0.62, 0.1); sw.rotation.y = Math.PI / 2; walls.add(sw); }
  const ch = rbox(walls, 0.3, 0.8, 0.3, PAL.stone, 0.65, 1.75, -0.35, 0.04); rbox(walls, 0.34, 0.08, 0.34, PAL.snow, 0.65, 2.17, -0.35, 0.03);
  const smoke = pivot(root, 'smoke', 0.65, 2.4, -0.35);
  for (let i = 0; i < 3; i++) ball(smoke, 0.12 + i * 0.04, '#e9eef2', 0, i * 0.25, 0, 8, SMOKE).name = 'puff' + i;
  cyl(root, 0.05, 0.05, 0.5, PAL.woodDark, -0.95, 0.37, 1.05, 6); const lamp = ball(root, 0.09, PAL.window, -0.95, 0.68, 1.05, 8, { emissive: PAL.glow, ei: 2 }); lamp.name = 'lamp';
  return { root, nodes: { smoke }, kind: 'facility', anims: { idle: { dur: 3, frames: 6, fn(t, n) { n.smoke.children.forEach((b, i) => { const u = (t + i / 3) % 1; b.position.set(S(u * 5) * 0.08, u * 0.8, 0); b.scale.setScalar(0.6 + u); }); } } } };
}
function shop(kind) {
  return () => {
    const root = new THREE.Group(); root.name = 'shop_' + kind; base(root, 2.2, 1.3, PAL.woodLight);
    const st = pivot(root, 'stall', 0, 0.12, 0);
    rbox(st, 2.0, 0.75, 0.7, PAL.wood, 0, 0.37, 0.25, 0.04); rbox(st, 2.1, 0.08, 0.8, PAL.woodLight, 0, 0.78, 0.25, 0.02);
    [-0.95, 0.95].forEach(x => { cyl(st, 0.06, 0.06, 1.7, PAL.woodDark, x, 0.85, 0.55, 6); cyl(st, 0.06, 0.06, 1.9, PAL.woodDark, x, 0.95, -0.4, 6); });
    rbox(st, 2.0, 1.3, 0.1, PAL.woodDark, 0, 0.85, -0.45, 0.03);
    const aw = pivot(st, 'awning', 0, 1.75, 0.05); aw.rotation.x = 0.35; const stripes = kind === 'fish' ? [PAL.awningC, PAL.awningB] : [PAL.awningA, PAL.awningB];
    for (let i = 0; i < 8; i++) { rbox(aw, 0.27, 0.06, 1.2, stripes[i % 2], -0.95 + 0.135 + i * 0.257, 0, 0, 0.02); const sc = cone(aw, 0.13, 0.16, stripes[i % 2], -0.95 + 0.135 + i * 0.257, -0.06, 0.62, 4); sc.rotation.x = Math.PI; }
    rbox(aw, 2.15, 0.05, 0.3, PAL.snow, 0, 0.05, -0.45, 0.02);
    rbox(st, 0.9, 0.34, 0.06, PAL.canvas, 0, 2.15, -0.45, 0.03); // blank sign board (the game draws its own Korean label)
    if (kind === 'fish') for (let i = 0; i < 5; i++) { const f = fishModel().root; f.scale.setScalar(0.9); f.position.set(-0.7 + i * 0.35, 0.82, 0.3); f.rotation.y = Math.PI / 2 + (i % 2) * 0.3; st.add(f); }
    else for (let i = 0; i < 3; i++) { const l = cyl(st, 0.09, 0.09, 0.6, PAL.log, -0.55 + i * 0.25, 0.92, 0.25, 8); l.rotation.x = Math.PI / 2; cyl(st, 0.085, 0.085, 0.01, PAL.logEnd, -0.55 + i * 0.25, 0.92, 0.556, 8).rotation.x = Math.PI / 2; }
    for (let i = 0; i < 3; i++) ball(st, 0.06, PAL.window, -0.6 + i * 0.6, 1.6, 0.55, 8, { emissive: PAL.glow, ei: 1.6 });
    return { root, nodes: { awning: aw }, kind: 'facility', anims: { idle: { dur: 2.5, frames: 6, fn(t, n) { n.awning.rotation.x = 0.35 + S(t * TAU) * 0.02; } } } };
  };
}
function tower() {
  const root = new THREE.Group(); root.name = 'watchtower'; base(root, 1.3, 1.3);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => { const l = cyl(root, 0.08, 0.1, 2.6, PAL.log, x * 0.55, 1.3, z * 0.55, 8); l.rotation.z = -x * 0.05; l.rotation.x = z * 0.05; });
  [0.7, 1.5].forEach(y => [-1, 1].forEach(s => { const b = cyl(root, 0.04, 0.04, 1.6, PAL.wood, 0, y, s * 0.55, 6); b.rotation.z = Math.PI / 2 + s * 0.45; }));
  rbox(root, 1.6, 0.12, 1.6, PAL.woodLight, 0, 2.6, 0, 0.03);
  for (let i = 0; i < 4; i++) { const r = rbox(root, 1.6, 0.35, 0.06, PAL.wood, 0, 2.85, 0, 0.02); r.rotation.y = i * Math.PI / 2; r.position.set(S(i * Math.PI / 2) * 0.77, 2.85, C(i * Math.PI / 2) * 0.77); }
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => cyl(root, 0.05, 0.05, 0.8, PAL.woodDark, x * 0.72, 3.1, z * 0.72, 6));
  const r = cone(root, 1.25, 0.8, PAL.roofBlue, 0, 3.9, 0, 4, { flat: true }); r.rotation.y = Math.PI / 4; const rs = cone(root, 0.85, 0.42, PAL.snow, 0, 4.12, 0, 4, { flat: true }); rs.rotation.y = Math.PI / 4;
  for (let i = 0; i < 7; i++) { const rung = cyl(root, 0.025, 0.025, 0.36, PAL.woodLight, 0, 0.3 + i * 0.33, 0.82, 5); rung.rotation.z = Math.PI / 2; }
  [-0.18, 0.18].forEach(x => cyl(root, 0.03, 0.03, 2.5, PAL.woodDark, x, 1.25, 0.82, 5));
  cyl(root, 0.025, 0.025, 0.9, PAL.woodDark, 0, 4.6, 0, 5);
  const flag = pivot(root, 'flag', 0.02, 4.9, 0); const fm = rbox(flag, 0.5, 0.3, 0.02, PAL.heroScarf, 0.26, 0, 0, 0.01); fm.name = 'cloth';
  const lamp = ball(root, 0.1, PAL.window, 0.6, 3.2, 0.72, 8, { emissive: PAL.glow, ei: 2 });
  return { root, nodes: { flag }, kind: 'facility', anims: { idle: { dur: 1.2, frames: 6, fn(t, n) { n.flag.rotation.y = S(t * TAU) * 0.35; n.flag.children[0].rotation.y = S(t * TAU + 1) * 0.2; } } } };
}
function crates() {
  const root = new THREE.Group(); root.name = 'storage';
  rbox(root, 1.7, 0.1, 1.3, PAL.woodDark, 0, 0.05, 0, 0.03);
  [[-0.42, 0.33, 0.25], [0.42, 0.33, 0.25], [-0.42, 0.33, -0.35], [0.42, 0.33, -0.35], [0, 0.97, -0.05]].forEach(([x, y, z]) => {
    const c = pivot(root, 'crate', x, y, z); rbox(c, 0.66, 0.6, 0.6, PAL.wood, 0, 0, 0, 0.03);
    [-1, 1].forEach(s => { box(c, 0.68, 0.07, 0.62, PAL.woodDark, 0, s * 0.24, 0); box(c, 0.07, 0.6, 0.62, PAL.woodDark, s * 0.3, 0, 0); });
    const d = box(c, 0.06, 0.78, 0.01, PAL.woodDark, 0, 0, 0.305); d.rotation.z = 0.78;
  });
  rbox(root, 0.7, 0.08, 0.64, PAL.snow, 0, 1.31, -0.05, 0.03);
  return { root, nodes: {}, kind: 'facility', anims: {} };
}
function sawmill() {
  const root = new THREE.Group(); root.name = 'sawmill'; base(root, 2.4, 1.6);
  const shed = pivot(root, 'shed', 0, 0.12, -0.2); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => cyl(shed, 0.07, 0.07, 1.4, PAL.log, x * 1.05, 0.7, z * 0.55, 6));
  snowRoof(shed, 2.3, 1.4, 0.6, PAL.roofBlue, 1.4);
  rbox(root, 1.9, 0.5, 0.6, PAL.woodDark, 0, 0.37, 0.2, 0.04); rbox(root, 2.0, 0.06, 0.7, PAL.metal, 0, 0.65, 0.2, 0.02, { metal: 0.4, rough: 0.5 });
  const blade = pivot(root, 'blade', 0, 0.75, 0.2); const disc = cyl(blade, 0.42, 0.42, 0.03, '#c9d2da', 0, 0, 0, 24, { metal: 0.8, rough: 0.25 }); disc.rotation.x = Math.PI / 2; disc.rotation.z = Math.PI / 2;
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, tth = cone(blade, 0.04, 0.08, '#aeb8c2', 0, C(a) * 0.45, S(a) * 0.45, 3, { metal: 0.8 }); tth.rotation.x = a - Math.PI / 2; }
  cyl(blade, 0.08, 0.08, 0.06, PAL.metalDark, 0, 0, 0, 10).rotation.z = Math.PI / 2;
  const lg = cyl(root, 0.18, 0.18, 1.5, PAL.log, -0.6, 0.85, 0.2, 10); lg.rotation.z = Math.PI / 2; cyl(root, 0.17, 0.17, 0.01, PAL.logEnd, -1.355, 0.85, 0.2, 10).rotation.z = Math.PI / 2;
  { const lp = logPile().root; lp.position.set(0.9, 0.12, -0.4); root.add(lp); }
  return { root, nodes: { blade }, kind: 'facility', anims: { idle: { dur: 0.6, frames: 6, fn(t, n) { n.blade.rotation.x = -t * TAU; } } } };
}
function smokehouse() {
  const root = new THREE.Group(); root.name = 'smokehouse'; base(root, 1.8, 1.5);
  rbox(root, 1.8, 0.5, 1.5, PAL.stone, 0, 0.37, 0, 0.06, { flat: true });
  const up = pivot(root, 'hut', 0, 0.62, 0); logWalls(up, 1.6, 1.3, 0.8, PAL.woodDark); snowRoof(up, 1.6, 1.5, 0.7, PAL.roofRed, 0.8);
  windowGlow(root, 0, 0.35, 0.76, 0.4, 0.22);
  rbox(root, 0.32, 1.2, 0.32, PAL.stoneDark, -0.55, 1.8, -0.4, 0.04); rbox(root, 0.36, 0.08, 0.36, PAL.snow, -0.55, 2.42, -0.4, 0.03);
  const smoke = pivot(root, 'smoke', -0.55, 2.6, -0.4); for (let i = 0; i < 4; i++) ball(smoke, 0.14, '#d9dde2', 0, 0, 0, 8, SMOKE);
  for (let i = 0; i < 4; i++) { const f = fishModel().root; f.scale.setScalar(0.8); f.rotation.x = Math.PI / 2; f.position.set(0.25 + i * 0.16, 1.2, 0.72); root.add(f); }
  return { root, nodes: { smoke }, kind: 'facility', anims: { idle: { dur: 2.4, frames: 6, fn(t, n) { n.smoke.children.forEach((b, i) => { const u = (t + i / 4) % 1; b.position.set(S(u * 6 + i) * 0.1, u * 1.0, 0); b.scale.setScalar(0.5 + u * 1.2); }); } } } };
}
function smelter() {
  const root = new THREE.Group(); root.name = 'smelter'; base(root, 1.9, 1.6, PAL.stoneDark);
  const f = cyl(root, 0.85, 1.0, 1.4, PAL.stone, 0, 0.82, 0, 10, { flat: true }); cyl(root, 0.7, 0.85, 0.6, PAL.stoneDark, 0, 1.8, 0, 10, { flat: true });
  rbox(root, 0.8, 0.12, 0.8, PAL.snow, 0, 2.16, 0, 0.05).scale.set(1, 1, 1);
  cyl(root, 0.22, 0.25, 1.4, PAL.metalDark, 0, 2.7, 0, 10, { metal: 0.5, rough: 0.5 });
  const mouth = rbox(root, 0.62, 0.5, 0.2, PAL.glowHot, 0, 0.55, 0.92, 0.08, { emissive: PAL.glowHot, ei: 2.2 }); mouth.name = 'fire';
  rbox(root, 0.8, 0.12, 0.26, PAL.stoneDark, 0, 0.86, 0.93, 0.04);
  const glow = pivot(root, 'glow', 0, 0.55, 1.03); ball(glow, 0.2, PAL.glow, 0, 0, 0, 10, { emissive: PAL.glow, ei: 2.5 }).scale.set(1.3, 0.8, 0.3);
  const crys = pivot(root, 'ingots', 1.0, 0.18, 0.6); [[0, 0], [0.22, 0], [0.11, 0.11]].forEach(([x, y]) => rbox(crys, 0.2, 0.1, 0.32, PAL.ore, x, y + 0.05, 0, 0.02, { emissive: PAL.ore, ei: 0.25, metal: 0.4, rough: 0.3 }));
  const smoke = pivot(root, 'smoke', 0, 3.5, 0); for (let i = 0; i < 4; i++) ball(smoke, 0.16, '#cfd4da', 0, 0, 0, 8, SMOKE);
  return { root, nodes: { smoke, glow }, kind: 'facility', anims: { idle: { dur: 2, frames: 6, fn(t, n) { n.glow.scale.setScalar(0.9 + S(t * TAU * 2) * 0.12); n.smoke.children.forEach((b, i) => { const u = (t + i / 4) % 1; b.position.set(S(u * 6 + i) * 0.1, u * 1.1, 0); b.scale.setScalar(0.5 + u * 1.3); }); } } } };
}
function generator() {
  const root = new THREE.Group(); root.name = 'power_plant'; base(root, 1.8, 1.5, PAL.stoneDark);
  rbox(root, 1.5, 1.0, 1.1, '#d9c38a', 0, 0.62, 0, 0.08); rbox(root, 1.6, 0.1, 1.2, PAL.roofBlue, 0, 1.17, 0, 0.03); rbox(root, 1.6, 0.06, 1.2, PAL.snow, 0, 1.24, 0, 0.03);
  windowGlow(root, -0.35, 0.7, 0.56, 0.35, 0.28); door(root, 0.35, 0.56, 0.62);
  const mast = cyl(root, 0.06, 0.09, 2.0, '#e7ecef', 0.55, 2.2, -0.3, 8);
  const hub = pivot(root, 'rotor', 0.55, 3.2, -0.12); rbox(hub, 0.16, 0.16, 0.3, '#e7ecef', 0, 0, -0.08, 0.05);
  for (let i = 0; i < 3; i++) { const bl = pivot(hub, 'blade' + i, 0, 0, 0.08); bl.rotation.z = i * TAU / 3; rbox(bl, 0.12, 0.85, 0.03, '#f4f6f8', 0, 0.45, 0, 0.02); }
  const bolt = pivot(root, 'spark', -0.55, 1.6, 0.2); ball(bolt, 0.09, PAL.gold, 0, 0, 0, 8, { emissive: PAL.gold, ei: 2 });
  return { root, nodes: { rotor: hub, spark: bolt }, kind: 'facility', anims: { idle: { dur: 1.2, frames: 6, fn(t, n) { n.rotor.rotation.z = -t * TAU / 3; n.spark.scale.setScalar(0.7 + Math.abs(S(t * TAU * 2)) * 0.6); } } } };
}
function fence() {
  const root = new THREE.Group(); root.name = 'fence_segment';
  for (let i = 0; i < 6; i++) { const h = 1.1 + (i % 2) * 0.12; cyl(root, 0.1, 0.11, h, PAL.log, -0.55 + i * 0.22, h / 2, 0, 8); cone(root, 0.1, 0.18, PAL.log, -0.55 + i * 0.22, h + 0.09, 0, 8); ball(root, 0.08, PAL.snow, -0.55 + i * 0.22, h + 0.03, 0.02, 6).scale.set(1, 0.5, 1); }
  [0.35, 0.8].forEach(y => { const b = cyl(root, 0.045, 0.045, 1.4, PAL.wood, 0, y, 0.11, 6); b.rotation.z = Math.PI / 2; });
  return { root, nodes: {}, kind: 'facility', anims: {} };
}
function truck() {
  const root = new THREE.Group(); root.name = 'truck'; const body = pivot(root, 'body', 0, 0, 0);
  rbox(body, 1.0, 0.5, 2.0, PAL.truck, 0, 0.6, 0, 0.08); rbox(body, 0.92, 0.55, 0.75, PAL.truck, 0, 1.1, 0.55, 0.12);
  box(body, 0.8, 0.3, 0.02, '#bfe4f5', 0, 1.15, 0.93, { emissive: '#5aa9d6', ei: 0.15, rough: 0.2 });
  rbox(body, 0.98, 0.45, 1.05, PAL.wood, 0, 1.05, -0.45, 0.04); rbox(body, 0.98, 0.07, 1.05, PAL.snow, 0, 1.3, -0.45, 0.03);
  [-1, 1].forEach(s => ball(body, 0.07, PAL.window, s * 0.35, 0.62, 1.0, 8, { emissive: PAL.glow, ei: 2 }));
  const wheels = []; [[-1, 0.6], [1, 0.6], [-1, -0.6], [1, -0.6]].forEach(([x, z], i) => { const w = pivot(root, 'wheel' + i, x * 0.52, 0.25, z); const t = cyl(w, 0.25, 0.25, 0.18, PAL.tire, 0, 0, 0, 14); t.rotation.z = Math.PI / 2; const h = cyl(w, 0.1, 0.1, 0.19, PAL.metal, 0, 0, 0, 8); h.rotation.z = Math.PI / 2; wheels.push(w); });
  return { root, nodes: { body, wheels }, kind: 'actor', anims: { drive: { dur: 0.5, frames: 6, fn(t, n) { n.wheels.forEach(w => w.rotation.x = t * TAU); n.body.position.y = Math.abs(S(t * TAU * 2)) * 0.02; } }, idle: { dur: 1, frames: 2, fn(t, n) { n.body.position.y = 0; } } } };
}
function chest() {
  const root = new THREE.Group(); root.name = 'golden_chest'; const lidP = pivot(root, 'lid', 0, 0.42, -0.3);
  rbox(root, 0.8, 0.42, 0.6, PAL.wood, 0, 0.21, 0, 0.05); [-1, 1].forEach(s => box(root, 0.08, 0.44, 0.62, PAL.gold, s * 0.3, 0.21, 0, { metal: 0.7, rough: 0.3 }));
  const lid = rbox(lidP, 0.8, 0.22, 0.6, PAL.wood, 0, 0.1, 0.3, 0.1); [-1, 1].forEach(s => box(lidP, 0.08, 0.24, 0.62, PAL.gold, s * 0.3, 0.1, 0.3, { metal: 0.7, rough: 0.3 }));
  rbox(root, 0.16, 0.18, 0.06, PAL.gold, 0, 0.36, 0.31, 0.03, { metal: 0.7, rough: 0.3 });
  const glow = pivot(root, 'glow', 0, 0.45, 0); for (let i = 0; i < 6; i++) ball(glow, 0.05, PAL.gold, 0, 0, 0, 6, { emissive: PAL.gold, ei: 2.5 });
  return { root, nodes: { lid: lidP, glow }, kind: 'prop', anims: {
    idle: { dur: 1.2, frames: 6, fn(t, n) { n.lid.rotation.x = -Math.abs(S(t * TAU)) * 0.12; n.glow.children.forEach((b, i) => { const a = i / 6 * TAU + t * TAU; b.position.set(C(a) * 0.5, 0.1 + S(a * 2) * 0.1, S(a) * 0.4); }); } },
    open: { dur: 0.8, frames: 8, fn(t, n) { const k = Math.min(1, t * 1.6); n.lid.rotation.x = -k * 1.9; n.glow.children.forEach((b, i) => { const a = i / 6 * TAU; b.position.set(C(a) * t * 0.6, 0.1 + t * 1.2, S(a) * t * 0.4); b.scale.setScalar(1 + t * 1.5); }); } } } };
}

/* ------------------------------------------------------------------ 2026-10 set: extra people */
const hide = (o) => o.scale.setScalar(0.0001);           // state switches stay plain transforms, so glTF clips can carry them
const basket = (N) => { const b = cyl(N.handL, 0.12, 0.09, 0.14, PAL.woodLight, 0, -0.06, 0.06, 10); torus(b, 0.1, 0.012, PAL.wood, 0, 0.1, 0).rotation.x = 0; ball(b, 0.05, PAL.heroScarf, 0.03, 0.08, 0, 8); ball(b, 0.045, PAL.gold, -0.04, 0.08, 0.02, 8); };
const masterCape = (c) => (N) => { const cp = pivot(N.torso, 'cape', 0, 0.5, -0.18); N.cape = cp; rbox(cp, 0.56, 0.62, 0.04, c, 0, -0.3, 0, 0.03); torus(N.torso, 0.08, 0.02, PAL.gold, 0, 0.36, 0.18, TAU, { metal: 0.6, rough: 0.3 }); ball(N.torso, 0.05, PAL.gold, 0, 0.36, 0.19, 8, { emissive: PAL.gold, ei: 0.8 }); };
const keeperExtra = (N) => { // towel over the shoulder + lantern in the free hand
  rbox(N.torso, 0.12, 0.42, 0.06, PAL.snow, -0.18, 0.32, 0.12, 0.03).rotation.z = -0.5;
  const l = pivot(N.handL, 'lantern', 0, -0.05, 0.05); cyl(l, 0.008, 0.008, 0.12, PAL.metalDark, 0, -0.02, 0, 4); rbox(l, 0.12, 0.15, 0.12, PAL.metalDark, 0, -0.16, 0, 0.02); ball(l, 0.045, PAL.window, 0, -0.16, 0, 8, { emissive: PAL.glow, ei: 2 });
};
function withAnims(factory, extra) { return () => { const m = factory(); Object.entries(extra).forEach(([k, A]) => { m.anims[k] = A; }); return m; }; }
const serve = { dur: 1.2, frames: 8, fn(t, n) { const k = S(t * TAU) * 0.5 + 0.5; n.armR.rotation.x = -0.6 - k * 0.8; n.armL.rotation.x = -0.6 - k * 0.8; n.armL.rotation.z = 0.1; n.armR.rotation.z = -0.1; n.torso.rotation.x = k * 0.12; n.head.rotation.x = k * 0.1; } };
const happy = { dur: 0.8, frames: 8, fn(t, n) { const j = Math.abs(S(t * TAU)); n.body.position.y = j * 0.1; n.armR.rotation.x = -2.4; n.armR.rotation.z = 0.2 + S(t * TAU * 2) * 0.35; n.head.rotation.z = S(t * TAU) * 0.12; } };
const capeAnims = (A) => Object.entries(A).forEach(([k, a]) => { const f = a.fn; a.fn = (t, n) => { f(t, n); n.cape.rotation.x = 0.12 + Math.abs(S(t * TAU)) * (k === 'walk' || k === 'work' ? 0.35 : 0.08); }; });
function master(name, o, tool, animKind) { return () => { const m = character(name, { ...o, animKind }, tool)(); capeAnims(m.anims); m.root.scale.setScalar(1.12); m.scale = 1.12; return m; }; }

/* ------------------------------------------------------------------ 2026-10 set: machines */
function treads(p, len, x, N, key) { // rubber track with moving tread blocks (scrolled by the drive clip)
  rbox(p, 0.26, 0.32, len, PAL.track, x, 0.18, 0, 0.12);
  const tr = pivot(p, key, x, 0, 0); N[key] = tr;
  for (let i = 0; i < 8; i++) box(tr, 0.28, 0.04, 0.08, '#4a525c', 0, 0.35, -len / 2 + 0.1 + i * (len - 0.2) / 7);
  [-1, 0, 1].forEach(z => { const w = cyl(p, 0.1, 0.1, 0.28, '#5d6670', x, 0.15, z * len * 0.36, 10); w.rotation.z = Math.PI / 2; });
}
function excavator() {
  const root = new THREE.Group(); root.name = 'excavator'; const body = pivot(root, 'body'); const N = { root, body };
  treads(body, 1.4, -0.42, N, 'treadL'); treads(body, 1.4, 0.42, N, 'treadR');
  const cab = pivot(body, 'cab', 0, 0.36, 0); N.cab = cab;
  cyl(cab, 0.45, 0.45, 0.08, PAL.metalDark, 0, 0.02, 0, 16);
  rbox(cab, 1.0, 0.42, 1.1, PAL.machineYellow, 0, 0.27, -0.1, 0.08); rbox(cab, 1.02, 0.06, 1.12, artShadeHex(PAL.machineYellow, 0.75), 0, 0.12, -0.1, 0.03);
  rbox(cab, 0.5, 0.55, 0.5, PAL.machineYellow, -0.22, 0.72, 0.12, 0.07); box(cab, 0.4, 0.34, 0.02, PAL.glass, -0.22, 0.76, 0.375, { emissive: '#5aa9d6', ei: 0.15, rough: 0.2 });
  rbox(cab, 0.54, 0.06, 0.54, PAL.snow, -0.22, 1.02, 0.12, 0.03); rbox(cab, 0.3, 0.3, 0.25, PAL.metalDark, 0.25, 0.6, -0.45, 0.05);
  cyl(cab, 0.05, 0.05, 0.35, PAL.metalDark, 0.35, 0.85, -0.5, 8); ball(cab, 0.06, PAL.window, 0.2, 0.55, 0.36, 8, { emissive: PAL.glow, ei: 2 });
  const boom = pivot(cab, 'boom', 0.22, 0.42, 0.35); N.boom = boom; boom.rotation.x = -0.55;
  rbox(boom, 0.16, 0.16, 1.0, PAL.machineYellow, 0, 0, 0.5, 0.05); cyl(boom, 0.04, 0.04, 0.7, PAL.metal, 0, 0.12, 0.45, 6).rotation.x = Math.PI / 2;
  const stick = pivot(boom, 'stick', 0, 0, 1.0); N.stick = stick; stick.rotation.x = 1.4;
  rbox(stick, 0.13, 0.13, 0.75, PAL.machineYellow, 0, 0, 0.37, 0.04);
  const bucket = pivot(stick, 'bucket', 0, 0, 0.75); N.bucket = bucket; bucket.rotation.x = 0.4;
  rbox(bucket, 0.36, 0.26, 0.24, PAL.metalDark, 0, -0.05, 0.1, 0.05); for (let i = 0; i < 4; i++) cone(bucket, 0.03, 0.08, PAL.metal, -0.12 + i * 0.08, -0.2, 0.2, 4).rotation.x = Math.PI;
  const ore = pivot(bucket, 'load', 0, 0.06, 0.1); N.load = ore; [[-0.08, 0], [0.07, 0.02], [0, 0.05]].forEach(([x, y]) => cone(ore, 0.06, 0.13, PAL.ore, x, y, 0, 5, { emissive: PAL.ore, ei: 0.45 }));
  const restLoad = () => hide(N.load);
  return { root, nodes: N, kind: 'actor', anims: {
    idle: { dur: 2, frames: 4, fn(t, n) { restLoad(); n.body.position.y = S(t * TAU) * 0.01; } },
    drive: { dur: 0.6, frames: 6, fn(t, n) { restLoad(); n.treadL.position.z = ((t * 0.17) % 0.17); n.treadR.position.z = ((t * 0.17) % 0.17); n.body.position.y = Math.abs(S(t * TAU * 2)) * 0.015; } },
    work: { dur: 1.4, frames: 8, fn(t, n) { const d = S(t * TAU) * 0.5 + 0.5; n.cab.rotation.y = S(t * TAU) * 0.35; n.boom.rotation.x = -0.55 + d * 0.5; n.stick.rotation.x = 1.4 - d * 0.6; n.bucket.rotation.x = 0.4 + (1 - d) * 0.9; if (t < 0.5) hide(n.load); n.body.position.y = 0; } } } };
}
function harvester() {
  const root = new THREE.Group(); root.name = 'harvester'; const body = pivot(root, 'body'); const N = { root, body }; const wheels = [];
  [-0.55, 0, 0.55].forEach((z, i) => [-1, 1].forEach(s => { const w = pivot(root, 'wheel' + i + (s < 0 ? 'L' : 'R'), s * 0.5, 0.28, z); const t = cyl(w, 0.28, 0.28, 0.2, PAL.tire, 0, 0, 0, 14); t.rotation.z = Math.PI / 2; const h = cyl(w, 0.11, 0.11, 0.21, '#8f969e', 0, 0, 0, 8); h.rotation.z = Math.PI / 2; wheels.push(w); }));
  N.wheels = wheels;
  rbox(body, 0.9, 0.42, 1.7, PAL.machineGreen, 0, 0.62, 0, 0.08); rbox(body, 0.92, 0.07, 1.72, '#3e7f56', 0, 0.44, 0, 0.03);
  rbox(body, 0.7, 0.62, 0.6, PAL.machineGreen, 0, 1.12, -0.42, 0.08); box(body, 0.55, 0.38, 0.02, PAL.glass, 0, 1.16, -0.115, { emissive: '#5aa9d6', ei: 0.15, rough: 0.2 });
  const drv = pivot(body, 'driver', 0, 1.05, -0.4); ball(drv, 0.13, PAL.skin, 0, 0.05, 0, 10); ball(drv, 0.14, PAL.machineYellow, 0, 0.11, 0, 10).scale.set(1, 0.6, 1);
  rbox(body, 0.74, 0.06, 0.64, PAL.snow, 0, 1.46, -0.42, 0.03); ball(body, 0.06, PAL.window, 0.3, 0.7, 0.86, 8, { emissive: PAL.glow, ei: 2 }); ball(body, 0.06, PAL.window, -0.3, 0.7, 0.86, 8, { emissive: PAL.glow, ei: 2 });
  const crane = pivot(body, 'crane', 0.2, 0.9, 0.3); N.crane = crane; crane.rotation.x = -0.9;
  rbox(crane, 0.12, 0.12, 0.85, '#e0a03a', 0, 0, 0.42, 0.04);
  const arm2 = pivot(crane, 'arm2', 0, 0, 0.85); N.arm2 = arm2; arm2.rotation.x = 1.2; rbox(arm2, 0.1, 0.1, 0.6, '#e0a03a', 0, 0, 0.3, 0.04);
  const head = pivot(arm2, 'head', 0, 0, 0.62); N.head = head; rbox(head, 0.22, 0.2, 0.18, PAL.metalDark, 0, 0, 0, 0.04);
  const saw = cyl(head, 0.13, 0.13, 0.02, '#c9d2da', 0, -0.15, 0, 16, { metal: 0.8, rough: 0.25 }); saw.rotation.z = Math.PI / 2;
  [-1, 1].forEach(s => { const c = box(head, 0.03, 0.18, 0.12, PAL.metal, s * 0.1, -0.1, 0.08); c.rotation.z = s * 0.3; });
  return { root, nodes: N, kind: 'actor', anims: {
    idle: { dur: 2, frames: 4, fn(t, n) { n.crane.rotation.y = S(t * TAU) * 0.05; } },
    drive: { dur: 0.5, frames: 6, fn(t, n) { n.wheels.forEach(w => w.rotation.x = t * TAU); n.body.position.y = Math.abs(S(t * TAU * 2)) * 0.02; } },
    work: { dur: 1.0, frames: 8, fn(t, n) { const sw = S(t * TAU); n.crane.rotation.y = sw * 0.35; n.crane.rotation.x = -0.9 + Math.abs(sw) * 0.2; n.arm2.rotation.x = 1.2 - sw * 0.3; n.head.rotation.x = sw * 0.4; } } } };
}
function fishRig() {
  const root = new THREE.Group(); root.name = 'fish_rig'; const body = pivot(root, 'body'); const N = { root, body }; const wheels = [];
  [[-1, 0.35], [1, 0.35], [-1, -0.35], [1, -0.35]].forEach(([x, z], i) => { const w = pivot(root, 'wheel' + i, x * 0.42, 0.22, z); const t = cyl(w, 0.22, 0.22, 0.16, PAL.tire, 0, 0, 0, 14); t.rotation.z = Math.PI / 2; wheels.push(w); }); N.wheels = wheels;
  // boat-shaped hull on wheels
  rbox(body, 0.78, 0.36, 1.25, PAL.rigBlue, 0, 0.5, 0, 0.14); rbox(body, 0.82, 0.06, 1.3, PAL.snow, 0, 0.7, 0, 0.03);
  cone(body, 0.39, 0.4, PAL.rigBlue, 0, 0.5, 0.78, 4).rotation.x = Math.PI / 2;
  rbox(body, 0.84, 0.08, 1.3, '#f4e1b0', 0, 0.4, 0, 0.03);
  const drv = pivot(body, 'driver', 0, 0.75, -0.25); rbox(drv, 0.32, 0.3, 0.24, '#f58a3c', 0, 0.12, 0, 0.08); ball(drv, 0.12, PAL.skin, 0, 0.38, 0, 10); ball(drv, 0.13, '#e8845a', 0, 0.44, 0, 10).scale.set(1, 0.55, 1);
  const crate = rbox(body, 0.36, 0.22, 0.3, PAL.wood, 0, 0.82, 0.28, 0.03); [0, 1].forEach(i => { const f = fishModel().root; f.scale.setScalar(0.7); f.position.set(-0.07 + i * 0.14, 0.88, 0.28); body.add(f); });
  const crane = pivot(body, 'crane', 0.28, 0.75, -0.1); N.crane = crane; cyl(crane, 0.03, 0.04, 1.3, PAL.woodDark, 0, 0.6, 0.15, 6).rotation.x = 0.4;
  const reel = pivot(crane, 'reel', 0, 0.2, 0.04); N.reel = reel; const rr = torus(reel, 0.08, 0.025, PAL.metalDark, 0, 0, 0); rr.rotation.y = Math.PI / 2;
  const net = pivot(crane, 'net', 0, 1.15, 0.65); N.net = net; box(net, 0.006, 0.6, 0.006, '#dfe6ec', 0, -0.3, 0); const nb = ball(net, 0.16, '#dfe6ec', 0, -0.62, 0, 8, { opacity: 0.55 }); nb.scale.set(1, 0.7, 1); torus(net, 0.15, 0.015, PAL.metalDark, 0, -0.55, 0).rotation.x = Math.PI / 2;
  return { root, nodes: N, kind: 'actor', anims: {
    idle: { dur: 2, frames: 4, fn(t, n) { n.net.rotation.x = S(t * TAU) * 0.08; } },
    drive: { dur: 0.5, frames: 6, fn(t, n) { n.wheels.forEach(w => w.rotation.x = t * TAU); n.body.position.y = Math.abs(S(t * TAU * 2)) * 0.02; n.net.rotation.x = -0.2 + S(t * TAU) * 0.1; } },
    work: { dur: 1.6, frames: 8, fn(t, n) { n.reel.rotation.x = t * TAU * 2; n.net.position.y = 1.15 - (0.5 - Math.abs(t - 0.5)) * 0.6; n.net.rotation.x = S(t * TAU) * 0.15; n.crane.rotation.y = S(t * TAU) * 0.12; } } } };
}

/* ------------------------------------------------------------------ 2026-10 set: market + village extras */
function workshop() {
  const root = new THREE.Group(); root.name = 'workshop'; base(root, 2.0, 1.4, PAL.woodLight);
  const shed = pivot(root, 'shed', 0, 0.12, 0);
  rbox(shed, 2.0, 1.2, 0.12, PAL.wood, 0, 0.6, -0.65, 0.03); [-1, 1].forEach(s => rbox(shed, 0.12, 1.2, 1.4, PAL.wood, s * 0.95, 0.6, 0, 0.03));
  for (let i = 0; i < 6; i++) box(shed, 0.03, 1.2, 0.13, PAL.woodDark, -0.85 + i * 0.34, 0.6, -0.64);
  snowRoof(shed, 2.0, 1.6, 0.6, '#6f8c77', 1.2);
  rbox(shed, 1.3, 0.08, 0.55, PAL.woodLight, 0, 0.62, 0.1, 0.02); [-0.55, 0.55].forEach(x => [-0.12, 0.3].forEach(z => box(shed, 0.07, 0.58, 0.07, PAL.woodDark, x, 0.29, z)));
  const lg = cyl(shed, 0.1, 0.1, 0.7, PAL.log, -0.2, 0.76, 0.12, 8); lg.rotation.z = Math.PI / 2; cyl(shed, 0.095, 0.095, 0.01, PAL.logEnd, 0.155, 0.76, 0.12, 8).rotation.z = Math.PI / 2;
  // tools on the back wall
  const saw = rbox(shed, 0.5, 0.14, 0.02, '#c9d2da', -0.45, 0.95, -0.58, 0.02, { metal: 0.7, rough: 0.3 }); rbox(shed, 0.14, 0.12, 0.03, PAL.woodDark, -0.73, 0.95, -0.58, 0.02);
  [[0.3, PAL.metal], [0.55, PAL.woodLight]].forEach(([x, c]) => { cyl(shed, 0.02, 0.02, 0.45, PAL.woodLight, x, 0.95, -0.58, 6); rbox(shed, 0.14, 0.07, 0.06, c, x, 1.17, -0.58, 0.02); });
  const anvil = rbox(root, 0.32, 0.18, 0.18, PAL.metalDark, 0.75, 0.42, 0.7, 0.03, { metal: 0.5, rough: 0.4 }); cyl(root, 0.1, 0.13, 0.3, PAL.log, 0.75, 0.27, 0.7, 8);
  const hammer = pivot(root, 'hammer', 0.62, 0.62, 0.7); cyl(hammer, 0.018, 0.018, 0.3, PAL.woodLight, 0.12, 0, 0, 6).rotation.z = Math.PI / 2; rbox(hammer, 0.08, 0.12, 0.08, PAL.metal, 0.26, 0, 0, 0.02);
  const sparks = pivot(root, 'sparks', 0.86, 0.55, 0.7); for (let i = 0; i < 4; i++) ball(sparks, 0.025, PAL.gold, 0, 0, 0, 6, { emissive: PAL.glow, ei: 2.5 });
  const lamp = ball(shed, 0.08, PAL.window, 0, 1.12, 0.3, 8, { emissive: PAL.glow, ei: 2 });
  return { root, nodes: { hammer, sparks }, kind: 'facility', anims: { idle: { dur: 0.9, frames: 6, fn(t, n) { const k = S(t * TAU); n.hammer.rotation.z = -Math.max(0, k) * 0.9; const hit = Math.max(0, -k); n.sparks.children.forEach((b, i) => { const a = i / 4 * TAU + 0.4; b.position.set(C(a) * hit * 0.2, hit * 0.18 + S(a) * hit * 0.05, S(a) * hit * 0.15); b.scale.setScalar(hit + 0.0001); }); } } } };
}
function warehouse() {
  const root = new THREE.Group(); root.name = 'warehouse'; base(root, 3.0, 2.0, PAL.stone);
  const hall = pivot(root, 'hall', 0, 0.12, 0);
  rbox(hall, 3.0, 1.5, 2.0, '#b9a37a', 0, 0.75, 0, 0.05); for (let i = 0; i < 9; i++) box(hall, 0.04, 1.5, 2.02, '#9e8a62', -1.4 + i * 0.35, 0.75, 0);
  rbox(hall, 3.02, 0.25, 2.02, PAL.stone, 0, 0.12, 0, 0.03, { flat: true });
  snowRoof(hall, 3.0, 2.2, 1.0, PAL.roofBlue, 1.5);
  const doors = pivot(hall, 'doors', 0, 0, 1.01); [-1, 1].forEach(s => { const d = pivot(doors, s < 0 ? 'doorL' : 'doorR', s * 0.7, 0, 0); rbox(d, 0.68, 1.15, 0.06, PAL.woodDark, -s * 0.34, 0.58, 0, 0.03); const x = box(d, 0.06, 1.2, 0.02, PAL.wood, -s * 0.34, 0.58, 0.04); x.rotation.z = s * 0.52; });
  box(hall, 1.5, 1.1, 0.02, '#3a2a1e', 0, 0.56, 0.99); [[-0.35, 0.25], [0.2, 0.25], [-0.08, 0.6]].forEach(([x, y]) => { const c = rbox(hall, 0.36, 0.32, 0.3, PAL.wood, x, y, 0.8, 0.03); });
  windowGlow(hall, -1.05, 1.15, 1.01, 0.34, 0.24); windowGlow(hall, 1.05, 1.15, 1.01, 0.34, 0.24);
  { const lp = logPile().root; lp.position.set(1.65, 0.12, 0.6); lp.rotation.y = Math.PI / 2; root.add(lp); }
  { const c = crates().root; c.scale.setScalar(0.55); c.position.set(-1.75, 0.12, 0.6); root.add(c); }
  ball(root, 0.09, PAL.window, 0.95, 1.55, 1.08, 8, { emissive: PAL.glow, ei: 2 });
  return { root, nodes: { doors }, kind: 'facility', anims: {} };
}
function marketStall() {
  const root = new THREE.Group(); root.name = 'market_stall';
  const shelf = pivot(root, 'shelf'); rbox(shelf, 1.0, 0.08, 0.36, PAL.woodLight, 0, 0.62, 0, 0.02); rbox(shelf, 1.0, 0.08, 0.36, PAL.woodLight, 0, 0.3, 0, 0.02);
  [[-0.46, -0.15], [0.46, -0.15], [-0.46, 0.15], [0.46, 0.15]].forEach(([x, z]) => box(shelf, 0.06, 0.7, 0.06, PAL.woodDark, x, 0.35, z));
  for (let i = 0; i < 3; i++) { const l = cyl(shelf, 0.06, 0.06, 0.3, PAL.log, -0.3 + i * 0.13, 0.72, 0, 8); l.rotation.x = Math.PI / 2; cyl(shelf, 0.055, 0.055, 0.01, PAL.logEnd, -0.3 + i * 0.13, 0.72, 0.151, 8).rotation.x = Math.PI / 2; }
  for (let i = 0; i < 2; i++) { const f = fishModel().root; f.scale.setScalar(0.65); f.position.set(0.18 + i * 0.18, 0.6, 0); f.rotation.y = Math.PI / 2; shelf.add(f); }
  [[-0.25, 0], [0, 0.04], [0.25, -0.02]].forEach(([x, z], i) => cone(shelf, 0.05, 0.14, [PAL.ore, PAL.gold, PAL.ore][i], x, 0.41, z, 5, { emissive: PAL.ore, ei: 0.3 }));
  rbox(shelf, 1.06, 0.05, 0.4, PAL.snow, 0, 0.68 + 0.0, -0.0, 0.02).scale.set(1, 1, 0.3);
  return { root, nodes: {}, kind: 'facility', anims: {} };
}
function noticeBoard() {
  const root = new THREE.Group(); root.name = 'notice_board';
  [-0.5, 0.5].forEach(x => cyl(root, 0.05, 0.06, 1.4, PAL.woodDark, x, 0.7, 0, 6));
  rbox(root, 1.15, 0.75, 0.08, '#b98b5e', 0, 1.0, 0, 0.03); rbox(root, 1.0, 0.6, 0.02, '#8a6a44', 0, 1.0, 0.04, 0.01);
  const roof = rbox(root, 1.35, 0.06, 0.4, PAL.roofRed, 0, 1.47, 0.02, 0.02); rbox(root, 1.38, 0.05, 0.38, PAL.snow, 0, 1.51, 0.02, 0.02);
  const papers = pivot(root, 'papers', 0, 1.0, 0.06); [[-0.3, 0.1, 0.05], [0.05, 0.12, -0.08], [0.32, 0.05, 0.1], [-0.12, -0.15, 0.04], [0.22, -0.16, -0.06]].forEach(([x, y, r], i) => { const p = pivot(papers, 'paper' + i, x, y + 0.1, 0); const s = box(p, 0.22, 0.26, 0.01, i === 2 ? PAL.gold : PAL.paper, 0, -0.12, 0); p.rotation.z = r; ball(p, 0.018, PAL.heroScarf, 0, 0, 0.01, 6); });
  return { root, nodes: { papers }, kind: 'facility', anims: { idle: { dur: 2.4, frames: 6, fn(t, n) { n.papers.children.forEach((p, i) => { p.rotation.x = -Math.max(0, S(t * TAU + i * 1.3)) * 0.25; }); } } } };
}

/* ------------------------------------------------------------------ 2026-10 set: aurora hot-spring village (models only; runtime not implemented) */
// Facilities expose two clips matching design/fourth-village-implementation.md: `broken` (discovered) and `repaired`.
function steamPuffs(p, name, x, y, z, n = 4, r = 0.16) { const s = pivot(p, name, x, y, z); for (let i = 0; i < n; i++) ball(s, r, PAL.steam, 0, 0, 0, 8, { name: 'steam', opacity: 0.85, emissive: '#e8f4f6', ei: 0.4 }); return s; }
function rise(s, t, h, spread = 0.12) { s.children.forEach((b, i) => { const u = (t + i / s.children.length) % 1; b.position.set(S(u * 6 + i) * spread, u * h, C(u * 5 + i) * spread * 0.5); b.scale.setScalar(0.5 + u * 1.3); }); }
function hotSpring() {
  const root = new THREE.Group(); root.name = 'hot_spring'; const N = { root };
  ball(root, 1.6, PAL.snow, 0, 0, 0, 14).scale.set(1, 0.05, 0.8);
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, m = add(root, new THREE.Mesh(new THREE.DodecahedronGeometry(0.2 + (i % 3) * 0.04, 0), mat(i % 2 ? PAL.stone : PAL.stoneDark, { flat: true })), C(a) * 1.15, 0.14, S(a) * 0.85); m.rotation.set(i, i * 1.7, 0); if (i % 3 === 0) ball(root, 0.13, PAL.snow, C(a) * 1.15, 0.3, S(a) * 0.85, 8).scale.set(1, 0.4, 1); }
  cyl(root, 1.05, 0.95, 0.12, '#5b6670', 0, 0.06, 0, 18).scale.set(1, 1, 0.74);
  const water = pivot(root, 'water', 0, 0.16, 0); N.water = water; cyl(water, 1.0, 1.0, 0.04, PAL.spring, 0, 0, 0, 18, { emissive: PAL.springDeep, ei: 0.35, rough: 0.15 }).scale.set(1, 1, 0.74);
  const ripple = pivot(water, 'ripple', 0, 0.03, 0); N.ripple = ripple; [0.3, 0.55, 0.8].forEach(r => torus(ripple, r, 0.012, '#bff3ee', 0, 0, 0, TAU, { emissive: '#bff3ee', ei: 0.4 }).rotation.x = Math.PI / 2); ripple.scale.set(1, 1, 0.74);
  const ice = pivot(root, 'ice', 0, 0.14, 0); N.ice = ice; cyl(ice, 0.98, 0.98, 0.05, '#d9eef7', 0, 0, 0, 18, { rough: 0.3 }).scale.set(1, 1, 0.74); [[-0.3, 0.1], [0.25, -0.2], [0.1, 0.3]].forEach(([x, z]) => { const c = box(ice, 0.5, 0.012, 0.02, '#9fbccb', x, 0.03, z); c.rotation.y = x * 3; });
  const steam = steamPuffs(root, 'steam', 0, 0.3, 0, 6, 0.2); N.steam = steam;
  // wooden bucket + ladle, little bamboo spout
  cyl(root, 0.15, 0.12, 0.22, PAL.wood, 0.9, 0.11, 0.9, 10); torus(root, 0.15, 0.015, PAL.metalDark, 0.9, 0.18, 0.9).rotation.x = Math.PI / 2;
  const sp = cyl(root, 0.05, 0.05, 0.7, '#9cb86a', -0.95, 0.45, -0.5, 8); sp.rotation.z = 1.1; const pour = pivot(root, 'pour', -0.7, 0.3, -0.5); N.pour = pour; box(pour, 0.04, 0.22, 0.04, PAL.spring, 0, 0, 0, { opacity: 0.8, emissive: PAL.spring, ei: 0.4 });
  const lan = pivot(root, 'lantern', 1.2, 0, -0.45); cyl(lan, 0.04, 0.05, 0.75, PAL.woodDark, 0, 0.37, 0, 6); rbox(lan, 0.16, 0.18, 0.16, PAL.woodDark, 0, 0.82, 0, 0.03); const lg = ball(lan, 0.06, PAL.window, 0, 0.82, 0, 8, { emissive: PAL.glow, ei: 2 }); N.lanternGlow = lg;
  const broken = (n) => { hide(n.water); hide(n.steam); hide(n.pour); hide(n.lanternGlow); };
  const fixed = (n) => hide(n.ice);
  return { root, nodes: N, kind: 'facility', anims: {
    repaired: { dur: 2.4, frames: 6, fn(t, n) { fixed(n); rise(n.steam, t, 1.2, 0.35); n.ripple.scale.set(0.9 + t * 0.25, 1, (0.9 + t * 0.25) * 0.74); n.pour.scale.set(1, 0.9 + S(t * TAU * 3) * 0.1, 1); } },
    broken: { dur: 2, frames: 2, fn(t, n) { broken(n); } } } };
}
function boiler() {
  const root = new THREE.Group(); root.name = 'boiler'; const N = { root }; base(root, 1.8, 1.4, PAL.stoneDark);
  rbox(root, 1.7, 0.5, 1.3, PAL.brick, 0, 0.37, 0, 0.05, { flat: true }); for (let r = 0; r < 3; r++) box(root, 1.72, 0.02, 1.32, '#8e4d36', 0, 0.2 + r * 0.15, 0);
  const tank = cyl(root, 0.5, 0.5, 1.4, PAL.metal, 0, 1.05, 0, 16, { metal: 0.5, rough: 0.45 }); tank.rotation.z = Math.PI / 2;
  [-0.55, 0, 0.55].forEach(x => { const b = torus(root, 0.51, 0.03, PAL.metalDark, x, 1.05, 0); b.rotation.y = Math.PI / 2; });
  ball(root, 0.5, PAL.snow, 0, 1.38, 0, 12).scale.set(1.3, 0.18, 0.75);
  cyl(root, 0.15, 0.17, 1.3, PAL.metalDark, -0.5, 1.95, -0.25, 10); rbox(root, 0.38, 0.06, 0.38, PAL.snow, -0.5, 2.6, -0.25, 0.03);
  const pipe = pivot(root, 'pipe', 0.7, 1.05, 0.2); N.pipe = pipe; cyl(pipe, 0.07, 0.07, 0.7, '#c9a24a', 0.3, -0.25, 0, 8, { metal: 0.6, rough: 0.35 }).rotation.z = 0.6;
  const gauge = pivot(root, 'gauge', 0.2, 1.35, 0.42); cyl(gauge, 0.13, 0.13, 0.05, '#f4f1e6', 0, 0, 0, 14).rotation.x = Math.PI / 2; torus(gauge, 0.13, 0.02, '#c9a24a', 0, 0, 0.02);
  const needle = pivot(gauge, 'needle', 0, 0, 0.035); N.needle = needle; box(needle, 0.015, 0.1, 0.01, PAL.heroScarf, 0, 0.05, 0);
  const fire = rbox(root, 0.5, 0.32, 0.12, PAL.glowHot, 0, 0.36, 0.66, 0.06, { emissive: PAL.glowHot, ei: 2.2 }); fire.name = 'fire'; N.fire = fire;
  const coal = rbox(root, 0.5, 0.32, 0.12, '#2b2b30', 0, 0.36, 0.665, 0.06); coal.name = 'cold'; N.coal = coal;
  const glow = pivot(root, 'glow', 0, 0.36, 0.76); N.glow = glow; ball(glow, 0.2, PAL.glow, 0, 0, 0, 10, { emissive: PAL.glow, ei: 2.5 }).scale.set(1.3, 0.7, 0.3);
  const rust = pivot(root, 'rust', 0, 1.05, 0); N.rust = rust; [[-0.35, 0.35, 0.3], [0.4, 0.2, 0.38], [0.1, -0.3, 0.42]].forEach(([x, y, z]) => ball(rust, 0.12, PAL.rust, x, y, z, 8).scale.set(1, 0.8, 0.3));
  const steam = steamPuffs(root, 'steam', -0.5, 2.7, -0.25, 4, 0.16); N.steam = steam; const valve = steamPuffs(root, 'valve', 0.75, 1.55, 0.1, 3, 0.08); N.valve = valve;
  return { root, nodes: N, kind: 'facility', anims: {
    repaired: { dur: 2, frames: 6, fn(t, n) { hide(n.rust); hide(n.coal); n.glow.scale.setScalar(0.9 + S(t * TAU * 2) * 0.12); n.needle.rotation.z = -1.0 + S(t * TAU) * 0.15; rise(n.steam, t, 1.1); rise(n.valve, (t * 2) % 1, 0.5, 0.06); } },
    broken: { dur: 2, frames: 2, fn(t, n) { hide(n.fire); hide(n.glow); hide(n.steam); hide(n.valve); n.needle.rotation.z = 1.2; n.pipe.rotation.z = -0.5; } } } };
}
function lodge() {
  const root = new THREE.Group(); root.name = 'lodge'; const N = { root }; base(root, 2.8, 1.8);
  const walls = pivot(root, 'walls', 0, 0.12, 0); logWalls(walls, 2.8, 1.8, 1.6);
  snowRoof(walls, 2.8, 2.0, 1.1, '#2f8f8a', 1.6);
  rbox(walls, 3.0, 0.1, 0.5, PAL.woodLight, 0, 1.05, 1.15, 0.02); [-1.3, 1.3].forEach(x => cyl(walls, 0.05, 0.05, 1.05, PAL.woodDark, x, 0.52, 1.35, 6)); rbox(walls, 3.04, 0.06, 0.5, PAL.snow, 0, 1.12, 1.15, 0.02);
  door(walls, 0, 0.99, 0.8);
  const lit = pivot(walls, 'lit'); N.lit = lit; const dark = pivot(walls, 'dark'); N.dark = dark;
  [[-0.85, 0.6], [0.85, 0.6], [-0.85, 1.35], [0.85, 1.35]].forEach(([x, y]) => { windowGlow(lit, x, y, 1.0, 0.42, 0.34); box(dark, 0.46, 0.38, 0.06, '#2a3440', x, y, 1.03); });
  const boards = pivot(walls, 'boards', 0, 0.42, 1.05); N.boards = boards; [-0.2, 0.15].forEach((y, i) => { const b = box(boards, 0.6, 0.1, 0.03, PAL.woodLight, 0, y, 0); b.rotation.z = i ? -0.3 : 0.3; });
  const hole = pivot(walls, 'roofHole', 0.7, 2.05, 0.45); N.roofHole = hole; const hb = box(hole, 0.5, 0.04, 0.45, '#1e1a18', 0, 0, 0); hb.rotation.x = 0.6;
  const ch = rbox(walls, 0.3, 0.8, 0.3, PAL.stone, -0.9, 2.4, -0.4, 0.04); rbox(walls, 0.34, 0.08, 0.34, PAL.snow, -0.9, 2.82, -0.4, 0.03);
  const smoke = steamPuffs(root, 'smoke', -0.9, 3.05, -0.4, 3, 0.13); N.smoke = smoke;
  const line = pivot(root, 'towels', 1.55, 0, 0.6); N.towels = line; [-0.4, 0.4].forEach(z => cyl(line, 0.03, 0.03, 0.9, PAL.woodDark, 0, 0.45, z, 6)); const rope = cyl(line, 0.008, 0.008, 0.8, '#eee', 0, 0.86, 0, 4); rope.rotation.x = Math.PI / 2;
  [[-0.2, PAL.snow], [0.05, PAL.spring], [0.28, PAL.heroScarf]].forEach(([z, c], i) => { const tw = pivot(line, 'towel' + i, 0, 0.86, z); rbox(tw, 0.03, 0.26, 0.18, c, 0, -0.13, 0, 0.01); });
  [-1.3, 1.3].forEach(x => ball(walls, 0.08, PAL.window, x, 0.9, 1.38, 8, { emissive: PAL.glow, ei: 2 }).name = 'porchLamp');
  return { root, nodes: N, kind: 'facility', anims: {
    repaired: { dur: 3, frames: 6, fn(t, n) { hide(n.dark); hide(n.boards); hide(n.roofHole); rise(n.smoke, t, 0.9); n.towels.children.slice(3).forEach((tw, i) => { tw.rotation.x = S(t * TAU + i) * 0.25; }); } },
    broken: { dur: 2, frames: 2, fn(t, n) { hide(n.lit); hide(n.smoke); hide(n.towels); } } } };
}
function canalSegment() {
  const root = new THREE.Group(); root.name = 'canal_segment'; const N = { root };
  ball(root, 1.2, PAL.snow, 0, 0, 0, 12).scale.set(0.9, 0.05, 1.1);
  [-1, 1].forEach(s => { for (let i = 0; i < 5; i++) { const m = rbox(root, 0.3, 0.26, 0.42, i % 2 ? PAL.stone : PAL.stoneDark, s * 0.45, 0.13, -0.84 + i * 0.42, 0.06, { flat: true }); m.rotation.y = (i % 2) * 0.1; } rbox(root, 0.32, 0.06, 2.1, PAL.snow, s * 0.45, 0.29, 0, 0.03).scale.set(1, 1, 1); });
  box(root, 0.6, 0.06, 2.1, '#5b6670', 0, 0.03, 0);
  const water = pivot(root, 'water', 0, 0.12, 0); N.water = water; box(water, 0.58, 0.06, 2.08, PAL.spring, 0, 0, 0, { emissive: PAL.springDeep, ei: 0.35, rough: 0.15 });
  const flow = pivot(water, 'flow', 0, 0.035, 0); N.flow = flow; for (let i = 0; i < 6; i++) box(flow, 0.3 - (i % 2) * 0.1, 0.01, 0.06, '#d4fbf6', (i % 3 - 1) * 0.12, 0, -0.9 + i * 0.36, { emissive: '#d4fbf6', ei: 0.5 });
  const steam = steamPuffs(root, 'steam', 0, 0.2, 0.3, 3, 0.1); N.steam = steam;
  const rubble = pivot(root, 'rubble', 0, 0.08, 0); N.rubble = rubble; [[-0.12, -0.5], [0.1, 0.1], [-0.05, 0.6]].forEach(([x, z], i) => { const m = add(rubble, new THREE.Mesh(new THREE.DodecahedronGeometry(0.13, 0), mat(PAL.stoneDark, { flat: true })), x, 0.05, z); m.rotation.set(i, i * 2, 0); }); box(rubble, 0.56, 0.04, 1.2, '#d9eef7', 0, 0, -0.2, { rough: 0.3 });
  return { root, nodes: N, kind: 'facility', anims: {
    repaired: { dur: 1.2, frames: 6, fn(t, n) { hide(n.rubble); n.flow.position.z = t * 0.36; rise(n.steam, t, 0.6, 0.15); } },
    broken: { dur: 2, frames: 2, fn(t, n) { hide(n.water); hide(n.steam); } } } };
}
function auroraLookout() {
  const root = new THREE.Group(); root.name = 'aurora_lookout'; const N = { root }; base(root, 1.6, 1.4);
  rbox(root, 1.6, 0.5, 1.4, PAL.stone, 0, 0.37, 0, 0.06, { flat: true }); rbox(root, 1.7, 0.08, 1.5, PAL.woodLight, 0, 0.66, 0, 0.02);
  for (let i = 0; i < 4; i++) rbox(root, 0.6, 0.1, 0.3, PAL.stoneDark, 0, 0.1 + i * 0.13, 0.85 + 0.0 - i * 0.0, 0.03).position.set(0.4, 0.06 + i * 0.13, 0.85 - i * 0.08);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => { cyl(root, 0.04, 0.04, 0.5, PAL.woodDark, x * 0.78, 0.95, z * 0.68, 6); ball(root, 0.06, PAL.snow, x * 0.78, 1.22, z * 0.68, 6); });
  [-1, 1].forEach(s => { const r = cyl(root, 0.025, 0.025, 1.56, PAL.wood, 0, 1.1, s * 0.68, 6); r.rotation.z = Math.PI / 2; });
  const scope = pivot(root, 'telescope', -0.2, 0.7, -0.1); N.scope = scope; [-0.15, 0, 0.15].forEach((x, i) => { const l = cyl(scope, 0.02, 0.02, 0.6, PAL.woodDark, x, 0.25, (i - 1) * 0.1, 5); l.rotation.z = x * 1.5; });
  const tube = pivot(scope, 'tube', 0, 0.55, 0); N.tube = tube; tube.rotation.x = -0.6; cyl(tube, 0.06, 0.09, 0.6, '#c9a24a', 0, 0, 0.1, 10, { metal: 0.6, rough: 0.35 }).rotation.x = Math.PI / 2;
  const rope = pivot(root, 'rope', 0.4, 0.7, 1.0); N.rope = rope; const rp = cyl(rope, 0.02, 0.02, 0.7, PAL.heroScarf, 0, 0.25, 0, 5); rp.rotation.z = Math.PI / 2;
  const sky = pivot(root, 'aurora', 0, 2.1, -0.5); N.sky = sky;
  [PAL.auroraG, PAL.auroraB, PAL.auroraV].forEach((c, k) => { const band = pivot(sky, 'band' + k, 0, k * 0.28, -k * 0.2); for (let i = 0; i < 9; i++) rbox(band, 0.22, 0.5 - Math.abs(i - 4) * 0.05, 0.02, c, -0.9 + i * 0.22, S(i * 0.9 + k) * 0.18, 0, 0.01, { opacity: 0.55, emissive: c, ei: 1.2, name: 'aurora' + k }); });
  for (let i = 0; i < 7; i++) ball(sky, 0.025, '#fffbe6', -1.0 + i * 0.33, 0.85 + (i % 3) * 0.12, -0.3, 6, { emissive: '#fffbe6', ei: 2 });
  return { root, nodes: N, kind: 'facility', anims: {
    repaired: { dur: 4, frames: 8, fn(t, n) { hide(n.rope); n.sky.children.slice(0, 3).forEach((band, k) => band.children.forEach((s, i) => { s.position.y = S(i * 0.9 + k) * 0.18 + S(t * TAU + i * 0.7 + k) * 0.08; s.scale.y = 1 + S(t * TAU * 2 + i) * 0.15; })); n.tube.rotation.y = S(t * TAU) * 0.3; } },
    broken: { dur: 2, frames: 2, fn(t, n) { hide(n.sky); } } } };
}

/* ------------------------------------------------------------------ 2026-10-09 Korean history set */
const jige = (N) => { // 지게 A-frame with a bundle of firewood
  const j = pivot(N.torso, 'jige', 0, 0.2, -0.19); [-1, 1].forEach(sx => { const p = cyl(j, 0.022, 0.026, 0.95, PAL.woodLight, sx * 0.12, 0.16, 0, 6); p.rotation.z = -sx * 0.1; });
  [0.0, 0.32].forEach(y => { const r = cyl(j, 0.016, 0.016, 0.28, PAL.wood, 0, y, 0, 5); r.rotation.z = Math.PI / 2; });
  for (let i = 0; i < 3; i++) { const l = cyl(j, 0.045, 0.045, 0.34, PAL.log, -0.08 + i * 0.08, 0.46, -0.05, 7); l.rotation.z = Math.PI / 2; l.rotation.y = 0.2 * (i - 1); }
};
const dorongi = (N, o) => { const c = pivot(N.torso, 'dorongi', 0, 0.56, -0.05); N.cape = c; for (let i = 0; i < 7; i++) { const a = (i / 6 - 0.5) * 2.4, st = box(c, 0.1, 0.62, 0.03, i % 2 ? '#c9a45c' : '#b8914a', Math.sin(a) * 0.27, -0.3, -Math.cos(a) * 0.18 + 0.02); st.rotation.y = a; st.rotation.x = 0.12; } }; // 도롱이 straw raincoat
const backpack = (N) => { rbox(N.torso, 0.32, 0.36, 0.14, '#e2583e', 0, 0.26, -0.2, 0.06); rbox(N.torso, 0.24, 0.13, 0.04, '#c2402c', 0, 0.15, -0.28, 0.03); [-1, 1].forEach(sx => box(N.torso, 0.04, 0.38, 0.03, '#2b2f36', sx * 0.11, 0.27, FZ)); rbox(N.torso, 0.2, 0.26, 0.04, '#7a4a24', 0.0, 0.33, -0.3, 0.02); }; // red school backpack + the history book
const bojagi = (N) => { const b = ball(N.handL, 0.12, '#5aa0b8', 0, -0.08, 0.06, 10); b.scale.set(1, 0.8, 1); ball(N.handL, 0.04, '#5aa0b8', 0, 0.02, 0.06, 6); }; // 보자기 bundle
const peddler = (N) => { rbox(N.torso, 0.42, 0.34, 0.22, '#a8683a', 0, 0.3, -0.3, 0.06); cyl(N.torso, 0.012, 0.012, 0.6, '#8a6a44', 0, 0.36, -0.15, 4).rotation.z = 0.8; }; // 보부상 등짐
/* Researched hero gear (2026-10-09):
   - 이순신: 두정갑 = knee-length red cloth coat with round brass studs, opened at the front; 간주형 투구 with a
     front visor, a trident finial over a red 상모 tassel, and studded 드림 flaps covering ears and neck.
   - 광개토대왕 / 고구려 군사: 종장판주 helmet of vertical iron plates, a tube finial carrying feathers, cheek guards
     and a neck guard; lamellar 찰갑 over body, arms and thighs; horse in 마면갑 face armour and lamellar 마갑.
   - 임꺽정: 16th-century commoner - hemp 저고리·바지, 행전 leggings, 짚신, 상투 with 망건, full beard. */
const studs = (p, w, h, rows, cols, x, y, z, c = '#d9b25a') => { for (let r = 0; r < rows; r++) for (let i = 0; i < cols; i++) ball(p, 0.012, c, x - w / 2 + (i + 0.5) * w / cols, y - r * h / rows, z, 6, { metal: 0.7, rough: 0.3 }); };
const dujeonggap = (N, o) => {
  const t = N.torso, red = o.coat;
  lathe(t, [[0.19, 0.12], [0.205, 0.0], [0.24, -0.25], [0.27, -0.5], [0.0, -0.5]], red, 0, 0, 0, 0.84);                       // long studded skirt to the knee
  box(t, 0.025, 0.95, 0.02, '#1d2a52', 0, -0.05, FZ + 0.02);                                                                     // front opening (blue lining)
  studs(t, 0.3, 0.36, 5, 6, 0, 0.44, FZ + 0.012); [-1, 1].forEach(sx => studs(t, 0.16, 0.42, 5, 3, sx * 0.13, -0.06, 0.2));    // brass studs on chest and skirt
  cyl(t, 0.18, 0.18, 0.05, '#2c4f9e', 0, 0.08, 0, 18).scale.z = 0.76;                                                            // blue 전대 sash
  [-1, 1].forEach(sx => { const g = lathe(N['arm' + (sx < 0 ? 'L' : 'R')], [[0.0, 0.05], [0.09, 0.05], [0.1, -0.12], [0.0, -0.12]], red, 0, 0, 0, 0.9); studs(N['arm' + (sx < 0 ? 'L' : 'R')], 0.08, 0.1, 2, 2, 0, -0.02, 0.09); }); // short studded sleeves
};
const lamellar = (c, trim) => (N, o) => {
  const t = N.torso; for (let r = 0; r < 6; r++) { const b = cyl(t, 0.195 - (r === 0 ? 0.02 : 0), 0.19, 0.06, r % 2 ? artShadeHex(c, 0.82) : c, 0, 0.44 - r * 0.075, 0, 20, { metal: 0.45, rough: 0.5 }); b.scale.z = 0.76;
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; box(t, 0.006, 0.06, 0.006, '#3a2a20', Math.sin(a) * 0.196, 0.44 - r * 0.075, Math.cos(a) * 0.196 * 0.76); } } // rows of small plates laced together
  for (let r = 0; r < 4; r++) { const b = cyl(t, 0.21 + r * 0.02, 0.23 + r * 0.02, 0.1, r % 2 ? artShadeHex(c, 0.82) : c, 0, -0.04 - r * 0.1, 0, 20, { metal: 0.45, rough: 0.5 }); b.scale.z = 0.8; }  // lamellar skirt
  [-1, 1].forEach(sx => { const arm = N['arm' + (sx < 0 ? 'L' : 'R')]; for (let r = 0; r < 3; r++) cyl(arm, 0.075 - r * 0.004, 0.075 - r * 0.004, 0.08, r % 2 ? artShadeHex(c, 0.82) : c, 0, -0.04 - r * 0.09, 0, 12, { metal: 0.45, rough: 0.5 }); });
  if (trim) { cyl(t, 0.2, 0.2, 0.03, trim, 0, 0.06, 0, 18, { metal: 0.6, rough: 0.35 }).scale.z = 0.78; cyl(t, 0.14, 0.2, 0.04, trim, 0, 0.49, 0, 18, { metal: 0.6, rough: 0.35 }).scale.z = 0.78; }
};
const furVest = (N) => { const v = pivot(N.torso, 'cape', 0, 0.3, 0); N.cape = v; lathe(v, [[0.0, 0.2], [0.17, 0.2], [0.215, 0.05], [0.22, -0.18], [0.24, -0.34], [0.0, -0.34]], '#6d4a2c', 0, 0, 0, 0.8, { rough: 1 }); box(v, 0.1, 0.5, 0.03, '#8e6a44', 0, -0.06, FZ + 0.03); }; // 털배자 (open front shows the 저고리)
const haengjeon = (N) => [-1, 1].forEach(sx => { const l = N['leg' + (sx < 0 ? 'L' : 'R')]; cyl(l, 0.075, 0.07, 0.22, '#e9e4d6', 0, -0.45, 0, 12); }); // 행전 leggings
const armor = (c) => (N) => { for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) rbox(N.torso, 0.085, 0.07, 0.02, r % 2 ? artShadeHex(c, 0.8) : c, -0.21 + i * 0.085, 0.42 - r * 0.1, 0.175, 0.01, { metal: 0.4, rough: 0.5 }); }; // 찰갑 scales
const general = dujeonggap; const generalOld = (N) => { armor('#a8432f')(N); const c = pivot(N.torso, 'cape', 0, 0.5, -0.18); N.cape = c; rbox(c, 0.56, 0.7, 0.03, '#2c3e9e', 0, -0.34, 0, 0.02); [-1, 1].forEach(sx => rbox(N.torso, 0.16, 0.08, 0.2, PAL.gold, sx * 0.3, 0.5, 0, 0.03, { metal: 0.6, rough: 0.3 })); }; // 이순신: 두정갑 + 망토
function horse(N0) { // 광개토대왕's war horse, rider rides on it
  const o = { len: 1.6, wid: 0.56, hip: 0.86, bodyH: 0.62, legW: 0.16, headW: 0.42, snout: 0.44, fur: '#6b4128', belly: '#5a3622', muzzle: '#5a3622', legC: '#4a2c1c', paw: '#2b211c', tailR: 0.12, tailC: '#2b211c', earCone: 1, scale: 1, walkDur: 0.6, happy: 0 };
  const N = quadruped('horse', o); N.head.rotation.x = -0.35; N.head.position.y += 0.18;
  rbox(N.body, 0.64, 0.06, 0.5, '#c8382c', 0, 0.86 + 0.62 * 0.95, 0, 0.02); rbox(N.body, 0.5, 0.1, 0.4, '#7a4a24', 0, 0.86 + 0.62 * 1.0, 0, 0.04);  // saddle cloth + saddle
  for (let i = 0; i < 4; i++) rbox(N.head, 0.05, 0.2, 0.06, '#2b211c', 0, 0.15 - i * 0.02, -0.05 - i * 0.08, 0.02);                             // mane
  if (N0 !== false) { const H = 0.86, B = 0.62, L = 1.6;
    for (let r = 0; r < 3; r++) { const band = rbox(N.body, 0.6 + r * 0.02, 0.14, L * 0.92, r % 2 ? '#5a5f66' : '#4b4f56', 0, H + B * (0.62 - r * 0.24), 0, 0.06, { metal: 0.45, rough: 0.5 });
      for (let i = 0; i < 12; i++) [-1, 1].forEach(sx => box(N.body, 0.006, 0.12, 0.006, '#2b211c', sx * (0.31 + r * 0.01), H + B * (0.62 - r * 0.24), -L * 0.44 + i * L * 0.08)); } // lamellar 마갑 (legs left free)
    const face = rbox(N.head, 0.2, 0.2, 0.46, '#8d98a3', 0, 0.02, 0.2, 0.05, { metal: 0.65, rough: 0.35 });                        // 마면갑 face plate
    [-1, 1].forEach(sx => { torus(N.head, 0.04, 0.012, '#d9b25a', sx * 0.1, 0.07, 0.12, TAU, { metal: 0.7, rough: 0.3 }).rotation.y = Math.PI / 2; ball(N.head, 0.03, '#1d1a18', sx * 0.105, 0.07, 0.12, 6); });
    cone(N.head, 0.03, 0.14, '#c8382c', 0, 0.22, 0.05, 6); }
  return N;
}
function riderKing() { // 광개토대왕 on horseback
  const H = horse(); const root = H.root; root.name = 'gwanggaeto';
  const P = humanoid({ name: 'king', coat: '#8a2f2a', pants: '#8a2f2a', pantsW: 0.2, hat: hats.jongjang, hatColor: '#4b4f56', trim: PAL.gold, plume: '#c8382c', hair: '#1d1a18', beard: 2, mitten: PAL.skin, boots: '#3a2a20', extra: lamellar('#4b4f56', PAL.gold) });
  const seat = pivot(H.body, 'seat', 0, 0.86 + 0.62 * 0.98, -0.05); seat.add(P.root); P.root.scale.setScalar(0.85); P.root.position.y = -0.47;
  P.legL.rotation.x = -1.2; P.legR.rotation.x = -1.2; P.legL.rotation.z = 0.5; P.legR.rotation.z = -0.5;
  const t = tools.spear(P.handR); t.scale.set(1.2, 1.9, 1.2); P.armR.rotation.x = -0.4;                       // 삭: very long cavalry lance
  const flag = pivot(t, 'flag', 0, 0.86, 0.04); rbox(flag, 0.012, 0.12, 0.22, '#c8382c', 0, 0, 0.11, 0.005);
  const anims = {
    idle: { dur: 2, frames: 6, fn(t, n) { const a = S(t * TAU); n.head.rotation.x = -0.35 + a * 0.06; n.tail.rotation.y = a * 0.2; n.rider.torso.rotation.x = a * 0.02; } },
    walk: { dur: 0.6, frames: 8, fn(t, n) { const a = S(t * TAU); n.legFL.rotation.x = a * 0.7; n.legBR.rotation.x = a * 0.7; n.legFR.rotation.x = -a * 0.7; n.legBL.rotation.x = -a * 0.7; n.body.position.y = Math.abs(C(t * TAU)) * 0.05; n.head.rotation.x = -0.35 + a * 0.1; n.rider.torso.rotation.x = 0.05 + a * 0.04; } },
    work: { dur: 0.9, frames: 8, fn(t, n) { const d = S(Math.min(1, t * 1.6) * Math.PI); n.body.rotation.x = -d * 0.35; n.legFL.rotation.x = -d * 1.2; n.legFR.rotation.x = -d * 1.0; n.rider.armR.rotation.x = -0.4 - d * 1.4; n.rider.torso.rotation.x = d * 0.15; } },
    cheer: { dur: 1.0, frames: 8, fn(t, n) { const j = Math.abs(S(t * TAU)); n.body.rotation.x = -j * 0.45; n.legFL.rotation.x = -j * 1.3; n.legFR.rotation.x = -j * 1.1; n.rider.armR.rotation.x = -2.6; } },
  };
  return { root, nodes: { ...H, rider: P }, anims, kind: 'actor' };
}
function turtleShip() { // 거북선 with 이순신 on the deck
  const root = new THREE.Group(); root.name = 'turtle_ship'; const body = pivot(root, 'body', 0, 0, 0); const N = { root, body };
  const hull = rbox(body, 1.2, 0.42, 2.6, '#7a4a24', 0, 0.3, 0, 0.18); rbox(body, 1.24, 0.08, 2.64, '#5f3a1a', 0, 0.5, 0, 0.03);
  for (let i = 0; i < 6; i++) [-1, 1].forEach(sx => { const o = pivot(body, 'oar' + i + (sx < 0 ? 'L' : 'R'), sx * 0.62, 0.32, -0.9 + i * 0.36); N[o.name] = o; const p = cyl(o, 0.02, 0.025, 0.7, PAL.woodDark, sx * 0.3, -0.12, 0, 5); p.rotation.z = sx * 1.1; });
  const shell = ball(body, 0.62, '#3f5a3a', 0, 0.55, 0, 14); shell.scale.set(0.95, 0.55, 2.0);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) { const a = (r / 3 - 0.5) * 1.6, z = -1.0 + i * 0.4; cone(body, 0.035, 0.12, '#d9dee4', Math.sin(a) * 0.5, 0.55 + Math.cos(a) * 0.3, z, 4, { metal: 0.6, rough: 0.3 }); }
  for (let i = 0; i < 4; i++) { const h = ball(body, 0.12, '#c9a24a', 0, 0.82, -0.75 + i * 0.5, 6); h.scale.set(1, 0.4, 1); }
  const head = pivot(body, 'dragon', 0, 0.62, 1.32); N.dragon = head; rbox(head, 0.34, 0.3, 0.42, '#3f5a3a', 0, 0.06, 0.12, 0.1); [-1, 1].forEach(sx => { ball(head, 0.04, PAL.gold, sx * 0.1, 0.16, 0.28, 6, { emissive: PAL.gold, ei: 0.6 }); cone(head, 0.04, 0.16, '#d9dee4', sx * 0.1, 0.28, 0.06, 5); });
  rbox(head, 0.26, 0.06, 0.12, '#c8382c', 0, -0.04, 0.34, 0.02);
  const smoke = pivot(head, 'smoke', 0, 0.02, 0.42); N.smoke = smoke; for (let i = 0; i < 3; i++) ball(smoke, 0.1, '#e2e6ea', 0, 0, 0, 8, SMOKE);
  const mast = cyl(body, 0.035, 0.04, 1.6, PAL.woodDark, 0, 1.3, -0.3, 6); const sail = pivot(body, 'sail', 0, 1.35, -0.3); N.sail = sail; rbox(sail, 0.03, 0.9, 0.8, '#c8382c', 0, 0, 0.0, 0.02); for (let i = 0; i < 4; i++) box(sail, 0.04, 0.02, 0.82, '#8e2a22', 0, -0.36 + i * 0.24, 0);
  const Y = humanoid({ name: 'yi', coat: '#a8322a', pants: '#2b2f36', pantsW: 0.2, hat: hats.gangju, drim: '#a8322a', hair: '#1d1a18', beard: 2, mitten: PAL.skin, boots: '#2b211c', extra: dujeonggap });
  Y.root.scale.setScalar(0.62); Y.root.position.set(0, 0.86, 0.8); body.add(Y.root); tools.sword(Y.handR); Y.armR.rotation.x = -1.2; N.yi = Y;
  const oars = Object.keys(N).filter(k => k.startsWith('oar')).map(k => N[k]);
  return { root, nodes: N, kind: 'actor', anims: {
    idle: { dur: 2.4, frames: 6, fn(t, n) { const a = S(t * TAU); n.body.rotation.z = a * 0.025; n.body.position.y = a * 0.02; n.sail.rotation.y = a * 0.08; rise(n.smoke, t, 0.6, 0.08); } },
    walk: { dur: 1.0, frames: 8, fn(t, n) { const a = S(t * TAU); oars.forEach((o, i) => { o.rotation.x = S(t * TAU + (i % 6) * 0.2) * 0.5; }); n.body.position.y = Math.abs(a) * 0.03; n.sail.rotation.y = 0.1 + a * 0.06; rise(n.smoke, t, 0.6, 0.08); } },
    work: { dur: 0.8, frames: 8, fn(t, n) { const d = S(Math.min(1, t * 1.5) * Math.PI); n.dragon.rotation.x = -d * 0.3; n.smoke.scale.setScalar(1 + d * 2.5); rise(n.smoke, t, 0.4 + d * 0.8, 0.15); n.yi.armR.rotation.x = -1.2 - d * 1.4; n.body.rotation.x = d * 0.04; } },
    cheer: { dur: 1.0, frames: 8, fn(t, n) { n.yi.armR.rotation.x = -2.8; n.sail.rotation.y = S(t * TAU) * 0.15; rise(n.smoke, t, 0.6, 0.08); } } } };
}

export const MODELS = {
  // characters (sprites: idle/walk/work/cheer)
  // 2026-10-09 Korean history set: a 2026 Korean boy and the people of Joseon / Goguryeo
  hero: character('hero', { coat: '#2b3e66', puffer: 1, pants: '#3a5a8a', boots: '#f4f4f2', scarf: PAL.heroScarf, hat: hats.none, hairdo: 'short', hair: '#1d1a18', mitten: PAL.skin, extra: backpack, toolOnlyAtWork: 1, animKind: 'spear' }, 'mokgeom'),
  lumberjack: character('lumberjack', { coat: '#8a7a5a', pants: '#d8cfba', daenim: '#6d4126', hanbok: 1, mitten: PAL.skin, boots: '#c9a45c', pantsW: 0.2, hat: hats.headband, hairdo: 'topknot', hair: '#1d1a18', goreum: '#6d4126', extra: jige }, 'axe'),
  fisher: character('fisher', { coat: '#5d7e8f', pants: '#e9e4d6', daenim: '#2f5f7a', hanbok: 1, mitten: PAL.skin, boots: '#c9a45c', pantsW: 0.2, hat: hats.satgat, hair: '#1d1a18', goreum: '#2f5f7a' }, 'rod'),
  miner: character('miner', { coat: '#7a5233', pants: '#cfc4ab', daenim: '#4b3b2d', hanbok: 1, mitten: PAL.skin, boots: '#c9a45c', pantsW: 0.2, hat: hats.dugeon, hatColor: '#6d4126', hairdo: 'topknot', hair: '#1d1a18', apron: '#4b3b2d', goreum: '#d39a2a' }, 'pick'),
  hunter: character('hunter', { coat: '#3d6a4a', robe: '#3d6a4a', pants: '#e2dccb', hanbok: 1, mitten: PAL.skin, boots: '#c9a45c', pantsW: 0.2, hat: hats.jeollip, hatColor: '#c8382c', hair: '#1d1a18', goreum: '#c8382c', extra: quiver, scarf: null }, 'bow'),
  hunter_blue: character('hunter_blue', { coat: '#2c4f7c', robe: '#2c4f7c', pants: '#e2dccb', hanbok: 1, mitten: PAL.skin, boots: '#c9a45c', pantsW: 0.2, hat: hats.jeollip, hatColor: '#2c6fa5', hair: '#1d1a18', goreum: '#f2c14e', extra: quiver }, 'bow'),
  hunter_violet: character('hunter_violet', { coat: '#8a2f2a', pants: '#3a2a20', hanbok: 0, mitten: PAL.skin, boots: '#c9a45c', pantsW: 0.2, boots: '#3a2a20', hat: hats.jongjang, hatColor: '#6d7680', plume: '#f4f1ea', hair: '#1d1a18', goreum: PAL.gold, extra: (N, o) => { lamellar('#6d7680')(N, o); quiver(N, o); } }, 'bow'),
  shopkeeper: character('shopkeeper', { coat: '#f2c14e', skirt: '#c8382c', hanbok: 1, mitten: PAL.skin, boots: '#f4f1ea', hat: hats.none, hairdo: 'bun', hair: '#1d1a18', apron: '#f7f4ec', goreum: '#c8382c' }),
  villager: character('villager', { coat: '#a89474', pants: '#e2dccb', daenim: '#6d4126', hanbok: 1, mitten: PAL.skin, boots: '#c9a45c', pantsW: 0.2, hat: hats.paeraengi, flower: '#f4f1ea', hair: '#1d1a18', goreum: '#6d4126', extra: peddler }),
  corgi, polar_bear: bear('polar_bear', false), boss_bear: bear('boss_bear', true), fish: fishModel,
  // nature props
  pine: pine('pine', 1), pine_small: pine('pine_small', 0.65), stump, rock: rock('rock'), ore_rock: rock('ore_rock', PAL.ore), log_pile: logPile, golden_chest: chest,
  // facilities
  cabin, shop_wood: shop('wood'), shop_fish: shop('fish'), watchtower: tower, storage: crates, sawmill, smokehouse, smelter, power_plant: generator, fence_segment: fence, truck,
  // 2026-10 set — people missing from the 3D library
  customer: withAnims(character('customer', { coat: '#e8efe9', robe: '#e8efe9', pants: '#f4f1ea', hanbok: 1, mitten: PAL.skin, boots: '#c9a45c', pantsW: 0.2, boots: '#2b2f36', hat: hats.gat, hairdo: 'topknot', beard: 1, hair: '#1d1a18', goreum: '#4f9a6a', extra: bojagi }), { happy }),
  shop_staff: withAnims(character('shop_staff', { coat: '#e78537', pants: '#e9e4d6', daenim: '#6d4126', hanbok: 1, mitten: PAL.skin, boots: '#c9a45c', pantsW: 0.2, hat: hats.none, hairdo: 'braid', hair: '#1d1a18', apron: '#f4e1b0', goreum: '#c8382c' }), { work: serve }),
  master_lumber: master('master_lumber', { coat: '#5a4a3a', pants: '#d8cfba', daenim: '#8e2a22', hanbok: 1, mitten: PAL.skin, boots: '#c9a45c', pantsW: 0.2, hat: hats.headband, hatColor: '#c8382c', hairdo: 'topknot', beard: 1, hair: '#1d1a18', goreum: PAL.gold, extra: masterCape('#8e2a22') }, 'rainbowAxe', 'axe'),
  master_fisher: master('master_fisher', { coat: '#2f5f7a', pants: '#e9e4d6', daenim: '#2c3e9e', hanbok: 1, mitten: PAL.skin, boots: '#c9a45c', pantsW: 0.2, hat: hats.satgat, hatColor: '#e0c07a', hair: '#1d1a18', goreum: PAL.gold, extra: dorongi }, 'rainbowRod', 'rod'),
  // 2026-10 set — machines (game: drawExcavator / drawHarvester / drawFishRig)
  excavator, harvester, fish_rig: fishRig,
  // 2026-10 set — market / village extras
  workshop, warehouse, market_stall: marketStall, notice_board: noticeBoard,
  // 2026-10 set — aurora hot-spring village (village 4, design only)
  aurora_keeper: character('aurora_keeper', { coat: PAL.keeper, pants: '#e9e4d6', hanbok: 1, mitten: PAL.skin, boots: '#c9a45c', pantsW: 0.2, hat: hats.dugeon, hatColor: '#f2efe6', hairdo: 'topknot', hair: '#1d1a18', apron: '#e9e1cf', goreum: '#f58a3c', extra: keeperExtra, animKind: 'pick' }, 'ladle'),
  hot_spring: hotSpring, boiler, lodge, canal_segment: canalSegment, aurora_lookout: auroraLookout,
  // 2026-10-09 heroes: 임꺽정 (forest), 이순신 + 거북선 (lake), 광개토대왕 on horseback (mine)
  imkkeokjeong: master('imkkeokjeong', { coat: '#a49a84', pants: '#b9ae96', hanbok: 1, collar: '#d8cfba', goreum: '#6d4126', band: '#5a4a3a', mitten: PAL.skin, boots: '#c9a45c', pantsW: 0.22, hat: hats.none, hairdo: 'topknot', beard: 2, hair: '#1d1a18', extra: (N, o) => { furVest(N, o); haengjeon(N, o); } }, 'club', 'axe'),
  yi_sunsin: character('yi_sunsin', { coat: '#a8322a', pants: '#2b2f36', pantsW: 0.2, mitten: PAL.skin, boots: '#2b211c', hat: hats.gangju, drim: '#a8322a', hair: '#1d1a18', beard: 2, extra: dujeonggap, animKind: 'axe' }, 'sword'),
  turtle_ship: turtleShip, gwanggaeto: riderKing,
};

// Runtime body variants retain Claude's model/cape/leg motion; game arms grip
// the enlarged axe or exact full-lake net. Originals remain unchanged.
for (const name of ['master_lumber','master_fisher']) {
 MODELS[name+'_body'] = () => { const m=MODELS[name]();m.nodes.armL.scale.setScalar(0.0001);m.nodes.armR.scale.setScalar(0.0001);return m; };
}
