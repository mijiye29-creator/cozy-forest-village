// Shrinks the exported .glb files: dedup materials/accessors, weld, join static sibling meshes, quantize.
// KHR_mesh_quantization is read natively by three.js GLTFLoader (no decoder needed).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, join, quantize, prune, flatten } from '@gltf-transform/functions';
import fs from 'node:fs'; import path from 'node:path';
const dir = process.argv[2], only = process.argv.slice(3); const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.glb') && (!only.length || only.includes(f.slice(0, -4))))) {
  const p = path.join(dir, f), before = fs.statSync(p).size, doc = await io.read(p);
  await doc.transform(dedup(), weld(), join({ keepNamed: true }), quantize(), prune());
  await io.write(p, doc); console.log(f.padEnd(20), (before / 1024 | 0) + 'KB ->', (fs.statSync(p).size / 1024 | 0) + 'KB');
}
