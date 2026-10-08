/* ---------- state ---------- */
var KEY='cozy-village-v6';
var S={coins:50,axe:0,rod:0,boots:0,cour:0,bag:0,pile:0,p:{axe:0,rod:0,boots:0,cour:0},w:[],auto:false,
  ss:{wood:{},fish:{},iron:{}},piles:{},shop:{wood:1,fish:1},conv:{wood:0,fish:0},cv:{},trunk:0,wh:{},whLv:0,h3:0,lost:0,h1:0,h2:0,sites:null,mill:0,smoke:0,sfx:1,bgm:1,pads:{},tutN:0,fuel:60,st:0};
/* save format version: bump SAVE_VER whenever a migration below is added; the old save is backed up first */
var SAVE_VER=12;
var FRESH=true;
try{var raw=localStorage.getItem(KEY);if(raw){FRESH=false;var o=JSON.parse(raw);if((o.ver||0)<SAVE_VER){try{localStorage.setItem(KEY+'-bak-v'+(o.ver||0),raw);}catch(e2){}}for(var k in o)S[k]=o[k];}}catch(e){}
var LOADV=S.ver||0;
(function(){['wood','fish'].forEach(function(l){GOOD_IDS.forEach(function(id){var n=(S.ss[l]||{})[id]||0;if(n>0){S.wh=S.wh||{};S.wh[id]=(S.wh[id]||0)+n;S.ss[l][id]=0;}});});})();
if(!S.cv)S.cv={};if(!S.autocash)S.autocash=0;if(!S.tower)S.tower=0;if(!S.fence)S.fence=0;if(!S.rep)S.rep=[];if(!S.trunk)S.trunk=0;if(S.lodge===undefined)S.lodge=(S.w&&S.w.length)?1:0;if(!S.mill)S.mill=0;if(!S.smoke)S.smoke=0;if(!S.pads)S.pads={};if(S.tut===undefined)S.tut=(S.lodge&&S.w&&S.w.length)?99:(S.h2?4:0);if(S.sfx===undefined)S.sfx=1;if(S.bgm===undefined)S.bgm=1;if(!S.wh)S.wh={};if(!S.whLv)S.whLv=0;
(function(){var nc=0;S.w=S.w.filter(function(g){if(g.role==='courier'){nc++;return false;}return true;});
  if(nc){for(var i=0;i<nc;i++)S.coins+=Math.round(80*Math.pow(2.1,i));S.cour=0;}})();
/* older saves (small tiles) become the four-plot world */
(function(){
  if(S.sites)return;
  var oc=(S.open||[]).length,lv=Math.max(1,Math.min(5,1+Math.floor((oc-2)/4)));
  S.sites={f1:lv,p1:lv};if(oc>=14){S.sites.f2=1;S.sites.p2=1;}
  var bl=0,k,refund=0;for(k in S.cv)if(k.indexOf(',')>=0)bl=Math.max(bl,S.cv[k]);
  for(k in S.piles)if(typeof S.piles[k]==='number')refund+=S.piles[k]*4;
  S.cv={};if(bl){S.cv.f1=bl;S.cv.p1=bl;}
  S.piles={};S.coins+=refund;delete S.open;delete S.conv;
})();
/* v4: the northern frontier (v22) was removed - refund what was spent there */
(function(){
  var N={n1:[900,110,.18],n2:[1100,130,.18],n3:[2600,110,.35],n4:[3000,130,.35]},ref=0,k;
  for(k in N){var L=(S.sites&&S.sites[k])||0,c=N[k];if(L>0){ref+=c[0];for(var l=1;l<L;l++)ref+=Math.round(c[1]*Math.pow(2.3,l)*1.3);}
    var bl=(S.cv&&S.cv[k])||0;for(var b=0;b<bl;b++)ref+=Math.round((c[1]===110?45:55)*Math.pow(2,b));
    var p=S.piles&&S.piles[k];if(p){for(var id in p)ref+=(p[id]||0)*(ITEMS[id]&&ITEMS[id].sp?ITEMS[id].sp.val:5);delete S.piles[k];}
    if(S.sites)delete S.sites[k];if(S.cv)delete S.cv[k];if(S.pads)delete S.pads['site_'+k],delete S.pads['belt_'+k];}
  if(ref>0){S.coins+=ref;S.refundN=ref;}
})();
if((S.bears||0)>0&&!((S.p.spear||0)+(S.p.bow||0)+(S.p.wpn||0))){S.p.spear=1;S.spear=1;}
/* v5: mill and smoke house were removed - give back what they cost */
(function(){var ref=0,i;if(LOADV>=5){if(!S.cash)S.cash={wood:0,fish:0};return;}for(i=0;i<(S.mill||0);i++)ref+=Math.round(180*Math.pow(2.1,i));for(i=0;i<(S.smoke||0);i++)ref+=Math.round(200*Math.pow(2.1,i));
  if(ref>0){S.coins+=ref;S.refundN=(S.refundN||0)+ref;}S.mill=0;S.smoke=0;
  if(S.rep)S.rep=S.rep.filter(function(e){return !(e.k==='plot'&&(e.key==='mill'||e.key==='smoke'||e.key==='trunk'||e.key==='pile'));});
  if(!S.cash)S.cash={wood:0,fish:0};})();
S.lodge=1;if(!S.wh2)S.wh2=0;
if(S.tutV===undefined){if(!FRESH&&S.tut>=5)S.tut=99;S.tutV=3;}else if(S.tutV===2){if(S.tut===5)S.tut=7;else if(S.tut===6)S.tut=8;S.tutV=3;}
if(S.tutV===3){if(S.tut!=null&&S.tut>=5&&S.tut<9)S.tut++;S.tutV=4;}
S.ver=SAVE_VER;

function owned(sid){return (S.sites[sid]||0)>0;}
function siteLv(sid){return S.sites[sid]||0;}
var STAGE_W=[360,660,1080],FXA=null,CAMF=null,STAGEBAN=null,stageT=1;
function areaW(){return STAGE_W[Math.min(3,S.stage||3)-1];}
function fenceX(){if(FXA){var k=Math.min(1,FXA.t/1.6),e=1-Math.pow(1-k,3);return FXA.x0+(FXA.x1-FXA.x0)*e;}return areaW();}
function lineOpen(l){return l==='wood'||(S.stage||3)>=2;}
/* v99: later villages cost more for richer rewards, while keeping each chapter reachable */
function stageCostMult(st){var s=st||1;return s>=3?16:(s>=2?5:1);}
/* v101: each new village opens after every employed resident of the current village reaches max skill. */
function goalCrewLevel(role,track){var level=(S.wlv&&S.wlv[role])||0;S.w.forEach(function(g){if(g.role===role)level=Math.min(level,g[track]||0);});return level;}
var GOALS={
  1:[['🌲 숲 되살리기',function(){return siteLv('f1');},4,'Lv'],['🏪 장작 가게',function(){return S.shop.wood;},3,'Lv'],['🪓 나무꾼 전원 고용',function(){return count('lumber');},5,'명',1],
     ['💪 나무꾼 전원 최고 강화',function(){return goalCrewLevel('lumber','axe');},12,'Lv',1],['⚙️ 숲길 잇기',function(){return S.cv&&S.cv.f1?1:0;},1,''],['🪚 제재소 복구',function(){return S.mill||0;},2,'Lv',1],['📦 제재소 창고',function(){return (S.pst&&S.pst.mill)||0;},1,'Lv'],
     ['🏹 숲 사냥꾼 전원 고용',function(){return count('hunter');},5,'명',1],['🎯 사냥꾼 전원 최고 강화',function(){return goalCrewLevel('hunter','bow');},12,'Lv',1]],
  2:[['🌊 얼음 물길 열기',function(){return siteLv('p1');},3,'Lv',1],['🏪 생선 가게',function(){return S.shop.fish;},3,'Lv'],['🎣 낚시꾼 전원 고용',function(){return count('fisher');},5,'명',1],
     ['💪 낚시꾼 전원 최고 강화',function(){return goalCrewLevel('fisher','rod');},12,'Lv',1],['⚙️ 호숫길 잇기',function(){return S.cv&&S.cv.p1?1:0;},1,''],['🔥 겨울 훈제 식량',function(){return S.smoke||0;},2,'Lv',1],['📦 훈제소 창고',function(){return (S.pst&&S.pst.smoke)||0;},1,'Lv'],
     ['🏹 호수 사냥꾼 전원 고용',function(){return count('hunter2');},5,'명',1],['🎯 호수 사냥꾼 전원 최고 강화',function(){return goalCrewLevel('hunter2','bow');},12,'Lv',1]]};
function goalList(){return GOALS[S.stage]||null;}
function goalDone(gl){return gl[1]()>=gl[2];}
function goalPct(){var l=goalList();if(!l)return 1;var t=0;l.forEach(function(q){t+=Math.min(1,q[1]()/q[2]);});return t/l.length;}
function stageReady(){var l=goalList();return !!l&&goalPct()>=.75&&l.every(function(q){return !q[4]||goalDone(q);});}
function expandStage(){var from=areaW(),prevStage=S.stage;S.stage=Math.min(3,S.stage+1);var to=areaW();FXA={x0:from,x1:to,t:0};
  /* v52: fence/tower are no longer reset on stage expansion - the earlier village's defense keeps working as the map widens */
  if(S.stage===2){S.sites.p1=Math.max(1,S.sites.p1||0);res.forEach(function(q){if(q.s==='p1'&&!q.alive)growRes(q);});}
  CAMF={t:2.8,x:(from+to)/2};flash=.5;sfx('chime');sfx('build');
  for(var y=40;y<H;y+=46)burst(from,y,'#ffe27a',6,true);
  STAGEBAN={t:5.2,max:5.2,text:S.stage===2?'🌊 2장 · 얼음 아래의 물길':'⛏️ 3장 · 산속에서 깨어난 빛',sub:S.stage===2?'숲의 목재로 수문을 고치고, 따뜻한 물과 생선을 되찾아요':'푸른 광맥이 별숨맥과 이어져요 · 세 마을의 불빛을 모아 지켜요'};
  save();refreshUI();if(!storySeen()[S.stage])storyStart(S.stage,'auto');}
function updateStage(dt){if(FXA){FXA.t+=dt;if(FXA.t>=1.6)FXA=null;}if(STAGEBAN){STAGEBAN.t-=dt;if(STAGEBAN.t<=0)STAGEBAN=null;}
  stageT-=dt;if(stageT>0)return;stageT=.5;if((S.stage||3)<3&&stageReady())expandStage();}
function siteScore(){var n=0;SITES.forEach(function(st){n+=siteLv(st.id);});return n;}
/* v75: running totals for today's goals (new save field S.stat - older saves start from zero) */
function stat(k,n){if(typeof actionEvent==='function')actionEvent(k,n||0);if(!S.stat)S.stat={};S.stat[k]=(S.stat[k]||0)+(n||0);}
var RESETTING=false;
function save(){if(RESETTING)return;try{saveDefenseState();localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function startOver(){try{localStorage.setItem(KEY+'-bak-reset',JSON.stringify(S));localStorage.removeItem(KEY);}catch(e){}RESETTING=true;location.reload();}
function ss(line,id){return S.ss[line][id]||0;}
function addSs(line,id,n){S.ss[line][id]=ss(line,id)+n;}
function lineStock(line){var n=0;ORDER.forEach(function(id){if(ITEMS[id].line===line)n+=ss(line,id);});return n;}
function pileOf(sid){return S.piles[sid]||(S.piles[sid]={});}
function pn(sid){var p=S.piles[sid],n=0;if(p)for(var k in p)n+=p[k];return n;}
function pcap(){return 12+6*Math.max(S.pile||0,Math.max(siteLv('f1'),siteLv('p1')));}
function pileTotal(id){var n=0;for(var k in S.piles)n+=(S.piles[k][id]||0);return n;}
function speciesAvail(kind,i){var k=kind==='forest'?'tree':(kind==='pond'?'fish':'ore'),L=0;SITES.forEach(function(st){if(st.kind===kind)L=Math.max(L,siteLv(st.id));});if(!L)return false;return SPAWN[k].slice(0,spCount(L)).indexOf(i)>=0;}
/* v56: a merged super worker counts as a full crew (5) so hire pads close and stage goals stay met */
function count(role){var n=0;S.w.forEach(function(g){if(g.role===role)n+=g.super?5:1;});return n;}
/* v64 (director 2026-10-04): every village hires its own hunters - 'hunter' (forest), 'hunter2' (lake), 'hunter3' (mine); each looks different and the later villages' hunters are stronger and pricier */
function isHunter(r){return r==='hunter'||r==='hunter2'||r==='hunter3';}
var HV={hunter:1,hunter2:2,hunter3:3},HPOW={hunter:1,hunter2:2.4,hunter3:6},HNAME={hunter:'숲 사냥꾼',hunter2:'호수 사냥꾼',hunter3:'광산 사냥꾼'};
function hunterDoor(role){var v=HV[role]||1;return v===1?{x:50,y:590}:{x:v===2?410:770,y:592};}
function shopStaffLevel(line){var n=S.shopStaff&&S.shopStaff[line];return Math.max(0,Math.min(6,Math.floor(Number(n)||0)));}
function shopClerks(line){return Math.ceil(shopStaffLevel(line)/2);}
function shopShelves(line){return Math.floor(shopStaffLevel(line)/2);}
function shopRegularChance(line){var lv=shopStaffLevel(line);return lv>=2?Math.min(.36,.06*lv):0;}
function shopCheckoutTime(line){return .5/(1+.25*shopClerks(line));}
function customerPayment(c,tip){return money50(c.qty*unitPrice(c.want,c.seller)*(tip?1.3:1)*(c.regular?1.4:1));}
function stallCap(line){return 20+8*S.shop[line]+shopShelves(line);}
var SITE_MAX=5;
function siteCost(sid){var st=SITE[sid],L=siteLv(sid),mul=stageCostMult(sid==='m1'?3:(sid==='p1'?2:1));if(!L)return Math.round(st.cost*mul);return Math.round((st.kind==='forest'?110:130)*Math.pow(2.3,L-1)*(st.cost?1.3:1)*mul);}
/* a site's level decides which species grow there; lower tiers stay more common */
function siteBase(sid){return SITE[sid].base||0;}
function rollSpecies(q){var L=Math.max(1,siteLv(q.s)),sp=SPAWN[q.k],n=spCount(L),w=[1,1.5,2],sum=0,i;if(q.k==='ore'&&L>=5&&Math.random()<.05)return sp[3];for(i=0;i<n;i++)sum+=w[i];var r=Math.random()*sum;for(i=0;i<n;i++){r-=w[i];if(r<=0)return sp[i];}return sp[n-1];}
var LEGT=60+Math.random()*40,LEGQ=null;
function updateLegend(dt){LEGT-=dt;if(LEGT>0)return;LEGT=80+Math.random()*80;if(!owned('f1')&&!owned('p1'))return;LEGQ=(!owned('p1')||(owned('f1')&&Math.random()<.5))?'tree':'fish';
  addFloat(MX/2,210,LEGQ==='tree'?'🌈 전설 이벤트! 무지개나무가 자라요':'🌈 전설 이벤트! 무지개잉어가 올라와요','#fff1a8');sfx('chime');flash=.25;}
function growRes(q){q.sp=rollSpecies(q);if(LEGQ&&LEGQ===q.k&&siteLv(q.s)>=SITE_MAX){q.sp=SPAWN[q.k][3];LEGQ=null;}q.max=.55*Math.max(.5,1-.08*(siteLv(q.s)-1));q.alive=true;q.prog=0;q.timer=0;q.pop=1;
  if(q.sp===SPAWN[q.k][3]&&floats){sfx('chime');var sp=spArr(q.k)[q.sp];addFloat(q.x,q.y-30,'✨ '+sp.name+' 등장!','#ffe27a');burst(q.x,q.y-10,'#fff1a8',14,true);}}
S.lodge=1;if(!S.wh2)S.wh2=0;
/* v6: one forest + one river; the old second forest/pond are refunded, belts share one level, raw stock in the warehouse is sold */
(function(){var ref=0;
  [['f2',450,110,45],['p2',550,130,55]].forEach(function(o){var k=o[0],L=(S.sites&&S.sites[k])||0;if(L>0){ref+=o[1];for(var l=1;l<L;l++)ref+=Math.round(o[2]*Math.pow(2.3,l-1)*1.3);}
    var bl=(S.cv&&S.cv[k])||0;for(var b=0;b<bl;b++)ref+=Math.round(o[3]*Math.pow(2,b));
    var p=S.piles&&S.piles[k];if(p){for(var id in p)ref+=(p[id]||0)*(ITEMS[id]&&ITEMS[id].sp?ITEMS[id].sp.val:5);delete S.piles[k];}
    if(S.sites)delete S.sites[k];if(S.cv)delete S.cv[k];});
  if(S.beltLv===undefined){var mx=0;for(var ck in (S.cv||{}))mx=Math.max(mx,S.cv[ck]||0);S.beltLv=mx;for(var ck2 in (S.cv||{}))S.cv[ck2]=S.cv[ck2]?1:0;}
  if(S.wh)for(var wid in S.wh){if(ITEMS[wid]&&ITEMS[wid].sp){ref+=(S.wh[wid]||0)*ITEMS[wid].sp.val;delete S.wh[wid];}}
  if(S.rep)S.rep=S.rep.filter(function(e){return !(e.sid==='f2'||e.sid==='p2'||e.k==='belt');});
  if(ref>0){S.coins+=ref;S.refundN=(S.refundN||0)+ref;}})();
/* v8: new map; the player's weapon now follows the hunters' level */
(function(){if(!S.wlv)S.wlv={};if(S.wlv.hunter===undefined)S.wlv.hunter=0;if(S.wlv.miner===undefined)S.wlv.miner=0;if(LOADV<8&&(S.p.wpn||0)>1)S.wlv.hunter=Math.max(S.wlv.hunter,(S.p.wpn||1)-1);
  S.w.forEach(function(g){if(g.role==='hunter')g.bow=Math.max(g.bow||0,S.wlv.hunter);});if(!S.ss.iron)S.ss.iron={};if(!S.pst)S.pst={};if(S.pst.smelt===undefined)S.pst.smelt=0;if(!S.smelt)S.smelt=0;
  if(S.pads){delete S.pads.wpn;}})();
if(S.season===undefined)S.season=0;if(!S.winters)S.winters=0;if(S.cash){S.cash.t_mill=S.cash.t_mill||0;S.cash.t_smoke=S.cash.t_smoke||0;S.cash.t_smelt=S.cash.t_smelt||0;}
/* v9: smelter moved to the middle (iron/glass/plastic), electronics factory at the bottom sells TV/PC/phone */
(function(){if(!S.elec)S.elec=0;if(!S.mat)S.mat={ingot:0,glass:0,plastic:0};if(!S.pst)S.pst={};if(S.pst.elec===undefined)S.pst.elec=0;if(!S.cash)S.cash={};S.cash.t_elec=S.cash.t_elec||0;
  if(LOADV<9){var ref=0;if(S.wh){ref+=(S.wh.tool||0)*130+(S.wh.engine||0)*380;delete S.wh.tool;delete S.wh.engine;}ref+=S.cash.t_smelt||0;S.cash.t_smelt=0;if(ref>0){S.coins+=ref;S.refundN=(S.refundN||0)+ref;}}})();
if(!S.pcv)S.pcv={mill:0,smoke:0};if(!S.pin)S.pin={wood:0,fish:0};if(!S.pin.iron)S.pin.iron=0;if(!S.pbuf)S.pbuf={};if(!S.beltLv)S.beltLv=0;
if(!S.cvLv){S.cvLv={wood:Math.max(0,(S.beltLv||1)-1),fish:0,iron:0};}
/* v7: the separate warehouse became a storage shed on each building; one weapon track; each crew shares one level */
(function(){var ref=0,i;
  for(i=0;i<(S.whLv||0);i++)ref+=Math.round(300*Math.pow(1.9,i));
  for(i=0;i<(S.wh2||0);i++)ref+=Math.round(700*Math.pow(2,i));
  S.whLv=0;S.wh2=0;if(!S.pst)S.pst={mill:0,smoke:0};
  if(S.pbuf){for(var k in S.pbuf){S.wh[k]=(S.wh[k]||0)+(S.pbuf[k]||0);}S.pbuf={};}
  var LP0={wood:'mill',fish:'smoke',iron:'smelt',elec:'elec'};for(var id in S.wh){var it=ITEMS[id],n=S.wh[id]||0;if(!it||it.cat!=='goods'||!S[LP0[it.line]]){if(it&&it.price)ref+=n*it.price;else if(it&&it.sp)ref+=n*it.sp.val;delete S.wh[id];}}
  if(S.p.wpn===undefined){var sp=S.p.spear||0,bw=S.p.bow||0,lo=Math.min(sp,bw),U=sp>=bw?[80,1.55]:[60,1.55];for(i=0;i<lo;i++)ref+=Math.round(U[0]*Math.pow(U[1],i));S.p.wpn=Math.max(sp,bw);S.p.spear=0;S.p.bow=0;S.spear=0;S.bow=0;}
  /* crew levels: fill any missing role from the gear its workers already have (the v8 step above creates S.wlv first) */
  if(!S.wlv)S.wlv={};var PR={lumber:'axe',fisher:'rod',hunter:'bow'};for(var r in PR){if(S.wlv[r]!==undefined)continue;var mx=0;S.w.forEach(function(g){if(g.role===r)mx=Math.max(mx,g[PR[r]]||0);});S.wlv[r]=mx;}
  if(S.pads)['wh','wh2','spear','bow'].forEach(function(pk){if(S.pads[pk]){ref+=S.pads[pk];delete S.pads[pk];}});
  if(S.rep)S.rep=S.rep.filter(function(e){return !(e.k==='plot'&&e.key==='wh2');});
  if(ref>0){S.coins+=Math.round(ref);S.refundN=(S.refundN||0)+Math.round(ref);}})();
/* v10: the village opens in stages - 1 wood, 2 river (fence widens), 3 mine. Older saves keep everything they already built */
(function(){if(S.stage)return;
  if(FRESH){S.stage=1;S.sites.p1=0;return;}
  var fishP=siteLv('p1')>1||count('fisher')>0||(S.smoke||0)>0||(S.shop.fish||1)>1||!!(S.cv&&S.cv.p1)||lineStock('fish')>0||pn('p1')>0||(S.cash&&(S.cash.fish||0)>0);
  S.stage=(owned('m1')||(S.smelt||0)>0||(S.elec||0)>0)?3:(fishP?2:1);
  if(S.stage===1)S.sites.p1=0;})();
/* v63 (director 2026-10-04): each village has its own watchtower and wall level. Saves made before this keep what they had (the shared level is copied to villages already open); a village opened from now on starts from zero */
if(!S.vt){S.vt={};S.vf={};for(var vv=2;vv<=(S.stage||1);vv++){S.vt[vv]=S.tower||0;S.vf[vv]=S.fence||0;}}
S.ver=SAVE_VER;
res.forEach(function(q){if(owned(q.s)){growRes(q);q.pop=0;}});

/* v11: preserve progress while moving the cash economy to 50-won units. */
if(!S.money50){S.coins=money50(S.coins);Object.keys(S.cash||{}).forEach(function(k){S.cash[k]=money50(S.cash[k]);});Object.keys(S.pads||{}).forEach(function(k){S.coins+=S.pads[k]||0;delete S.pads[k];});S.coins=money50(S.coins);S.money50=1;}

