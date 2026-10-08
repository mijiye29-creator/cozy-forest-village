// Dependency-free regression checks of the actual inline mobile runtime functions.
// Run: node tests/mobile-runtime.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../game/index.html'), 'utf8');
const script = source.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
function section(start, end) {
  const a = script.indexOf(start), b = script.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `Missing source region: ${start}`);
  return script.slice(a, b);
}
const hero = {x:90,y:300,path:[],padDwell:0};
let bounds = {left:0,top:0,width:390,height:844}, taps = [], cancellations = 0;
const handlers = {};
const env = {
  W:540, HT:664, H:600, SH:664, DPR:2, screenUnit:1, WORLD_TOP:0,
  Z:2.6, ZOOM_IN:2.6, camX:0, camY:0, S:{zoomOut:false},
  stageEl:{getBoundingClientRect:()=>bounds},cwrap:{style:{}},
  cv:{getBoundingClientRect:()=>bounds,hasPointerCapture:()=>true,
    releasePointerCapture:()=>cancellations++, addEventListener:(k,fn)=>handlers[k]=fn},
  ctx:{setTransform(){}}, agents:[hero], fenceX:()=>180,
  joy:{on:false},repairFenceAt:()=>false, performance:{now:()=>1000},setTap:(x,y)=>taps.push([x,y]),
  window:{addEventListener(){}}, document:{hidden:false,addEventListener(){}},
  titleT:0,requestAnimationFrame(){},TITLE:false,storyBox:{hidden:true},
  frameGate:0,last:0,time:0,FDT:0,uiT:0,saveT:0,
  safe:(_name,fn)=>fn(),draw(){},refreshUI(){},save(){},update(){},
};
vm.createContext(env);
for (const pair of [
  ['function camClampX(', '/* v56: each system'],
  ['function endJoy(', "document.addEventListener('pointerdown',function(){audioInit();}"],
  ['function fit(){','var fitFrame=0;'],
  ['var TOUCHES=', 'function siteAt('],
  ["cv.addEventListener('pointermove'",'function lineClear('],
  ['function loop(now){','/* v58 (staff 7): one simulation step'],
]) vm.runInContext(section(...pair),env);
vm.runInContext(section("cv.addEventListener('pointerdown'", "cv.addEventListener('pointermove'"),env);
// Rejected pointers must return before audio, selection, or movement code runs.
env.joy={on:true,id:7};handlers.pointerdown({pointerId:8,isPrimary:true});
assert.equal(env.joy.id,7);
env.joy={on:false};
handlers.pointerdown({isPrimary:false});
handlers.pointerdown({pointerType:'mouse',button:2});
env.TITLE=true;handlers.pointerdown({isPrimary:true});env.TITLE=false;
for (const [width,height] of [[320,568],[390,844],[430,932],[360,900],[844,390],[1024,768]]) {
  bounds={left:0,top:0,width,height};env.S.zoomOut=false;env.fit();
  assert(Math.abs(env.W/width-env.SH/height)<1e-9,'Canvas must not stretch');
  const p=env.wpt({clientX:width*.3,clientY:height*.6});
  assert(Math.abs(p.x-162)<1e-9 && Math.abs(p.y-env.SH*.6)<1e-9);
  env.joy={on:true,id:7,ox:0,oy:0,dx:0,dy:0,moved:false,t0:900};
  handlers.pointermove({pointerId:8,clientX:100,clientY:100});
  assert.equal(env.joy.dx,0,'Second finger must not steer');
  handlers.pointermove({pointerId:7,clientX:8,clientY:0});assert.equal(env.joy.moved,false);
  handlers.pointermove({pointerId:7,clientX:10,clientY:0});assert.equal(env.joy.moved,true);
  env.S.zoomOut=true;env.fit();
  const left=env.camClampX(0),top=env.camClampY(0);
  assert(left<=0 && left+env.W/env.Z>=env.W-1e-9,'Overview must fit world width');
  assert(top<=0 && top+env.SH/env.Z>=env.HT-1e-9,'Overview must fit world height');
}
for (const event of ['pointercancel','lostpointercapture']) {
  taps=[];env.joy={on:true,id:7,dx:1,dy:0,ox:20,oy:20,t0:900,moved:false};
  handlers[event]({pointerId:7,type:event});assert.equal(taps.length,0);assert.equal(env.joy.on,false);
}
taps=[];env.joy={on:true,id:7,dx:0,dy:0,ox:20,oy:20,t0:900,moved:false};
handlers.pointerup({pointerId:8,type:'pointerup'});assert.equal(env.joy.on,true);
handlers.pointerup({pointerId:7,type:'pointerup'});assert.equal(taps.length,1);
hero.tap={x:10,y:10};hero.path=[1];hero.chaseBear={};hero.padDwell=1;
env.cancelControl();assert.equal(hero.tap,null);assert.equal(hero.path.length,0);assert.equal(hero.padDwell,0);
// Two real touch pointers zoom around their midpoint, then lift without generating a tap.
bounds={left:0,top:0,width:390,height:844};env.S={zoomOut:false};env.fit();env.joy={on:true,id:1,dx:0,dy:0,moved:false};env.cv.setPointerCapture=()=>{};
const event=(id,x,y)=>({pointerId:id,pointerType:'touch',clientX:x,clientY:y,preventDefault(){}});
const z0=env.Z;env.registerTouch(event(1,150,330));assert.equal(env.registerTouch(event(2,240,330)),true);assert.equal(env.joy.on,false);
env.moveTouch(event(2,285,330));assert(env.Z>z0,'Separating fingers must zoom in');
env.moveTouch(event(2,180,330));assert(env.Z<z0,'Bringing fingers together must zoom out');
assert.equal(env.zoomTarget(),env.Z,'Zoom must persist after the gesture');
taps=[];handlers.pointerup({...event(1,150,330),type:'pointerup'});handlers.pointerup({...event(2,180,330),type:'pointerup'});assert.equal(taps.length,0);assert.equal(env.PINCH,null);assert.equal(Object.keys(env.TOUCHES).length,0);
env.S={zoomOut:false};env.fit();env.registerTouch(event(1,150,330));env.registerTouch(event(2,240,330));handlers.pointercancel({...event(1,150,330),type:'pointercancel'});env.cancelControl();assert.equal(env.PINCH,null);assert.equal(Object.keys(env.TOUCHES).length,0);
// Exercise the real movement calculation: a 20 CSS-pixel drag must move equally on all phones.
const movement = section('function stepPlayerFree(', '\nfunction ');
vm.runInContext(movement,env);
Object.assign(env,{SENS_D:[40,28,18],zoneActions(){},release(){},speedOf:()=>90,walkXY:()=>true,padMsgT:0});
const distances=[];
for(const width of [320,390,430,844]){
  env.screenUnit=540/width;env.joy={on:true,dx:20*env.screenUnit,dy:0};
  const a={x:90,y:300,lockT:0,bob:0};env.stepPlayerFree(a,1/60);distances.push(a.x-90);
}
assert(distances.every(d=>Math.abs(d-distances[0])<1e-9),'Movement sensitivity differs by phone');
for(const hz of [30,60,90,120]){
  let draws=0,seconds=0;
  Object.assign(env,{last:0,frameGate:0,time:0,TITLE:false,titleT:0,storyBox:{hidden:true},
    draw:()=>draws++,update:dt=>seconds+=dt});env.document.hidden=false;
  for(let i=1;i<=hz*10;i++)env.loop(i*1000/hz);
  assert(draws<=601,`${hz}Hz draws too many frames: ${draws}`);
  assert(Math.abs(seconds-10)<.04,`${hz}Hz changes simulation speed: ${seconds}`);
}
let updates=0,draws=0;env.update=()=>updates++;env.draw=()=>draws++;
env.document.hidden=true;env.loop(20000);assert.equal(updates,0);assert.equal(draws,0);
env.document.hidden=false;env.storyBox.hidden=false;env.time=42;env.titleT=0;
for(let i=1;i<=120;i++)env.loop(20000+i*1000/120);
assert.equal(updates,0);assert.equal(env.time,42);assert(draws<=3,'Story background should render at low frequency');
// Exercise the real layout against all reserved facilities and future belt routes.
const layout = {S:{stage:1},fenceX:()=>layout.STAGE_W[layout.S.stage-1]};
vm.createContext(layout);
vm.runInContext(script.match(/var GC=.*?;/)[0],layout);
vm.runInContext(script.match(/var STAGE_W=.*?;/)[0],layout);
vm.runInContext(section('function worldX(', 'var cv='),layout);
assert.equal(layout.H,600,'World height must remain unchanged');
assert(layout.W>540,'Additional room must be horizontal');
vm.runInContext(section('var SZ=', '/* tile grid:'),layout);
vm.runInContext(script.match(/var STALL=.*?;/)[0],layout);
vm.runInContext("var LINES=['wood','fish'];",layout);
vm.runInContext(section('var BPATH=', 'function beltOn('),layout);
vm.runInContext(section('var PLOTS=', '/* each factory:'),layout);
vm.runInContext(section('var PADLIST=[];', 'function padPos('),layout);
// Resource art must have a clear buffer from the outer fence, and upgrades stay nearby.
assert(layout.SITE.f1.x>=40,'Forest must leave room between trees and the left fence');
assert(layout.SITE.m1.x+layout.SITE.m1.w<=layout.W-40,'Mine must leave room by the right fence');
for(const [id,site] of [['site_f1','f1'],['hire_lumber','f1'],['site_p1','p1'],['hire_fisher','p1'],['site_m1','m1'],['hire_miner','m1']]){
  const pad=layout.PAD_LAYOUT[id],facility=layout.SITE[site];
  const distance=Math.hypot(Math.max(facility.x-pad.x,0,pad.x-facility.x-facility.w),Math.max(facility.y-pad.y,0,pad.y-facility.y-facility.h));
  assert(distance<=60,`${id} must stay beside its own facility`);
}
for(const [id,def] of [['mill','mill'],['smoke','smoke'],['smelt','smelt'],['elec','elec']]){
  const facility=layout.PLOTS.find(p=>p.def===def),pad=layout.PAD_LAYOUT[id];
  const distance=facility.y-(pad.y+layout.PAD_H/2);
  assert(distance>=16 && distance<=72,'Workshop pads need a clear space immediately above the facility');
  assert(pad.x>=facility.x&&pad.x<=facility.x+facility.w,'Workshop upgrade must sit above its own facility');
}
vm.runInContext(section('var TUT=[', 'var TUTPAD='),layout);
vm.runInContext(section('function dropPt(', 'var LANE='),layout);
assert.equal(layout.TUT[2].at().x,layout.dropPt('wood').x,'Tutorial must lead to the relocated delivery point');
assert.equal(layout.TUT[2].at().y,layout.dropPt('wood').y);
assert.equal(layout.BPATH.sale_f1[0][0],layout.SITE.f1.x+layout.SITE.f1.w,'Wood belt must connect to the edge of the expanded forest');
assert.deepEqual(Array.from(layout.BPATH.sale_f1[0]),Array.from(layout.BPATH.proc_f1[0]),'Both destinations share the woodland feeder');
assert(layout.PAD_LAYOUT.site_f1.y-layout.PAD_H/2>layout.SITE.f1.y+layout.SITE.f1.h,'Forest upgrade must be outside the harvesting area');
const allIds=Object.keys(layout.PAD_LAYOUT).filter(id=>!id.includes('fix'));
for(const stage of [1,2,3]){
  layout.S.stage=stage;
  const pads=layout.arrangePads(allIds.map(id=>({id,x:150,y:200})));
  assert(pads.length>0,'Layout must contain visible pads');
  for(const p of pads){
    const bounds=layout.padBounds(p);
    assert(bounds.x>=0 && bounds.x+bounds.w<=layout.fenceX()-3);
    assert(bounds.y>=0 && bounds.y+bounds.h<layout.H);
    assert(!layout.padObstacles().some(o=>!(p.id==='belt_p1'&&o.belt==='sale_p1')&&layout.rectTouches(bounds,o,3)),`${p.id} overlaps a facility`);
    for(const q of pads)if(p!==q){
      assert(!layout.rectTouches(bounds,layout.padBounds(q)),`${p.id} overlaps ${q.id}`);
      assert(Math.hypot(p.x-q.x,p.y-q.y)>2*layout.PAD_RADIUS,'Purchase radii overlap');
    }
  }
  const remaining=layout.arrangePads(pads.slice(1).map(p=>({...p})));
  for(const p of remaining){const previous=pads.find(q=>q.id===p.id);assert.equal(p.x,previous.x);assert.equal(p.y,previous.y);}
  const repair={id:'rep_worker_test',x:150,y:200};
  const repaired=layout.arrangePads([...pads.map(p=>({...p})),repair]);
  assert(repaired.includes(repair),'Repair must remain accessible');
  assert(!layout.padObstacles().some(o=>layout.rectTouches(layout.padBounds(repair),o,3)));
  assert(!pads.some(p=>layout.rectTouches(layout.padBounds(repair),layout.padBounds(p),3)));
}
const walls={S:{stage:3,fence:1,vf:{2:1,3:1}},STAGE_W:layout.STAGE_W,H:layout.H,VFBREACH:{},fenceX:()=>layout.W,shake(){},addFloat(){}};
vm.createContext(walls);
vm.runInContext(section('function villageAt(', 'function fixDef('),walls);
vm.runInContext(section('function blockBearAtFence(', 'function spawnBear('),walls);
for(const b of [{side:'left',x:-8,y:250},{side:'right',x:layout.W+8,y:250},{side:'bottom',x:420,y:layout.H+19}]){
  const nx=b.side==='left'?-6:b.side==='right'?layout.W+6:b.x;
  const ny=b.side==='bottom'?layout.H+17:b.y;
  assert.equal(walls.blockBearAtFence(b,nx,ny),true,`${b.side} must block entry`);
  assert.equal(b.state,'fence');
  assert(b.side==='left'?b.x<0:b.side==='right'?b.x>layout.W:b.y>layout.H);
  if(b.wallV===1)walls.S.fenceDown=1;else walls.VFBREACH[b.wallV]=1;
  assert.equal(walls.blockBearAtFence(b,nx,ny),false,'Breach must allow entry');
  walls.S.fenceDown=0;walls.VFBREACH={};
}
// A crowd can push a waiting bear inward without crossing from its previous x/y.
for(const b of [{side:'left',x:3,y:250},{side:'right',x:layout.W-3,y:250},{side:'bottom',x:420,y:layout.H-3}]){
  assert(walls.blockBearAtFence(b,b.x,b.y),'Crowd displacement must still be blocked');
  assert(b.side==='left'?b.x<=-25:b.side==='right'?b.x>=layout.W+25:b.y>=layout.H+30);
  b.swipeT=.2;walls.blockBearAtFence(b,b.x,b.y);assert.equal(b.swipeT,.2,'Fence guard must not reset the bear attack clock');
}
assert.equal(walls.blockBearAtFence({side:'top',x:100,y:-1},100,1),false,'Top has no fence');
// Exercise real economy rounding and combat combo logic, including radius boundaries.
const economy={fmt:n=>String(Math.floor(n)),S:{coins:1000}};vm.createContext(economy);
vm.runInContext(section('function money50(', 'function gearDef('),economy);
for(const [input,expected] of [[0,0],[1,50],[49,50],[50,50],[51,100],[99.5,100]])assert.equal(economy.money50(input),expected);
const upgrade=economy.mkUp({id:'test',max:1,cost:()=>123});assert.equal(upgrade.cost(),150);assert(upgrade.canBuy());
const hits=[],combat={time:1,COMBO_N:8,ULT_MUL:5,BEARS:[],hitBear:(b,p,d)=>hits.push([b.id,d]),heroUltFx(){},heroHitFx(){}};
vm.createContext(combat);vm.runInContext(section('function heroAttackHit(', 'function hitBear('),combat);
const fighter={x:0,y:0},target={id:'target',x:40,y:0,state:'in'},near={id:'near',x:134,y:0,state:'in'},far={id:'far',x:136,y:0,state:'in'},dead={id:'dead',x:20,y:0,state:'dead'};
combat.BEARS=[target,near,far,dead];
for(let i=0;i<7;i++){combat.time+=.4;combat.heroAttackHit(fighter,target,10,false);}
assert.equal(hits.length,7,'Regular strikes should hit one bear');hits.length=0;
combat.time+=.4;combat.heroAttackHit(fighter,target,10,false);
assert.deepEqual(hits,[['target',50],['near',50]],'Ultimate must damage living enemies within the hero radius');assert.equal(fighter.combo,0);
hits.length=0;combat.time+=4;combat.heroAttackHit(fighter,target,10,false);assert.equal(fighter.combo,1,'Expired combo must restart');
// Signs stay outside buildings; radar preserves all four approach directions.
vm.runInContext(section('function facilityLabelSlot(', 'function facilitySign('),layout);
vm.runInContext(section('function radarPoint(', 'function refreshRaidRadar('),layout);
for(const pl of layout.PLOTS){
  const sign=layout.facilityLabelSlot(pl),bounds={x:sign.x-sign.w/2,y:sign.y,w:sign.w,h:sign.h};
  for(const other of layout.PLOTS)assert(!layout.rectTouches(bounds,other),`${pl.def} sign covers ${other.def}`);
}
for(const stage of [1,2,3]){
  layout.S.stage=stage;
  const left=layout.radarPoint(-100,200,224,128),right=layout.radarPoint(layout.fenceX()+100,200,224,128);
  const wallLeft=layout.radarPoint(0,200,224,128),wallRight=layout.radarPoint(layout.fenceX(),200,224,128);
  assert(left.x<wallLeft.x && right.x>wallRight.x,'Radar must distinguish bears outside side fences');
  assert(layout.radarPoint(100,-70,224,128).y<layout.radarPoint(100,0,224,128).y);
  assert(layout.radarPoint(100,layout.HT+70,224,128).y>layout.radarPoint(100,layout.HT,224,128).y);
  for(const n of [-10000,10000]){const pt=layout.radarPoint(n,n,224,128);assert(pt.x>=6&&pt.x<=218&&pt.y>=6&&pt.y<=122);}
}
// Rebuilding pads every frame must not reset payment feedback throttles.
let purchased=0,coinFlights=0,paymentLabels=0;
const payment={PINCH:null,PINCH_USED:false,agents:[{x:100,y:100}],S:{coins:10000,pads:{},tut:99},PAD_RADIUS:14,padMsgT:0,fmt:String,
  buildPads:()=>[{id:'payment',x:100,y:100,d:{cost:()=>5000,isMax:()=>purchased>0}}],
  fly(){coinFlights++;},addFloat(){paymentLabels++;},sfx(){},buy(){purchased++;payment.S.coins-=5000;}};
vm.createContext(payment);vm.runInContext(section('var padHold=', 'function padIcon('),payment);payment.padInit=true;
for(let frame=0;frame<120;frame++)payment.updatePads(1/60);
assert.equal(purchased,1);assert.equal(payment.S.coins,5000);
assert(paymentLabels<=4,'Upgrade payment labels must not accumulate every frame');
assert(coinFlights<=12,'Coin feedback must stay bounded while pads are rebuilt');
// Event typography must retain a readable CSS size and wrap without shrinking.
for(const [width,height] of [[320,568],[390,844],[844,390],[1280,800]]){
  const drawn=[],unit=1080/width,graphic={save(){},restore(){},fill(){},stroke(){},
    measureText(text){const size=parseFloat(this.font.match(/([\d.]+)px/)[1]);return {width:Array.from(text).reduce((n,ch)=>n+size*(/^[a-zA-Z0-9 ]$/.test(ch)?.55:1),0)};},
    fillText(text,x,y,maxWidth){drawn.push({text,x,y,maxWidth,font:this.font,width:this.measureText(text).width});}};
  const banner={ctx:graphic,W:1080,SH:height*unit,screenUnit:unit,rr(){},STAGEBAN:{t:1,max:2,text:'👑 세 마을의 불빛을 본 대왕곰!',sub:'왼쪽에서 침입 · 가장자리 화살표를 따라가요'}};
  vm.createContext(banner);vm.runInContext(section('function bannerLines(', '/* v63:'),banner);banner.drawStageBanner();
  const main=drawn.filter(v=>v.font.startsWith('700'));
  assert(main.length>0);if(width===320)assert(main.length>1,'Long alert titles must wrap on narrow phones');
  for(const text of drawn){assert.equal(text.maxWidth,undefined,'Canvas maxWidth must not squash alert text');assert(parseFloat(text.font.match(/([\d.]+)px/)[1])/unit>=13);assert(text.width<=Math.min(width-24,440)*unit-32*unit+.01);assert(text.y>0&&text.y<height*unit);}
  assert(main.every(v=>parseFloat(v.font.match(/([\d.]+)px/)[1])/unit>=18));
}
console.log('PASS: syntax; 6 viewport sizes; overview; touch cancel/multitouch; equal drag speed; 30/60/90/120Hz; background and story pause; horizontal expansion; 3 village layouts and repairs; left/right/bottom fence blocking and breach entry; 50-won costs; single-target martial strikes and area ultimate; separate facility signs; radar directions; bounded upgrade feedback; readable wrapping event alerts.');
