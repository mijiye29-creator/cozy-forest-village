const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const html=require('./runtime-source.cjs').readRuntime('agents','tutorial');
const block=html.slice(html.indexOf('var TUT=['),html.length);
const e={S:{tut:2,cash:{wood:0}},agents:[{role:'player',bag:{}}],stock:0,saves:0,cap:()=>6,bagN:a=>Object.values(a.bag).reduce((a,b)=>a+b,0),lineStock:()=>e.stock,save:()=>e.saves++,HOME:{x:100,y:400},screenUnit:1,camX:0,camY:0,Z:1,W:390,SH:500};
vm.createContext(e);vm.runInContext(block,e);
assert.equal(e.TUT[2].done(),false,'Lost bag must not count as delivery');
assert.equal(e.tutNoGather(),false,'Damaged tutorial must permit recollection');
e.tutRecoverDelivery();assert.equal(e.S.tut,1);assert.equal(e.saves,1);
e.S.tut=3;e.tutRecoverDelivery();assert.equal(e.S.tut,1,'Previously stuck saves must recover');
for(const evidence of ['stock','cash','h4','flag']){e.stock=0;e.S={tut:3,cash:{wood:0}};if(evidence==='stock')e.stock=2;if(evidence==='cash')e.S.cash.wood=50;if(evidence==='h4')e.S.h4=1;if(evidence==='flag')e.S.tutDelivered=true;e.tutRecoverDelivery();assert.equal(e.S.tut,3,'Valid delivery progress must stay intact');}
e.S={tut:2,cash:{wood:0}};e.stock=0;e.agents[0].bag={oak:6};e.ITEMS={oak:{line:'wood'}};e.STALL={wood:{x:60,y:50}};e.stallCap=()=>100;e.addSs=(_,id,n)=>e.stock+=n;e.addFloat=()=>{};e.sfx=()=>{};
vm.runInContext(html.slice(html.indexOf('function dropAt('),html.indexOf('var DROP_TILE=')),e);
assert.equal(e.TUT[2].done(),false);assert.equal(e.dropAt(e.agents[0],'wood'),6);assert.equal(e.S.tutDelivered,true);assert.equal(e.TUT[2].done(),true);
e.S=JSON.parse(JSON.stringify(e.S));e.agents[0].bag={};e.stock=0;assert.equal(e.TUT[2].done(),true,'Sold inventory may disappear but saved delivery proof persists');
assert.equal(e.tutorialEdgePoint({x:100,y:100}),null);for(const p of [{x:-500,y:100},{x:900,y:100},{x:100,y:-500},{x:100,y:900}]){const out=e.tutorialEdgePoint(p);assert(out.x>=24&&out.x<=366);assert(out.y>=24&&out.y<=476);}
console.log('PASS: lost-bag reload; stuck legacy save recovery; actual delivery requirement/persistence; existing stock/cash/collection progress; offscreen tutorial target bounds.');

