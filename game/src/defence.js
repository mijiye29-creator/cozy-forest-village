/* ---------- defence: watchtower (auto arrows, houses hunters), fence (holds bears at the north edge), repairs ---------- */
var TOWER={x:50,y:512};
function towerDoor(){return {x:TOWER.x,y:590};}
var TWPN=['arrow','arrow','stone','cannon','cannon2','rocket','laser','laser','plasma','plasma'],TWNAME={arrow:'화살',stone:'투석기',cannon:'대포',cannon2:'쌍포',rocket:'로켓 포대',laser:'레이저 포',plasma:'플라즈마 포'};
function towerWpn(){return TWPN[Math.min(TOWER_MAX,S.tower||0)];}
function towerRange(){return (S.tower||0)>=2?9999:220;}
var TOWER_MAX=9;
/* v84 (director: the tower still felt weak) - four more tiers beyond the old Lv5 cap, damage keeps climbing and shots fire faster */
function towerDmgAt(L){L=Math.min(TOWER_MAX,L||0);var base=[0,4,8,14,18,24][Math.min(5,L)];return L<=5?base:24+(L-5)*16;}
function towerGapAt(L){L=Math.min(TOWER_MAX,L||0);var base=[1,1.1,1.6,1.7,1.6,1.5][Math.min(5,L)];return L<=5?base:Math.max(.85,1.5-(L-5)*.14);}
function towerDmg(){return towerDmgAt(S.tower||0);}
function towerGap(){return towerGapAt(S.tower||0);}
var TSPLASH={arrow:0,stone:20,cannon:32,cannon2:32,rocket:40,laser:36,plasma:50},TSPEED={arrow:280,stone:300,cannon:430,cannon2:430,rocket:360,laser:700,plasma:480};
var towerT=0,towerAim=0,towerAng=2.3;
function fenceHold(v){return 1.1+.45*fenceLvV(v||1);}
function fenceMax(){return fenceHpAt(S.fence||0);}
function fenceHpAt(L){return 80+90*L+(L>=3?70*(L-2):0);}
function towerMax(){var L=S.tower||0;return 50+40*L+(L>=3?40*(L-2):0);}
var FENCEHP=0,TOWERHP=0,VFHP={},VFBREACH={};
var DEFENSE_READY=false;
/* Optional snapshots preserve damage across saves without changing seasonal repair rules. */
function defenseHP(value,max,broken){return broken?0:(typeof value==='number'&&isFinite(value)&&value>0?Math.min(max,value):max);}
function refundClearedDefensePads(){
  if(!S.pads)return;
  ['fence_fix','tower_fix','vfence_fix2','vfence_fix3'].forEach(function(id){var broken=id==='fence_fix'?S.fenceDown:(id==='tower_fix'?S.towerDown:VFBREACH[id.slice(-1)]),paid=S.pads[id];
    if(!broken&&typeof paid==='number'&&isFinite(paid)&&paid>0){S.coins+=paid;delete S.pads[id];}});
}
function restoreDefenseState(){
  var d=S.defenseState;if(!d||typeof d!=='object'||Array.isArray(d)||d.version!==1)d={};
  FENCEHP=S.fence?defenseHP(d.fenceHP,fenceMax(),S.fenceDown):0;
  TOWERHP=S.tower?defenseHP(d.towerHP,towerMax(),S.towerDown):0;
  VFHP={};VFBREACH={};
  [2,3].forEach(function(v){var n=d.breaches&&d.breaches[v],paid=S.pads&&S.pads['vfence_fix'+v];
    /* A legacy paid repair proves a breach even when the old runtime flag was lost. */
    var broken=fenceLvV(v)>0&&(n===1||n===true||(n===undefined&&typeof paid==='number'&&isFinite(paid)&&paid>0));
    VFBREACH[v]=broken?1:0;VFHP[v]=fenceLvV(v)?defenseHP(d.villageHP&&d.villageHP[v],fMaxV(v),broken):0;});
  refundClearedDefensePads();DEFENSE_READY=true;
}
function saveDefenseState(){
  if(!DEFENSE_READY)return;
  var d={version:1,fenceHP:S.fence?defenseHP(FENCEHP,fenceMax(),S.fenceDown):0,towerHP:S.tower?defenseHP(TOWERHP,towerMax(),S.towerDown):0,villageHP:{},breaches:{}};
  [2,3].forEach(function(v){d.breaches[v]=VFBREACH[v]?1:0;d.villageHP[v]=fenceLvV(v)?defenseHP(VFHP[v],fMaxV(v),VFBREACH[v]):0;});
  S.defenseState=d;
}
/* v63: village of a map x (1 forest, 2 lake, 3 mine) and its own wall */
function villageAt(x){return x<STAGE_W[0]?1:(x<STAGE_W[1]?2:3);}
function fenceLvV(v){return v===1?(S.fence||0):((S.vf&&S.vf[v])||0);}
function fenceUp(v){return fenceLvV(v)>0&&!(v===1?S.fenceDown:VFBREACH[v]);}
function fMaxV(v){return fenceHpAt(fenceLvV(v));}
function fixDef(what){return mkUp({id:what+'_fix',fix:what,max:1,cost:function(){return Math.max(60,Math.round(what==='fence'?260*Math.pow(2.1,Math.max(0,S.fence-1))*(S.fence>=3?1.4:1):340*Math.pow(2.2,Math.max(0,S.tower-1))));},
  isMax:function(){return !(what==='fence'?S.fenceDown:S.towerDown);},lv:function(){return '';},name:function(){return what==='fence'?(S.fence>=3?'성벽 수리':'울타리 수리'):'망루 수리';},desc:function(){return '';}});}
var FIXDEF={fence:fixDef('fence'),tower:fixDef('tower')};
function fenceSlow(){return 1-.1*(S.fence||0);}
function fenceSoft(v){var L=fenceLvV(v||1);return Math.max(.55,1-.08*L);}
/* v56 (director 2026-10-03): every village gets its own watchtower on the wall - the 2nd opens with the lake village, the 3rd with the mine.
   they share the main tower's level, weapon and repair state */
/* v63 (director 2026-10-04): the lake / mine towers have their own level (built and upgraded on their own pads), starting from zero when the village opens */
var XTOWERS=[{x:410,st:2,v:2,t:0,aim:0,ang:2.3},{x:770,st:3,v:3,t:.5,aim:0,ang:2.3}];
function xtLv(o){return (S.vt&&S.vt[o.v])||0;}
function xTowerOn(o){return xtLv(o)>0&&(S.stage||1)>=o.st&&o.x<fenceX()-10;}
function towerCount(){return S.tower>0?1:0;}
function updateXTowers(dt){XTOWERS.forEach(function(o){o.t-=dt;o.aim=Math.max(0,o.aim-dt);if(!xTowerOn(o)||o.t>0)return;var oy=TOWER.y-30,best=null,XL=xtLv(o),bd=XL>=2?9999:220;
  BEARS.forEach(function(b){if(b.state==='dead'||b.state==='out')return;var d=Math.hypot(b.x-o.x,b.y-oy);if(d<bd){bd=d;best=b;}});if(!best)return;
  var wk=TWPN[Math.min(TOWER_MAX,XL)],nsh=wk==='cannon2'?2:(wk==='rocket'?3:1);o.t=towerGapAt(XL);o.aim=.35;o.ang=Math.atan2(best.y-oy,best.x-o.x);
  for(var si=0;si<nsh;si++)ARROWS.push({x:o.x+(nsh>1?(si-(nsh-1)/2)*6:0),y:oy,b:best,t:0,dmg:towerDmgAt(XL),tw:wk,delay:si*.14,d0:0});
  if(wk==='arrow')sfx('cast',.15);else sfx('chop',.35);});}
function drawXTowers(){var g=ctx;XTOWERS.forEach(function(o){if(!xTowerOn(o))return;var L=xtLv(o);drawWatchtower(g,o.x,H-2,44,116,L,false,o.aim,o.ang,nightAmt());facilitySign(g,'망루 Lv'+L,o.x,460,76);});}
function updateDefense(dt){
  updateXTowers(dt);
  towerT-=dt;towerAim=Math.max(0,towerAim-dt);
  if(S.tower>0&&!S.towerDown&&towerT<=0){var best=null,bd=towerRange();
    BEARS.forEach(function(b){if(b.state==='dead'||b.state==='out')return;var d=Math.hypot(b.x-TOWER.x,b.y-TOWER.y);if(d<bd){bd=d;best=b;}});
    if(best){var wk=towerWpn(),nsh=wk==='cannon2'?2:(wk==='rocket'?3:1),lb=liveBears().filter(function(x){return x.state!=='dead'&&x.state!=='out';}).sort(function(p,q){return Math.hypot(p.x-TOWER.x,p.y-TOWER.y)-Math.hypot(q.x-TOWER.x,q.y-TOWER.y);});
      towerT=towerGap();towerAim=.35;towerAng=Math.atan2(best.y-(TOWER.y-30),best.x-TOWER.x);
      for(var si=0;si<nsh;si++){var tb2=lb[si%Math.max(1,lb.length)]||best;ARROWS.push({x:TOWER.x+(nsh>1?(si-(nsh-1)/2)*6:0),y:TOWER.y-30,b:tb2,t:0,dmg:towerDmg(),tw:wk,delay:si*.14,d0:0});}
      if(wk==='arrow')sfx('cast',.15);else{sfx('chop',.35);if(wk!=='stone'){burst(TOWER.x+Math.cos(towerAng)*14,TOWER.y-30+Math.sin(towerAng)*14,'#ffd35a',6,true);}}}}
}
/* hunters: chase bears with a bow, then carry the loot to the stalls */
function hunterDmg(g){return (1.5+.8*(g.bow||0))*(HPOW[g.role]||1);}
/* v77 (director): hunters push each other apart so two never stand on the same spot */
function hunterSeparate(a,dt){if(a.inside)return;agents.forEach(function(o){if(o===a||!isHunter(o.role)||o.inside)return;var dx=a.x-o.x,dy=a.y-o.y,d=Math.hypot(dx,dy),R=(a.gear&&a.gear.super)||(o.gear&&o.gear.super)?30:16;
  if(d<R){if(d<.01){dx=Math.random()-.5;dy=Math.random()-.5;d=Math.hypot(dx,dy);}var push=(R-d)*Math.min(1,dt*8);a.x+=dx/d*push;a.y+=dy/d*push*.6;}});}
function stepLim(a,b,distance,dt){
  var reach=bearR(b)+31;a.dir=b.x>=a.x?1:-1;
  if(distance>reach){moveTo(a,Math.max(8,Math.min(fenceX()-10,b.x)),Math.max(8,Math.min(H-12,b.y)),dt);return;}
  a.mv=false;a.moving=false;if(a.shootT>0)return;
  a.shootT=.42;a.strikeN=(a.strikeN||0)+1;a.strikeType=a.strikeN%3===0?'kick':a.strikeN%3===2?'punch-left':'punch';a.stab=.36;
  heroAttackHit(a,b,hunterDmg(a.gear)*5*(a.strikeType==='kick'?1.3:1),false);
}
function stepHunter(a,dt){
  var g=a.gear;a.shootT=(a.shootT||0)-dt;a.aim=Math.max(0,(a.aim||0)-dt);a.stab=Math.max(0,(a.stab||0)-dt);a.ultFxT=Math.max(0,(a.ultFxT||0)-dt);
  var b=null,bd=1e9;BEARS.forEach(function(x){if(x.state!=='in'&&x.state!=='attack'&&x.state!=='fence')return;var d=Math.hypot(x.x-a.x,x.y-a.y);if(d<bd){bd=d;b=x;}});
  if(b)a.inside=false;
  if(b&&g.super&&a.role==='hunter'){stepLim(a,b,bd,dt);return;}
  if(b){
    /* each hunter spreads to its own spot around the bear instead of stacking on top of the others */
    var hunters=agents.filter(function(x){return isHunter(x.role)&&!x.inside;}),hi=Math.max(0,hunters.indexOf(a)),hn=Math.max(1,hunters.length); /* v77: spread over every village's hunters, not only the same kind */
    /* v56: before, the spread offset could park a hunter 90-100px from the bear - just outside the 85px firing range - so it stood still and never shot.
       now each hunter walks to its own spot 60px from the bear and fires from up to 110px */
    var hang=(hi/hn)*6.283+1.1,hr=56+(hi%3)*16,spx=Math.max(10,Math.min(fenceX()-12,b.x+Math.cos(hang)*hr)),spy=Math.max(WORLD_TOP+10,Math.min(HT-14,b.y+Math.sin(hang)*hr*.6));
    if(Math.hypot(spx-a.x,spy-a.y)>6&&bd>70)moveTo(a,spx,spy,dt);else a.mv=false;
    if(bd<=(g.super?170:110)){a.dir=b.x>=a.x?1:-1;
      if(a.shootT<=0){a.shootT=Math.max(.55,1.1-.05*(g.bow||0));a.aim=.35;
        /* v59: the super hunter (a full squad of 6 merged) fires a golden volley at up to three bears, about 8 hunters' worth of damage */
        if(g.super){a.shootT=.4;var sUlt=Math.random()<HUNT_ULT_P,tgN=sUlt?4:3,sMul=sUlt?1+HUNT_ULT_MUL*.5:1;var tg=liveBears().filter(function(x){return x.state==='in'||x.state==='attack'||x.state==='fence';}).sort(function(p,q){return Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(q.x-a.x,q.y-a.y);}).slice(0,tgN);
          tg.forEach(function(tb,ti){var dm=hunterDmg(g)*8*sMul/Math.max(1,tg.length)*(ti?1:1.4);if(a.role==='hunter2')ARROWS.push({x:a.x+a.dir*22,y:a.y-10,b:tb,t:0,dmg:dm,tw:'cannon',delay:ti*.1,d0:0});else ARROWS.push({x:a.x+a.dir*10,y:a.y-16,b:tb,t:0,dmg:dm,hero:1,fire:a.role==='hunter3'?1:0});});
          if(sUlt&&a.role==='hunter3')liveBears().forEach(function(bb){if(bb.state==='dead'||bb.state==='out'||tg.indexOf(bb)>=0)return;if(Math.hypot(bb.x-a.x,bb.y-a.y)<70)hitBear(bb,a,hunterDmg(g)*8*.4,false);});
          for(var mf=0;mf<(sUlt?16:8);mf++)parts.push({x:a.x+a.dir*20,y:a.y-14,vx:a.dir*(30+Math.random()*40),vy:(Math.random()-.5)*36,g:0,life:.3,max:.3,col:mf%2?'#fff1a8':'#ffb14a',r:1.8});SUPERFX.push({x:a.x,y:a.y,t:0,k:'shot'});sfx('chop',sUlt?.3:.12);
          if(sUlt){flash=Math.max(flash,.3);shake(.35);addFloat(a.x,a.y-32,a.role==='hunter'?'\ud83c\udf43 \uad81\uadf9 \uad00\ud1b5\uc0ac\uaca9!':(a.role==='hunter2'?'\ud83d\udca6 \uad81\uadf9 \ud3ec\uaca9!':'\u26cf\ufe0f \uad81\uadf9 \ub300\uc9c0 \uac15\ud0c0!'),a.role==='hunter'?'#9bffb0':(a.role==='hunter2'?'#8fd8ff':'#c9a86a'));}}
        else{var hUlt=(g.bow||0)>=MAXLV.bow&&Math.random()<HUNT_ULT_P;
          /* v86: each village's max-level hunter fires its own ultimate instead of one shared golden-arrow attack */
          if(hUlt&&a.role==='hunter'){ /* forest: a 3-way piercing volley */
            var tgF=liveBears().filter(function(x){return x.state==='in'||x.state==='attack'||x.state==='fence';}).sort(function(p,q){return Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(q.x-a.x,q.y-a.y);}).slice(0,3);
            tgF.forEach(function(tbF,tiF){ARROWS.push({x:a.x+a.dir*6,y:a.y-10,b:tbF,t:0,dmg:hunterDmg(g)*HUNT_ULT_MUL/Math.max(1,tgF.length)*1.4,hero:1,delay:tiF*.08});});
            sfx('cast',.15);burst(a.x+a.dir*10,a.y-14,'#9bffb0',14,true);flash=Math.max(flash,.25);addFloat(a.x,a.y-32,'\ud83c\udf43 \uad81\uadf9 \uad00\ud1b5\uc0ac\uaca9!','#9bffb0');
          }else if(hUlt&&a.role==='hunter2'){ /* lake: a single heavy cannon blast with splash */
            ARROWS.push({x:a.x+a.dir*10,y:a.y-10,b:b,t:0,dmg:hunterDmg(g)*HUNT_ULT_MUL*1.1,tw:'cannon',delay:0,d0:0});
            sfx('chop',.3);burst(a.x+a.dir*10,a.y-14,'#8fd8ff',16,true);flash=Math.max(flash,.3);shake(.4);addFloat(a.x,a.y-32,'\ud83d\udca6 \uad81\uadf9 \ud3ec\uaca9!','#8fd8ff');
          }else if(hUlt&&a.role==='hunter3'){ /* mine: an instant ground-slam hitting every nearby bear */
            var dmgS=hunterDmg(g)*HUNT_ULT_MUL*.9;liveBears().forEach(function(bb){if(bb.state==='dead'||bb.state==='out')return;if(Math.hypot(bb.x-b.x,bb.y-b.y)<46)hitBear(bb,a,dmgS,false);});
            sfx('nope',.3);burst(b.x,b.y-10,'#c9a86a',20,true);flash=Math.max(flash,.3);shake(.5);addFloat(a.x,a.y-32,'\u26cf\ufe0f \uad81\uadf9 \ub300\uc9c0 \uac15\ud0c0!','#c9a86a');
          }else{ARROWS.push({x:a.x+a.dir*6,y:a.y-10,b:b,t:0,dmg:hunterDmg(g),gun:(g.bow||0)>=7?1:0});sfx((g.bow||0)>=7?'chop':'cast',.15);}}}}
    return;}
  var n=bagN(a);
  if(n<4){var L=null,ld=1e9;LOOT.forEach(function(x){if(x.z>0||x.t<.4)return;var d=Math.hypot(x.x-a.x,x.y-a.y);if(d<ld){ld=d;L=x;}});
    if(L){if(ld<8){a.bag[L.id]=(a.bag[L.id]||0)+1;LOOT.splice(LOOT.indexOf(L),1);sfx('pickup',.1);}else moveTo(a,L.x,L.y,dt);return;}}
  if(n>0){var line=null;for(var id in a.bag){line=ITEMS[id].line;break;}var dp=dropPt(line);
    if(Math.hypot(a.x-(dp.x-6),a.y-dp.y)<6){if(!dropAt(a,line)){for(var k in a.bag)if(ITEMS[k].line===line){S.coins+=money50(ITEMS[k].price*a.bag[k]*.5);delete a.bag[k];}}}
    else moveTo(a,dp.x-6,dp.y,dt);return;}
  /* nothing to do: walk back into the tower and wait inside */
  var dr=hunterDoor(a.role);if(a.inside){a.mv=false;a.x=dr.x;a.y=dr.y;return;}if(Math.hypot(a.x-dr.x,a.y-dr.y)>3)moveTo(a,dr.x,dr.y,dt);else{a.mv=false;a.inside=true;}
}
function drawBow(ctx2,a,by,t,aim){
  ctx2.save();ctx2.translate(a.x+a.dir*8,a.y-12+by);ctx2.scale(a.dir,1);var pull=aim>0?3*(aim/.35):0;
  ctx2.strokeStyle=['#8a6440','#e8dcc0','#aeb8c2','#f0bb3f','#8fe8ff'][t];ctx2.lineWidth=1.8;ctx2.beginPath();ctx2.arc(-2,0,8,-1.2,1.2);ctx2.stroke();
  ctx2.strokeStyle='rgba(255,255,255,.85)';ctx2.lineWidth=.6;ctx2.beginPath();ctx2.moveTo(-2+8*Math.cos(-1.2),8*Math.sin(-1.2));ctx2.lineTo(-2-pull,0);ctx2.lineTo(-2+8*Math.cos(1.2),8*Math.sin(1.2));ctx2.stroke();
  ctx2.restore();
}
/* repairs: every level a bear knocked off can be bought back for 40% of its upgrade price */
function repTarget(e){
  if(e.k==='plot'){var pl=PLOTS.filter(function(p){return p.def===e.key;})[0];if(!pl||!DEF[e.key])return null;return {lv:S[e.key],x:pl.x+pl.w/2,y:pl.y+pl.h/2-6,cost:DEF[e.key].cost()};}
  if(e.k==='shop'){var s=STALL[e.line];if(!s)return null;return {lv:S.shop[e.line],x:s.x+30,y:s.y-30,cost:DEF['shop_'+e.line].cost()};}
  if(e.k==='belt'){if(!SITE[e.sid]||!DEF['belt_'+e.sid])return null;var p=pilePos(e.sid);return {lv:cvLv(e.sid),x:p.x,y:p.y-16,cost:DEF['belt_'+e.sid].cost()};}
  var g=S.w[e.wi];if(!g)return null;var ag=agents.filter(function(x){return x.gear===g;})[0];
  return {lv:g[e.tr]||0,x:ag?ag.x:HOME.x,y:ag?ag.y-40:HOME.y,cost:gcost(e.tr,g[e.tr]||0,true)};
}
function repairs(){S.rep=(S.rep||[]).filter(function(e){var t=repTarget(e);return t&&t.lv===e.lv;});return S.rep;}
function repCost(e){var t=repTarget(e);return Math.max(10,Math.round(t.cost*.4));}
function repDef(e){return {repair:1,e:e,cost:function(){return repCost(e);},isMax:function(){return false;},canBuy:function(){return S.coins>=repCost(e);},why:function(){return '코인이 부족해요';}};}
function doRepair(e){var t=repTarget(e);
  if(e.k==='plot')S[e.key]++;else if(e.k==='shop')S.shop[e.line]++;else if(e.k==='belt')S.cv[e.sid]++;else S.w[e.wi][e.tr]=(S.w[e.wi][e.tr]||0)+1;
  S.rep.splice(S.rep.indexOf(e),1);addFloat(t.x,t.y-12,'🔧 수리 완료! Lv 복구','#c9f5c0');burst(t.x,t.y,'#c9f5c0',12,true);}
function addRepair(t){
  var e=null;
  if(t.kind==='plot')e={k:'plot',key:t.key,lv:S[t.key]};
  else if(t.kind==='shop')e={k:'shop',line:t.line,lv:S.shop[t.line]};
  else if(t.kind==='belt')e={k:'belt',sid:t.sid,lv:cvLv(t.sid)};
  else if(t.tr){var wi=S.w.indexOf(t.a.gear);if(wi>=0)e={k:'worker',wi:wi,tr:t.tr,lv:t.a.gear[t.tr]||0};}
  if(e){S.rep=S.rep||[];S.rep=S.rep.filter(function(x){return !(x.k===e.k&&x.key===e.key&&x.line===e.line&&x.sid===e.sid&&x.wi===e.wi&&x.tr===e.tr);});S.rep.push(e);}
}
function drawTowerWpn(g,cx,top,L){var wk=TWPN[Math.min(TOWER_MAX,L)],fire=towerAim>0,a=towerAng,y0=top+2;
  if(wk==='stone'){ /* catapult: A-frame and a throwing arm */
    g.strokeStyle='#5f4329';g.lineWidth=2;g.beginPath();g.moveTo(cx-9,y0+5);g.lineTo(cx,y0-6);g.lineTo(cx+9,y0+5);g.stroke();
    var arm=fire?-1.9+(.35-towerAim)*6:-.35;g.save();g.translate(cx,y0-6);g.rotate(arm);g.strokeStyle='#8a6440';g.lineWidth=2.4;g.beginPath();g.moveTo(-6,0);g.lineTo(14,0);g.stroke();
    g.fillStyle='#6b5a44';g.beginPath();g.arc(14,-1.5,3,0,Math.PI);g.fill();if(!fire){g.fillStyle='#8a8078';g.beginPath();g.arc(14,-3,2.4,0,7);g.fill();}g.restore();
    g.fillStyle='#3a2f28';g.fillRect(cx-8,y0-7,5,5);return;}
  if(wk==='rocket'){ /* rocket battery */
    g.fillStyle='#4a525c';rr(g,cx-10,y0-2,20,7,2);g.fill();g.fillStyle='#e0b23c';g.fillRect(cx-10,y0-2,20,1.4);
    g.save();g.translate(cx,y0-4);g.rotate(Math.max(-2.6,Math.min(-.5,a))+ (a>0?0:0));g.fillStyle='#6b7580';rr(g,-4,-6,18,12,2);g.fill();
    for(var r=0;r<3;r++){g.fillStyle='#2b2f36';g.beginPath();g.arc(13,-3.6+r*3.6,1.5,0,7);g.fill();if(!fire||r>0){g.fillStyle='#e2463c';g.beginPath();g.arc(13.6,-3.6+r*3.6,.9,0,7);g.fill();}}
    g.restore();if(fire){g.fillStyle='rgba(255,180,80,.7)';g.beginPath();blob(g,cx-6,y0+2,4+towerAim*6);g.fill();}return;}
  if(wk==='laser'){ /* v86: laser battery (Lv6-7) - sleek emitter firing a solid beam */
    g.fillStyle='#3a4550';rr(g,cx-9,y0-2,18,7,2);g.fill();g.fillStyle='#8fe8ff';g.fillRect(cx-9,y0-2,18,1.3);
    g.save();g.translate(cx,y0-3);g.rotate(a);g.fillStyle='#4a5560';rr(g,-3,-2.6,17,5.2,2);g.fill();
    g.fillStyle=fire?'#bdfbff':'#6fe0ff';g.beginPath();g.arc(2,0,2.6,0,7);g.fill();
    if(fire){g.strokeStyle='rgba(140,245,255,.9)';g.lineWidth=2.4;g.beginPath();g.moveTo(4,0);g.lineTo(26+Math.random()*5,0);g.stroke();
      g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1;g.beginPath();g.moveTo(4,0);g.lineTo(26+Math.random()*5,0);g.stroke();}
    g.restore();if(L>=7){g.fillStyle='#8fe8ff';g.fillRect(cx-9,y0-2,18,1.3);}return;}
  if(wk==='plasma'){ /* v86: plasma cannon (Lv8-9) - glowing orb cradled in an open housing */
    g.fillStyle='#3f3350';rr(g,cx-10,y0-2,20,7,2);g.fill();g.fillStyle='#d79aff';g.fillRect(cx-10,y0-2,20,1.3);
    g.save();g.translate(cx,y0-4);g.rotate(a);g.fillStyle='#5a4a6b';rr(g,-4,-6,18,12,3);g.fill();
    var ppu=(Math.sin(time*8)+1)/2;g.fillStyle='rgba(216,120,255,'+(.6+.3*ppu)+')';g.beginPath();g.arc(13,0,4.4+(fire?2:0),0,7);g.fill();
    g.fillStyle='#f0c8ff';g.beginPath();g.arc(13,0,2,0,7);g.fill();
    g.restore();if(fire){g.fillStyle='rgba(216,120,255,.6)';g.beginPath();blob(g,cx-6,y0+2,5+towerAim*8);g.fill();}
    if(L>=9){g.fillStyle='#d79aff';g.fillRect(cx-10,y0-2,20,1.3);}return;}
  /* cannon / twin cannon */
  g.fillStyle='#6b4a2e';rr(g,cx-9,y0-2,18,7,2);g.fill();g.fillStyle='#2b2f36';g.beginPath();g.arc(cx-6,y0+5,2.6,0,7);g.arc(cx+6,y0+5,2.6,0,7);g.fill();
  var bs=wk==='cannon2'?[-2.6,2.6]:[0],rec=fire?Math.max(0,towerAim-.2)*12:0;
  bs.forEach(function(o){g.save();g.translate(cx+o,y0-3+o*.3);g.rotate(a);g.fillStyle='#3a3f45';rr(g,-4-rec,-2.6,19,5.2,2.4);g.fill();g.fillStyle='#5d6670';g.fillRect(-2-rec,-2.6,15,1.2);g.fillStyle='#1e2226';g.fillRect(13-rec,-2.2,2,4.4);
    if(fire&&towerAim>.2){g.fillStyle='rgba(255,200,90,.85)';g.beginPath();blob(g,18,0,3+Math.random()*2);g.fill();}g.restore();});
  if(L>=4){g.fillStyle='#e0b23c';g.fillRect(cx-9,y0-2,18,1.2);}
}
function wallGaps(){var l=[];TPROCS.forEach(function(b){if(S[b]){var x=dockX(b);l.push([x-21,x+21]);}});if(S.tower>0)l.push([TOWER.x-26,TOWER.x+26]);XTOWERS.forEach(function(o){if(xTowerOn(o))l.push([o.x-26,o.x+26]);});
  l.sort(function(a,b){return a[0]-b[0];});var m=[];l.forEach(function(r){if(m.length&&r[0]<=m[m.length-1][1])m[m.length-1][1]=Math.max(m[m.length-1][1],r[1]);else m.push([r[0],r[1]]);});return m;}
function wallSegs(){var segs=[],x=0;wallGaps().forEach(function(gp){if(gp[0]>x)segs.push([x,gp[0]]);x=Math.max(x,gp[1]);});if(x<MX)segs.push([x,MX]);return segs;}
function inGap(x){return wallGaps().some(function(gp){return x>gp[0]-2&&x<gp[1]+2;});}
var LOGC=document.createElement('canvas');LOGC.width=Math.ceil(12*RS);LOGC.height=Math.ceil(11*RS);
(function(){var g=LOGC.getContext('2d');g.scale(RS,RS);var x=6,ly=5;
  g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(x+1.4,ly+2.3,4.6,3.6,0,0,7);g.fill();
  var lg=g.createRadialGradient(x-1.3,ly-1.3,.4,x,ly,4.8);lg.addColorStop(0,'#ffd291');lg.addColorStop(.55,'#e08f3c');lg.addColorStop(1,'#a4601f');
  g.fillStyle=lg;g.beginPath();g.ellipse(x,ly,4.5,3.6,0,0,7);g.fill();
  g.strokeStyle='rgba(90,50,15,.5)';g.lineWidth=.7;g.beginPath();g.ellipse(x,ly,2.6,2,0,0,7);g.stroke();
  g.strokeStyle='rgba(60,32,10,.65)';g.lineWidth=1.1;g.beginPath();g.ellipse(x,ly,4.5,3.6,0,0,7);g.stroke();
  g.fillStyle='rgba(255,244,220,.65)';g.beginPath();g.ellipse(x-1.2,ly-1.2,1.7,1.05,0,0,7);g.fill();})();
/* the land past the fence: misty snow-dusted pines, painted once */
var LOCKC=document.createElement('canvas');LOCKC.width=Math.ceil(W*RS);LOCKC.height=Math.ceil(HT*RS);
(function(){var g=LOCKC.getContext('2d');g.scale(RS,RS);
  var gr=g.createLinearGradient(0,0,0,HT);gr.addColorStop(0,'#e3ece4');gr.addColorStop(1,'#d5e2d8');g.fillStyle=gr;g.fillRect(0,0,W,HT);
  for(var i=0;i<60;i++){var x=hs(i,31)*W,y=hs(i,33)*HT;g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(x,y,10+hs(i,35)*16,3+hs(i,37)*4,0,0,7);g.fill();}
  var P=[];for(var j=0;j<120;j++)P.push({x:hs(j,41)*W,y:hs(j,43)*HT,s:.8+hs(j,45)*.7});P.sort(function(a,b){return a.y-b.y;});
  P.forEach(function(p){var x=p.x,y=p.y,s=p.s;g.fillStyle='rgba(60,80,70,.18)';g.beginPath();g.ellipse(x+3*s,y+2,8*s,2.6*s,0,0,7);g.fill();
    g.fillStyle='#7a6450';g.fillRect(x-1.2*s,y-5*s,2.4*s,5*s);
    [[0,-26,9],[0,-18,11],[0,-10,13]].forEach(function(t,k){g.fillStyle=['#5f8f78','#557f6b','#4b725f'][k];g.beginPath();g.moveTo(x,y+t[1]*s-8*s);g.lineTo(x+t[2]*s,y+t[1]*s+4*s);g.lineTo(x-t[2]*s,y+t[1]*s+4*s);g.closePath();g.fill();
      g.fillStyle='rgba(250,253,255,.9)';g.beginPath();g.moveTo(x,y+t[1]*s-8*s);g.lineTo(x+t[2]*.55*s,y+t[1]*s-1.5*s);g.lineTo(x-t[2]*.55*s,y+t[1]*s-1.5*s);g.closePath();g.fill();});});
  g.fillStyle='rgba(235,243,238,.35)';g.fillRect(0,0,W,HT);})();
var SIGNP=null;
function drawOutskirts(g,x,side){
  var art=tileImg('snow-outskirts-'+side,112,function(c){
    var sky=c.createLinearGradient(0,0,0,HT);sky.addColorStop(0,'#a9d9ed');sky.addColorStop(.55,'#eefbff');sky.addColorStop(1,'#c4e8f3');c.fillStyle=sky;c.fillRect(0,0,112,HT);
    for(var ridge=0;ridge<3;ridge++){var base=70+ridge*85;c.fillStyle=['#68b3cd','#9cd7e6','#c9eef5'][ridge];c.beginPath();c.moveTo(0,base+100);c.lineTo(0,base+30);c.lineTo(22,base-25);c.lineTo(46,base+12);c.lineTo(78,base-48);c.lineTo(112,base+22);c.lineTo(112,base+100);c.fill();c.fillStyle='#f6fdff';c.beginPath();c.moveTo(62,base-17);c.lineTo(78,base-48);c.lineTo(96,base-10);c.lineTo(81,base-22);c.lineTo(74,base-12);c.fill();}
    for(var snow=0;snow<28;snow++){c.fillStyle='rgba(255,255,251,.35)';c.beginPath();c.ellipse(hs(snow,12)*112,hs(snow,15)*HT,8+hs(snow,16)*14,3,0,0,7);c.fill();}
    var trees=[];for(var i=0;i<24;i++)trees.push({x:side==='left'?20+hs(i,21)*40:52+hs(i,39)*38,y:140+hs(i,28)*(HT-170),s:.65+hs(i,32)*.65});trees.sort(function(a,b){return a.y-b.y;});
    trees.forEach(function(t){c.fillStyle='rgba(62,88,79,.16)';c.beginPath();c.ellipse(t.x+5,t.y+2,10*t.s,3*t.s,0,0,7);c.fill();c.fillStyle='#7b6858';c.fillRect(t.x-1.2*t.s,t.y-10*t.s,2.4*t.s,10*t.s);for(var k=0;k<3;k++){var yy=t.y-(35-k*9)*t.s,w=(11+k*3)*t.s;c.fillStyle=['#39ac87','#249875','#16765d'][k];c.beginPath();c.moveTo(t.x,yy-12*t.s);c.lineTo(t.x+w,yy+6*t.s);c.lineTo(t.x-w,yy+6*t.s);c.fill();c.fillStyle='#f5fcff';c.beginPath();c.moveTo(t.x,yy-12*t.s);c.lineTo(t.x+w*.6,yy-1*t.s);c.lineTo(t.x-w*.5,yy);c.fill();}});
    var fog=c.createLinearGradient(0,0,112,0);fog.addColorStop(0,side==='left'?'rgba(222,235,231,.35)':'rgba(241,245,237,.08)');fog.addColorStop(1,side==='left'?'rgba(241,245,237,.08)':'rgba(222,235,231,.35)');c.fillStyle=fog;c.fillRect(0,0,112,HT);
  },HT);g.drawImage(art,x,0,112,HT);
}
function drawLocked(){var x0=fenceX();if(x0>=W-1)return;var g=ctx,w=W-x0;
  g.drawImage(LOCKC,x0*RS,0,w*RS,HT*RS,x0,0,w,HT);
  drawOutskirts(g,x0,'right');
  var fg=g.createLinearGradient(x0,0,x0+26,0);fg.addColorStop(0,'rgba(40,60,45,.28)');fg.addColorStop(1,'rgba(40,60,45,0)');g.fillStyle=fg;g.fillRect(x0,0,26,HT);
  /* the next stage's sign, pinned just past the fence */
  var nx=S.stage===1?'2단계 · 호수 마을':'3단계 · 광산 마을',sy=Math.max(40,Math.min(H-60,camY+SH/Z*.5)),sx=x0+18;
  g.save();g.translate(sx,sy);g.fillStyle='#7a5a3c';g.fillRect(-1.5,0,3,22);g.fillStyle='rgba(0,0,0,.2)';rr(g,-8,-30,34,34,6);g.fill();
  g.fillStyle='#fff6e2';rr(g,-9,-32,34,34,6);g.fill();g.strokeStyle='#a4601f';g.lineWidth=1.5;rr(g,-9,-32,34,34,6);g.stroke();
  g.font='11px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('🔒',8,-23);g.font='900 8px sans-serif';g.fillStyle='#3f7a55';g.fillText(Math.floor(goalPct()*100)+'%',8,-12);g.font='800 6px sans-serif';g.fillStyle='#6b4a2a';g.fillText(S.stage===1?'2단계':'3단계',8,-4);g.restore();SIGNP={x:sx+8,y:sy-15};
  drawSideFence(g,x0);}
function drawSideFence(g,x0,v){v=v||villageAt(x0-1);var L=fenceLvV(v);if(!fenceUp(v))return;
  if(L<3){for(var ly=-4;ly<H+4;ly+=6.2)g.drawImage(LOGC,x0-6,ly-5,12,11);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x0-5,-4,1.2,H+8);
    if(L>=1){var col=['#8a6440','#9a7a52','#7f8994'][L-1];g.fillStyle=col;g.fillRect(x0+5,-4,2.2,H+8);g.fillRect(x0+9,-4,2.2,H+8);}
    return;}
  var wc=L>=5?'#c9bfae':(L>=4?'#a8a196':'#9a938a');g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x0+6,-4,4,H+8);
  brickWall(g,x0-7,-4,14,H+8,wc,'rgba(60,50,40,.35)');g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x0-7,-4,1.2,H+8);
  for(var my=4;my<H;my+=12){g.fillStyle=wc;g.fillRect(x0+7,my,5,7);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(x0+7,my+6,5,1);}
  if(L>=5){g.fillStyle='#e0b23c';g.fillRect(x0-7,-4,1.6,H+8);}
  if(L>=4)for(var ty=60;ty<H-20;ty+=150){g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x0-7,ty+2,18,18);brickWall(g,x0-9,ty-2,18,18,wc,'rgba(60,50,40,.35)');g.fillStyle='#3a2f28';rr(g,x0-1.5,ty+3,3,7,1.5);g.fill();}}
function bannerLines(g,text,width){
  var lines=[],line='';Array.from(text).forEach(function(ch){if(line&&g.measureText(line+ch).width>width){lines.push(line);line=ch;}else line+=ch;});if(line)lines.push(line);return lines;
}
function drawStageBanner(){
  if(!STAGEBAN)return;var g=ctx,unit=screenUnit||1,viewW=W/unit,small=viewW<380,k=Math.min(1,STAGEBAN.t/.4,((STAGEBAN.max||3.6)-STAGEBAN.t)/.25),top=((SH/unit)<500?148:190)*unit,w=Math.min(W-24*unit,440*unit),font=(small?18:20)*unit;
  g.save();g.globalAlpha=Math.max(0,k);g.textAlign='center';g.textBaseline='middle';g.font='700 '+font+'px sans-serif';var title=bannerLines(g,STAGEBAN.text,w-32*unit);g.font='500 '+(13*unit)+'px sans-serif';var subtitle=bannerLines(g,STAGEBAN.sub,w-32*unit),h=(20+title.length*(font/unit+5)+subtitle.length*18)*unit;
  g.fillStyle='rgba(39,51,43,.18)';rr(g,W/2-w/2+2*unit,top+4*unit,w,h,12*unit);g.fill();g.fillStyle='#fff7e5';rr(g,W/2-w/2,top,w,h,12*unit);g.fill();g.strokeStyle='#b6a27e';g.lineWidth=unit;g.stroke();g.fillStyle='#b77b43';rr(g,W/2-w/2,top,4*unit,h,2*unit);g.fill();
  g.fillStyle='#51432f';g.font='700 '+font+'px sans-serif';var y=top+15*unit+font/2;title.forEach(function(line){g.fillText(line,W/2,y);y+=font+5*unit;});g.font='500 '+(13*unit)+'px sans-serif';g.fillStyle='#50684f';subtitle.forEach(function(line){g.fillText(line,W/2,y);y+=18*unit;});g.restore();
}
/* v63: each village's stretch of wall is drawn with its own level */
function drawFence(){drawSideFence(ctx,3,1);if(fenceX()>=W-1)drawSideFence(ctx,W-3,S.stage||1);[[0,STAGE_W[0],1],[STAGE_W[0],STAGE_W[1],2],[STAGE_W[1],MX,3]].forEach(function(r){var v=r[2],L=fenceLvV(v);if(!L||v>(S.stage||1))return;ctx.save();ctx.beginPath();ctx.rect(r[0],0,r[1]-r[0],HT);ctx.clip();drawFenceV(v,L,(r[0]+r[1])/2);ctx.restore();});}
function drawFenceV(v,L,cx){
  var FDN=v===1?S.fenceDown:VFBREACH[v],HP=v===1?FENCEHP:(VFHP[v]||0),HPM=fMaxV(v);var g=ctx,FY=H+2,SEG=wallSegs(),GAPS=wallGaps(),inGap=function(x){for(var i=0;i<GAPS.length;i++)if(x>GAPS[i][0]-2&&x<GAPS[i][1]+2)return true;return false;};
  if(FDN){for(var bx=4;bx<MX;bx+=12){var hh=hs(bx,3);if(hh<.35)continue;g.save();g.translate(bx,FY+9);g.rotate((hh-.6)*1.6);g.fillStyle='#8a6440';rr(g,-1.5,-9,4,11,1.5);g.fill();g.restore();}
    for(var sx=10;sx<MX;sx+=38){g.fillStyle='#9a7a52';g.save();g.translate(sx,FY+12);g.rotate(hs(sx,5)-.5);g.fillRect(-8,-1,16,2.2);g.restore();}return;}
  if(isWinter()&&HP>0&&HP<HPM){var k0=HP/HPM;g.fillStyle='rgba(0,0,0,.35)';rr(g,cx-30,FY-10,60,5,2.5);g.fill();g.fillStyle=k0>.4?'#7cc0f5':'#ff8a3c';rr(g,cx-30,FY-10,60*k0,5,2.5);g.fill();}
  if(L>=3){var shk=0;BEARS.forEach(function(b){if(b.state==='fence'&&villageAt(b.x)===v)shk=Math.sin(time*40)*.6;});g.save();g.translate(shk,0);
    var wc=L>=5?'#c9bfae':(L>=4?'#a8a196':'#9a938a');
    SEG.forEach(function(sg){var w0=sg[1]-sg[0];g.fillStyle='rgba(0,0,0,.2)';g.fillRect(sg[0],FY+10,w0,3);brickWall(g,sg[0],FY-3,w0,13,wc,'rgba(60,50,40,.35)');
      g.fillStyle='rgba(255,255,255,.25)';g.fillRect(sg[0],FY-3,w0,1.2);if(L>=5){g.fillStyle='#e0b23c';g.fillRect(sg[0],FY-3,w0,1.4);}
      for(var mx=sg[0];mx<sg[1]-6;mx+=12){g.fillStyle=wc;g.fillRect(mx+1,FY-8,7,5);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(mx+7,FY-8,1,5);}
      /* gate pillars at every opening */
      [sg[0],sg[1]].forEach(function(px){if(px<=0||px>=MX)return;g.fillStyle='rgba(0,0,0,.2)';g.fillRect(px-4,FY-12,9,26);brickWall(g,px-5,FY-14,10,26,wc,'rgba(60,50,40,.35)');g.fillStyle=L>=5?'#e0b23c':'#7d746a';g.fillRect(px-6,FY-16,12,3);});});
    if(L>=4)for(var tx=30;tx<MX;tx+=120){if(inGap(tx))continue;g.fillStyle='rgba(0,0,0,.2)';g.fillRect(tx-7,FY-12,16,26);brickWall(g,tx-8,FY-14,16,26,wc,'rgba(60,50,40,.35)');for(var tm=0;tm<3;tm++){g.fillStyle=wc;g.fillRect(tx-8+tm*6,FY-18,4,4);}
      g.fillStyle='#3a2f28';rr(g,tx-1.5,FY-8,3,7,1.5);g.fill();
      if(L>=5){g.fillStyle='#e0b23c';g.fillRect(tx-8,FY-14,16,1.6);g.fillStyle='#6b5a44';g.fillRect(tx-.5,FY-30,1.2,12);var fw2=Math.sin(time*5+tx)*1.4;g.fillStyle='#c8453d';g.beginPath();g.moveTo(tx+.7,FY-30);g.lineTo(tx+9,FY-28+fw2*.3);g.lineTo(tx+.7,FY-25);g.closePath();g.fill();}}
    fenceCracks(g,FY,inGap,HP/HPM);if(v===1)towerBase(g,FY,L);g.restore();return;}
  var col=['#a75c2d','#b9753c','#a7b8c2','#8299a8','#d9a33f'][Math.min(4,L-1)],hi='#f7fbff';
  for(var x=4;x<MX;x+=12){if(inGap(x))continue;if(L<=2&&spriteReady('fence_segment')){if(x%24===4&&!inGap(x+10)&&!inGap(x-10))drawSprite(g,'fence_segment','static',0,x,FY+11,SPRITE_PPU*(L===2?1.15:1),false);continue;}var sh=0;BEARS.forEach(function(b){if(b.state==='fence'&&Math.abs(b.x-x)<24)sh=Math.sin(time*40)*1.2;});
    g.fillStyle='rgba(0,0,0,.15)';g.fillRect(x+1,FY+5,3,8);g.fillStyle=col;rr(g,x-1.5+sh,FY-2,4,13,1.5);g.fill();g.fillStyle=hi;g.fillRect(x-1.5+sh,FY-2,1.2,13);
    if(L>=3){g.fillStyle='#c9ced4';g.beginPath();g.moveTo(x-1.5+sh,FY-2);g.lineTo(x+.5+sh,FY-6);g.lineTo(x+2.5+sh,FY-2);g.closePath();g.fill();}}
  SEG.forEach(function(sg){var w0=sg[1]-sg[0];g.fillStyle=col;g.fillRect(sg[0],FY+2,w0,2.2);g.fillRect(sg[0],FY+7,w0,2.2);g.fillStyle=hi;g.fillRect(sg[0],FY+2,w0,.8);
    [sg[0],sg[1]].forEach(function(px){if(px<=0||px>=MX)return;g.fillStyle='#6b4a2a';rr(g,px-2.5,FY-6,5,18,1.5);g.fill();g.fillStyle='#e0b23c';g.fillRect(px-3,FY-7,6,2);});});
  fenceCracks(g,FY,inGap,HP/HPM);if(v===1)towerBase(g,FY,L);
}
/* v54 (staff 1): cracks spread across the fence/wall as a raid wears it down */
function fenceCracks(g,FY,gapFn,hk){if(!isWinter()||!(hk>0))return;var k=1-hk;if(k<=.08)return;var n=Math.floor(k*12),al=Math.min(.85,.3+k*.65);g.strokeStyle='rgba(40,25,15,'+al+')';g.lineWidth=1;g.lineJoin='miter';
  for(var i=0;i<n;i++){var x=10+hs(i,71)*(MX-20);if(gapFn(x))continue;var y=FY-1,dx=0;g.beginPath();g.moveTo(x,y);for(var j=0;j<4;j++){dx=(j%2?1:-1)*(1.2+hs(i,j)*1.4);y+=2.6;g.lineTo(x+dx,y);}g.stroke();
    if(k>.5){g.beginPath();g.moveTo(x+dx*.5,FY+4);g.lineTo(x+dx*.5+3,FY+6);g.stroke();}
    if(k>.82){g.fillStyle='rgba(60,45,30,'+(al*.6)+')';g.beginPath();g.ellipse(x+dx*.3,FY+9+hs(i,19)*3,2+hs(i,23)*1.4,1.1,0,0,7);g.fill();}}}
/* the watchtower stands on the wall: a bastion fills the opening under it */
function towerBase(g,FY,L){if(!(S.tower>0))return;var x0=TOWER.x-27,wc=L>=3?(L>=5?'#c9bfae':'#a8a196'):'#a8743f';
  g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x0+2,FY-8,56,24);brickWall(g,x0,FY-12,54,24,wc,'rgba(60,50,40,.35)');g.fillStyle='rgba(255,255,255,.22)';g.fillRect(x0,FY-12,54,1.4);
  for(var m=0;m<5;m++){g.fillStyle=wc;g.fillRect(x0+1+m*11,FY-18,7,6);}
  g.fillStyle='#3a2f28';rr(g,TOWER.x-7,FY-6,14,16,6);g.fill();g.fillStyle='rgba(255,210,120,.5)';rr(g,TOWER.x-5,FY-4,10,4,2);g.fill();
  if(L>=5){g.fillStyle='#e0b23c';g.fillRect(x0,FY-12,54,1.6);}}
/* auto mode: go fight, then scoop up the loot */
function autoHunt(a,dt){
  var b=null,bd=1e9;liveBears().forEach(function(x){if(x.state!=='attack'&&x.state!=='in')return;if(!walkXY(x.x,x.y))return;var d=Math.hypot(x.x-a.x,x.y-a.y);if(d<bd){bd=d;b=x;}});
  var tgt=b;if(!tgt&&bagN(a)<cap()){var ld=1e9;LOOT.forEach(function(L){if(L.z>0||!walkXY(L.x,L.y))return;var d=Math.hypot(L.x-a.x,L.y-a.y);if(d<ld){ld=d;tgt=L;}});}
  if(!tgt)return false;
  var t=tileAt(tgt.x,tgt.y),mt=tileOf(a);release(a);
  if(t&&mt&&!sameTile(t,mt)){if(!a.path.length)goTile(a,t);if(a.path.length){followPath(a,dt);return true;}}
  a.path=[];if(Math.hypot(tgt.x-a.x,tgt.y-a.y)>(b?bearR(b)+12:4))moveTo(a,tgt.x,tgt.y,dt); /* v89: stop at the bear's edge (the separation pass keeps the hero out of the bear) */
  return true;
}
function drawBear(b){
  if(!spriteVisible(b.x,b.y,110))return;
  var g=ctx,s=b.king?1.6:(b.boss?1.35:1),al=b.state==='dead'?Math.max(0,1-b.t):1,step=Math.sin(b.bob),x=b.x+b.kx;
  g.save();g.globalAlpha=al;g.translate(x,b.y);
  g.fillStyle='rgba(0,0,0,.16)';g.beginPath();g.ellipse(0,1,17*s,5*s,0,0,7);g.fill();
  if(b.state!=='dead'){var pr=(time*1.6)%1,pc=b.king?'214,52,70':'232,38,48';
    g.strokeStyle='rgba('+pc+',.95)';g.lineWidth=3;g.beginPath();g.arc(0,-14*s,13*s+Math.sin(time*5)*1.6*s,0,7);g.stroke();
    g.strokeStyle='rgba('+pc+','+(0.7*(1-pr))+')';g.lineWidth=2.2;g.beginPath();g.arc(0,-14*s,10*s+pr*22*s,0,7);g.stroke();}
  var rendered=drawSprite(g,b.king?'boss_bear':'polar_bear',b.state==='dead'||b.hurtT>0?'hurt':(b.state==='attack'?'attack':'walk'),time+b.bob*.1,0,0,SPRITE_PPU*(b.king?s/2.1:s),b.dir>0);
  if(!rendered){
  g.scale(b.dir*s,s);
  if(b.state==='dead'){g.rotate(-.5*Math.min(1,b.t*3));}
  /* v89: hurt - rears back and squashes, with a tiny shudder */
  var hk=b.state!=='dead'&&b.hurtT>0?Math.min(1,b.hurtT/.42):0,lowHp=b.state!=='dead'&&b.hp/b.max<.3;
  if(hk>0){g.translate((Math.random()-.5)*1.4*hk-2.5*hk,0);g.rotate(-.24*hk);g.scale(1-.08*hk,1+.07*hk);}
  var W1=b.flash>0?'#ffb0b0':(b.king?'#2c2a33':'#f5f8fb'),SH=b.flash>0?'#f08a8a':(b.king?'#17161c':'#d9e3ec');
  if(b.king&&b.state!=='dead'){g.fillStyle='rgba(120,20,40,'+(.18+.1*Math.sin(time*6))+')';g.beginPath();g.ellipse(0,-12,26,17,0,0,7);g.fill();}
  /* legs */
  g.fillStyle=SH;[[-9,step],[7,-step]].forEach(function(p){rr(g,p[0]-3,-7+p[1]*1.2,6,8,2.5);g.fill();});
  g.fillStyle=W1;[[-6,-step],[10,step]].forEach(function(p){rr(g,p[0]-3,-7+p[1]*1.2,6,8,2.5);g.fill();});
  /* body */
  g.fillStyle=W1;g.beginPath();g.ellipse(0,-12,15,9.5,0,0,7);g.fill();
  g.fillStyle=SH;g.beginPath();g.ellipse(-2,-7,11,3.5,0,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.ellipse(-4,-17,7,2.5,-.2,0,7);g.fill();
  g.fillStyle=W1;g.beginPath();g.arc(-14,-12,3,0,7);g.fill();
  /* head */
  g.fillStyle=W1;g.beginPath();g.arc(13,-16,7.5,0,7);g.fill();
  var eo=hk>0?2*hk:(lowHp?1.2:0);g.beginPath();g.arc(9.5-eo*.6,-22.5+eo,2.6,0,7);g.arc(15.5-eo*.8,-23+eo,2.6,0,7);g.fill();
  g.fillStyle='#e8b9c0';g.beginPath();g.arc(9.5-eo*.6,-22.5+eo,1.2,0,7);g.arc(15.5-eo*.8,-23+eo,1.2,0,7);g.fill();
  g.fillStyle='#efe6d6';g.beginPath();g.ellipse(18,-14.5,4.2,3.2,0,0,7);g.fill();
  g.fillStyle='#2b2b35';g.beginPath();g.ellipse(21,-15.5,1.8,1.3,0,0,7);g.fill();
  if(b.state==='dead'){g.strokeStyle='#2b2b35';g.lineWidth=1.1;g.beginPath();g.moveTo(12.6,-19.4);g.lineTo(15.4,-16.6);g.moveTo(15.4,-19.4);g.lineTo(12.6,-16.6);g.stroke();}
  else if(hk>0){g.strokeStyle='#2b2b35';g.lineWidth=1.5;g.lineCap='round';g.beginPath();g.moveTo(12.3,-19.9);g.lineTo(15.2,-18);g.lineTo(12.3,-16.3);g.stroke();
    /* wailing mouth + a tear */
    g.fillStyle='#7a2a35';g.beginPath();g.ellipse(18.6,-11.4,2.6,1.6+1.2*hk,0,0,7);g.fill();g.fillStyle='#e86a7a';g.beginPath();g.ellipse(18.6,-10.6,1.4,.8,0,0,7);g.fill();
    g.fillStyle='rgba(120,190,255,.95)';var ty=-15.5+(1-hk)*5;g.beginPath();g.moveTo(11.6,ty-2.2);g.quadraticCurveTo(13.2,ty+.4,11.6,ty+1);g.quadraticCurveTo(10,ty+.4,11.6,ty-2.2);g.fill();}
  else{g.beginPath();g.arc(14,-18,1.2,0,7);g.fill();
    if(lowHp){g.strokeStyle='#2b2b35';g.lineWidth=.8;g.beginPath();g.moveTo(12.4,-20.6);g.lineTo(15.6,-19.6);g.stroke();
      g.fillStyle='rgba(120,190,255,.9)';var sy2=-25+Math.abs(Math.sin(time*3))*2;g.beginPath();g.moveTo(7,sy2-2);g.quadraticCurveTo(8.6,sy2+.6,7,sy2+1.2);g.quadraticCurveTo(5.4,sy2+.6,7,sy2-2);g.fill();}}
  if(b.swipe>0&&b.state==='fence'){var swf=b.swipe;g.fillStyle=W1;g.beginPath();g.ellipse(16+swf*2,1+swf*9,4.2,3.2,1.3,0,7);g.fill();g.strokeStyle='#8a94a0';g.lineWidth=.8;for(var cf=-1;cf<=1;cf++){g.beginPath();g.moveTo(13+swf*1.5,-2+swf*9+cf*1.6);g.lineTo(15+swf*1.5,3+swf*9+cf*2.1);g.stroke();}
    if(swf>.4){g.strokeStyle='rgba(255,255,255,'+(swf-.4)*1.3+')';g.lineWidth=1.3;for(var sf=0;sf<2;sf++){g.beginPath();g.arc(16,5,7+sf*3,.3,2.1);g.stroke();}}}
  else if(b.swipe>0){var sw=b.swipe;g.fillStyle=W1;g.beginPath();g.ellipse(19+sw*4,-8-sw*7,4.2,3.2,-.6,0,7);g.fill();g.strokeStyle='#8a94a0';g.lineWidth=.7;for(var ci=-1;ci<=1;ci++){g.beginPath();g.moveTo(22+sw*4,-9-sw*7+ci*1.4);g.lineTo(25+sw*4,-10-sw*7+ci*1.8);g.stroke();}
    if(sw>.5){g.strokeStyle='rgba(255,255,255,'+(sw-.5)*1.6+')';g.lineWidth=1.4;for(var sl=0;sl<3;sl++){g.beginPath();g.arc(24,-10,9+sl*2.5,-1.2,.3);g.stroke();}}
    /* v86: occasionally the bear unleashes an ultimate - both paws swing together with a golden shockwave ring */
    if(b.ultSwipe){g.fillStyle=W1;g.beginPath();g.ellipse(-12-sw*4,-9-sw*6,4.2,3.2,.6,0,7);g.fill();g.strokeStyle='#8a94a0';g.lineWidth=.7;for(var ci2=-1;ci2<=1;ci2++){g.beginPath();g.moveTo(-15-sw*4,-10-sw*6+ci2*1.4);g.lineTo(-18-sw*4,-11-sw*6+ci2*1.8);g.stroke();}
      g.strokeStyle='rgba(255,210,110,'+Math.min(.9,sw*1.4)+')';g.lineWidth=1.6;g.beginPath();g.arc(0,-14,15+sw*3,0,7);g.stroke();}}
  if(b.boss){g.fillStyle='#e2463c';g.beginPath();g.moveTo(6,-11);g.lineTo(10,-6);g.lineTo(14,-11);g.closePath();g.fill();rr(g,5,-13,11,3,1.5);g.fill();
    g.fillStyle='#f0bb3f';g.beginPath();g.moveTo(8,-24);g.lineTo(9,-29);g.lineTo(11.5,-26);g.lineTo(13,-30);g.lineTo(14.5,-26);g.lineTo(17,-29);g.lineTo(18,-24);g.closePath();g.fill();}
  if(b.king){g.fillStyle='#ff3040';g.beginPath();g.arc(14,-18,1.6,0,7);g.arc(17.6,-18.4,1.3,0,7);g.fill();g.fillStyle='rgba(255,60,70,.35)';g.beginPath();g.arc(15,-18,4,0,7);g.fill();
    g.fillStyle='#5a1020';g.beginPath();g.moveTo(7,-24);g.lineTo(8,-31);g.lineTo(10.5,-26.5);g.lineTo(12.5,-33);g.lineTo(14.5,-26.5);g.lineTo(17,-31);g.lineTo(18,-24);g.closePath();g.fill();g.fillStyle='#ff3040';g.beginPath();g.arc(12.5,-27,1,0,7);g.fill();
    g.strokeStyle='#4a4652';g.lineWidth=.8;for(var sc2=-8;sc2<=4;sc2+=4){g.beginPath();g.moveTo(sc2,-20);g.lineTo(sc2+2,-14);g.stroke();}}
  if(b.roar>0&&b.state!=='dead'&&!(hk>0)){g.fillStyle='#7a2a35';g.beginPath();g.ellipse(19.5,-11.8,2.6,1+1.4*Math.abs(Math.sin(b.roar*14)),0,0,7);g.fill();}
  }
  g.restore();
  if(b.state==='dead')return;
  /* v54 (staff 1): roar - sound rings from the mouth and a pop-up shout */
  if(b.roar>0){var rk=1-b.roar/(b.roarMax||1.3),mx0=b.x+b.dir*20*s,my0=b.y-13*s;g.lineWidth=1.6;
    for(var ri=0;ri<3;ri++){var rp=(((b.roarMax||1.3)-b.roar)*1.5+ri*.33)%1;g.strokeStyle='rgba(255,255,255,'+(.75*(1-rp))+')';g.beginPath();g.arc(mx0,my0,5+rp*20*s,b.dir>0?-1:Math.PI-1,b.dir>0?1:Math.PI+1);g.stroke();}
    var rs=Math.min(1,rk*5)*(1+.06*Math.sin(time*30)),ra=Math.min(1,b.roar*2.5);g.save();g.globalAlpha=ra;g.translate(b.x,b.y-46*s);g.scale(rs,rs);g.font='900 '+(b.boss?13:11)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=3.6;g.strokeStyle='rgba(60,20,30,.9)';var rt=b.king?'크와아앙!!':'크아앙!';g.strokeText(rt,0,0);g.fillStyle=b.king?'#ff6070':(b.boss?'#ffd35a':'#ffffff');g.fillText(rt,0,0);g.restore();}
  /* v89: dizzy stars after a big hit, and a short cry bubble */
  if(b.dizzyT>0){var hx0=b.x+b.kx+b.dir*10*s,hy0=b.y-30*s,da=Math.min(1,b.dizzyT/.3);g.save();g.globalAlpha=da;
    for(var di=0;di<3;di++){var an=time*7+di*2.094,sx=hx0+Math.cos(an)*9*s,sy=hy0+Math.sin(an)*3*s;g.fillStyle=di===1?'#fff1a8':'#ffd34a';g.beginPath();
      for(var sk=0;sk<10;sk++){var rr2=sk%2?1.3:3.2,aa=sk/10*6.283-1.571;g.lineTo(sx+Math.cos(aa)*rr2,sy+Math.sin(aa)*rr2);}g.closePath();g.fill();}g.restore();}
  if(b.ouchTxt&&time-b.ouchAt<.75){var ok=(time-b.ouchAt)/.75,oy=b.y-56*s-ok*10,osc=ok<.15?.6+ok/.15*.5:1.1-.1*ok;g.save();g.globalAlpha=Math.min(1,(1-ok)*2.2);g.translate(b.x+b.dir*12*s,oy);g.scale(osc,osc);
    g.font='900 '+(b.boss||b.king?12:10.5)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';var ow=g.measureText(b.ouchTxt).width+10;
    g.fillStyle='rgba(255,255,255,.96)';rr(g,-ow/2,-8,ow,16,8);g.fill();g.beginPath();g.moveTo(-3,7);g.lineTo(-b.dir*6,13);g.lineTo(3,7);g.closePath();g.fill();
    g.strokeStyle='#e2566a';g.lineWidth=1.2;rr(g,-ow/2,-8,ow,16,8);g.stroke();g.fillStyle='#d6334a';g.fillText(b.ouchTxt,0,.5);g.restore();}
  /* hp bar + mood (v84: bigger, bordered and colour-graded so damage reads clearly at a glance) */
  var bw=40*s,bh=6.5*s,by=b.y-34*s-7;
  g.fillStyle='rgba(0,0,0,.5)';rr(g,b.x-bw/2-1.6,by-1.6,bw+3.2,bh+3.2,3.6);g.fill();
  var hk0=Math.max(0,b.hp/b.max),hcol0=b.king?'#ff3b5c':(b.boss?'#f0bb3f':(hk0>.5?'#5fd16a':(hk0>.25?'#f0a93f':'#e2463c')));
  g.fillStyle=hcol0;rr(g,b.x-bw/2,by,Math.max(2.5,bw*hk0),bh,2.6);g.fill();
  g.fillStyle='rgba(255,255,255,.4)';rr(g,b.x-bw/2,by,Math.max(2.5,bw*hk0),bh*.42,2);g.fill();
  g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.1;rr(g,b.x-bw/2,by,bw,bh,2.6);g.stroke();
  if(b.state==='attack'){g.font='700 10px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('😠',b.x+b.dir*12,by-7);}
}
function drawLoot(){
  LOOT.forEach(function(L){var bob=L.z>0?0:Math.sin(time*5+L.x)*1.2,blink=L.life<8&&Math.floor(L.life*4)%2===0;if(blink)return;
    ctx.fillStyle='rgba(0,0,0,.15)';ctx.beginPath();ctx.ellipse(L.x,L.y+3,6,2,0,0,7);ctx.fill();
    if(L.z<=0){ctx.drawImage(GLOW,L.x-14,L.y-18+bob,28,28);}
    drawItem(ctx,L.id,L.x,L.y-4-L.z+bob,1);});
}
function toScreen(x,y){return {x:(x-camX)*Z,y:(y-camY)*Z};}
function edgeMark(wx,wy,icon,col,big,count){
  var unit=screenUnit||1,p=toScreen(wx,wy),m=24*unit,top=80*unit,bot=SH-88*unit;if(p.x>=m&&p.x<=W-m&&p.y>=top&&p.y<=bot)return false;
  var cx=W/2,cy=(top+bot)/2,dx=p.x-cx,dy=p.y-cy,k=Math.min((W/2-m)/Math.max(1,Math.abs(dx)),((bot-top)/2)/Math.max(1,Math.abs(dy))),ex=cx+dx*k,ey=cy+dy*k,an=Math.atan2(dy,dx),bb=Math.sin(time*6)*2;
  var g=ctx,R=(big?15:11)*unit,pu=1;g.save();g.translate(ex-Math.cos(an)*bb,ey-Math.sin(an)*bb);g.scale(pu,pu);
  g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.arc(1,2,R,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(0,0,R,0,7);g.fill();
  if(big){g.strokeStyle=col;g.lineWidth=3;g.beginPath();g.arc(0,0,R-1.5,0,7);g.stroke();}
  g.save();g.rotate(an);g.fillStyle=col;g.beginPath();g.moveTo(R+4,0);g.lineTo(R-3,-5);g.lineTo(R-3,5);g.closePath();g.fill();g.restore();
  g.font='700 '+((big?13:11)*unit)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(icon,0,.5);if(count>1){g.fillStyle='#993f34';g.beginPath();g.arc(R*.7,-R*.7,7*unit,0,7);g.fill();g.fillStyle='#fff6e3';g.font='700 '+(9*unit)+'px sans-serif';g.fillText(String(count),R*.7,-R*.7);}g.restore();return true;
}
function drawTutEdge(){if(S.tut==null||S.tut>=TUT.length){if(defenseDue()){var dp=defensePad();if(dp)edgeMark(dp.x,dp.y,dp.id==='tower'?'🗼':'🪵','#e2463c');}return;}var p=TUT[S.tut].at();if(p)edgeMark(p.x,p.y,'⭐','#e2463c');}
var ZBTN={x:6,y:6,w:30,h:30};
function drawZoomBtn(){var g=ctx,b=ZBTN;g.fillStyle='rgba(0,0,0,.18)';rr(g,b.x+1,b.y+2,b.w,b.h,9);g.fill();g.fillStyle='rgba(255,252,240,.95)';rr(g,b.x,b.y,b.w,b.h,9);g.fill();
  g.strokeStyle='rgba(91,70,54,.35)';g.lineWidth=1;rr(g,b.x+.5,b.y+.5,b.w-1,b.h-1,9);g.stroke();
  g.font='700 14px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(S.zoomOut?'🔍':'🗺️',b.x+b.w/2,b.y+b.h/2+1);}
function drawBearChip(){
  if(tutOn())return;var g=ctx,lb=liveBears(),lab,s,warn=false,col;
  if(isWinter()){s=Math.ceil(winterLeft());lab=(lb.length?'🐻‍❄️ 곰 습격 중! ':'🐻‍❄️ 습격 시간 ')+'끝까지 '+Math.floor(s/60)+':'+('0'+s%60).slice(-2);col=lb.length?'rgba(214,52,70,.95)':'rgba(47,104,160,.93)';warn=lb.length>0;}
  else{s=Math.ceil(toWinter());warn=s<=30;lab=warn?'⚠️ 곧 곰 습격! '+Math.floor(s/60)+':'+('0'+s%60).slice(-2):'🐻‍❄️ 곰 습격까지 '+Math.floor(s/60)+':'+('0'+s%60).slice(-2);col=warn?'rgba(214,52,70,.96)':'rgba(34,53,43,.82)';}
  var fs=warn?20:16,pul=warn?1+.07*Math.abs(Math.sin(time*6)):1,shk=warn&&!isWinter()&&s<=10?Math.sin(time*42)*2.2:(warn?Math.sin(time*20)*.8:0);
  if(warn&&!isWinter()&&s<=10&&s!==drawBearChip.last){drawBearChip.last=s;sfx('tap');}
  /* v64: the countdown text now lives in the header (#bearChip, filled by refreshUI); only the warning glow and off-screen arrows stay on the map */
  if(warn&&!isWinter()){var va=.12+.1*Math.sin(time*6);var vg=g.createRadialGradient(W/2,SH/2,Math.min(W,SH)*.42,W/2,SH/2,Math.max(W,SH)*.72);vg.addColorStop(0,'rgba(214,52,70,0)');vg.addColorStop(1,'rgba(214,52,70,'+va+')');g.fillStyle=vg;g.fillRect(0,0,W,SH);}
  /* off-screen pointer */
  var groups={};lb.forEach(function(b){var p=toScreen(b.x,b.y),unit=screenUnit||1;if(p.x>=24*unit&&p.x<=W-24*unit&&p.y>=80*unit&&p.y<=SH-88*unit)return;var dx=p.x-W/2,dy=p.y-SH/2,key=Math.abs(dx/W)>Math.abs(dy/SH)?(dx<0?'left':'right'):(dy<0?'top':'bottom');var q=groups[key]||(groups[key]={x:0,y:0,n:0});q.x+=b.x;q.y+=b.y;q.n++;});
  Object.keys(groups).forEach(function(k){var q=groups[k];edgeMark(q.x/q.n,q.y/q.n,'🐻‍❄️','#b75e4a',true,q.n);});
}

