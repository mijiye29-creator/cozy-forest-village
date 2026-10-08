/* ---------- loop ---------- */
var last=performance.now(),frameGate=last,uiT=0,saveT=0,titleT=0;
function camClampX(x){var vw=W/Z;if(S.zoomOut&&vw>=W)return (W-vw)/2;var ax=S.zoomOut?W:fenceX();return Math.max(-96,Math.min(Math.max(-96,ax+96-vw),x));}
var CAMERA_TOP=-72;
function camClampY(y){var vh=SH/Z,ym=HT-vh;if(ym<CAMERA_TOP)return ym/2;return Math.max(CAMERA_TOP,Math.min(ym,y));}
/* v56: each system runs in its own guard - one bad value in a save can no longer freeze the whole game (hero and workers stop moving).
   the last error is shown in the settings panel so it can be reported */
var ERRN=0,ERRMSG='';function safe(name,fn){try{fn();}catch(e){ERRN++;if(!ERRMSG){ERRMSG=name+': '+(e&&e.message||e);var sv=document.querySelector('#setp .sver');if(sv)sv.textContent='v103 · 오류 '+ERRMSG.slice(0,70);}}}
function loop(now){
  requestAnimationFrame(loop);
  if(document.hidden){last=now;frameGate=now;return;}
  // Cap high-refresh phones at 60 draws/s without changing simulation speed.
  var frameMS=1000/60,elapsed=now-frameGate;
  if(elapsed<frameMS-.1)return;
  frameGate=now-(Math.max(0,elapsed-frameMS)%frameMS);
  var dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now; /* v58: never negative - a frame stamp can be a little older than the moment start was tapped */FDT=dt;
  /* v59: the title card covers the world - repaint it a few times a second instead of every frame (it ran full speed under a blur, which made phones stutter on start) */
  if(TITLE){titleT-=dt;if(titleT<=0){titleT=.4;ctx.setTransform(DPR,0,0,DPR,0,0);safe('draw',draw);}return;}
  /* Story scenes pause the village safely while the player reads. */
  if(storyBox&&!storyBox.hidden){titleT-=dt;if(titleT<=0){titleT=.4;ctx.setTransform(DPR,0,0,DPR,0,0);safe('draw',draw);}return;}
  time+=dt;update(dt);
  ctx.setTransform(DPR,0,0,DPR,0,0);safe('draw',draw);
  uiT-=dt;if(uiT<=0){uiT=.2;safe('ui',refreshUI);}
  saveT+=dt;if(saveT>5){saveT=0;save();}
}
/* v58 (staff 7): one simulation step, split out of the frame loop so the automated tests can run the game faster than real time */
var cornerUpgradeT=0,cornerUpgradeUsed=false;
function upgradeOpenVillages(){
  var stage=S.stage||1;S.shopStaff=S.shopStaff||{};S.shop.wood=8;S.shopStaff.wood=6;if(stage>=2){S.shop.fish=8;S.shopStaff.fish=6;}S.tut=99;S.lodge=1;S.autocash=3;S.trunk=5;S.pile=6;S.whLv=5;S.wh2=3;S.fence=5;S.tower=TOWER_MAX;S.fenceDown=0;S.towerDown=0;S.rep=[];
  Object.keys(MAXLV).forEach(function(k){S.p[k]=MAXLV[k];S[k]=MAXLV[k];});
  S.pst=S.pst||{};S.pcv=S.pcv||{};S.cvLv=S.cvLv||{};S.vt=S.vt||{};S.vf=S.vf||{};
  SITES.forEach(function(st,i){if(i>=stage)return;S.sites[st.id]=5;S.cv[st.id]=1;S.cvLv[st.line]=CV_MAX;var b=PROC_OF[st.id];S[b]=8;S.pst[b]=5;S.pcv[b]=1;if(i){S.vt[i+1]=TOWER_MAX;S.vf[i+1]=5;VFBREACH[i+1]=0;VFHP[i+1]=fMaxV(i+1);}
    [VROLE[st.id],['hunter','hunter2','hunter3'][i]].forEach(function(role){var pr=PRIM[role];S.wlv[role]=MAXLV[pr];if(!count(role)){var look=newLook(),gear={role:role,name:look.name,hair:look.hair,skin:look.skin,acc:look.acc,boots:MAXLV.boots};gear[pr]=MAXLV[pr];S.w.push(gear);agents.push(mkAgent(role,gear));}S.w.forEach(function(g){if(g.role===role){g[pr]=MAXLV[pr];g.boots=MAXLV.boots;}});if(canMerge(role))mergeCrew(role,false);});
  });
  if(stage>=3){S.elec=8;S.pst.elec=5;S.pcv.elec=1;}FENCEHP=fenceMax();TOWERHP=towerMax();syncPlayerGear();res.forEach(function(q){if(owned(q.s))growRes(q);});PADLIST=buildPads();celebrate(agents[0].x,agents[0].y,'열린 마을 최고 강화 완료',true);save();refreshUI();
}
function updateCornerUpgrade(dt){var a=agents[0],inside=a.x<26&&a.y<26;if(!inside){cornerUpgradeT=0;cornerUpgradeUsed=false;return;}if(cornerUpgradeUsed)return;cornerUpgradeT+=dt;if(cornerUpgradeT>=1.5){cornerUpgradeUsed=true;upgradeOpenVillages();}}
function update(dt){
  safe('corner',function(){updateCornerUpgrade(dt);});
  safe('res',function(){res.forEach(function(q){if(!q.alive&&owned(q.s)){q.timer-=dt;if(q.timer<=0)growRes(q);}});});
  agents.forEach(function(a){if(a.role==='player'&&(PINCH||PINCH_USED)){a.mv=false;a.moving=false;return;}try{step(a,dt);}catch(e){safe('agent-'+a.role,function(){throw e;});
    /* v57: even if the hero's normal step fails, the joystick still moves the hero */
    if(a.role==='player'&&joy.on&&Math.hypot(joy.dx,joy.dy)>2*screenUnit){var d=Math.hypot(joy.dx,joy.dy),sp=90*dt;a.x=Math.max(6,Math.min(fenceX()-8,a.x+joy.dx/d*sp));a.y=Math.max(6,Math.min(H-6,a.y+joy.dy/d*sp));a.mv=true;a.bob+=dt*13;a.moving=true;}}});
  safe('belt',function(){updateConveyors(dt);});safe('proc',function(){updateProcessing(dt);});safe('cust',function(){updateCustomers(dt);});safe('truck',function(){updateTrucks(dt);});
  safe('music',updateMusic);safe('pads',function(){updatePads(dt);});safe('fx',function(){updateFly(dt);updateChecks(dt);});safe('tut',updateTut);safe('cash',function(){updateCash(dt);});
  safe('bg',function(){if(palKey()!==bgWh){bgWh=palKey();paintStatic();paintPalisade();}});safe('bears',function(){updateBears(dt);});safe('finale',function(){updateFinale(dt);});safe('endcine',function(){updateEndingCinematic(dt);});safe('def',function(){updateDefense(dt);});
  safe('stage',function(){updateStage(dt);});
  var zt=zoomTarget();Z+=(zt-Z)*Math.min(1,dt*5);if(Math.abs(zt-Z)<.002)Z=zt;
  var pa=agents[0],fx=pa.x,ck=Math.min(1,dt*5);if(CAMF){CAMF.t-=dt;fx=CAMF.x;ck=Math.min(1,dt*2.2);if(CAMF.t<=0)CAMF=null;}
  var cxT=camClampX(fx-W/Z/2),cyT=camClampY(pa.y-SH/Z*.5);
  if(joy.on&&joy.moved||pa.mv)CAMERA_HELD=false;if(!PINCH&&!CAMERA_HELD){camX+=(cxT-camX)*ck;camY+=(cyT-camY)*ck;}camX=camClampX(camX);camY=camClampY(camY);
  for(var f=floats.length-1;f>=0;f--){floats[f].t+=dt;if(floats[f].t>2)floats.splice(f,1);}
  for(var p=parts.length-1;p>=0;p--){var pt=parts[p];pt.life-=dt;pt.x+=pt.vx*dt;pt.y+=pt.vy*dt;pt.vy+=pt.g*dt;if(pt.life<=0)parts.splice(p,1);}
  if(flash>0)flash=Math.max(0,flash-dt*1.6);SHAKE=Math.max(0,SHAKE-dt*2.5);TOWERHIT=Math.max(0,TOWERHIT-dt);
  safe('idle',function(){var pa=agents[0];if(tutOn()||S.auto||pa.mv||pa.moving||joy.on)idleT=0;else idleT+=dt;});
}
/* v58 (staff 7): regression-test hook - only exists when the page is opened with ?test=1 (never in normal play).
   lets the headless test bot read the state, buy upgrades and fast-forward the simulation */
if(/[?&]test=1/.test(location.search))window.__qlen=function(){return customers.filter(function(c){return c.state!=='out';}).length;};
if(/[?&]test=1/.test(location.search))window.__stuck=function(){return res.filter(function(q){return q.alive&&q.k==='fish'&&q.by&&(agents.indexOf(q.by)<0||q.by.res!==q);}).length;};
if(/[?&]test=1/.test(location.search))window.__cozyTest={S:function(){return S;},DEF:DEF,buy:function(id){
    /* QA purchases walk the test hero onto the same world pad and wait through the real dwell/payment path. */
    var d=DEF[id];if(!d||d.isMax()||!d.canBuy()||(d.hidden&&d.hidden()))return false;PADLIST=buildPads();var pad=null;
    for(var i=0;i<PADLIST.length;i++)if(PADLIST[i].id===id){pad=PADLIST[i];break;}if(!pad)return false;if(pad.perimeter)pad.perimeter.armed=true;
    var a=agents[0],coinsBefore=S.coins;a.x=pad.x;a.y=pad.y;a.path=[];a.tap=null;a.moving=false;a.mv=false;a.padDwell=0;padInit=true;padHold=null;padHoldP=null;
    for(var f=0;f<60;f++){updatePads(.05);if((!S.pads||!S.pads[id])&&S.coins<coinsBefore){window.__cozyPurchaseSeconds=(f+1)*.05;break;}}
    return S.coins<coinsBefore&&(!S.pads||!S.pads[id]);
  },
  camera:function(){return {z:Z,x:camX,y:camY,target:zoomTarget(),pinching:!!PINCH,touches:Object.keys(TOUCHES).length,held:CAMERA_HELD,joy:joy.on,range:zoomRange()};},paymentFx:function(){return {coins:FLY.filter(function(f){return f.payment;}).length,particles:parts.length};},netFish:function(a,N){var box=superNetBounds(a,N);return N.list.map(function(f){return superNetFish(box,f);});},netBounds:superNetBounds,superPose:superWorkPose,superHands:superHands,superStep:stepSuper,raidTiming:function(){return {cycle:seasonLen(),calm:winterStart(),wave:raidGap()};},hunterStep:stepHunter,arrows:function(){return ARROWS;},guardBear:blockBearAtFence,
  cornerUpgrade:upgradeOpenVillages,resourceSites:function(){return SITES;},resources:function(){return res;},perimeterSlot:nearbyFenceSlot,customers:function(){return customers;},shopCash:cashPos,padReady:function(id){PADLIST=buildPads();var p=PADLIST.filter(function(p){return p.id===id;})[0];return p?padReady(p):null;},labels:function(){return PLOTS.map(function(p){return {def:p.def,building:{x:p.x,y:p.y,w:p.w,h:p.h},sign:facilityLabelSlot(p)};});},radarPoint:radarPoint,
  netScene:function(a){var c=document.createElement('canvas');c.width=540;c.height=480;var g=c.getContext('2d');g.fillStyle='#e8eadb';g.fillRect(0,0,540,480);g.scale(2,2);g.translate(-370,-160);var oldCtx=ctx,oldFx=SUPERFX,oldDt=FDT;try{ctx=g;drawOwnedSite(g,SITE.p1,420,180,1);drawStoreTile(g,SITE.p1,540,180);if(!a.net.lifted)res.filter(function(q){return q.k==='fish';}).forEach(function(q){drawFish(Object.assign({},q,{alive:true}));});drawSuper(a);SUPERFX=[{k:'net',net:a.net,ax:a,t:0}];FDT=0;drawSuperFx();return c.toDataURL();}finally{ctx=oldCtx;SUPERFX=oldFx;FDT=oldDt;}},
  spriteStatus:function(){return {states:Object.assign({},SPRITES.state),queue:SPRITES.queue.length,active:SPRITES.active};},loadSprites:function(names){names.forEach(spriteReady);},
  actorArt:function(role,L,phase){var c=document.createElement('canvas');c.width=240;c.height=(role==='hunter2'||role==='lumber')&&L>=12?300:240;var g=c.getContext('2d');g.scale(3,3);var oldCtx=ctx,oldCapture=SPRITE_ART_CAPTURE;ctx=g;SPRITE_ART_CAPTURE=true;try{var a={x:40,y:(role==='hunter2'||role==='lumber')&&L>=12?82:60,role:role,dir:1,bob:0,sc:1,mv:false,gear:{name:'',skin:0,hair:0,boots:0,axe:0,rod:0,pick:0,bow:0},bag:{},path:[]};if(role==='player'){a.martialLevel=L;var old=S.wlv;S.wlv={hunter:L-1};try{drawHero(g,a,0);}finally{S.wlv=old;}}else{a.gear[PRIM[role]]=L;if(L>=12)a.gear.super=1;if(phase!==undefined){a.working=true;a.swT=phase*SUPER_T;if(role==='fisher')a.net={t:phase*1.6};}drawAgent(a);}return c.toDataURL();}finally{ctx=oldCtx;SPRITE_ART_CAPTURE=oldCapture;}},
  facilityArt:function(kind,L){var c=document.createElement('canvas');c.width=240;c.height=300;var g=c.getContext('2d');g.scale(2,2);if(kind==='tower')drawWatchtower(g,46,112,30,92,L,false,0,0,0);else drawMarketShop(g,kind==='woodshop'?'wood':'fish',L);return c.toDataURL();},
  storageArt:function(L){var c=document.createElement('canvas');c.width=92;c.height=288;var g=c.getContext('2d');g.scale(2,2);drawWorkshopStorage(g,{x:0,y:0,w:136,shedLeft:1},L);return c.toDataURL();},
  workshopArt:function(b,L,SL){var pl=plotOf(b),old=S[b],previous=S.pst[b],oldCapture=SPRITE_ART_CAPTURE,c=document.createElement('canvas');c.width=pl.w*2;c.height=pl.h*2;var g=c.getContext('2d');g.scale(2,2);g.translate(-pl.x,-pl.y);try{SPRITE_ART_CAPTURE=true;S[b]=L;S.pst[b]=SL;drawWorkshop(g,pl);return c.toDataURL();}finally{S[b]=old;S.pst[b]=previous;SPRITE_ART_CAPTURE=oldCapture;}},
  goals:function(){var l=goalList();return l?l.map(function(q){return {name:q[0],v:q[1](),need:q[2]};}):null;},errs:function(){return {n:ERRN,msg:ERRMSG,boot:window.__bootErr};},
  start:function(){TITLE=false;titleEl.hidden=true;},run:function(sec,stepDt){var h=stepDt||.05,n=Math.round(sec/h);for(var i=0;i<n;i++){time+=h;FDT=h;update(h);}refreshUI();return S.coins;},
  pads:function(){return PADLIST.map(function(p){return {id:p.id,x:p.x,y:p.y,w:PAD_W,h:PAD_H,cap:p.cap||'',mini:p.mini,construction:p.construction,target:p.target,title:padTitle(p),perimeter:!!p.perimeter,floating:!!(p.perimeter&&p.perimeter.floating)};});},walkable:walkXY,padObstacles:padObstacles,padOverlaps:function(){PADLIST=buildPads();var hits=[];for(var i=0;i<PADLIST.length;i++)for(var j=i+1;j<PADLIST.length;j++){var a=PADLIST[i],b=PADLIST[j];if(rectTouches(padBounds(a),padBounds(b)))hits.push([a.id,b.id]);}return hits;},cost:function(id){var p=PADLIST.filter(function(p){return p.id===id;})[0];return DEF[id]?DEF[id].cost():(p?p.d.cost():null);},agents:function(){return agents;},hero:function(x,y){var a=agents[0];a.x=x;a.y=y;a.path=[];a.tap=null;},dex:function(){return {n:dexN(),tot:DEXALL.length,ids:Object.keys(S.dex||{})};},day:function(){return {daily:S.daily,stat:S.stat,done:dayDoneN()};},beltfx:function(){return BELTFX;},bears:function(){return BEARS;},
  geo:function(){return {GC:GC,MX:MX,W:W,H:H,HT:HT,STAGE_W:STAGE_W,areaW:areaW(),fenceX:fenceX(),camClampX0:camClampX(0),camClampXmax:camClampX(MX),siteM1:{x:SITE.m1.x,gather:SITE.m1.gather,st:SITE.m1.st,pt:SITE.m1.pt},canvasW:cv.width,canvasH:cv.height,villageAt_fx:villageAt(fenceX()-1)};},
  spawnBear:function(side){spawnBear(side);},fences:function(){return {hp:FENCEHP,otherHP:VFHP,breaches:VFBREACH};},banner:function(){return STAGEBAN?{text:STAGEBAN.text,sub:STAGEBAN.sub}:null;}};
function suspendMobile(){cancelControl();save();if(AC)AC.suspend().catch(function(){});}
document.addEventListener('visibilitychange',function(){
  if(document.hidden)suspendMobile();
  else{scheduleFit();if(AC){AC.resume().catch(function(){});bgmNext=AC.currentTime+.2;}}
  last=performance.now();frameGate=last;
});
window.addEventListener('pagehide',suspendMobile);
window.addEventListener('pageshow',function(){last=performance.now();frameGate=last;scheduleFit();});
/* v56: crews already at the top level merge into their super worker on load */
/* v57: start-up steps are guarded one by one so a single bad value can't stop the game loop from ever starting */
function boot(name,fn){try{fn();}catch(e){var m=name+': '+(e&&e.message||e);if(!window.__bootErr)window.__bootErr=m;var t=document.getElementById('tinfo');if(t){t.hidden=false;t.textContent='⚠️ '+m;t.style.color='#b3263b';}var v=document.querySelector('#setp .sver');if(v)v.textContent='v103 · 오류 '+m.slice(0,70);}}
boot('defence-save',restoreDefenseState);
boot('merge',function(){['lumber','fisher','hunter','hunter2','hunter3','miner'].forEach(function(r){if(canMerge(r))mergeCrew(r,false);});S.w.forEach(function(g){if(g.super&&isHunter(g.role))g.name=SUPERNAME[g.role];});});
boot('dex',function(){dexInit();DEXREADY=true;});boot('tab',applyTab);boot('ui',refreshUI);
boot('fit',fit);boot('cam',function(){var pa=agents[0];Z=zoomTarget();camX=camClampX(pa.x-W/Z/2);camY=camClampY(pa.y-SH/Z*.5);});
boot('refund',function(){if(S.refundN){addFloat(150,150,'💰+'+fmt(S.refundN),'#ffe27a',true);delete S.refundN;save();}});
boot('spot',function(){var pa=agents[0];if(!walkXY(pa.x,pa.y))unstick(pa);});
boot('ending-resume',restoreFinale);
requestAnimationFrame(loop);
