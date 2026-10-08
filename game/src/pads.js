/* ---------- pads: stand on one and your coins pour in until it is built ---------- */
var PADLIST=[];
var PAD_W=34,PAD_H=30,PAD_RADIUS=14;
/* Stable upgrade slots sit in the walkways beside their own facilities. */
var PAD_LAYOUT={
  shop_wood:{x:338,y:94},
  shopstaff_wood:{x:338,y:40},
  autocash:{x:180,y:164},
  belt_f1:{x:330,y:220},
  beltup_wood:{x:330,y:280},
  hire_lumber:{x:210,y:260},
  wup_lumber:{x:210,y:320},
  site_f1:{x:150,y:390},
  hire_hunter:{x:110,y:488},
  wup_hunter:{x:110,y:540},
  tower:{x:50,y:430},
  pbelt_mill:{x:330,y:380},
  mill:{x:228,y:380},
  pst_mill:{x:192,y:380},
  fence:{x:140,y:584},
  shop_fish:{x:504,y:94},
  shopstaff_fish:{x:504,y:50},
  belt_p1:{x:570,y:159},
  beltup_fish:{x:620,y:220},
  hire_fisher:{x:378,y:230},
  wup_fisher:{x:378,y:290},
  site_p1:{x:480,y:140},
  hire_hunter2:{x:378,y:390},
  wup_hunter2:{x:426,y:390},
  vtower2:{x:410,y:430},
  pbelt_smoke:{x:467,y:396},
  smoke:{x:604,y:396},
  pst_smoke:{x:508,y:396},
  vfence2:{x:460,y:578},
  site_m1:{x:984,y:146},
  beltup_iron:{x:1038,y:160},
  hire_miner:{x:720,y:110},
  wup_miner:{x:720,y:170},
  smelt:{x:974,y:210},
  pbelt_smelt:{x:810,y:210},
  pst_smelt:{x:867,y:210},
  hire_hunter3:{x:1038,y:340},
  wup_hunter3:{x:1038,y:400},
  elec:{x:974,y:407},
  pbelt_elec:{x:810,y:407},
  pst_elec:{x:867,y:407},
  vtower3:{x:770,y:430},
  vfence3:{x:720,y:578}
};
PAD_LAYOUT.fence_fix=PAD_LAYOUT.fence;PAD_LAYOUT.tower_fix=PAD_LAYOUT.tower;
PAD_LAYOUT.vfence_fix2=PAD_LAYOUT.vfence2;PAD_LAYOUT.vfence_fix3=PAD_LAYOUT.vfence3;
function padBounds(p){return {x:p.x-PAD_W/2,y:p.y-PAD_H/2,w:PAD_W,h:PAD_H};}
function rectTouches(a,b,gap){gap=gap||0;return a.x<b.x+b.w+gap&&a.x+a.w+gap>b.x&&a.y<b.y+b.h+gap&&a.y+a.h+gap>b.y;}
function padObstacles(){
  var out=PLOTS.map(function(p){return {x:p.x-6,y:p.y-12,w:p.w+12,h:p.h+20,plot:p.def};});
  if(typeof XTOWERS!=='undefined')XTOWERS.forEach(function(t){out.push({x:t.x-28,y:470,w:56,h:136,tower:t.v});});
  SITES.forEach(function(s){out.push({x:s.x,y:s.y,w:s.w,h:s.h,site:s.id});[s.store,s.xtT].forEach(function(t){if(t)out.push({x:t.c*T,y:t.r*T,w:T,h:T,site:s.id});});});
  LINES.forEach(function(line){var s=STALL[line];out.push({x:s.x-40,y:s.y-18,w:84,h:144});});
  Object.keys(BPATH).forEach(function(k){var pts=BPATH[k];for(var i=1;i<pts.length;i++){var a=pts[i-1],b=pts[i];out.push({x:Math.min(a[0],b[0])-14,y:Math.min(a[1],b[1])-14,w:Math.abs(a[0]-b[0])+28,h:Math.abs(a[1]-b[1])+28,belt:k});}});
  out.push({x:666,y:356,w:48,h:54});return out;
}
var fencePadAnchor=null;
function nearbyFenceSlot(pads){
  var a=agents[0],fx=fenceX(),edges=[{side:'left',distance:a.x,v:1},{side:'right',distance:fx-a.x,v:S.stage||1},{side:'bottom',distance:H-a.y,v:villageAt(a.x)}];edges.sort(function(a,b){return a.distance-b.distance;});var e=edges[0];
  if(e.distance>90){fencePadAnchor=null;return null;}
  var key=e.side+'-'+e.v+'-'+Math.round(fx);
  if(fencePadAnchor&&fencePadAnchor.key===key&&Math.hypot(a.x-fencePadAnchor.x,a.y-fencePadAnchor.y)<46){
    if(!fencePadAnchor.armed&&joy.on&&joy.moved&&(fencePadAnchor.x-a.x)*joy.dx+(fencePadAnchor.y-a.y)*joy.dy>0)fencePadAnchor.armed=true;
    return fencePadAnchor;
  }
  var slot=e.side==='bottom'?{x:Math.max(24,Math.min(fx-24,a.x)),y:H+2}:{x:e.side==='left'?3:fx-3,y:Math.max(24,Math.min(H-24,a.y))};
  var neighbors=(pads||PADLIST).filter(function(p){return !/^(fence|fence_fix|vfence[23]|vfence_fix[23])$/.test(p.id);});
  for(var i=0;i<7;i++){var off=i===0?0:Math.ceil(i/2)*36*(i%2?1:-1),candidate=e.side==='bottom'?{x:Math.max(24,Math.min(fx-24,a.x+off)),y:H+2}:{x:slot.x,y:Math.max(24,Math.min(H-24,a.y+off))};if(villageAt(candidate.x)!==e.v||neighbors.some(function(p){return rectTouches(padBounds(candidate),padBounds(p),3);}))continue;slot=candidate;break;}
  slot.key=key;slot.side=e.side;slot.v=e.v;slot.floating=true;slot.requireIntent=true;slot.armed=false;fencePadAnchor=slot;return slot;
}
var CONSTRUCTION_SLOTS={};
function constructionSlot(p){return CONSTRUCTION_SLOTS[p.id]||(CONSTRUCTION_SLOTS[p.id]=plannedConstructionSlot(p));}
function plannedConstructionSlot(p){
  var id=p.id,lot;
  if(id.indexOf('belt_')===0||id.indexOf('pbelt_')===0){
    var key=id.indexOf('pbelt_')===0?'proc_'+SITE_OF[id.slice(6)]:'sale_'+id.slice(5),pts=BPATH[key],segment=null;
    for(var i=1;i<pts.length;i++){var a=pts[i-1],b=pts[i];if(a[0]===b[0]&&(!segment||Math.abs(b[1]-a[1])>segment.length))segment={x:a[0],lo:Math.min(a[1],b[1]),hi:Math.max(a[1],b[1]),length:Math.abs(b[1]-a[1])};}
    if(!segment)return null;
    // Center the pad in the unobstructed belt span, between the existing buildings.
    var spans=[[segment.lo,segment.hi]];
    padObstacles().filter(function(o){return !o.belt&&segment.x>=o.x-PAD_W/2-3&&segment.x<=o.x+o.w+PAD_W/2+3;}).forEach(function(o){var next=[];spans.forEach(function(span){if(o.y>span[0])next.push([span[0],Math.min(span[1],o.y-3)]);if(o.y+o.h<span[1])next.push([Math.max(span[0],o.y+o.h+3),span[1]]);});spans=next.filter(function(s){return s[1]-s[0]>=PAD_H;});});
    spans.sort(function(a,b){return (b[1]-b[0])-(a[1]-a[0]);});var span=spans[0]||[segment.lo,segment.hi];return {x:segment.x,y:(span[0]+span[1])/2,belt:key};
  }
  if(id.indexOf('pst_')===0){lot=plotOf(id.slice(4));return {x:shedX(lot)+22,y:lot.y+99,plot:lot.def};}
  if(id.indexOf('site_')===0){var site=SITE[id.slice(5)];return {x:site.x+site.w/2,y:site.y+site.h/2,site:site.id};}
  if(id.indexOf('vtower')===0){var v=Number(id.slice(-1)),tower=XTOWERS.filter(function(t){return t.v===v;})[0];return {x:tower.x,y:540,tower:v};}
  lot=PLOTS.filter(function(p){return p.def===id;})[0];return lot?{x:lot.x+lot.w/2,y:lot.y+lot.h/2,plot:lot.def}:null;
}
function isConstructionPad(id){
  if(['mill','smoke','smelt','elec','tower'].indexOf(id)>=0)return !S[id];
  if(id.indexOf('belt_')===0)return !S.cv[id.slice(5)];
  if(id.indexOf('pbelt_')===0)return !(S.pcv&&S.pcv[id.slice(6)]);
  if(id.indexOf('pst_')===0)return !(S.pst&&S.pst[id.slice(4)]);
  if(id.indexOf('vtower')===0)return !(S.vt&&S.vt[Number(id.slice(-1))]);
  return id.indexOf('site_')===0&&!owned(id.slice(5));
}
function arrangePads(pads){
  /* Repairs follow their target but stay clear of every facility and reserved upgrade slot. */
  var obstacles=null,placed=[];
  pads.forEach(function(p){var slot=p.perimeter||PAD_LAYOUT[p.id];if(slot){p.x=slot.x;p.y=slot.y;if(p.construction){var target=constructionSlot(p);if(target){p.x=target.x;p.y=target.y;p.target=target;}}placed.push(p);}});
  pads.forEach(function(p){if(p.perimeter||PAD_LAYOUT[p.id])return;if(!obstacles)obstacles=padObstacles();
    var best=null,score=Infinity,fx=fenceX();
    for(var y=24;y<H-20;y+=40)for(var x=24;x<fx-20;x+=40){var box=padBounds({x:x,y:y});
      if(obstacles.some(function(o){return rectTouches(box,o,7);}))continue;
      if(Object.keys(PAD_LAYOUT).some(function(id){return rectTouches(box,padBounds(PAD_LAYOUT[id]),6);}))continue;
      if(placed.some(function(q){return rectTouches(box,padBounds(q),6);}))continue;
      var d=Math.hypot(x-p.x,y-p.y);if(d<score){score=d;best={x:x,y:y};}}
    if(best){p.x=best.x;p.y=best.y;}placed.push(p);
  });return pads.filter(function(p){return !!p.perimeter||p.x+PAD_W/2<=fenceX()-3;});
}
function padPos(id){for(var pi=0;pi<PADLIST.length;pi++)if(PADLIST[pi].id===id)return {x:PADLIST[pi].x,y:PADLIST[pi].y};return null;}
function buildPads(){
  var L=[];if(!DEF.trunk)return L;
  function add(id,d,x,y,label,icon,cap,role,badge,mini){
    var slot=PAD_LAYOUT[id];if(slot){x=slot.x;y=slot.y;}
    if(!d||(d.hidden&&d.hidden()))return null;
    var maxed=d.isMax();if(maxed)return null;
    if(x>fenceX()-8||(id==='wup_fisher'&&S.stage<2))return null;
    if(tutOn()&&TUTPAD[S.tut]!==id)return null;
    var p={id:id,d:d,x:x,y:y,construction:isConstructionPad(id),label:maxed?'🌟 최고 레벨이에요':label,icon:icon,cap:maxed?'MAX':cap,role:role,badge:maxed?'max':badge,mini:!!mini,maxed:maxed};L.push(p);return p;
  }
  /* each site's spare tile: top half grows the site, bottom half hires; crew upgrades wait in the strip below the fields */
  [['f1','lumber','🌲','숲','나무꾼','더 좋은 나무',40],['p1','fisher','🎣','호수','낚시꾼','더 좋은 물고기',200],['m1','miner','⛏️','광산','광부','더 좋은 광석',270]].forEach(function(o){var st=SITE[o[0]],px=st.padT.c*T+30+(st.padDx||0),py=st.padT.r*T,sitePadY=py+(o[0]==='p1'?28:14);if(o[0]==='f1'){px=150;sitePadY=384;}
    add('site_'+o[0],DEF['site_'+o[0]],px,sitePadY,owned(o[0])?o[3]+' 키우기 · '+o[5]:o[3]+' 개척 · 철광석 채굴 시작',o[2],owned(o[0])?'Lv'+siteLv(o[0]):'개척',null,owned(o[0])?'lv':'new');
    var hp0={lumber:{x:150,y:190},fisher:{x:270,y:190},miner:{x:480,y:190}}[o[1]],hx=hp0.x,hy=hp0.y;
    /* v79 (director 2026-10-05): hire vs level-up pads were confused even with different badge shapes - each pad's cap tag now literally says 고용/강화 */
    add('hire_'+o[1],DEF['hire_'+o[1]],hx,hy,o[4]+' 한 명 더 고용','',o[4]+' 고용 '+count(o[1])+'명',o[1],'new');
    /* Hire and equipment pads get a wide 85px vertical gap; the lake column stays inside its Stage 2 boundary. */
    var wd=DEF['wup_'+o[1]],wp={lumber:{x:150,y:275},fisher:{x:270,y:275},miner:{x:480,y:275}}[o[1]];add('wup_'+o[1],wd,wp.x,wp.y,wd.label(),'',o[4]+' 강화 '+wd.lv(),o[1],'up');});
  /* Defense tiles share a spaced row above the workshops, away from the actual towers and wall gates. */
  add('fence_fix',S.fenceDown?FIXDEF.fence:null,30,440,S.fence>=3?'무너진 성벽 수리':'부서진 울타리 수리','🔧',S.fence>=3?'성벽 수리':'울타리 수리',null,'fix');
  if(!S.fenceDown)add('fence',DEF.fence,30,440,'곰을 막는 울타리','🪵',(S.fence>=3?'성벽':'울타리')+(S.fence?' Lv'+S.fence:''),null,S.fence?'up':'new');
  /* v64: lake / mine village hunters: hire + upgrade pads above each village's workshop */
  /* v67 (director): every village's hunter hire + upgrade pads sit side by side in one row above the workshops - forest, lake, mine - so they are always in the same place */
  /* v71 (director): hunter hire + upgrade pads moved above the watchtower, hire on top of upgrade like the crews - forest, lake, mine columns side by side */
  if(huntReady())[['hunter',1,90,150],['hunter2',2,210,270],['hunter3',3,420,500]].forEach(function(o){if((S.stage||1)<o[1])return;add('hire_'+o[0],DEF['hire_'+o[0]],o[2],330,HNAME[o[0]]+' 한 명 더','','사냥꾼 고용 '+count(o[0])+'명',o[0],'new');var wd2=DEF['wup_'+o[0]];add('wup_'+o[0],wd2,o[3],330,wd2.label(),'','사냥꾼 강화 '+wd2.lv(),o[0],'up');});
  /* Each village gets a separate fence/tower tile, spaced 80px apart in the defense row. */[[2,270,190,'호수'],[3,430,350,'광산']].forEach(function(o){var v=o[0];if((S.stage||1)<v||!huntReady())return;var tl=(S.vt&&S.vt[v])||0,fl=(S.vf&&S.vf[v])||0;
    add('vtower'+v,DEF['vtower'+v],o[1],440,tl?o[3]+' 망루 강화 · '+(tl<TOWER_MAX?TWNAME[TWPN[Math.min(TOWER_MAX,tl+1)]]:'최대'):o[3]+' 마을 망루 짓기','🗼','망루'+(tl?' Lv'+tl:''),null,tl?'up':'new');
    if(VFBREACH[v])add('vfence_fix'+v,VFIXDEF[v],o[2],440,o[3]+' 마을 성벽 수리','🔧',o[3]+' 성벽 수리',null,'fix');
    else add('vfence'+v,DEF['vfence'+v],o[2],440,fl?o[3]+' 성벽 강화':o[3]+' 마을 울타리 치기','🪵',(fl>=3?'성벽':'울타리')+(fl?' Lv'+fl:''),null,fl?'up':'new');});
  /* Shared village upgrades have their own pads in a clear row below the workshop. */
  add('autocash',DEF.autocash,90,384,'손님·트럭 돈을 알아서 챙겨요','💰','자동 수금',null,S.autocash?'up':'new');
  add('beltup_wood',DEF.beltup_wood,150,130,'숲 벨트가 굵고 빨라져요','⚙️','숲 벨트 '+DEF.beltup_wood.lv(),null,'up');
  add('beltup_fish',DEF.beltup_fish,210,384,'호수 벨트가 굵고 빨라져요','⚙️','호수 벨트 '+DEF.beltup_fish.lv(),null,'up');
  add('beltup_iron',DEF.beltup_iron,510,140,'광산 벨트가 굵고 빨라져요','⚙️','광산 벨트 '+DEF.beltup_iron.lv(),null,'up');
  add('belt_f1',DEF.belt_f1,90,172,'숲 → 나무 가게 벨트 · 자동 운반','⚙️','숲 벨트',null,'new');
  add('belt_p1',DEF.belt_p1,210,172,'호수 → 생선 가게 벨트 · 자동 운반','⚙️','호수 벨트',null,'new');
  PLOTS.forEach(function(pl){var cx=pl.x+pl.w/2,cy=pl.y+pl.h/2+4,d=DEF[pl.def],X=pl.x,Y=pl.y;

    if(!pl.built()){if(pl.id==='tower')add('tower',d,110,440,'숲 망루 짓기','🗼','망루 건설',null,'new');else if(!pl.show||pl.show())add(pl.def,d,cx,cy,pl.name+' 짓기',{mill:'🪚',smoke:'🔥',smelt:'🏭',elec:'📺',tower:'🗼'}[pl.def],pl.name,null,'new');return;}
    if(PROC[pl.def]){var b=pl.def,Lb=S[b]||0,bpk=BPATH['proc_'+SITE_OF[b]],ent=[bpk[bpk.length-1][0],Y+46];
      /* Space the belt, machine and storage boards around each workshop plot. */
      var pp={mill:{belt:{x:X+26,y:Y+46},machine:{x:X+86,y:Y+25},storage:{x:X+86,y:Y+85}},smoke:{belt:{x:X+86,y:Y+46},machine:{x:X+26,y:Y+25},storage:{x:X-30,y:Y+60}},smelt:{belt:{x:X+116,y:Y+46},machine:{x:X+26,y:Y+30},storage:{x:X+26,y:Y+85}},elec:{belt:{x:X+26,y:Y+46},machine:{x:X+86,y:Y+25},storage:{x:X+126,y:Y+85}}}[b];
      add('pbelt_'+b,DEF['pbelt_'+b],pp.belt.x,pp.belt.y,{mill:'숲 → 제재소',smoke:'강 → 훈제소',smelt:'광산 → 제련소',elec:'제련소 → 전자 공장'}[b]+' 벨트','⚙️','벨트 연결',null,'new');
      add(b,d,pp.machine.x,pp.machine.y,Lb===5?'✨ 첨단 '+pl.name+'로 업그레이드! · 한 번에 4개':pl.name+' 강화 · 더 빨리'+(b!=='elec'&&procYield(Lb+1)>procYield(Lb)?' · 한 번에 '+procYield(Lb+1)+'개!':''),{mill:'🪚',smoke:'🔥',smelt:'🏭',elec:'📺'}[b],(Lb>=6?'✨':'')+pl.name+' Lv'+Lb,null,Lb===5?'new':'up');
      var sL=(S.pst&&S.pst[b])||0;add('pst_'+b,DEF['pst_'+b],pp.storage.x,pp.storage.y,b==='smelt'?(sL?'자재 창고 넓히기 · 철판·유리·플라스틱을 더 쌓아요':'자재 창고 짓기'):(sL?'창고 Lv'+(sL+1)+' · 가공 +'+(25*(sL+1))+'% · 트럭 값 +'+(30*(sL+1))+'%'+(sL+1===3||sL+1===5?' · 한 번에 +'+(sL+1===5?2:1)+'개!':''):'창고 짓기 · 가공 +25% · 트럭이 바로 실어 가요'),'📦',sL?'창고 Lv'+sL:'창고 짓기',null,sL?'up':'new');}
    else if(pl.id==='tower'){
      if(S.towerDown)add('tower_fix',FIXDEF.tower,110,440,'무너진 망루 수리','🔧','망루 수리',null,'fix');else add('tower',d,110,440,'망루 강화 · '+(S.tower<TOWER_MAX?TWNAME[TWPN[Math.min(TOWER_MAX,S.tower+1)]]+(S.tower+1>=2?' · 맵 전체 사격':''):'최대'),'🗼','망루 Lv'+S.tower,null,'up');}});
  LINES.forEach(function(l){var st=STALL[l];add('shopstaff_'+l,DEF['shopstaff_'+l],st.x+60,st.y-30,'가게 일손 · '+(shopStaffLevel(l)%2===0?'점원 고용':'진열대 추가'),'⭐','일손 Lv'+shopStaffLevel(l),null,'up');});
  LINES.forEach(function(l){var s0=STALL[l];add('shop_'+l,DEF['shop_'+l],s0.x+(l==='wood'?0:10),s0.y+52,SHOPDEF[l].name+' 키우기 · '+SHOP_STAGE[shopStage(S.shop[l]+1)]+(shopStage(S.shop[l]+1)>shopStage(S.shop[l])?'(으)로 변신!':'')+' · 동시 응대 '+Math.min(4,1+Math.floor(S.shop[l]/2))+'명','🏪',SHOPDEF[l].name+' Lv'+S.shop[l],null,'up');});
  repairs().forEach(function(e,i){var t=repTarget(e);add('rep_'+e.k+(e.key||e.line||e.sid||e.wi)+(e.tr||''),repDef(e),t.x,t.y+18,'곰이 부순 곳 고치기','🔧','수리',null,'fix');});
  var edge=nearbyFenceSlot(L);L=L.filter(function(p){if(!/^(fence|fence_fix|vfence[23]|vfence_fix[23])$/.test(p.id))return true;var v=p.id.indexOf('vfence')===0?Number(p.id.slice(-1)):1;if(!edge||edge.v!==v)return false;p.perimeter=edge;return true;});
  return arrangePads(L);
}
var padHold=null,padInit=false,padHoldP=null;
function updatePads(dt){
  PADLIST=buildPads();
  var a=agents[0],on=null;
  if(PINCH||PINCH_USED){a.padDwell=0;return;}
  var nearPad=null;
  /* Auto-walk can stop on a pad too; pad collection only depends on standing still in its radius. */
  if(!a.moving&&!a.mv){var pbd=1e9;PADLIST.forEach(function(p){if(p.perimeter&&p.perimeter.requireIntent&&!p.perimeter.armed)return;var dd=Math.hypot(a.x-p.x,a.y-p.y);if(dd<PAD_RADIUS&&dd<pbd){pbd=dd;nearPad=p;}});}
  /* v54 (staff 7): the start-on-a-pad guard must look at the pad you are standing on before the short dwell delay - before, the first frame never had a pad yet so the guard did nothing */
  if(!padInit&&nearPad){padInit=true;padHold=nearPad.id;padHoldP={x:nearPad.x,y:nearPad.y};}
  if(nearPad){a.padDwell=(a.padDwell||0)+dt;if(a.padDwell>=.06)on=nearPad;}else{a.padDwell=0;a.payTick=0;a.payId=null;}
  if(on&&!a.moving&&!on.perimeter){a.x+=(on.x-a.x)*Math.min(1,dt*10);a.y+=(on.y-a.y)*Math.min(1,dt*10);}
  if(!padInit){padInit=true;if(on){padHold=on.id;padHoldP={x:on.x,y:on.y};}}
  if(on&&padHold&&padHold!==on.id&&padHoldP&&Math.hypot(on.x-padHoldP.x,on.y-padHoldP.y)<10)padHold=on.id;
  PADLIST.forEach(function(p){p.active=p===on;p.held=on&&p===on&&padHold===p.id;});
  if(!on){if(!nearPad||nearPad.id!==padHold){padHold=null;padHoldP=null;}return;}
  if(padHold&&padHold!==on.id)padHold=null;
  if(padHold===on.id)return;
  if(!S.pads)S.pads={};
  var cost=on.d.cost(),paid=S.pads[on.id]||0;
  if(on.d.isMax()){delete S.pads[on.id];return;}
  if(on.d.lock&&on.d.lock()){if(padMsgT<=0){addFloat(on.x,on.y-26,on.d.lock(),'#ffb3b3');sfx('nope');padMsgT=2.5;}return;}
  if(a.payId!==on.id){a.payId=on.id;a.payTick=0;a.padFlyT=0;a.padAmtT=0;}
  var rate=Math.max(80,cost/.70);a.payTick=(a.payTick||0)+rate*dt;
  var amt=Math.min(cost-paid,S.coins,Math.floor(a.payTick/50)*50);
  if(amt===0&&S.coins>=50)return;a.payTick=Math.max(0,a.payTick-amt);
  if(amt<=0){if(padMsgT<=0){addFloat(on.x,on.y-26,'코인이 부족해요','#ffb3b3');sfx('nope');padMsgT=2.5;}return;}
  S.coins-=amt;paid+=amt;S.pads[on.id]=paid;
  a.padFlyT=(a.padFlyT||0)-dt;if(a.padFlyT<=0){a.padFlyT=.075;for(var coin=0;coin<3;coin++)fly('bigcoin',a.x+(coin-1)*10,a.y-25-coin*3,on.x+(coin-1)*7,on.y-3,.28+coin*.06,'payment');burst(on.x,on.y-3,'#ffe27a',3,false);sfx('coin',.12);}a.padAmtT=(a.padAmtT||0)-dt;if(a.padAmtT<=0){a.padAmtT=.22;addFloat(on.x,on.y-31,'-₩'+fmt(amt),'#ffe27a',true);}

  if(paid>=cost-.001){a.payTick=0;S.coins+=paid;delete S.pads[on.id];padHold=on.id;padHoldP={x:on.x,y:on.y};buy(on.d,true);if(on.id==='lodge'&&S.tut===4)tutNext();}
}
function padIcon(p){if(p.icon)return p.icon;if(p.id.indexOf('site_')===0)return SITE[p.id.slice(5)].kind==='forest'?'🌲':'🎣';if(p.id.indexOf('belt_')===0)return '⚙️';return {lodge:'🏠',tower:'🏹',wh:'🏭',wh2:'🏭'}[p.id]||'⭐';}
function drawTapMark(){var a=agents[0];if(!a.tap)return;var g=ctx,ph=(time*2)%1;g.strokeStyle='rgba(255,255,255,'+(.9-ph*.6)+')';g.lineWidth=1.6;g.beginPath();g.ellipse(a.tap.x,a.tap.y+6,5+ph*6,2+ph*2.4,0,0,7);g.stroke();g.fillStyle='rgba(240,187,63,.9)';g.beginPath();g.ellipse(a.tap.x,a.tap.y+6,2.2,1,0,0,7);g.fill();}
function padTitle(p){
  var id=p.id;
  if(id.indexOf('hire_')===0){var role=id.slice(5),nm={lumber:'나무꾼',fisher:'낚시꾼',miner:'광부',hunter:'숲 사냥꾼',hunter2:'호수 사냥꾼',hunter3:'광산 사냥꾼'}[role]||'일꾼';return [nm,'한 명 고용'];}
  if(id.indexOf('wup_')===0){var role2=id.slice(4),nm2={lumber:'나무꾼',fisher:'낚시꾼',miner:'광부',hunter:'숲 사냥꾼',hunter2:'호수 사냥꾼',hunter3:'광산 사냥꾼'}[role2]||'일꾼';return [nm2,'장비 강화'];}
  if(id.indexOf('site_')===0){var st=SITE[id.slice(5)];return [st.name,owned(st.id)?'마을 키우기':'마을 개척'];}
  if(id.indexOf('rep_')===0||id.indexOf('_fix')>=0)return ['파손 시설','수리하기'];
  if(id.indexOf('vtower')===0)return ['마을 망루',p.construction?'망루 건설':'레벨 업'];
  if(id.indexOf('vfence')===0)return ['마을 울타리','건설 · 강화'];
  if(id==='tower'||id==='tower_fix')return ['망루',p.construction?'망루 건설':'레벨 업'];
  if(id==='fence'||id==='fence_fix')return ['울타리','건설 · 강화'];
  if(id.indexOf('belt_')===0)return [id.indexOf('p1')>=0?'호수 벨트':'숲 벨트','연결하기'];
  if(id.indexOf('pbelt_')===0)return [{mill:'제재소 벨트',smoke:'훈제소 벨트',smelt:'제련소 벨트',elec:'공장 벨트'}[id.slice(6)],'벨트 설치'];
  if(id.indexOf('pst_')===0)return [plotOf(id.slice(4)).name+' 창고',p.construction?'창고 건설':'창고 확장'];
  if(id.indexOf('shopstaff_')===0)return [id.slice(10)==='wood'?'나무 가게':'생선 가게',shopStaffLevel(id.slice(10))%2===0?'점원 고용':'진열대 추가'];
  if(id.indexOf('shop_')===0)return [id.indexOf('fish')>=0?'생선 가게':'나무 가게','가게 강화'];
  if(id==='autocash')return ['자동 수금','속도 강화'];
  if(id.indexOf('beltup_')===0)return [p.id==='beltup_wood'?'숲 벨트':p.id==='beltup_fish'?'호수 벨트':'광산 벨트','속도 강화'];
  if(['mill','smoke','smelt','elec'].indexOf(id)>=0)return [plotOf(id).name,p.construction?'시설 건설':'레벨 업'];
  if(p.icon)return [p.cap||p.label,p.badge==='up'?'레벨 업':'설치하기'];
  return [p.cap||'마을 시설','건설 · 강화'];
}
function padReady(p){var paid=(S.pads&&S.pads[p.id])||0,coins=S.coins;try{S.coins=coins+paid;return !p.d.isMax()&&p.d.canBuy()&&!(p.d.hidden&&p.d.hidden());}finally{S.coins=coins;}}
function drawPads(floatingOnly){
  var g=ctx,a=agents[0];
  PADLIST.forEach(function(p){
    if(!!(p.perimeter&&p.perimeter.floating)!==!!floatingOnly)return;
    var dist=Math.hypot(a.x-p.x,a.y-p.y),active=!!p.active;if(!active&&dist>132&&!S.zoomOut&&!p.perimeter)return;
    var cost=p.d.cost(),paid=(S.pads&&S.pads[p.id])||0,ready=padReady(p),t=padTitle(p);if(p.perimeter&&p.perimeter.floating)t[1]=(p.d.fix==='fence'||p.d.vfRepair)?'눌러서 수리':'눌러서 강화';
    var accent=p.id.indexOf('belt')>=0?'#78848d':p.id.indexOf('site_')===0?'#52745c':'#a08760';
    g.save();g.translate(p.x,p.y);g.globalAlpha=active?1:.94;
    g.fillStyle='rgba(41,54,45,.08)';rr(g,-16,-13,PAD_W,PAD_H,4);g.fill();
    var pulse=ready ? .5+.5*Math.sin(time*7+p.x*.03) : 0;
    if(ready){g.shadowColor=active?'#ffe568':'#57f59a';g.shadowBlur=active?10:3+pulse*4;}
    g.fillStyle=ready?(active?'#ffe878':'#65ed9a'):'#f29285';rr(g,-17,-15,PAD_W,PAD_H,4);g.fill();
    g.shadowBlur=0;g.strokeStyle=ready?(active?'#bf7d13':'#187340'):'#a42e31';g.lineWidth=active?2:1.3;rr(g,-17,-15,PAD_W,PAD_H,4);g.stroke();
    g.fillStyle=ready?'#ffdf5e':accent;rr(g,-10,-12,20,2.2,1);g.fill();
    g.textAlign='center';g.textBaseline='middle';g.font='800 6px sans-serif';g.fillStyle='#344b40';g.fillText(t[0],0,-6,30);
    g.font='700 5.3px sans-serif';g.fillStyle='#285340';g.fillText(t[1],0,1,30);
    g.font='900 6.3px sans-serif';g.fillStyle=ready?'#16502c':'#792c2c';g.fillText('₩ '+fmt(Math.ceil(Math.max(0,cost-paid))),0,9,30);
    if(paid>0){var progress=Math.min(1,paid/Math.max(1,cost));g.fillStyle='#72562c';rr(g,-14,12,28,3,1.5);g.fill();g.fillStyle='#ffe76c';rr(g,-14,12,28*progress,3,1.5);g.fill();g.strokeStyle='rgba(255,243,169,'+(.65+.3*Math.sin(time*20))+')';g.lineWidth=2;rr(g,-18,-16,36,32,5);g.stroke();}
    if(ready&&!p.held){g.fillStyle='#fff6bd';g.beginPath();g.moveTo(11,-11);g.lineTo(15,-15);g.lineTo(19,-11);g.lineTo(16,-11);g.lineTo(16,-7);g.lineTo(14,-7);g.lineTo(14,-11);g.fill();}
    if(p.held){g.fillStyle='#52745c';g.beginPath();g.arc(14,-12,3.5,0,7);g.fill();g.fillStyle='#fff';g.font='5px sans-serif';g.fillText('✓',14,-12);}
    g.restore();
  });
}

function drawJoy(){
  if(!joy.on)return;var g=ctx,d=Math.hypot(joy.dx,joy.dy),r=36*screenUnit,k=d>r?r/d:1;
  g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.arc(joy.ox,joy.oy,r,0,7);g.fill();
  g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=2*screenUnit;g.beginPath();g.arc(joy.ox,joy.oy,r,0,7);g.stroke();
  g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(joy.ox+joy.dx*k,joy.oy+joy.dy*k,15*screenUnit,0,7);g.fill();
}
