const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {build}=require('../scripts/build-game.cjs');
const r=build(true),game=path.resolve(__dirname,'../game');
assert.equal(r.index.modules.length,r.manifest.modules.length+1);
assert.equal(new Set(r.index.modules.map(m=>m.id)).size,r.index.modules.length);
const sourceMap=JSON.parse(r.outputs['runtime.js.map']);assert.deepEqual(sourceMap.sources,r.index.modules.map(m=>m.path));assert(sourceMap.mappings.length>0);
const html=r.outputs['index.html'];assert(!html.includes('<script>'));assert(!html.includes('<style>'));assert(html.indexOf('intro-scenes.js')<html.indexOf('runtime.js?v='));
assert(r.raw.includes("var KEY='cozy-village-v6'"));assert(r.raw.includes('var SAVE_VER=11;'));
// All runtime references remain inside the original closure, not browser globals.
assert.equal((r.raw.match(/\(function\(\)\{\n"use strict";/g)||[]).length,1);
new vm.Script(fs.readFileSync(path.join(game,'runtime.js'),'utf8'));
console.log('PASS: source/bundle consistency; module syntax/order; source map; single runtime closure; stable save key/version; cache versions.');

assert(html.includes('intro-scenes.js?v='+require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(game,'intro-scenes.js'))).digest('hex').slice(0,12)),'Story metadata must invalidate stale video/image URLs');
