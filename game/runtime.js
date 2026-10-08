
/* v57: any error while the game starts up is written on the title card (and in settings) so a frozen resume can be diagnosed from a screenshot */
window.__bootErr='';window.addEventListener('error',function(e){var m=(e&&e.message)||'오류';if(!window.__bootErr)window.__bootErr=m+(e&&e.lineno?' @'+e.lineno:'');
  try{var t=document.getElementById('tinfo');if(t){t.hidden=false;t.textContent='⚠️ '+window.__bootErr;t.style.color='#b3263b';}var v=document.querySelector('#setp .sver');if(v)v.textContent='v103 · 오류 '+window.__bootErr.slice(0,70);}catch(_e){}});
(function(){
"use strict";
/* left: gathering grid (GC x ROWS tiles). right: market strip */
/* v83 (director 2026-10-05: widen the map instead of leaving STAGE_W capped) - GC 8 -> 9 adds one real extra column (+60px) of breathing room;
   it lands at the mine village (the most cramped stage), since SITES/BPATH/pad positions below are fixed pixel coordinates, not derived from GC */
var GC=18, ROWS=10, T=60, MX=GC*T, CW=0, MK=MX, W=MX, H=ROWS*T, RB=64, HT=H+RB, SH=HT;
/* Insert a three-tile courtyard beside each original village, preserving facility sizes. */
function worldX(x){return x<180?x:(x<300?x+180:x+360);}
function worldCol(c){return worldX(c*T)/T;}
var cv=document.getElementById('c'), ctx=cv.getContext('2d');
var TOUCH_UI=window.matchMedia('(pointer:coarse)').matches;
var DPR=Math.min(window.devicePixelRatio||1,(TOUCH_UI&&navigator.deviceMemory&&navigator.deviceMemory<=4)?1.5:2),RS=DPR;
var screenUnit=1;
cv.width=W*DPR; cv.height=HT*DPR; ctx.setTransform(DPR,0,0,DPR,0,0);

function mulberry(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
var rand=mulberry(20260924);
var time=0;

/* Canvas art colors only. Keep geometry, economy and save data out of this module.
 * Reference: repository KakaoTalk ...003.jpeg — cyan coats, orange timber,
 * icy snow, warm ground and bright green/red activity accents.
 * No replacement opening images; original four scenes remain a dependency. */
var ART={
 land:['#ffe8c8','#ffdfb3','#f4c996'],plaza:'#ffedcf',path:'#f3bd7b',pathLight:'#ffe4ad',garden:'#bce7a0',
 snow:'#f8fdff',snowShade:'#b5dfef',pine:'#138c69',pineLight:'#36bc8a',
 timber:['#ffe19a','#f6a02f','#b7631e'],
 forest:[
  {name:'서리 묘목',leaf:'#239966',light:'#58cf88',floor:'#d7f2c1'},
  {name:'눈꽃 침엽수',leaf:'#087f62',light:'#2fbf8f',floor:'#bfe9bc'},
  {name:'깊어진 숲',leaf:'#238a45',light:'#82c83d',floor:'#c7e8a6'},
  {name:'푸른 거목',leaf:'#087c92',light:'#35bdc1',floor:'#c6eef2'},
  {name:'별빛 고목',leaf:'#16795c',light:'#75c944',floor:'#e3f0b6'}
 ],
 coats:['#149fca','#28a45e','#ed8a28','#258cda','#d69e16','#167fb7','#12a58c','#647edc','#2558ab','#37a66c','#178dcf','#e87535','#23539b'],
 scarves:['#ef5b45','#ffcc49','#36c4cb','#ffc957','#f46751','#ffc749','#ef7850','#f6d353','#ffd15a','#f37744','#58d8e5','#ffca51','#ffe08a'],
 roles:{lumber:'#29aa68',fisher:'#169ac7',miner:'#e6a32b',courier:'#e78537',hunter:'#389b58',imk:'#e76e3c',hunter2:'#158bbf',hunter3:'#716bcd',player:'#149fca'}
};
/* ---------- species & goods ---------- */
var TREES=[
  {id:'oak',name:'참나무',tier:0,val:4,shape:'round',c1:'#4c9a5c',c2:'#6cb877',trunk:'#8a6845',log:'#a07a50'},
  {id:'pine',name:'소나무',tier:1,val:6,shape:'cone',c1:'#2f7a4f',c2:'#43995f',trunk:'#7a5634',log:'#8a6440'},
  {id:'birch',name:'자작나무',tier:2,val:10,shape:'round',c1:'#9bc955',c2:'#c9e585',trunk:'#f3f1ea',log:'#e8e2d2'},
  {id:'maple',name:'단풍나무',tier:3,val:16,shape:'round',c1:'#e0612f',c2:'#f5a13a',trunk:'#7a4d2b',log:'#b0603a'},
  {id:'crystal',name:'수정나무',tier:4,val:26,shape:'round',c1:'#7fdbf0',c2:'#d4faff',trunk:'#b9a5e0',log:'#b9a5e0'},
  {id:'rainbow',name:'전설 무지개나무',tier:4,val:130,rare:1,shape:'round',c1:'#ff9ab0',c2:'#fff1a8',trunk:'#c9a0e8',log:'#f4a8d0'}
];
var FISH=[
  {id:'carp',name:'붕어',tier:0,val:7,col:'#b89a6a'},
  {id:'trout',name:'송어',tier:1,val:11,col:'#7fa37a'},
  {id:'salmon',name:'연어',tier:2,val:17,col:'#ff7a52'},
  {id:'koi',name:'비단잉어',tier:3,val:27,col:'#ffffff'},
  {id:'gold',name:'황금잉어',tier:4,val:41,col:'#f0bb3f'},
  {id:'dragon',name:'전설 무지개잉어',tier:4,val:190,rare:1,col:'#ff8ad0'}
];
var ORES=[
  {id:'ore',name:'철광석',tier:0,val:8,col:'#8a8f98',spk:'#dfe4ea'},
  {id:'silver',name:'은광석',tier:1,val:18,col:'#8e9aa8',spk:'#ffffff'},
  {id:'goldore',name:'금광석',tier:2,val:34,col:'#7d6c52',spk:'#f0bb3f'},
  {id:'gem',name:'보석 원석',tier:3,val:80,rare:1,col:'#6a5a8a',spk:'#ff9ae8'}
];
var GOODS=[
  {id:'chair',name:'의자',price:40,line:'wood',n:2,time:5,lv:1},
  {id:'table',name:'탁자',price:110,line:'wood',n:4,time:9,lv:3},
  {id:'can',name:'통조림',price:55,line:'fish',n:2,time:6,lv:1},
  {id:'smoked',name:'훈제 생선',price:135,line:'fish',n:3,time:9,lv:3},
  {id:'sofa',name:'가구 세트',price:300,line:'wood',n:6,time:10,lv:6},
  {id:'gift',name:'선물 세트',price:330,line:'fish',n:5,time:10,lv:6},
  {id:'ingot',name:'철판',price:50,line:'iron',n:2,time:5,lv:1},
  {id:'glass',name:'유리',price:60,line:'iron',n:2,time:6,lv:1},
  {id:'plastic',name:'플라스틱',price:90,line:'iron',n:3,time:7,lv:3},
  /* v62: electronics are made 2.5x faster (TV 20s -> 8s, PC 26 -> 10, phone 30 -> 12) so materials don't sit waiting at the factory */
  /* v61 (director 2026-10-04): electronics sell for hundreds of thousands - TV 2,200 -> 150,000, PC 5,200 -> 350,000, phone 9,000 -> 700,000 */
  {id:'tv',name:'TV',price:150000,line:'elec',mat:{ingot:1,glass:2},time:8,lv:1},
  {id:'pc',name:'컴퓨터',price:350000,line:'elec',mat:{ingot:2,glass:1,plastic:2},time:10,lv:3},
  {id:'phone',name:'스마트폰',price:700000,line:'elec',mat:{ingot:1,glass:2,plastic:2},time:12,lv:6}
];
var ITEMS={},ORDER=[],GOOD={};GOODS.forEach(function(g){GOOD[g.id]=g;});
TREES.forEach(function(s){ITEMS[s.id]={cat:'wood',line:'wood',sp:s,name:s.name};ORDER.push(s.id);});
FISH.forEach(function(s){ITEMS[s.id]={cat:'fish',line:'fish',sp:s,name:s.name};ORDER.push(s.id);});
ORES.forEach(function(s){ITEMS[s.id]={cat:'ore',line:'iron',sp:s,name:s.name};ORDER.push(s.id);});
GOODS.forEach(function(g){ITEMS[g.id]={cat:'goods',line:g.line,price:g.price,name:g.name,rec:g};ORDER.push(g.id);});
/* polar bear loot: premium materials sold at the stalls (meat = food stall, hide = wood/craft stall) */
var BEAR_ITEMS=[{id:'meat',name:'곰고기',price:18,line:'fish'},{id:'hide',name:'곰 가죽',price:32,line:'wood'}];
BEAR_ITEMS.forEach(function(b){ITEMS[b.id]={cat:'bear',line:b.line,price:b.price,name:b.name};ORDER.push(b.id);});
var LINES=['wood','fish'];
var GOOD_IDS=['chair','table','can','smoked','sofa','gift','ingot','tool','engine'];
/* fewer species: each site shows 1 -> 2 -> 3 kinds (Lv1 / Lv3 / Lv5) plus one rare */
var SPAWN={tree:[0,3,4,5],fish:[0,2,4,5],ore:[0,1,2,3]};
function spArr(k){return k==='tree'?TREES:(k==='fish'?FISH:ORES);}
function spCount(L){return L>=5?3:(L>=3?2:1);}

/* ---------- gathering sites: four 2x2 plots (3 gathering tiles + 1 storage tile) around a plaza ---------- */
var SZ=120,PLAZA={x:0,y:120,w:MX,h:180};
var SITES=[
  {id:'f1',kind:'forest',x:60,y:180,w:90,h:180,resourceW:90,cost:0,name:'숲',gather:[[1,3],[1,4],[1,5],[2,3],[2,4],[2,5]],st:[4,3],pt:[1,6],xt:[4,5],padDx:0},
  {id:'p1',kind:'pond',x:420,y:180,w:90,h:180,resourceW:90,cost:0,name:'호수',gather:[[7,3],[7,4],[7,5],[8,3],[8,4],[8,5]],st:[9,3],pt:[8,6],xt:[9,5],padDx:0},
  {id:'m1',kind:'mine',x:780,y:60,w:180,h:120,cost:300,name:'광산',sd:[2,1],pd:[1,1],gather:[[13,1],[14,1],[15,1]],st:[15,2],pt:[14,2],padDx:0}
];
var WORLD_TOP=0,TOPROW=0,camY=0,camX=0,ZOOM_IN=5.2,Z=5.2;
var SITE={};
SITES.forEach(function(st){SITE[st.id]=st;st.line=st.kind==='forest'?'wood':(st.kind==='pond'?'fish':'iron');st.k=st.kind==='forest'?'tree':(st.kind==='pond'?'fish':'ore');
  st.tiles=[];st.gather.forEach(function(g2){st.tiles.push({c:g2[0],r:g2[1],store:false,pad:false});});
  st.store={c:st.st[0],r:st.st[1],store:true,pad:false};st.padT={c:st.pt[0],r:st.pt[1],store:false,pad:true};st.tiles.push(st.store,st.padT);
  if(st.xt){st.xtT={c:st.xt[0],r:st.xt[1],store:false,pad:true,xtra:true};st.tiles.push(st.xtT);}});
function siteTileObj(c,r){for(var i=0;i<SITES.length;i++){var ts=SITES[i].tiles;for(var j=0;j<ts.length;j++)if(ts[j].c===c&&ts[j].r===r)return ts[j];}return null;}
/* tile grid: cols 0-3 field, 4 corridor, 5 market walkway */
function tileX(c){return c*T+30;}
function tileY(r){return r*T+30;}
function tileAt(x,y){if(y<0||y>=H||x<0||x>=MX)return null;return {c:Math.floor(x/T),r:Math.floor(y/T)};}
function siteOfTile(c,r){for(var i=0;i<SITES.length;i++){var ts=SITES[i].tiles;for(var j=0;j<ts.length;j++)if(ts[j].c===c&&ts[j].r===r)return SITES[i];}return null;}
function tileKind(c,r){var t=siteTileObj(c,r);if(!t)return 'plaza';return t.store?'store':(t.pad?'plaza':'gather');}
function tileOk(c,r){if(r<0||r>=ROWS||c<0||c>=GC)return false;if(c*T+30>fenceX())return false;if(isBank(c,r)&&c*T+T<=SITE.p1.x+SITE.p1.w)return false;var st=siteOfTile(c,r);if(!st)return true;return owned(st.id)||st.kind==='mine'||siteTileObj(c,r).pad;}
/* Sparse, large resources: nine trees and nine fish across each 1.5-tile-wide site. */
var TREE_T=[[.2,.4],[.8,.4],[.2,.84],[.8,.84]],FISH_T=[[.2,.62],[.8,.72]],ORE_T=[[.18,.32],[.5,.26],[.82,.32],[.2,.8],[.5,.74],[.8,.8]];
/* Fishing takes place on the eastern shore; no walkways cross the lake. */
var BANKY=8;
/* Both water columns share the same accessible shore. */
function isBank(c,r){var st=siteOfTile(c,r),t=siteTileObj(c,r);return !!(st&&st.kind==='pond'&&t&&!t.store&&!t.pad);}
function tileYw(c,r){return tileY(r);}
function tileXw(c,r){return isBank(c,r)?SITE.p1.x+SITE.p1.w+8:tileX(c);}
var res=[];
var RES_LAYOUT={forest:[[[.30,.30],[.75,.85]],[[.70,.30],[.28,.85]],[[.30,.30],[.75,.85]]],pond:[[[.36,.27],[.70,.75]],[[.70,.25],[.36,.74]],[[.36,.26],[.70,.75]]]};
SITES.forEach(function(st){var gi=0;st.tiles.forEach(function(t){if(t.store||t.pad)return;var lay=st.kind==='mine'?ORE_T:RES_LAYOUT[st.kind][(gi++)%RES_LAYOUT[st.kind].length];
  var width=Math.min(T,st.x+st.w-t.c*T);
  lay.forEach(function(o,i){if(width<T&&i%2)return;
    res.push({k:st.k,s:st.id,tc:t.c,tr:t.r,x:t.c*T+o[0]*width+(rand()-.5)*Math.min(4,width/10),y:t.r*T+o[1]*T+(rand()-.5)*3,sp:0,alive:false,timer:0,max:12,by:null,prog:0,need:1,ph:rand()*6,pop:0});
  });});});
function pilePos(sid){var t=SITE[sid].store;return {x:t.c*T+30,y:t.r*T+36};}
function feedY(sid){return SITE[sid].store.r*T+8;}

/* ---------- market ---------- */
var STALL={wood:{x:270,y:10},fish:{x:570,y:10}};
function dropPt(line){return line==='wood'?{x:334,y:186}:{x:504,y:158};}
var LANE={wood:270,fish:570};

/* ---------- state ---------- */
var KEY='cozy-village-v6';
var S={coins:50,axe:0,rod:0,boots:0,cour:0,bag:0,pile:0,p:{axe:0,rod:0,boots:0,cour:0},w:[],auto:false,
  ss:{wood:{},fish:{},iron:{}},piles:{},shop:{wood:1,fish:1},conv:{wood:0,fish:0},cv:{},trunk:0,wh:{},whLv:0,h3:0,lost:0,h1:0,h2:0,sites:null,mill:0,smoke:0,sfx:1,bgm:1,pads:{},tutN:0,fuel:60,st:0};
/* save format version: bump SAVE_VER whenever a migration below is added; the old save is backed up first */
var SAVE_VER=11;
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
function stageCostMult(st){var s=st||1;return s>=3?10:(s>=2?3.5:1);}
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
function stat(k,n){if(!S.stat)S.stat={};S.stat[k]=(S.stat[k]||0)+(n||0);}
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

/* ---------- gear ---------- */
var NAMES={axe:['나무','돌','쇠','황금','크리스탈'],rod:['대나무','초록','쇠','황금','크리스탈'],boots:['헌','가죽','쇠','황금','날개'],cour:['기본','튼튼한','쇠','황금','크리스탈'],spear:['나무','돌','쇠','황금','크리스탈'],bow:['나무','뿔','쇠','황금','크리스탈'],pick:['돌','쇠','강철','드릴','황금 드릴'],wpn:['도끼','도끼','창','총','황금 총']};
var TH={axe:[0,1,3,6,9],rod:[0,1,3,6,9],boots:[0,2,4,6,8],cour:[0,2,4,6,8],spear:[0,1,3,6,9],bow:[0,1,3,6,9],pick:[0,1,3,6,9],wpn:[0,1,4,8,11]};
var MAXLV={axe:12,rod:12,boots:8,cour:8,spear:12,bow:12,pick:12,wpn:13};
var UNIT={axe:[15,1.6],rod:[22,1.6],boots:[26,1.7],cour:[40,1.6],spear:[60,1.55],bow:[80,1.55],pick:[26,1.6],wpn:[60,1.5]};
var WKN={martial:'권법·발차기',axe:'도끼',spear:'창',gun:'총'};
/* The hero trains martial arts alongside the strongest hunter crew. */
/* v66: the hero's weapon follows the best hunter crew of any village */
function wpnLv(){var w=S.wlv||{};return 1+Math.max(w.hunter||0,w.hunter2||0,w.hunter3||0);}
function wkind(){return 'martial';}
function heroReach(b){return 48+Math.max(0,bearR(b)-15);}
function wtier(){return Math.min(4,Math.floor(wpnLv()/3));}
/* v86: at max weapon level the hero hits noticeably harder - a late-game power spike on top of the usual per-level scaling */
function heroDmgMul(){return wpnLv()>=MAXLV.wpn?1.6:1;}
function tierOf(track,lv){var t=0;for(var i=1;i<5;i++)if(lv>=TH[track][i])t=i;return t;}
function relevant(track,g){if(track==='bow')return false;return track==='boots'||(track==='axe'&&g.role==='lumber')||(track==='rod'&&g.role==='fisher')||(track==='pick'&&g.role==='miner');}
/* best tier anyone owns: decides which species customers ask for */
function syncPlayerGear(){['axe','rod','pick','boots'].forEach(function(tr){var m=S.p[tr]||0;S.w.forEach(function(g){if(relevant(tr,g))m=Math.max(m,g[tr]||0);});S.p[tr]=m;S[tr]=m;});}
function teamTier(track){if(track==='axe'||track==='rod'||track==='pick')return 4;var t=tierOf(track,S.p[track]||0);S.w.forEach(function(g){if(relevant(track,g))t=Math.max(t,tierOf(track,g[track]||0));});return t;}
function ptier(track){return tierOf(track,S.p[track]||0);}
function gcost(track,lv,worker){var u=UNIT[track];return Math.round(u[0]*Math.pow(u[1],lv)*(worker?0.8:1));}
var WORKF=0.75, WMOVE=1.0;
function spOf(q){return spArr(q.k)[q.sp]||spArr(q.k)[0];}
function okFor(g,q){return true;return spOf(q).tier<=tierOf(q.k==='tree'?'axe':'rod',g[q.k==='tree'?'axe':'rod']);}
function teamOk(q){return true;}
function baseTime(g,q){var sp0=spOf(q),t=sp0.tier,rareMul=sp0.rare?2.2:1;if(q.k==='ore')return 2*(1+.3*t)/(1+.35*(g.pick||0))*rareMul;return q.k==='tree'?1.5*(1+.3*t)/(1+.35*(g.axe||0))*rareMul:2*(1+.3*t)/(1+.35*(g.rod||0))*rareMul;}
var cap=function(){return 6+4*S.bag;};
function courCap(g){return 4+2*(g.cour||0);}
var priceMult=function(){return 1+(siteScore()-2)*0.04;};
var HOT={id:null,t:0,dur:150};
function hotMult(id){return HOT.id===id?1.5:1;}
/* v68 (director 2026-10-04: earn money faster, shorter play time): all sales pay 1.6x */
var ECON=1.6;
function unitPrice(id,line){
  var it=ITEMS[id],p;
  if(it.cat==='wood')p=it.sp.val*(1+0.06*(S.p.axe||0))*(1+0.2*S.mill);
  else if(it.cat==='fish')p=it.sp.val*(1+0.06*(S.p.rod||0))*(1+0.2*S.smoke);
  else p=it.price;
  return money50(p*ECON*priceMult()*(1+0.15*(S.shop[line]-1))*hotMult(id));
}
/* ---------- sound: tiny synthesized effects + a soft generative tune (Web Audio, no files) ---------- */
var AC=null,SFXG=null,BGMG=null,lastSfx={},bgmNext=0,bgmStep=0;
function audioInit(){
  if(AC){if(AC.state==='suspended')AC.resume();return;}
  try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;return;}
  SFXG=AC.createGain();BGMG=AC.createGain();
  var comp=AC.createDynamicsCompressor();SFXG.connect(comp);BGMG.connect(comp);comp.connect(AC.destination);
  applyVol();bgmNext=AC.currentTime+.3;
}
function applyVol(){if(!AC)return;SFXG.gain.value=S.sfx===0?0:.55;BGMG.gain.value=S.bgm===0?0:.16;}
function tone(f,dur,type,vol,at,f2){
  var o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,at);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,at+dur);
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(vol,at+.008);g.gain.exponentialRampToValueAtTime(.0008,at+dur);
  o.connect(g);g.connect(SFXG);o.start(at);o.stop(at+dur+.02);
}
var NOISE=null;
function noise(dur,vol,freq,at,q,f2,out){
  if(!NOISE){var n=AC.sampleRate*.6|0;NOISE=AC.createBuffer(1,n,AC.sampleRate);var d=NOISE.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;}
  var s=AC.createBufferSource(),bp=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NOISE;bp.type='bandpass';bp.frequency.setValueAtTime(freq,at);bp.Q.value=q||1;
  if(f2)bp.frequency.exponentialRampToValueAtTime(f2,at+dur);
  g.gain.setValueAtTime(vol,at);g.gain.exponentialRampToValueAtTime(.0008,at+dur);
  s.connect(bp);bp.connect(g);g.connect(out||SFXG);s.start(at);s.stop(at+dur+.02);
}
var SFX={
  chop:function(t){noise(.07,.5,900,t,2);tone(150,.09,'triangle',.35,t,90);},
  fell:function(t){noise(.18,.45,500,t,1.2,200);tone(110,.2,'triangle',.3,t+.02,70);tone(660,.12,'sine',.12,t+.08,880);},
  cast:function(t){noise(.12,.18,2400,t,3,900);},
  splash:function(t){noise(.28,.5,1400,t,.9,300);tone(520,.1,'sine',.16,t+.02,780);},
  pickup:function(t){tone(520,.07,'triangle',.22,t);tone(780,.09,'triangle',.2,t+.06);},
  coin:function(t){tone(1320,.08,'square',.09,t);tone(1760,.18,'square',.08,t+.07);},
  cash:function(t){[988,1319,1568,2093].forEach(function(f,i){tone(f,.16,'square',.07,t+i*.06);});noise(.15,.15,5000,t+.2,4);},
  horn:function(t){tone(330,.22,'square',.07,t);tone(415,.22,'square',.06,t);tone(330,.18,'square',.07,t+.28);tone(415,.18,'square',.06,t+.28);},
  build:function(t){[392,494,587,784].forEach(function(f,i){tone(f,.14,'triangle',.2,t+i*.07);});noise(.08,.2,700,t,1.5);},
  tap:function(t){tone(880,.05,'sine',.12,t,660);},
  nope:function(t){tone(180,.12,'square',.07,t,140);tone(150,.14,'square',.06,t+.1,120);},
  chime:function(t){[1047,1319,1568,2093,2637].forEach(function(f,i){tone(f,.35,'sine',.12,t+i*.07);});}
};
function sfx(name,minGap){
  if(!AC||S.sfx===0||!SFX[name])return;
  var now=AC.currentTime;if(lastSfx[name]&&now-lastSfx[name]<(minGap||.05))return;lastSfx[name]=now;SFX[name](now+.005);
}
/* gentle pentatonic music box: melody on a loop, soft bass every bar, darker at night */
var MEL=[0,2,4,7,4,2,4,-1, 9,7,4,2,4,-1,2,0, 0,4,7,9,7,4,2,-1, 4,2,0,-3,0,-1,0,-1];
function btone(f,dur,vol,at,type){var o=AC.createOscillator(),g=AC.createGain();o.type=type||'triangle';o.frequency.value=f;
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(vol,at+.02);g.gain.exponentialRampToValueAtTime(.0008,at+dur);o.connect(g);g.connect(BGMG);o.start(at);o.stop(at+dur+.05);}
function updateMusic(){
  if(!AC||S.bgm===0)return;
  var beat=.42,night=nightAmt(),root=night>.5?220:261.63;
  /* v59: after the app was in the background the audio clock can run ahead of the game - skip the missed notes instead of scheduling hundreds at once (that burst made the game stutter right after coming back) */
  if(bgmNext<AC.currentTime-.1)bgmNext=AC.currentTime+.05;
  while(bgmNext<AC.currentTime+.6){
    var i=bgmStep%MEL.length,n=MEL[i];
    if(n>=0)btone(root*Math.pow(2,n/12),beat*1.8,.5,bgmNext,'triangle');
    if(i%8===0){btone(root/2*Math.pow(2,[0,5,7,5][(i/8)%4]/12),beat*7,.35,bgmNext,'sine');}
    bgmNext+=beat;bgmStep++;
  }
}

/* ---------- effects ---------- */
var floats=[],parts=[],flash=0;
/* v54 (staff 1): raid presentation - a short, small world shake (max ~3px) for roars and hits */
var SHAKE=0,TOWERHIT=0;function shake(a){SHAKE=Math.max(SHAKE,Math.min(1,a));}
function addFloat(x,y,text,col,small){floats.push({x:x,y:y,t:0,text:text,col:col||'#fff',small:small});}
function burst(x,y,col,n,spark){
  for(var i=0;i<n;i++){
    var a=Math.random()*6.283,s=20+Math.random()*50;
    parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-25,g:110,life:.6+Math.random()*.3,max:.9,col:col,r:1.6+Math.random()*1.6,spark:!!spark});
  }
}

/* ---------- drawing helpers ---------- */
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function hs(a,b){var n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n);}
function eob(t){var c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);}
function blob(g,x,y,r){g.moveTo(x+r,y);g.arc(x,y,r,0,7);}
var curWalk=null,curPh=0;
function fishShape(g,col,dark){
  /* tail (curved fan) */
  g.fillStyle=col;g.beginPath();g.moveTo(3.4,0);g.quadraticCurveTo(5.6,-1.2,8.2,-3.8);g.quadraticCurveTo(7,0,8.2,3.8);g.quadraticCurveTo(5.6,1.2,3.4,0);g.closePath();g.fill();
  g.fillStyle='rgba(0,0,0,.14)';g.fill();
  /* dorsal + pelvic fins */
  g.fillStyle=col;g.beginPath();g.moveTo(-3.2,-2.4);g.quadraticCurveTo(-.8,-5.4,2,-2.2);g.closePath();g.fill();
  g.fillStyle='rgba(0,0,0,.16)';g.fill();
  /* body */
  g.fillStyle=col;g.beginPath();g.ellipse(-.8,0,5.4,3.2,0,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.38)';g.beginPath();g.ellipse(-1.2,1.3,4,1.4,0,0,7);g.fill();
  g.fillStyle='rgba(0,0,0,.10)';g.beginPath();g.ellipse(-.4,-1.6,4.4,1.3,0,0,7);g.fill();
  if(dark){g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=.7;for(var i=-2.5;i<=2;i+=1.5){g.beginPath();g.moveTo(i,-2.6);g.lineTo(i+.6,2.6);g.stroke();}}
  g.strokeStyle='rgba(40,30,20,.35)';g.lineWidth=.5;g.beginPath();g.ellipse(-.8,0,5.4,3.2,0,0,7);g.stroke();
  g.beginPath();g.arc(-3.4,0,2.2,-.9,.9);g.stroke();
  /* eye */
  g.fillStyle='#fff';g.beginPath();g.arc(-4.1,-.7,1.05,0,7);g.fill();
  g.fillStyle='#1d1d22';g.beginPath();g.arc(-4.3,-.7,.62,0,7);g.fill();
}
function drawItem(g,id,x,y,s){
  var it=ITEMS[id];g.save();g.translate(x,y);g.scale(s,s);
  if(it.cat==='wood'){
    var sp=it.sp;
    g.fillStyle=sp.trunk;g.fillRect(-1.5,1,3,6);
    if(sp.shape==='cone'){
      g.fillStyle=sp.c1;g.beginPath();g.moveTo(0,-7.5);g.lineTo(5.8,2.5);g.lineTo(-5.8,2.5);g.closePath();g.fill();
    }else{
      g.fillStyle=sp.c1;g.beginPath();g.arc(0,-2,5.6,0,7);g.fill();
      g.fillStyle=sp.c2;g.beginPath();g.arc(-1.6,-3.6,2.8,0,7);g.fill();
    }
  }else if(it.cat==='fish'){
    var f=it.sp;fishShape(g,f.col,false);
    if(f.id==='dragon'){g.fillStyle='#f0bb3f';g.beginPath();g.moveTo(-3,-2.8);g.lineTo(-1.5,-5.6);g.lineTo(0,-3);g.lineTo(1.5,-5.2);g.lineTo(2.6,-2.6);g.closePath();g.fill();
      g.strokeStyle='#f0bb3f';g.lineWidth=.5;g.beginPath();g.moveTo(-6,.4);g.quadraticCurveTo(-8,1.6,-9,3.4);g.moveTo(-6,-.2);g.quadraticCurveTo(-8.4,-.4,-9.6,.8);g.stroke();
      g.fillStyle='rgba(255,236,150,.55)';g.beginPath();g.ellipse(-.5,.6,3.2,1.2,0,0,7);g.fill();}
    if(f.id==='koi'){g.fillStyle='#e2463c';g.beginPath();g.arc(-2,-1,1.5,0,7);g.arc(1.2,.8,1.2,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=.5;g.beginPath();g.ellipse(-1,0,5.5,3,0,0,7);g.stroke();}
  }else if(it.cat==='ore'){
    var o=it.sp;g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(.5,4,6,1.8,0,0,7);g.fill();
    g.fillStyle=o.col;g.beginPath();g.moveTo(-6,3);g.lineTo(-5,-3);g.lineTo(-1,-6);g.lineTo(4,-4.5);g.lineTo(6.2,1);g.lineTo(4,4);g.lineTo(-3,4.5);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.moveTo(-5,-2.6);g.lineTo(-1,-5.4);g.lineTo(2,-4.4);g.lineTo(-2,-1.5);g.closePath();g.fill();
    g.fillStyle=o.spk;[[-2,0,1.3],[2.5,-1.5,1.1],[1,2.4,.9]].forEach(function(p){g.beginPath();g.arc(p[0],p[1],p[2],0,7);g.fill();});
  }else if(id==='sofa'){
    g.fillStyle='#b0603a';rr(g,-7,-3,14,6,2);g.fill();g.fillStyle='#c97a4a';rr(g,-7,-6,14,4,2);g.fill();g.fillStyle='#8a4a2a';g.fillRect(-8,-4,2.4,7);g.fillRect(5.6,-4,2.4,7);g.fillStyle='#f0bb3f';g.beginPath();g.arc(-2.5,-1,1,0,7);g.arc(2.5,-1,1,0,7);g.fill();
  }else if(id==='gift'){
    g.fillStyle='#e2463c';rr(g,-5.5,-3,11,8,1.2);g.fill();g.fillStyle='#c8453d';rr(g,-6.2,-5,12.4,3,1);g.fill();g.fillStyle='#f0bb3f';g.fillRect(-.9,-5,1.8,10);g.beginPath();g.ellipse(-2.4,-6,2.4,1.4,-.4,0,7);g.ellipse(2.4,-6,2.4,1.4,.4,0,7);g.fill();
  }else if(id==='glass'){
    g.fillStyle='rgba(160,215,245,.85)';g.beginPath();g.moveTo(-6,4);g.lineTo(-3,-5);g.lineTo(6,-5);g.lineTo(3,4);g.closePath();g.fill();g.strokeStyle='#e8f7ff';g.lineWidth=.8;g.stroke();
    g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=.9;g.beginPath();g.moveTo(-2,2);g.lineTo(0,-3);g.moveTo(1,2);g.lineTo(2,-.5);g.stroke();
  }else if(id==='plastic'){
    [['#ff7aa8',-3,1],['#4fc3c9',2.6,1.4],['#ffd35a',0,-2.6]].forEach(function(p){g.fillStyle=p[0];rr(g,p[1]-3,p[2]-2.4,6,4.8,2);g.fill();g.fillStyle='rgba(255,255,255,.45)';g.fillRect(p[1]-2,p[2]-1.8,3,1);});
  }else if(id==='tv'){
    g.strokeStyle='#3a3f45';g.lineWidth=.8;g.beginPath();g.moveTo(-1,-5);g.lineTo(-4,-9);g.moveTo(1,-5);g.lineTo(4,-9);g.stroke();
    g.fillStyle='#2b2f36';rr(g,-7,-5,14,10,2);g.fill();var tg=g.createLinearGradient(-5,-3,5,3);tg.addColorStop(0,'#6fd0ff');tg.addColorStop(1,'#8a6bff');g.fillStyle=tg;rr(g,-5.5,-3.6,11,7,1);g.fill();
    g.fillStyle='rgba(255,255,255,.35)';g.fillRect(-4.5,-3,4,1);g.fillStyle='#2b2f36';g.fillRect(-3,5,6,1.4);
  }else if(id==='pc'){
    g.fillStyle='#d9dee4';rr(g,-7,-7,14,10,1.6);g.fill();g.fillStyle='#1e2630';rr(g,-6,-6,12,7.4,1);g.fill();g.fillStyle='#4fc3ff';g.fillRect(-5,-5,6,1.2);g.fillStyle='#8fe39c';g.fillRect(-5,-3,8,1.2);g.fillStyle='#ffd35a';g.fillRect(-5,-1,5,1.2);
    g.fillStyle='#b8c0c8';g.fillRect(-1.2,3,2.4,2);g.fillStyle='#8f969e';rr(g,-7,5,14,2.6,1);g.fill();
  }else if(id==='phone'){
    g.fillStyle='#2b2f36';rr(g,-4,-7,8,14,2);g.fill();var pg2=g.createLinearGradient(0,-6,0,5);pg2.addColorStop(0,'#ff9ae8');pg2.addColorStop(1,'#6fd0ff');g.fillStyle=pg2;rr(g,-3.2,-5.8,6.4,10.6,1.2);g.fill();
    g.fillStyle='rgba(255,255,255,.8)';g.fillRect(-1,5.6,2,.8);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(-2.6,-5,1.4,6);
  }else if(id==='ingot'){
    g.fillStyle='#8f969e';g.beginPath();g.moveTo(-6,3);g.lineTo(-4,-2);g.lineTo(4,-2);g.lineTo(6,3);g.closePath();g.fill();g.fillStyle='#d3dbe2';g.fillRect(-3.6,-2,7.2,1.4);g.fillStyle='rgba(255,255,255,.5)';g.fillRect(-2,.4,4,.8);
  }else if(id==='tool'){
    g.strokeStyle='#7a5a3c';g.lineWidth=1.8;g.lineCap='round';g.beginPath();g.moveTo(-4,5);g.lineTo(3,-3);g.stroke();g.fillStyle='#aeb8c2';g.beginPath();g.moveTo(1,-6);g.lineTo(7,-3);g.lineTo(5,-1);g.lineTo(0,-4);g.closePath();g.fill();
    g.strokeStyle='#5d6670';g.lineWidth=1.6;g.beginPath();g.moveTo(-5,-4);g.lineTo(4,5);g.stroke();g.lineCap='butt';
  }else if(id==='engine'){
    g.fillStyle='#5d6670';g.save();g.rotate(time*1.5);for(var gt=0;gt<8;gt++){g.rotate(.785);g.fillRect(-1.2,-6.5,2.4,2.4);}g.beginPath();g.arc(0,0,5,0,7);g.fill();g.fillStyle='#f0bb3f';g.beginPath();g.arc(0,0,2,0,7);g.fill();g.restore();
  }else if(id==='chair'){
    g.fillStyle='#a8743f';g.fillRect(-4,-7,1.8,13);g.fillRect(-4,0,8,1.8);g.fillRect(2.4,0,1.6,6);
    g.fillStyle='#c48d52';g.fillRect(-4,-6,5,1.4);g.fillRect(-4,-3,5,1.4);
  }else if(id==='table'){
    g.fillStyle='#c48d52';rr(g,-7,-3,14,2.8,1);g.fill();
    g.fillStyle='#8a5a30';g.fillRect(-6,-.2,1.8,6.5);g.fillRect(4.2,-.2,1.8,6.5);
  }else if(id==='can'){
    g.fillStyle='#b9c3cc';rr(g,-4.5,-5.5,9,11,2);g.fill();
    g.fillStyle='#e2553c';g.fillRect(-4.5,-2.5,9,5);
    g.fillStyle='#dfe6ec';g.beginPath();g.ellipse(0,-5.5,4.5,1.3,0,0,7);g.fill();
  }else if(id==='smoked'){
    fishShape(g,'#8a5a30',true);
  }else if(id==='meat'){
    g.fillStyle='#f3ead8';rr(g,2,-1.4,6,2.8,1.4);g.fill();g.beginPath();g.arc(7.6,-1.6,1.6,0,7);g.arc(7.6,1.6,1.6,0,7);g.fill();
    g.fillStyle='#c9463d';g.beginPath();g.ellipse(-1.5,0,5.6,4.6,-.3,0,7);g.fill();
    g.fillStyle='#e8706a';g.beginPath();g.ellipse(-2.4,-.8,3.6,2.8,-.3,0,7);g.fill();
    g.strokeStyle='#f6c7bf';g.lineWidth=.7;g.beginPath();g.moveTo(-5,-1);g.quadraticCurveTo(-2,1.5,1.5,-.5);g.stroke();
  }else if(id==='hide'){
    g.fillStyle='#e9eef3';g.beginPath();g.moveTo(-6,-5);g.lineTo(-3,-3.5);g.lineTo(3,-3.5);g.lineTo(6,-5);g.lineTo(5,-1);g.lineTo(5,2);g.lineTo(6.5,5);g.lineTo(2.5,3.6);g.lineTo(-2.5,3.6);g.lineTo(-6.5,5);g.lineTo(-5,2);g.lineTo(-5,-1);g.closePath();g.fill();
    g.strokeStyle='#b8c6d3';g.lineWidth=.8;g.stroke();
    g.fillStyle='#f9fbfd';g.beginPath();g.arc(0,-4.6,2.2,0,7);g.fill();g.fillStyle='#2b2b35';g.beginPath();g.arc(0,-3.6,.6,0,7);g.fill();
  }
  g.restore();
}
var TOOL_COL=['#b58a5a','#a5a59e','#d3dbe2','#f0bb3f','#8fe8ff'];
var ROD_COL=['#c9a16a','#7ea56b','#aeb8c2','#f0bb3f','#8fe8ff'];
var BOOT_COL=['#7a5a3c','#a4704a','#9aa5b1','#f0bb3f','#8fe8ff'];
function drawAxe(g,x,y,ang,t,s){
  g.save();g.translate(x,y);g.rotate(ang);g.scale(s,s);
  g.strokeStyle='#7a5a3c';g.lineWidth=2.4;g.lineCap='round';
  g.beginPath();g.moveTo(0,7);g.lineTo(0,-8);g.stroke();
  g.fillStyle=TOOL_COL[t];g.beginPath();g.moveTo(0,-10);g.quadraticCurveTo(9,-13,9,-3);g.lineTo(0,-3);g.closePath();g.fill();
  g.restore();
}
function drawRod(g,x,y,ang,t,s,noLine){
  g.save();g.translate(x,y);g.rotate(ang);g.scale(s,s);
  g.strokeStyle=ROD_COL[t];g.lineWidth=2.2;g.lineCap='round';
  g.beginPath();g.moveTo(0,7);g.quadraticCurveTo(6,-4,12,-12);g.stroke();
  if(!noLine){g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=.8;g.beginPath();g.moveTo(12,-12);g.lineTo(13.5,-1);g.stroke();
    g.fillStyle='#ff5a5a';g.beginPath();g.arc(13.5,0,2,0,7);g.fill();}
  g.restore();
}
function drawBoots(g,x,y,t){
  var col=BOOT_COL[t];
  [-4,4].forEach(function(dx){g.fillStyle=col;g.beginPath();g.ellipse(x+dx,y,3.7,2.7,0,0,7);g.fill();});
  if(t===4){g.fillStyle='#fff';[-1,1].forEach(function(s){var wx=x+s*7;g.beginPath();g.moveTo(wx,y-1);g.lineTo(wx+s*5,y-6);g.lineTo(wx+s*3,y+1);g.closePath();g.fill();});}
}
var SHIRT={player:['#31a8d0','#1886b0','#9a5ab8','#3f7fb8','#f4f4ff'],
  lumber:['#c8453d','#3d6fc8','#2f8a4f','#6b4a8e','#eef6ff'],
  fisher:['#f0c23c','#f08a3c','#4fb3a0','#3f5fb8','#f4f4ff'],
  courier:['#5a8fb8','#4f9a6a','#b8645a','#6b4a8e','#eef6ff'],
  hunter:['#5b7a3a','#6b5a3a','#3f6b5a','#7a4a3a','#eef6ff'],
  imk:['#e9e2d0','#e9e2d0','#e9e2d0','#e9e2d0','#e9e2d0'],
  hunter2:['#2f7fa8','#2a6f9a','#1f5f8a','#3f4fa8','#eef6ff'],
  hunter3:['#4a4a55','#3d3d48','#2f2f3a','#5a2a3a','#eef6ff'],
  miner:['#8a6a44','#5a6a7a','#3a4a5a','#f0bb3f','#eef6ff']};
var HAT={player:['#8fe3f5','#48b9d8','#9a5ab8','#f0bb3f','#8fe8ff'],
  lumber:['#2f6b4a','#8a5a30','#333a44','#f0bb3f','#8fe8ff'],
  fisher:['#f0c23c','#f08a3c','#4fb3a0','#f0bb3f','#8fe8ff'],
  courier:['#3f7fb8','#2f6b4a','#8a3a30','#f0bb3f','#8fe8ff'],
  hunter:['#3f5a2a','#4f6b2f','#2f4a3a','#f0bb3f','#8fe8ff'],
  imk:['#c8302f','#c8302f','#c8302f','#c8302f','#c8302f'],
  hunter2:['#f4f4ff','#e8f2ff','#dfe9ff','#f0bb3f','#8fe8ff'],
  hunter3:['#9aa5b1','#aeb8c2','#c3cbd3','#f0bb3f','#8fe8ff'],
  miner:['#f0c23c','#f0a03c','#e8e8e8','#f0bb3f','#8fe8ff']};
var SCARF=['','','#e2463c','#f0bb3f','#8fe8ff'];
var PANTS={player:'#3f4f7a',lumber:'#3d4a6b',fisher:'#5d6b3d',courier:'#555b66',hunter:'#5b4a3a',imk:'#3a3f4a',hunter2:'#2b3f5a',hunter3:'#26262e',miner:'#4a4a52'},LEGH=5.5;
function drawPerson(g,x,y,role,dir,by,bt,t,t2,look){
  var colors=ART.roles;
  var coat=colors[role]||colors.lumber,skin=look?LOOK_SKIN[look.skin||0]:'#e3b992',level=look&&PRIM[role]?look[PRIM[role]]||0:0,stride=curWalk?Math.sin(curPh)*1.9:0;
  if(level>0)coat=ART.coats[Math.min(10,level-1)];
  g.save();g.translate(x,y);g.scale(dir||1,1);g.lineCap='round';g.lineJoin='round';
  g.fillStyle='rgba(31,48,36,.18)';g.beginPath();g.ellipse(2,10,8,2.6,-.15,0,7);g.fill();
  [-1,1].forEach(function(s){var foot=s*2.5+stride*s,knee=s*2.2+stride*s*.5;var pants=g.createLinearGradient(s*2-2,0,s*2+2,0);pants.addColorStop(0,'#879182');pants.addColorStop(.45,'#475a4c');pants.addColorStop(1,'#293d34');g.strokeStyle=pants;g.lineWidth=3.5;g.beginPath();g.moveTo(s*2.2,-1);g.lineTo(knee,4.5);g.lineTo(foot,8);g.stroke();g.fillStyle='#594c3d';rr(g,foot-2,7,5,2.8,1);g.fill();g.fillStyle='#29362d';g.fillRect(foot-2,9,5.4,.8);});
  g.translate(0,by*.6);
  g.strokeStyle='#58664f';g.lineWidth=3;g.beginPath();g.moveTo(-4,-15);g.lineTo(-6,-9-stride*.5);g.lineTo(-5,-3-stride*.4);g.stroke();g.fillStyle=skin;g.beginPath();g.ellipse(-5,-2-stride*.4,1.5,1.8,0,0,7);g.fill();
  var fabric=g.createLinearGradient(-7,-16,6,0);fabric.addColorStop(0,artShade(coat,1.3));fabric.addColorStop(.25,coat);fabric.addColorStop(.78,coat);fabric.addColorStop(1,artShade(coat,.55));g.fillStyle=fabric;g.beginPath();g.moveTo(-2.8,-18);g.lineTo(-6.3,-15);g.lineTo(-4.2,-7);g.lineTo(-4.8,1.5);g.quadraticCurveTo(0,3,4.8,1.5);g.lineTo(4.2,-7);g.lineTo(6.3,-15);g.lineTo(2.8,-18);g.closePath();g.fill();
  var apron=g.createLinearGradient(-3,-12,4,2);apron.addColorStop(0,level>=3?'#c7c7ae':'#dfceb0');apron.addColorStop(1,'#aa9472');g.fillStyle=apron;rr(g,-3.3,-12,7,13,1);g.fill();g.strokeStyle='#f0dfba';g.lineWidth=.5;g.beginPath();g.moveTo(-3,-12);g.lineTo(-2,0);g.stroke();
  if(level>=1){g.fillStyle='#88795b';g.fillRect(-2,-7,4,3);g.fillStyle='#dbca9e';g.fillRect(-2,-7,4,.6);}
  if(level>=2){g.strokeStyle='#786546';g.lineWidth=.7;g.beginPath();g.moveTo(-2,-13);g.lineTo(-4,-17);g.moveTo(3,-13);g.lineTo(4,-17);g.stroke();g.fillStyle='#d6bc81';g.fillRect(1,-10,1.2,1.2);}
  if(level>=3){g.fillStyle='#c6b78d';g.fillRect(-5,-2,10,1.7);g.fillStyle='#84674a';g.fillRect(-.6,-2,2,1.7);g.fillStyle='#9eaa8b';rr(g,-5.5,-16,4,2,1);g.fill();}
  if(level>=4){g.fillStyle='#b4a377';rr(g,-5,-16,4,3,1);g.fill();}
  if(level>=5){g.strokeStyle='#c4b791';g.lineWidth=.7;g.beginPath();g.moveTo(-4,-14);g.lineTo(3,-6);g.stroke();}
  if(level>=6){g.fillStyle='#657568';rr(g,3,-10,3,6,1);g.fill();}
  if(level>=7){g.fillStyle='#b2beaa';g.beginPath();g.ellipse(5,-15,2.4,1.8,0,0,7);g.fill();}
  if(level>=8){g.fillStyle='#9b855f';g.fillRect(-3,-3,7,1.5);}
  if(level>=9){g.strokeStyle='#c8b979';g.lineWidth=.6;g.beginPath();g.moveTo(-4,-16);g.lineTo(-5,-8);g.stroke();}
  if(level>=10){g.fillStyle='#98aa9b';rr(g,-5,-12,2,7,.5);g.fill();}
  if(level>=11){g.fillStyle='#d6c386';g.beginPath();g.arc(2,-13,1,0,7);g.fill();}
  g.strokeStyle=fabric;g.lineWidth=3.4;g.beginPath();g.moveTo(5,-14);g.lineTo(7,-9+stride*.4);g.lineTo(8,-3+stride*.5);g.stroke();g.strokeStyle='#cad0b4';g.lineWidth=.5;g.beginPath();g.moveTo(5.4,-13);g.lineTo(7.3,-9+stride*.4);g.stroke();g.fillStyle=skin;g.beginPath();g.ellipse(8,-2+stride*.5,1.6,2,0,0,7);g.fill();
  g.fillStyle=skin;rr(g,-1.2,-21,2.8,4,1);g.fill();
  var face=g.createLinearGradient(-4,-27,5,-19);face.addColorStop(0,'#f7e5c5');face.addColorStop(.48,skin);face.addColorStop(1,'#ab795c');g.fillStyle=face;g.beginPath();g.moveTo(-3,-25);g.quadraticCurveTo(1,-29,4,-25);g.lineTo(4,-22);g.lineTo(5,-21);g.lineTo(4,-20);g.quadraticCurveTo(2,-17.5,0,-18.5);g.quadraticCurveTo(-3.5,-20,-3,-25);g.fill();g.fillStyle=skin;g.beginPath();g.ellipse(-3,-22,1.2,1.6,0,0,7);g.fill();
  g.fillStyle=look?LOOK_HAIR[look.hair||0]:'#463e31';g.beginPath();g.moveTo(-4,-21);g.lineTo(-4,-25);g.quadraticCurveTo(0,-29,4,-25);g.lineTo(3.5,-24);g.quadraticCurveTo(0,-27,-2,-24);g.lineTo(-2,-21);g.closePath();g.fill();
  var hat=g.createLinearGradient(-5,-28,5,-23);hat.addColorStop(0,'#abb595');hat.addColorStop(.5,coat);hat.addColorStop(1,'#3f5745');g.fillStyle=hat;g.beginPath();g.ellipse(-.1,-25.5,5.2,3.5,0,Math.PI,Math.PI*2);g.lineTo(5.1,-25);g.lineTo(-5.3,-25);g.closePath();g.fill();g.fillStyle='#7d896d';rr(g,-5.8,-25,11.5,1.8,.6);g.fill();g.fillStyle='#d0c49c';g.fillRect(-5,-24.8,10,.5);
  if(role==='miner'){g.fillStyle='#ddb45d';g.beginPath();g.arc(3,-26,1.6,0,7);g.fill();g.fillStyle='#fff0bb';g.beginPath();g.arc(3,-26,.8,0,7);g.fill();}
  if(role==='fisher'){g.fillStyle='#867c61';g.beginPath();g.ellipse(0,-24,7.5,1.3,0,0,7);g.fill();}
  g.strokeStyle='#594535';g.lineWidth=.65;g.beginPath();g.moveTo(1,-23.7);g.lineTo(3,-24);g.stroke();g.fillStyle='#2e3c32';g.beginPath();g.ellipse(2.6,-22.7,.65,.8,0,0,7);g.fill();g.fillStyle='#f4edda';g.fillRect(2.7,-23,.25,.3);g.strokeStyle='#995f49';g.lineWidth=.45;g.beginPath();g.moveTo(2,-20);g.lineTo(3.5,-20.2);g.stroke();
  g.fillStyle='#d6bc88';rr(g,-3.5,-18.2,7,1.8,.5);g.fill();if(t>=3){g.fillStyle='#d7b66c';g.beginPath();g.arc(-3,-13,1,0,7);g.fill();}
  g.restore();
}

/* ---------- agents: movement and work ---------- */
var agents=[];
var HOME={x:150,y:418}; /* Spawn below the forest upgrade's 21px purchase radius. */
function LODGEP(){return PLOTS.filter(function(p){return p.id==='lodge';})[0];}
var WNAMES=['도토리','솔방울','다람','보리','콩이','해솔','나리','모모','초롱','별이','단풍','여울'];
var LOOK_HAIR=['#3a2c22','#7a4d2b','#c9a45a','#2b2b35','#a0522d','#e6ddcc'];
var LOOK_SKIN=['#ffe0c4','#f6d0ae','#e8b98f','#d9a47a'];
function newLook(){var used={};S.w.forEach(function(g){if(g.name)used[g.name]=1;});var free=WNAMES.filter(function(n){return !used[n];});
  return {name:free.length?free[Math.floor(Math.random()*free.length)]:'일꾼'+(S.w.length+1),hair:Math.floor(Math.random()*LOOK_HAIR.length),skin:Math.floor(Math.random()*LOOK_SKIN.length),acc:Math.floor(Math.random()*4)};}
S.w.forEach(function(g){if(!g.name){var l=newLook();g.name=l.name;g.hair=l.hair;g.skin=l.skin;g.acc=l.acc;}});
function mkAgent(role,gear){
  return {role:role,gear:gear,x:HOME.x+(Math.random()-.5)*30,y:HOME.y+(Math.random()-.5)*14,bag:{},res:null,prog:0,path:[],goal:null,
    bob:0,dir:1,swing:0,idleT:0,ix:HOME.x,iy:HOME.y,mv:false,working:false,kind:role==='fisher'?'fish':(role==='miner'?'ore':'tree'),lockT:0,colT:0,thinkT:0,
    sc:role==='player'?1:0.76,slot:agents.length%3};
}
agents.push(mkAgent('player',S.p));
/* the player starts on the clear plaza spot, never on top of an upgrade pad */
agents[0].x=HOME.x;agents[0].y=HOME.y;
S.w.forEach(function(g){agents.push(mkAgent(g.role,g));});
/* the in-game supervisor (v46) was removed (code deleted in v51): refund anyone who had hired it */
if(S.sup){S.coins+=900;S.refundN=(S.refundN||0)+900;S.sup=0;}
function bagN(a){var n=0;for(var k in a.bag)n+=a.bag[k];return n;}
function bagLine(a,line){var n=0;for(var k in a.bag)if(ITEMS[k].line===line)n+=a.bag[k];return n;}
function spdOf(a){return 70*(1+0.15*(a.gear.boots||0));}
function release(a){if(a.res){a.res.by=null;a.res.prog=0;a.res=null;}a.prog=0;}
function speedOf(a){return a.role==='player'?spdOf(a)*1.38:spdOf(a)*WMOVE;}
function moveTo(a,x,y,dt){
  var dx=x-a.x,dy=y-a.y,d=Math.hypot(dx,dy),sp=speedOf(a)*dt;
  a.mv=d>.5;
  if(d<=sp){a.x=x;a.y=y;return true;}
  a.x+=dx/d*sp;a.y+=dy/d*sp;if(Math.abs(dx)>.5)a.dir=dx>0?1:-1;a.bob+=dt*13;return false;
}
function tileOf(a){return tileAt(a.x,Math.min(a.y,H-1));}
function sameTile(t,u){return !!(t&&u&&t.c===u.c&&t.r===u.r);}
/* shortest tile path (4-neighbour BFS over walkable tiles) */
function findPath(from,to){
  if(!tileOk(to.c,to.r))return null;
  var key=function(t){return t.c+','+t.r;},prev={},q=[from],head=0,seen={};seen[key(from)]=1;
  while(head<q.length){var cur=q[head++];if(sameTile(cur,to))break;
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var n={c:cur.c+d[0],r:cur.r+d[1]},k=key(n);if(seen[k]||!tileOk(n.c,n.r))return;seen[k]=1;prev[k]=cur;q.push(n);});}
  if(!seen[key(to)])return null;
  var path=[],t=to;while(!sameTile(t,from)){path.push(t);t=prev[key(t)];}
  return path.reverse();
}
function goTile(a,t){
  if(isBank(t.c,t.r))t={c:Math.floor((SITE.p1.x+SITE.p1.w+8)/T),r:t.r};
  var f=tileOf(a)||tileAt(HOME.x,HOME.y);
  if(sameTile(f,t)){a.path=[];a.goal=t;return true;}
  var p=findPath(f,t);if(!p)return false;
  release(a);p.unshift(f);a.path=p;a.goal=t;return true;
}
function followPath(a,dt){var t=a.path[0];if(moveTo(a,tileXw(t.c,t.r),tileYw(t.c,t.r),dt))a.path.shift();}
/* everyone works from the tile centre (workers shuffle into small slots so they don't overlap) */
function stand(q,a){var side=q.x<q.tc*T+30?-1:1;if(q.k==='fish')return {x:SITE[q.s].x+SITE[q.s].w+8,y:Math.max(q.tr*T+6,Math.min(q.tr*T+56,q.y+2))};return {x:Math.max(6,Math.min(MX-6,q.x+side*10)),y:Math.min(q.tr*T+56,q.y+10)};}
function near(a,p,d){return Math.hypot(a.x-p.x,a.y-p.y)<(d||26);}
function workersOnSite(sid,except){var n=0;agents.forEach(function(a){if(a!==except&&a.res&&a.res.s===sid&&a.role!=='player')n++;});return n;}
function pileRoomW(sid,a){return pn(sid)+workersOnSite(sid,a)<pcap();}
function canTake(a,q){
  if(!q.alive||!owned(q.s)||(q.by&&q.by!==a))return false;
  if(a.role==='lumber'&&q.k!=='tree')return false;
  if(a.role==='fisher'&&q.k!=='fish')return false;
  if(a.role==='miner'&&q.k!=='ore')return false;
  return okFor(a.gear,q);
}
function resInTile(c,r){return res.filter(function(q){return q.tr===r&&(q.tc===c||(q.k==='fish'&&isBank(c,r)));});}
function harvestable(a,c,r){return resInTile(c,r).filter(function(q){return canTake(a,q);});}
function needMsg(q){var tr=q.k==='tree'?'axe':(q.k==='ore'?'pick':'rod');return NAMES[tr][spOf(q).tier]+(tr==='axe'?' 도끼':' 낚싯대')+'가 필요해요';}
function harvest(a){
  var q=a.res;if(!q)return;
  if(!okFor(a.gear,q)){release(a);return;}
  var sp=spOf(q),sid=q.s,pp=pilePos(sid),pl=pileOf(sid);
  if(a.role==='player'&&q.k!=='ore'&&!cvLv(sid)){if(bagN(a)>=cap()){release(a);addFloat(a.x,a.y-34,'두 손이 가득! 납품하러 가요','#ffb3b3');return;}a.bag[sp.id]=(a.bag[sp.id]||0)+1;var tp=stackTop(a);fly(sp.id,q.x,q.y-8,tp.x,tp.y,.3);}
  else if(pn(sid)<pcap()){pl[sp.id]=(pl[sp.id]||0)+1;burst(pp.x,pp.y-6,q.k==='tree'?'#b58a5a':(q.k==='ore'?'#c9ced4':'#bfe9f7'),a.role==='player'?4:3,false);if(a.role==='player')addFloat(pp.x,pp.y-24,'📦+1','#ffffff',true);}
  if(a.role==='player'){S.h1=1;if(S.tut===1&&q.k==='tree')S.tutN=(S.tutN||0)+1;sfx(q.k==='fish'?'splash':'fell');}
  stat('gather',1);q.alive=false;q.timer=q.max;release(a);
}
function progress(a,dt){
  if(a.role==='player'&&tutNoGather()){release(a);return;}
  var q=a.res,need=baseTime(a.gear,q)/(a.role==='player'?1:WORKF);
  var tutBoost=(a.role==='player'&&tutOn()&&S.tut===1)?2.4:1;a.prog+=dt*tutBoost;q.prog=a.prog;q.need=need;a.swing+=dt*9;a.working=true;a.kind=q.k;
  a.fxT=(a.fxT||0)+dt;
  if(a.fxT>.28){a.fxT=0;if(a.role==='player')sfx(q.k==='tree'?'chop':'cast',.2);
    if(q.k==='tree'){var tsp0=TREES[q.sp];parts.push({x:q.x+(Math.random()-.5)*14,y:q.y-14,vx:(Math.random()-.5)*18,vy:-6,g:26,life:1.1,max:1.1,col:Math.random()<.5?tsp0.c1:tsp0.c2,r:1.7,leaf:1});q.hit=.25;}
    else if(q.k==='ore'){q.hit=.25;for(var sk=0;sk<3;sk++)parts.push({x:q.x+(Math.random()-.5)*10,y:q.y-6,vx:(Math.random()-.5)*50,vy:-20-Math.random()*30,g:120,life:.4,max:.4,col:Math.random()<.5?'#fff1a8':'#ffb14a',r:1.1,spark:true});}
    else{parts.push({x:q.x,y:q.y,vx:0,vy:0,g:0,life:.7,max:.7,col:'#ffffff',r:3,ring:1});}
    /* v77: the hero's own gathering throws extra, more colourful sparkle the higher his tier (same tier that changes his look) */
    if(a.role==='player'){var htG=heroTier();if(htG>0)for(var gpi=0;gpi<htG;gpi++)parts.push({x:q.x+(Math.random()-.5)*16,y:q.y-10,vx:(Math.random()-.5)*60,vy:-28-Math.random()*30,g:90,life:.5,max:.5,col:'hsl('+Math.floor(Math.random()*360)+',90%,70%)',r:1.6,star:1});}
  }
  if(a.prog>=need)harvest(a);
}
/* gathering tile: pick the nearest harvestable resource in this tile and work it */
function workTile(a,t,dt){
  var st=siteOfTile(t.c,t.r);if(!st||!owned(st.id))return false;
  if(a.res&&(!a.res.alive||a.res.by!==a||a.res.tc!==t.c||a.res.tr!==t.r))release(a);
  if(!a.res){
    var room=a.role==='player'?((cvLv(st.id)||st.kind==='mine')?pn(st.id)<pcap():bagN(a)<cap()):pileRoomW(st.id,a);
    if(!room){if(a.role==='player'&&a.lockT<=0){addFloat(a.x,a.y-30,cvLv(st.id)?'벨트가 밀려 있어요':'적재칸이 가득! 챙겨서 팔아요','#ffb3b3');a.lockT=3;}return false;}
    var best=null,bd=1e9;harvestable(a,t.c,t.r).forEach(function(q){var d=Math.hypot(q.x-a.x,q.y-a.y);if(d<bd){bd=d;best=q;}});
    if(!best){
      if(a.role==='player'&&a.lockT<=0){var lk=resInTile(t.c,t.r).filter(function(q){return q.alive&&!okFor(a.gear,q);})[0];if(lk){addFloat(a.x,a.y-30,needMsg(lk),'#ffe2a8');a.lockT=3;}}
      return false;}
    best.by=a;a.res=best;a.prog=0;
  }
  var p=stand(a.res,a);if(moveTo(a,p.x,p.y,dt)){a.dir=a.res.x>=a.x?1:-1;progress(a,dt);}else{a.prog=0;a.res.prog=0;}
  return true;
}
/* storage tile (no belt): scoop the pile into the bag */
function collectStore(a,t,dt){
  var st=siteOfTile(t.c,t.r);if(!st||cvLv(st.id)||st.kind==='mine')return false;
  a.colT-=dt;if(a.colT>0)return true;a.colT=.25;
  var room=cap()-bagN(a);if(room<=0||pn(st.id)<=0)return false;
  var got=takeFromPile(a,st.id,room);if(got>0){addFloat(a.x,a.y-30,'📦+'+got,'#cfe6ff',true);sfx('pickup');}
  return true;
}
function idleInTile(a,dt){var t=tileOf(a);if(!t)return;a.idleT-=dt;if(a.idleT<=0){a.idleT=2+Math.random()*3;a.ix=tileXw(t.c,t.r)+(Math.random()-.5)*(isBank(t.c,t.r)?4:24);a.iy=tileYw(t.c,t.r)+(Math.random()-.5)*18;}moveTo(a,a.ix,a.iy,dt);}
/* drop carried goods on a stall counter */
function dropAt(a,line){
  var n=0,room=stallCap(line)-lineStock(line);
  for(var id in a.bag){
    if(ITEMS[id].line!==line)continue;
    var put=Math.min(a.bag[id],Math.max(0,room));if(put<=0)continue;
    addSs(line,id,put);a.bag[id]-=put;room-=put;n+=put;if(a.bag[id]<=0)delete a.bag[id];
  }
  if(n>0){if(a.role==='player'&&line==='wood'&&S.tut===2)S.tutDelivered=true;addFloat(STALL[line].x-20,STALL[line].y-26,'📦+'+n,'#ffffff',true);sfx('pickup');}
  return n;
}
var DROP_TILE={wood:{c:0,r:2},fish:{c:4,r:2}},WH_TILE={c:1,r:2};
/* market walkway: rows 0-2 = wood stall, rows 3-4 = fish stall, row 5 = warehouse door */
function tryDrops(a){
  var t=tileOf(a);if(!t||bagN(a)<=0||a.path.length)return;
  if(sameTile(t,DROP_TILE.wood))dropAt(a,'wood');else if(sameTile(t,DROP_TILE.fish))dropAt(a,'fish');
  else if(false){var n=0,room=whCap()-whTotal();for(var id in a.bag){var put=Math.min(a.bag[id],Math.max(0,room));if(put<=0)continue;addWh(id,put);a.bag[id]-=put;room-=put;n+=put;if(a.bag[id]<=0)delete a.bag[id];}
    if(n>0){addFloat(WH.x0+20,WH.wall+6,'🏭 +'+n,'#ffffff');hopW.wood=1;}}
}
/* piles hold mixed species; take the most valuable first */
function takeFromPile(a,sid,max){
  var p=S.piles[sid];if(!p)return 0;
  var ids=Object.keys(p).filter(function(k){return p[k]>0;}).sort(function(x,y){return ITEMS[y].sp.val-ITEMS[x].sp.val;}),got=0;
  ids.forEach(function(id){var t=Math.min(p[id],max-got);if(t>0){p[id]-=t;got+=t;a.bag[id]=(a.bag[id]||0)+t;}});
  return got;
}
function deliverLine(a){var w=bagLine(a,'wood'),f=bagLine(a,'fish');return w>=f?(w>0?'wood':null):'fish';}
function autoDropTile(line){return DROP_TILE[line||'wood'];}
function bestGatherTile(a){
  var best=null,bs=-1e9,from=tileOf(a)||{c:2,r:4};
  SITES.forEach(function(st){
    if(!owned(st.id))return;
    if(a.role==='lumber'&&st.kind!=='forest')return;
    if(a.role==='fisher'&&st.kind!=='pond')return;
    if(a.role==='miner'&&st.kind!=='mine')return;
    if(a.role!=='miner'&&a.role!=='player'&&st.kind==='mine')return;
    var room=a.role==='player'?(pn(st.id)<pcap()||bagN(a)<cap()):pileRoomW(st.id,a);if(!room)return;
    st.tiles.forEach(function(t){if(t.store||t.pad)return;var n=harvestable(a,t.c,t.r).length;if(!n)return;
      var crowd=agents.filter(function(x){return x!==a&&x.goal&&sameTile(x.goal,t);}).length;
      var sc=n*2-crowd*3-(Math.abs(t.c-from.c)+Math.abs(t.r-from.r))*.4+(sameTile(a.goal,t)?1:0);
      if(sc>bs){bs=sc;best=t;}});
  });
  return best;
}
function stepWorker(a,dt){
  a.full=false;
  if(a.path.length){followPath(a,dt);return;}
  var t=tileOf(a);
  if(t&&tileKind(t.c,t.r)==='gather'&&workTile(a,t,dt))return;
  a.thinkT-=dt;
  if(a.thinkT<=0){a.thinkT=.25;var b=bestGatherTile(a);if(b&&!sameTile(b,t)){goTile(a,b);return;}}
  waitForRes(a,dt);
}
/* nothing to cut right now: stand by the resource that grows back soonest instead of wandering */
function waitForRes(a,dt){
  var k=a.role==='lumber'?'tree':(a.role==='fisher'?'fish':'ore'),best=null,bt=1e9;
  res.forEach(function(q){if(q.k!==k||!owned(q.s)||(q.by&&q.by!==a))return;var crowd=0;agents.forEach(function(o){if(o!==a&&o.waitQ===q)crowd++;});
    var tt=(q.alive?0:q.timer)+crowd*4+Math.hypot(q.x-a.x,q.y-a.y)/80;if(tt<bt){bt=tt;best=q;}});
  a.waitQ=best;a.full=best&&!pileRoomW(best.s,a);
  if(!best){idleInTile(a,dt);return;}
  var t=tileOf(a);if(!t||t.c!==best.tc||t.r!==best.tr){goTile(a,{c:best.tc,r:best.tr});return;}
  var p=stand(best,a);if(moveTo(a,p.x,p.y,dt)){a.dir=best.x>=a.x?1:-1;a.mv=false;}
}
function stepPlayerManual(a,dt){
  tryDrops(a);a.lockT-=dt;
  if(a.path.length){followPath(a,dt);return;}
  var t=tileOf(a);if(!t)return;var k=tileKind(t.c,t.r);
  if(k==='gather'){if(!workTile(a,t,dt))a.prog=0;}
  else if(k==='store')collectStore(a,t,dt);
}
function stepPlayerAuto(a,dt){
  tryDrops(a);a.lockT=1;
  if(!a.path.length&&bagN(a)===0){var cl=cashSpots().filter(function(o){return (S.cash&&S.cash[o.k]||0)>=25;})[0];if(cl){var ctg=cl.b?tileAt(cl.p.x,cl.p.y):DROP_TILE[cl.k],ct=tileOf(a);if(ctg&&!sameTile(ct,ctg)){goTile(a,ctg);return;}if(ctg&&Math.hypot(a.x-cl.p.x,a.y-cl.p.y)>30){moveTo(a,cl.p.x,cl.p.y-6,dt);return;}}}
  if(autoHunt(a,dt))return;
  if(a.path.length){followPath(a,dt);return;}
  var t=tileOf(a),k=t&&tileKind(t.c,t.r),n=bagN(a);
  if(k==='store'&&n<cap()){var ss0=siteOfTile(t.c,t.r);if(!cvLv(ss0.id)&&pn(ss0.id)>0){collectStore(a,t,dt);return;}}
  if(n>=cap()){goTile(a,autoDropTile(deliverLine(a)));return;}
  if(k==='gather'&&workTile(a,t,dt))return;
  a.thinkT-=dt;if(a.thinkT>0){idleInTile(a,dt);return;}a.thinkT=.25;
  var big=null;SITES.forEach(function(st){if(owned(st.id)&&st.kind!=='mine'&&!cvLv(st.id)&&pn(st.id)>=Math.min(pcap(),8)&&(!big||pn(st.id)>pn(big.id)))big=st;});
  if(big){goTile(a,big.store);return;}
  var b=bestGatherTile(a);if(b){if(!sameTile(b,t))goTile(a,b);return;}
  if(n>0){goTile(a,autoDropTile(deliverLine(a)));return;}
  var any=null;SITES.forEach(function(st){if(owned(st.id)&&st.kind!=='mine'&&!cvLv(st.id)&&pn(st.id)>0)any=st;});
  if(any){goTile(a,any.store);return;}
  idleInTile(a,dt);
}
/* v56 (director 2026-10-03): once a lumber / fishing crew reaches the top level it merges into one super worker -
   one big swing fells every grown tree in the forest (one cast of the net lands every fish in the river) */
var SUPER_ROLES={lumber:'axe',fisher:'rod',hunter:'bow',hunter2:'bow',hunter3:'bow',miner:'pick'},SUPER_T=1.1,SUPERFX=[],SUPERAURA=[];
/* v65 (director 2026-10-04): the three super hunters are the forest's 임꺽정, the lake's 거북선 (turtle ship) and the mine's 광개토대왕 on horseback */
var SUPERNAME={lumber:'슈퍼 나무꾼',fisher:'슈퍼 낚시꾼',hunter:'임꺽정',hunter2:'이순신 장군',hunter3:'광개토대왕',miner:'슈퍼 광부'};
function superGather(a){return !!(a.gear&&a.gear.super&&(a.role==='lumber'||a.role==='fisher'||a.role==='miner'));}
function superPos(role){return role==='lumber'?{x:210,y:276}:(role==='miner'?{x:900,y:186}:{x:518,y:276});}
function canMerge(role){var pr=SUPER_ROLES[role];if(!pr||!S.wlv||(S.wlv[role]||0)<MAXLV[pr])return false;var l=S.w.filter(function(g){return g.role===role;});return l.length>0&&!l.some(function(g){return g.super;})&&l.every(function(g){return (g[pr]||0)>=MAXLV[pr];});}
function mergeCrew(role,show){var l=S.w.filter(function(g){return g.role===role;}),keep=l[0];keep.super=1;keep.name=SUPERNAME[role];
  /* v59: workers that leave in the merge must let go of the tree / fish they had reserved - before, those stayed reserved forever and the super worker could never take them */
  agents.forEach(function(a){if(a.role===role&&a.gear!==keep)release(a);});
  S.w=S.w.filter(function(g){return g.role!==role||g===keep;});
  agents=agents.filter(function(a){return a.role==='player'||S.w.indexOf(a.gear)>=0;});
  if(S.rep)S.rep=S.rep.filter(function(e){return e.k!=='worker';});
  if(show){var p=isHunter(role)?hunterDoor(role):superPos(role);celebrate(p.x,p.y,'🌟 '+keep.name+' 탄생! '+l.length+'명이 하나로',true);flash=.6;burst(p.x,p.y-10,'#ffe27a',30,true);}
  save();}
/* v68 (director): one round of a super worker fills its loading deck to 90% (bonus goods on top of what was actually grown) */
function superTopUp(sid,k){var need=Math.ceil(.9*pcap())-pn(sid);if(need<=0)return 0;var L=Math.max(1,siteLv(sid)),ids=SPAWN[k].slice(0,spCount(L)).map(function(i){return spArr(k)[i].id;}),pl=pileOf(sid);
  for(var i=0;i<need;i++){var id=ids[Math.floor(Math.random()*ids.length)];pl[id]=(pl[id]||0)+1;}return need;}
function stepSuper(a,dt){var role=a.role,k={lumber:'tree',fisher:'fish',miner:'ore'}[role],sid={lumber:'f1',fisher:'p1',miner:'m1'}[role],p=superPos(role);
  a.working=false;if(!owned(sid)){idleInTile(a,dt);return;}
  if(Math.hypot(a.x-p.x,a.y-p.y)>3){moveTo(a,p.x,p.y,dt);return;}
  a.dir=-1;
  /* v65 (director 2026-10-04): the super fisher's net now really lands the fish - thrown out (0-0.45s), settles, the fish are lifted out of the water (0.55s)
     and hauled back inside the net, landing on the deck when the net is back (1.0s) */
  if(a.net){var N=a.net;N.t+=dt;a.working=true;
    if(N.t>=.55&&!N.lifted){N.lifted=true;N.list=N.list.filter(function(e){return e.q.alive&&(!e.q.by||e.q.by===a);});N.list.forEach(function(e){e.q.alive=false;e.q.timer=e.q.max;e.q.by=null;
      parts.push({x:e.x,y:e.y,vx:0,vy:0,g:0,life:.7,max:.7,col:'#ffffff',r:3,ring:1});for(var dr=0;dr<4;dr++)parts.push({x:e.x,y:e.y,vx:(Math.random()-.5)*40,vy:-30-Math.random()*30,g:120,life:.5,max:.5,col:'#bfe9f7',r:1.4});});
      if(Math.hypot(agents[0].x-a.x,agents[0].y-a.y)<160)sfx('splash',.2);}
    if(N.t>=1){var plN=pileOf(sid),ppN=pilePos(sid),nN=0;N.list.forEach(function(e){plN[e.id]=(plN[e.id]||0)+1;nN++;fly(e.id,a.x+12,a.y-14,ppN.x,ppN.y-6,.35+nN*.03);
        for(var st6=0;st6<2;st6++)parts.push({x:a.x+14,y:a.y-14,vx:(Math.random()-.5)*70,vy:-30-Math.random()*40,g:90,life:.9,max:.9,col:'hsl('+Math.floor(Math.random()*360)+',95%,65%)',r:2.6,star:1});});
      stat('gather',N.list.length);nN+=superTopUp(sid,k);N.done=true;a.net=null;if(nN){burst(a.x+12,a.y-14,'#fff1a8',16,true);shake(.12);addFloat(ppN.x,ppN.y-30,'🎣 +'+nN+'!','#ffe27a');sfx('pickup',.1);}}
    return;}
  /* v59 (bug: some fish were never landed): a fish/tree reserved by someone who is no longer working it counts as free */
  res.forEach(function(q){if(q.by&&!(q.by.net)&&(agents.indexOf(q.by)<0||q.by.res!==q))q.by=null;});
  var ready=res.filter(function(q){return q.s===sid&&q.k===k&&q.alive&&(!q.by||q.by===a);}),room=pcap()-pn(sid);
  a.full=!room;if(!ready.length){a.swT=0;return;}
  a.working=true;a.swT=(a.swT||0)+dt;a.swing+=dt*9;if(a.swT<SUPER_T)return;a.swT=0;
  if(k==='fish'){var lst=ready;lst.forEach(function(q){if(q.by&&q.by!==a)release(q.by);q.by=a;});a.net={t:0,list:lst.map(function(q){return {q:q,id:spOf(q).id,x:q.x,y:q.y};})};SUPERFX.push({x:a.x,y:a.y,t:0,k:'net',net:a.net,ax:a});sfx('cast',.2);return;}
  var pl=pileOf(sid),n=0,pp0=pilePos(sid);ready.forEach(function(q){var sp=spOf(q);if(q.by&&q.by!==a)release(q.by);pl[sp.id]=(pl[sp.id]||0)+1;n++;
    fly(sp.id,q.x,q.y-8,pp0.x,pp0.y-6,.45+n*.04);burst(q.x,q.y-10,'#ffe27a',6,true);SUPERFX.push({x:q.x,y:q.y,t:0,k:'pop'});
    burst(q.x,q.y-8,k==='tree'?'#b58a5a':(k==='ore'?'#c9ced4':'#bfe9f7'),5,false);for(var st5=0;st5<4;st5++)parts.push({x:q.x,y:q.y-12,vx:(Math.random()-.5)*70,vy:-30-Math.random()*40,g:90,life:.9,max:.9,col:'hsl('+Math.floor(Math.random()*360)+',95%,65%)',r:2.6,star:1});if(k==='tree')for(var lf=0;lf<3;lf++)parts.push({x:q.x+(Math.random()-.5)*14,y:q.y-14,vx:(Math.random()-.5)*30,vy:-14,g:30,life:1,max:1,col:Math.random()<.5?TREES[q.sp].c1:TREES[q.sp].c2,r:1.7,leaf:1});
    else parts.push({x:q.x,y:q.y,vx:0,vy:0,g:0,life:.7,max:.7,col:'#ffffff',r:3,ring:1});
    q.alive=false;q.timer=q.max;});
  stat('gather',n);n+=superTopUp(sid,k);SUPERFX.push({x:a.x,y:a.y,t:0,k:k});burst(a.x,a.y-14,'#fff1a8',18,true);burst(a.x,a.y-14,k==='tree'?'#ffb14a':'#8fe8ff',12,true);shake(.12);var pp=pilePos(sid);addFloat(pp.x,pp.y-30,(k==='tree'?'🪓 ':'🎣 ')+'+'+n+'!','#ffe27a');
  if(Math.hypot(agents[0].x-a.x,agents[0].y-a.y)<160)sfx(k==='tree'?'fell':'splash',.3);}
function step(a,dt){
  if(superGather(a)){a.mv=false;if(a.stunT>0){a.stunT-=dt;return;}stepSuper(a,dt);return;}
  a.mv=false;a.working=false;
  if(a.role==='player')((S.auto&&!joy.on&&!a.tap)?stepPlayerAuto:stepPlayerFree)(a,dt);
  else if(isHunter(a.role)){stepHunter(a,dt);hunterSeparate(a,dt);a.x=Math.max(8,Math.min(fenceX()-10,a.x));a.y=Math.max(WORLD_TOP+8,Math.min(HT-12,a.y));} /* v64: hunters never leave the map */
  else{if(a.stunT>0){a.stunT-=dt;return;}if(a.role==='miner'&&!owned('m1')){idleInTile(a,dt);return;}if(bearNear(a,a.role==='fisher'?44:30)){a.working=a.role==='lumber';return;}stepWorker(a,dt);}
}

/* ---------- conveyors: one belt per site -> plot edge -> corridor trunk -> stall / warehouse ---------- */
var belt=[],convT={},hopP={wood:0,fish:0};
/* export loader on the bottom tile of the forest/river: feeds the belt down to the factory */
function drawExport(sid){var st=SITE[sid];if(!st.xtT||!owned(sid)||!beltOn('proc_'+sid))return;var g=ctx,x=st.xtT.c*T,y=st.xtT.r*T,L=cvLv(sid),P=tierOfBelt(L),fx=loadFx['x'+sid]||0,line=st.line,n=S.pin[line]||0;
  g.fillStyle='rgba(0,0,0,.16)';g.beginPath();g.ellipse(x+30,y+48,22,4,0,0,7);g.fill();
  g.fillStyle=P.dk;rr(g,x+10,y+22,40,22,3);g.fill();g.fillStyle=P.fr;rr(g,x+10,y+21,40,19,3);g.fill();g.fillStyle=P.hi;g.fillRect(x+12,y+21,36,1.2);
  g.fillStyle=P.dk;rr(g,x+12,y+26,12,11,2.5);g.fill();drawGear(g,x+18,y+31.5,4.2,7,time*(1.5+L*.9),P.hi,P.dk);
  g.save();g.translate(x+36,y+18);g.scale(.7+.08*fx,.7-.08*fx);var gr=g.createLinearGradient(-20,0,20,0);gr.addColorStop(0,P.dk);gr.addColorStop(.35,P.hi);gr.addColorStop(1,P.fr);g.fillStyle=gr;g.beginPath();g.moveTo(-20,-11);g.lineTo(20,-11);g.lineTo(9,9);g.lineTo(-9,9);g.closePath();g.fill();
  g.fillStyle='#2f2a26';g.beginPath();g.ellipse(0,-11,18,3.6,0,0,7);g.fill();g.restore();
  g.fillStyle=P.dk;rr(g,x+24,y+38,12,10,2);g.fill();
  g.font='800 6.5px sans-serif';g.textAlign='center';g.textBaseline='middle';var lab='⬇ '+(sid==='f1'?'제재소':'훈제소'),tw=g.measureText(lab).width+8;g.fillStyle='rgba(34,53,43,.82)';rr(g,x+30-tw/2,y+2,tw,10,5);g.fill();g.fillStyle='#fff';g.fillText(lab,x+30,y+7.2);}
function convRate(L){return 0.6*(1+0.6*(L-1));}
function convBatch(L){return [1,1,2,2,3,3,4,5][Math.max(1,Math.min(8,L))-1];}
function convSpeed(L){return 110*(1+0.12*L)*(1+0.2*S.trunk);}
var PROC_OF={f1:'mill',p1:'smoke',m1:'smelt',el:'elec'},SITE_OF={mill:'f1',smoke:'p1',smelt:'m1',elec:'el'};
var CVLINE={f1:'wood',p1:'fish',m1:'iron',el:'iron'};function lineBeltLv(line){return Math.max(1,(S.cvLv&&S.cvLv[line])||1);}
function cvLv(sid){return (S.cv[sid]||(S.pcv&&S.pcv[PROC_OF[sid]]))?lineBeltLv(CVLINE[sid]||sid):0;}
var BPATH={sale_f1:[[150,216],[270,216],[270,136]],sale_p1:[[570,182],[570,136]],proc_f1:[[150,216],[270,216],[270,346],[270,416]],proc_p1:[[570,346],[570,432]],proc_m1:[[930,178],[930,245]],proc_el:[[930,381],[930,440]]};
function beltOn(k){var sid=k.slice(-2);return k.indexOf('sale')===0?!!S.cv[sid]:!!(S.pcv&&S.pcv[PROC_OF[sid]]&&S[PROC_OF[sid]]);}
function ptsOf(k){return BPATH[k].map(function(p){return {x:p[0],y:p[1]};});}
function procCap(b){return 20+10*(S[b]||0)+15*((S.pst&&S.pst[b])||0);}
var CV_MAX=8;
function cvCost(sid){var base=SITE[sid].kind==='forest'?45:55;return Math.round(base*stageCostMult(sid==='m1'?3:(sid==='p1'?2:1)));}
function beltPts(sid,dest){var st=SITE[sid],pp=pilePos(sid),fy=feedY(sid),line=st.line,d=dropPt(line),lx=LANE[line],a0={x:pp.x,y:fy};
  if(dest==='wh')return [a0,{x:lx,y:fy},{x:lx,y:WHY[line]},{x:WH.x0,y:WHY[line]}];
  return [a0,{x:lx,y:fy},{x:lx,y:d.y},{x:d.x+6,y:d.y}];}
var convN={},SPLIT={},FEEDFX=[];
/* v87 (staff 1, t116): which way the loader's diverter sends the NEXT batch - same rule as updateConveyors (both open -> alternate) */
function splitNext(k){var st=SITE[k],line=st.line,b=PROC_OF[k],inS=0,inP=0;belt.forEach(function(x){if(x.line!==line)return;if(x.dest==='proc')inP+=x.n;else inS+=x.n;});
  var so=beltOn('sale_'+k)&&lineStock(line)+inS<stallCap(line),po=beltOn('proc_'+k)&&(S.pin[line]||0)+inP<procCap(b);if(so&&po)return ((convN[k]||0)+1)%2?'stall':'proc';return so?'stall':(po?'proc':null);}
function updateConveyors(dt){
  SITES.forEach(function(st){
    var k=st.id,L=cvLv(k);if(!L||!owned(k))return;
    convT[k]=(convT[k]||0)-dt;if(convT[k]>0)return;convT[k]=1/(convRate(L)*(k==='m1'?2:1)); /* v62: the mine belt runs twice as often (ore piled up waiting for it) */
    var line=st.line,b=PROC_OF[k],inS=0,inP=0;belt.forEach(function(x){if(x.line!==line)return;if(x.dest==='proc')inP+=x.n;else inS+=x.n;});
    var saleOk=beltOn('sale_'+k)&&lineStock(line)+inS<stallCap(line),procOk=beltOn('proc_'+k)&&(S.pin[line]||0)+inP<procCap(b);
    if(!saleOk&&!procOk)return;
    convN[k]=(convN[k]||0)+1;var dest=saleOk&&procOk?(convN[k]%2?'stall':'proc'):(saleOk?'stall':'proc');
    var p=S.piles[k];if(!p)return;var id=null,bn=0,bs=1e9;for(var q in p){if(!(p[q]>0))continue;var sq=dest==='stall'?ss(line,q):0;if(sq<bs||(sq===bs&&p[q]>bn)){bs=sq;bn=p[q];id=q;}}if(!id)return;
    var n=Math.min(convBatch(L)*(k==='m1'?2:1),bn);p[id]-=n;loadFx[k]=1;SPLIT[k]={dest:dest,t:0};if(dest==='proc'&&k!=='m1')FEEDFX.push({sid:k,id:id,n:n,t:0});
    var pts=ptsOf((dest==='proc'?'proc_':'sale_')+k);if(dest==='proc')loadFx['x'+k]=1;
    belt.push({dest:dest,line:line,id:id,n:n,pts:pts,seg:0,t:0,x:pts[0].x,y:pts[0].y,sp:convSpeed(L),seed:Math.random()*6,hop:0});
  });
  if(beltOn('proc_el')&&S.smelt){var Le=lineBeltLv('iron');convT.el=(convT.el||0)-dt;if(convT.el<=0){/* v62 (director 2026-10-04: smelter -> factory was too slow): 3x as often, double batches, every needed material on each run (was one kind at a time), 1.6x belt speed, factory holds up to 30 of each */
    convT.el=1/(convRate(Le)*3);
    var fl={};belt.forEach(function(x){if(x.dest==='mat')fl[x.id]=(fl[x.id]||0)+x.n;});
    var mc=PROC.smelt.goods.filter(function(id){return whN(id)>0&&(S.mat[id]||0)+(fl[id]||0)<30;});
    mc.forEach(function(mid,mi){var mn=Math.min(convBatch(Le)*2,whN(mid));addWh(mid,-mn);var mp=ptsOf('proc_el');belt.push({dest:'mat',line:'elec',id:mid,n:mn,pts:mp,seg:0,t:0,x:mp[0].x,y:mp[0].y,sp:convSpeed(Le)*1.6,seed:Math.random()*6,hop:0});});}}
  for(var i=belt.length-1;i>=0;i--){
    var bb=belt[i],a=bb.pts[bb.seg],e=bb.pts[bb.seg+1];
    var len=Math.hypot(e.x-a.x,e.y-a.y)||1;
    bb.t+=bb.sp*dt/len;bb.hop=Math.max(0,bb.hop-dt*4);
    if(bb.t>=1){bb.seg++;bb.t=0;bb.hop=1;
      if(bb.seg>=bb.pts.length-1){var end=bb.pts[bb.pts.length-1];
        if(bb.dest==='mat'){S.mat[bb.id]=(S.mat[bb.id]||0)+bb.n;hopW.elec=1;burst(end.x,end.y-4,'#bfe8ff',5,true);}
        else if(bb.dest==='proc'){S.pin[bb.line]=(S.pin[bb.line]||0)+bb.n;hopW[bb.line]=1;burst(end.x,end.y-4,'#ffe27a',5,true);}
        else{addSs(bb.line,bb.id,bb.n);hopP[bb.line]=1;burst(end.x+2,end.y-4,'#ffe27a',5,true);}
        belt.splice(i,1);continue;}
      a=bb.pts[bb.seg];e=bb.pts[bb.seg+1];}
    bb.x=a.x+(e.x-a.x)*bb.t;bb.y=a.y+(e.y-a.y)*bb.t;
  }
  LINES.forEach(function(l){hopP[l]=Math.max(0,hopP[l]-dt*3);});['wood','fish','iron','elec'].forEach(function(l){hopW[l]=Math.max(0,(hopW[l]||0)-dt*3);});
  for(var lk in loadFx)loadFx[lk]=Math.max(0,loadFx[lk]-dt*4);
}

/* ---------- warehouse: bulk storage, workshop, truck dock ---------- */
var WH={x0:MK+22,x1:W-5,top:334,wall:350,door:MK+70};
var WHY={wood:398,fish:386};
function whDrop(){return {x:MK+30,y:326};}
function whN(id){return S.wh[id]||0;}
function whTotal(){var n=0;for(var k in S.wh)n+=S.wh[k];return n;}
function whUnlocked(){return S.mill>0||S.smoke>0||S.smelt>0;}
function palKey(){return whUnlocked()+':'+(S.mill>0)+(S.smoke>0)+(S.smelt>0)+(S.elec>0);}
var PROC={mill:{line:'wood',goods:['chair','table','sofa'],plot:'sawmill'},smoke:{line:'fish',goods:['can','smoked','gift'],plot:'smokehouse'},smelt:{line:'iron',goods:['ingot','glass','plastic'],plot:'smelter'},elec:{line:'elec',goods:['tv','pc','phone'],plot:'factory'}},procT={mill:0,smoke:0,smelt:0,elec:0},procN={mill:0,smoke:0,smelt:0,elec:0},procBusy={mill:0,smoke:0,smelt:0,elec:0},flushT=0;
var PROCS=['mill','smoke','smelt','elec'],TPROCS=['mill','smoke','elec'],LINEPROC={wood:'mill',fish:'smoke',iron:'smelt',elec:'elec'};
/* v63: a full smelter storage is never stuck - the material with the most stock is sold off a few at a time (it no longer waits forever when the factory can't keep up) */
var smeltSellT=0,SMELTNEED=null;function smeltSell(dt){smeltSellT-=dt;if(smeltSellT>0)return;smeltSellT=.6;var junk=PROC.smelt.goods.filter(function(id){return SMELTNEED&&!SMELTNEED[id]&&whN(id)>0;});var ids=(junk.length?junk:PROC.smelt.goods.filter(function(id){return whN(id)>0;})).sort(function(x,y){return whN(y)-whN(x);});if(!ids.length)return;var id=ids[0],n=Math.min(3,whN(id));addWh(id,-n);var pay=money50(n*ITEMS[id].price*priceMult());S.coins+=pay;var sp0=shedPos('smelt');addFloat(sp0.x,sp0.y-22,'📦 남는 자재 판매 +'+fmt(pay),'#ffe27a',true);}
function procYield(L){return L>=6?4:(L>=5?3:(L>=3?2:1));}
/* v60: a bigger storage shed also packs extra goods from the same batch - +1 at storage Lv3, +2 at Lv5 */
function shedYield(b){var L=(S.pst&&S.pst[b])||0;return L>=5?2:(L>=3?1:0);}
function matOk(g){for(var k in g.mat)if((S.mat[k]||0)<g.mat[k])return false;return true;}
function matN(){var n=0;for(var k in S.mat)n+=S.mat[k]||0;return n;}
function plotOf(b){return PLOTS.filter(function(p){return p.id===PROC[b].plot;})[0];}
var procCur={mill:null,smoke:null,smelt:null,elec:null},procPop={mill:0,smoke:0,smelt:0,elec:0},procFullT={mill:0,smoke:0,smelt:0,elec:0};
function storeN(b){var n=0;PROC[b].goods.forEach(function(id){n+=whN(id);});return n;}
function storeCap(b){var L=(S.pst&&S.pst[b])||0;return L?30+26*(L-1):10;}
/* v60 (director 2026-10-04): storage upgrades matter more - processing +25%/Lv (was +10%), trucks pay +30%/Lv (was +15%), come more often and load more */
function shedBoost(b){return 1+.25*((S.pst&&S.pst[b])||0);}
function machPos(b){var p=plotOf(b),m=machOf(p);return {x:p.x+(p.shedLeft?84:42),y:p.y+108};}
function shedPos(b){var p=plotOf(b);return {x:shedX(p)+18,y:p.y+116};}
function dockX(b){return shedX(plotOf(b))+19;}
function updateProcessing(dt){
  updateLegend(dt);
  PROCS.forEach(function(b){var L=S[b]||0;procBusy[b]=Math.max(0,procBusy[b]-dt);procPop[b]=Math.max(0,procPop[b]-dt*2.5);procFullT[b]-=dt;if(!L)return;var P=PROC[b],line=P.line;
    var av=P.goods.filter(function(id){return GOOD[id].lv<=L;}),gid=av[procN[b]%av.length];
    /* v63 (bug: smelter storage filled up and stopped): make only what the factory's unlocked products use, in proportion to the recipes */
    if(b==='smelt'){var need={ingot:0,glass:0,plastic:0};GOODS.forEach(function(g2){if(g2.line==='elec'&&g2.lv<=Math.max(1,S.elec||0))for(var mk2 in g2.mat)need[mk2]+=g2.mat[mk2];});
      SMELTNEED=need;var cand=av.filter(function(id){return need[id]>0;});if(!cand.length)cand=av;gid=cand.slice().sort(function(x,y){return (whN(x)+(S.mat[x]||0))/need[x]-(whN(y)+(S.mat[y]||0))/need[y];})[0];}
    var ok=b==='elec'?av.filter(function(id){return matOk(GOOD[id]);}):null;if(ok&&ok.length)gid=ok[procN[b]%ok.length];
    var gd=GOOD[gid],need=gd.n,t=gd.time/shedBoost(b)/(1+.45*(L-1))/(L>=6?(1.6+.6*(L-6))*(b==='smelt'?1.45:1):1);procCur[b]={id:gid,t:t};
    if(ok?!ok.length:(S.pin[line]||0)<need){procT[b]=0;return;}
    if(b==='smelt'&&(storeN(b)>=storeCap(b)||PROC.smelt.goods.some(function(id){return SMELTNEED&&!SMELTNEED[id]&&whN(id)>0;}))){smeltSell(dt);}
    if(storeN(b)>=storeCap(b)){if(procFullT[b]<=0){procFullT[b]=6;var sp0=shedPos(b);addFloat(sp0.x,sp0.y-30,b==='smelt'?(S.elec?'자재 창고 가득! 남는 자재는 팔아요':'전자 공장을 지으면 자재를 써요 · 남는 자재는 팔아요'):(S.pst[b]?'창고가 가득! 트럭을 기다려요':'창고를 지으면 더 쌓여요'),'#ffe2a8');}return;}
    procBusy[b]=.4;procT[b]+=dt;if(procT[b]<t)return;procT[b]=0;if(ok){for(var mk in gd.mat)S.mat[mk]-=gd.mat[mk];}else S.pin[line]-=need;procN[b]++;procPop[b]=1;
    /* v56 (director 2026-10-03): a higher-level workshop turns the same batch into more goods (Lv1 x1, Lv3 x2, Lv5 x3, Lv6+ x4), so its storage fills faster and storage upgrades pay off */
    var yieldN=b==='elec'?1:Math.max(1,Math.min(procYield(L)+shedYield(b),storeCap(b)-storeN(b)));
    var m=machPos(b),sh=shedPos(b);burst(m.x,m.y-4,'#ffe27a',8,true);addWh(gid,yieldN);fly(gid,m.x,m.y-4,sh.x,sh.y-10,.7);if(yieldN>1)addFloat(m.x,m.y-20,'×'+yieldN,'#ffe27a',true);sfx('pickup',.15);});
}
function whCap(){return S.whLv?60+40*(S.whLv-1)+(S.wh2?60+40*(S.wh2-1):0):0;}
function addWh(id,n){S.wh[id]=whN(id)+n;}
function recipeOk(g){return (S[LINEPROC[g.line]]||0)>=g.lv;}
var CR={wood:{active:null,t:0},fish:{active:null,t:0}},craftPop={wood:0,fish:0},hopW={wood:0,fish:0,iron:0,elec:0};
function reservedWh(){var m={};trucks.forEach(function(t){if(t.state==='out')return;t.order.forEach(function(o){m[o.id]=(m[o.id]||0)+(o.qty-o.got);});});return m;}
function updateCrafting(dt){
  LINES.forEach(function(l){craftPop[l]=Math.max(0,craftPop[l]-dt*2.5);hopW[l]=Math.max(0,hopW[l]-dt*3);});
  if(!S.whLv)return;
  LINES.forEach(function(line){
    var cr=CR[line];
    if(cr.active){cr.t+=dt;if(cr.t>=cr.active.time){addWh(cr.active.id,1);cr.active=null;craftPop[line]=1;}return;}
    var recs=GOODS.filter(function(g){return g.line===line&&recipeOk(g)&&whN(g.id)<10;}).sort(function(a,b){return whN(a.id)-whN(b.id);});
    if(!recs.length)return;
    var resv=reservedWh();
    var raws=ORDER.filter(function(id){return ITEMS[id].cat===line;}).sort(function(a,b){return ITEMS[a].sp.val-ITEMS[b].sp.val;});
    for(var i=0;i<recs.length;i++){
      var rec=recs[i],avail=0;
      raws.forEach(function(id){avail+=Math.max(0,whN(id)-(resv[id]||0));});
      if(avail<rec.n)continue;
      var need=rec.n;
      raws.forEach(function(id){var t=Math.min(need,Math.max(0,whN(id)-(resv[id]||0)));if(t>0){addWh(id,-t);need-=t;}});
      cr.active=rec;cr.t=0;return;
    }
  });
}
/* trucks: drive in on the road, load at the dock, pay in bulk */
var trucks=[],truckT={mill:6,smoke:9,smelt:12,elec:8},TRUCK_COL=['#3f7fb8','#4f9a6a','#e0a03a','#8a5ab8','#5a8fb8'],LANE_UP=H+23,LANE_DN=H+44;
function truckCands(b){
  var c=[];
  PROC[b].goods.forEach(function(id){var g=GOOD[id];if(recipeOk(g)||whN(id)>0)c.push({id:id,w:1.6+whN(id)*.3});});
  return c;
}
function pickW(c){var sum=0;c.forEach(function(x){sum+=x.w;});var r=Math.random()*sum;for(var i=0;i<c.length;i++){r-=c[i].w;if(r<=0)return c.splice(i,1)[0].id;}return c.pop().id;}
function newTruck(b){
  var c=truckCands(b);if(!c.length)return null;
  var rush=Math.random()<.2,sl=(S.pst&&S.pst[b])||0;if(rush)rushCount++;
  var n=Math.min(c.length,rush?1:(sl>=2&&Math.random()<.5?2:1)),order=[],tot=0;
  var room=10+12*sl,have=storeN(b);for(var i=0;i<n;i++){var id=pickW(c),qty=Math.max(3,Math.min(Math.ceil(room/n),whN(id)+Math.floor(Math.random()*3)));if(rush)qty=Math.max(2,Math.round(qty*.6));order.push({id:id,qty:qty,got:0});tot+=qty;}
  var pat=(55+tot*3)*(rush?.6:1);
  return {b:b,x:W+70,y:LANE_DN,state:'in',dock:0,rush:rush,order:order,pat:pat,max:pat,col:rush?'#e2463c':TRUCK_COL[Math.floor(Math.random()*TRUCK_COL.length)],wheel:0,loadT:0,bump:0,vx:0,puff:0};
}
/* v68: trucks also pay more for a higher workshop level (+20%/Lv) and double at the top level (Lv8) */
function procPay(b){var L=S[b]||0;return (1+.2*Math.max(0,L-1))*(L>=8?2:1);}
function truckPrice(id){var it=ITEMS[id],b=LINEPROC[it.line];return money50((it.price||5)*ECON*procPay(b)*priceMult()*(1.1+.3*((S.pst&&S.pst[b])||0))*hotMult(id));}
/* v68: at the top workshop level trucks keep lining up (next one is always on its way) */
function truckInterval(b){var k=storeN(b)/Math.max(1,storeCap(b)),L=S[b]||0;return 6/(1+.8*((S.pst&&S.pst[b])||0))*(k>=.5?.35:(k>=.25?.7:1))*(L>=8?.25:(L>=6?.6:1));}
var rushCount=0;
function updateHot(dt){}
function truckDone(t){return t.order.every(function(o){return o.got>=o.qty;});}
function truckLeave(t){t.state='undock';}
function updateTrucks(dt){
  TPROCS.forEach(function(b){if(!S[b]||storeN(b)<Math.min((S[b]||0)>=8?1:2,storeCap(b)))return;if(trucks.filter(function(t){return t.b===b&&t.state!=='out';}).length>=2)return;
    truckT[b]-=dt;if(truckT[b]<=0){truckT[b]=truckInterval(b)*(.5+Math.random()*.3);var nt=newTruck(b);if(nt)trucks.push(nt);}});
  for(var i=trucks.length-1;i>=0;i--){
    var t=trucks[i],v=0,dx=dockX(t.b)+(trucks.some(function(o){return o!==t&&o.b===t.b&&(o.state==='dock'||o.state==='load');})?46:0);
    t.bump=Math.max(0,t.bump-dt*3);
    if(t.state==='in'){var d=t.x-dx;
      if(d>.5){v=Math.max(20,Math.min(160,d*2));t.x-=Math.min(d,v*dt);}
      else{t.x=dx;t.state='dock';}
    }else if(t.state==='dock'){
      t.y+=(LANE_UP-t.y)*Math.min(1,dt*5);v=4;
      if(Math.abs(t.y-LANE_UP)<.6){t.y=LANE_UP;t.state='load';t.bump=1;sfx('horn',.5);}
    }else if(t.state==='load'){
      t.pat-=dt;t.loadT-=dt;
      var ld=true;if(t.loadT<=0){t.loadT=.08;ld=false;
        for(var k=0;k<t.order.length;k++){var o=t.order[k];if(o.got<o.qty&&whN(o.id)>0){ld=true;addWh(o.id,-1);o.got++;t.bump=.45;var sh=shedPos(t.b);fly(o.id,sh.x,sh.y-6,t.x+10,t.y-10,.35);break;}}}
      if(truckDone(t)||(!ld&&t.order.some(function(o){return o.got>0;}))){
        var pay=0;t.order.forEach(function(o){pay+=o.got*truckPrice(o.id);});pay=money50(pay*(t.rush?2:1));
        var tk='t_'+t.b,tcp=tcashPos(t.b);S.cash[tk]=(S.cash[tk]||0)+pay;S.h3=1;stat('truck',1);sfx('cash');addFloat(tcp.x,tcp.y-24,(t.rush?'⚡+':'🚚+')+pay,'#ffd35a',true);burst(tcp.x,tcp.y,'#ffe27a',t.rush?20:12,true);
        for(var ci=0;ci<Math.min(8,3+Math.floor(pay/40));ci++)fly('coin',t.x+(Math.random()-.5)*20,t.y-12,tcp.x+(Math.random()-.5)*16,tcp.y-4,.5+ci*.05);if(t.rush)flash=.3;truckLeave(t);
      }else if(t.pat<=0){
        var got=0,pay2=0;t.order.forEach(function(o){got+=o.got;pay2+=o.got*truckPrice(o.id)*.85;});
        if(got>0){pay2=money50(pay2);var tk2='t_'+t.b,tcp2=tcashPos(t.b);S.cash[tk2]=(S.cash[tk2]||0)+pay2;addFloat(tcp2.x,tcp2.y-24,'🚚+'+pay2,'#ffe2a8',true);}
        else{S.lost++;addFloat(dx,H-10,'빈 트럭으로 떠나요','#ffb3b3');}
        truckLeave(t);
      }
    }else if(t.state==='undock'){
      t.y+=(LANE_DN-t.y)*Math.min(1,dt*5);t.x-=14*dt;v=14;
      if(Math.abs(t.y-LANE_DN)<.6){t.y=LANE_DN;t.state='out';}
    }else{t.vx=Math.min(190,t.vx+dt*170);v=t.vx;t.x-=v*dt;if(t.x<-90){trucks.splice(i,1);continue;}}
    t.wheel+=v*dt/5.5;
    if(v>5){t.puff-=dt;if(t.puff<=0){t.puff=.18;parts.push({x:t.x-9.4,y:t.y-23,vx:18+Math.random()*10,vy:-14,g:-6,life:.8,max:.8,col:'rgba(200,200,200,.8)',r:2.2});}}
  }
}

/* ---------- customers (market side only) ---------- */
var customers=[],spawnT=3,lineSpawnT={wood:2,fish:3};
var CUST_COL=['#3ea9eb','#aa72e5','#f2963b','#4bbf76','#ed668d','#edc331'];
var HAIR=['#3a2c22','#7a4d2b','#c9a45a','#2b2b35','#a0522d'];
function serv(line){return Math.min(4,1+Math.floor((S.shop[line]-1)/2))+shopClerks(line);}
/* v60 (director 2026-10-04): a bigger shop keeps a longer queue - Lv1 4 people ... Lv7+ 10 */
function qmax(line){return Math.min(10,3+S.shop[line]);}
function shopSide(line){return line==='wood'?-1:1;}
function slotPos(line,i){var s=STALL[line],side=shopSide(line);return {x:s.x+side*(40+Math.floor(i/5)*22),y:s.y+28+(i%5)*19};}
function entryX(line){return line==='wood'?-14:W+14;}
function lineOf(line){var l=[];customers.forEach(function(c){if(c.state!=='out'&&c.seller===line)l.push(c);});return l;}
function spawnInterval(){
  var tot=lineStock('wood')+lineStock('fish');
  var base=Math.max(1.6,5.2-siteScore()*.25)/(1+0.1*(S.shop.wood+S.shop.fish-2));
  return Math.max(.25,base*.18/(1+tot/40));
}
function chooseWant(only){
  var cands=[],sum=0;
  function add(id,w){var l=ITEMS[id].line;if(only&&l!==only)return;if(!lineOpen(l)||lineOf(l).length>=qmax(l))return;if(id===HOT.id)w+=2;cands.push({id:id,w:w});sum+=w;}
  var hasW=lineStock('wood')>0,hasF=lineStock('fish')>0;
  TREES.forEach(function(s,i){var n=ss('wood',s.id);if(n>0||(!hasW&&speciesAvail('forest',i)))add(s.id,n>0?1+n*.45:1);});
  FISH.forEach(function(s,i){var n=ss('fish',s.id);if(n>0||(!hasF&&speciesAvail('pond',i)))add(s.id,n>0?1+n*.45:1);});
  BEAR_ITEMS.forEach(function(b){if(ss(b.line,b.id)>0)add(b.id,2+ss(b.line,b.id)*.6);});
  if(!cands.length)return null;
  var r=Math.random()*sum;
  for(var i=0;i<cands.length;i++){r-=cands[i].w;if(r<=0)return cands[i].id;}
  return cands[cands.length-1].id;
}
function newCustomer(only){
  var want=chooseWant(only);if(!want)return null;
  var line=ITEMS[want].line,goods=ITEMS[want].cat==='goods',s=ss(line,want);
  var qty=Math.min(3,1+Math.floor(Math.random()*2)+(s>=8&&Math.random()<.4?1:0));if(ITEMS[want].cat==='bear')qty=Math.max(1,Math.min(qty,s));
  var regular=Math.random()<shopRegularChance(line);if(regular)qty++;var pat=(40+qty*1.3+6*S.shop[line])*(regular?1.6:1);
  var sp=slotPos(line,lineOf(line).length);
  var ex=STALL[line].x+shopSide(line)*84;
  return {x:ex,ex:ex,y:-18,want:want,qty:qty,regular:regular,seller:line,pat:pat,max:pat,state:'line',slot:0,st:0,got:0,
    col:CUST_COL[Math.floor(Math.random()*CUST_COL.length)],pants:['#4a4a5a','#3f4f7a','#5b4a3a','#5d6b3d'][Math.floor(Math.random()*4)],hair:HAIR[Math.floor(Math.random()*HAIR.length)],bob:0,dir:-1,mv:false,mood:''};
}
function moveC(c,x,y,dt,m){
  var dx=x-c.x,dy=y-c.y,d=Math.hypot(dx,dy),s=62*m*dt;
  if(d<=s){c.x=x;c.y=y;c.mv=false;return true;}
  c.x+=dx/d*s;c.y+=dy/d*s;c.mv=true;c.bob+=dt*12;if(Math.abs(dx)>.5)c.dir=dx>0?1:-1;return false;
}
function updateCustomers(dt){
  spawnT-=dt;
  if(spawnT<=0){spawnT=spawnInterval()*(.7+Math.random()*.6);var nc=newCustomer();if(nc)customers.push(nc);}
  /* v60: each shop also tops up its own queue - the higher the shop level, the faster new customers walk in, so a levelled shop always has a line */
  LINES.forEach(function(l){if(!lineOpen(l))return;lineSpawnT[l]-=dt;if(lineSpawnT[l]>0)return;var lv=S.shop[l],n=lineOf(l).length,iv=2.4/(1+.3*(lv-1));
    lineSpawnT[l]=iv*(n<serv(l)+1?.45:1)*(.7+Math.random()*.6);if(n<qmax(l)){var c2=newCustomer(l);if(c2)customers.push(c2);}});
  LINES.forEach(function(l){lineOf(l).forEach(function(c,i){c.slot=i;});});
  for(var i=customers.length-1;i>=0;i--){
    var c=customers[i];
    var ex=c.ex!==undefined?c.ex:entryX(c.seller);
    if(c.state==='out'){if(Math.abs(c.x-ex)>1)moveC(c,ex,c.y,dt,1.4);else moveC(c,ex,-40,dt,1.4);if(c.y<-30)customers.splice(i,1);continue;}
    c.pat-=dt;
    var sp=slotPos(c.seller,c.slot),arr;if(c.y<sp.y-1)arr=moveC(c,ex,sp.y,dt,1.3)&&false;else arr=moveC(c,sp.x,sp.y,dt,1);
    if(c.pat<=0&&c.state!=='serve'){
      if(c.got>0){addSs(c.seller,c.want,c.got);c.got=0;}
      c.state='out';c.mood='angry';S.lost++;continue;
    }
    if(c.state==='line'&&c.got===0&&ss(c.seller,c.want)<=0){var alt=null,an=0;ORDER.forEach(function(id){var it=ITEMS[id];if(it.line!==c.seller||it.cat==='goods')return;var n=ss(c.seller,id);if(n>an){an=n;alt=id;}});
      if(alt){c.want=alt;c.qty=Math.min(c.qty,Math.max(1,an));}}
    if(c.state==='line'&&c.got>0&&c.got<c.qty&&ss(c.seller,c.want)<=0){c.waitT=(c.waitT||0)+dt;if(c.waitT>1.2){c.qty=c.got;c.state='serve';c.st=.8*shopCheckoutTime(c.seller);}}else c.waitT=0;
    if(c.state==='line'&&c.slot<serv(c.seller)&&arr){
      var take=Math.min(c.qty-c.got,ss(c.seller,c.want));
      if(take>0){S.ss[c.seller][c.want]-=take;c.got+=take;}
      if(c.got>=c.qty){c.state='serve';c.st=shopCheckoutTime(c.seller);}
    }else if(c.state==='serve'){
      c.st-=dt;
      if(c.st<=0){
        var tip=c.pat/c.max>.5;
        var pay=customerPayment(c,tip);
        S.cash[c.seller]=(S.cash[c.seller]||0)+pay;S.h2=1;stat('serve',1);sfx('coin',.09);var cp0=cashPos(c.seller);
        addFloat(cp0.x,cp0.y-18,'💵+'+pay,'#c9f5c0',true);
        for(var cfi=0;cfi<Math.min(6,2+Math.ceil(pay/20));cfi++)fly('coin',c.x+(Math.random()-.5)*10,c.y-6,cp0.x+(Math.random()-.5)*12,cp0.y-4,.36+cfi*.05);
        checkPop(c.x,c.y-24);if(c.regular&&Math.random()<.15)addFloat(c.x,c.y-40,c.seller==='fish'?'호수 쪽 물소리가 다시 들려요':'밤에 숲 뿌리가 파랗게 빛났대요','#ffe6a0',true);
        c.state='out';c.mood='happy';
      }
    }
  }
}

/* ---------- arcade controls: joystick, stack on your back, stand-on pads ---------- */
var joy={on:false,ox:0,oy:0,dx:0,dy:0,id:null},FLY=[],zoneT=0,padMsgT=0;
/* v78: idle hint - if the player hasn't acted in a while (outside the tutorial), point the guide arrow at something useful */
var idleT=0;
function idleHint(){
  if(tutOn()||idleT<9)return null;
  var cand=null;PADLIST.forEach(function(p){if(cand||p.mini)return;if(!p.d.isMax()&&p.d.canBuy())cand=p;});
  if(cand)return {x:cand.x,y:cand.y};
  var pileSt=null;SITES.forEach(function(st){if(pileSt)return;if(owned(st.id)&&!cvLv(st.id)&&st.kind!=='mine'&&pn(st.id)>0)pileSt=st;});
  if(pileSt){var pp=pilePos(pileSt.id);return {x:pp.x,y:pp.y};}
  var cs=cashSpots().filter(function(o){return (S.cash[o.k]||0)>0;})[0];
  if(cs)return {x:cs.p.x,y:cs.p.y};
  return null;
}
function walkXY(x,y){
  if(x<4||y<WORLD_TOP+4||y>=H-4||x>fenceX()-7)return false;
  for(var i=0;i<PADLIST.length;i++){if(Math.hypot(x-PADLIST[i].x,y-PADLIST[i].y)<20)return true;}
  if(x>MX-4)return false;var t=tileAt(x,y);var lake=SITE.p1;if(x>lake.x+3&&x<lake.x+lake.w-3&&y>lake.y+3&&y<lake.y+lake.h-3)return false;return !!t&&tileOk(t.c,t.r);
}
function fly(id,x0,y0,x1,y1,dur){FLY.push({id:id,x0:x0,y0:y0,x1:x1,y1:y1,t:0,dur:dur||.32});}
function updateFly(dt){for(var i=FLY.length-1;i>=0;i--){FLY[i].t+=dt;if(FLY[i].t>=FLY[i].dur)FLY.splice(i,1);}}
function drawFly(){FLY.forEach(function(f){var k=f.t/f.dur,e=1-(1-k)*(1-k),x=f.x0+(f.x1-f.x0)*e,y=f.y0+(f.y1-f.y0)*e-Math.sin(k*Math.PI)*18;
  if(f.id==='bigcoin'){var sq=Math.abs(Math.cos(time*10+f.x0))*.6+.4;ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(255,230,120,.35)';ctx.beginPath();ctx.arc(0,0,9,0,7);ctx.fill();ctx.scale(sq,1);
    ctx.fillStyle='#b8801a';ctx.beginPath();ctx.arc(0,1.2,6.4,0,7);ctx.fill();ctx.fillStyle='#f0bb3f';ctx.beginPath();ctx.arc(0,0,6.4,0,7);ctx.fill();ctx.strokeStyle='#fff1a8';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,4.8,0,7);ctx.stroke();
    ctx.fillStyle='#8a5a10';ctx.font='900 7px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('₩',0,.4);ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(-2.2,-2.4,1.3,0,7);ctx.fill();ctx.restore();}
  else if(f.id==='coin'){ctx.fillStyle='#f0bb3f';ctx.beginPath();ctx.arc(x,y,3.2,0,7);ctx.fill();ctx.fillStyle='#fff3c0';ctx.beginPath();ctx.arc(x-1,y-1,1.1,0,7);ctx.fill();}
  else drawItem(ctx,f.id,x,y,.6);});}
/* the carried stack: ordered list of item ids, cheapest at the bottom */
function stackList(a){var l=[];ORDER.forEach(function(id){for(var i=0;i<(a.bag[id]||0);i++)l.push(id);});return l;}
function stackTop(a){var n=bagN(a);return {x:a.x+a.dir*9,y:a.y-7-n*3.2};}
function drawStack(a,by){
  var l=stackList(a);if(!l.length)return;
  var sway=a.mv?Math.sin(a.bob*.5):0,bx=a.x+a.dir*9;
  l.forEach(function(id,i){var it=ITEMS[id],x=bx+sway*i*.18,y=a.y-4+by-i*3.2;
    if(it.cat==='wood'){ctx.fillStyle=it.sp.log;rr(ctx,x-5.5,y-1.6,11,3.2,1.5);ctx.fill();ctx.fillStyle='rgba(255,236,190,.55)';ctx.beginPath();ctx.arc(x+4.6,y,1.2,0,7);ctx.fill();}
    else if(it.cat==='fish'){ctx.fillStyle='#c79a63';rr(ctx,x-5,y-1.6,10,3.2,1);ctx.fill();ctx.fillStyle=it.sp.col;ctx.fillRect(x-3.5,y-1.1,7,1.4);}
    else if(id==='meat'){ctx.fillStyle='#c9463d';rr(ctx,x-5,y-1.8,10,3.6,1.6);ctx.fill();ctx.fillStyle='#f3ead8';ctx.fillRect(x+3,y-.6,3,1.2);}
    else if(id==='hide'){ctx.fillStyle='#eef2f6';rr(ctx,x-6,y-1.6,12,3.2,1.2);ctx.fill();ctx.fillStyle='#c9d6e0';ctx.fillRect(x-6,y+.8,12,.8);}
    else{ctx.fillStyle='#b98b5e';rr(ctx,x-4.5,y-1.6,9,3.2,1);ctx.fill();}});
  if(bagN(a)>=cap()){var t=stackTop(a);ctx.font='800 7px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(226,86,106,.92)';rr(ctx,t.x-12,t.y-9+by,24,10,5);ctx.fill();ctx.fillStyle='#fff';ctx.fillText('가득',t.x,t.y-3.8+by);}
}
/* walk-over zones: storage decks hand you their pile, stall mats take your stack */
function allBelted(line){var l=SITES.filter(function(st){return owned(st.id)&&st.line===line;});return l.length>0&&l.every(function(st){return cvLv(st.id)>0;});}
var MATS=function(){return [{line:'wood',x:246,y:138},{line:'fish',x:504,y:138}].filter(function(o){return lineOpen(o.line)&&!allBelted(o.line);});};
var CFLY=[],FDT=.016;
function coinToHud(wx,wy){var p=toScreen(wx,wy);CFLY.push({x0:p.x,y0:p.y,cx:p.x+(Math.random()-.5)*70,cy:Math.max(10,p.y-50-Math.random()*50),t:0,dur:.5+Math.random()*.2,sp:Math.random()*6});}
function bumpHud(){var el=elCoins.parentElement;el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
function drawCoinFly(){var g=ctx;for(var i=CFLY.length-1;i>=0;i--){var f=CFLY[i];f.t+=FDT;var k=Math.min(1,f.t/f.dur),e=k*k,u=1-e,tx=24,ty=-10;
    var x=u*u*f.x0+2*u*e*f.cx+e*e*tx,y=u*u*f.y0+2*u*e*f.cy+e*e*ty,r=6.5-2*k;
    g.fillStyle='rgba(255,230,120,.35)';g.beginPath();g.arc(x,y,r+3,0,7);g.fill();
    g.save();g.translate(x,y);g.scale(Math.abs(Math.cos(time*9+f.sp))*.5+.5,1);g.fillStyle='#d99a20';g.beginPath();g.arc(0,.8,r,0,7);g.fill();g.fillStyle='#f0bb3f';g.beginPath();g.arc(0,0,r,0,7);g.fill();
    g.fillStyle='#fff3b0';g.beginPath();g.arc(-r*.35,-r*.35,r*.3,0,7);g.fill();g.restore();
    if(k>=1){CFLY.splice(i,1);bumpHud();sfx('coin',.04);}}}
function cashPos(line){var s=STALL[line];return {x:line==='wood'?s.x-40:s.x+52,y:172};}
function tcashPos(b){var p=plotOf(b);return {x:shedX(p)+19,y:p.y-16};}
function cashSpots(){var l=[{k:'wood',p:cashPos('wood'),r:40},{k:'fish',p:cashPos('fish'),r:40}];TPROCS.forEach(function(b){if(S[b])l.push({k:'t_'+b,p:tcashPos(b),r:34,b:b});});return l;}
var autoT=0;
function updateCash(dt){
  if(!S.cash)S.cash={wood:0,fish:0};var a=agents[0],sp=cashSpots();
  if(S.autocash){autoT-=dt;if(autoT<=0){autoT=[8,5,3][S.autocash-1];sp.forEach(function(o){var n=S.cash[o.k]||0;if(n<=0)return;var p=o.p;S.coins+=n;S.cash[o.k]=0;S.h4=1;
      for(var ci=0;ci<Math.min(10,2+Math.ceil(n/15));ci++)coinToHud(p.x+(Math.random()-.5)*14,p.y-4-Math.random()*6);addFloat(p.x,p.y-20,'💰+'+fmt(n),'#ffe27a',true);});}}
  sp.forEach(function(o){var n=S.cash[o.k]||0;if(n<=0||!tutAllow('cash'))return;var p=o.p;if(Math.hypot(a.x-p.x,a.y-p.y)>o.r)return;
    if(tutOn()){var np=TUTPAD[S.tut+1],need=np&&DEF[np]?Math.max(0,Math.ceil(DEF[np].cost())-Math.floor(S.coins)):0;S.cash[o.k]=0;S.coins+=need;S.h4=1;
      for(var ci=0;ci<Math.min(10,3+Math.ceil(need/8));ci++)coinToHud(p.x+(Math.random()-.5)*14,p.y-4-Math.random()*6);addFloat(a.x,a.y-34,'💰+'+fmt(need),'#ffe27a',true);sfx('coin');save();return;}
    a.cashT=(a.cashT||0)-dt;if(a.cashT>0)return;a.cashT=.05;
    var take=n<50?n:Math.max(50,Math.floor(n*.18/50)*50);if(take>n)take=n;S.cash[o.k]=n-take;S.coins+=take;S.h4=1;a.cashGot=(a.cashGot||0)+take;
    coinToHud(p.x+(Math.random()-.5)*10,p.y-4);if(Math.random()<.5)coinToHud(p.x+(Math.random()-.5)*10,p.y-6);
    if(S.cash[o.k]<=0){S.cash[o.k]=0;addFloat(a.x,a.y-34,'💰+'+fmt(a.cashGot),'#ffe27a',true);a.cashGot=0;}});
}
function drawCash(){
  if(!S.cash)return;var g=ctx;
  cashSpots().forEach(function(o){var n=S.cash[o.k]||0;if(n<=0)return;var p=o.p,bricks=Math.min(48,Math.ceil(n/5));
    g.fillStyle='rgba(0,0,0,.16)';g.beginPath();g.ellipse(p.x+1,p.y+4,19,5,0,0,7);g.fill();
    for(var i=0;i<bricks;i++){var layer=Math.floor(i/8),k=i%8,row=Math.floor(k/4),col=k%4,bx=p.x-14+col*10+row*4,by=p.y-row*5-layer*3.4;
      g.fillStyle='#a8720f';g.beginPath();g.ellipse(bx,by+.8,5.6,3.6,0,0,7);g.fill();
      g.fillStyle='#f0bb3f';g.beginPath();g.ellipse(bx,by,5.6,3.6,0,0,7);g.fill();
      g.strokeStyle='#fff3c0';g.lineWidth=.9;g.beginPath();g.ellipse(bx,by,3.9,2.5,0,0,7);g.stroke();
      g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(bx-1.5,by-1.1,1.6,.9,0,0,7);g.fill();
      g.fillStyle='rgba(120,70,10,.55)';g.font='800 4.5px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('₩',bx,by+.3);}
    var top=p.y-4-Math.floor((bricks-1)/8)*3.4-4;g.fillStyle='rgba(255,255,255,'+(.5+.4*Math.sin(time*5))+')';g.beginPath();g.moveTo(p.x-2.6,top);g.lineTo(p.x,top-3.8);g.lineTo(p.x+2.6,top);g.lineTo(p.x,top+3.8);g.closePath();g.fill();
    g.font='900 9.5px sans-serif';g.textAlign='center';g.textBaseline='middle';var lab=(o.b?'🚚 ':'')+'₩'+moneyShort(n),tw=Math.min(70,g.measureText(lab).width+10);g.fillStyle='rgba(168,114,15,.95)';rr(g,p.x-tw/2,p.y+5,tw,13,6.5);g.fill();g.strokeStyle='#fff3c0';g.lineWidth=1;rr(g,p.x-tw/2+1,p.y+6,tw-2,11,5.5);g.stroke();g.fillStyle='#fff';g.fillText(lab,p.x,p.y+11.6,60);
    if(Math.random()<.04)parts.push({x:p.x+(Math.random()-.5)*20,y:top+Math.random()*8,vx:0,vy:-8,g:0,life:.6,max:.6,col:'#fff1a8',r:1.2,spark:true});});
}
function zoneActions(a,dt){
  zoneT-=dt;if(zoneT>0)return;zoneT=.04;
  var st=null;SITES.forEach(function(s2){var t=s2.store;if(owned(s2.id)&&a.x>=t.c*T&&a.x<t.c*T+T&&a.y>=t.r*T&&a.y<t.r*T+T)st=s2;});
  if(st&&cvLv(st.id)&&bagN(a)>0&&pn(st.id)<pcap()){
    var bid=null;for(var k2 in a.bag){if(ITEMS[k2].line===st.line&&ITEMS[k2].sp){bid=k2;break;}}
    if(bid){a.bag[bid]--;if(a.bag[bid]<=0)delete a.bag[bid];var pl2=pileOf(st.id);pl2[bid]=(pl2[bid]||0)+1;var pp2=pilePos(st.id),tp2=stackTop(a);fly(bid,tp2.x,tp2.y,pp2.x,pp2.y-6,.25);sfx('pickup',.12);return;}}
  if(st&&st.kind!=='mine'&&!cvLv(st.id)&&pn(st.id)>0&&bagN(a)<cap()&&!tutOn()){
    var got={};takeFromPileTo(got,st.id,1);var id=Object.keys(got)[0];
    if(id){a.bag[id]=(a.bag[id]||0)+1;var pp=pilePos(st.id),tp=stackTop(a);fly(id,pp.x,pp.y-6,tp.x,tp.y,.25);sfx('pickup',.12);}
    return;}
  MATS().forEach(function(m){
    if(Math.hypot(a.x-m.x,a.y-m.y)>24||bagN(a)<=0||!tutAllow('deliver'))return;
    var ids=stackList(a).reverse(),id=null;
    for(var i=0;i<ids.length;i++){var it=ITEMS[ids[i]];if(m.line==='wh'||it.line===m.line){id=ids[i];break;}}
    if(!id)return;
    if(m.line==='wh'){if(whTotal()>=whCap())return;addWh(id,1);}
    else{if(lineStock(m.line)>=stallCap(m.line)){if(padMsgT<=0){addFloat(m.x,m.y-20,'판매대가 가득','#ffb3b3');padMsgT=2;}return;}addSs(m.line,id,1);}
    a.bag[id]--;if(a.bag[id]<=0)delete a.bag[id];
    var tp=stackTop(a),tx=m.line==='wh'?WH.x0+30:STALL[m.line].x-10,ty=m.line==='wh'?WH.wall+10:STALL[m.line].y-4;
    fly(id,tp.x,tp.y,tx,ty,.3);sfx('pickup',.1);
  });
}
function takeFromPileTo(bag,sid,max){var p=S.piles[sid];if(!p)return 0;var ids=Object.keys(p).filter(function(k){return p[k]>0;}).sort(function(x,y){return ITEMS[y].sp.val-ITEMS[x].sp.val;}),got=0;
  ids.forEach(function(id){var t=Math.min(p[id],max-got);if(t>0){p[id]-=t;got+=t;bag[id]=(bag[id]||0)+t;}});return got;}
function unstick(a){for(var r=4;r<200;r+=4)for(var k=0;k<16;k++){var an=k/16*6.283,px=a.x+Math.cos(an)*r,py=a.y+Math.sin(an)*r;if(walkXY(px,py)){a.x=px;a.y=py;release(a);a.path=[];return true;}}a.x=HOME.x;a.y=HOME.y;return false;}
function stepPlayerFree(a,dt){
  a.lockT-=dt;padMsgT-=dt;
  zoneActions(a,dt);
  /* v83: keep re-targeting a tapped bear's live position instead of a one-time stale point */
  if(a.chaseBear){var cb=a.chaseBear;
    if(cb.state==='dead'||cb.state==='out'||BEARS.indexOf(cb)<0)a.chaseBear=null;
    else if(!joy.on){var cd=Math.hypot(a.x-cb.x,a.y-cb.y);
      var cwk=wkind(),creach=heroReach(cb)-4;
      if(cd<creach)a.chaseBear=null;
      else{a.chaseT=(a.chaseT||0)-dt;if(a.chaseT<=0){a.chaseT=.2;var cux=(a.x-cb.x)/(cd||1),cuy=(a.y-cb.y)/(cd||1),cst=Math.min(creach-4,Math.max(bearR(cb)+12,cwk==='gun'?110:0));a.tap={x:cb.x+cux*cst,y:cb.y+cuy*cst};a.tapStuck=0;
        if(!lineClear(a.x,a.y,cb.x,cb.y)){var ctt=tileAt(cb.x,cb.y);if(ctt)goTile(a,ctt);}else a.path=[];}}}}
  if(!joy.on&&a.tap&&a.path.length){followPath(a,dt);a.moving=true;a.mv=true;return;}
  if(!joy.on&&a.tap){var tdx=a.tap.x-a.x,tdy=a.tap.y-a.y,td=Math.hypot(tdx,tdy);
    if(td<2.5){a.tap=null;a.moving=false;}
    else{release(a);var tsp=Math.min(td,speedOf(a)*1.2*dt),tvx=tdx/td*tsp,tvy=tdy/td*tsp,ok=false;
      if(walkXY(a.x+tvx,a.y)){a.x+=tvx;ok=true;}if(walkXY(a.x,a.y+tvy)){a.y+=tvy;ok=true;}
      if(!ok||(Math.abs(tvx)<.01&&Math.abs(tvy)<.01)){a.tapStuck+=dt;if(a.tapStuck>.35)a.tap=null;}else a.tapStuck=0;
      if(Math.abs(tvx)>.05)a.dir=tvx>0?1:-1;a.mv=true;a.bob+=dt*13;a.moving=true;return;}}
  if(joy.on&&Math.hypot(joy.dx,joy.dy)>2*screenUnit){
    release(a);
    var d=Math.hypot(joy.dx,joy.dy),k=Math.min(1,Math.sqrt(d/(SENS_D[S.sens==null?1:S.sens]*screenUnit))),sp=speedOf(a)*1.2*k*dt,vx=joy.dx/d*sp,vy=joy.dy/d*sp;
    var mvd=false;if(walkXY(a.x+vx,a.y)){a.x+=vx;mvd=true;}if(walkXY(a.x,a.y+vy)){a.y+=vy;mvd=true;}
    /* v57: if the hero stands on a spot it may not walk on (e.g. resumed onto a pad edge or a closed tile) it could never move again - hop to the nearest free spot */
    if(!mvd&&!walkXY(a.x,a.y)){a.stuckT=(a.stuckT||0)+dt;if(a.stuckT>.25){a.stuckT=0;unstick(a);}}else a.stuckT=0;
    if(Math.abs(vx)>.05)a.dir=vx>0?1:-1;a.mv=true;a.bob+=dt*13*Math.max(.5,k);a.moving=true;return;}
  a.moving=false;
  if(tutNoGather()){release(a);return;}
  /* standing still: chop / fish the nearest thing within reach */
  var mt=tileOf(a),mst=mt?siteOfTile(mt.c,mt.r):null,mto=mt?siteTileObj(mt.c,mt.r):null,inSite=mst&&owned(mst.id)&&mto&&!mto.store&&!mto.pad;
  if(inSite){
    if(a.res&&(!a.res.alive||a.res.by!==a||a.res.s!==mst.id))release(a);
    var roomS=cvLv(mst.id)||mst.kind==='mine'?pn(mst.id)<pcap():bagN(a)<cap();
    if(!a.res){if(!roomS){if(a.lockT<=0){addFloat(a.x,a.y-34,cvLv(mst.id)?'적재칸이 가득! 벨트를 강화해요':'두 손이 가득! 납품하러 가요','#ffb3b3');a.lockT=3;}return;}
      var qb=null,qd=1e9;res.forEach(function(q){if(q.s!==mst.id||!q.alive)return;var d3=Math.hypot(q.x-a.x,q.y-a.y)+(q.by&&q.by!==a?60:0);if(d3<qd){qd=d3;qb=q;}});
      if(!qb)return;if(qb.by&&qb.by!==a)release(qb.by);qb.by=a;a.res=qb;a.prog=0;}
    var sp0=stand(a.res,a);if(Math.hypot(sp0.x-a.x,sp0.y-a.y)>1.5){moveTo(a,sp0.x,sp0.y,dt);a.prog=0;return;}
    a.dir=a.res.x>=a.x?1:-1;progress(a,dt);return;}
  if(a.res&&(!a.res.alive||a.res.by!==a||Math.hypot(a.res.x-a.x,a.res.y-a.y)>48))release(a);
  if(!a.res){
    var best=null,bd=50;
    res.forEach(function(q){if(!q.alive||!owned(q.s)||(q.by&&q.by!==a))return;var d2=Math.hypot(q.x-a.x,(q.y+10-a.y)*1.1);if(d2<bd){bd=d2;best=q;}});
    if(!best)return;
    if(!okFor(a.gear,best)){if(a.lockT<=0){addFloat(a.x,a.y-30,needMsg(best),'#ffe2a8');a.lockT=3;}return;}
    if((cvLv(best.s)||best.k==='ore')?pn(best.s)>=pcap():bagN(a)>=cap()){if(a.lockT<=0){addFloat(a.x,a.y-30,'두 손이 가득! 납품하러 가요','#ffb3b3');a.lockT=3;}return;}
    best.by=a;a.res=best;a.prog=0;
  }
  a.dir=a.res.x>=a.x?1:-1;progress(a,dt);
}
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
  var rate=Math.max(500,cost/.30);a.payTick=(a.payTick||0)+rate*dt;
  var amt=Math.min(cost-paid,S.coins,Math.floor(a.payTick/50)*50);
  if(amt===0&&S.coins>=50)return;a.payTick=Math.max(0,a.payTick-amt);
  if(amt<=0){if(padMsgT<=0){addFloat(on.x,on.y-26,'코인이 부족해요','#ffb3b3');sfx('nope');padMsgT=2.5;}return;}
  S.coins-=amt;paid+=amt;S.pads[on.id]=paid;
  a.padFlyT=(a.padFlyT||0)-dt;if(a.padFlyT<=0){a.padFlyT=.06;fly('bigcoin',a.x+(Math.random()-.5)*8,a.y-20,on.x+(Math.random()-.5)*10,on.y-4,.18);sfx('coin',.09);}a.padAmtT=(a.padAmtT||0)-dt;if(a.padAmtT<=0){a.padAmtT=.4;addFloat(on.x,on.y-28,'-₩'+fmt(amt),'#ffe27a',true);}
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
    if(paid>0){g.fillStyle='#a6b48a';rr(g,-14,13,28*Math.min(1,paid/Math.max(1,cost)),1.5,.75);g.fill();}
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
/* ---------- tutorial: six short steps with an arrow on the target ---------- */
var TUT=[
  {t:'화면을 끌어요 · 화살표까지 왕복',at:function(){return (S.tutN||0)<1?TUT_A:{x:HOME.x,y:HOME.y};},done:function(){return (S.tutN||0)>=2;},prog:function(){return Math.min(2,S.tutN||0)+'/2';}},
  {t:'🌲 나무 옆에 서요 · 자동 채집',at:function(){var a=agents[0],best=null,bd=1e9;res.forEach(function(r){if(r.s==='f1'&&r.alive){var d=Math.hypot(r.x-a.x,r.y-a.y);if(d<bd){bd=d;best=r;}}});return best?{x:best.x,y:Math.max(26,best.y-22)}:null;},done:function(){return bagN(agents[0])>=cap();},prog:function(){return Math.min(cap(),bagN(agents[0]))+'/'+cap();}},
  {t:'나무를 가게에 옮겨요',at:function(){return dropPt('wood');},done:function(){return bagN(agents[0])===0&&tutHasDelivery();},prog:function(){return bagN(agents[0])+'개 남음';}},
  {t:'💵 돈더미를 주워요',tt:function(){return (S.cash&&S.cash.wood>0)?'💵 돈더미 주우러 가요':'🧑‍🤝‍🧑 손님이 사는 중 · 곧 돈더미 생겨요';},at:function(){var p=cashPos('wood');return {x:p.x,y:p.y-8};},done:function(){return !!S.h4;}},
  {t:'🪓 [나무꾼 고용]에 서요 · 대신 베어요',at:function(){return padPos(TUTPAD[S.tut]);},done:function(){return S.w.length>0;}},
  {t:'🌲 [숲 키우기]에 서요 · 좋은 나무 등장',at:function(){return padPos(TUTPAD[S.tut]);},done:function(){return siteLv('f1')>=2;}},
  {t:'💪 [나무꾼 강화]에 서요 · 더 빨리 베요',at:function(){return padPos(TUTPAD[S.tut]);},done:function(){return (S.wlv&&S.wlv.lumber||0)>0;}},
  {t:'⚙️ [숲 벨트]에 서요 · 자동 운반',at:function(){return padPos(TUTPAD[S.tut]);},done:function(){return !!S.cv.f1;}},
  {t:'🐻‍❄️ 울타리에 다가가 발판 위에 서요',at:function(){return padPos(TUTPAD[S.tut])||{x:26,y:Math.max(30,Math.min(H-30,agents[0].y))};},done:function(){return S.fence>0;}},
  {t:'🗼 [망루]도 지어요 · 화살 방어',at:function(){return padPos(TUTPAD[S.tut]);},done:function(){return S.tower>0;}}
];
var TUTPAD={4:'hire_lumber',5:'site_f1',6:'wup_lumber',7:'belt_f1',8:'fence',9:'tower'},TUT_A={x:40,y:392};
var TUT_OK=['잘 움직였어요!','가득 찼어요! 납품하러 가요','납품 완료! 손님이 사 가요','돈을 챙겼어요!','첫 일꾼 고용!','숲 레벨 업!','나무꾼 레벨 업!','벨트 설치! 이제 자동으로 팔려요','울타리 완성!','망루 완성!'];
/* each tutorial step allows only its own action: gather only in the gathering step, deliver only in the delivery step, cash only in the cash step */
function tutHasDelivery(){return !!S.tutDelivered||lineStock('wood')>0||!!(S.cash&&S.cash.wood>0)||!!S.h4;}
function tutRecoverDelivery(){if((S.tut===2||S.tut===3)&&bagN(agents[0])===0&&!tutHasDelivery()){S.tut=1;S.tutN=0;save();}}
function tutNoGather(){return tutOn()&&S.tut!==1&&!((S.tut===2||S.tut===3)&&!tutHasDelivery()&&bagN(agents[0])===0);}
function tutAllow(what){if(!tutOn())return true;return {deliver:2,cash:3}[what]===S.tut;}
function tutOn(){return S.tut!=null&&S.tut<TUT.length;}
function tutNext(){var done=S.tut;S.tut++;S.tutN=0;var a=agents[0];
  if(S.tut>=TUT.length){S.coins+=50;S.season=0;celebrate(a.x,a.y,'🎉 튜토리얼 완료!',true);sfx('chime');flash=.45;
    STAGEBAN={t:5,max:5,big:1,text:'🔥 1장 · 불씨를 지키는 숲',sub:'보상 +50 · 눈 아래 푸른 뿌리가 깨어났어요 · 겨울 장작을 모아요'};
    for(var i=0;i<8;i++)coinToHud(a.x+(Math.random()-.5)*20,a.y-20);}
  else{sfx('chime');burst(a.x,a.y-12,'#ffe27a',14,true);STAGEBAN={t:2.6,max:2.6,text:'👍 '+(TUT_OK[done]||'잘했어요!'),sub:'다음: '+TUT[S.tut].t.split(' · ')[0].replace(/[\[\]]/g,'').slice(0,22)};}
  save();}
function updateTut(){if(S.tut==null||S.tut>=TUT.length)return;tutRecoverDelivery();var st=TUT[S.tut];
  if(S.tut===0){var a0=agents[0];if((S.tutN||0)===0&&Math.hypot(a0.x-TUT_A.x,a0.y-TUT_A.y)<20){S.tutN=1;sfx('chime');addFloat(a0.x,a0.y-44,'👍 좋아요! 이제 처음 자리로 돌아와요','#ffe27a');burst(a0.x,a0.y-10,'#ffe27a',10,true);}
    else if(S.tutN===1&&Math.hypot(a0.x-HOME.x,a0.y-HOME.y)<20)S.tutN=2;}
  var pd=TUTPAD[S.tut];if(pd&&DEF[pd]){var need=Math.ceil(DEF[pd].cost()-((S.pads&&S.pads[pd])||0)),gap=need-Math.floor(S.coins);
    if(gap>0){S.coins+=gap;if(S.tutF!==S.tut){S.tutF=S.tut;var a=agents[0];addFloat(a.x,a.y-46,'🎁+'+gap,'#ffe27a',true);for(var i=0;i<Math.min(8,2+Math.ceil(gap/8));i++)coinToHud(a.x+(Math.random()-.5)*16,a.y-20);sfx('coin');}save();}}
  if(st.done())tutNext();}
function tutHint(){if(S.tut==null||S.tut>=TUT.length)return '';var st=TUT[S.tut];return (S.tut+1)+'/'+TUT.length+' '+(st.tt?st.tt():st.t).replace(/ · /g,'\n')+(st.prog?' ('+st.prog()+')':'');}
function guideTarget(){if(tutOn()){var p=TUT[S.tut].at();return p?{x:p.x,y:p.y,col:'232,38,48'}:null;}
  if(defenseDue()){var d=defensePad();if(d)return {x:d.x,y:d.y,col:'232,38,48'};}
  var ih=idleHint();if(ih)return {x:ih.x,y:ih.y,col:'240,187,63'};
  return null;}
function defenseDue(){return huntReady()&&!isWinter()&&toWinter()<70&&(!S.tower||!S.fence)&&!liveBears().length;}
function defensePad(){var t=null,f=null;PADLIST.forEach(function(p){if(p.id==='tower'&&!S.tower)t=p;if(p.id==='fence'&&!S.fence)f=p;});return t||f;}
function drawGuide(){var tg=guideTarget();if(!tg)return;var a=agents[0],dx=tg.x-a.x,dy=tg.y-a.y,d=Math.hypot(dx,dy);if(d<34)return;
  var g=ctx,ux=dx/d,uy=dy/d,ph=(time*40)%14;
  g.save();g.lineCap='round';
  for(var t=18+ph;t<d-16;t+=14){var k=Math.min(1,(t-10)/40)*Math.min(1,(d-t)/40);var px=a.x+ux*t,py=a.y+uy*t;g.fillStyle='rgba(255,255,255,'+(.9*k)+')';g.beginPath();g.arc(px,py,4,0,7);g.fill();g.fillStyle='rgba('+tg.col+','+k+')';g.beginPath();g.arc(px,py,2.9,0,7);g.fill();}
  var ax=a.x+ux*28,ay=a.y-6+uy*28,an=Math.atan2(uy,ux),bb=Math.sin(time*8)*2.5;g.translate(ax+ux*bb,ay+uy*bb);g.rotate(an);
  g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.moveTo(12,2);g.lineTo(-4,-8);g.lineTo(0,2);g.lineTo(-4,12);g.closePath();g.fill();
  g.scale(1.25,1.25);g.fillStyle='rgb('+tg.col+')';g.strokeStyle='#fff';g.lineWidth=2.4;g.lineJoin='round';g.beginPath();g.moveTo(11,0);g.lineTo(-5,-10);g.lineTo(-1,0);g.lineTo(-5,10);g.closePath();g.stroke();g.fill();
  g.restore();}
function tutorialEdgePoint(p){var pad=24*screenUnit,x=(p.x-camX)*Z,y=(p.y-camY)*Z;if(x>=pad&&x<=W-pad&&y>=pad&&y<=SH-pad)return null;var dx=x-W/2,dy=y-SH/2,k=Math.min(dx?Math.max(0,W/2-pad)/Math.abs(dx):Infinity,dy?Math.max(0,SH/2-pad)/Math.abs(dy):Infinity);return {x:W/2+dx*k,y:SH/2+dy*k,angle:Math.atan2(dy,dx)};}
function drawTutorialEdge(){if(!tutOn())return;var p=TUT[S.tut].at();if(!p)return;var edge=tutorialEdgePoint(p);if(!edge)return;var g=ctx;g.save();g.translate(edge.x,edge.y);g.rotate(edge.angle);g.fillStyle='#e2463c';g.strokeStyle='#fff';g.lineWidth=2*screenUnit;g.beginPath();g.moveTo(10*screenUnit,0);g.lineTo(-7*screenUnit,-7*screenUnit);g.lineTo(-7*screenUnit,7*screenUnit);g.closePath();g.stroke();g.fill();g.restore();}
function drawTutArrow(){
  if(S.tut==null||S.tut>=TUT.length)return;var p=TUT[S.tut].at();if(!p)return;var g=ctx,b=Math.sin(time*6)*4;
  g.fillStyle='rgba(255,226,122,.35)';g.beginPath();g.ellipse(p.x,p.y+14,14+Math.sin(time*6)*2,5,0,0,7);g.fill();
  g.save();g.translate(p.x,p.y-8+b);g.fillStyle='#e2463c';g.strokeStyle='#fff';g.lineWidth=2;
  g.beginPath();g.moveTo(-5,-14);g.lineTo(5,-14);g.lineTo(5,-4);g.lineTo(10,-4);g.lineTo(0,6);g.lineTo(-10,-4);g.lineTo(-5,-4);g.closePath();g.stroke();g.fill();g.restore();
}

/* ---------- polar bear raids: once the village can hunt (owns a spear or bow) bears come down from the north
   and attack an upgraded building or a worker. enough damage knocks that thing's level down by one.
   fight them with a spear (close) and a bow (range); they drop meat and hide ---------- */
var BEARS=[],LOOT=[],ARROWS=[],bearT=40,huntShown=false,raidQ=0,raidT=0,bearHintT=0,bearBanT=-99;
function hasWeapon(){return true;}
function huntReady(){return !tutOn()||S.tut>=7||(S.winters||0)>=1||siteScore()>=3||S.tower>0;}
function bearsOn(){return isWinter();}
function bearInterval(){return 80+Math.random()*30;}
function liveBears(){return BEARS.filter(function(b){return b.state!=='dead';});}
function bearNear(a,d){var best=null,bd=d;BEARS.forEach(function(b){if(b.state==='dead'||b.state==='out')return;var dd=Math.hypot(b.x-a.x,b.y-a.y);if(dd<bd){bd=dd;best=b;}});return best;}
function spearDmg(){return (4+2.3*wpnLv())*heroDmgMul();}
function bowDmg(){return (7+2.7*wpnLv())*heroDmgMul();}
var BEAR_HIT=24;
/* things a bear can go after */
function bearTargets(){
  var l=[];
  agents.forEach(function(a){if(a.role!=='player'&&!a.inside)l.push({kind:'worker',a:a,w:1.2});});
  cashSpots().forEach(function(o){var n=S.cash[o.k]||0;if(n>=5)l.push({kind:'cash',k:o.k,p:o.p,w:1+Math.min(3,n/80)});});
  if(S.coins>0)l.push({kind:'purse',w:.8});
  return l;
}
/* More advanced chapters toughen bears slightly; player defenses never make bears stronger. */
function bearMult(){return 1+.35*Math.max(0,(S.stage||1)-1);}
function bearStrikeMult(){return 1.18+.18*Math.max(0,(S.stage||1)-1);}
/* v63 (director 2026-10-04): once the mine village opens, bears come more often, more of them at once, and a fierce black King Bear shows up */
function bearCap(){var s3=(S.stage||1)>=3;return Math.min(s3?10:7,3+Math.floor((S.winters||1)/2)+(s3?2:0));}
/* v89 (director 2026-10-06: raids should start slow and end in a frantic rush) - 0 at the start of a raid, 1 at its end */
function raidP(){if(!isWinter())return 0;return Math.max(0,Math.min(1,((S.season||0)-winterStart())/Math.max(1,raidLen())));}
/* how many bears may be in at once right now: a few at first, the full cap by mid-raid, +2 extra in the closing rush */
function bearCapNow(){var p=raidP(),c=bearCap();return Math.max(1,Math.round(c*(.5+.7*Math.min(1,p/.7))))+(p>=.7?2:0);}
/* Earlier pressure still ramps into a closing rush, with a bounded spawn rate. */
function raidGap(){var p=raidP(),base=(Math.max(3,6.5-.3*(S.winters||1))+Math.random()*2)*((S.stage||1)>=3?.6:1);return Math.max(.8,base*(1.55-1.2*Math.pow(p,.85)));}
var RUSHMSG=0;
/* v89: a bear's on-body radius (boss/king are drawn bigger) - used to keep the hero, workers and other bears from standing inside it */
function bearR(b){return 15*(b.king?1.6:(b.boss?1.35:1));}
function tPos(t){
  if(t.kind==='worker')return {x:t.a.x,y:t.a.y};
  if(t.kind==='none')return {x:HOME.x,y:HOME.y};
  if(t.kind==='cash')return {x:t.p.x,y:t.p.y};
  if(t.kind==='purse')return {x:HOME.x,y:HOME.y};
  if(t.kind==='tower')return {x:TOWER.x,y:TOWER.y+76};
  if(t.kind==='plot')return {x:t.pl.x+t.pl.w/2,y:t.pl.y+t.pl.h-8};
  if(t.kind==='shop')return {x:STALL[t.line].x-10,y:STALL[t.line].y+20};
  var p=pilePos(t.sid);return {x:p.x,y:p.y+8};
}
function tValid(t){if(t.kind==='none')return false;if(t.kind==='worker')return agents.indexOf(t.a)>=0;if(t.kind==='cash')return (S.cash[t.k]||0)>0;if(t.kind==='purse')return S.coins>1;if(t.kind==='tower')return S.tower>0&&!S.towerDown;if(t.kind==='plot')return t.pl.built();if(t.kind==='belt')return cvLv(t.sid)>0;return true;}
function tName(t){if(t.kind==='worker')return t.a.gear.name||'일꾼';if(t.kind==='cash')return '돈 더미';if(t.kind==='purse')return '마을 금고';if(t.kind==='tower')return '망루';if(t.kind==='plot')return t.pl.name;if(t.kind==='shop')return SHOPDEF[t.line].name;return SITE[t.sid].name+' 벨트';}
function pickTarget(b){if(S.tower>0&&!S.towerDown&&(!b||!b.didTower)&&Math.random()<.45){if(b)b.didTower=1;return {kind:'tower',w:1};}var l=bearTargets();if(!l.length)return null;var sum=0;l.forEach(function(t){sum+=t.w;});var r=Math.random()*sum;for(var i=0;i<l.length;i++){r-=l[i].w;if(r<=0)return l[i];}return l[l.length-1];}
var BEAR_HPX=3.25,BEAR_SPX=1.3;
function pickBearSide(){var r=Math.random();return r<.4?'bottom':(r<.6?'left':(r<.82?'right':'top'));}
function bearEntry(side,fx0){var yy=80+Math.random()*(H-140);
  if(side==='left')return {x:-24,y:yy,ex:-40,ey:yy};
  if(side==='right')return {x:fx0+24,y:yy,ex:fx0+40,ey:yy};
  if(side==='top'){var tx=20+Math.random()*(fx0-40);return {x:tx,y:WORLD_TOP+6,ex:tx,ey:-40};}
  var bx=20+Math.random()*(fx0-50);return {x:bx,y:HT-10+Math.random()*4,ex:bx,ey:HT+36};}
/* a bear coming over the side palisade has to climb it first - longer behind a higher wall */
function bearClimb(v){return 0;}
function blockBearAtFence(b,nx,ny){
  if(b.entered||b.state==='out'||b.state==='dead')return false;
  var side=b.side||'bottom',fx=fenceX(),v=side==='left'?1:side==='right'?(S.stage||1):villageAt(b.x),r=15*(b.king?1.6:(b.boss?1.35:1)),margin=r+10,bottom=H+r+15;
  if(side==='top'||!fenceUp(v))return false;
  /* This guard also catches crowd separation pushing an exterior bear through a wall. */
  var blocked=side==='left'?nx>=-margin:side==='right'?nx<=fx+margin:ny<=bottom;
  if(!blocked)return false;
  if(side==='left')b.x=-margin;else if(side==='right')b.x=fx+margin;else b.y=bottom;
  if(b.state!=='fence'||b.wallV!==v)b.swipeT=.4;b.wallV=v;b.state='fence';
  if(!b.fenceMsg){b.fenceMsg=1;b.roar=1.1;shake(.3);addFloat(Math.max(18,Math.min(fx-18,b.x)),Math.min(H-25,b.y),'🪵 울타리를 부수려 해요!','#dff4ff');}
  return true;
}
function spawnBear(sideOverride){
  var t=pickTarget();if(!t)return;
  var n=S.bears||0,king=(S.stage||1)>=3&&((n+1)%4===0||Math.random()<.12),boss=!king&&(n+1)%5===0,hp=(18+7*Math.min(n,20))*(king?4.5:(boss?2.5:1))*bearMult(),tp=tPos(t.kind==='tower'?{kind:'purse'}:t);
  /* v77 (director 2026-10-05: bears too weak, and they should come from everywhere, not only from below) - health and movement use BEAR_HPX/BEAR_SPX below,
     and enter from the bottom (through the wall), the left palisade, the right edge of the fog or the market road at the top */
  var side=['left','right','bottom','top'].indexOf(sideOverride)>=0?sideOverride:pickBearSide(),fx0=Math.min(MX,fenceX()),ent=bearEntry(side,fx0);
  var b={x:ent.x,y:ent.y,side:side,ex:ent.ex,ey:ent.ey,stole:0,tgt:t,state:'in',hp:hp*BEAR_HPX,max:hp*BEAR_HPX,boss:boss,t:0,flash:0,dir:side==='right'?-1:1,bob:0,kx:0,hitT:0,swipeT:1,dmg:0,swipe:0,king:king,climb:side==='left'||side==='right'?bearClimb(villageAt(ent.x)):0};
  b.homeY=HT+16;b.spm=.9+.35*raidP();b.roar=king?2:1.3;b.roarMax=b.roar;BEARS.push(b);sfx('horn');flash=king?.4:.2;shake(king?1:(boss?.6:.25));
  var SIDEN={bottom:'아래',left:'왼쪽',right:'오른쪽',top:'위쪽'};
  /* v83 (director 2026-10-05: bears were still hard to spot) - a screen-fixed banner (not world-space) fires every time a bear appears, throttled so a raid wave doesn't spam it */
  if(king){sfx('horn');STAGEBAN={t:2.4,max:2.4,text:'🖤 난폭한 검은 대왕곰!',sub:'체력이 아주 높고 빨라요 · 망루와 사냥꾼을 모아요'};bearBanT=time;}
  else if(time-bearBanT>4.5){bearBanT=time;STAGEBAN={t:2,max:2,text:(boss?'👑 대장 북극곰이 나타났어요!':'🐻‍❄️ 곰이 나타났어요!'),sub:SIDEN[side]+'에서 침입 · 가장자리 화살표를 따라가요'};}
  addFloat(Math.max(60,Math.min(MX-60,b.x)),Math.max(40,Math.min(H-50,b.y-30)),(king?'🖤 검은 대왕곰 침입!':(boss?'👑 대장 북극곰 침입!':'🐻‍❄️ 북극곰 '+SIDEN[side]+'에서 침입!')),king?'#ffb3b3':'#dff4ff');
}
/* the damage lands: one level goes down (never below 1; level-1 things just hold on) */
function degrade(t,b){
  var p=tPos(t),msg='',lost=false;
  if(t.kind==='worker'){var g=t.a.gear,trs=t.a.role==='lumber'?['axe','boots']:['rod','boots'],best=null;
    trs.forEach(function(tr){if((g[tr]||0)>0&&(!best||g[tr]>g[best]))best=tr;});
    if(best){g[best]--;lost=true;t.tr=best;msg=(g.name||'일꾼')+' '+(best==='axe'?'도끼':best==='rod'?'낚싯대':'장화')+' Lv-1';}else msg=(g.name||'일꾼')+' 다쳤어요';}
  else if(t.kind==='plot'){if(S[t.key]>1){S[t.key]--;lost=true;msg=t.pl.name+' Lv-1';}else msg=t.pl.name+' 버텨냈어요';}
  else if(t.kind==='shop'){if(S.shop[t.line]>1){S.shop[t.line]--;lost=true;msg=SHOPDEF[t.line].name+' Lv-1';}else msg=SHOPDEF[t.line].name+' 버텨냈어요';}
  else{if(S.cv[t.sid]>1){S.cv[t.sid]--;lost=true;msg=SITE[t.sid].name+' 벨트 Lv-1';}else msg=SITE[t.sid].name+' 벨트 버텨냈어요';}
  addFloat(p.x,p.y-30,(lost?'💥 ':'🛡️ ')+msg,lost?'#ffb3b3':'#dff4ff');burst(p.x,p.y-10,lost?'#e2566a':'#dff4ff',12,true);
  if(lost){addRepair(t);sfx('nope');flash=.3;}refreshUI();save();
  b.state='out';addFloat(b.x,b.y-34,'크아앙! 곰이 돌아가요','#ffffff');
}
function killBear(b){
  b.state='dead';b.t=0;S.bears=(S.bears||0)+1;stat('bear',1);
  if(b.stole>0){S.coins+=b.stole;addFloat(b.x,b.y-52,'💰+'+fmt(b.stole),'#ffe27a',true);b.stole=0;}
  var str=Math.max(1,(b.max||18)/18),nm=Math.min(16,2+Math.floor(Math.random()*2)+Math.floor(str/2)+(b.boss?3:0)+(b.king?6:0)),nh=Math.min(12,1+Math.floor(str/3)+(Math.random()<.3?1:0)+(b.boss?2:0)),i;
  addSs('fish','meat',nm);addSs('wood','hide',nh);
  for(i=0;i<Math.min(10,nm+nh);i++){var fid=i%2?'hide':'meat',st2=STALL[fid==='meat'?'fish':'wood'];fly(fid,b.x+(Math.random()-.5)*16,b.y-10,st2.x+(Math.random()-.5)*20,st2.y+8,.7+i*.06);}
  var bonus=money50((b.king?420:(b.boss?150:34))*str);S.coins+=bonus;
  for(i=0;i<Math.min(8,2+Math.floor(bonus/40));i++)fly('coin',b.x+(Math.random()-.5)*20,b.y-14,b.x+(Math.random()-.5)*10,b.y-60,.5+i*.05);
  /* v84: every kill gets a real punch - shake, a ring shockwave and extra sparkle, scaled up further for boss/king */
  shake(Math.max(b.king?.8:(b.boss?.55:.4)));flash=Math.max(flash,b.king?.6:(b.boss?.5:.4));
  if(b.king)celebrate(b.x,b.y,'🖤 대왕곰 처치!',true);else if(b.boss)addFloat(b.x,b.y-64,'👑 대장 처치!','#ffe27a');else addFloat(b.x,b.y-64,'💥 처치!','#ffe27a');
  for(var kri=0;kri<(b.king?3:2);kri++)parts.push({x:b.x,y:b.y-12,vx:0,vy:0,g:0,life:.5+kri*.18,max:.5+kri*.18,col:b.king?'#ff6070':'#ffffff',r:5+kri*4,ring:1});
  addFloat(b.x,b.y-40,(b.king?'🖤+':(b.boss?'👑+':'💰+'))+fmt(bonus),'#ffe27a',true);
  addFloat(b.x,b.y-54,'🥩+'+nm+' 🧥+'+nh,'#ffffff',true);
  burst(b.x,b.y-10,'#ffffff',16+(b.king?10:(b.boss?6:4)),true);burst(b.x,b.y-10,'#ffe27a',10+(b.king?8:(b.boss?4:2)),true);sfx('chime');save();
  if(b.finale){S.finaleDone=1;save();startEndingCinematic();}
}
/* v101: finale begins once all three villages are restored and their crews can defend them;
   optional end-state fields keep old saves compatible */
function allMaxed(){
  if((S.stage||1)<3)return false;
  if(siteLv('f1')<3||siteLv('p1')<3||siteLv('m1')<3)return false;
  if((S.shop.wood||0)<4||(S.shop.fish||0)<4)return false;
  if((S.tower||0)<2||(S.fence||0)<2)return false;
  if(((S.vt&&S.vt[2])||0)<2||((S.vf&&S.vf[2])||0)<2)return false;
  if(((S.vt&&S.vt[3])||0)<2||((S.vf&&S.vf[3])||0)<2)return false;
  var roles=['lumber','fisher','hunter','hunter2','hunter3','miner'];
  for(var i=0;i<roles.length;i++){var r=roles[i];if(count(r)<3)return false;if(((S.wlv&&S.wlv[r])||0)<6)return false;}
  if((S.mill||0)<2||(S.smoke||0)<2)return false;
  if((S.smelt||0)<3||(S.elec||0)<3)return false;
  return true;
}
function spawnFinaleBoss(){
  if(S.finaleDone||hasFinaleBoss())return;
  var fx0=Math.min(MX,fenceX()),ent=bearEntry('top',fx0),hp=350*bearMult();
  var fb={x:ent.x,y:ent.y,side:'top',ex:ent.ex,ey:ent.ey,stole:0,tgt:{kind:'purse'},state:'in',hp:hp,max:hp,boss:true,king:true,finale:true,t:0,flash:0,dir:1,bob:0,kx:0,hitT:0,swipeT:1,dmg:0,swipe:0,climb:0,homeY:HT+16,roar:3,roarMax:3};
  BEARS.push(fb);S.finaleSpawned=1;save();sfx('horn');flash=.6;shake(1);
  STAGEBAN={t:4,max:4,text:'👑 세 마을의 불빛을 본 대왕곰!',sub:'숲·호수·광산의 사냥꾼이 함께 막아내요'};
  addFloat(MX/2,120,'🐻‍❄️👑 끝판왕 북극곰이 나타났어요!','#ffe27a');
}
function showEnding(){var el=document.getElementById('ending');if(el)el.hidden=false;sfx('chime');flash=.5;shake(.6);}
function hasFinaleBoss(){return BEARS.some(function(b){return b.finale&&b.state!=='dead'&&b.state!=='out';});}
function restoreFinale(){if(S.finaleDone){TITLE=false;titleEl.hidden=true;document.getElementById('quickDock').hidden=false;showEnding();}}
var finaleT=1;
function updateFinale(dt){finaleT-=dt;if(finaleT>0)return;finaleT=1;if(!S.finaleDone&&!hasFinaleBoss()&&(S.finaleSpawned||allMaxed()))spawnFinaleBoss();}
/* v87 (director): a short cinematic slideshow - blizzard, bear invasion, village saved - plays before the trophy screen */
var ENDSEQ=null;
function startEndingCinematic(){ENDSEQ={scene:0,t:0,dur:[3.2,3.4,3.4]};flash=.6;shake(1);}
function updateEndingCinematic(dt){if(!ENDSEQ)return;ENDSEQ.t+=dt;var d=ENDSEQ.dur[ENDSEQ.scene]||3;
  if(ENDSEQ.t>=d){ENDSEQ.scene++;ENDSEQ.t=0;if(ENDSEQ.scene>=ENDSEQ.dur.length){ENDSEQ=null;showEnding();}else{shake(.5);flash=Math.max(flash,.3);sfx('chime');}}}
function drawEndingCinematic(){
  if(!ENDSEQ)return;var g=ctx,sc=ENDSEQ.scene,t=ENDSEQ.t,d=ENDSEQ.dur[sc]||3,capt='';
  g.save();
  if(sc===0){
    var gr=g.createLinearGradient(0,0,0,SH);gr.addColorStop(0,'#1c2b3a');gr.addColorStop(1,'#3d5268');g.fillStyle=gr;g.fillRect(0,0,W,SH);
    g.fillStyle='rgba(255,255,255,.6)';
    for(var i=0;i<54;i++){var sx=(i*53+time*(220+(i%5)*40))%(W+80)-40,sy=(i*37+time*(150+(i%7)*30))%(SH+40)-20;g.fillRect(sx,sy,2,9+(i*7)%9);}
    g.fillStyle='rgba(255,255,255,'+(.08+.06*Math.sin(time*5))+')';g.fillRect(0,0,W,SH);
    capt='❄️ 눈보라가 몰아쳐요...'; /* v87 (staff 4): captions were garbled text - fixed */
  }else if(sc===1){
    var p1=Math.min(1,t/d);
    var gr2=g.createLinearGradient(0,0,0,SH);gr2.addColorStop(0,'#2a1620');gr2.addColorStop(1,'#4a2430');g.fillStyle=gr2;g.fillRect(0,0,W,SH);
    var bx=W+140-(W+300)*p1,by0=SH*.58;
    g.save();g.translate(bx,by0);
    g.fillStyle='rgba(10,8,12,.94)';g.beginPath();g.ellipse(0,20,130,46,0,0,7);g.fill();
    g.beginPath();g.arc(-78,-30,54,0,7);g.fill();
    g.beginPath();g.arc(70,-70,30,0,7);g.fill();
    g.beginPath();g.ellipse(100,-54,16,12,0,0,7);g.fill();
    g.fillStyle='#ff3b4a';g.beginPath();g.arc(104,-58,3,0,7);g.arc(112,-60,3,0,7);g.fill();
    g.restore();
    g.strokeStyle='rgba(255,180,180,.4)';g.lineWidth=2;for(var r=0;r<3;r++){g.beginPath();g.arc(bx+70,by0-60,30+r*18+(time*60)%18,0,7);g.stroke();}
    capt='🐻‍❄️ 거대한 대장곰이 쳐들어와요!';
  }else{
    var gr3=g.createLinearGradient(0,0,0,SH);gr3.addColorStop(0,'#ffd98a');gr3.addColorStop(.55,'#ffb25e');gr3.addColorStop(1,'#6fae55');g.fillStyle=gr3;g.fillRect(0,0,W,SH);
    var vy=SH*.72;g.fillStyle='rgba(60,40,20,.85)';
    [[-170,0],[-70,-18],[40,10],[150,-10]].forEach(function(h){g.beginPath();g.moveTo(W/2+h[0]-34,vy+h[1]);g.lineTo(W/2+h[0],vy+h[1]-40);g.lineTo(W/2+h[0]+34,vy+h[1]);g.closePath();g.fill();g.fillRect(W/2+h[0]-26,vy+h[1],52,34);});
    for(var ci=0;ci<20;ci++){var cx=((ci*83+time*70)%(W+40))-20,cy=vy-60-((ci*47+time*140)%(SH*.5));g.fillStyle=ci%3?'#ffe9a8':'#fff3d0';g.beginPath();g.arc(cx,cy,2+(ci*3)%3,0,7);g.fill();}
    capt='🎉 마을을 지켜냈어요!';
  }
  var capAlpha=Math.min(1,t*2.2)*(t>d-.5?Math.max(0,(d-t)/.5):1);
  g.textAlign='center';g.textBaseline='middle';g.font='900 22px sans-serif';g.lineJoin='round';g.lineWidth=5;
  g.globalAlpha=capAlpha;g.strokeStyle='rgba(20,16,12,.85)';g.strokeText(capt,W/2,SH*.22);g.fillStyle='#fff';g.fillText(capt,W/2,SH*.22);
  g.globalAlpha=Math.min(.7,capAlpha);g.font='600 12px sans-serif';g.fillStyle='rgba(255,255,255,.85)';g.fillText('화면을 누르면 넘어가요',W/2,SH-26);
  g.globalAlpha=1;g.restore();
}
function heroHitFx(pl,b){var ht=heroTier(),n=9+ht*4,hx=b.x-(b.x-pl.x>0?8:-8);burst(hx,b.y-12,ht>=3?'#ffe27a':(ht>=1?'#fff1a8':'#ffffff'),n,true);shake(.22+.06*ht);flash=Math.max(flash,.14+.05*ht);try{if(navigator.vibrate)navigator.vibrate(ht>=2?55:38);}catch(_e){}parts.push({x:hx,y:b.y-12,vx:0,vy:0,g:0,life:.4,max:.4,col:'#ffffff',r:3,ring:1});for(var hfi=0;hfi<6+ht*3;hfi++)parts.push({x:b.x+(Math.random()-.5)*10,y:b.y-10+(Math.random()-.5)*8,vx:(Math.random()-.5)*110,vy:-30-Math.random()*60,g:110,life:.55+Math.random()*.25,max:.8,col:'hsl('+Math.floor(Math.random()*360)+',95%,66%)',r:1.6+Math.random()*1.4,star:1});}
var COMBO_N=8,ULT_MUL=5,HUNT_ULT_P=.22,HUNT_ULT_MUL=5;
/* v84: hero ultimate - every COMBO_N consecutive attacks unleash a flashy, far stronger blow */
function heroUltFx(pl,b){
  pl.ultFxT=.65;shake(1);flash=Math.max(flash,.6);try{if(navigator.vibrate)navigator.vibrate([40,30,90]);}catch(_e){}
  burst(b.x,b.y-14,'#ffe27a',22,true);burst(b.x,b.y-14,'#ffffff',16,true);burst(b.x,b.y-14,'#ff6a3c',16,true);
  addFloat(pl.x,pl.y-54,'권왕 · 진각파!' ,'#ffe27a');
  for(var ri=0;ri<3;ri++)parts.push({x:b.x,y:b.y-12,vx:0,vy:0,g:0,life:.5+ri*.15,max:.5+ri*.15,col:'#fff1a8',r:4+ri*4,ring:1});
  for(var ui=0;ui<28;ui++)parts.push({x:b.x+(Math.random()-.5)*26,y:b.y-14+(Math.random()-.5)*20,vx:(Math.random()-.5)*240,vy:-60-Math.random()*130,g:140,life:.7+Math.random()*.4,max:1.1,col:'hsl('+Math.floor(Math.random()*60+8)+',95%,62%)',r:2.2+Math.random()*2.2,star:1});
}
/* All martial strikes share the combo counter and area ultimate. */
function heroAttackHit(pl,b,baseDmg,ranged){
  pl.combo=(pl.comboT&&time-pl.comboT<3?(pl.combo||0):0)+1;pl.comboT=time;
  /* The eighth consecutive strike sends a shockwave around the hero. */
  if(pl.combo>=COMBO_N){pl.combo=0;heroUltFx(pl,b);BEARS.slice().forEach(function(ob){if(ob.state==='dead'||ob.state==='out')return;if(ob===b||Math.hypot(ob.x-pl.x,ob.y-pl.y)<=135)hitBear(ob,pl,baseDmg*ULT_MUL,false);});}
  else{hitBear(b,pl,baseDmg,ranged);heroHitFx(pl,b);}
}
function hitBear(b,from,dmg,ranged){
  if(b.state==='dead')return;
  b.hp-=dmg;b.flash=.2;var d=Math.max(1,Math.hypot(b.x-from.x,b.y-from.y));b.kx=(b.x-from.x)/d*(ranged?1.8:4);b.hitT=.5;
  /* v89 (director 2026-10-06: hits need to feel like they hurt) - a pain face, a recoil and now and then a cry; big hits leave it dizzy */
  var bigH=dmg>=b.max*.1;b.hurtT=Math.max(b.hurtT||0,bigH?.6:.42);if(bigH)b.dizzyT=Math.max(b.dizzyT||0,.9);
  if(!b.ouchAt||time-b.ouchAt>1.3){if(bigH||Math.random()<.5){b.ouchAt=time;var OUCH=['아야!','끄앙!','으앙!','아파!'];b.ouchTxt=b.king?'크헉!':OUCH[Math.floor(Math.random()*OUCH.length)];}}
  burst(b.x-(b.x-from.x)/d*8,b.y-12,'#ffffff',4,true);sfx('chop',.08);
  addFloat(b.x,b.y-30-Math.random()*6,'-'+Math.round(dmg),dmg>=15?'#ffe27a':'#ffffff',true);
  if(b.hp<=0)killBear(b);
}
function separateBear(b,pl){
  if(b.state==='dead'||b.state==='fence'||b.climb>0)return;
  var mind=bearR(b)+10,dx=pl.x-b.x,dy=pl.y-b.y,dd=Math.hypot(dx,dy);
  if(dd<mind&&!pl.inside){if(dd<.5){dx=-b.dir;dy=.3;dd=Math.hypot(dx,dy);}var push=mind-dd,ux=dx/dd,uy=dy/dd,
      hx=pl.x+ux*push*.75,hy=pl.y+uy*push*.75;
    if(walkXY(hx,pl.y))pl.x=hx;if(walkXY(pl.x,hy))pl.y=hy;
    if(b.state==='in'||b.state==='attack'||b.state==='out'){b.x-=ux*push*.25;b.y-=uy*push*.25;if(b.entered&&b.x>fenceX()-14)b.x=fenceX()-14;}}
  agents.forEach(function(a){if(a===pl||a.inside||a.role==='player')return;var wx=a.x-b.x,wy=a.y-b.y,wd=Math.hypot(wx,wy),wm=bearR(b)+6;
    if(wd<wm&&wd>.5&&(b.state==='in'||b.state==='attack')){var wp=(wm-wd);b.x-=wx/wd*wp;b.y-=wy/wd*wp;}});
  BEARS.forEach(function(o){if(o===b||o.state==='dead'||o.climb>0)return;var ox=b.x-o.x,oy=b.y-o.y,od=Math.hypot(ox,oy),om=bearR(b)+bearR(o)-4;
    if(od<om){if(od<.5){ox=Math.random()-.5;oy=Math.random()-.5;od=Math.hypot(ox,oy)||1;}var op=(om-od)*.5;
      if(b.state!=='fence'){b.x+=ox/od*op;b.y+=oy/od*op;}else b.x+=(ox/od)*op;if(b.entered&&b.x>fenceX()-14)b.x=fenceX()-14;if(b.entered&&b.x<4)b.x=4;}});
}
function updateBears(dt){
  if(!huntShown&&huntReady()&&!hasWeapon()){huntShown=true;var a0=agents[0];addFloat(a0.x,a0.y-44,'⚔️ 광장에 무기 발판이 생겼어요!','#ffe27a');sfx('chime');}
  /* seasons */
  var w0=winterStart(),prev=S.season||0;S.season=prev+(tutOn()?0:dt);
  if(prev<w0-20&&S.season>=w0-20){var aw=agents[0];addFloat(aw.x,aw.y-46,'⚠️ 곧 북극곰이 습격해요!','#dff4ff');sfx('chime');}
  if(prev<w0&&S.season>=w0){S.winters=(S.winters||0)+1;var nb=bearCap();bearHintT=time+3.5;raidQ=0;raidT=1;FENCEHP=S.fence&&!S.fenceDown?fenceMax():0;VFBREACH={};VFHP={2:fMaxV(2),3:fMaxV(3)};TOWERHP=S.tower&&!S.towerDown?towerMax():0;
    refundClearedDefensePads();flash=.4;sfx('horn');shake(.7);var aw2=agents[0];addFloat(aw2.x,aw2.y-46,'🐻‍❄️ 곰 습격! 북극곰이 아래에서 몰려와요','#dff4ff');
    if(!STAGEBAN)STAGEBAN={t:1.8,max:1.8,text:'🐻‍❄️ 북극곰 습격!',sub:'망루·사냥꾼이 막아요'};}
  if(S.season>=seasonLen()){S.season=S.season%seasonLen();raidQ=0;VFBREACH={};refundClearedDefensePads();var aw3=agents[0];addFloat(aw3.x,aw3.y-46,liveBears().length?'🛡️ 새로운 곰은 안 와요 · 남은 곰을 무찔러요':'🛡️ 곰 습격이 끝났어요','#c9f5c0');}
  if(isWinter()){raidT-=dt;var rp=raidP();
    if(rp>=.7&&RUSHMSG!==S.winters){RUSHMSG=S.winters;STAGEBAN={t:2.2,max:2.2,text:'🔥 곰 떼가 몰려와요!',sub:'습격 막바지 · 끝까지 버텨요'};bearBanT=time;shake(.6);flash=Math.max(flash,.3);sfx('horn');}
    if(raidT<=0){raidT=raidGap();var capN=bearCapNow();if(liveBears().length<capN){spawnBear();
      /* closing rush: bears arrive in pairs */
      if(rp>=.7&&Math.random()<.35&&liveBears().length<capN)spawnBear();}}}
  if(!FENCEHP&&S.fence&&!S.fenceDown)FENCEHP=fenceMax();if(isWinter()&&!TOWERHP&&S.tower&&!S.towerDown)TOWERHP=towerMax();
  var pl=agents[0];pl.stabT=(pl.stabT||0)-dt;pl.bowT=(pl.bowT||0)-dt;pl.stab=Math.max(0,(pl.stab||0)-dt);pl.aim=Math.max(0,(pl.aim||0)-dt);pl.ultFxT=Math.max(0,(pl.ultFxT||0)-dt);
  /* v86: holding a finger down on a bear (instead of tapping repeatedly) keeps attacking it - easier for young players */
  if(joy.on&&!joy.moved){var hwx=joy.ox/Z+camX,hwy=joy.oy/Z+camY,hBear=null,hBd=70;BEARS.forEach(function(hbb){if(hbb.state==='dead'||hbb.state==='out')return;var hdd=Math.hypot(hwx-hbb.x,hwy-hbb.y);if(hdd<hBd){hBd=hdd;hBear=hbb;}});
    if(hBear){var hpd=Math.hypot(pl.x-hBear.x,pl.y-hBear.y),hwk=wkind(),hrng=heroReach(hBear);
      pl.chaseBear=hBear;
      if(hwk&&hpd<hrng+45&&(!pl.tapAtkT||time-pl.tapAtkT>=.12)){pl.tapAtkT=time;pl.stabT=0;pl.bowT=0;}}}
  for(var k=BEARS.length-1;k>=0;k--){var b=BEARS[k];b.t+=dt;b.flash=Math.max(0,b.flash-dt);b.hurtT=Math.max(0,(b.hurtT||0)-dt);b.dizzyT=Math.max(0,(b.dizzyT||0)-dt);b.kx*=Math.max(0,1-dt*10);b.hitT-=dt;b.swipe=Math.max(0,b.swipe-dt*3);b.roar=Math.max(0,(b.roar||0)-dt);
    if(b.state==='dead'){if(b.t>1)BEARS.splice(k,1);continue;}
    var sp=(b.king?36:(b.boss?22:28))*BEAR_SPX*(b.spm||1)*dt;
    if(b.climb>0){b.climb-=dt;b.bob+=dt*3;b.swipe=Math.max(b.swipe,.3);}
    if(b.state==='fence'){b.dir=b.side==='right'?-1:1;b.swipeT-=dt;b.bob+=dt*4;
      var fv=b.wallV||villageAt(b.x);if(fv!==1){if(!fenceUp(fv)){b.state='in';}else if(b.swipeT<=0){b.swipeT=fenceHold(fv);b.swipe=1;b.ultSwipe=false;VFHP[fv]=(VFHP[fv]||fMaxV(fv))-(b.king?16:(b.boss?9:5))*1.4*bearStrikeMult()*fenceSoft(fv);sfx('chop',.2);shake(.15);burst(b.x,b.side==='bottom'?H+6:b.y,'#b98f5e',5,false);
        if(VFHP[fv]<=0){VFHP[fv]=0;VFBREACH[fv]=1;flash=.3;shake(.8);sfx('nope');addFloat(b.x,H-40,'💥 '+(fv===2?'호수':'광산')+' 마을 성벽이 뚫렸어요!','#ffb3b3');burst(b.x,H-6,'#b98f5e',20,false);save();}}}
      else if(!S.fence||S.fenceDown){b.state='in';}
      else if(b.swipeT<=0){b.swipeT=fenceHold(1);b.swipe=1;b.ultSwipe=false;FENCEHP-=(b.king?16:(b.boss?9:5))*1.4*bearStrikeMult()*fenceSoft(1);sfx('chop',.2);shake(b.boss?.3:.15);burst(b.x,b.side==='bottom'?H+6:b.y,'#b98f5e',5,false);
        if(FENCEHP<=0){FENCEHP=0;S.fenceDown=1;flash=.35;shake(1);sfx('nope');addFloat(MX/2,H-40,'💥 울타리가 부서졌어요! 수리해요','#ffb3b3');burst(MX/2,H-6,'#b98f5e',24,false);save();}}}
    else if(b.state==='in'||b.state==='attack'){
      if(!tValid(b.tgt)){var nt=pickTarget(b);if(nt){b.tgt=nt;b.dmg=0;b.state='in';}else b.state='out';}
      if(b.state!=='out'){
      var tp=tPos(b.tgt),dx=tp.x-b.x,dy=tp.y-b.y,d=Math.hypot(dx,dy);
      if(d>(b.tgt.kind==='worker'?bearR(b)+9:16)){b.state='in';if(b.hitT<=0&&!(b.climb>0)){var ny=b.y+dy/d*sp;
          var nx=b.x+dx/d*sp;if(!blockBearAtFence(b,nx,ny)){b.x=nx;b.y=ny;}b.dir=dx>=0?1:-1;b.bob+=dt*9;}}
      else if(blockBearAtFence(b,tp.x,tp.y)){}
      else{b.state='attack';b.dir=dx>=0?1:-1;b.swipeT-=dt;
        if(b.swipeT<=0){b.swipeT=1.3;b.swipe=1;b.ultSwipe=Math.random()<.18;sfx('chop',.2);burst(tp.x,tp.y-10,'#e2566a',4,false);var T0=b.tgt;
          if(T0.kind==='tower'){TOWERHP-=(b.king?18:(b.boss?10:6))*1.4*bearStrikeMult();TOWERHIT=.35;shake(.2);if(TOWERHP<=0){TOWERHP=0;S.towerDown=1;flash=.35;shake(1);sfx('nope');addFloat(TOWER.x,TOWER.y-30,'💥 망루가 무너졌어요! 수리해요','#ffb3b3');burst(TOWER.x,TOWER.y,'#9a938a',24,false);save();}}
          else if(T0.kind==='cash'){var cn=S.cash[T0.k]||0,tk=Math.min(cn,money50(cn*.4*Math.min(1.6,bearMult())));S.cash[T0.k]=cn-tk;b.stole+=tk;if(tk>0)addFloat(tp.x,tp.y-26,'💸 -'+fmt(tk),'#ffb3b3');}
          else{var st0=Math.min(Math.floor(S.coins),money50(Math.min(S.coins*.03,(40+10*(S.winters||1))*bearMult())));S.coins-=st0;b.stole+=st0;if(st0>0)addFloat(tp.x,tp.y-26,'💸 -'+fmt(st0),'#ffb3b3');
            if(T0.kind==='worker'){T0.a.stunT=b.king?7:4;release(T0.a);b.dmg++;if(b.dmg>=2){b.tgt={kind:'none'};}}}
          if(T0.kind==='purse'){b.dmg++;if(b.dmg>=3)b.tgt={kind:'none'};}}}
      if(b.t>40&&b.state!=='out'&&!b.finale){b.state='out';addFloat(b.x,b.y-30,b.stole?'곰이 돈을 들고 돌아가요!':'곰이 돌아가요','#dff4ff');}}}
    else if(b.state==='out'){var ex=b.ex!==undefined?b.ex:b.x,ey=b.ey!==undefined?b.ey:b.homeY+30,odx=ex-b.x,ody=ey-b.y,od=Math.hypot(odx,ody);b.bob+=dt*9;if(Math.abs(odx)>.5)b.dir=odx>0?1:-1;
      if(od<=sp*1.3+1){if(b.stole>0){S.lost++;}BEARS.splice(k,1);continue;}b.x+=odx/od*sp*1.3;b.y+=ody/od*sp*1.3;}
    /* v89 (director 2026-10-06: the hero must not stand inside the bear while fighting) - push the hero out to the bear's edge,
       and keep bears from piling on each other, so every bear and the hero stay readable */
    separateBear(b,pl);
    blockBearAtFence(b,b.x,b.y);
    if(b.x>=0&&b.x<=fenceX()&&b.y>=0&&b.y<H)b.entered=true;
    /* Lim attacks with alternating punches and kicks at every training level. */
    var pd=Math.hypot(pl.x-b.x,pl.y-b.y),wl=wpnLv();
    if(pd<heroReach(b)&&pl.stabT<=0&&b.state!=='dead'){
      pl.strikeN=(pl.strikeN||0)+1;pl.strikeType=pl.strikeN%3===0?'kick':pl.strikeN%3===2?'punch-left':'punch';
      pl.stabT=Math.max(.28,.5-wl*.012);pl.stab=.32;pl.dir=b.x>=pl.x?1:-1;
      heroAttackHit(pl,b,(4+2.5*wl)*heroDmgMul()*(pl.strikeType==='kick'?1.25:1),false);
    }
    /* lumberjacks chip in with their axes */
    agents.forEach(function(a){if(a.role!=='lumber'||b.state==='dead')return;if(Math.hypot(a.x-b.x,a.y-b.y)>30)return;
      a.fightT=(a.fightT||0)-dt;if(a.fightT<=0){a.fightT=.7;hitBear(b,a,.5+.3*tierOf('axe',a.gear.axe||0),false);}});
  }
  for(var j=ARROWS.length-1;j>=0;j--){var ar=ARROWS[j];if(ar.delay>0){ar.delay-=dt;continue;}
    if(ar.tw&&ar.tw!=='arrow'){var tb3=ar.b;if(tb3.state==='dead'||tb3.state==='out'){var nb=null,nd=1e9;liveBears().forEach(function(x){if(x.state==='dead'||x.state==='out')return;var d=Math.hypot(x.x-ar.x,x.y-ar.y);if(d<nd){nd=d;nb=x;}});if(nb)ar.b=tb3=nb;}
      var ex3=tb3.x-ar.x,ey3=tb3.y-8-ar.y,ed3=Math.hypot(ex3,ey3)||1,st3=TSPEED[ar.tw]*dt;if(!ar.d0)ar.d0=ed3+1;ar.t+=dt;ar.ang=Math.atan2(ey3,ex3);ar.k=Math.max(0,Math.min(1,1-ed3/ar.d0));
      if(ar.tw==='rocket'&&Math.random()<.7)parts.push({x:ar.x,y:ar.y-Math.sin(ar.k*Math.PI)*Math.min(30,ar.d0*.12),vx:(Math.random()-.5)*10,vy:-6,g:-10,life:.5,max:.5,col:'rgba(210,210,210,.8)',r:2});
      if(ed3<=st3+2||ar.t>4){if(tb3.state!=='dead'&&tb3.state!=='out'){var R2=TSPLASH[ar.tw];BEARS.forEach(function(b2){if(b2.state==='dead'||b2.state==='out')return;var dd=Math.hypot(b2.x-tb3.x,b2.y-tb3.y);if(b2===tb3||dd<R2)hitBear(b2,{x:ar.x,y:ar.y},ar.dmg*(b2===tb3?1:.6),true);});}
        burst(tb3.x,tb3.y-8,ar.tw==='stone'?'#b9b2a4':'#ffb14a',ar.tw==='stone'?8:16,true);if(ar.tw!=='stone'){burst(tb3.x,tb3.y-8,'#6b6258',8,false);flash=Math.max(flash,.12);}ARROWS.splice(j,1);continue;}
      ar.x+=ex3/ed3*st3;ar.y+=ey3/ed3*st3;continue;}
    var tb=ar.b,ex=tb.x-ar.x,ey=tb.y-14-ar.y,ed=Math.hypot(ex,ey),st2=(ar.gun?620:280)*dt;ar.t+=dt;ar.ang=Math.atan2(ey,ex);
    if(tb.state==='dead'||ar.t>(ar.tw?2.5:1.2)){ARROWS.splice(j,1);continue;}
    if(ed<=st2+2){hitBear(tb,{x:ar.x,y:ar.y},ar.dmg||bowDmg(),true);ARROWS.splice(j,1);continue;}
    ar.x+=ex/ed*st2;ar.y+=ey/ed*st2;}
  for(var i=LOOT.length-1;i>=0;i--){var L=LOOT[i];L.t+=dt;L.life-=dt;
    if(L.z>0||L.vz>0){L.z+=L.vz*dt;L.vz-=260*dt;L.x+=L.vx*dt;L.y+=L.vy*dt;if(L.z<=0){L.z=0;L.vz=0;L.vx=L.vy=0;}}
    else if(L.t>.4&&Math.hypot(pl.x-L.x,pl.y-L.y)<34&&bagN(pl)<cap()){pl.bag[L.id]=(pl.bag[L.id]||0)+1;var tp2=stackTop(pl);fly(L.id,L.x,L.y-6,tp2.x,tp2.y,.3);sfx('pickup',.05);LOOT.splice(i,1);continue;}
    if(L.life<=0)LOOT.splice(i,1);}
}
function drawArrows(){ARROWS.forEach(function(ar){if(ar.delay>0)return;if(ar.tw&&ar.tw!=='arrow'){var hh=Math.sin((ar.k||0)*Math.PI)*Math.min(ar.tw==='rocket'?30:60,(ar.d0||100)*(ar.tw==='rocket'?.12:.25)),yy=ar.y-hh;
    ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(ar.x,ar.y+4,3,1.2,0,0,7);ctx.fill();
    if(ar.tw==='stone'){ctx.fillStyle='#8a8078';ctx.beginPath();blob(ctx,ar.x,yy,3.4);ctx.fill();ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.arc(ar.x-1,yy-1,1.2,0,7);ctx.fill();}
    else if(ar.tw==='rocket'){ctx.save();ctx.translate(ar.x,yy);ctx.rotate(ar.ang||0);ctx.fillStyle='#ff9a3c';ctx.beginPath();ctx.moveTo(-6,-1.6);ctx.lineTo(-10-Math.random()*3,0);ctx.lineTo(-6,1.6);ctx.closePath();ctx.fill();ctx.fillStyle='#e8ecf0';rr(ctx,-6,-1.8,9,3.6,1.5);ctx.fill();ctx.fillStyle='#e2463c';ctx.beginPath();ctx.moveTo(3,-1.8);ctx.lineTo(6,0);ctx.lineTo(3,1.8);ctx.closePath();ctx.fill();ctx.restore();}
    else if(ar.tw==='laser'){ctx.save();ctx.translate(ar.x,yy);ctx.rotate(ar.ang||0);ctx.strokeStyle='rgba(140,245,255,.95)';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(6,0);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(6,0);ctx.stroke();ctx.restore();}
    else if(ar.tw==='plasma'){ctx.fillStyle='rgba(216,120,255,.9)';ctx.beginPath();ctx.arc(ar.x,yy,4,0,7);ctx.fill();ctx.fillStyle='#f0c8ff';ctx.beginPath();ctx.arc(ar.x,yy,1.8,0,7);ctx.fill();}
    else{ctx.fillStyle='#2b2f36';ctx.beginPath();ctx.arc(ar.x,yy,2.8,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(ar.x-.9,yy-.9,.9,0,7);ctx.fill();}
    return;}
  if(ar.gold){ctx.save();ctx.translate(ar.x,ar.y);ctx.rotate(ar.ang||0);ctx.fillStyle='rgba(255,226,122,.45)';ctx.fillRect(-18,-2,18,4);ctx.fillStyle='#ffe27a';ctx.beginPath();ctx.arc(0,0,3,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(.5,0,1.3,0,7);ctx.fill();ctx.restore();return;}
  if(ar.gun){ctx.save();ctx.translate(ar.x,ar.y);ctx.rotate(ar.ang||0);ctx.fillStyle='rgba(255,210,90,.5)';ctx.fillRect(-10,-1,10,2);ctx.fillStyle='#fff6c8';ctx.beginPath();ctx.arc(0,0,1.8,0,7);ctx.fill();ctx.restore();return;}ctx.save();ctx.translate(ar.x,ar.y);ctx.rotate(ar.ang||0);ctx.strokeStyle='#7a5a3c';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(4,0);ctx.stroke();
  if(ar.fire){ctx.fillStyle='rgba(255,140,40,.85)';ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(-6-Math.random()*4,-2.4);ctx.lineTo(-4,0);ctx.lineTo(-6-Math.random()*4,2.4);ctx.closePath();ctx.fill();}
  ctx.fillStyle=ar.hero?'#ffd34a':TOOL_COL[ptier('bow')];ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(2.5,-2);ctx.lineTo(2.5,2);ctx.closePath();ctx.fill();ctx.fillStyle='#f3ead8';ctx.fillRect(-9,-1.8,3,1.2);ctx.fillRect(-9,.6,3,1.2);ctx.restore();});}
/* the thing a bear is chewing on: warning mark + how close it is to losing a level */
function drawBearTargets(){BEARS.forEach(function(b){if(b.state!=='attack'&&b.state!=='in')return;var p=tPos(b.tgt),yy=p.y-(b.tgt.kind==='worker'?36:30),k=Math.max(0,1-b.dmg/BEAR_HIT);
  var bl=Math.floor(time*4)%2===0;ctx.font='700 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';if(bl||b.state==='attack')ctx.fillText('⚠️',p.x,yy-8);
  if(b.state==='attack'||b.dmg>0){ctx.fillStyle='rgba(0,0,0,.35)';rr(ctx,p.x-14,yy,28,4,2);ctx.fill();ctx.fillStyle=k>.4?'#7cc0f5':'#ff8a3c';rr(ctx,p.x-14,yy,Math.max(1.5,28*k),4,2);ctx.fill();ctx.font='700 7px sans-serif';ctx.fillText('🛡️',p.x-19,yy+2);}});}
/* player weapons drawn while fighting */
function drawWpn(g,kind,t,swing,flashOn,ult){
  if(kind==='axe'){g.save();g.rotate(-.5+swing*(ult?2.3:1.6));drawAxe(g,0,-2,0,t,ult?1.18:.95);
    if(!ult&&swing>.05){g.strokeStyle='rgba(255,255,255,'+Math.min(.85,swing*1.1)+')';g.lineWidth=1.8;g.beginPath();g.arc(0,-2,11,-1.9,1.2);g.stroke();}
    if(ult){g.strokeStyle='rgba(255,210,110,.9)';g.lineWidth=2.6;g.beginPath();g.arc(0,-2,12,-2.1,1.6);g.stroke();g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=1.4;g.beginPath();g.arc(0,-2,16,-2.3,1.8);g.stroke();g.fillStyle='rgba(255,170,60,.55)';g.beginPath();g.arc(9,-9,3.2,0,7);g.fill();}
    g.restore();}
  else if(kind==='spear'){var th=swing*8;g.fillStyle='#8a6440';g.fillRect(-10+th,-1,22,2);
    g.fillStyle=TOOL_COL[t];g.beginPath();g.moveTo(18+th,0);g.lineTo(11+th,-3.2);g.lineTo(11+th,3.2);g.closePath();g.fill();g.fillStyle='#e2463c';g.fillRect(9+th,-1.6,2,3.2);
    if(!ult&&th>1){g.strokeStyle='rgba(255,255,255,'+Math.min(.75,th*.12)+')';g.lineWidth=1.6;g.beginPath();g.moveTo(2+th,0);g.lineTo(-6,0);g.stroke();}
    if(ult){g.fillStyle='rgba(255,140,40,.92)';g.beginPath();g.moveTo(18+th,0);g.lineTo(31+th+Math.random()*7,-4);g.lineTo(25+th,0);g.lineTo(31+th+Math.random()*7,4);g.closePath();g.fill();g.fillStyle='rgba(255,220,140,.8)';g.beginPath();g.arc(18+th,0,3.4,0,7);g.fill();}}
  else if(kind==='gun'){g.fillStyle='#7a4d2b';g.beginPath();g.moveTo(-9,-1);g.lineTo(0,-2);g.lineTo(0,2);g.lineTo(-8,4);g.closePath();g.fill();
    g.fillStyle=t>=4?'#e0b23c':'#5d6670';g.fillRect(-1,-2.2,18,2.6);g.fillStyle=t>=4?'#fff3b0':'#9aa5b1';g.fillRect(-1,-2.2,18,.8);
    g.fillStyle='#3a3f45';g.fillRect(2,.2,3,2.6);
    if(flashOn){g.fillStyle='#fff1a8';g.beginPath();for(var i=0;i<8;i++){var an=i/8*6.283,r=i%2?2.5:6;g.lineTo(19+Math.cos(an)*r,-1+Math.sin(an)*r);}g.closePath();g.fill();}
    if(ult){g.fillStyle='rgba(255,120,30,.92)';g.beginPath();g.moveTo(17,-1);g.lineTo(32+Math.random()*9,-4.5);g.lineTo(26,0);g.lineTo(32+Math.random()*9,4.5);g.closePath();g.fill();g.fillStyle='rgba(255,225,150,.85)';g.beginPath();g.arc(17,0,4.4,0,7);g.fill();}}
}
function drawWeapon(a,by){
  if(a.role==='player')return false;
  if(!hasWeapon())return false;var near=bearNear(a,150);if(!near&&!(a.stab>0)&&!(a.aim>0))return false;
  var wk=wkind();ctx.save();ctx.translate(a.x+a.dir*9,a.y-14+by);ctx.scale(a.dir,1);
  drawWpn(ctx,wk,wtier(),wk==='axe'?(a.stab>0?Math.sin(a.stab/.3*Math.PI):0):(a.stab>0?Math.sin(a.stab/.22*Math.PI):0),a.aim>.12,(a.ultFxT||0)>0);
  ctx.restore();return true;
}
/* v66 (director): the weapon is always visible - slung on the hero's back when there is no bear to fight */
function drawWeaponBack(a,by){var wk=wkind();ctx.save();ctx.translate(a.x-a.dir*5,a.y-12+by);ctx.scale(-a.dir*.8,.8);ctx.rotate(wk==='gun'?-.9:-1.1);drawWpn(ctx,wk,wtier(),0,false);ctx.restore();}
/* v66: the hero's outfit grows with the weapon level - red cape (Lv4+), golden pauldrons and plume (Lv8+), golden aura and crown (Lv12+) */
function drawHeroGear(a,by,front){var L=wpnLv(),d=a.dir,x=a.x,y=a.y+by-5.5,g=ctx,sc=a.sc||1;
  if(!front){if(L>=12){var pu=(Math.sin(time*3)+1)/2;g.fillStyle='rgba(255,226,122,'+(.16+.12*pu)+')';g.beginPath();g.arc(x,y-4,17*sc,0,7);g.fill();}
    if(L>=4){var fl=Math.sin(time*5+(a.mv?a.bob:0))*1.6;g.fillStyle=L>=8?'#8a1f2e':'#c8302f';g.beginPath();g.moveTo(x-d*2-5,y-8);g.lineTo(x-d*2+5,y-8);g.quadraticCurveTo(x-d*8,y+4,x-d*12+fl,y+10);g.lineTo(x-d*4,y+9);g.closePath();g.fill();if(L>=8){g.strokeStyle='#e0b23c';g.lineWidth=.8;g.stroke();}}return;}
  if(L>=8){g.fillStyle='#e0b23c';[-1,1].forEach(function(s2){g.beginPath();g.ellipse(x+s2*7,y-5,3.6,2.2,s2*.4,0,7);g.fill();});g.fillStyle='#e2463c';g.beginPath();g.moveTo(x+d*1,y-16);g.quadraticCurveTo(x-d*6,y-22+Math.sin(time*6),x-d*9,y-15);g.lineTo(x,y-14);g.closePath();g.fill();}
  if(L>=12){var cy=y-15.5;g.fillStyle='#f0bb3f';g.fillRect(x-4.5,cy,9,2);for(var cp=-4;cp<=4;cp+=2.6){g.beginPath();g.moveTo(x+cp-1,cy+.5);g.lineTo(x+cp,cy-3.5);g.lineTo(x+cp+1,cy+.5);g.closePath();g.fill();}g.fillStyle='#4fb3a0';g.beginPath();g.arc(x,cy+1,.8,0,7);g.fill();}}
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
  for(var x=4;x<MX;x+=12){if(inGap(x))continue;var sh=0;BEARS.forEach(function(b){if(b.state==='fence'&&Math.abs(b.x-x)<24)sh=Math.sin(time*40)*1.2;});
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
  var g=ctx,s=b.king?1.6:(b.boss?1.35:1),al=b.state==='dead'?Math.max(0,1-b.t):1,step=Math.sin(b.bob),x=b.x+b.kx;
  g.save();g.globalAlpha=al;g.translate(x,b.y);
  g.fillStyle='rgba(0,0,0,.16)';g.beginPath();g.ellipse(0,1,17*s,5*s,0,0,7);g.fill();
  if(b.state!=='dead'){var pr=(time*1.6)%1,pc=b.king?'214,52,70':'232,38,48';
    g.strokeStyle='rgba('+pc+',.95)';g.lineWidth=3;g.beginPath();g.arc(0,-14*s,13*s+Math.sin(time*5)*1.6*s,0,7);g.stroke();
    g.strokeStyle='rgba('+pc+','+(0.7*(1-pr))+')';g.lineWidth=2.2;g.beginPath();g.arc(0,-14*s,10*s+pr*22*s,0,7);g.stroke();}
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

/* ---------- input: all purchases require standing on the matching world pad ---------- */
var PILLS=[],DEF={},tapFx=null;
var TOUCHES={},PINCH=null,PINCH_USED=false,CAMERA_HELD=false;
function zoomRange(){return {min:Math.min(W/(W+192),SH/HT),max:ZOOM_IN*1.5};}
function zoomTarget(){var r=zoomRange();return !Number.isFinite(S.manualZoom)?(S.zoomOut?r.min:ZOOM_IN):Math.max(r.min,Math.min(r.max,S.manualZoom));}
function touchPair(){return Object.keys(TOUCHES).slice(0,2).map(function(id){return TOUCHES[id];});}
function registerTouch(e){
  if(e.pointerType!=='touch'||TITLE||(storyBox&&!storyBox.hidden))return false;
  TOUCHES[e.pointerId]=wpt(e);try{cv.setPointerCapture(e.pointerId);}catch(_e){}
  if(Object.keys(TOUCHES).length<2)return PINCH_USED;
  e.preventDefault();if(!PINCH){endJoy();var a=agents[0];a.tap=null;a.path=[];a.chaseBear=null;a.mv=false;a.moving=false;a.padDwell=0;
    var pair=touchPair(),mid={x:(pair[0].x+pair[1].x)/2,y:(pair[0].y+pair[1].y)/2};PINCH={distance:Math.max(1,Math.hypot(pair[0].x-pair[1].x,pair[0].y-pair[1].y)),zoom:Z,x:camX+mid.x/Z,y:camY+mid.y/Z};PINCH_USED=true;CAMERA_HELD=true;}
  return true;
}
function moveTouch(e){
  if(!TOUCHES[e.pointerId])return false;TOUCHES[e.pointerId]=wpt(e);if(!PINCH)return PINCH_USED;
  e.preventDefault();var pair=touchPair();if(pair.length<2)return true;
  var r=zoomRange(),distance=Math.hypot(pair[0].x-pair[1].x,pair[0].y-pair[1].y);Z=Math.max(r.min,Math.min(r.max,PINCH.zoom*distance/PINCH.distance));S.manualZoom=Z;S.zoomOut=Z<=r.min+.02;
  var mx=(pair[0].x+pair[1].x)/2,my=(pair[0].y+pair[1].y)/2;camX=camClampX(PINCH.x-mx/Z);camY=camClampY(PINCH.y-my/Z);return true;
}
function endTouch(e){
  if(!e||!TOUCHES[e.pointerId])return false;delete TOUCHES[e.pointerId];var used=PINCH_USED;
  if(Object.keys(TOUCHES).length<2)PINCH=null;
  if(!Object.keys(TOUCHES).length){PINCH_USED=false;if(used){endJoy();save();}}
  return used;
}
function wpt(e){var b=cv.getBoundingClientRect();return {x:(e.clientX-b.left)/b.width*W,y:(e.clientY-b.top)/b.height*SH};}
function siteAt(x,y){for(var i=0;i<SITES.length;i++){var st=SITES[i];if(x>=st.x&&x<st.x+st.w&&y>=st.y&&y<st.y+st.h)return st;}return null;}
cv.addEventListener('pointerdown',function(e){
  if(registerTouch(e))return;
  if(joy.on||e.isPrimary===false||(e.pointerType==='mouse'&&e.button!==0)||TITLE||(storyBox&&!storyBox.hidden))return;
  e.preventDefault();audioInit();idleT=0;
  if(ENDSEQ){ENDSEQ.t=ENDSEQ.dur[ENDSEQ.scene]||3;return;}
  if(!setP.hidden){setP.hidden=true;gearBtn.setAttribute('aria-expanded','false');}
  if(!dexBox.hidden){dexBox.hidden=true;return;}
  if(!dayBox.hidden){dayBox.hidden=true;return;}
  var p=wpt(e),pw={x:p.x/Z+camX,y:p.y/Z+camY};
  var hit=null,hd=1e9;
  PILLS.forEach(function(b){var px=Math.max(4,(40-b.w)/2),py=Math.max(4,(40-b.h)/2);
    if(pw.x>=b.x-px&&pw.x<=b.x+b.w+px&&pw.y>=b.y-py&&pw.y<=b.y+b.h+py){var d=Math.hypot(pw.x-(b.x+b.w/2),pw.y-(b.y+b.h/2));if(d<hd){hd=d;hit=b;}}});
  /* v66: the next-village goals now open from the 🔒 sign by the fence (the header button was removed) */
  var onSign=!hit&&SIGNP&&goalList()&&Math.hypot(pw.x-SIGNP.x,pw.y-SIGNP.y)<26;if(!onSign&&!goalBox.hidden)goalBox.hidden=true;
  if(onSign){goalKey='';refreshGoal();goalBox.style.left='12px';goalBox.style.top='110px';goalBox.hidden=!goalBox.hidden;sfx('tap');return;}
  if(hit){var b=hit;
    if(b.d.isMax())addFloat(pw.x,pw.y-8,'최고 단계예요','#ffffff');
    else if(!b.d.canBuy()){sfx('nope');addFloat(pw.x,pw.y-8,b.d.why?b.d.why():'코인이 부족해요','#ffb3b3');}
    else buy(b.d);
    return;}
  /* v80: tapping a nearby bear attacks right away instead of waiting out the auto-attack cooldown - fast repeated taps keep the hero swinging */
  /* v83: tap radius on a bear widened (50->70) and the instant-attack buffer widened (+30->+45) - easier for small, imprecise taps to land */
  /* v86: if the tap landed on (or right next to) a level-up/world pad, treat it as pad-directed movement, not a bear attack -
     otherwise a pad standing near a bear could never be reached while chasing/fighting that bear */
  var padHitP=false;for(var pdi=0;pdi<PADLIST.length;pdi++){if(Math.hypot(pw.x-PADLIST[pdi].x,pw.y-PADLIST[pdi].y)<28){padHitP=true;break;}}
  var tapB=null,tapBd=70;if(!padHitP)BEARS.forEach(function(bb){if(bb.state==='dead'||bb.state==='out')return;var dd=Math.hypot(pw.x-bb.x,pw.y-bb.y);if(dd<tapBd){tapBd=dd;tapB=bb;}});
  if(tapB){var plT=agents[0],pdT=Math.hypot(plT.x-tapB.x,plT.y-tapB.y),wkT=wkind(),rngT=heroReach(tapB);
    plT.chaseBear=tapB;plT.chaseT=0;
    if(wkT&&pdT<rngT+45&&(!plT.tapAtkT||time-plT.tapAtkT>=.12)){plT.tapAtkT=time;plT.stabT=0;plT.bowT=0;sfx('tap');return;}}
  try{cv.setPointerCapture(e.pointerId);}catch(_e){}
  var pl=agents[0];pl.path=[];
  pl.tap=null;if(!tapB)pl.chaseBear=null;
  joy={on:true,ox:p.x,oy:p.y,dx:0,dy:0,id:e.pointerId,t0:performance.now(),moved:false};
});
cv.addEventListener('pointermove',function(e){if(moveTouch(e))return;if(!joy.on||e.pointerId!==joy.id)return;var p=wpt(e);joy.dx=p.x-joy.ox;joy.dy=p.y-joy.oy;if(Math.hypot(joy.dx,joy.dy)>9*screenUnit)joy.moved=true;});
function lineClear(x0,y0,x1,y1){var d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/4);for(var i=1;i<=n;i++){if(!walkXY(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n))return false;}return true;}
function setTap(wx,wy){idleT=0;var a0=agents[0];
  if(!walkXY(wx,wy)){var best=null,bd=1e9;for(var r=4;r<130&&!best;r+=4)for(var k=0;k<16;k++){var an=k/16*6.283,px=wx+Math.cos(an)*r,py=wy+Math.sin(an)*r;if(walkXY(px,py)){var dd=Math.hypot(px-wx,py-wy);if(dd<bd){bd=dd;best={x:px,y:py};}}}if(!best)return;wx=best.x;wy=best.y;}
  a0.tap={x:wx,y:wy};a0.tapStuck=0;a0.path=[];release(a0);
  if(!lineClear(a0.x,a0.y,wx,wy)){var tt=tileAt(wx,wy);if(tt)goTile(a0,tt);}
  sfx('tap');}
function repairFenceAt(x,y){var pad=PADLIST.filter(function(p){return p.perimeter&&(p.d.fix==='fence'||p.d.vfRepair||p.perimeter.floating)&&Math.hypot(p.x-x,p.y-y)<24;})[0];if(!pad)return false;if(!padReady(pad)){sfx('nope');addFloat(pad.x,pad.y-26,'코인이 부족해요','#ffb3b3');return true;}var paid=(S.pads&&S.pads[pad.id])||0;S.coins+=paid;if(S.pads)delete S.pads[pad.id];buy(pad.d,true);fencePadAnchor=null;return true;}
function endJoy(e){if(joy.on&&(!e||e.pointerId===joy.id)){if(e&&e.type==='pointerup'&&!joy.moved&&performance.now()-joy.t0<450){var wx=joy.ox/Z+camX,wy=joy.oy/Z+camY;if(!repairFenceAt(wx,wy))setTap(wx,wy);}joy.on=false;joy.dx=joy.dy=0;}}
function endPointer(e){if(!endTouch(e))endJoy(e);}
cv.addEventListener('pointerup',endPointer);cv.addEventListener('pointercancel',endPointer);
cv.addEventListener('lostpointercapture',endPointer);
cv.addEventListener('contextmenu',function(e){e.preventDefault();});
function cancelControl(){
  var touchIds=Object.keys(TOUCHES);TOUCHES={};PINCH=null;PINCH_USED=false;CAMERA_HELD=false;touchIds.forEach(function(id){if(cv.hasPointerCapture(Number(id)))cv.releasePointerCapture(Number(id));});
  var id=joy.id;endJoy();
  if(id!=null&&cv.hasPointerCapture(id))cv.releasePointerCapture(id);
  var a=agents[0];if(a){a.tap=null;a.path=[];a.chaseBear=null;a.moving=false;a.mv=false;a.padDwell=0;}
}
window.addEventListener('blur',cancelControl);
/* Opening controls with another finger cancels the active walking gesture. */
document.addEventListener('pointerdown',function(e){if(e.target!==cv)cancelControl();},{capture:true});
document.addEventListener('pointerdown',function(){audioInit();},{capture:true});
var modeBtn=document.getElementById('mode');
/* v53: joystick sensitivity - how far you drag before the hero reaches full speed (S.sens: 0 slow, 1 normal, 2 fast; older saves default to normal) */
var SENS_D=[32,20,13],SENS_N=['🐢 느리게','🎚️ 보통','🐇 빠르게'],sensBtn=document.getElementById('sensBtn');
function syncSens(){var v=S.sens==null?1:S.sens;sensBtn.textContent=SENS_N[v];}
sensBtn.addEventListener('click',function(){S.sens=((S.sens==null?1:S.sens)+1)%3;syncSens();save();sfx('tap');});
syncSens();
/* v53: title screen - the world is drawn behind it but nothing runs until the player taps start */
var TITLE=true,titleEl=document.getElementById('title'),startBtn=document.getElementById('startBtn');
/* Four supplied illustrations are optional until their source is confirmed. Never substitute unrelated art. */
var introFrames=Array.isArray(window.INTRO_SCENES)?window.INTRO_SCENES:[],introIndex=0,introReady=false;
var introImage=document.getElementById('introImage'),introBack=document.getElementById('introBack'),introSkip=document.getElementById('introSkip'),introDots=document.getElementById('introDots');
function introPaint(){var frame=introFrames[introIndex];introImage.src=frame.src;introImage.alt=frame.alt;introBack.hidden=introIndex===0;introSkip.hidden=false;startBtn.textContent=introIndex===3?'▶':'›';startBtn.setAttribute('aria-label',introIndex===3?'책 속 세계에서 게임 시작':'다음 장면');introDots.textContent='';for(var i=0;i<4;i++){var dot=document.createElement('span');dot.className=i===introIndex?'current':'';introDots.appendChild(dot);}}
function introLoad(){if(!FRESH||introFrames.length!==4)return;Promise.all(introFrames.map(function(frame){return new Promise(function(resolve,reject){var im=new Image();im.onload=resolve;im.onerror=reject;im.src=frame.src;});})).then(function(){if(!TITLE)return;introReady=true;introImage.hidden=false;titleEl.classList.add('illustrated');introPaint();}).catch(function(){introReady=false;introImage.hidden=true;introBack.hidden=true;introSkip.hidden=true;startBtn.setAttribute('aria-label','게임 시작');});}
introBack.addEventListener('click',function(){if(introReady&&introIndex>0){introIndex--;introPaint();}});
introSkip.addEventListener('click',function(){introIndex=3;startBtn.click();});
if(!FRESH)startBtn.setAttribute('aria-label','저장한 게임 이어하기');
introLoad();
/* Story scenes are short, replayable town prologues. Seen flags are save-local and optional for old saves. */
var STORY_SCENES=[
 {id:1,title:'1장 · 숲속마을 — 불씨를 지키는 숲',headline:'마지막 불씨와 파란 뿌리',land:'🌲',cloud:'❄️',lines:[
  {who:'이야기꾼',face:'📜',text:'부모님과 침대에서 책을 읽던 남자아이가 반짝이는 책장 속으로 들어왔어요. 눈앞에는 책에서 보던 겨울 숲이 펼쳐졌지요.'},
  {who:'나무꾼 모모',face:'🪓',text:'장작은 필요하지만 나무를 베기만 하면 숲이 더 아파져요. 묘목도 함께 심어야 해요.'},
  {who:'남자아이',face:'🧒',text:'책 속에서 본 파란 뿌리가 여기에도 있어요! 저는 이 숲에 온 아이예요. 부모님께 돌아갈 길을 찾는 동안 마을을 도울게요.'},
  {who:'나무꾼 모모',face:'🪓',text:'숲을 다시 숨 쉬게 해줘요. 그러면 눈 녹은 물길도 어딘가로 이어질 거예요.'}
 ]},
 {id:2,title:'2장 · 호수마을 — 얼음 아래의 물길',headline:'얼음 밑에서 들려온 물소리',land:'🌊',cloud:'❄️',lines:[
  {who:'낚시꾼 여울',face:'🎣',text:'호수는 꽁꽁 얼었는데, 얼음 아래에서 물 흐르는 소리가 들려요.'},
  {who:'나무꾼 모모',face:'🪵',text:'숲에서 가져온 목재로 수문과 다리를 고칠게요. 물길을 다시 열어봐요.'},
  {who:'낚시꾼 여울',face:'🐟',text:'따뜻한 물이 돌아오자 물고기들이 나타났어요! 물은 산 아래에서 흘러오고 있어요.'},
  {who:'남자아이',face:'🧒',text:'책에서 본 별빛 길이 북쪽 산으로 이어져요. 마을을 도우며 따라가면 집으로 돌아갈 단서도 찾을 수 있겠죠?'}
 ]},
 {id:3,title:'3장 · 광산마을 — 산속에서 깨어난 빛',headline:'돌 속에 잠든 별빛',land:'⛏️',cloud:'✨',lines:[
  {who:'광부 단풍',face:'⛏️',text:'이 광맥을 보세요. 호수 얼음 아래에서 본 것과 똑같은 푸른빛이에요.'},
  {who:'제련공 보리',face:'🔥',text:'제련소의 불을 다시 붙이면, 갱도 깊은 곳의 오래된 보일러도 깨울 수 있을 거예요.'},
  {who:'사냥꾼 임꺽정',face:'🥋',text:'세 마을의 등불이 산 너머까지 이어졌어요. 하지만 저 눈보라 속에서 큰 그림자가 다가와요.'},
  {who:'남자아이',face:'🧒',text:'부모님이 읽어주신 이야기처럼 우리도 함께하면 돼요. 이 불빛을 지키고, 산 너머 다음 책장을 찾아가요!'}
 ]}
];
var storyBox=document.getElementById('storyBox'),storyBook=document.getElementById('storyBook'),storyPlayer=document.getElementById('storyPlayer'),storyList=document.getElementById('storyList'),storyMode='auto',storyScene=null,storyLine=0,storyTyping=null,storyTypingText='';
function storySeen(){if(!S.storySeen||typeof S.storySeen!=='object'||Array.isArray(S.storySeen))S.storySeen={};return S.storySeen;}
function storyTypingClear(){if(storyTyping){clearInterval(storyTyping);storyTyping=null;}}
function storyRenderList(){storyList.innerHTML='';var max=Math.min(3,Math.max(1,S.stage||1));STORY_SCENES.forEach(function(sc){var b=document.createElement('button');b.type='button';b.className='storyChapterBtn';b.disabled=sc.id>max;
  var title=document.createElement('b');title.textContent=(sc.id>max?'🔒 ':'📖 ')+sc.title;b.appendChild(title);var sm=document.createElement('small');sm.textContent=sc.id>max?'마을을 열면 이야기를 읽을 수 있어요':(storySeen()[sc.id]?'다시 읽기 · 이야기를 끝내면 읽음 표시':'이야기를 읽어보기');b.appendChild(sm);if(sc.id<=max)b.addEventListener('click',function(){storyStart(sc.id,'book');});storyList.appendChild(b);});}
function storyBookOpen(){cancelControl();storyMode='book';storyTypingClear();storyPlayer.hidden=true;storyBook.hidden=false;storyRenderList();storyBox.hidden=false;setP.hidden=true;gearBtn.setAttribute('aria-expanded','false');goalBox.hidden=true;dayBox.hidden=true;dexBox.hidden=true;sfx('tap');}
function storyFinish(mark){storyTypingClear();if(mark&&storyScene)storySeen()[storyScene.id]=1;if(mark)save();if(storyMode==='book'){storyPlayer.hidden=true;storyBook.hidden=false;storyRenderList();}else{storyBox.hidden=true;}sfx('tap');}
function storyCloseNow(){storyTypingClear();storyBox.hidden=true;sfx('tap');}
function storyPaintLine(){if(!storyScene)return;storyTypingClear();var ln=storyScene.lines[storyLine];document.getElementById('storyAvatar').textContent=ln.face;document.getElementById('storySpeakerName').textContent=ln.who;var out=document.getElementById('storyText');storyTypingText=ln.text;out.textContent='';var i=0;storyTyping=setInterval(function(){i++;out.textContent=storyTypingText.slice(0,i);if(i>=storyTypingText.length)storyTypingClear();},22);document.getElementById('storyProgress').textContent='대화 '+(storyLine+1)+' / '+storyScene.lines.length;document.getElementById('storyNext').textContent=storyLine===storyScene.lines.length-1?'이야기 마치기':'다음';}
function storyStart(id,mode){cancelControl();storyScene=STORY_SCENES.filter(function(x){return x.id===id;})[0];if(!storyScene)return;storyMode=mode||'auto';storyLine=0;storyTypingClear();storyBook.hidden=true;storyPlayer.hidden=false;storyBox.hidden=false;
  var art=document.getElementById('storyArt');art.setAttribute('data-scene',String(id));document.getElementById('storyLandscape').textContent=storyScene.land;document.getElementById('storyCloud').textContent=storyScene.cloud;document.getElementById('storyChapter').textContent=storyScene.title;document.getElementById('storyHeadline').textContent=storyScene.headline;document.getElementById('storyKicker').textContent='포근한 숲속 마을 · 이야기 장면';document.getElementById('storySkip').textContent=storyMode==='auto'?'건너뛰기':'목록으로';storyPaintLine();sfx('chime');}
document.getElementById('storyNext').addEventListener('click',function(){if(storyTyping){storyTypingClear();document.getElementById('storyText').textContent=storyTypingText;return;}if(storyLine<storyScene.lines.length-1){storyLine++;storyPaintLine();sfx('tap');}else storyFinish(true);});
document.getElementById('storySkip').addEventListener('click',function(){if(storyMode==='book'){storyTypingClear();storyPlayer.hidden=true;storyBook.hidden=false;storyRenderList();}else storyFinish(true);});
document.getElementById('storyClose').addEventListener('click',storyCloseNow);
storyBox.addEventListener('pointerdown',function(e){e.stopPropagation();});
document.addEventListener('keydown',function(e){if(storyBox.hidden)return;if(e.key==='Escape'){e.preventDefault();storyCloseNow();}else if(e.key==='Enter'||e.key===' '){if(!storyBook.hidden)return;e.preventDefault();document.getElementById('storyNext').click();}});
document.getElementById('storyOpen').addEventListener('click',storyBookOpen);
function firstTownStory(){var v=Math.min(3,Math.max(1,S.stage||1));if(v>1&&!storySeen()[v])storyStart(v,'auto');}
startBtn.addEventListener('click',function(){audioInit();if(introReady&&introIndex<3){introIndex++;introPaint();return;}TITLE=false;titleEl.hidden=true;document.getElementById('quickDock').hidden=false;last=performance.now();sfx('chime');firstTownStory();});
var endingEl=document.getElementById('ending'),endBtn=document.getElementById('endBtn');
endBtn.addEventListener('click',function(){startOver();});
var gearBtn=document.getElementById('gear'),setP=document.getElementById('setp');
var ngBtn=document.getElementById('newGame'),ngArm=false;
ngBtn.addEventListener('click',function(){
  if(!ngArm){ngArm=true;ngBtn.classList.add('armed');ngBtn.textContent='한 번 더 누르면 새로 시작';setTimeout(function(){ngArm=false;ngBtn.classList.remove('armed');ngBtn.textContent='🔄 처음부터';},3500);return;}
  startOver();});
gearBtn.addEventListener('click',function(){var open=setP.hidden;setP.hidden=!open;gearBtn.setAttribute('aria-expanded',open?'true':'false');sfx('tap');});
var sfxBtn=document.getElementById('sfxBtn'),bgmBtn=document.getElementById('bgmBtn');
function syncSnd(){sfxBtn.textContent=S.sfx?'🔊':'🔇';sfxBtn.classList.toggle('off',!S.sfx);sfxBtn.setAttribute('aria-pressed',S.sfx?'true':'false');
  bgmBtn.classList.toggle('off',!S.bgm);bgmBtn.setAttribute('aria-pressed',S.bgm?'true':'false');}
sfxBtn.addEventListener('click',function(){audioInit();S.sfx=S.sfx?0:1;applyVol();syncSnd();save();sfx('tap');});
bgmBtn.addEventListener('click',function(){audioInit();S.bgm=S.bgm?0:1;applyVol();if(S.bgm&&AC)bgmNext=AC.currentTime+.1;syncSnd();save();});
syncSnd();
modeBtn.addEventListener('click',function(){S.auto=!S.auto;var p=agents[0];release(p);p.path=[];p.tap=null;joy.on=false;save();refreshUI();});
var zoomBtn=document.getElementById('zoomBtn');
zoomBtn.addEventListener('click',function(){delete S.manualZoom;CAMERA_HELD=false;S.zoomOut=!S.zoomOut;sfx('tap');save();zoomBtn.textContent=S.zoomOut?'\ud83d\udd0d \ud655\ub300 \ubcf4\uae30':'\ud83d\uddfa\ufe0f \uc804\uccb4\ubcf4\uae30';});

/* ---------- scene drawing ---------- */
var loadFx={};
function drawGear(g,x,y,r,teeth,ang,col,hub){g.save();g.translate(x,y);g.rotate(ang);g.fillStyle=col;g.beginPath();
  for(var i=0;i<teeth*2;i++){var a=i/(teeth*2)*6.283,rr2=i%2?r:r*.72;g.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2);}g.closePath();g.fill();
  g.fillStyle=hub;g.beginPath();g.arc(0,0,r*.32,0,7);g.fill();g.restore();}
function beltXOf(sid){var k=BPATH['sale_'+sid]?'sale_'+sid:'proc_'+sid;return BPATH[k][0][0];}
function drawLoader(sid){
  var g=ctx,t=SITE[sid].store,x=t.c*T,y=t.r*T,n=pn(sid),L=cvLv(sid),P=tierOfBelt(L),fx=loadFx[sid]||0,bx=beltXOf(sid);
  g.fillStyle='rgba(0,0,0,.16)';g.beginPath();g.ellipse(x+30,y+56,24,4.5,0,0,7);g.fill();
  g.fillStyle=P.dk;rr(g,x+7,y+36,46,20,3);g.fill();g.fillStyle=P.fr;rr(g,x+7,y+35,46,17,3);g.fill();g.fillStyle=P.hi;g.fillRect(x+9,y+35,42,1.2);
  g.fillStyle=P.dk;rr(g,x+8,y+40,13,11,2.5);g.fill();drawGear(g,x+14.5,y+45.5,4.4,7,time*(1.5+L*.9),P.hi,P.dk);
  /* riser: carries goods from the hopper up to the belt at the tile's top edge */
  if(beltOn('proc_'+sid)&&sid==='m1'){g.fillStyle=P.dk;rr(g,bx-6,y+40,12,20,2);g.fill();g.fillStyle='rgba(20,24,30,.75)';rr(g,bx-3.5,y+42,7,16,1.5);g.fill();}
  if(!beltOn('sale_'+sid))return drawLoaderBody();
  g.fillStyle=P.dk;rr(g,bx-6,y,12,30,2);g.fill();g.fillStyle='rgba(20,24,30,.75)';rr(g,bx-3.5,y+2,7,26,1.5);g.fill();
  if(n>0){var ph=(time*(1+L*.4))%1,ids=Object.keys(S.piles[sid]).filter(function(k){return S.piles[sid][k]>0;});
    if(ids.length){g.save();g.beginPath();g.rect(bx-3.5,y+2,7,26);g.clip();drawItem(g,ids[Math.floor(time*2)%ids.length],bx,y+28-ph*26,.5);g.restore();}}
  drawLoaderBody();
  function drawLoaderBody(){
  g.save();g.translate(x+34,y+32);g.scale(.85+.08*fx,.8-.1*fx);
  var gr=g.createLinearGradient(-20,0,20,0);gr.addColorStop(0,P.dk);gr.addColorStop(.35,P.hi);gr.addColorStop(1,P.fr);
  g.fillStyle=gr;g.beginPath();g.moveTo(-20,-11);g.lineTo(20,-11);g.lineTo(9,9);g.lineTo(-9,9);g.closePath();g.fill();
  g.fillStyle='#2f2a26';g.beginPath();g.ellipse(0,-11,18,3.6,0,0,7);g.fill();g.strokeStyle=P.hi;g.lineWidth=1.3;g.beginPath();g.ellipse(0,-11,19,4.2,0,0,7);g.stroke();
  if(n>0){var ids2=Object.keys(S.piles[sid]).filter(function(k){return S.piles[sid][k]>0;}).slice(0,3);ids2.forEach(function(id,i){drawItem(g,id,(i-1)*8,-13-(i===1?2:0),.6);});}
  g.restore();
  for(var i=0;i<Math.min(8,L);i++){g.fillStyle=P.gold?'#fff1a8':'#7be07f';g.beginPath();g.arc(x+44+(i%4)*3.2,y+44+Math.floor(i/4)*3.4,1.2,0,7);g.fill();}
  if(n>0){var lab=n+'개';g.font='800 6.5px sans-serif';g.textAlign='center';g.textBaseline='middle';
    var tw=g.measureText(lab).width+7;g.fillStyle=n>=pcap()?'rgba(226,86,106,.95)':'rgba(34,53,43,.8)';rr(g,x+30-tw/2,y+50,tw,9,4.5);g.fill();g.fillStyle='#fff';g.fillText(lab,x+30,y+54.8);}
  }
}
function drawPile(sid){
  if(cvLv(sid)){drawLoader(sid);return;}
  var p=S.piles[sid]||{},n=pn(sid),pp=pilePos(sid),x=pp.x,y=pp.y,g=ctx,st=SITE[sid],cp=pcap();
  g.save();g.translate(x,y+4);g.scale(1.75,1.75);g.translate(-x,-(y+4));
  g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.ellipse(x,y+4,11,3,0,0,7);g.fill();
  var list=[];Object.keys(p).sort(function(a,b){return ITEMS[a].sp.val-ITEMS[b].sp.val;}).forEach(function(id){for(var i=0;i<p[id];i++)list.push(id);});
  var m=Math.min(n,12),shown=[];for(var i=0;i<m;i++)shown.push(list[Math.floor(i*n/m)]);
  var top;
  if(st.kind==='mine'){
    shown.forEach(function(id,i){var layer=Math.floor(i/4),col=i%4;g.save();g.translate(x-9+col*6+(layer%2)*3,y-layer*3.6);g.scale(.55,.55);drawItem(g,id,0,0,1);g.restore();});
    top=y-Math.floor(Math.max(0,m-1)/4)*3.6-10;
  }else if(st.kind==='forest'){
    if(!n){g.strokeStyle='rgba(120,90,50,.35)';g.setLineDash([2,2]);rr(g,x-10,y-3,20,6,2);g.stroke();g.setLineDash([]);}
    shown.forEach(function(id,i){var layer=Math.floor(i/3),col=i%3,lx=x-7+col*7+(layer%2)*1.5,ly=y-layer*3.4;
      g.fillStyle=ITEMS[id].sp.log;rr(g,lx-3.4,ly-2,6.8,3.4,1.5);g.fill();
      g.fillStyle='rgba(255,236,190,.55)';g.beginPath();g.arc(lx+3,ly-.3,1.3,0,7);g.fill();});
    top=y-Math.floor(Math.max(0,m-1)/3)*3.4-10;
  }else{
    var crates=Math.ceil(m/3);
    if(!n){g.strokeStyle='rgba(120,90,50,.35)';g.setLineDash([2,2]);rr(g,x-10,y-5,20,8,2);g.stroke();g.setLineDash([]);}
    for(var j=0;j<crates;j++){
      var by=y-j*8;
      g.fillStyle='#8e6a42';rr(g,x-10,by-7,20,3,1);g.fill();
      g.fillStyle='#e8f6fb';g.beginPath();g.ellipse(x,by-5.5,8.5,1.8,0,0,7);g.fill();
      for(var k=0;k<3&&j*3+k<m;k++){var fs=ITEMS[shown[j*3+k]].sp;
        g.save();g.translate(x-5.5+k*5.5,by-6.2);g.rotate(-1.35+k*.12);g.scale(.62,.62);fishShape(g,fs.col,false);
        if(fs.id==='koi'){g.fillStyle='#e2463c';g.beginPath();g.arc(-2,-1,1.4,0,7);g.arc(1.2,.8,1.1,0,7);g.fill();}
        g.restore();}
      g.fillStyle='#c79a63';rr(g,x-10.5,by-4.5,21,7,1.6);g.fill();
      g.fillStyle='rgba(255,240,210,.35)';g.fillRect(x-9.5,by-4,19,1);
      g.strokeStyle='rgba(90,60,30,.35)';g.lineWidth=.8;g.beginPath();g.moveTo(x-10,by-1);g.lineTo(x+10,by-1);g.moveTo(x-3.5,by-4.5);g.lineTo(x-3.5,by+2.5);g.moveTo(x+3.5,by-4.5);g.lineTo(x+3.5,by+2.5);g.stroke();
    }
    top=y-Math.max(1,crates)*8-8;
  }
  g.restore();var topS=y+4-(y+4-top)*1.75;
  if(n>0){var full=n>=cp,lab=full?'가득! '+n:n+' / '+cp;g.font='800 9px sans-serif';g.textAlign='center';g.textBaseline='middle';
    var tw=g.measureText(lab).width+12;g.fillStyle=full?'rgba(226,86,106,.95)':'rgba(34,53,43,.82)';rr(g,x-tw/2,topS-8,tw,14,7);g.fill();g.fillStyle='#fff';g.fillText(lab,x,topS-.8);}
}
function grassTufts(g,x,y,w,h,seed,nT,nF){
  for(var i=0;i<nT;i++){
    var tx=x+4+hs(seed+i*3.1,i)*(w-8),ty=y+6+hs(i,seed+7.7)*(h-10),sw2=Math.sin(time*1.6+tx*.1)*1.2;
    g.strokeStyle=i%2?'#93c46f':'#a5d281';g.lineWidth=1.2;g.lineCap='round';
    g.beginPath();g.moveTo(tx-1.5,ty);g.quadraticCurveTo(tx-1.5+sw2*.5,ty-3,tx-2+sw2,ty-5);g.moveTo(tx,ty);g.quadraticCurveTo(tx+sw2*.5,ty-4,tx+sw2,ty-6.5);g.moveTo(tx+1.5,ty);g.quadraticCurveTo(tx+1.5+sw2*.5,ty-3,tx+2+sw2,ty-5);g.stroke();
  }
  for(var f=0;f<nF;f++){
    var fx0=x+8+hs(seed*2+f,3.3)*(w-16),fy0=y+8+hs(f*5.5,seed)*(h-16),fc=['#fff3f6','#ffe08a','#ffb8c8','#ffffff'][f%4];
    g.strokeStyle='#7fae5e';g.lineWidth=1;g.beginPath();g.moveTo(fx0,fy0+4);g.lineTo(fx0,fy0);g.stroke();
    g.fillStyle=fc;g.beginPath();for(var pi=0;pi<5;pi++){var pa=pi*1.2566;blob(g,fx0+Math.cos(pa)*1.7,fy0+Math.sin(pa)*1.7,1.2);}g.fill();
    g.fillStyle='#f0bb3f';g.beginPath();blob(g,fx0,fy0,1);g.fill();
  }
}
var TCACHE={};
function tileImg(key,size,fn,hh){var c=TCACHE[key];if(!c){c=document.createElement('canvas');c.width=Math.ceil(size*RS);c.height=Math.ceil((hh||size)*RS);var g=c.getContext('2d');g.setTransform(RS,0,0,RS,0,0);fn(g);TCACHE[key]=c;}return c;}
function drawForestTile(g,x,y,seed){
  var gg=g.createLinearGradient(x,y,x+T,y+T);gg.addColorStop(0,'#f7fbfc');gg.addColorStop(.58,'#e4edf2');gg.addColorStop(1,'#d3e2ea');
  g.fillStyle=gg;g.fillRect(x,y,T,T);
  g.fillStyle='rgba(101,145,170,.11)';g.beginPath();g.ellipse(x+34,y+22,22,11,.3,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.72)';g.beginPath();g.ellipse(x+17,y+47,22,5,-.14,0,7);g.ellipse(x+48,y+12,20,4,.08,0,7);g.fill();
  var mx2=x+10+hs(seed,4)*40,my=y+48;g.fillStyle='#f4ecd8';g.fillRect(mx2-1,my-2,2,3);g.fillStyle='#d9594c';g.beginPath();g.arc(mx2,my-2,2.6,Math.PI,0);g.fill();
  g.fillStyle='#fff';g.beginPath();g.arc(mx2-1,my-3.2,.5,0,7);g.arc(mx2+1,my-2.6,.4,0,7);g.fill();
  for(var pb=0;pb<3;pb++){var px2=x+6+hs(seed,pb+9)*48,py2=y+8+hs(seed,pb+13)*46;g.fillStyle='#b9b2a4';g.beginPath();g.ellipse(px2,py2,2,1.3,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(px2-.5,py2-.4,.9,.5,0,0,7);g.fill();}
  for(var lf2=0;lf2<3;lf2++){var fx2=x+4+hs(seed,lf2+20)*52,fy2=y+4+hs(seed,lf2+24)*52;g.fillStyle=lf2%2?'rgba(94,137,162,.42)':'rgba(255,255,255,.9)';g.beginPath();g.ellipse(fx2,fy2,2.2,1.1,hs(seed,lf2),0,7);g.fill();}
  var fx3=x+8+hs(seed,31)*40,fy3=y+10+hs(seed,33)*30;g.strokeStyle='#5f9a4c';g.lineWidth=.9;for(var fr=-2;fr<=2;fr++){g.beginPath();g.moveTo(fx3,fy3+5);g.quadraticCurveTo(fx3+fr*2,fy3+1,fx3+fr*3.2,fy3-1+Math.abs(fr));g.stroke();}
}
function drawPondTile(g,x,y,seed){
  var gg=g.createLinearGradient(x,y,x+T,y+T);gg.addColorStop(0,'#f8fcfd');gg.addColorStop(1,'#dfeaf0');
  g.fillStyle=gg;g.fillRect(x,y,T,T);
  g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(x+30,y+4,28,6,.04,0,7);g.fill();
  g.fillStyle='rgba(62,111,143,.2)';rr(g,x+3,y+4,54,39,14);g.fill();
  var wg=g.createLinearGradient(x,y+5,x,y+42);wg.addColorStop(0,'#c9f1fc');wg.addColorStop(1,'#83c5de');
  g.fillStyle=wg;rr(g,x+5,y+5,50,35,13);g.fill();
  var dg=g.createRadialGradient(x+32,y+26,2,x+32,y+26,24);dg.addColorStop(0,'rgba(40,110,150,.28)');dg.addColorStop(1,'rgba(40,110,150,0)');g.fillStyle=dg;rr(g,x+5,y+5,50,35,13);g.fill();
  g.strokeStyle='rgba(255,255,255,.86)';g.lineWidth=1.6;rr(g,x+6,y+6,48,33,12);g.stroke();
  g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.ellipse(x+19,y+11,8,2.5,-.15,0,7);g.fill();
  /* shoreline pebbles */
  for(var st2=0;st2<9;st2++){var a2=st2/9*6.283+hs(seed,st2)*.4,sx2=x+30+Math.cos(a2)*26,sy2=y+22.5+Math.sin(a2)*18.5;g.fillStyle=st2%2?'#b9b2a4':'#a39c8e';g.beginPath();g.ellipse(sx2,sy2,2.2,1.5,a2,0,7);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(sx2-.5,sy2-.5,.9,.5,0,0,7);g.fill();}
  /* lily pads with a notch + one blossom */
  [[47,33,4.5],[14,32,3.4]].forEach(function(l,i){g.fillStyle=i?'#6db873':'#5fa86a';g.beginPath();g.moveTo(x+l[0],y+l[1]);g.arc(x+l[0],y+l[1],l[2],.35,6.0);g.closePath();g.fill();
    g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=.5;g.beginPath();g.moveTo(x+l[0],y+l[1]);g.lineTo(x+l[0]-l[2]*.7,y+l[1]-l[2]*.3);g.stroke();});
  if(hs(seed,77)>.35){g.fillStyle='#ffb3c6';for(var pe=0;pe<5;pe++){var pa=pe/5*6.283;g.beginPath();g.ellipse(x+46+Math.cos(pa)*1.6,y+31.5+Math.sin(pa)*1.1,1.5,.9,pa,0,7);g.fill();}g.fillStyle='#ffe27a';g.beginPath();g.arc(x+46,y+31.5,.9,0,7);g.fill();}
  /* reeds clump */
  g.strokeStyle='#6a9a50';g.lineWidth=1;for(var rd=0;rd<3;rd++){g.beginPath();g.moveTo(x+52+rd*1.6,y+44);g.lineTo(x+51+rd*2.2,y+35-rd*2);g.stroke();}
}
/* the moving part of a pond tile: ripples and a swaying reed */
function drawPondAnim(g,x,y,seed){
  for(var gi=0;gi<3;gi++){var gp=(time*.5+hs(seed,gi+40)*3)%3;if(gp<1){var gx2=x+12+hs(seed,gi+50)*36,gy2=y+10+hs(seed,gi+60)*24;g.strokeStyle='rgba(255,255,255,'+(.8*Math.sin(gp*Math.PI))+')';g.lineWidth=.8;g.beginPath();g.moveTo(gx2-2.5,gy2);g.lineTo(gx2+2.5,gy2);g.stroke();}}
  for(var wi=0;wi<2;wi++){var wp=(time*.24+wi*.5+hs(seed,wi))%1;g.strokeStyle='rgba(255,255,255,'+(.38*(1-wp))+')';g.lineWidth=1;g.beginPath();g.ellipse(x+18+wi*22,y+20+wi*6,2.5+wp*7,1.2+wp*2.8,0,0,7);g.stroke();}
  var rs=Math.sin(time*1.4+seed)*1.2;g.strokeStyle='#6a9a50';g.lineWidth=1.3;g.beginPath();g.moveTo(x+7,y+40);g.quadraticCurveTo(x+7+rs*.4,y+33,x+6+rs,y+27);g.stroke();
  g.fillStyle='#8a6a48';rr(g,x+5+rs,y+24,2.2,4.5,1.1);g.fill();
}
/* storage tile: plank deck, clearly different from the gathering tiles */
function drawStoreTile(g,st,x,y){
  g.fillStyle='#e5d3ae';g.fillRect(x,y,T,T);
  g.fillStyle='rgba(40,30,20,.12)';rr(g,x+4,y+5,53,53,5);g.fill();
  g.fillStyle='#d4ad78';rr(g,x+3,y+3,53,53,5);g.fill();
  g.strokeStyle='rgba(110,75,40,.28)';g.lineWidth=1;for(var py=y+10;py<y+56;py+=7){g.beginPath();g.moveTo(x+4,py);g.lineTo(x+55,py);g.stroke();}
  g.strokeStyle='#a8743f';g.lineWidth=1.5;rr(g,x+3,y+3,53,53,5);g.stroke();
  if(!cvLv(st.id)){g.font='700 6.5px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(90,60,30,.7)';g.fillText('적재칸',x+30,y+52);}
}
function drawSite(st){
  var g=ctx,x=st.x,y=st.y,seed=x*.37+y*.11+1;
  if(!owned(st.id)){g.drawImage(tileImg('L-'+st.id+(S.smelt?1:0),st.w,function(c){drawLockedSite(c,st,0,0);},st.h),x,y,st.w,st.h);return;}
  drawOwnedSite(g,st,x,y,seed);
  if(st.kind==='forest'||st.kind==='pond'){drawStoreTile(g,st,st.store.c*T,st.store.r*T);drawPadDeck(g,st.xtT.c*T,st.xtT.r*T);}
}
function drawLockedSite(g,st,x,y){
  {
    var SZ=st.w;g.fillStyle='#aebba3';g.fillRect(x,y,SZ,st.h);
    g.save();g.beginPath();g.rect(x,y,SZ,st.h);g.clip();g.strokeStyle='rgba(255,255,255,.14)';g.lineWidth=2;
    for(var s2=-SZ;s2<SZ;s2+=14){g.beginPath();g.moveTo(x+s2,y+SZ);g.lineTo(x+s2+SZ,y);g.stroke();}g.restore();
    g.globalAlpha=.35;
    if(st.kind==='forest'){[[.3,.45],[.62,.38],[.5,.66]].forEach(function(o){g.fillStyle='#6f8a63';g.beginPath();blob(g,x+o[0]*SZ,y+o[1]*SZ-8,12);g.fill();g.fillRect(x+o[0]*SZ-2,y+o[1]*SZ,4,10);});}
    else if(st.kind==='mine'){[[.3,.7],[.62,.66],[.48,.86]].forEach(function(o){g.fillStyle='#6b6a66';g.beginPath();blob(g,x+o[0]*SZ,y+o[1]*SZ,11);g.fill();});}
    else{g.fillStyle='#7f9fa8';rr(g,x+22,y+26,76,48,20);g.fill();}
    g.globalAlpha=1;
    g.font='800 10px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#4f5d48';g.fillText(st.name+' 부지',x+SZ/2,y+SZ/2+20);if(st.kind==='mine'){g.font='700 7.5px sans-serif';g.fillText(S.smelt?'발판에서 개척해요':'제련소를 지으면 열려요',x+SZ/2,y+SZ/2+34);}
    g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=1;g.strokeRect(x+.5,y+.5,SZ-1,SZ-1);
  }
}
/* one site = one merged L-shaped gathering area (3 tiles) + a separate fenced storage deck (1 tile) */
function lPath(g,m,r){ /* L = top row (2 tiles) + bottom-left tile, inset by m, corner radius r */
  g.beginPath();
  g.moveTo(m+r,m);g.lineTo(120-m-r,m);g.quadraticCurveTo(120-m,m,120-m,m+r);
  g.lineTo(120-m,60-m-r);g.quadraticCurveTo(120-m,60-m,120-m-r,60-m);
  g.lineTo(60-m+r,60-m);g.quadraticCurveTo(60-m,60-m,60-m,60-m+r);
  g.lineTo(60-m,120-m-r);g.quadraticCurveTo(60-m,120-m,60-m-r,120-m);
  g.lineTo(m+r,120-m);g.quadraticCurveTo(m,120-m,m,120-m-r);
  g.lineTo(m,m+r);g.quadraticCurveTo(m,m,m+r,m);g.closePath();
}
function lPoint(k,m){ /* point k∈[0,1) along the L outline, used to scatter shore stones */
  var segs=[[m,m,120-m,m],[120-m,m,120-m,60-m],[120-m,60-m,60-m,60-m],[60-m,60-m,60-m,120-m],[60-m,120-m,m,120-m],[m,120-m,m,m]];
  var tot=0,ls=segs.map(function(s){var l=Math.hypot(s[2]-s[0],s[3]-s[1]);tot+=l;return l;}),d=k*tot;
  for(var i=0;i<segs.length;i++){if(d<=ls[i]){var s=segs[i],u=d/ls[i];return {x:s[0]+(s[2]-s[0])*u,y:s[1]+(s[3]-s[1])*u};}d-=ls[i];}
  return {x:m,y:m};
}
function drawPadDeck(g,x,y){
  g.fillStyle='rgba(60,50,30,.12)';rr(g,x+4,y+6,52,52,9);g.fill();
  g.fillStyle='#ece2c8';rr(g,x+4,y+4,52,52,9);g.fill();
  for(var i=0;i<4;i++)for(var j=0;j<4;j++){var sh=hs(x+i*3.1,y+j*1.7);g.fillStyle='rgba(150,125,85,'+(.10+sh*.08)+')';rr(g,x+7+i*12.5+(j%2)*3,y+7+j*12.5,10.5,10.5,3);g.fill();}
  g.strokeStyle='rgba(160,130,90,.55)';g.lineWidth=1.2;rr(g,x+4.5,y+4.5,51,51,9);g.stroke();
}
function drawSiteArt(g,st,seed){
  var kind=st.kind,px=st.pd[0]*60,sx=st.sd[0]*60,sy=st.sd[1]*60;
  var gg=g.createLinearGradient(0,0,120,120);gg.addColorStop(0,kind==='mine'?'#cfc6b4':'#c6e4a6');gg.addColorStop(1,kind==='mine'?'#b9ae98':'#a9d18c');
  g.fillStyle=gg;g.fillRect(0,0,st.w,120);
  if(kind==='forest'){
    g.fillStyle='rgba(90,140,70,.18)';rr(g,3,63,114,54,14);g.fill();grassTufts(g,0,60,120,60,seed+3,6,2);
    for(var j=0;j<10;j++){var fx=6+hs(seed,j+20)*108,fy=64+hs(seed,j+40)*50;g.fillStyle=['#d9a441','#c9743a','#e0b85a','#b8883a'][j%4];g.save();g.translate(fx,fy);g.rotate(hs(seed,j)*6);g.beginPath();g.ellipse(0,0,2,1,0,0,7);g.fill();g.restore();}
  }else if(kind==='pond'){
    /* boardwalk along the top bank, water below */
    g.fillStyle='#e8dcb8';rr(g,1,60,118,22,6);g.fill();
    g.fillStyle='rgba(70,120,70,.25)';rr(g,1,70,118,49,14);g.fill();
    var wg=g.createLinearGradient(0,74,0,118);wg.addColorStop(0,'#8fd0e8');wg.addColorStop(1,'#5fa6cc');g.fillStyle=wg;rr(g,3,74,114,43,13);g.fill();
    g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1.2;rr(g,4.5,75.5,111,40,12);g.stroke();
    g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.ellipse(30,90,12,2.4,-.1,0,7);g.ellipse(88,104,9,2,-.1,0,7);g.fill();
    g.fillStyle='rgba(60,40,20,.18)';g.fillRect(3,64,114,9);g.fillStyle='#c9a26f';g.fillRect(3,61,114,10);
    g.strokeStyle='rgba(110,75,40,.35)';g.lineWidth=.8;for(var bx=8;bx<117;bx+=7){g.beginPath();g.moveTo(bx,61);g.lineTo(bx,71);g.stroke();}
    for(var p=0;p<6;p++){var ppx=10+p*20;g.fillStyle='#8a6440';rr(g,ppx-1.6,69,3.2,6,1);g.fill();}
    [[100,110,4.6],[16,100,3.6]].forEach(function(l,i){g.fillStyle=i%2?'#6db873':'#5fa86a';g.beginPath();g.moveTo(l[0],l[1]);g.arc(l[0],l[1],l[2],.35,6.0);g.closePath();g.fill();});
  }else{
    /* quarry: cracked stone floor with gravel */
    g.save();g.translate(0,-sy);g.fillStyle='#a89c88';rr(g,3,63,st.w-6,54,10);g.fill();g.strokeStyle='rgba(60,50,40,.3)';g.lineWidth=.8;
    for(var cr=0;cr<7;cr++){var cx=10+hs(seed,cr)*(st.w-20),cy=68+hs(cr,seed)*44;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+6,cy+3);g.lineTo(cx+9,cy+1);g.stroke();}
    for(var gv=0;gv<24;gv++){g.fillStyle='rgba(80,70,60,'+(.2+hs(gv,7)*.3)+')';g.beginPath();blob(g,6+hs(gv,3)*(st.w-12),66+hs(gv,5)*50,.8+hs(gv,9)*1.2);g.fill();}
    g.fillStyle='#6b5a44';g.fillRect(4,114,st.w-8,2);g.restore();
  }
  drawPadDeck(g,px,sy);
  drawStoreTile(g,st,sx,sy);
  g.fillStyle='rgba(0,0,0,.12)';g.fillRect(sx,sy?60:58,60,2);g.fillRect(sx===0?58:60,sy,2,60);
  for(var q=0;q<5;q++){g.fillStyle='#9a7a52';rr(g,sx+1+q*14,sy?58:57,3,7,1);g.fill();}
}
/* shared decks for the non-gathering tiles */
function deck(g,x,y,w,h,col,edge){g.fillStyle='rgba(40,30,20,.14)';rr(g,x+1.5,y+2.5,w,h,7);g.fill();var dg=g.createLinearGradient(x,y,x,y+h);dg.addColorStop(0,col[0]);dg.addColorStop(1,col[1]);g.fillStyle=dg;rr(g,x,y,w,h,7);g.fill();
  g.strokeStyle=edge;g.lineWidth=1.2;rr(g,x+.6,y+.6,w-1.2,h-1.2,6.5);g.stroke();g.fillStyle='rgba(255,255,255,.3)';rr(g,x+3,y+2,w-6,2,1);g.fill();}
function laneStrip(g,x,y0,y1){g.fillStyle='rgba(60,50,40,.16)';rr(g,x-12,y0,24,y1-y0,6);g.fill();g.fillStyle='#d8ccb0';rr(g,x-11,y0,22,y1-y0,6);g.fill();
  for(var i=0;i<(y1-y0)/5;i++){g.fillStyle='rgba(120,100,70,'+(.15+hs(i,x)*.2)+')';g.beginPath();blob(g,x-8+hs(i,3)*16,y0+3+i*5,.9);g.fill();}}
function lantern(g,x,y,gold){g.fillStyle='rgba(255,210,120,.22)';g.beginPath();g.arc(x,y-9,9,0,7);g.fill();g.fillStyle='#5b4636';g.fillRect(x-.8,y-8,1.6,10);g.fillStyle=gold?'#e0b23c':'#3a3f45';rr(g,x-3,y-14,6,7,1.5);g.fill();g.fillStyle='#ffe29a';rr(g,x-2,y-13,4,5,1);g.fill();}
var FOREST_LOOK=ART.forest;
function drawForestArt(g,st,seed,L){
  var P=FOREST_LOOK[Math.max(0,Math.min(4,L-1))];
  g.fillStyle='#edf9df';rr(g,0,0,st.w,st.h,8);g.fill();
  g.fillStyle=P.floor;rr(g,2,2,st.w-5,st.h-4,13);g.fill();
  /* Ground only: the resource renderer owns every visible tree. */
  g.strokeStyle='rgba(96,125,113,.15)';g.lineWidth=.7;
  for(var j=0;j<13;j++){var x=8+hs(seed,j)*(st.w-18),y=9+hs(j,seed)*(st.h-18);g.beginPath();g.moveTo(x,y);g.lineTo(x+3,y-1);g.stroke();}
  if(L>=3){g.strokeStyle='#b9ad8f';g.lineWidth=1;g.beginPath();g.moveTo(4,9);g.lineTo(4,st.h-9);g.stroke();}
  if(L>=4){lantern(g,st.w-6,64,L===5);lantern(g,st.w-6,125,L===5);}
  if(L===5){g.fillStyle='#d5bb84';[[8,65],[48,125],[9,163]].forEach(function(p){g.beginPath();g.arc(p[0],p[1],1.5,0,7);g.fill();});}
}

function drawRiverArt(g,st,seed,L){
  var w=st.w,h=st.h,wc=[['#54cdeb','#c2eaf5'],['#30bde8','#b4e5f2'],['#21aedf','#a2e0f4'],['#219bd8','#92dafa'],['#23c5d5','#a8f2ef']][L-1];
  g.fillStyle='#dce8df';rr(g,0,0,w,h,12);g.fill();
  var water=g.createLinearGradient(0,0,w,h);water.addColorStop(0,wc[0]);water.addColorStop(.5,wc[1]);water.addColorStop(1,wc[0]);g.fillStyle=water;rr(g,5,5,w-10,h-10,11);g.fill();
  g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;rr(g,5,5,w-10,h-10,11);g.stroke();
  for(var i=0;i<14;i++){var x=12+hs(i,5)*(w-24),y=12+hs(i,9)*(h-24);g.fillStyle='rgba(255,255,255,.23)';g.beginPath();g.ellipse(x,y,6,1.4,0,0,7);g.fill();}
  for(var y=14;y<h-8;y+=18){g.fillStyle=L>=3?'#a1b3b4':'#b2c5b9';g.beginPath();g.ellipse(w-2,y,3,5,0,0,7);g.fill();}
  if(L>=2){[[18,42],[w-22,118]].forEach(function(p){g.fillStyle='#6ab27c';g.beginPath();g.arc(p[0],p[1],5+L*.4,.3,6);g.lineTo(p[0],p[1]);g.fill();});}
  if(L>=4){for(var i=0;i<L;i++){g.fillStyle='rgba(255,255,255,.7)';g.fillRect(15+hs(i,17)*(w-30),18+hs(i,23)*(h-36),3,1);}}
}
/* moving parts: the river flows downhill, fireflies over a grown forest */
function siteAnim(g,st,L){
  if(st.kind==='pond'){var x0=st.x+8;g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=1;
    for(var i=0;i<10;i++){var yy=st.y+((time*(14+L*3)+i*23)%st.h),xx=x0+6+hs(i,17)*(st.w-28);g.globalAlpha=.25+.35*Math.sin((yy-st.y)/st.h*Math.PI);g.beginPath();g.moveTo(xx,yy);g.lineTo(xx,yy+6);g.stroke();}g.globalAlpha=1;
    if(L>=4){var wf=(time*2)%1;g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x0+2,st.y+5,st.w-20,2);g.fillStyle='rgba(255,255,255,'+(.4*(1-wf))+')';g.beginPath();g.ellipse(x0+23,st.y+4+wf*6,18,2,0,0,7);g.fill();}}
  else if(L>=4){for(var f=0;f<(L>=5?7:4);f++){var fa=time*.6+f*1.9,fx=st.x+30+Math.cos(fa)*22+Math.sin(time*1.3+f)*4,fy=st.y+20+((f*37+time*6)%(st.h-30));g.fillStyle='rgba(255,240,150,'+(.4+.4*Math.sin(time*4+f))+')';g.beginPath();g.arc(fx,fy,1.3,0,7);g.fill();}}
}
function mineDeco(g,L){
  if(L>=2){g.fillStyle='#8a6440';[[4,2],[112,2]].forEach(function(p){g.fillRect(p[0],p[1],4,56);});g.fillRect(4,2,112,4);}
  if(L>=3){g.strokeStyle='#6b5a44';g.lineWidth=1.2;g.beginPath();g.moveTo(4,54);g.lineTo(116,54);g.moveTo(4,58);g.lineTo(116,58);g.stroke();for(var x=6;x<116;x+=7){g.fillStyle='#8a6440';g.fillRect(x,52,3,8);}
    g.fillStyle='#5d6670';rr(g,20,44,16,9,2);g.fill();g.fillStyle='#8a8078';g.beginPath();blob(g,24,44,3);blob(g,30,43,3);g.fill();g.fillStyle='#2b2f36';g.beginPath();g.arc(23,54,2,0,7);g.arc(33,54,2,0,7);g.fill();}
  if(L>=4){lantern(g,8,24,L>=5);lantern(g,112,24,L>=5);}
  if(L>=5){for(var k=0;k<8;k++){g.fillStyle='rgba(255,220,90,.8)';var gx=10+hs(k,5)*100,gy=8+hs(k,7)*40;g.fillRect(gx-1.4,gy-.3,2.8,.6);g.fillRect(gx-.3,gy-1.4,.6,2.8);}}
}
function drawOwnedSite(g,st,x,y,seed){
  var L=Math.max(1,siteLv(st.id)),key='S4-'+st.id+'-'+(cvLv(st.id)?1:0)+(beltOn('proc_'+st.id)?1:0)+'-'+L;
  if(st.kind!=='mine'){g.drawImage(tileImg(key,st.w,function(c){(st.kind==='forest'?drawForestArt:drawRiverArt)(c,st,seed,L);},st.h),x,y,st.w,st.h);siteAnim(g,st,L);return;}
  g.drawImage(tileImg(key,st.w,function(c){drawSiteArt(c,st,seed);mineDeco(c,L);},st.h),x,y,st.w,st.h);
  if(st.kind!=='forest')st.tiles.forEach(function(t,i){if(t.store||t.pad)return;var tx=t.c*T,ty=t.r*T,sd=seed+i*3;
    if(st.kind!=='pond')return;for(var wi=0;wi<2;wi++){var wp=(time*.24+wi*.5+hs(sd,wi))%1;g.strokeStyle='rgba(255,255,255,'+(.38*(1-wp))+')';g.lineWidth=1;g.beginPath();g.ellipse(tx+18+wi*22,ty+34+wi*8,2.5+wp*7,1.2+wp*2.8,0,0,7);g.stroke();}
    for(var gi=0;gi<2;gi++){var gp=(time*.5+hs(sd,gi+40)*3)%3;if(gp<1){var gx2=tx+14+hs(sd,gi+50)*32,gy2=ty+24+hs(sd,gi+60)*28;g.strokeStyle='rgba(255,255,255,'+(.8*Math.sin(gp*Math.PI))+')';g.lineWidth=.8;g.beginPath();g.moveTo(gx2-2.5,gy2);g.lineTo(gx2+2.5,gy2);g.stroke();}}});
}
/* central plaza: four empty lots; a building appears once it is bought */
var PLOTS=[
  {id:'sawmill',def:'mill',name:'제재소',x:186,y:414,w:136,h:144,shedLeft:1,built:function(){return S.mill>0;},show:function(){return S.shop.wood+S.shop.fish>=3||S.mill>0;}},
  {id:'smokehouse',def:'smoke',name:'훈제소',x:486,y:430,w:136,h:144,shedLeft:1,built:function(){return S.smoke>0;},show:function(){return S.shop.wood+S.shop.fish>=3||S.smoke>0;}},
  {id:'smelter',def:'smelt',name:'제련소',x:846,y:243,w:136,h:138,shedLeft:1,built:function(){return S.smelt>0;},show:function(){return S.mill>0||S.smoke>0||S.smelt>0;}},
  {id:'factory',def:'elec',name:'전자 공장',x:846,y:438,w:136,h:138,shedLeft:1,built:function(){return S.elec>0;},show:function(){return S.smelt>0||S.elec>0;}},
  {id:'tower',def:'tower',name:'망루',x:28,y:482,w:44,h:116,built:function(){return S.tower>0;},show:function(){return huntReady();}}
];
/* each factory: machine on the side the belt comes in, storage shed (truck bay) on the other */
function shedX(pl){return pl.shedLeft?pl.x:pl.x+pl.w-44;}
function machOf(pl){return {x:pl.shedLeft?pl.x+36:pl.x,y:pl.y,w:pl.w,h:pl.h};}
/* ---- everything that never moves is painted once into an offscreen canvas ---- */
var BG=document.createElement('canvas');BG.width=Math.ceil(W*RS);BG.height=Math.ceil((HT-WORLD_TOP)*RS);
function paintStatic(){
  var g=BG.getContext('2d');g.setTransform(RS,0,0,RS,0,0);
  var land=g.createLinearGradient(0,0,W,HT);land.addColorStop(0,ART.land[0]);land.addColorStop(.45,ART.land[1]);land.addColorStop(1,ART.land[2]);g.fillStyle=land;g.fillRect(0,0,W,HT);
  g.fillStyle=ART.plaza;g.fillRect(0,0,W,178);
  /* Paths follow the actual gaps; planting stays out of working and upgrade areas. */
  g.fillStyle=ART.path;rr(g,12,366,W-24,57,16);g.fill();
  [150,570,1038].forEach(function(x){g.fillStyle=ART.pathLight;rr(g,x-19,126,38,452,14);g.fill();
    for(var sy=157;sy<568;sy+=24){g.fillStyle='rgba(255,253,243,.52)';g.beginPath();g.ellipse(x+(sy%48?3:-3),sy,10,5,0,0,7);g.fill();}});
  g.fillStyle=ART.pathLight;rr(g,116,235,125,25,9);g.fill();
  g.fillStyle=ART.garden;g.fillRect(0,431,W,H-431);
  [326,680,1008].forEach(function(x){
    var py=x===1008?240:x===680?132:220,ph=x===326?102:78;g.fillStyle='#adb6a0';rr(g,x-9,py,18,ph,8);g.fill();g.fillStyle='#e5e4d3';rr(g,x-8,py-1,16,ph-3,7);g.fill();
    for(var j=0;j<(x===326?8:6);j++){var yy=py+10+j*11;g.fillStyle=j%2?'#819579':'#9cac8c';g.beginPath();g.ellipse(x+(j%2?2:-2),yy,5,3,0,0,7);g.fill();g.fillStyle=j%3?'#e7dcc1':'#c7b692';g.beginPath();g.arc(x-2,yy-1,1.1,0,7);g.fill();}
  });
  /* Northern snow gardens frame the mining district without narrowing its entrance. */
  [[708,56,31],[788,75,25],[914,35,30],[996,58,24]].forEach(function(o){
    var x=o[0],y=o[1],r=o[2];g.fillStyle='rgba(93,123,106,.12)';g.beginPath();g.ellipse(x+3,y+4,r,r*.46,0,0,7);g.fill();
    var mound=g.createLinearGradient(x-r,y-r,x+r,y+r);mound.addColorStop(0,ART.snow);mound.addColorStop(1,ART.snowShade);g.fillStyle=mound;g.beginPath();g.ellipse(x,y,r,r*.46,0,0,7);g.fill();
    [-8,9].forEach(function(off,i){var xx=x+off,yy=y+i*3;g.fillStyle='#8a7e60';g.fillRect(xx-1,yy-6,2,8);g.fillStyle=i?ART.pineLight:ART.pine;g.beginPath();g.moveTo(xx-7,yy-4);g.lineTo(xx,yy-24-i*4);g.lineTo(xx+7,yy-4);g.closePath();g.fill();g.fillStyle=ART.snow;g.beginPath();g.moveTo(xx-4,yy-12);g.lineTo(xx,yy-24-i*4);g.lineTo(xx+4,yy-12);g.closePath();g.fill();});
  });
  /* Timber benches, stone edging and lanterns give the long route a human scale. */
  [310,690,1036].forEach(function(x){var y=389;g.fillStyle='rgba(53,68,48,.12)';rr(g,x-11,y+5,25,7,3);g.fill();g.fillStyle='#786c53';g.fillRect(x-8,y+2,2,7);g.fillRect(x+7,y+2,2,7);g.fillStyle='#b39c72';rr(g,x-11,y-1,24,4,1);g.fill();g.fillStyle='#d2bd92';g.fillRect(x-11,y-1,24,1);g.fillStyle='#97825c';rr(g,x-11,y-8,24,4,1);g.fill();});
  for(var px=22;px<W-20;px+=21){g.fillStyle='rgba(147,152,129,.35)';rr(g,px,365,9,2.5,1.2);g.fill();rr(g,px,422,9,2.5,1.2);g.fill();}
  /* Sparse snow texture is painted once, not regenerated each frame. */
  for(var j=0;j<90;j++){g.fillStyle=j%3?'rgba(255,255,248,.36)':'rgba(98,126,109,.08)';g.beginPath();g.ellipse(hs(j,21)*W,hs(j,33)*H,2+hs(j,41)*4,1,0,0,7);g.fill();}
  g.fillStyle='#919e93';g.fillRect(0,H+8,W,RB-16);g.fillStyle='#e8e3cd';for(var x=4;x<W;x+=28)g.fillRect(x,H+RB/2+3,12,1.5);
}

var bgWh=palKey();
paintStatic();
var PAL=document.createElement('canvas');PAL.width=Math.ceil(W*RS);PAL.height=Math.ceil(HT*RS);
function paintPalisade(){var g=PAL.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,PAL.width,PAL.height);g.setTransform(RS,0,0,RS,0,0);
  /* chunky round log posts (video-ref: thick round-cut wooden fence) - warm radial-lit end caps with a growth-ring and a bright rim highlight */
  function logV(x,y0,y1){for(var ly=y0;ly<y1;ly+=6.2){
      g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(x+1.4,ly+2.3,4.4,3.5,0,0,7);g.fill();
      var lg=g.createRadialGradient(x-1.3,ly-1.3,.4,x,ly,4.6);lg.addColorStop(0,ART.timber[0]);lg.addColorStop(.55,ART.timber[1]);lg.addColorStop(1,ART.timber[2]);
      g.fillStyle=lg;g.beginPath();g.ellipse(x,ly,4.3,3.5,0,0,7);g.fill();
      g.strokeStyle='rgba(90,50,15,.5)';g.lineWidth=.7;g.beginPath();g.ellipse(x,ly,2.5,2,0,0,7);g.stroke();
      g.strokeStyle='rgba(60,32,10,.65)';g.lineWidth=1.1;g.beginPath();g.ellipse(x,ly,4.3,3.5,0,0,7);g.stroke();
      g.fillStyle='rgba(248,253,255,.9)';g.beginPath();g.ellipse(x-1.1,ly-2.5,3.2,1.2,-.18,Math.PI,Math.PI*2);g.fill();
      g.fillStyle='rgba(255,244,220,.6)';g.beginPath();g.ellipse(x-1.2,ly-1.2,1.6,1.05,0,0,7);g.fill();}}
  logV(3,184,H);logV(W-3,184,H);
}
paintPalisade();
/* cached sprites: firefly glow and the edge vignette (drawn with alpha instead of new gradients every frame) */
var GLOW=document.createElement('canvas');GLOW.width=GLOW.height=28;
(function(){var g=GLOW.getContext('2d'),gr=g.createRadialGradient(14,14,0,14,14,14);gr.addColorStop(0,'rgba(255,240,150,1)');gr.addColorStop(1,'rgba(255,240,150,0)');g.fillStyle=gr;g.fillRect(0,0,28,28);})();
var VIG=document.createElement('canvas');VIG.width=W;VIG.height=HT;
(function(){var g=VIG.getContext('2d'),vg=g.createRadialGradient(W/2,HT/2,HT*.35,W/2,HT/2,HT*.75);vg.addColorStop(0,'rgba(20,40,25,0)');vg.addColorStop(1,'rgba(20,40,25,.22)');g.fillStyle=vg;g.fillRect(0,0,W,HT);})();
function drawCampfire(g,x,y){
  var pulse=.5+.5*Math.sin(time*5);
  g.fillStyle='rgba(83,45,34,.23)';g.beginPath();g.ellipse(x+1,y+5,21,9,0,0,7);g.fill();
  g.fillStyle='#8a8f96';g.beginPath();g.ellipse(x,y+1,18,8,0,0,7);g.fill();
  g.fillStyle='#d2d9dd';g.beginPath();g.ellipse(x,y-1,15,6,0,0,7);g.fill();
  for(var rock=0;rock<9;rock++){var a=rock/9*6.283;g.fillStyle=rock%2?'#aab3ba':'#d9e0e3';g.beginPath();g.ellipse(x+Math.cos(a)*13,y+Math.sin(a)*5,3.4,2.5,a,0,7);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(x+Math.cos(a)*13-1,y+Math.sin(a)*5-1,1.5,.7,a,0,7);g.fill();}
  g.save();g.translate(x,y-1);g.rotate(-.22);g.fillStyle='#774421';rr(g,-9,-2,18,4,2);g.fill();g.fillStyle='#d9a675';g.beginPath();g.ellipse(-8,0,2.1,1.8,0,0,7);g.fill();g.restore();
  g.save();g.translate(x,y-2);g.rotate(.27);g.fillStyle='#8b512a';rr(g,-8,-2,16,4,2);g.fill();g.fillStyle='#e1b183';g.beginPath();g.ellipse(7,0,2,1.7,0,0,7);g.fill();g.restore();
  g.globalAlpha=.76+.2*pulse;g.fillStyle='#f47732';g.beginPath();g.moveTo(x-5,y-2);g.quadraticCurveTo(x-8,y-12,x-1,y-17);g.quadraticCurveTo(x-1,y-10,x+2,y-9);g.quadraticCurveTo(x+5,y-17,x+6,y-19);g.quadraticCurveTo(x+12,y-9,x+5,y-2);g.closePath();g.fill();
  g.fillStyle='#ffd05a';g.beginPath();g.moveTo(x-2,y-2);g.quadraticCurveTo(x-3,y-9,x+1,y-12);g.quadraticCurveTo(x+2,y-6,x+4,y-4);g.closePath();g.fill();g.globalAlpha=1;
  g.fillStyle='rgba(255,153,65,'+(.12+.08*pulse)+')';g.beginPath();g.arc(x,y-7,24+2*pulse,0,7);g.fill();
}
function drawPlaza(){
  var g=ctx,nt=nightAmt();
  /* warm safe zone at the heart of the cold forest */
  g.fillStyle='rgba(245,190,139,.25)';g.beginPath();g.ellipse(690,384,67,27,0,0,7);g.fill();drawCampfire(g,690,384);
  PLOTS.forEach(function(pl){
    if(!pl.built()){
      if(pl.show&&!pl.show())return;
      g.strokeStyle='rgba(120,95,60,.45)';g.lineWidth=1.2;g.setLineDash([4,3]);rr(g,pl.x,pl.y,pl.w,pl.h,6);g.stroke();g.setLineDash([]);
      g.fillStyle='rgba(255,250,235,.4)';rr(g,pl.x+1,pl.y+1,pl.w-2,pl.h-2,6);g.fill();
      return;}
    PLOT_DRAW[pl.id](g,pl,nt);

  });
}
function facilityLabelSlot(pl){
  return {x:pl.def==='smelt'?pl.x+20:pl.x+pl.w/2,y:pl.def==='tower'?pl.y-22:pl.y+pl.h+6,w:pl.def==='tower'?76:pl.def==='smelt'?88:96,h:12};
}
function facilitySign(g,label,x,y,w){
  g.save();g.font='600 6.3px sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='rgba(43,55,42,.12)';rr(g,x-w/2+1,y+1,w,12,3);g.fill();
  var paper=g.createLinearGradient(0,y,0,y+12);paper.addColorStop(0,'#faf3df');paper.addColorStop(1,'#e3d7b7');g.fillStyle=paper;rr(g,x-w/2,y,w,12,3);g.fill();g.strokeStyle='#b2a386';g.lineWidth=.55;g.stroke();
  g.fillStyle='#6a614b';g.beginPath();g.arc(x-w/2+3,y+3,.7,0,7);g.arc(x+w/2-3,y+3,.7,0,7);g.fill();g.fillText(label,x,y+6.2,w-10);g.restore();
}
function drawFacilityLabels(){
  PLOTS.forEach(function(pl){if(!pl.built())return;var p=facilityLabelSlot(pl);facilitySign(ctx,pl.name+' · Lv'+S[pl.def],p.x,p.y,p.w);});
  LINES.forEach(function(line){if(!lineOpen(line))return;var st=STALL[line];facilitySign(ctx,SHOPDEF[line].name+' · Lv'+S.shop[line],st.x,st.y-28,72);});
  SITES.forEach(function(st){if(!owned(st.id))return;facilitySign(ctx,st.name+' · Lv'+siteLv(st.id),st.x+st.w/2,st.y-(st.kind==='forest'?60:24),72);});
}
function drawWatchtower(g,cx,base,w,h,L,down,aim,angle,nt){
  L=Math.max(1,Math.min(9,L));var x=cx-w/2+3,span=w-6,deck=base-h+39,d=8,timber='#a38659',stone='#a9b39f';
  g.save();g.lineJoin='round';g.lineCap='round';
  g.fillStyle='rgba(24,41,34,.18)';g.beginPath();g.ellipse(cx+9,base+2,w*.7,7,0,0,7);g.fill();
  if(down){for(var r=0;r<9;r++)isoBox(g,x+(r%3)*10,base-Math.floor(r/3)*5,8,4,5,r%2?'#857d68':'#aab097');g.restore();return;}
  isoBox(g,x-2,base,span+4,d+2,L>=3?27:10,stone);
  if(L<=3){artPosts(g,x+2,base-10,span-4,base-deck-11,timber);g.strokeStyle=L===3?'#82958b':'#806143';g.lineWidth=2.3;g.beginPath();g.moveTo(x+4,base-14);g.lineTo(x+span-4,deck+5);g.moveTo(x+span-4,base-14);g.lineTo(x+4,deck+5);g.stroke();}
  if(L===3)isoBox(g,x+3,base-26,span-6,8,20,'#98a88f');
  if(L===4){isoBox(g,x,base-22,span,8,base-deck-24,'#abac93');artBricks(g,x,deck+2,span,base-deck-24);}
  if(L===5){isoBox(g,x+3,base-23,span-6,9,base-deck-23,'#849b8b');isoGlass(g,x+6,deck+14,span-12,18);}
  if(L===6){artPosts(g,x,base-20,span,base-deck-20,'#78938c');isoGlass(g,x+4,deck+17,span-8,base-deck-43);isoBox(g,x-2,base-30,span+4,9,5,'#a7b8a3');}
  if(L===7){isoBox(g,x-1,base-25,span+2,10,base-deck-25,'#a5b7a4');isoGlass(g,x+3,deck+10,span-6,21);isoBox(g,x-4,base-30,span+8,10,4,'#718f8a');}
  if(L===8){isoBox(g,x,base-22,span,10,base-deck-22,'#b7c7b8');isoGlass(g,x+3,deck+14,span-6,25);isoBox(g,x-5,deck+40,span+10,10,5,'#718e8e');}
  if(L===9){isoBox(g,x-2,base-25,span+4,10,base-deck-25,'#a3b7ad');isoGlass(g,x+2,deck+13,span-4,31);isoBox(g,x-5,deck+48,span+10,10,4,'#c1ab72');}
  isoBox(g,x-5,deck+4,span+10,d+2,6,L>=6?'#789995':'#b59765');
  if(L>=5){isoBox(g,x-1,deck-1,span+2,8,21,L>=7?'#879f98':'#b7a47b');isoGlass(g,x+3,deck-18,span-6,12);}
  if(L===1){g.strokeStyle='#91764e';g.lineWidth=1.5;g.beginPath();g.moveTo(x-3,deck-5);g.lineTo(x+span+3,deck-5);g.stroke();}
  else if(L<=4){artPosts(g,x-1,deck,span+2,20,timber);isoRoof(g,x-4,deck-20,span+8,10,L===2?9:L===3?14:19,L===2?'#9a7956':L===3?'#607f6c':'#586f81');}
  else if(L===5){isoRoof(g,x-4,deck-22,span+8,10,15,'#7e8a64');}
  else if(L===6){isoBox(g,x-6,deck-24,span+12,12,4,'#4e7885');}
  else if(L===7){isoBox(g,x-5,deck-23,span+10,10,4,'#799c93');for(var merlon=0;merlon<4;merlon++)isoBox(g,x-4+merlon*(span+7)/4,deck-27,5,5,6,'#afbeab');}
  else if(L===8){isoBox(g,x-6,deck-24,span+12,12,4,'#98b8af');for(var solar=0;solar<3;solar++){artPoly(g,[[x+solar*10,deck-29],[x+8+solar*10,deck-29],[x+13+solar*10,deck-34],[x+5+solar*10,deck-34]],'#315e79');}}
  else{isoRoof(g,x-6,deck-22,span+12,12,16,'#3f6976',true);isoBox(g,cx-7,deck-28,14,7,6,'#9ab0a1');isoRoof(g,cx-9,deck-34,18,7,7,'#50788a');}
  g.strokeStyle=L>=6?'#bdd1c0':'#c9ad78';g.lineWidth=1.5;for(var rail=0;rail<=4;rail++){var rx=x-4+rail*(span+8)/4;g.beginPath();g.moveTo(rx,deck+1);g.lineTo(rx,deck-5);g.stroke();}g.beginPath();g.moveTo(x-4,deck-5);g.lineTo(x+span+4,deck-5);g.lineTo(x+span+12,deck-10);g.stroke();
  g.strokeStyle='#726748';g.lineWidth=1.4;g.beginPath();g.moveTo(x+span+4,base-23);g.lineTo(x+span+1,deck+8);g.moveTo(x+span+10,base-26);g.lineTo(x+span+7,deck+5);g.stroke();for(var step=0;step<10;step++){var u=step/10,yy=base-24+(deck+8-base+24)*u,xx=x+span+4-3*u;isoBox(g,xx,yy,6,3,1.5,'#b7a075');}
  g.fillStyle='#3b4c3c';rr(g,cx-4,base-16,8,16,4);g.fill();g.fillStyle='#b4915d';g.fillRect(cx-2,base-12,4,12);
  if(L>=2){var previousAim=towerAim,previousAng=towerAng;towerAim=aim||0;towerAng=angle||0;drawTowerWpn(g,cx,deck-2,L);towerAim=previousAim;towerAng=previousAng;}
  if(L>=5){lantern(g,x-5,deck+12,true);lantern(g,x+span+6,deck+7,true);}g.restore();
}

var PLOT_DRAW={
  sawmill:drawWorkshop,smokehouse:drawWorkshop,smelter:drawWorkshop,factory:drawWorkshop,
  tower:function(g,m,nt){
    g.save();if(TOWERHIT>0&&!S.towerDown)g.translate(Math.sin(time*60)*TOWERHIT*3,0);
    drawWatchtower(g,m.x+m.w/2,m.y+m.h,m.w,m.h,S.tower,S.towerDown,towerAim,towerAng,nt);
    if(isWinter()&&TOWERHP>0&&TOWERHP<towerMax()){var k=TOWERHP/towerMax();g.fillStyle='#44534a';rr(g,TOWER.x-18,m.y+m.h+3,36,3,1);g.fill();g.fillStyle='#a9c3a2';rr(g,TOWER.x-18,m.y+m.h+3,36*k,3,1);g.fill();}g.restore();
  },
  smoke:function(g,m,nt){
    g.fillStyle='rgba(40,30,20,.16)';g.fillRect(m.x+30,m.y+12,m.w-34,m.h-14);
    /* brick hut */
    g.fillStyle='#b8664a';g.fillRect(m.x+28,m.y+10,m.w-36,m.h-14);
    g.strokeStyle='rgba(80,35,20,.3)';g.lineWidth=.8;for(var by=m.y+14;by<m.y+m.h-4;by+=5){g.beginPath();g.moveTo(m.x+28,by);g.lineTo(m.x+m.w-8,by);g.stroke();}
    g.fillStyle='#5b4636';g.beginPath();g.moveTo(m.x+24,m.y+12);g.lineTo(m.x+34,m.y+2);g.lineTo(m.x+m.w-14,m.y+2);g.lineTo(m.x+m.w-4,m.y+12);g.closePath();g.fill();
    g.fillStyle='#7a4a38';g.fillRect(m.x+m.w-26,m.y-8,8,12);
    for(var sm=0;sm<4;sm++){var ph=(time*.45+sm*.25)%1;g.fillStyle='rgba(215,215,215,'+(.6*(1-ph))+')';g.beginPath();blob(g,m.x+m.w-22+Math.sin(ph*5+sm)*4,m.y-10-ph*20,2.5+ph*4);g.fill();}
    g.fillStyle=nt>.05?'rgba(255,170,90,'+(.55+.4*nt)+')':'#3e2a22';rr(g,m.x+48,m.y+20,16,14,2);g.fill();
    if(nt<=.05){g.fillStyle='rgba(255,140,60,'+(.5+.3*Math.sin(time*7))+')';g.fillRect(m.x+51,m.y+28,10,4);}
    /* drying rack with fish */
    g.strokeStyle='#8a6a44';g.lineWidth=1.6;g.beginPath();g.moveTo(m.x+4,m.y+m.h-2);g.lineTo(m.x+4,m.y+10);g.moveTo(m.x+24,m.y+m.h-2);g.lineTo(m.x+24,m.y+10);g.moveTo(m.x+3,m.y+12);g.lineTo(m.x+25,m.y+12);g.stroke();
    for(var fi=0;fi<3;fi++){g.save();g.translate(m.x+8+fi*7,m.y+21+Math.sin(time*1.5+fi)*.6);g.rotate(Math.PI/2);g.scale(.62,.62);fishShape(g,'#b0784a',true);g.restore();}
  },
  motor:function(g,m,nt){
    g.fillStyle='rgba(40,30,20,.16)';g.fillRect(m.x+4,m.y+12,m.w-4,m.h-12);
    g.fillStyle='#cdbb9c';g.fillRect(m.x+2,m.y+10,m.w-6,m.h-12);
    g.fillStyle='#6b7f8e';g.beginPath();g.moveTo(m.x-2,m.y+12);g.lineTo(m.x+8,m.y+2);g.lineTo(m.x+m.w-10,m.y+2);g.lineTo(m.x+m.w,m.y+12);g.closePath();g.fill();
    var gx=m.x+30,gy=m.y+28,spin=time*(1+S.trunk*.6);
    g.save();g.translate(gx,gy);g.rotate(spin);g.fillStyle='#7d746a';for(var t2=0;t2<8;t2++){g.save();g.rotate(t2*.785);g.fillRect(-2,-10,4,4.5);g.restore();}g.beginPath();blob(g,0,0,7);g.fill();g.fillStyle='#cdbb9c';g.beginPath();blob(g,0,0,2.6);g.fill();g.restore();
    g.save();g.translate(gx+20,gy+4);g.rotate(-spin*1.6);g.fillStyle='#9a8f82';for(var t3=0;t3<6;t3++){g.save();g.rotate(t3*1.047);g.fillRect(-1.5,-6.5,3,3.2);g.restore();}g.beginPath();blob(g,0,0,4.5);g.fill();g.restore();
    g.fillStyle=nt>.05?'rgba(255,214,120,'+(.5+.4*nt)+')':'#a9d3e3';rr(g,m.x+m.w-26,m.y+18,12,9,2);g.fill();
  },
  yard:function(g,yd){
    g.fillStyle='#c9a26f';rr(g,yd.x+2,yd.y+10,yd.w-4,yd.h-12,4);g.fill();
    g.strokeStyle='rgba(90,60,30,.3)';g.lineWidth=1;for(var pl=yd.y+16;pl<yd.y+yd.h-4;pl+=6){g.beginPath();g.moveTo(yd.x+4,pl);g.lineTo(yd.x+yd.w-4,pl);g.stroke();}
    var stacks=Math.min(12,2+S.pile*2);
    for(var li=0;li<stacks;li++){var lx=yd.x+16+(li%4)*8,ly=yd.y+34-Math.floor(li/4)*4;g.fillStyle='#a07a50';rr(g,lx-4,ly-2,8,4,2);g.fill();g.fillStyle='rgba(255,236,190,.6)';g.beginPath();blob(g,lx+3,ly,1.3);g.fill();}
    for(var cr2=0;cr2<Math.min(4,1+Math.floor(S.pile/2));cr2++){var cx=yd.x+60+(cr2%2)*12,cy=yd.y+26-Math.floor(cr2/2)*10;g.fillStyle='#c79a63';rr(g,cx,cy,11,10,1.5);g.fill();g.strokeStyle='rgba(90,60,30,.4)';g.strokeRect(cx+.5,cy+.5,10,9);}
  },
  lodge:function(g,ld,nt){
    g.fillStyle='rgba(40,30,20,.16)';g.fillRect(ld.x+4,ld.y+14,ld.w-6,ld.h-18);
    g.fillStyle='#ecd2a8';g.fillRect(ld.x+2,ld.y+12,ld.w-8,ld.h-18);
    g.fillStyle='#6f9a5a';g.beginPath();g.moveTo(ld.x-3,ld.y+14);g.lineTo(ld.x+14,ld.y+1);g.lineTo(ld.x+ld.w-20,ld.y+1);g.lineTo(ld.x+ld.w-1,ld.y+14);g.closePath();g.fill();
    g.fillStyle='#8a6a44';g.fillRect(ld.x+ld.w-32,ld.y-6,7,10);
    for(var sm=0;sm<3;sm++){var ph=(time*.5+sm*.33)%1;g.fillStyle='rgba(235,235,235,'+(.55*(1-ph))+')';g.beginPath();blob(g,ld.x+ld.w-29+Math.sin(ph*5+sm)*3,ld.y-8-ph*18,2.2+ph*3.5);g.fill();}
    g.fillStyle='#9a6b40';rr(g,ld.x+ld.w/2-7,ld.y+22,12,20,3);g.fill();
    [ld.x+12,ld.x+ld.w-30].forEach(function(wx){g.fillStyle=nt>.05?'rgba(255,214,120,'+(.5+.45*nt)+')':'#a9d3e3';rr(g,wx,ld.y+18,15,10,2);g.fill();g.strokeStyle='#8a6a44';g.lineWidth=1;g.strokeRect(wx+.5,ld.y+18.5,14,9);});
  },
  mill:function(g,m){
    g.fillStyle='rgba(40,30,20,.16)';g.fillRect(m.x+4,m.y+14,m.w-4,m.h-18);
    g.fillStyle='#8a6a44';g.fillRect(m.x+4,m.y+10,3,m.h-16);g.fillRect(m.x+m.w-8,m.y+10,3,m.h-16);
    g.fillStyle='#a0522d';g.beginPath();g.moveTo(m.x,m.y+12);g.lineTo(m.x+10,m.y+2);g.lineTo(m.x+m.w-10,m.y+2);g.lineTo(m.x+m.w,m.y+12);g.closePath();g.fill();
    g.fillStyle='#b98b5e';rr(g,m.x+10,m.y+30,m.w-22,7,2);g.fill();
    var lx=m.x+18+((time*14)%40);g.fillStyle='#c9a26f';rr(g,lx-12,m.y+24,24,6,3);g.fill();g.fillStyle='rgba(255,236,190,.7)';g.beginPath();blob(g,lx+11,m.y+27,2.2);g.fill();
    var sx=m.x+m.w/2+6,sy=m.y+24;g.save();g.translate(sx,sy);g.rotate(time*(8+S.mill*3));g.fillStyle='#c9ced4';g.beginPath();for(var k=0;k<12;k++){var an=k*.5236;g.lineTo(Math.cos(an)*9,Math.sin(an)*9);g.lineTo(Math.cos(an+.26)*7,Math.sin(an+.26)*7);}g.closePath();g.fill();g.fillStyle='#7d746a';g.beginPath();blob(g,0,0,2);g.fill();g.restore();
    if(Math.random()<.3)parts.push({x:sx+6,y:sy+4,vx:10+Math.random()*16,vy:-8-Math.random()*8,g:40,life:.5,max:.5,col:'#f0d9a8',r:1});
  }
};
/* storage shed on the lot: goods pile up here and the truck loads straight from it */
/* Oblique miniature architecture: consistent top-left light, real depth and cast shadows. */
function artPoly(g,points,color){g.fillStyle=color;g.beginPath();points.forEach(function(p,i){if(i)g.lineTo(p[0],p[1]);else g.moveTo(p[0],p[1]);});g.closePath();g.fill();}
function artShade(hex,factor){var n=parseInt(hex.slice(1),16);return '#'+[n>>16,(n>>8)&255,n&255].map(function(c){return Math.max(0,Math.min(255,Math.round(c*factor))).toString(16).padStart(2,'0');}).join('');}
function isoBox(g,x,y,w,d,h,color){
  var rise=d*.58;artPoly(g,[[x+3,y+2],[x+w+3,y+2],[x+w+d+9,y-rise+7],[x+d+9,y-rise+7]],'rgba(25,43,39,.16)');
  var face=g.createLinearGradient(x,y-h,x+w,y);face.addColorStop(0,artShade(color,1.13));face.addColorStop(.5,color);face.addColorStop(1,artShade(color,.87));g.fillStyle=face;g.fillRect(x,y-h,w,h);
  artPoly(g,[[x+w,y-h],[x+w+d,y-h-rise],[x+w+d,y-rise],[x+w,y]],artShade(color,.66));
  artPoly(g,[[x,y-h],[x+d,y-h-rise],[x+w+d,y-h-rise],[x+w,y-h]],artShade(color,1.25));
  g.strokeStyle=artShade(color,1.34);g.lineWidth=.8;g.beginPath();g.moveTo(x,y-h);g.lineTo(x+w,y-h);g.lineTo(x+w+d,y-h-rise);g.stroke();
}
function isoRoof(g,x,y,w,d,h,color,metal){
  var rise=d*.58;artPoly(g,[[x-3,y],[x+w/2,y-h],[x+w+3,y]],artShade(color,.84));
  artPoly(g,[[x-3,y],[x+w/2,y-h],[x+w/2+d,y-h-rise],[x+d-3,y-rise]],artShade(color,1.17));
  artPoly(g,[[x+w/2,y-h],[x+w+3,y],[x+w+d+3,y-rise],[x+w/2+d,y-h-rise]],artShade(color,.71));
  g.strokeStyle=artShade(color,1.4);g.lineWidth=.8;g.beginPath();g.moveTo(x-3,y);g.lineTo(x+w/2,y-h);g.lineTo(x+w/2+d,y-h-rise);g.stroke();
  g.strokeStyle=artShade(color,.62);g.lineWidth=metal?.75:.5;for(var seam=1;seam<7;seam++){var t=seam/7;g.beginPath();g.moveTo(x-3+(w/2+3)*t,y-h*t);g.lineTo(x+d-3+(w/2+3)*t,y-h*t-rise);g.stroke();}
  g.fillStyle='#edf0e4';g.beginPath();g.moveTo(x+w/2-7,y-h+4);g.lineTo(x+w/2,y-h);g.lineTo(x+w/2+d,y-h-rise);g.lineTo(x+w/2+d+4,y-h-rise+3);g.lineTo(x+w/2+4,y-h+4);g.closePath();g.fill();
  g.fillStyle=artShade(color,.55);g.fillRect(x-3,y,w+6,2.5);
}
function isoGlass(g,x,y,w,h){
  g.fillStyle='#314f57';g.fillRect(x-1,y-1,w+2,h+2);var glass=g.createLinearGradient(x,y,x+w,y+h);glass.addColorStop(0,'#d1e7e2');glass.addColorStop(.38,'#7cafb9');glass.addColorStop(1,'#2e6274');g.fillStyle=glass;g.fillRect(x,y,w,h);
  artPoly(g,[[x+1,y+1],[x+w*.6,y+1],[x+1,y+h*.7]],'rgba(250,255,243,.35)');g.strokeStyle='#e3ddc6';g.lineWidth=1;g.strokeRect(x,y,w,h);for(var p=x+9;p<x+w;p+=9){g.beginPath();g.moveTo(p,y);g.lineTo(p,y+h);g.stroke();}
}
function isoTank(g,x,y,w,h,color){
  var metal=g.createLinearGradient(x-w/2,0,x+w/2,0);metal.addColorStop(0,artShade(color,.58));metal.addColorStop(.25,artShade(color,1.18));metal.addColorStop(.55,color);metal.addColorStop(1,artShade(color,.55));g.fillStyle=metal;g.fillRect(x-w/2,y-h,w,h);g.beginPath();g.ellipse(x,y,w/2,w*.22,0,0,7);g.fill();
  g.fillStyle=artShade(color,1.3);g.beginPath();g.ellipse(x,y-h,w/2,w*.22,0,0,7);g.fill();g.strokeStyle=artShade(color,.55);g.lineWidth=.7;g.beginPath();g.ellipse(x,y-h,w/2,w*.22,0,0,7);g.stroke();
  [y-h*.25,y-h*.75].forEach(function(yy){g.strokeStyle=artShade(color,.67);g.lineWidth=1.3;g.beginPath();g.ellipse(x,yy,w/2,w*.16,0,0,Math.PI);g.stroke();});
}
function artPosts(g,x,base,w,height,color){[0,w-3].forEach(function(px){isoBox(g,x+px,base,3,3,height,color);});g.strokeStyle=artShade(color,.65);g.lineWidth=2;g.beginPath();g.moveTo(x+2,base-height+13);g.lineTo(x+13,base-height+3);g.moveTo(x+w-2,base-height+13);g.lineTo(x+w-13,base-height+3);g.stroke();}
function artBricks(g,x,y,w,h){g.strokeStyle='rgba(63,44,33,.28)';g.lineWidth=.55;for(var r=0;r<h;r+=7){g.beginPath();g.moveTo(x,y+r);g.lineTo(x+w,y+r);for(var c=(r%14?5:0);c<w;c+=11){g.moveTo(x+c,y+r);g.lineTo(x+c,y+Math.min(h,r+7));}g.stroke();}}
function drawIndustrialBuilding(g,pl,L){
  var b=pl.def,x=pl.shedLeft?46:4,base=118,w=76,d=10,wood='#edab54',brick='#df7953',metal='#42b9c6',roof='#197fab';
  var heights=[28,42,52,64,60,72,82,94],h=heights[L-1],wall=[wood,'#ffc778','#d98e43',brick,'#83d6d4',metal,'#258ebd','#c4f0e4'][L-1];
  isoBox(g,x-3,base+8,w+3,d+1,8,'#a7b2a0');
  if(b==='mill'){
    if(L===1){isoBox(g,x+4,base-2,58,9,16,'#ad8250');isoTank(g,x+22,base-17,13,32,'#ac8758');}
    if(L===2){artPosts(g,x,base,w,43,wood);isoBox(g,x+3,base-1,w-8,8,17,'#52c291');isoRoof(g,x,base-43,w,d,13,'#aa825a');}
    if(L===3||L===4){isoBox(g,x,base,w,d,h,wall);g.fillStyle='#263f39';g.fillRect(x+7,base-36,w-14,30);artPosts(g,x+4,base,w-8,h,wood);isoRoof(g,x,base-h,w,d,L===3?18:26,L===3?'#249970':'#537fc4');if(L===4)isoGlass(g,x+20,base-h+5,35,13);}
    if(L===5){isoBox(g,x,base,w-12,d,60,'#c9b98c');isoRoof(g,x,base-60,w-12,d,26,'#179c91');g.fillStyle='#304b40';g.fillRect(x+7,base-34,42,28);isoTank(g,x+w-6,base-5,18,46,'#20aaa5');g.strokeStyle='#d9c894';g.lineWidth=2;for(var spoke=0;spoke<8;spoke++){var a=spoke*Math.PI/4;g.beginPath();g.moveTo(x+w-6,base-27);g.lineTo(x+w-6+Math.cos(a)*9,base-27+Math.sin(a)*9);g.stroke();}}
    if(L===6){artPosts(g,x,base,w,76,'#43bbb0');isoBox(g,x-2,base-72,w+3,12,8,'#298dad');isoBox(g,x+7,base-4,w-16,10,24,'#6cd7bd');isoGlass(g,x+8,base-65,58,24);}
    if(L===7){isoBox(g,x,base,w,d,64,'#43baca');isoGlass(g,x+5,base-59,w-10,23);isoBox(g,x+12,base-64,48,10,24,'#8be3ce');isoGlass(g,x+15,base-83,41,14);isoRoof(g,x+10,base-88,52,10,10,'#147c9d',true);}
    if(L===8){isoBox(g,x,base,w,d,70,'#c3cdbc');isoGlass(g,x+5,base-62,w-10,29);isoBox(g,x+3,base-70,32,12,33,'#748f91');isoGlass(g,x+6,base-96,25,18);isoBox(g,x+3,base-103,32,12,3,'#f1c342');artPosts(g,x+42,base,w-44,88,'#69858b');isoBox(g,x+37,base-83,w-35,12,5,'#ffbe43');}
    if(L>=5){g.strokeStyle='#dfbd72';g.lineWidth=2;g.beginPath();g.moveTo(x+4,base-30);g.lineTo(x+w-4,base-30);g.stroke();}
    isoBox(g,x+5,base+1,58,9,6,'#b68f5b');for(var log=0;log<3;log++){isoBox(g,x+51,base-8-log*4,19,7,3,'#d1b27c');}
  }else if(b==='smoke'){
    if(L<=2){for(var t=0;t<L;t++){isoTank(g,x+21+t*30,base-4,22,30+t*6,'#976c4d');isoBox(g,x+18+t*30,base-34-t*6,6,6,12,'#695b4e');}if(L===2){artPosts(g,x,base,w,54,wood);isoRoof(g,x,base-54,w,d,13,'#9e6847');}}
    if(L===3||L===4){isoBox(g,x,base,w,d,h,brick);artBricks(g,x,base-h,w,h);isoRoof(g,x,base-h,w,d,L===3?19:12,'#815c48');for(var f=0;f<(L===4?2:1);f++){isoBox(g,x+13+f*37,base-4,21,3,29,'#513f34');isoBox(g,x+19+f*37,base-h,9,8,L===4?30:20,'#a26d52');}}
    if(L===5){isoBox(g,x,base,31,d,57,'#c5b291');isoRoof(g,x,base-57,31,d,21,'#a47953');isoTank(g,x+57,base-4,32,69,'#748884');isoBox(g,x+53,base-73,8,8,20,'#5c7370');}
    if(L===6){isoBox(g,x,base,w,d,18,'#abb9ae');isoTank(g,x+21,base-18,26,62,'#aebfb8');isoTank(g,x+54,base-18,26,48,'#83a6a2');isoBox(g,x+5,base-4,66,4,13,'#647c77');}
    if(L===7){isoBox(g,x,base,w,d,64,'#b17955');artBricks(g,x,base-64,w,64);isoRoof(g,x,base-64,w,d,12,'#536f6b');isoBox(g,x+55,base-52,13,10,53,'#93694e');isoGlass(g,x+6,base-56,37,18);}
    if(L===8){isoBox(g,x,base,w,d,71,'#b8cebd');isoGlass(g,x+5,base-63,52,24);isoBox(g,x-1,base-71,w+2,13,4,'#66888b');isoTank(g,x+23,base-77,28,24,'#92b2ad');isoTank(g,x+55,base-77,21,18,'#708f98');isoBox(g,x+61,base-7,13,4,47,'#596e65');}
    g.fillStyle='#263b32';rr(g,x+10,base-27,19,23,7);g.fill();var heat=g.createLinearGradient(0,base-20,0,base-4);heat.addColorStop(0,'#99432e');heat.addColorStop(1,'#f2bd59');g.fillStyle=heat;rr(g,x+13,base-19,13,14,4);g.fill();
    if(L>=3){g.strokeStyle='#796043';g.lineWidth=1.5;g.beginPath();g.moveTo(x+37,base-26);g.lineTo(x+69,base-26);g.stroke();for(var fish=0;fish<4;fish++){g.fillStyle='#d4ab73';g.beginPath();g.ellipse(x+42+fish*7,base-19,2,5,0,0,7);g.fill();}}
  }else if(b==='smelt'){
    if(L===1){isoBox(g,x+14,base-3,42,15,38,'#999e8b');isoBox(g,x+21,base-41,28,12,6,'#737d6b');}
    if(L===2){isoBox(g,x+7,base,w-15,d,47,'#af8964');artPosts(g,x,base,w,65,'#9b7b55');isoRoof(g,x,base-65,w,d,12,'#8b7958');isoBox(g,x+48,base-40,12,10,38,'#766c5b');}
    if(L===3||L===4){isoBox(g,x+5,base,w-9,d,h,brick);artBricks(g,x+5,base-h,w-9,h);isoBox(g,x+18,base-h,37,10,L===3?24:33,'#9c7455');isoBox(g,x+15,base-h-(L===3?24:33),43,12,4,'#ccb899');if(L===4){isoTank(g,x+w-8,base-4,20,68,'#708e86');}}
    if(L===5){isoTank(g,x+37,base-2,52,70,'#77938b');isoBox(g,x+8,base-4,8,8,93,'#5d756f');isoBox(g,x+65,base-4,8,8,79,'#83998e');}
    if(L===6){isoTank(g,x+20,base-4,29,71,'#91a59a');isoTank(g,x+56,base-4,31,84,'#648b8b');isoBox(g,x+15,base-68,47,10,6,'#b1b7a2');}
    if(L===7){isoBox(g,x+9,base,57,d,76,'#779397');isoTank(g,x+37,base-76,43,24,'#a1b7ac');isoBox(g,x+3,base-4,8,9,92,'#617f76');isoGlass(g,x+50,base-52,18,20);}
    if(L===8){isoBox(g,x+2,base,w-3,11,83,'#a2b7a9');isoBox(g,x+13,base-83,52,13,23,'#587c89');isoBox(g,x+10,base-106,58,13,3,'#d1bd86');isoGlass(g,x+7,base-72,23,28);isoBox(g,x+50,base-7,19,6,51,'#5b7779');}
    g.fillStyle='#493c31';rr(g,x+26,base-30,24,27,9);g.fill();var glow=g.createLinearGradient(0,base-28,0,base-4);glow.addColorStop(0,'#bb5636');glow.addColorStop(.55,'#e98d3d');glow.addColorStop(1,'#ffdf8a');g.fillStyle=glow;rr(g,x+30,base-24,16,18,6);g.fill();isoBox(g,x+19,base+3,38,11,4,'#9b8c6e');
  }else{
    if(L===1){isoBox(g,x+5,base-5,61,12,19,'#ad956b');isoBox(g,x+11,base-24,19,5,15,'#738f8b');isoGlass(g,x+13,base-36,15,8);}
    if(L===2){artPosts(g,x,base,w,52,wood);isoRoof(g,x,base-52,w,d,15,'#648776');isoBox(g,x+5,base-5,61,10,22,'#8aa399');}
    if(L===3||L===4){isoBox(g,x,base,w,d,h,L===3?'#c7b187':'#9eb7b2');isoRoof(g,x,base-h,w,d,L===3?24:12,L===3?'#527b79':'#597b91');isoGlass(g,x+5,base-h+7,w-10,L===3?19:31);}
    if(L===5){isoBox(g,x,base,w,d,54,'#98b6aa');isoBox(g,x+43,base-54,31,10,38,'#5e8695');isoGlass(g,x+46,base-86,25,22);isoBox(g,x-2,base-54,w+4,11,4,'#778d80');}
    if(L===6){isoBox(g,x,base,w,d,70,'#b5cbc1');isoGlass(g,x+4,base-65,w-8,38);isoRoof(g,x,base-70,w,d,13,'#6c8893',true);isoTank(g,x+w-9,base-4,14,27,'#758e8d');}
    if(L===7){isoBox(g,x,base,w,d,65,'#7fa09e');isoGlass(g,x+4,base-59,w-8,31);isoBox(g,x+4,base-65,67,13,23,'#89aaa8');isoGlass(g,x+8,base-83,57,12);isoBox(g,x+2,base-88,72,13,3,'#d1c18d');}
    if(L===8){isoBox(g,x,base,w,d,79,'#c2d5c9');isoGlass(g,x+4,base-72,w-8,39);isoBox(g,x+36,base-79,40,11,26,'#567e8c');isoGlass(g,x+39,base-99,32,17);isoBox(g,x-3,base-79,42,15,4,'#b4c7b9');isoBox(g,x+33,base-105,45,12,3,'#dabf7d');}
    if(L>=3){isoBox(g,x+5,base-3,21,5,18,'#4a737a');isoGlass(g,x+7,base-18,16,9);}
    if(L>=6){var py=base-(L===6?78:L===7?91:83);for(var panel=0;panel<3;panel++){artPoly(g,[[x+4+panel*12,py],[x+14+panel*12,py],[x+20+panel*12,py-6],[x+10+panel*12,py-6]],'#315d7b');g.strokeStyle='#a9cad1';g.lineWidth=.5;g.stroke();}}
    g.fillStyle='#e3ce89';g.beginPath();g.moveTo(x+55,base-23);g.lineTo(x+47,base-12);g.lineTo(x+54,base-12);g.lineTo(x+50,base-4);g.lineTo(x+63,base-18);g.lineTo(x+55,base-18);g.closePath();g.fill();
  }
}
function drawWorkshopStorage(g,pl,L){
  var x=shedX(pl)+2,base=128,w=39,d=9,h=[30,40,48,59,69][L-1],col=['#a68a5f','#bfa175','#b9b8a1','#8bafb0','#c7d1be'][L-1];
  isoBox(g,x-2,base+4,w+3,d,5,'#adb39e');
  if(L===1){isoBox(g,x,base,w,d,5,col);artPosts(g,x,base,w,h,'#9e8052');}
  else{isoBox(g,x,base,w,d,h,col);if(L===3)artBricks(g,x,base-h,w,h);if(L>=4)isoGlass(g,x+3,base-h+5,w-6,12);}
  if(L<=3)isoRoof(g,x,base-h,w,d,L===2?12:7,L===1?'#90754f':L===2?'#6f8c77':'#597681');else isoBox(g,x-2,base-h,w+4,d+1,3,L===4?'#426e7d':'#bbad72');
  g.fillStyle='#30433a';g.fillRect(x+3,base-23,w-6,21);g.fillStyle='#ab9066';g.fillRect(x+3,base-12,w-6,2);
  if(L>=3){isoBox(g,x+2,base-24,w-4,2,4,'#809086');}if(L===5){isoTank(g,x+19,base-h-3,12,12,'#859e99');}
}
function drawWorkshop(g,pl){
  var b=pl.def,L=S[b]||1,SL=(S.pst&&S.pst[b])||0,key='industrial-3d-v2-'+b+'-'+L+'-'+SL+'-'+pl.w;
  var art=tileImg(key,pl.w,function(c){
    isoBox(c,2,pl.h-5,pl.w-15,11,6,'#c6cbb8');c.strokeStyle='rgba(79,103,82,.18)';c.lineWidth=.6;for(var tile=14;tile<pl.w-8;tile+=14){c.beginPath();c.moveTo(tile,pl.h-11);c.lineTo(tile+6,pl.h-18);c.stroke();}
    drawIndustrialBuilding(c,pl,L);if(SL)drawWorkshopStorage(c,{x:0,y:0,w:pl.w,def:b,shedLeft:pl.shedLeft},SL);
    else{var sx=pl.shedLeft?3:pl.w-39;c.strokeStyle='#93a38c';c.setLineDash([2,3]);c.strokeRect(sx,88,32,38);c.setLineDash([]);}
  },pl.h);g.drawImage(art,pl.x,pl.y,pl.w,pl.h);
  var busy=procBusy[b]>0,cur=procCur[b],pr=cur?Math.min(1,procT[b]/cur.t):0,mx=pl.x+(pl.shedLeft?46:4);
  if(b==='mill'){
    var blades=L>=4?2:1;for(var blade=0;blade<blades;blade++){g.save();g.translate(mx+26+blade*19,pl.y+105);g.rotate(time*(busy?6+L:1));g.fillStyle='#e3e8dc';g.strokeStyle='#708a87';g.lineWidth=.7;g.beginPath();for(var tooth=0;tooth<18;tooth++){var an=tooth*Math.PI/9;g.lineTo(Math.cos(an)*9,Math.sin(an)*9);g.lineTo(Math.cos(an+.1)*7,Math.sin(an+.1)*7);}g.closePath();g.fill();g.stroke();g.fillStyle='#6e8884';g.beginPath();g.arc(0,0,2,0,7);g.fill();g.restore();}
    isoBox(g,mx+7+(busy?(time*8)%8:2),pl.y+121,35,5,5,'#c19b66');
  }
  if(busy){var puff=(time*.55)%1;g.fillStyle='rgba(250,246,229,'+(.35*(1-puff))+')';g.beginPath();g.ellipse(mx+61+puff*5,pl.y+22-puff*13,2+puff*3,2+puff*3,0,0,7);g.fill();g.fillStyle='#d1ad5d';rr(g,pl.x+8,pl.y+pl.h-4,(pl.w-16)*pr,2,1);g.fill();}
  if(cur)drawItem(g,cur.id,mx+40,pl.y+123,.55);
  if(SL){var sx=shedX(pl)+7,stocks=PROC[b].goods.filter(function(id){return whN(id)>0;}),units=[];stocks.forEach(function(id){for(var n=0;n<Math.min(12,whN(id));n++)units.push(id);});units.slice(0,12).forEach(function(id,i){drawItem(g,id,sx+(i%4)*8,pl.y+123-Math.floor(i/4)*7,.38);});g.fillStyle='#eaf1df';g.font='600 5px sans-serif';g.textAlign='center';g.fillText(storeN(b)+' / '+storeCap(b),shedX(pl)+21,pl.y+98);}
}

var BOARD={x:6,y:188,w:52,h:44};
function drawBoard(){
  var g=ctx,b=BOARD;
  g.fillStyle='#8a6a44';g.fillRect(b.x+6,b.y+b.h-8,3,12);g.fillRect(b.x+b.w-9,b.y+b.h-8,3,12);
  g.fillStyle='rgba(40,30,20,.18)';rr(g,b.x+2,b.y+2,b.w,b.h-4,4);g.fill();
  g.fillStyle='#b98b5e';rr(g,b.x,b.y,b.w,b.h-4,4);g.fill();
  g.fillStyle='#f6ecd2';rr(g,b.x+3,b.y+10,b.w-6,b.h-17,2);g.fill();
  g.font='800 7px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff3d6';g.fillText('시장 게시판',b.x+b.w/2,b.y+5.5);
  if(HOT.id){
    var bob=Math.sin(time*3)*1;drawItem(g,HOT.id,b.x+13,b.y+21+bob,1);
    g.fillStyle='#e2463c';g.font='800 8px sans-serif';g.textAlign='left';g.fillText('+50%',b.x+22,b.y+21);
    g.fillStyle='#5b4636';g.font='700 6.5px sans-serif';g.textAlign='center';g.fillText(ITEMS[HOT.id].name,b.x+b.w/2,b.y+32);
    var pct=Math.max(0,HOT.t/HOT.dur);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(b.x+6,b.y+37,b.w-12,2.5);g.fillStyle='#f0bb3f';g.fillRect(b.x+6,b.y+37,(b.w-12)*pct,2.5);
  }
  /* red pin */
  g.fillStyle='#e2463c';g.beginPath();blob(g,b.x+b.w-7,b.y+12,1.8);g.fill();
  if(S.whLv){g.font='700 6px sans-serif';g.fillStyle='#e2463c';g.textAlign='center';g.fillText('⚡ 급한 주문 '+rushCount,b.x+b.w/2,b.y+b.h+7);}
}
function drawPills(){PILLS=[];}

function drawMarketGround(){}

/* one straight belt run: rubber band inside a metal frame, chevrons moving toward the stall */
/* belt look by tier (belt level 1..5): frame colour, highlight, rubber, cleat */
var BTIER=[
  {name:'나무',fr:'#8a6440',hi:'#b98f5e',dk:'#5f4329',rub:'#4a3a2e',cl:'rgba(210,170,120,.45)',bolt:'#d9b98a'},
  {name:'강철',fr:'#7f8994',hi:'#c3cbd3',dk:'#555d66',rub:'#34363c',cl:'rgba(200,210,220,.42)',bolt:'#e6ebf0'},
  {name:'산업',fr:'#d99a2b',hi:'#ffd978',dk:'#9a6a14',rub:'#2f3136',cl:'rgba(255,215,120,.5)',bolt:'#fff1c2',haz:1},
  {name:'고속',fr:'#3f73b8',hi:'#8fc2ff',dk:'#284d80',rub:'#262a33',cl:'rgba(140,200,255,.55)',bolt:'#dff0ff',haz:1},
  {name:'황금',fr:'#e0b23c',hi:'#fff3b0',dk:'#a8791a',rub:'#3a2d1c',cl:'rgba(255,236,150,.7)',bolt:'#fffbe0',haz:0,gold:1},
  {name:'다이아',fr:'#5fc8dc',hi:'#dffaff',dk:'#2f7f92',rub:'#1c2c36',cl:'rgba(190,245,255,.65)',bolt:'#ffffff',gold:1},
  {name:'루비',fr:'#d0435a',hi:'#ffc0cb',dk:'#8a2233',rub:'#2a181c',cl:'rgba(255,180,190,.6)',bolt:'#fff0f3',gold:1},
  {name:'무지개',fr:'#9a5ab8',hi:'#f6d8ff',dk:'#5f2f7a',rub:'#231a2e',cl:'rgba(255,240,150,.7)',bolt:'#fffbe0',gold:1,rainbow:1}
];
function tierOfBelt(L){return BTIER[Math.max(0,Math.min(BTIER.length-1,(L||1)-1))];}
/* v50 (perf): the frame, rubber, legs and bolts of a belt run never move - paint them once per (path, width, tier) into a small cached canvas;
   only the cleats, chevrons and sparkles are drawn each frame */
var BELTC={};
function beltGeo(x0,y0,x1,y1,w){var hor=Math.abs(y1-y0)<.5,len=hor?Math.abs(x1-x0):Math.abs(y1-y0),rl=Math.max(2.4,w*.2);
  return {hor:hor,len:len,rl:rl,rx:hor?Math.min(x0,x1):x0-w/2,ry:hor?y0-w/2:Math.min(y0,y1),rw:hor?len:w,rh:hor?w:len};}
function beltStatic(G,P,w){var key=[G.rx,G.ry,G.rw,G.rh,w,P.name].join(','),c=BELTC[key];if(c)return c;
  var pad=G.rl+9,bx=G.rx-pad,by=G.ry-pad,bw=G.rw+pad*2,bh=G.rh+pad*2;c=document.createElement('canvas');c.width=Math.ceil(bw*RS);c.height=Math.ceil(bh*RS);
  var g=c.getContext('2d');g.setTransform(RS,0,0,RS,-bx*RS,-by*RS);var hor=G.hor,rx=G.rx,ry=G.ry,rw=G.rw,rh=G.rh,rl=G.rl;
  /* shadow + support legs */
  g.fillStyle='rgba(40,30,20,.22)';g.fillRect(rx+2,ry+3.5,rw,rh);
  g.fillStyle=P.dk;
  if(hor){for(var lx=rx+8;lx<rx+rw-4;lx+=22){g.fillRect(lx-1.2,ry+rh+rl-1,2.4,4.5);g.fillRect(lx-2.6,ry+rh+rl+3,5.2,1.6);}}
  else{for(var ly=ry+10;ly<ry+rh-4;ly+=22){g.fillRect(rx-rl-4,ly-1.2,4,2.4);g.fillRect(rx+rw+rl,ly-1.2,4,2.4);}}
  /* Bevelled housing and slender parallel rails, with inset polished rollers. */
  var frame=hor?g.createLinearGradient(0,ry-rl,0,ry+rh+rl):g.createLinearGradient(rx-rl,0,rx+rw+rl,0);
  frame.addColorStop(0,P.hi);frame.addColorStop(.22,P.fr);frame.addColorStop(.72,P.fr);frame.addColorStop(1,P.dk);
  g.fillStyle=frame;rr(g,rx-rl,ry-rl,rw+rl*2,rh+rl*2,3.5);g.fill();
  g.strokeStyle='rgba(39,59,48,.4)';g.lineWidth=.6;rr(g,rx-rl,ry-rl,rw+rl*2,rh+rl*2,3.5);g.stroke();
  g.fillStyle='rgba(244,240,213,.5)';if(hor)g.fillRect(rx,ry-rl+.6,rw,.8);else g.fillRect(rx-rl+.6,ry,.8,rh);
  /* rubber surface with a soft cylinder shading */
  var gr=hor?g.createLinearGradient(0,ry,0,ry+rh):g.createLinearGradient(rx,0,rx+rw,0);
  gr.addColorStop(0,'rgba(0,0,0,.3)');gr.addColorStop(.25,'rgba(166,196,171,.18)');gr.addColorStop(.65,'rgba(154,186,162,.08)');gr.addColorStop(1,'rgba(0,0,0,.3)');
  g.fillStyle=P.rub;g.fillRect(rx,ry,rw,rh);g.fillStyle=gr;g.fillRect(rx,ry,rw,rh);
  /* bolts on the rails */
  g.fillStyle=P.bolt;
  if(hor){for(var bx2=rx+4;bx2<rx+rw-2;bx2+=20){g.fillRect(bx2,ry-rl+.6,1.1,1.1);g.fillRect(bx2,ry+rh+rl-1.7,1.1,1.1);}}
  else{for(var by2=ry+4;by2<ry+rh-2;by2+=20){g.fillRect(rx-rl+.6,by2,1.1,1.1);g.fillRect(rx+rw+rl-1.7,by2,1.1,1.1);}}
  c.bx=bx;c.by=by;c.bw=bw;c.bh=bh;BELTC[key]=c;return c;}
function beltRun(g,x0,y0,x1,y1,w,sp,tier){
  var G=beltGeo(x0,y0,x1,y1,w),len=G.len;if(len<1)return;
  var P=typeof tier==='object'?tier:tierOfBelt(tier),hor=G.hor,dir=hor?(x1>x0?1:-1):(y1>y0?1:-1),rx=G.rx,ry=G.ry,rw=G.rw,rh=G.rh;
  var c=beltStatic(G,P,w);g.drawImage(c,c.bx,c.by,c.bw,c.bh);
  /* moving cleats */
  g.save();g.beginPath();g.rect(rx,ry,rw,rh);g.clip();
  var gap=10,o=((time*sp*dir)%gap+gap)%gap;g.fillStyle=P.cl;
  for(var p=o-gap;p<len+gap;p+=gap){if(P.rainbow)g.fillStyle='hsla('+((p*9+time*120)%360)+',90%,72%,.8)';if(hor){rr(g,rx+p,ry+1.2,1.1,rh-2.4,.5);g.fill();}else{rr(g,rx+1.2,ry+p,rw-2.4,1.1,.5);g.fill();}}
  /* direction chevrons every 18px, faint: one path, one stroke */
  g.strokeStyle='rgba(223,235,218,.18)';g.lineWidth=1;var o2=((time*sp*dir)%18+18)%18;g.beginPath();
  for(var q=o2-18;q<len+18;q+=18){if(hor){var xx=rx+q;g.moveTo(xx-dir*1.6,ry+rh*.28);g.lineTo(xx+dir*1.2,y0);g.lineTo(xx-dir*1.6,ry+rh*.72);}else{var yy=ry+q;g.moveTo(rx+rw*.28,yy-dir*1.6);g.lineTo(x0,yy+dir*1.2);g.lineTo(rx+rw*.72,yy-dir*1.6);}}
  g.stroke();
  if(P.gold){for(var s=0;s<3;s++){var ph=(time*.7+s*.33)%1,sx=hor?rx+ph*rw:x0+Math.sin(time*3+s)*w*.3,sy=hor?y0+Math.sin(time*3+s)*w*.3:ry+ph*rh;
    g.fillStyle='rgba(255,250,210,'+(.8*(1-Math.abs(ph-.5)*2))+')';g.fillRect(sx-1.5,sy-.3,3,.6);g.fillRect(sx-.3,sy-1.5,.6,3);}}
  g.restore();
}
/* hazard-striped end cap on industrial tiers */
function beltCap(g,x,y,w,hor,P){g.save();g.translate(x,y);if(!hor)g.rotate(Math.PI/2);
  g.fillStyle=P.dk;rr(g,-3,-w/2-2,6,w+4,2);g.fill();
  var roller=g.createLinearGradient(-2,0,2,0);roller.addColorStop(0,'#6d7e76');roller.addColorStop(.45,'#d2ddd0');roller.addColorStop(1,'#80928a');g.fillStyle=roller;rr(g,-2,-w/2,4,w,1.5);g.fill();
  g.fillStyle=P.hi;g.beginPath();g.arc(0,-w/2-1,1.1,0,7);g.arc(0,w/2+1,1.1,0,7);g.fill();
  if(P.haz){g.fillStyle='#d1b777';g.fillRect(-2,-w/2-2,4,1.3);}
  g.restore();}
/* roller drum at corners / junctions: spins with belt speed */
function beltJoint(g,x,y,w,tier,sp){
  var P=typeof tier==='object'?tier:tierOfBelt(tier),r=w/2+2.6;
  g.fillStyle='rgba(40,30,20,.22)';g.beginPath();blob(g,x+1.5,y+2.5,r);g.fill();
  g.fillStyle=P.dk;g.beginPath();blob(g,x,y,r);g.fill();
  var gr=g.createRadialGradient(x-r*.35,y-r*.35,1,x,y,r);gr.addColorStop(0,P.hi);gr.addColorStop(1,P.fr);
  g.fillStyle=gr;g.beginPath();blob(g,x,y,r-1.2);g.fill();
  g.save();g.translate(x,y);g.rotate(time*(sp||80)/r*.6);g.strokeStyle=P.dk;g.lineWidth=1.1;
  for(var i=0;i<3;i++){g.rotate(2.094);g.beginPath();g.moveTo(0,0);g.lineTo(r-2.2,0);g.stroke();}g.restore();
  g.fillStyle=P.bolt;g.beginPath();blob(g,x,y,1.5);g.fill();
}
var BELTCOL={wood:'#5b4636',fish:'#34506a'};
function trunkTier(){return tierOfBelt(1+Math.min(4,S.trunk||0));}
function installedTiles(line){var l=[];SITES.forEach(function(st){if(owned(st.id)&&cvLv(st.id)>0&&st.line===line)l.push({sid:st.id,L:cvLv(st.id)});});return l;}
/* receiving chute: a little crate that bounces when goods land */
function drawChute(g,x,y,line,hp,P){
  if(hp>0){var gl=g.createRadialGradient(x+4,y,0,x+4,y,16);gl.addColorStop(0,'rgba(255,230,140,'+(.65*hp)+')');gl.addColorStop(1,'rgba(255,230,140,0)');g.fillStyle=gl;g.fillRect(x-12,y-16,32,32);}
  g.save();g.translate(x+5,y+1);g.scale(1+.18*hp,1-.14*hp);
  g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(1,8,8,2.4,0,0,7);g.fill();
  g.fillStyle=P.fr;g.beginPath();g.moveTo(-7,-7);g.lineTo(7,-7);g.lineTo(5,6);g.lineTo(-5,6);g.closePath();g.fill();
  g.fillStyle=P.hi;g.fillRect(-7,-7,14,1.6);
  g.fillStyle='#2f2a26';g.beginPath();g.ellipse(0,-6,5.6,1.8,0,0,7);g.fill();
  g.fillStyle=P.dk;g.fillRect(-5,1,10,1.2);g.restore();
}
function beltW(L){return 10+1.2*(Math.max(1,L||S.beltLv||1)-1);}
/* v75 (staff 1): each belt line is drawn with its own level (before, every belt used one shared level, so buying a line's belt upgrade changed nothing on screen),
   and an upgrade plays a transformation: a glowing wave runs from the loader to the end, turning the old belt into the new tier as it passes */
var PATHLINE={sale_f1:'wood',proc_f1:'wood',sale_p1:'fish',proc_p1:'fish',proc_m1:'iron',proc_el:'iron'},BELTFX={};
function pathLv(k){return lineBeltLv(PATHLINE[k]||'wood');}
function drawPath(g,k,P,sp,w){var pts=BPATH[k];w=w||beltW();
  for(var i=0;i<pts.length-1;i++)beltRun(g,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],w,sp,P);
  for(var j=1;j<pts.length-1;j++)beltJoint(g,pts[j][0],pts[j][1],w,P,sp);
  var a=pts[0],b=pts[1],e=pts[pts.length-1],f=pts[pts.length-2];beltCap(g,a[0],a[1],w,a[1]===b[1],P);beltCap(g,e[0],e[1],w,e[1]===f[1],P);}
function pathLen(k){var p=BPATH[k],n=0;for(var i=0;i<p.length-1;i++)n+=Math.hypot(p[i+1][0]-p[i][0],p[i+1][1]-p[i][1]);return n;}
function pathAt(k,d){var p=BPATH[k];for(var i=0;i<p.length-1;i++){var l=Math.hypot(p[i+1][0]-p[i][0],p[i+1][1]-p[i][1]);if(d<=l||i===p.length-2){var u=l?Math.min(1,d/l):0;return {x:p[i][0]+(p[i+1][0]-p[i][0])*u,y:p[i][1]+(p[i+1][1]-p[i][1])*u};}d-=l;}return {x:p[0][0],y:p[0][1]};}
function pathClip(g,k,d,pad){var p=BPATH[k];g.beginPath();for(var i=0;i<p.length-1&&d>0;i++){var x0=p[i][0],y0=p[i][1],x1=p[i+1][0],y1=p[i+1][1],l=Math.hypot(x1-x0,y1-y0),u=Math.min(1,d/l),ex=x0+(x1-x0)*u,ey=y0+(y1-y0)*u;
  g.rect(Math.min(x0,ex)-pad,Math.min(y0,ey)-pad,Math.abs(ex-x0)+pad*2,Math.abs(ey-y0)+pad*2);d-=l;}g.clip();}
function drawBeltPath(g,k){var line=PATHLINE[k],L=pathLv(k),P=tierOfBelt(L),sp=convSpeed(L),w=beltW(L),fx=BELTFX[line];
  if(!fx){drawPath(g,k,P,sp,w);return;}
  var k1=Math.min(1,fx.t/fx.dur),e=1-Math.pow(1-k1,2),len=pathLen(k),d=e*(len+16),P0=tierOfBelt(fx.from),w0=beltW(fx.from);
  drawPath(g,k,P0,sp,w0);
  g.save();pathClip(g,k,d,w/2+12);drawPath(g,k,P,sp,w);g.restore();
  if(k1<1){var h=pathAt(k,Math.min(len,d)),pu=.6+.4*Math.sin(time*30);
    var gl=g.createRadialGradient(h.x,h.y,0,h.x,h.y,16);gl.addColorStop(0,'rgba(255,250,210,'+(.95*pu)+')');gl.addColorStop(.4,'rgba(255,226,122,.55)');gl.addColorStop(1,'rgba(255,226,122,0)');g.fillStyle=gl;g.fillRect(h.x-16,h.y-16,32,32);
    if(Math.random()<.7)parts.push({x:h.x+(Math.random()-.5)*w,y:h.y+(Math.random()-.5)*w,vx:(Math.random()-.5)*50,vy:-20-Math.random()*30,g:90,life:.5,max:.5,col:Math.random()<.5?P.hi:'#fff1a8',r:1.6,spark:true});}}
function updateBeltFx(){for(var ln in BELTFX){var f=BELTFX[ln];f.t+=FDT;
  if(!f.end&&f.t>=f.dur){f.end=true;Object.keys(PATHLINE).forEach(function(k){if(PATHLINE[k]!==ln||!beltOn(k))return;var e=BPATH[k][BPATH[k].length-1];burst(e[0],e[1]-4,'#ffe27a',14,true);burst(e[0],e[1]-4,tierOfBelt(f.to).hi,10,true);});
    var k0=Object.keys(PATHLINE).filter(function(k){return PATHLINE[k]===ln&&beltOn(k);})[0];if(k0){var s0=BPATH[k0][0];addFloat(s0[0],s0[1]-18,'⚙️ '+tierOfBelt(f.to).name+' 벨트로 변신!','#ffe27a',true);}sfx('chime',.3);}
  if(f.t>=f.dur+.2)delete BELTFX[ln];}}
function beltCross(a,b){var pa=BPATH[a],pb=BPATH[b],out=[];
  for(var i=0;i<pa.length-1;i++)for(var j=0;j<pb.length-1;j++){var A0=pa[i],A1=pa[i+1],B0=pb[j],B1=pb[j+1],ah=A0[1]===A1[1],bh=B0[1]===B1[1];if(ah===bh)continue;
    var H0=ah?A0:B0,H1=ah?A1:B1,V0=ah?B0:A0,V1=ah?B1:A1,x=V0[0],y=H0[1];
    if(x>Math.min(H0[0],H1[0])+1&&x<Math.max(H0[0],H1[0])-1&&y>Math.min(V0[1],V1[1])+1&&y<Math.max(V0[1],V1[1])-1)out.push({x:x,y:y,bh:bh});}
  return out;}
function drawBelts(){
  var g=ctx,order=['proc_el','proc_m1','proc_f1','proc_p1','sale_p1','sale_f1'],drawn=[];
  updateBeltFx();
  order.forEach(function(k){if(!beltOn(k))return;var Pk=tierOfBelt(pathLv(k)),hb=beltW(pathLv(k))/2+3;
    drawn.forEach(function(u){beltCross(u,k).forEach(function(c){g.fillStyle='rgba(20,15,10,.3)';g.fillRect(c.x-hb,c.y-hb,hb*2,hb*2);});});
    drawBeltPath(g,k);
    drawn.forEach(function(u){beltCross(u,k).forEach(function(c){g.strokeStyle=Pk.hi;g.lineWidth=1.3;g.beginPath();
      if(c.bh){g.moveTo(c.x-hb-4,c.y-hb);g.lineTo(c.x+hb+4,c.y-hb);g.moveTo(c.x-hb-4,c.y+hb);g.lineTo(c.x+hb+4,c.y+hb);}else{g.moveTo(c.x-hb,c.y-hb-4);g.lineTo(c.x-hb,c.y+hb+4);g.moveTo(c.x+hb,c.y-hb-4);g.lineTo(c.x+hb,c.y+hb+4);}g.stroke();});});
    drawn.push(k);});
  drawSplitters(g);
  [['sale_f1','wood',hopP],['sale_p1','fish',hopP],['proc_f1','wood',hopW],['proc_p1','fish',hopW],['proc_m1','iron',hopW],['proc_el','elec',hopW]].forEach(function(o){if(!beltOn(o[0]))return;var e=BPATH[o[0]][BPATH[o[0]].length-1];drawChute(g,e[0]-5,e[1]-4,o[1],o[2][o[1]]||0,tierOfBelt(pathLv(o[0])));});
  belt.forEach(function(b){
    var by=b.y-2.5-Math.sin(b.hop*Math.PI)*3+Math.sin(time*22+b.seed)*.45,isc=.82+.14*(lineBeltLv(b.line==='elec'?'iron':b.line)-1);
    g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(b.x,b.y+2.2,4.6*isc/.82,1.6,0,0,7);g.fill();
    /* cargo stacks up: one layer per item in the batch */
    if(b.n>1){g.fillStyle='#b98b5e';rr(g,b.x-5*isc,by+.5,10*isc,3.4,1);g.fill();g.fillStyle='#8a6440';g.fillRect(b.x-5*isc,by+2.6,10*isc,1.2);}
    for(var sk=0;sk<b.n;sk++)drawItem(g,b.id,b.x+(sk%2?1:-1)*.6,by-1-sk*3.4*isc,isc);
    if(b.n>1){var ty0=by-5-(b.n-1)*3.4*isc-4*isc;g.font='800 7px sans-serif';g.textAlign='left';g.textBaseline='middle';g.lineWidth=2;g.strokeStyle='rgba(34,53,43,.8)';g.strokeText('×'+b.n,b.x+5*isc,ty0);g.fillStyle='#fff';g.fillText('×'+b.n,b.x+5*isc,ty0);}
  });
}
/* v87 (staff 1, t116): belt splitter - when a site has both the shop belt (up) and the workshop belt (down), a short feeder belt joins the loading deck
   to the workshop hopper, batches sent to the workshop slide down it, and a diverter sign on the deck shows where the next batch goes (lit arrow) */
function drawSplitters(g){
  for(var i=FEEDFX.length-1;i>=0;i--){FEEDFX[i].t+=FDT;if(FEEDFX[i].t>=.7)FEEDFX.splice(i,1);}
  for(var sk in SPLIT){SPLIT[sk].t+=FDT;}
  ['f1','p1'].forEach(function(sid){if(!owned(sid)||!cvLv(sid)||!beltOn('sale_'+sid)||!beltOn('proc_'+sid))return;
    var st=SITE[sid],x=pilePos(sid).x,y0=st.store.r*T+T,y1=st.xtT.r*T+16,L=cvLv(sid),P=tierOfBelt(L),w=beltW(L)*.8;
    beltRun(g,x,y0,x,y1,w,convSpeed(L),P);beltCap(g,x,y0+1,w,false,P);
    FEEDFX.forEach(function(f){if(f.sid!==sid)return;var k=f.t/.7,yy=y0+(y1-y0)*k;for(var sk2=0;sk2<Math.min(3,f.n);sk2++)drawItem(g,f.id,x+(sk2%2?.6:-.6),yy-3-sk2*3,.72);});
    /* diverter sign on the deck's left edge */
    var nx=splitNext(sid),sp=SPLIT[sid],fl=sp&&sp.t<.45?1-sp.t/.45:0,sx=st.store.c*T+9,sy=st.store.r*T+20;
    g.fillStyle='rgba(0,0,0,.18)';rr(g,sx-6,sy-13,14,28,4);g.fill();g.fillStyle='rgba(34,53,43,.88)';rr(g,sx-7,sy-14,14,28,4);g.fill();
    [['stall',-7,'▲'],['proc',7,'▼']].forEach(function(o){var on=nx===o[0],hit=sp&&sp.dest===o[0]&&fl>0;
      g.fillStyle=hit?'rgba(255,236,150,'+(.55+.45*fl)+')':(on?'#7be07f':'rgba(255,255,255,.22)');g.beginPath();g.arc(sx,sy+o[1],4.6,0,7);g.fill();
      g.font='900 5.5px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle=on||hit?'#22352b':'rgba(255,255,255,.7)';g.fillText(o[2],sx,sy+o[1]+.3);});
    g.font='800 5px sans-serif';g.textAlign='center';g.textBaseline='middle';var lab=nx==='stall'?'가게로':(nx==='proc'?(sid==='f1'?'제재소로':'훈제소로'):'대기'),tw=g.measureText(lab).width+6;
    g.fillStyle='rgba(255,252,240,.92)';rr(g,sx-tw/2,sy-23,tw,7.5,3.5);g.fill();g.fillStyle='#4a3a2c';g.fillText(lab,sx,sy-19);});
}
function drawRoad(){
  var g=ctx;
  TPROCS.forEach(function(b){if(!S[b])return;var ax=dockX(b);g.fillStyle='#c9c2b6';rr(g,ax-24,H-2,48,12,3);g.fill();g.fillStyle='rgba(0,0,0,.12)';for(var k=0;k<5;k++)g.fillRect(ax-20+k*9,H+1,6,1.2);
    g.fillStyle='rgba(90,80,60,.6)';g.font='800 6.5px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('🚚 상차',ax,H+6);});
}
function drawWarehouse(){
  var g=ctx,x0=WH.x0,x1=WH.x1,w=x1-x0;
  if(!S.whLv){
    if(!whUnlocked())return;
    g.strokeStyle='rgba(110,85,50,.55)';g.lineWidth=1.3;g.setLineDash([4,3]);rr(g,x0,WH.top,w,H-WH.top,6);g.stroke();g.setLineDash([]);
    g.fillStyle='rgba(255,250,235,.55)';rr(g,x0+1,WH.top+1,w-2,H-WH.top-2,6);g.fill();
    g.font='800 10px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#6b5433';g.fillText('창고 부지',x0+w/2,WH.top+30);
    g.font='600 8px sans-serif';g.fillStyle='#8a7654';g.fillText('발판에 서 있으면 지어져요',x0+w/2,WH.top+46);
    g.fillText('트럭이 대량으로 사가요',x0+w/2,WH.top+58);
    return;
  }
  var nt=nightAmt();
  g.fillStyle='rgba(40,30,20,.18)';g.fillRect(x0+4,WH.wall+4,w,H-WH.wall);
  /* plank walls */
  g.fillStyle='#d8b687';g.fillRect(x0,WH.wall,w,H-WH.wall);
  g.strokeStyle='rgba(120,85,45,.28)';g.lineWidth=1;for(var y=WH.wall+7;y<H;y+=7){g.beginPath();g.moveTo(x0,y);g.lineTo(x1,y);g.stroke();}
  g.fillStyle='#b8925f';g.fillRect(x0,WH.wall,3,H-WH.wall);g.fillRect(x1-3,WH.wall,3,H-WH.wall);
  /* roof */
  g.fillStyle='#b4513b';g.beginPath();g.moveTo(x0-5,WH.wall+2);g.lineTo(x0+10,WH.top);g.lineTo(x1-10,WH.top);g.lineTo(x1+5,WH.wall+2);g.closePath();g.fill();
  g.strokeStyle='rgba(255,220,200,.25)';g.lineWidth=1;for(var r2=0;r2<3;r2++){var yy=WH.top+4+r2*4.5;g.beginPath();g.moveTo(x0+6-r2*3.5,yy);g.lineTo(x1-6+r2*3.5,yy);g.stroke();}
  g.fillStyle='#8e3b2a';g.fillRect(x0+10,WH.top-2,w-20,3);
  /* windows glow at night */
  [x0+12,x1-20].forEach(function(wx){g.fillStyle=nt>.05?'rgba(255,214,120,'+(.45+.5*nt)+')':'#a9d3e3';rr(g,wx,WH.wall+8,9,8,1.5);g.fill();g.strokeStyle='#8a6a44';g.lineWidth=1;g.strokeRect(wx+.5,WH.wall+8.5,8,7);});
  /* rolling door: lifts while a truck is loading */
  var loading=trucks.some(function(t){return t.state==='load'&&t.dock===0;}),dw=34,dh=H-(WH.wall+30);
  WH.open=(WH.open||0)+((loading?1:0)-(WH.open||0))*.08;
  g.fillStyle='#4a3f36';g.fillRect(WH.door-dw/2,WH.wall+30,dw,dh);
  if(WH.open>.05){for(var b=0;b<3;b++){g.fillStyle=['#c79a63','#b98b5e','#a8743f'][b];rr(g,WH.door-13+b*9,H-9,8,8,1.2);g.fill();}}
  var dd=dh*(1-WH.open*.8);g.fillStyle='#9a938a';g.fillRect(WH.door-dw/2,WH.wall+30,dw,dd);
  g.strokeStyle='rgba(0,0,0,.18)';for(var yy2=WH.wall+33;yy2<WH.wall+30+dd;yy2+=4){g.beginPath();g.moveTo(WH.door-dw/2,yy2);g.lineTo(WH.door+dw/2,yy2);g.stroke();}
  /* sign + fill meter */
  var lab='창고 Lv.'+S.whLv;g.font='800 8.5px sans-serif';g.textAlign='center';g.textBaseline='middle';
  var tw=g.measureText(lab).width+12;g.fillStyle='#5b4636';rr(g,WH.door-tw/2,WH.wall+5,tw,12,3);g.fill();g.fillStyle='#fff3d6';g.fillText(lab,WH.door,WH.wall+11.3);
  var fr=Math.min(1,whTotal()/Math.max(1,whCap()));
  g.fillStyle='rgba(0,0,0,.25)';rr(g,WH.door-17,WH.wall+20,34,5,2.5);g.fill();g.fillStyle=fr>.9?'#e2566a':'#8fe39c';rr(g,WH.door-17,WH.wall+20,Math.max(3,34*fr),5,2.5);g.fill();
  g.font='700 7px sans-serif';g.fillStyle='#4a3600';g.fillText(whTotal()+'/'+whCap(),WH.door+30,WH.wall+22.5);
  /* workshops on the walls: wood bench (left) and smoker (right) */
  LINES.forEach(function(line,li){
    var bx=li?x1-16:x0+22,by=WH.wall+32,cr=CR[line],pop=craftPop[line];
    g.fillStyle=li?'#6b6258':'#8a5a30';rr(g,bx-7,by,14,9,2);g.fill();
    if(li&&cr.active){for(var p=0;p<2;p++){var ph=(time*.8+p*.5)%1;g.fillStyle='rgba(230,230,230,'+(.6*(1-ph))+')';g.beginPath();blob(g,bx+Math.sin(ph*6+p)*2,by-4-ph*14,2+ph*2.5);g.fill();}}
    if(cr.active){drawItem(g,cr.active.id,bx,by-5-pop*3,.6+pop*.25);var pct=Math.min(1,cr.t/cr.active.time);
      g.fillStyle='rgba(0,0,0,.3)';g.fillRect(bx-7,by+11,14,2.5);g.fillStyle='#8fe39c';g.fillRect(bx-7,by+11,14*pct,2.5);}
  });
  /* side loading bay (Lv.2+): a short roller ramp out of the wall's lower-left corner */
  if(dockCount()>=2){
    var lb=trucks.some(function(t){return t.state==='load'&&t.dock===1;}),r0=WH.x0-16;
    g.fillStyle='#6b6258';g.fillRect(r0,H-7,16,5);
    for(var rl=0;rl<3;rl++){g.fillStyle='#d8d0c4';g.beginPath();blob(g,r0+3+rl*5,H-4.5,1.1);g.fill();}
    g.fillStyle='#4a3f36';g.fillRect(WH.x0,H-16,10,16);
    if(lb){var ph2=(time*1.8)%1;g.fillStyle='#c79a63';rr(g,WH.x0-4-ph2*14,H-14,7,6,1.2);g.fill();}
  }
  /* player drop spot */
  var dp=whDrop();g.strokeStyle='rgba(120,90,40,.45)';g.setLineDash([2,2]);g.beginPath();g.arc(dp.x,dp.y+4,8,0,7);g.stroke();g.setLineDash([]);
}
function drawTruck(t){
  var g=ctx,y=t.y-Math.sin(t.bump*Math.PI)*1.6+(t.state==='load'?0:Math.sin(time*24+t.x*.1)*.35),nt=nightAmt();
  g.save();g.translate(t.x,y);
  g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(2,12,36,4.5,0,0,7);g.fill();
  if(nt>.05&&t.state!=='load'){var hl=g.createLinearGradient(-32,0,-80,0);hl.addColorStop(0,'rgba(255,240,170,'+(.5*nt)+')');hl.addColorStop(1,'rgba(255,240,170,0)');g.fillStyle=hl;g.beginPath();g.moveTo(-31,-1);g.lineTo(-80,-10);g.lineTo(-80,12);g.closePath();g.fill();}
  /* flatbed + crates that fill up while loading */
  g.fillStyle='#6b6258';rr(g,-9,0,42,5,1.5);g.fill();
  var tot=0,got=0;t.order.forEach(function(o){tot+=o.qty;got+=o.got;});var nc=Math.round(got/Math.max(1,tot)*8);
  /* v55 (staff 1): each crate carries the product it was loaded with; a full truck drives off under a tied tarp */
  var cids=[];t.order.forEach(function(o){for(var q=0;q<o.got;q++)cids.push(o.id);});
  var full=nc>=8&&(t.state==='undock'||t.state==='out');
  for(var c=0;c<nc;c++){var cx=-6+(c%4)*9.5,cy=-8-Math.floor(c/4)*8;g.fillStyle=c%3?'#c79a63':'#b98b5e';rr(g,cx,cy,8.5,7.5,1.2);g.fill();g.strokeStyle='rgba(90,60,30,.4)';g.lineWidth=.7;g.strokeRect(cx+.5,cy+.5,7.5,6.5);
    var cid=cids[Math.floor(c*cids.length/Math.max(1,nc))];if(cid&&!full)drawItem(g,cid,cx+4.2,cy+3.6,.36);}
  if(full){g.fillStyle=t.b==='elec'?'#4a6fa5':(t.b==='smoke'?'#3f7a8a':'#6f8a4a');rr(g,-7.5,-17.5,40,17,4);g.fill();g.fillStyle='rgba(255,255,255,.18)';rr(g,-6.5,-17,38,3,2);g.fill();
    g.strokeStyle='#e8dcc0';g.lineWidth=.9;[3,13,23].forEach(function(rx){g.beginPath();g.moveTo(rx,-17.5);g.lineTo(rx,.5);g.stroke();});}
  g.strokeStyle='#5f574f';g.lineWidth=1.4;g.beginPath();g.moveTo(-8,-1);g.lineTo(-8,-18);g.moveTo(32,-1);g.lineTo(32,-12);g.stroke();
  /* cab */
  g.fillStyle=t.col;rr(g,-31,-15,23,20,4);g.fill();
  g.fillStyle='rgba(255,255,255,.22)';rr(g,-30,-14,21,3,2);g.fill();
  g.fillStyle='#cfeaf5';rr(g,-28,-11,10,8,2);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.fillRect(-26,-10,2,6);
  g.fillStyle='rgba(0,0,0,.18)';g.fillRect(-31,0,23,2);
  g.fillStyle=nt>.05?'#fff4b0':'#ffe9a0';g.beginPath();blob(g,-30.5,-1,1.8);g.fill();
  /* door badge with the factory's mark, side mirror, exhaust stack */
  g.fillStyle='rgba(255,255,255,.92)';g.beginPath();g.arc(-13.5,-4.5,3.3,0,7);g.fill();g.save();g.translate(-13.5,-4.5);g.scale(.32,.32);drawItem(g,{mill:'chair',smoke:'can',elec:'tv',smelt:'ingot'}[t.b]||'chair',0,0,1);g.restore();
  g.fillStyle='#3a3f45';g.fillRect(-33,-10,2,5);g.fillStyle='#cfd6dc';rr(g,-34.4,-11,2.6,3.4,.8);g.fill();
  g.fillStyle='#5d6670';g.fillRect(-10.4,-21,2,11);g.fillStyle='#3a3f45';g.fillRect(-10.8,-22,2.8,1.6);
  if(t.rush){g.fillStyle='#ffe27a';g.beginPath();g.moveTo(-18,-13);g.lineTo(-22,-5);g.lineTo(-19,-5);g.lineTo(-21,1);g.lineTo(-15,-8);g.lineTo(-18,-8);g.closePath();g.fill();}
  /* wheels */
  [-21,21].forEach(function(wx){g.fillStyle='#2e2b28';g.beginPath();blob(g,wx,7,5.6);g.fill();g.fillStyle='#b8b0a4';g.beginPath();blob(g,wx,7,2.4);g.fill();
    g.strokeStyle='#6b6258';g.lineWidth=1;g.beginPath();for(var k=0;k<3;k++){var an=-t.wheel+k*2.09;g.moveTo(wx,7);g.lineTo(wx+Math.cos(an)*4.4,7+Math.sin(an)*4.4);}g.stroke();});
  g.restore();
}
function drawTruckBubble(t){
  var g=ctx;
  if(t.state==='out'||t.state==='undock')return;
  if(false){
    g.font='800 7px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(34,53,43,.85)';rr(g,t.x-30,t.y-30,34,11,5.5);g.fill();g.fillStyle='#fff';g.fillText('대기 중',t.x-13,t.y-24.5);return;}
  if(t.state!=='load'&&t.state!=='dock')return;
  {
    var extra=t.rush?30:0,bw=t.order.length*34+6+extra,bx=Math.min(W-bw-3,Math.max(3,t.x-bw/2+2)),by=t.y+14;
    g.fillStyle='rgba(255,255,255,.96)';rr(g,bx,by,bw,15,7);g.fill();
    if(t.rush){var pu=.6+.4*Math.sin(time*8);g.strokeStyle='rgba(226,70,60,'+pu+')';g.lineWidth=1.5;rr(g,bx,by,bw,15,7);g.stroke();
      g.fillStyle='#e2463c';rr(g,bx+2,by+2,27,11,5.5);g.fill();g.fillStyle='#fff';g.font='800 7px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('⚡×2',bx+15.5,by+7.8);bx+=extra;}
    g.font='700 7.5px sans-serif';g.textAlign='left';g.textBaseline='middle';
    t.order.forEach(function(o,i){var ix=bx+9+i*34,done=o.got>=o.qty;drawItem(g,o.id,ix,by+7.5,.6);
      g.fillStyle=done?'#3f7a55':(whN(o.id)===0&&t.state==='load'?'#b3263b':'#22352b');g.fillText(o.got+'/'+o.qty,ix+6,by+8);});
    var pct=Math.max(0,t.pat/t.max);g.fillStyle=pct>.5?'#6fcf7f':(pct>.25?'#f0bb3f':'#e2566a');g.fillRect(bx+4,by+13,(bw-8-extra)*pct,1.6);
  }
}
var SHOPDEF={wood:{name:'나무 가게',awn:'#8a5a30',awn2:'#f3e3c3',icon:'oak'},fish:{name:'생선 가게',awn:'#3f7fb8',awn2:'#ffffff',icon:'carp'}};
var STALLFX={wood:0,fish:0},CELEB=[],CHECK=[];
/* video-ref style "sale complete" check: white ring pops behind a green disc, then a thick white check strokes in, drifts up, fades */
function checkPop(x,y){CHECK.push({x:x,y:y,t:0,dur:.75});burst(x,y-6,'#8be99b',9,true);}
function updateChecks(dt){for(var i=CHECK.length-1;i>=0;i--){CHECK[i].t+=dt;if(CHECK[i].t>=CHECK[i].dur)CHECK.splice(i,1);}}
function drawChecks(){var g=ctx;CHECK.forEach(function(c){var k=c.t/c.dur,sc=k<.24?Math.max(0,eob(k/.24)):1,op=k>.66?Math.max(0,1-(k-.66)/.34):1,yy=c.y-k*16;
  g.save();g.globalAlpha=op;
  g.strokeStyle='rgba(139,233,155,'+(.55*(1-Math.min(1,k*1.4)))+')';g.lineWidth=2;g.beginPath();g.arc(c.x,yy,8+k*10,0,7);g.stroke();
  g.translate(c.x,yy);g.scale(sc,sc);
  g.fillStyle='rgba(20,40,25,.22)';g.beginPath();g.ellipse(1,10.5,7.4,2.4,0,0,7);g.fill();
  g.fillStyle='#4fb36a';g.beginPath();g.arc(0,0,9,0,7);g.fill();
  g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1.4;g.beginPath();g.arc(0,0,9,0,7);g.stroke();
  g.strokeStyle='#fff';g.lineWidth=2.3;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(-4,.3);g.lineTo(-1.1,3.6);g.lineTo(4.4,-3.7);g.stroke();
  g.restore();});}
function celebrate(x,y,label,big){CELEB.push({x:x,y:y,t:1.6,max:1.6,label:label,big:!!big});flash=Math.max(flash,.12);sfx('cash');
  var cc=['#e2463c','#f0bb3f','#3f7fb8','#4fb36a','#b85ac8','#ffffff'],nC=big?18:10;
  for(var cf=0;cf<nC;cf++){var an=-Math.PI/2+(Math.random()-.5)*2.4,sp2=50+Math.random()*80;parts.push({x:x,y:y-8,vx:Math.cos(an)*sp2,vy:Math.sin(an)*sp2,g:140,life:1.3,max:1.3,col:cc[cf%6],r:1.5,leaf:true});}
  burst(x,y-8,'#ffe27a',14,true);}
function drawCelebs(){var g=ctx;for(var i=CELEB.length-1;i>=0;i--){var c=CELEB[i];c.t-=FDT;if(c.t<=0){CELEB.splice(i,1);continue;}var k=c.t/c.max;
  g.save();g.globalAlpha=Math.min(1,k*4);g.strokeStyle='rgba(198,174,107,'+k*.5+')';g.lineWidth=1;g.beginPath();g.ellipse(c.x,c.y+6,12+(1-k)*20,4+(1-k)*7,0,0,7);g.stroke();g.restore();}
  var toast=document.getElementById('eventToast'),last=CELEB[CELEB.length-1];toast.hidden=!last||TITLE||!storyBox.hidden;if(last&&toast.textContent!==last.label)toast.textContent=last.label;
}

function drawStall(line){
  var s0=STALL[line],fx=STALLFX[line]||0,lv=S.shop[line],g=ctx;
  if(fx>0){STALLFX[line]=Math.max(0,fx-FDT);var k=fx/1.8;
    /* rays + shockwave behind */
    g.save();g.translate(s0.x,s0.y-10);g.rotate(time*.8);for(var r=0;r<10;r++){g.rotate(Math.PI/5);g.fillStyle='rgba(255,230,120,'+(.28*k)+')';g.beginPath();g.moveTo(0,0);g.lineTo(-8,-70);g.lineTo(8,-70);g.closePath();g.fill();}g.restore();
    g.strokeStyle='rgba(255,236,150,'+k+')';g.lineWidth=3*k;g.beginPath();g.ellipse(s0.x,s0.y+14,20+(1-k)*60,6+(1-k)*18,0,0,7);g.stroke();}
  var grow=1;g.save();g.translate(s0.x,s0.y+16);g.scale(grow,grow);if(fx>0){var e=fx/1.8,pop=1+Math.sin((1-e)*Math.PI*3)*.14*e;g.scale(2-pop,pop);}g.translate(-s0.x,-(s0.y+16));
  drawStallBody(line);drawShopStaff(line);
  var x=s0.x,y=s0.y,aw=stallW(lv),ax=x-aw/2;
  g.restore();

}
function drawShopStaff(line){
  var g=ctx,st=STALL[line],side=shopSide(line),n=shopClerks(line);
  for(var i=0;i<n;i++){var x=st.x+side*24,y=st.y+32+i*28;g.fillStyle='#465f50';g.fillRect(x-4,y-1,8,10);g.fillStyle='#f0d4b0';g.beginPath();g.arc(x,y-5,4,0,7);g.fill();g.fillStyle='#473b30';g.fillRect(x-4,y-9,8,3);g.fillStyle=line==='wood'?'#cf9766':'#7daeb6';g.fillRect(x-5,y,10,2);g.fillStyle='#54463a';g.fillRect(x-4,y+8,3,3);g.fillRect(x+1,y+8,3,3);}
  for(var j=0;j<shopShelves(line);j++){var rx=st.x-19+j*13,ry=st.y+112;isoBox(g,rx,ry,10,3,7,'#a68a60');drawItem(g,SHOPDEF[line].icon,rx+5,ry-8,.3);}
}

var SHOP_STAGE=['노점','나무 노점','벽돌 가게','큰 상점'];
function shopStage(lv){return lv>=7?3:(lv>=5?2:(lv>=3?1:0));}
function stallW(lv){return 92;}
var AWN={wood:['#8a5a30','#b0602e','#c8453d','#7a3fa0'],fish:['#3f7fb8','#2e9ad0','#16a085','#2c3e9e']},AWN2={wood:['#f3e3c3','#fff1d6','#ffe27a','#f6d8ff'],fish:['#ffffff','#e8f7ff','#fff1a8','#dfe6ff']};
function shopLook(line,lv){var k=Math.min(3,Math.floor((lv-1)/2)),b=SHOPDEF[line];return {name:b.name,icon:b.icon,awn:AWN[line][k],awn2:AWN2[line][k]};}
/* v50 (perf): a brick patch is painted once per size/colour and reused (the side wall alone was ~450 strokes a frame) */
var BRICKC={};
function brickWall(g,x,y,w,h,base,mortar){if(w<=0||h<=0)return;var key=Math.round(w*10)+'x'+Math.round(h*10)+base+mortar,c=BRICKC[key];
  if(!c){c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w*RS));c.height=Math.max(1,Math.ceil(h*RS));var b=c.getContext('2d');b.setTransform(RS,0,0,RS,0,0);
    b.fillStyle=base;b.fillRect(0,0,w,h);b.strokeStyle=mortar;b.lineWidth=.6;b.beginPath();
    for(var by=4,row=0;by<h;by+=4,row++){b.moveTo(0,by);b.lineTo(w,by);for(var bx=(row%2?4:0);bx<w;bx+=8){b.moveTo(bx,by-4);b.lineTo(bx,by);}}b.stroke();BRICKC[key]=c;}
  g.drawImage(c,x,y,w,h);}
function drawMarketShop(g,line,L){
  var fish=line==='fish',side=shopSide(line),x=25,y=20,w=38,h=102,roof=['#e2942d','#20a271','#ec773c','#238fc8','#dd9d27','#138db5','#d9822d','#245e9a'][L-1],wall=fish?'#8ddadd':'#ffd08d';
  isoBox(g,16,132,55,12,5,'#c7c9b6');
  var body=g.createLinearGradient(x,y,x+w,y+h);body.addColorStop(0,artShade(wall,1.15));body.addColorStop(1,artShade(wall,.8));g.fillStyle=body;g.fillRect(x,y+12,w,h-12);
  artPoly(g,[[x+w,y+12],[x+w+9,y+5],[x+w+9,y+h-7],[x+w,y+h]],artShade(wall,.65));
  var ridge=x+w/2,over=L>=5?5:2;
  artPoly(g,[[x-over,y+12],[ridge,y+1],[ridge,y+h-9],[x-over,y+h+2]],artShade(roof,1.2));
  artPoly(g,[[ridge,y+1],[x+w+over,y+12],[x+w+over,y+h+2],[ridge,y+h-9]],artShade(roof,.8));
  g.strokeStyle=artShade(roof,.6);g.lineWidth=.6;for(var seam=0;seam<9;seam++){var yy=y+15+seam*10;g.beginPath();g.moveTo(x-over,yy);g.lineTo(ridge,yy-11);g.lineTo(x+w+over,yy);g.stroke();}
  artPoly(g,[[x-over,y+12],[ridge,y+1],[x+w+over,y+12],[x+w+over,y+15],[ridge,y+5],[x-over,y+15]],'#e8ede0');
  var cx=side<0?12:65;
  isoBox(g,cx,126,13,5,86,fish?'#829f92':'#ad9165');
  for(var row=0;row<4;row++){var cy=53+row*19;g.fillStyle=artShade(roof,1.25);g.fillRect(cx-3,cy-11,20,3);g.fillStyle='#e4cf97';g.fillRect(cx+2,cy-7,9,5);if(fish){g.save();g.translate(cx+7,cy-4);g.scale(.3,.3);fishShape(g,'#c5e1e0',true);g.restore();}else isoBox(g,cx+2,cy-2,9,2,4,'#d4af73');}
  if(L>=2){artPosts(g,cx,126,14,97,'#a39068');}
  if(L>=3){isoGlass(g,x+7,y+h-6,24,9);}
  if(L>=4){isoBox(g,x+7,y+18,10,5,17,'#83968b');}
  if(L>=5){isoTank(g,x+25,y+37,10,14,fish?'#a6c4c6':'#adbd9d');}
  if(L>=6){for(var panel=0;panel<3;panel++){artPoly(g,[[x+7,y+42+panel*16],[ridge-2,y+37+panel*16],[ridge-2,y+48+panel*16],[x+7,y+53+panel*16]],'#38617d');}}
  if(L>=7){isoBox(g,x+9,y+14,22,7,12,L===7?'#b5c4ad':'#dccb96');}
  if(L===8){g.fillStyle='#e1c480';g.fillRect(ridge-1,y+1,2,h-10);lantern(g,cx+7,36,true);}
}
function drawStallBody(line){
  var g=ctx,st=STALL[line],L=S.shop[line],img=tileImg('vertical-market-v1-'+line+'-'+L,96,function(c){drawMarketShop(c,line,L);},144);g.drawImage(img,st.x-48,st.y-18,96,144);
  var ids=ORDER.filter(function(id){return ITEMS[id].line===line&&ss(line,id)>0;}).slice(0,4),side=shopSide(line);
  ids.forEach(function(id,i){var x=st.x+side*28,y=st.y+36+i*19;drawItem(g,id,x,y,.34);g.fillStyle='#fbf3dd';g.font='5px sans-serif';g.textAlign='center';g.fillText(String(ss(line,id)),x,y+6);});
}

function drawBar(q,yo){
  if(!q.by||q.prog<=0)return;
  var pct=Math.min(1,q.prog/q.need),bx=q.x-13,by=q.y+yo;
  ctx.fillStyle='rgba(0,0,0,.35)';rr(ctx,bx,by,26,5,2.5);ctx.fill();
  ctx.fillStyle='#ffe27a';rr(ctx,bx,by,Math.max(4,26*pct),5,2.5);ctx.fill();
}
function lockBadge(x,y){
  ctx.fillStyle='rgba(34,53,43,.7)';ctx.beginPath();ctx.arc(x,y,5.5,0,7);ctx.fill();
  ctx.font='7px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#000';ctx.fillText('🔒',x,y+.5);
}
var TREE_SPRITES={};
function treeSprite(level,species){
  var key=level+':'+species,c=TREE_SPRITES[key];if(c)return c;
  c=document.createElement('canvas');c.width=96;c.height=128;
  var g=c.getContext('2d');g.scale(2,2);g.translate(24,52);
  var L=level,P=FOREST_LOOK[L-1],sp=TREES[species]||TREES[0];
  var leaf=species===3?'#ef7e31':species===4?'#23c6d4':species===5?'#aa70e3':P.leaf;
  g.fillStyle='#6b5143';rr(g,-2,-18,4,23,1);g.fill();
  g.fillStyle='#b8a384';g.fillRect(-1.6,-16,1,20);
  if(L>=3){g.strokeStyle='#6b5143';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-9);g.lineTo(-7,-17);g.moveTo(0,-14);g.lineTo(7,-22);g.stroke();}
  if(L===1){
    g.fillStyle=leaf;g.beginPath();g.moveTo(0,-24);g.quadraticCurveTo(-3,-17,-9,-8);g.quadraticCurveTo(0,-4,9,-8);g.quadraticCurveTo(3,-17,0,-24);g.fill();
    g.fillStyle='#f4f6ec';g.beginPath();g.moveTo(0,-24);g.lineTo(-5,-15);g.quadraticCurveTo(0,-12,5,-15);g.closePath();g.fill();
  }else if(L===2||L===4){
    var tiers=L===4?4:3;
    for(var k=0;k<tiers;k++){var y=-7-k*7,w=(L===4?14:11)-k*2.6;
      g.fillStyle=k%2?P.light:leaf;g.beginPath();g.moveTo(0,y-15);g.lineTo(-w,y);g.quadraticCurveTo(0,y+4,w,y);g.closePath();g.fill();
      g.fillStyle='#f0f4ea';g.beginPath();g.moveTo(0,y-15);g.lineTo(-w*.65,y-4);g.quadraticCurveTo(-w*.25,y-1,0,y-4);g.quadraticCurveTo(w*.3,y-2,w*.5,y-5);g.closePath();g.fill();
    }
  }else{
    var lobes=L===5?[[-8,-19,8],[8,-19,8],[0,-31,11],[-8,-31,7],[7,-34,7]]:[[-7,-17,8],[7,-17,8],[0,-26,10]];
    g.fillStyle=leaf;lobes.forEach(function(o){g.beginPath();g.arc(o[0],o[1],o[2],0,7);g.fill();});
    g.fillStyle=P.light;g.beginPath();g.ellipse(-4,L===5?-33:-27,8,6,-.35,0,7);g.fill();
    g.fillStyle='#f3f5e9';g.beginPath();g.ellipse(-3,L===5?-38:-30,8,3,-.2,0,7);g.ellipse(9,-20,5,2,0,0,7);g.fill();
    if(L===5){g.strokeStyle='#d4b77d';g.lineWidth=1.1;g.beginPath();g.moveTo(0,-43);g.lineTo(0,-48);g.moveTo(-2.5,-45.5);g.lineTo(2.5,-45.5);g.stroke();
      g.fillStyle='#e9c58c';[[-10,-25],[9,-31],[-2,-18]].forEach(function(o){g.beginPath();g.arc(o[0],o[1],1.2,0,7);g.fill();});}
  }
  if(sp.id==='crystal'||sp.id==='rainbow'){g.fillStyle=sp.id==='crystal'?'#d1eced':'#e8cfa0';g.beginPath();g.moveTo(0,-19);g.lineTo(2,-16);g.lineTo(0,-13);g.lineTo(-2,-16);g.closePath();g.fill();}
  TREE_SPRITES[key]=c;return c;
}
function drawTree(q,dtv){
  var g=ctx,L=Math.max(1,Math.min(5,siteLv(q.s))),step=dtv||FDT||.016;
  if(q.hit>0)q.hit=Math.max(0,q.hit-step);
  g.fillStyle='rgba(36,65,58,.13)';g.beginPath();g.ellipse(q.x+2,q.y+8,10,3,0,0,7);g.fill();
  if(q.alive){
    var sway=Math.sin(time*.8+q.ph)*.022+(q.by&&q.prog>0?Math.sin(time*27)*.045:0);
    var scale=1;if(q.pop>0){q.pop=Math.max(0,q.pop-step*2.2);scale=1-.16*Math.sin(q.pop*Math.PI);}
    g.save();g.translate(q.x,q.y+7);g.rotate(sway);g.scale(scale*1.35,scale*1.35);g.drawImage(treeSprite(L,q.sp),-24,-52,48,64);g.restore();
    if(!teamOk(q))lockBadge(q.x+9,q.y-28);drawBar(q,-45);
  }else{
    g.fillStyle='#82614b';rr(g,q.x-3,q.y+3,6,5,1.5);g.fill();g.fillStyle='#d0b99a';g.beginPath();g.ellipse(q.x,q.y+3,3,1.5,0,0,7);g.fill();
    var growth=Math.max(0,Math.min(1,1-q.timer/q.max));
    if(growth>.25){g.fillStyle=FOREST_LOOK[L-1].leaf;g.beginPath();g.moveTo(q.x,q.y-8*growth);g.lineTo(q.x-4*growth,q.y+2);g.lineTo(q.x+4*growth,q.y+2);g.closePath();g.fill();}
  }
}

function drawOre(q){
  var sp=ORES[q.sp]||ORES[0],g=ctx;if(q.hit>0)q.hit=Math.max(0,q.hit-FDT);
  g.fillStyle='rgba(30,30,30,.18)';g.beginPath();g.ellipse(q.x+2,q.y+8,13,4,0,0,7);g.fill();
  if(!q.alive){var gr=1-q.timer/q.max;g.fillStyle='#8a8078';g.beginPath();g.ellipse(q.x,q.y+5,6+gr*4,3,0,0,7);g.fill();if(gr>.3){g.save();g.translate(q.x,q.y+2);g.scale(gr,gr);drawItem(g,sp.id,0,0,1.1);g.restore();}return;}
  var sh=q.by&&q.prog>0?Math.sin(time*40)*.8:0,pop=q.pop>0?(q.pop=Math.max(0,q.pop-FDT*2.2),1+.25*Math.sin(q.pop*Math.PI)):1;
  g.save();g.translate(q.x+sh,q.y+6);g.scale(pop*.78,pop*.78);
  g.fillStyle='#7d746a';g.beginPath();g.moveTo(-13,2);g.lineTo(-10,-9);g.lineTo(-3,-15);g.lineTo(7,-13);g.lineTo(13,-4);g.lineTo(11,2);g.closePath();g.fill();
  g.fillStyle='#9a9088';g.beginPath();g.moveTo(-10,-9);g.lineTo(-3,-15);g.lineTo(3,-12);g.lineTo(-4,-5);g.closePath();g.fill();
  g.fillStyle=sp.col;g.beginPath();g.moveTo(-7,0);g.lineTo(-5,-7);g.lineTo(2,-9);g.lineTo(7,-4);g.lineTo(5,1);g.closePath();g.fill();
  g.fillStyle=sp.spk;[[-3,-4,1.6],[2,-6,1.3],[4,-1.5,1.2],[-5,-1,1]].forEach(function(p){g.beginPath();g.arc(p[0],p[1],p[2],0,7);g.fill();});
  if(sp.rare){g.fillStyle='rgba(255,255,255,'+(.5+.5*Math.sin(time*6+q.ph))+')';g.fillRect(-1,-13,2,5);g.fillRect(-3.5,-10.5,7,1.6);}
  g.restore();drawBar(q,-22);
}
function drawFish(q){
  if(!q.alive)return;
  var ph=(time*.7+q.ph)%1;
  ctx.lineWidth=1.1;
  for(var i=0;i<2;i++){var p2=(ph+i*.5)%1;ctx.strokeStyle='rgba(255,255,255,'+(.55*(1-p2))+')';ctx.beginPath();ctx.ellipse(q.x,q.y+4,5+p2*12,2.2+p2*4.5,0,0,7);ctx.stroke();}
  ctx.fillStyle='rgba(20,60,90,.18)';ctx.beginPath();ctx.ellipse(q.x+1,q.y+4,10,3.4,0,0,7);ctx.fill();
  /* fish drift in a slow lazy loop under the surface */
  var fx=Math.sin(time*.8+q.ph)*3,fy=Math.cos(time*.6+q.ph)*2.2,fa=Math.cos(time*.8+q.ph)*.35;
  ctx.save();ctx.translate(q.x+fx,q.y+fy);ctx.rotate(fa);ctx.globalAlpha=.92;
  drawItem(ctx,FISH[q.sp].id,0,0,2.2);
  ctx.globalAlpha=1;ctx.restore();
  if(!teamOk(q))lockBadge(q.x+9,q.y-9);
}
function toolTr(kind){return kind==='tree'?'axe':(kind==='ore'?'pick':'rod');}
function toolTierFor(a,kind){var tr=toolTr(kind);return tierOf(tr,a.gear[tr]||0);}
function drawChainsaw(g,on,t){var j=on?Math.sin(time*60)*.8:0;g.save();g.translate(j,0);g.fillStyle=t>=4?'#e0b23c':'#e8743c';rr(g,-4,-3,8,6,1.5);g.fill();g.fillStyle='#3a3f45';g.fillRect(-2,-5,4,2);
  g.fillStyle='#aeb8c2';rr(g,3,-1.6,13,3.2,1.6);g.fill();g.fillStyle='#5d6670';for(var i=0;i<6;i++){var ph=((time*(on?40:0))+i*2.2)%13;g.fillRect(3+ph,-2.2,1,.8);g.fillRect(3+ph,1.4,1,.8);}g.restore();}
function drawDrill(g,on,t){var j=on?Math.sin(time*55)*.9:0;g.save();g.translate(0,j);g.fillStyle=t>=4?'#e0b23c':'#f0c23c';rr(g,-3,-12,6,9,1.5);g.fill();g.fillStyle='#3a3f45';g.fillRect(-4.5,-12,9,2);
  g.fillStyle='#8f969e';g.fillRect(-1.2,-3,2.4,9);g.beginPath();g.moveTo(-1.8,6);g.lineTo(1.8,6);g.lineTo(0,10);g.closePath();g.fill();g.restore();}
function nameTag(a,dy){var g=ctx;if(a.gear.name){g.font='700 6.5px sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=2.2;g.strokeStyle='rgba(34,53,43,.7)';g.strokeText(a.gear.name,a.x,a.y+dy);g.fillStyle='#fffbe8';g.fillText(a.gear.name,a.x,a.y+dy);}
  if(a.full){g.font='800 6px sans-serif';var tw=g.measureText('적재칸 가득').width+6;g.fillStyle='rgba(226,86,106,.9)';rr(g,a.x-tw/2,a.y+dy-13,tw,8,4);g.fill();g.fillStyle='#fff';g.fillText('적재칸 가득',a.x,a.y+dy-8.8);}
  if(a.stunT>0){g.font='700 9px sans-serif';g.textAlign='center';g.fillText('💫',a.x+Math.sin(time*6)*3,a.y+dy-8);}}
/* forestry harvester: wheeled cab with a crane arm and a saw head (red laser rig at Lv6+) */
function drawVehicleUpgrade(g,a,L,role){
  var tint=role==='lumber'?'#24a565':role==='fisher'?'#159ccc':'#e7ad31',x=a.x,y=a.y;
  g.save();g.translate(x,y);g.scale(a.dir||1,1);
  var body=g.createLinearGradient(-10,-13,11,-3);body.addColorStop(0,'#c8cdb2');body.addColorStop(.3,tint);body.addColorStop(1,'#3c5549');g.fillStyle=body;rr(g,-12,-10,16,8,1.5);g.fill();g.fillStyle='#344d40';g.beginPath();g.moveTo(4,-10);g.lineTo(8,-13);g.lineTo(8,-6);g.lineTo(4,-2);g.closePath();g.fill();g.fillStyle='#a9bd9c';g.beginPath();g.moveTo(-12,-10);g.lineTo(-8,-13);g.lineTo(8,-13);g.lineTo(4,-10);g.closePath();g.fill();
  var glass=g.createLinearGradient(-5,-22,3,-12);glass.addColorStop(0,'#e5f0e0');glass.addColorStop(.4,'#9bbfc1');glass.addColorStop(1,'#456d6f');g.fillStyle=glass;rr(g,-4,-22,9,11,1);g.fill();g.strokeStyle='#5f7564';g.lineWidth=1.2;g.stroke();g.fillStyle='#70816b';g.fillRect(-6,-24,13,2);g.fillStyle='#d8dac4';g.fillRect(-5,-24,11,.6);
  if(L>=5){g.strokeStyle='#576c60';g.lineWidth=.7;g.beginPath();g.moveTo(.5,-21);g.lineTo(.5,-12);g.stroke();}
  if(L>=6){g.fillStyle='#ddd3aa';g.fillRect(5,-8,3,3);g.fillStyle='#b8baa0';g.fillRect(-11,-6,2,2);}
  if(L>=7){g.fillStyle='#5b6b59';rr(g,-12,-16,5,6,1);g.fill();g.strokeStyle='#a5b695';g.lineWidth=.5;for(var j=0;j<3;j++){g.beginPath();g.moveTo(-11,-14+j*1.5);g.lineTo(-8,-14+j*1.5);g.stroke();}}
  if(L>=8){g.fillStyle='#b7a977';rr(g,-5,-27,8,3,1);g.fill();}
  if(L>=9){g.fillStyle='#ba9050';g.beginPath();g.arc(4,-26,1.8,0,7);g.fill();g.fillStyle='#eadfb5';g.beginPath();g.arc(4,-26,.8,0,7);g.fill();}
  if(L>=10){g.strokeStyle='#c4c9b2';g.lineWidth=1;g.beginPath();g.moveTo(-13,-10);g.lineTo(-13,-3);g.lineTo(9,-3);g.stroke();}
  if(L>=11){g.fillStyle='#476b78';g.fillRect(-5,-24,9,2);g.fillStyle='#cfc18a';g.fillRect(-12,-9,15,1);}
  g.restore();
}
function drawHarvester(a){var g=ctx,L=a.gear.axe||0,big=L>=6,on=a.working,d=a.dir||1,by=a.mv?Math.sin(a.bob*2)*.6:0,bc=big?'#c8453d':'#4f9a6a';
  g.save();g.translate(a.x,a.y+by);g.scale(d*.92,.92);
  g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(0,6,14,3,0,0,7);g.fill();
  [-8,0,8].forEach(function(wx){g.fillStyle='#2b2f36';g.beginPath();g.arc(wx,3,3.6,0,7);g.fill();g.fillStyle='#8f969e';g.beginPath();g.arc(wx,3,1.4,0,7);g.fill();});
  g.fillStyle=bc;rr(g,-12,-6,22,8,2.5);g.fill();g.fillStyle='rgba(255,255,255,.2)';g.fillRect(-12,-6,22,2);g.fillStyle='#3a3f45';g.fillRect(-12,-9,6,3);
  g.fillStyle='#bfe8ff';rr(g,-4,-17,9,10,1.5);g.fill();g.fillStyle=bc;g.fillRect(-5,-18,11,2);g.fillStyle='#ffe0c4';g.beginPath();g.arc(0.5,-12,2,0,7);g.fill();g.fillStyle='#f0bb3f';g.beginPath();g.arc(.5,-13,2.2,Math.PI,0);g.fill();
  var sw=on?Math.sin(time*6)*.25:0;g.save();g.translate(6,-6);g.rotate(-.9+sw);g.fillStyle='#e0a03a';rr(g,-1.4,-1.6,13,3.2,1.4);g.fill();g.translate(12,0);g.rotate(1.2-sw);g.fillStyle='#e0a03a';rr(g,-1.2,-1.4,9,2.8,1.2);g.fill();g.translate(9,0);
  g.fillStyle='#3a3f45';rr(g,-3,-3,6,6,1.4);g.fill();
  if(big){g.strokeStyle='rgba(255,90,90,'+(on?.9:.4)+')';g.lineWidth=1.4;g.beginPath();g.moveTo(3,0);g.lineTo(11,0);g.stroke();g.fillStyle='#ff9a9a';g.beginPath();g.arc(3,0,1.2,0,7);g.fill();}
  else{g.rotate(time*(on?30:0));g.fillStyle='#c9ced4';g.beginPath();for(var t=0;t<8;t++){var an=t*.785;g.lineTo(Math.cos(an)*4.4,Math.sin(an)*4.4);g.lineTo(Math.cos(an+.39)*3,Math.sin(an+.39)*3);}g.closePath();g.fill();}
  g.restore();g.restore();
  if(on&&Math.random()<.4)parts.push({x:a.x+d*22,y:a.y-10,vx:d*(10+Math.random()*20),vy:-10-Math.random()*10,g:60,life:.4,max:.4,col:big?'#ffb3b3':'#f3e3c3',r:1.1});
  nameTag(a,-26);}
/* fishing rig on the bank: a winch cart that dips a net (sonar dish + golden net at Lv6+) */
function drawFishRig(a){var g=ctx,L=a.gear.rod||0,big=L>=6,on=a.working,by=a.mv?Math.sin(a.bob*2)*.6:0,bc=big?'#2c3e9e':'#3f7fb8';
  g.save();g.translate(a.x,a.y+by);g.translate(4,0);g.scale(.78,.78);
  g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(-2,6,11,3,0,0,7);g.fill();
  g.fillStyle='#2b2f36';g.beginPath();g.arc(-8,3.5,3,0,7);g.arc(3,3.5,3,0,7);g.fill();
  g.fillStyle=bc;rr(g,-12,-6,17,8,2.5);g.fill();g.fillStyle='rgba(255,255,255,.2)';g.fillRect(-12,-6,17,2);
  g.fillStyle='#ffe0c4';g.beginPath();g.arc(-6,-9.5,2.2,0,7);g.fill();g.fillStyle='#e8845a';g.beginPath();g.arc(-6,-10.6,2.4,Math.PI,0);g.fill();
  if(big){g.save();g.translate(-10,-9);g.rotate(Math.sin(time*2)*.4);g.strokeStyle='#dfe6ec';g.lineWidth=1.2;g.beginPath();g.arc(0,0,3.5,Math.PI*.2,Math.PI*1.2);g.stroke();g.fillStyle='#8fe8ff';g.beginPath();g.arc(0,0,1,0,7);g.fill();g.restore();
    g.fillStyle='#1e2630';rr(g,-3,-12,6,5,1);g.fill();g.fillStyle='rgba(143,232,255,'+(.6+.3*Math.sin(time*5))+')';g.fillRect(-2.2,-11.2,4.4,3.4);}
  /* crane arm over the water, net on a line */
  var dip=on?(Math.sin(time*2.4)*.5+.5):.1;g.strokeStyle='#e0a03a';g.lineWidth=2.4;g.beginPath();g.moveTo(3,-5);g.lineTo(18,-16);g.stroke();
  g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=.8;g.beginPath();g.moveTo(18,-16);g.lineTo(20,-6+dip*10);g.stroke();
  g.fillStyle=big?'rgba(240,187,63,.85)':'rgba(220,220,220,.8)';g.beginPath();g.ellipse(20,-4+dip*10,4.5,2.2,0,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=.5;for(var nx=-3;nx<=3;nx+=2){g.beginPath();g.moveTo(20+nx,-6+dip*10);g.lineTo(20+nx,-2+dip*10);g.stroke();}
  g.restore();
  if(on&&dip>.8&&Math.random()<.3)parts.push({x:a.x+20,y:a.y+6,vx:0,vy:0,g:0,life:.7,max:.7,col:'#ffffff',r:3,ring:1});
  a.dir=1;nameTag(a,-24);}
function drawExcavator(a){var g=ctx,L=a.gear.pick||0,big=L>=6,on=a.working,d=a.dir||1,by=a.mv?Math.sin(a.bob*2)*.6:0;
  g.save();g.translate(a.x,a.y+by);g.scale(d*(big?1.08:.95),big?1.08:.95);
  g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(0,5,14,3,0,0,7);g.fill();
  g.fillStyle='#2b2f36';rr(g,-12,-1,22,7,3.5);g.fill();for(var w=0;w<4;w++){g.fillStyle='#5d6670';g.beginPath();g.arc(-8.5+w*5.3,2.5,1.8,0,7);g.fill();}
  var tr=(time*(a.mv?30:0))%4;g.fillStyle='rgba(255,255,255,.15)';for(var k=0;k<6;k++)g.fillRect(-11+k*4+tr*.5,-1,1,1.2);
  var bc=big?'#e2463c':'#f0bb3f';g.fillStyle=bc;rr(g,-11,-11,17,10,2.5);g.fill();g.fillStyle='rgba(0,0,0,.18)';g.fillRect(-11,-3.5,17,2.5);
  g.fillStyle='#3a3f45';g.fillRect(-11,-13,5,3);
  g.fillStyle='#bfe8ff';rr(g,-3,-18,8,8,1.5);g.fill();g.fillStyle=bc;g.fillRect(-4,-19,10,2);
  g.fillStyle='#ffe0c4';g.beginPath();g.arc(1,-13.5,2,0,7);g.fill();g.fillStyle='#f0bb3f';g.beginPath();g.arc(1,-14.5,2.2,Math.PI,0);g.fill();
  var sw=on?Math.sin(time*7)*.35:0;g.save();g.translate(5,-9);g.rotate(-.7+sw);g.fillStyle=bc;rr(g,-1.5,-1.8,14,3.6,1.5);g.fill();
  g.translate(13,0);g.rotate(1.5-sw*1.4);g.fillStyle=big?'#c8453d':'#e0a03a';rr(g,-1.2,-1.5,11,3,1.2);g.fill();g.translate(10,0);
  if(big){g.rotate(time*(on?40:2));g.fillStyle='#aeb8c2';g.beginPath();for(var t=0;t<6;t++){var an=t*1.047;g.lineTo(Math.cos(an)*4,Math.sin(an)*4);g.lineTo(Math.cos(an+.5)*2,Math.sin(an+.5)*2);}g.closePath();g.fill();g.fillStyle='#8fe8ff';g.beginPath();g.arc(0,0,1.2,0,7);g.fill();}
  else{g.fillStyle='#5d6670';g.beginPath();g.moveTo(-2,-2);g.lineTo(4,-3);g.lineTo(4,3);g.lineTo(-1,2);g.closePath();g.fill();g.fillStyle='#c9ced4';for(var tt=0;tt<3;tt++)g.fillRect(4,-2.6+tt*2,1.6,1);}
  g.restore();g.restore();
  if(on&&Math.random()<.35)parts.push({x:a.x+d*24,y:a.y-2,vx:(Math.random()-.5)*30,vy:-15-Math.random()*15,g:70,life:.45,max:.45,col:big?'#ffd35a':'#b9b2a4',r:1.2,spark:big});
  nameTag(a,-27);
}
/* v59 (director 2026-10-04): super workers shine much more - rotating light rays, a pulsing golden ring, orbiting stars, rising sparkles and a crown name plate */
var RAINBOW=['#ff5a5a','#ffa53c','#ffe94a','#5ad86a','#4fb8ff','#8a6bff','#e06bff'];
function rbGrad(g,x0,y0,x1,y1,sh){var gr=g.createLinearGradient(x0,y0,x1,y1);for(var i=0;i<RAINBOW.length;i++)gr.addColorStop(((i/RAINBOW.length)+(sh||0))%1,RAINBOW[i]);return gr;}
/* v63 (director 2026-10-04): top-level tools - rainbow axe, rainbow star pickaxe, rainbow net rod */
function drawRainbowAxe(g,ang,sc){g.save();g.rotate(ang);g.scale(sc,sc);
  /* v65 (director: it should look like a real axe) - long wooden haft with grip wrap, steel bearded axe head, rainbow-tempered cutting edge */
  g.lineCap='round';g.strokeStyle='#5f4329';g.lineWidth=3.4;g.beginPath();g.moveTo(0,9);g.lineTo(0,-13);g.stroke();g.strokeStyle='#a8743f';g.lineWidth=2.2;g.beginPath();g.moveTo(0,9);g.lineTo(0,-13);g.stroke();
  g.strokeStyle='#3a2f28';g.lineWidth=2.6;for(var w=4;w<=8;w+=2){g.beginPath();g.moveTo(-1.3,w);g.lineTo(1.3,w-1);g.stroke();}
  var hg=g.createLinearGradient(0,-17,0,-3);hg.addColorStop(0,'#eef3f8');hg.addColorStop(.5,'#b9c3cf');hg.addColorStop(1,'#7f8a98');
  g.fillStyle='#5d6670';rr(g,-4.4,-14.5,4,6,1);g.fill();
  g.fillStyle=hg;g.beginPath();g.moveTo(-.8,-14.5);g.lineTo(5,-14);g.quadraticCurveTo(8,-17,12.5,-18.5);g.quadraticCurveTo(15.5,-11,12.5,-1.5);g.quadraticCurveTo(8,-3,5,-7);g.lineTo(-.8,-7.5);g.closePath();g.fill();
  g.strokeStyle='rgba(40,45,55,.55)';g.lineWidth=.6;g.stroke();
  g.strokeStyle=rbGrad(g,12,-19,12,-1,(time*.6)%1);g.lineWidth=2.6;g.beginPath();g.moveTo(12.5,-18.5);g.quadraticCurveTo(15.5,-11,12.5,-1.5);g.stroke();
  g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=.7;g.beginPath();g.moveTo(13.6,-15);g.quadraticCurveTo(15,-11,13.6,-6);g.stroke();
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(4.5,-12.4,3,1,-.3,0,7);g.fill();
  g.fillStyle='#e0b23c';g.beginPath();g.arc(1.6,-10.8,1.1,0,7);g.fill();
  var tw2=(time*3)%1;g.fillStyle='rgba(255,255,255,'+(1-tw2)+')';g.beginPath();for(var i2=0;i2<8;i2++){var a2=i2*Math.PI/4,r2=i2%2?1:3.2*(1-tw2*.5);g.lineTo(14+Math.cos(a2)*r2,-10+Math.sin(a2)*r2);}g.closePath();g.fill();
  g.restore();}
function drawStarPick(g,ang,sc){g.save();g.rotate(ang);g.scale(sc,sc);g.strokeStyle='#7a5a3c';g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(0,7);g.lineTo(0,-9);g.stroke();
  g.fillStyle=rbGrad(g,-10,-12,10,-6,(time*.5)%1);g.beginPath();g.moveTo(-11,-6);g.quadraticCurveTo(0,-15,11,-6);g.lineTo(0,-10);g.closePath();g.fill();
  g.translate(0,-11);g.rotate(time*2);g.fillStyle='#fff6a8';g.beginPath();for(var i=0;i<10;i++){var a2=i*Math.PI/5-Math.PI/2,r2=i%2?2.2:5;g.lineTo(Math.cos(a2)*r2,Math.sin(a2)*r2);}g.closePath();g.fill();g.strokeStyle='#ff8ad0';g.lineWidth=.7;g.stroke();g.restore();}
function drawRainbowRod(g,ang,sc){g.save();g.rotate(ang);g.scale(sc,sc);g.strokeStyle=rbGrad(g,0,7,12,-12,(time*.5)%1);g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(0,7);g.quadraticCurveTo(6,-4,12,-12);g.stroke();
  g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=.6;g.beginPath();g.moveTo(12,-12);g.lineTo(14,-4);g.stroke();g.fillStyle=rbGrad(g,10,-6,18,0,0);g.beginPath();g.ellipse(14,-2,4,2.4,0,0,7);g.fill();g.restore();}
function drawHeroHunter(g,a){var d=a.dir||1,bob=a.mv?Math.sin(a.bob*1.6)*1.2:0,aim=(a.aim||0)>.1;g.save();g.translate(a.x,a.y);
  if(a.role==='hunter'){
    drawHero(g,{x:0,y:0,role:'player',appearanceTier:4,martialLevel:13,dir:d,mv:a.mv,bob:a.bob,stab:a.stab,strikeType:a.strikeType,ultFxT:a.ultFxT},0);
    if(a.stab>0){var phase=Math.sin(Math.min(1,a.stab/.36)*Math.PI),kick=a.strikeType==='kick';g.save();g.scale(d,1);g.strokeStyle='rgba(247,216,144,'+(.7*phase)+')';g.lineWidth=2.5;g.beginPath();g.arc(4,kick?2:-15,kick?24:18,kick?-.6:-1.4,kick?.55:.2);g.stroke();g.restore();}}
  else if(a.role==='hunter2'){ /* 거북선: turtle ship - wooden hull, spiked turtle-shell roof, dragon head at the bow breathing smoke, red sails flags and oars */
    g.translate(0,bob);g.scale(d*1.2,1.2);
    g.fillStyle='rgba(60,140,190,.35)';g.beginPath();g.ellipse(0,9,26,5,0,0,7);g.fill();var wv=(time*2)%1;g.strokeStyle='rgba(255,255,255,'+(.7*(1-wv))+')';g.lineWidth=1;g.beginPath();g.ellipse(0,9,20+wv*10,4+wv*2,0,0,7);g.stroke();
    for(var o=0;o<5;o++){var oa=Math.sin(time*5+o)*.35;g.save();g.translate(-12+o*6,5);g.rotate(.9+oa);g.fillStyle='#6b4a2a';g.fillRect(-.6,0,1.2,9);g.restore();}
    g.fillStyle='#7a4a24';g.beginPath();g.moveTo(-22,-2);g.lineTo(20,-2);g.quadraticCurveTo(24,-2,22,4);g.lineTo(18,8);g.lineTo(-18,8);g.quadraticCurveTo(-24,4,-22,-2);g.closePath();g.fill();
    g.fillStyle='#5f3a1a';g.fillRect(-20,2,40,1.2);for(var pw=-16;pw<=14;pw+=6){g.fillStyle='#2b1d12';g.fillRect(pw,3.6,2.4,2);}
    g.fillStyle='#3f5a3a';g.beginPath();g.moveTo(-20,-2);g.quadraticCurveTo(-18,-16,0,-17);g.quadraticCurveTo(18,-16,19,-2);g.closePath();g.fill();
    g.strokeStyle='#2a3f28';g.lineWidth=.7;for(var hx2=-14;hx2<=14;hx2+=7){g.beginPath();g.moveTo(hx2-3,-6);g.lineTo(hx2,-10);g.lineTo(hx2+3,-6);g.lineTo(hx2,-2);g.closePath();g.stroke();}
    g.fillStyle='#d9dee4';for(var sp=-15;sp<=15;sp+=3.4){var sy=-2-Math.sqrt(Math.max(0,1-(sp/19)*(sp/19)))*14;g.beginPath();g.moveTo(sp-1,sy+1);g.lineTo(sp,sy-3);g.lineTo(sp+1,sy+1);g.closePath();g.fill();}
    g.fillStyle='#c8302f';g.beginPath();g.moveTo(19,-4);g.quadraticCurveTo(26,-8,28,-3);g.quadraticCurveTo(27,1,22,1);g.closePath();g.fill();g.fillStyle='#f0bb3f';g.beginPath();g.arc(24.5,-5,1.1,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.moveTo(26,-1);g.lineTo(28.5,-1.6);g.lineTo(26.4,.4);g.closePath();g.fill();
    var sm=(time*1.4)%1;g.fillStyle='rgba(200,200,205,'+(.7*(1-sm))+')';g.beginPath();g.arc(30+sm*10,-4-sm*6,2+sm*4,0,7);g.fill();if(aim){g.fillStyle='rgba(255,170,60,.9)';g.beginPath();g.arc(30,-3,3.5,0,7);g.fill();}
    /* Yi Sun-sin: navy lamellar armour, command sword and iron helmet above the ship. */
    isoBox(g,-8,-15,15,5,5,'#8f997d');
    g.fillStyle='#9d4335';g.beginPath();g.moveTo(-3,-31);g.quadraticCurveTo(-16,-29+Math.sin(time*3),-14,-17);g.lineTo(-4,-19);g.closePath();g.fill();
    var armour=g.createLinearGradient(-5,-31,7,-19);armour.addColorStop(0,'#7695a3');armour.addColorStop(.5,'#344e63');armour.addColorStop(1,'#152e40');g.fillStyle=armour;rr(g,-5,-31,12,15,3);g.fill();g.strokeStyle='#bfaa77';g.lineWidth=.7;for(var row=-27;row<-18;row+=3){g.beginPath();g.moveTo(-4,row);g.lineTo(6,row);g.stroke();}
    g.fillStyle='#dac397';g.fillRect(-5,-19,12,2);g.fillStyle='#dcc5a0';g.fillRect(0,-35,3,5);g.beginPath();g.ellipse(2,-36,4,4.7,0,0,7);g.fill();g.fillStyle='#213542';g.beginPath();g.ellipse(1,-39,5,3.8,0,Math.PI,Math.PI*2);g.fill();g.fillRect(-4,-39,10,2);g.fillStyle='#c4b688';g.fillRect(-4,-39,10,.8);g.fillStyle='#a54337';g.beginPath();g.moveTo(0,-42);g.lineTo(-1,-49);g.lineTo(3,-45);g.lineTo(2,-42);g.closePath();g.fill();
    g.fillStyle='#293c3b';g.fillRect(3,-36,1,.7);g.beginPath();g.moveTo(0,-33);g.lineTo(5,-33);g.lineTo(2,-30);g.closePath();g.fill();
    g.strokeStyle='#5b7683';g.lineWidth=3;g.beginPath();g.moveTo(5,-29);g.lineTo(9,-24);g.lineTo(13,-28);g.stroke();g.fillStyle='#e3c59a';g.beginPath();g.arc(13,-28,1.7,0,7);g.fill();g.strokeStyle='#d4e5e1';g.lineWidth=1.4;g.beginPath();g.moveTo(13,-29);g.lineTo(18,-41);g.stroke();g.strokeStyle='#d5b86f';g.lineWidth=1.6;g.beginPath();g.moveTo(10,-29);g.lineTo(15,-27);g.stroke();
    g.strokeStyle='#b7c3a6';g.lineWidth=1;g.beginPath();g.moveTo(-9,-16);g.lineTo(-9,-21);g.lineTo(8,-21);g.lineTo(8,-16);g.stroke();
    g.fillStyle='#8a6440';g.fillRect(-6,-24,1.2,9);g.fillStyle='#c8302f';g.beginPath();g.moveTo(-4.8,-24);g.lineTo(3+Math.sin(time*4)*1,-22);g.lineTo(-4.8,-19.5);g.closePath();g.fill();}
  else{ /* 광개토대왕: Goguryeo king on a galloping horse - gold crown, lamellar armour, red cape, horse bow */
    g.scale(d*1.25,1.25);var gal=a.mv?time*12:0,lg=function(px,ph){var sw=Math.sin(gal+ph)*(a.mv?4:0);g.strokeStyle='#5a3418';g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(px,0);g.lineTo(px+sw*.6,6);g.lineTo(px+sw,10);g.stroke();g.fillStyle='#2b1d12';g.beginPath();g.ellipse(px+sw,10.5,1.6,1,0,0,7);g.fill();};
    g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(0,11,16,3.5,0,0,7);g.fill();lg(-9,0);lg(7,1.6);
    g.fillStyle='#7a4a24';g.beginPath();g.ellipse(0,-3+bob*.5,13,6.4,0,0,7);g.fill();lg(-6,3.2);lg(10,4.8);
    g.fillStyle='#7a4a24';g.beginPath();g.moveTo(9,-6);g.quadraticCurveTo(14,-14,17,-16);g.lineTo(21,-13);g.quadraticCurveTo(19,-9,13,-2);g.closePath();g.fill();g.beginPath();g.ellipse(19,-14,4.2,2.6,.4,0,7);g.fill();
    g.fillStyle='#2b1d12';g.beginPath();g.moveTo(9,-8);g.quadraticCurveTo(13,-16,16,-17);g.lineTo(14,-12);g.closePath();g.fill();g.beginPath();g.moveTo(-12,-5);g.quadraticCurveTo(-18,-2+Math.sin(time*8)*2,-17,5);g.lineTo(-13,-2);g.closePath();g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(19.5,-15,.8,0,7);g.fill();g.fillStyle='#e0b23c';g.fillRect(-4,-9,9,2.2);g.fillStyle='#c8302f';g.fillRect(-6,-8,13,5);
    g.fillStyle='#c8302f';g.beginPath();g.moveTo(-1,-18);g.quadraticCurveTo(-10,-14+Math.sin(time*6)*2,-12,-6);g.lineTo(-3,-9);g.closePath();g.fill();
    g.fillStyle='#8a6a3a';rr(g,-3.6,-21,7.2,10,2.5);g.fill();g.strokeStyle='#e0b23c';g.lineWidth=.6;for(var lm=-19;lm<-12;lm+=2.2){g.beginPath();g.moveTo(-3.4,lm);g.lineTo(3.4,lm);g.stroke();}
    g.fillStyle='#ffe0c4';g.beginPath();g.arc(.5,-24.5,3.6,0,7);g.fill();g.fillStyle='#1d1a18';g.beginPath();g.arc(2,-25,.6,0,7);g.fill();g.fillRect(-.6,-22.4,3.4,.7);
    g.fillStyle='#f0bb3f';g.fillRect(-3.6,-28.4,8.2,2);for(var cp=-3;cp<=4;cp+=2.3){g.beginPath();g.moveTo(cp-.9,-28);g.lineTo(cp,-33);g.lineTo(cp+.9,-28);g.closePath();g.fill();}g.fillStyle='#4fb3a0';g.beginPath();g.arc(.5,-27.4,.7,0,7);g.fill();
    g.save();g.translate(6,-19);var pl=aim?2.5:0;g.strokeStyle='#5a3418';g.lineWidth=1.6;g.beginPath();g.arc(-1,0,8,-1.3,1.3);g.stroke();g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=.5;g.beginPath();g.moveTo(-1+8*Math.cos(-1.3),8*Math.sin(-1.3));g.lineTo(-1-pl,0);g.lineTo(-1+8*Math.cos(1.3),8*Math.sin(1.3));g.stroke();
    if(aim){g.fillStyle='#ff8a2a';g.beginPath();g.arc(8,0,1.6,0,7);g.fill();}g.restore();}
  g.restore();}
function drawMasterLumber(g,a){
  var pose={x:a.x,y:a.y,role:'lumber',appearanceTier:4,dir:-1,mv:false,bob:a.bob};
  g.fillStyle='rgba(193,172,119,.22)';g.beginPath();g.ellipse(a.x,a.y+9,13,4,0,0,7);g.fill();
  drawHero(g,pose,0);
  var phase=a.working?Math.min(1,(a.swT||0)/SUPER_T):0;
  g.save();g.translate(a.x-7,a.y-12);g.rotate(a.working?-.6+Math.sin(phase*Math.PI)*1.4:-.3);
  var wood=g.createLinearGradient(-1,0,2,0);wood.addColorStop(0,'#6e4b31');wood.addColorStop(.5,'#c69d6a');wood.addColorStop(1,'#80603f');g.fillStyle=wood;rr(g,-1.5,-15,3,26,1);g.fill();
  var steel=g.createLinearGradient(-10,-16,4,-6);steel.addColorStop(0,'#e1e8df');steel.addColorStop(.45,'#9baaa2');steel.addColorStop(1,'#52655d');g.fillStyle=steel;g.beginPath();g.moveTo(-1,-15);g.lineTo(-9,-18);g.quadraticCurveTo(-13,-12,-10,-6);g.lineTo(-1,-10);g.closePath();g.fill();g.strokeStyle='#e1e8df';g.lineWidth=1;g.beginPath();g.moveTo(-10,-17);g.quadraticCurveTo(-12,-12,-10,-7);g.stroke();g.restore();
  superPlate(g,a,true);
}
function drawSuper(a){var g=ctx,role=a.role,lum=role==='lumber',hun=isHunter(role),k=a.working?Math.min(1,(a.swT||0)/SUPER_T):0,pu=(Math.sin(time*3)+1)/2,col=lum?'255,190,90':(hun?'255,120,90':(role==='miner'?'255,140,230':'120,220,255'));
  if(lum){drawMasterLumber(g,a);return;}
  /* light rays behind */
  g.save();g.translate(a.x,a.y-10);g.rotate(time*.7);for(var r=0;r<10;r++){g.rotate(Math.PI/5);g.fillStyle='rgba(255,236,150,'+(.10+.08*pu)+')';g.beginPath();g.moveTo(0,0);g.lineTo(-5,-36-6*pu);g.lineTo(5,-36-6*pu);g.closePath();g.fill();}g.restore();
  /* ground rings */
  g.fillStyle='rgba(255,226,122,'+(.22+.16*pu)+')';g.beginPath();g.ellipse(a.x,a.y+8,24,8,0,0,7);g.fill();
  var rp=(time*.8)%1;g.strokeStyle='rgba(255,236,150,'+(.8*(1-rp))+')';g.lineWidth=2;g.beginPath();g.ellipse(a.x,a.y+8,12+rp*22,4+rp*7,0,0,7);g.stroke();
  g.strokeStyle='rgba('+col+','+(.55+.3*pu)+')';g.lineWidth=1.2;g.beginPath();g.ellipse(a.x,a.y+8,26,9,0,0,7);g.stroke();
  /* orbiting stars (back half) */
  function star(x,y,rr,al){g.fillStyle='rgba(255,250,210,'+al+')';g.beginPath();for(var i=0;i<10;i++){var an=i*Math.PI/5-Math.PI/2,ra=i%2?rr*.45:rr;g.lineTo(x+Math.cos(an)*ra,y+Math.sin(an)*ra);}g.closePath();g.fill();}
  var orb=[];for(var o=0;o<3;o++){var oa=time*2.2+o*2.094;orb.push({x:a.x+Math.cos(oa)*20,y:a.y-12+Math.sin(oa)*6,f:Math.sin(oa)>0});}
  orb.forEach(function(s2){if(!s2.f)star(s2.x,s2.y,2.6,.75);});
  if(Math.random()<.35)parts.push({x:a.x+(Math.random()-.5)*26,y:a.y+4,vx:(Math.random()-.5)*6,vy:-22-Math.random()*16,g:-4,life:.9,max:.9,col:Math.random()<.5?'#fff1a8':'rgb('+col+')',r:1.3,spark:true});
  if(hun){drawHeroHunter(g,a);orb.forEach(function(s2){if(s2.f)star(s2.x,s2.y,3.2,.95);});superPlate(g,a,false);return;}
  g.save();g.translate(a.x,a.y);g.scale(1.3,1.3);g.translate(-a.x,-a.y);curWalk=a.mv;curPh=a.bob;
  drawPerson(g,a.x,a.y,role,a.dir,0,4,4,4,a.gear);curWalk=null;
  g.save();g.translate(a.x+a.dir*12,a.y-8);g.scale(a.dir,1);
  var swingA=a.working?(k<.8?-1.6*k/.8:-1.6+3.2*(k-.8)/.2):-.3;
  if(lum||role==='miner'){if(a.working&&k>.6){g.fillStyle='rgba(255,236,150,'+(.5*k)+')';g.beginPath();g.moveTo(0,0);g.arc(0,0,18,-1.9,swingA-1.2);g.closePath();g.fill();}
    (lum?drawRainbowAxe:drawStarPick)(g,swingA,1.45);
    /* v63: every swing of the top-level axe / pickaxe throws rainbow stars */
    if(a.working&&k>.82&&Math.random()<.8){var hx=a.x+a.dir*(12+Math.cos(swingA-1.57)*16),hy=a.y-8+Math.sin(swingA-1.57)*16;for(var sq=0;sq<2;sq++)parts.push({x:hx,y:hy,vx:(Math.random()-.5)*80,vy:-20-Math.random()*50,g:110,life:.8,max:.8,col:'hsl('+Math.floor(Math.random()*360)+',95%,65%)',r:2.4,star:1});}}
  else if(hun){g.translate(-2,-4);g.scale(1.25,1.25);drawWpn(g,'gun',4,0,(a.aim||0)>.12);}
  else{drawRainbowRod(g,a.working?-.4-.6*k:.2,1.15);}
  g.restore();g.restore();
  orb.forEach(function(s2){if(s2.f)star(s2.x,s2.y,3.2,.95);});
  superPlate(g,a,!hun);}
function superPlate(g,a,bar){var k=a.working?Math.min(1,(a.swT||0)/SUPER_T):0,plateY=a.y-(a.role==='hunter2'?76:50);
  /* Keep the captain's nameplate above his helmet rather than across his face. */
  var lab='👑 '+a.gear.name;g.font='900 7.5px sans-serif';g.textAlign='center';g.textBaseline='middle';var tw=g.measureText(lab).width+12;
  var sh=g.createLinearGradient(a.x-tw/2,0,a.x+tw/2,0),sx=(time*.5)%1;sh.addColorStop(0,'#c8901a');sh.addColorStop(Math.max(0,sx-.15),'#e8b23c');sh.addColorStop(sx,'#fff6c8');sh.addColorStop(Math.min(1,sx+.15),'#e8b23c');sh.addColorStop(1,'#c8901a');
  g.fillStyle='rgba(60,40,10,.35)';rr(g,a.x-tw/2+1,plateY+1,tw,12,6);g.fill();g.fillStyle=sh;rr(g,a.x-tw/2,plateY,tw,12,6);g.fill();g.fillStyle='#4a3000';g.fillText(lab,a.x,plateY+6.4);
  if(a.working&&bar){g.fillStyle='rgba(0,0,0,.35)';rr(g,a.x-16,a.y-35,32,4.5,2.2);g.fill();g.fillStyle='#ffe27a';rr(g,a.x-16,a.y-35,32*k,4.5,2.2);g.fill();}
  if(a.full){g.font='800 6px sans-serif';var tw2=g.measureText('적재칸 가득').width+6;g.fillStyle='rgba(226,86,106,.9)';rr(g,a.x-tw2/2,a.y-61,tw2,8,4);g.fill();g.fillStyle='#fff';g.fillText('적재칸 가득',a.x,a.y-56.8);}}
/* the swing / net sweep / volley that clears the whole site */
function drawSuperFx(){var g=ctx;for(var i=SUPERFX.length-1;i>=0;i--){var f=SUPERFX[i],dur=f.k==='pop'?.5:(f.k==='net'?99:.7);f.t+=FDT;if(f.t>dur){SUPERFX.splice(i,1);continue;}var k=f.t/dur;
  if(f.k==='pop'){g.strokeStyle='rgba(255,236,150,'+(1-k)+')';g.lineWidth=2.4*(1-k)+.6;g.beginPath();g.arc(f.x,f.y-8,4+k*16,0,7);g.stroke();
    g.fillStyle='rgba(255,255,255,'+(.8*(1-k))+')';for(var r2=0;r2<4;r2++){var an=r2*1.571+k;g.fillRect(f.x+Math.cos(an)*(6+k*14)-1,f.y-8+Math.sin(an)*(6+k*14)-1,2,2);}continue;}
  if(f.k==='net'){ /* v65: rainbow net follows the fisher's net state - out, settle, then hauled back with the fish inside */
    var N=f.net;if(!N||N.done){SUPERFX.splice(i,1);continue;}var tt=N.t,fa=f.ax,st0=SITE.p1,rx0=st0.x+74,rx1=st0.x+118,ry0=st0.y+8,ry1=st0.y+st0.h-8,hx0=fa.x+12,hy0=fa.y-14;
    var out=tt<.45?tt/.45:(tt<.55?1:Math.max(0,1-(tt-.55)/.45)),e2=out*out*(3-2*out);
    var cx2=hx0+((rx0+rx1)/2-hx0)*e2,cy2=hy0+((ry0+ry1)/2-hy0)*e2,wx=8+(rx1-rx0-8)*e2,hy2=8+(ry1-ry0-8)*e2;
    g.save();g.lineWidth=1.3;for(var ni=0;ni<=6;ni++){g.strokeStyle=RAINBOW[ni];var yy2=cy2-hy2/2+hy2*ni/6;g.beginPath();g.moveTo(cx2-wx/2,yy2);g.quadraticCurveTo(cx2,yy2+3*Math.sin(time*6+ni),cx2+wx/2,yy2);g.stroke();}
    for(var nj=0;nj<=4;nj++){g.strokeStyle=RAINBOW[(nj*2)%7];var xx2=cx2-wx/2+wx*nj/4;g.beginPath();g.moveTo(xx2,cy2-hy2/2);g.lineTo(xx2,cy2+hy2/2);g.stroke();}
    g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=.8;g.beginPath();g.moveTo(hx0,hy0);g.lineTo(cx2-wx/2,cy2-hy2/2);g.moveTo(hx0,hy0);g.lineTo(cx2-wx/2,cy2+hy2/2);g.stroke();
    if(N.lifted){var hk=Math.min(1,(tt-.55)/.45);N.list.forEach(function(en,ei){var ex=en.x+(hx0-en.x)*hk*hk,ey=en.y+(hy0-en.y)*hk*hk-Math.sin(hk*Math.PI)*16,wig=Math.sin(time*18+ei)*.4;
      g.save();g.translate(ex,ey);g.rotate(wig-.6);drawItem(g,en.id,0,0,1.1);g.restore();});}
    g.restore();continue;}
  if(f.k==='shot'){g.strokeStyle='rgba(255,180,90,'+(1-k)+')';g.lineWidth=3*(1-k)+.5;g.beginPath();g.arc(f.x,f.y-14,8+k*30,0,7);g.stroke();continue;}
  var c=f.k==='tree'?'255,236,150':(f.k==='ore'?'255,190,240':'190,240,255');
  g.strokeStyle='rgba('+c+','+(1-k)+')';g.lineWidth=5*(1-k)+1;g.beginPath();g.arc(f.x,f.y-10,20+k*80,-2.4,2.4);g.stroke();
  g.strokeStyle='rgba(255,255,255,'+(.8*(1-k))+')';g.lineWidth=2*(1-k)+.5;g.beginPath();g.arc(f.x,f.y-10,10+k*55,-2.4,2.4);g.stroke();
  g.save();g.translate(f.x,f.y-10);g.rotate(k*1.5);for(var s3=0;s3<12;s3++){g.rotate(Math.PI/6);g.fillStyle='rgba('+c+','+(.5*(1-k))+')';g.fillRect(14+k*40,-1,10+k*16,2);}g.restore();}}
/* v67 (director: the hero looked too plain) - a proper adventurer that grows with the weapon level:
   Lv1-3 green ranger (hood, scarf), Lv4-7 blue knight (bandana, red cape, pauldrons), Lv8-11 steel paladin (plumed helmet, chest plate),
   Lv12+ golden hero (gold armour, crown, aura) */
/* v68 (director): the hero keeps growing - 5 looks and a bigger build each step; at the very top (a hunter crew at max) he rides a white horse as King Kim Suro in a Silla-style gilt-bronze crown */
/* v69 (director: the look should not change too early) - the hero's look follows the village progress:
   forest: ranger, knight once the forest hunters reach Lv8 / lake: paladin, golden hero once the lake hunters reach Lv8 / mine: golden hero, King Kim Suro on horseback once the mine hunters reach Lv5 */
function heroTier(){var st=S.stage||1,w=S.wlv||{};if(st>=3)return (w.hunter3||0)>=5?4:3;if(st>=2)return (w.hunter2||0)>=8?3:2;return (w.hunter||0)>=8?1:0;}
function drawHero(g,a,by){
  var T=a.appearanceTier===undefined?heroTier():a.appearanceTier,d=a.dir||1,walk=a.mv,ph=a.bob||0,master=a.role==='lumber',attack=(a.stab||0)>0,force=attack?Math.sin(Math.min(1,a.stab/.32)*Math.PI):0,kick=attack&&a.strikeType==='kick',rearStrike=attack&&a.strikeType==='punch-left';
  var HL=master?12:(a.martialLevel||wpnLv());
  var coat=(master?['#e6872a','#e6872a','#e6872a','#e6872a','#e6872a']:['#4e6e7c','#426b78','#365e6d','#2b505e','#233e4d'])[T],scarf=master?'#ffe06b':'#a54737';
  if(!master){coat=ART.coats[Math.min(12,HL-1)];scarf=ART.scarves[Math.min(12,HL-1)];}
  g.save();g.translate(a.x,a.y);g.scale(d,1);
  var wool=g.createLinearGradient(-7,-20,7,-3);wool.addColorStop(0,artShade(coat,1.35));wool.addColorStop(.45,coat);wool.addColorStop(1,artShade(coat,.5));coat=wool;
  g.fillStyle='rgba(28,52,48,.16)';g.beginPath();g.ellipse(0,12,8,2.5,0,0,7);g.fill();
  var stride=walk?Math.sin(ph)*2.3:0;
  /* Separate thighs, bent knees, boot soles and counter-swinging arms. */
  g.lineCap='round';g.lineJoin='round';
  [-1,1].forEach(function(side){var swing=stride*side,knee=side*2.5+swing*.4,foot=side*3+swing;
    var striking=kick&&side===1,legLift=striking?force*17:0;if(striking){knee+=force*8;foot+=force*20;}
    var trouser=g.createLinearGradient(side*2.5-2,0,side*2.5+2,0);trouser.addColorStop(0,'#7f8a79');trouser.addColorStop(.4,side<0?'#3b4c49':'#4d605a');trouser.addColorStop(1,'#243d34');g.strokeStyle=trouser;g.lineWidth=3.5;g.beginPath();g.moveTo(side*2.6,-2);g.lineTo(knee,5-legLift*.8);g.lineTo(foot,10-legLift);g.stroke();
    g.strokeStyle='#738078';g.lineWidth=.55;g.beginPath();g.moveTo(side*2.6,0);g.lineTo(knee,5-legLift*.8);g.stroke();
    g.fillStyle='#584b40';rr(g,foot-2,9-legLift,5.5,3.2,1);g.fill();g.fillStyle='#302f2c';rr(g,foot-2,11.4-legLift,5.8,1,0.4);g.fill();});
  g.translate(0,by*.65);
  var pack=g.createLinearGradient(-9,0,-4,0);pack.addColorStop(0,'#c4b294');pack.addColorStop(.5,'#8c7c61');pack.addColorStop(1,'#574b39');g.fillStyle=pack;rr(g,-9,-18,5,13,2);g.fill();g.fillStyle='#bdad8b';rr(g,-8,-16,3,4,.7);g.fill();
  g.strokeStyle='#915b44';g.lineWidth=3.6;g.beginPath();g.moveTo(-5,-18);g.lineTo(-7+(rearStrike?force*10:0),-12-stride*.5);g.lineTo(-6+(rearStrike?force*25:0),-6-stride*.8-(rearStrike?force*8:0));g.stroke();
  g.fillStyle='#665b4b';g.beginPath();g.arc(-6+(rearStrike?force*25:0),-5-stride*.8-(rearStrike?force*8:0),1.7,0,7);g.fill();
  /* Fitted shoulders and waist keep the silhouette human rather than a broad block. */
  g.fillStyle=coat;g.beginPath();g.moveTo(-3.6,-21);g.lineTo(-7,-18);g.lineTo(-4.5,-9);g.lineTo(-5,-1);g.quadraticCurveTo(0,1,5,-1);g.lineTo(4.5,-9);g.lineTo(7,-18);g.lineTo(3.6,-21);g.closePath();g.fill();
  g.fillStyle='rgba(45,38,29,.22)';g.beginPath();g.moveTo(4,-18);g.lineTo(6,-18);g.lineTo(4.5,-9);g.lineTo(5,-1);g.lineTo(2.8,-1);g.lineTo(3.2,-9);g.fill();g.strokeStyle='#e4b68d';g.lineWidth=.6;g.beginPath();g.moveTo(1,-18);g.lineTo(1,-2);g.stroke();
  g.strokeStyle='rgba(238,225,183,.6)';g.lineWidth=.7;g.beginPath();g.moveTo(-3,-19);g.lineTo(-4,-13);g.lineTo(-3,-6);g.stroke();
  g.fillStyle='rgba(22,42,34,.3)';g.beginPath();g.moveTo(-1,-19);g.lineTo(3,-12);g.lineTo(1,-3);g.lineTo(-1,-3);g.lineTo(1,-12);g.closePath();g.fill();
  if(!master){
    if(HL>=2){g.strokeStyle='#d8c69b';g.lineWidth=1.4;g.beginPath();g.moveTo(7,-10);g.lineTo(8,-8);g.stroke();}
    if(HL>=3){g.fillStyle='#b69a62';g.fillRect(-4,-7,8,1);}
    if(HL>=4){g.fillStyle='#7c9886';rr(g,-5,-17,4,3,1);g.fill();}
    if(HL>=5){var shoulder=g.createLinearGradient(3,-20,7,-15);shoulder.addColorStop(0,'#ded8b8');shoulder.addColorStop(1,'#71836b');g.fillStyle=shoulder;g.beginPath();g.ellipse(5,-17.5,3.2,2,-.1,0,7);g.fill();}
    if(HL>=6){g.fillStyle='#c5b58c';g.fillRect(-4.5,-9,2,6);}
    if(HL>=7){g.strokeStyle='#b59b62';g.lineWidth=.6;g.beginPath();g.moveTo(-3,-16);g.lineTo(-2,-8);g.lineTo(0,-5);g.stroke();}
    if(HL>=8){g.fillStyle='#8c967b';g.beginPath();g.ellipse(-4,-19,2.5,1.5,0,0,7);g.fill();}
    if(HL>=9){g.fillStyle='#d5b974';g.fillRect(-4,-5,8,1);}
    if(HL>=10){g.fillStyle='#bac6b6';rr(g,3,-14,2,6,.5);g.fill();}
    if(HL>=11){g.strokeStyle='#d0c398';g.lineWidth=.55;g.beginPath();g.moveTo(3,-21);g.lineTo(5,-17);g.lineTo(4,-12);g.stroke();}
    if(HL>=12){g.fillStyle='#d9c486';g.beginPath();g.arc(2,-16,1,0,7);g.fill();}
    if(HL>=13){g.strokeStyle='#e4d5aa';g.lineWidth=.8;g.beginPath();g.moveTo(-4,-21);g.lineTo(-5,-17);g.moveTo(4,-21);g.lineTo(6,-17);g.stroke();}
  }
  g.fillStyle='#826148';rr(g,-4.7,-4,9.4,1.7,.5);g.fill();g.fillStyle='#dbc694';rr(g,-.7,-4,2,1.7,.4);g.fill();
  g.strokeStyle='rgba(219,229,215,.62)';g.lineWidth=1;g.beginPath();g.moveTo(-2,-20);g.lineTo(4,-11);g.lineTo(0,-4);g.stroke();
  g.fillStyle='#d8c298';[-15,-10].forEach(function(y){g.beginPath();g.arc(2,y,.6,0,7);g.fill();});
  g.strokeStyle=coat;g.lineWidth=3.8;g.beginPath();g.moveTo(5,-18);g.lineTo(7+force*4,-13+stride*.5-force*2);g.lineTo(9+force*(kick?3:14),-8+stride*.7-force*7);g.stroke();
  g.strokeStyle='#dfb38f';g.lineWidth=.6;g.beginPath();g.moveTo(5.6,-17);g.lineTo(7.5,-13+stride*.5);g.stroke();
  g.fillStyle='#665b4b';g.beginPath();g.ellipse(9+force*(kick?3:14),-7+stride*.7-force*7,2,2.2,0,0,7);g.fill();
  /* Neck, ear, jaw, nose, brow, eye highlight and a quiet smile. */
  g.fillStyle='#d9a783';rr(g,-1.6,-24,3.2,4,1);g.fill();
  var skin=g.createLinearGradient(-3,-31,5,-23);skin.addColorStop(0,'#fff0cf');skin.addColorStop(.5,'#eac3a0');skin.addColorStop(1,'#b98567');g.fillStyle=skin;g.beginPath();g.moveTo(-3,-31);g.quadraticCurveTo(1,-35,4,-31);g.lineTo(4.5,-27);g.lineTo(5.5,-25.8);g.lineTo(4.3,-25);g.quadraticCurveTo(3,-22,0,-23);g.quadraticCurveTo(-3,-24,-3,-31);g.fill();
  g.fillStyle='#dba887';g.beginPath();g.ellipse(-2.8,-27,1.2,1.7,0,0,7);g.fill();
  g.fillStyle='#695040';g.beginPath();g.moveTo(-3.8,-27);g.lineTo(-3.8,-31);g.quadraticCurveTo(0,-36,4.2,-31);g.lineTo(3.6,-29.8);g.quadraticCurveTo(0,-32,-2,-29);g.lineTo(-2,-26);g.closePath();g.fill();
  /* Tied hair, a wind-tossed headband and strong eyebrows suit the martial hero. */
  g.fillStyle='#302f2b';g.beginPath();g.ellipse(-1,-35,2.3,3.4,-.3,0,7);g.fill();g.fillStyle='#b99c6d';g.fillRect(-3,-34,3.5,1);
  g.fillStyle=master?'#78644b':'#9d4335';rr(g,-4,-31.5,8.5,1.7,.5);g.fill();
  g.beginPath();g.moveTo(-3,-31);g.lineTo(-10,-29+Math.sin(time*3)*1.4);g.lineTo(-8,-27+Math.sin(time*3)*1.4);g.lineTo(-3,-30);g.fill();
  g.strokeStyle='#624a39';g.lineWidth=.9;g.beginPath();g.moveTo(.5,-29);g.lineTo(3.2,-29.5);g.stroke();
  var blink=(time*.6)%5<.13;g.fillStyle='#293e37';if(blink)g.fillRect(1.8,-27.8,1.5,.5);else{g.beginPath();g.ellipse(2.6,-27.6,.7,.9,0,0,7);g.fill();g.fillStyle='#fff7e6';g.fillRect(2.7,-28,.3,.3);}
  g.strokeStyle='#a16f5a';g.lineWidth=.45;g.beginPath();g.moveTo(2,-24.4);g.quadraticCurveTo(3,-24,3.9,-24.5);g.stroke();
  g.strokeStyle='#524335';g.lineWidth=.65;g.beginPath();g.moveTo(1.5,-24.8);g.lineTo(3.6,-24.7);g.moveTo(1,-23.6);g.lineTo(2.5,-23);g.stroke();
  g.fillStyle=scarf;rr(g,-4,-22,8.7,2.4,1);g.fill();g.beginPath();g.moveTo(-2.7,-20);g.lineTo(-5.2,-15+Math.sin(time*3));g.lineTo(-3,-14+Math.sin(time*3));g.lineTo(.1,-20);g.fill();
  g.strokeStyle='rgba(255,247,215,.45)';g.lineWidth=.45;g.beginPath();g.moveTo(-2,-21);g.lineTo(3.5,-21);g.stroke();
  if(T>=2){g.fillStyle='#d6b777';g.beginPath();g.arc(-2.5,-13,1.2,0,7);g.fill();}
  if(T===4){g.strokeStyle='#ead6a2';g.lineWidth=.6;g.beginPath();g.moveTo(-3,-35);g.lineTo(-1.5,-33.6);g.lineTo(0,-35.5);g.lineTo(1.8,-33.6);g.lineTo(3,-35);g.stroke();}
  if(attack){g.strokeStyle='rgba(236,210,148,'+force*.75+')';g.lineWidth=1.4;g.beginPath();g.arc(3,kick?0:-14,12+force*8,-.8,.8);g.stroke();}
  if((a.ultFxT||0)>0){var wave=1-a.ultFxT/.65;g.strokeStyle='rgba(243,219,158,'+(1-wave)*.8+')';g.lineWidth=2.2;g.beginPath();g.ellipse(0,9,135*wave,52*wave,0,0,7);g.stroke();g.strokeStyle='rgba(255,248,219,'+(1-wave)*.8+')';g.lineWidth=.8;g.beginPath();g.ellipse(0,9,110*wave,42*wave,0,0,7);g.stroke();}
  g.restore();
}

function drawAgent(a){
  var by=a.mv?-Math.abs(Math.sin(a.bob))*2.5:0;
  if(a.inside)return;
  if(a.gear&&a.gear.super&&SUPER_ROLES[a.role]){drawSuper(a);return;}
  if(a.role==='miner'&&(a.gear.pick||0)>=4){drawExcavator(a);drawVehicleUpgrade(ctx,a,a.gear.pick,'miner');return;}
  if(a.role==='lumber'&&(a.gear.axe||0)>=4){drawHarvester(a);drawVehicleUpgrade(ctx,a,a.gear.axe,'lumber');return;}
  if(a.role==='fisher'&&(a.gear.rod||0)>=4){drawFishRig(a);drawVehicleUpgrade(ctx,a,a.gear.rod,'fisher');return;}
  var kind=a.role==='lumber'?'tree':(a.role==='fisher'?'fish':(a.role==='miner'?'ore':a.kind));
  var t=a.role==='courier'?tierOf('cour',a.gear.cour||0):(isHunter(a.role)?tierOf('bow',a.gear.bow||0):toolTierFor(a,a.role==='player'?'tree':kind));
  var t2=a.role==='player'?toolTierFor(a,'fish'):t;
  if(a.role==='player')a.sc=1.23;
  ctx.save();ctx.translate(a.x,a.y);ctx.scale(a.sc,a.sc);ctx.translate(-a.x,-a.y);
  curWalk=a.mv;curPh=a.bob;
  if(a.role==='player'){drawHero(ctx,a,by);}
  else drawPerson(ctx,a.x,a.y,a.role,a.dir,by,tierOf('boots',a.gear.boots),t,t2,a.role==='player'?null:a.gear);
  curWalk=null;
  var fishing=a.working&&a.res&&a.res.k==='fish';
  if(a.role==='player'&&(!a.working||bearNear(a,150)||a.stab>0)){}
  else if(isHunter(a.role)){ctx.restore();ctx.save();if((a.gear.bow||0)>=7){ctx.save();ctx.translate(a.x+a.dir*9,a.y-14+by);ctx.scale(a.dir,1);drawWpn(ctx,'gun',Math.min(4,Math.floor((a.gear.bow||0)/3)),0,a.aim>.12);ctx.restore();}else drawBow(ctx,a,by,tierOf('bow',a.gear.bow||0),a.aim||0);}
  else if(a.role!=='courier'){
    ctx.save();ctx.translate(a.x+a.dir*11,a.y-3-LEGH+by);ctx.scale(a.dir,1);
    var tl=a.gear[toolTr(kind)]||0;
    if(kind==='tree'){if(tl>=6){if(a.working&&Math.random()<.4)parts.push({x:a.x+a.dir*22,y:a.y-8,vx:a.dir*(10+Math.random()*20),vy:-10-Math.random()*10,g:60,life:.4,max:.4,col:'#f3e3c3',r:1});drawChainsaw(ctx,a.working,toolTierFor(a,'tree'));}else drawAxe(ctx,0,0,a.working?Math.sin(a.swing)*.75:-.25,toolTierFor(a,'tree'),.8);}
    else if(kind==='ore'){if(tl>=6)drawDrill(ctx,a.working,toolTierFor(a,'ore'));else{ctx.save();ctx.rotate(a.working?Math.sin(a.swing)*.8:-.3);ctx.strokeStyle='#7a5a3c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,6);ctx.lineTo(0,-8);ctx.stroke();ctx.fillStyle=TOOL_COL[toolTierFor(a,'ore')];ctx.beginPath();ctx.moveTo(-7,-7);ctx.quadraticCurveTo(0,-12,7,-7);ctx.lineTo(0,-9);ctx.closePath();ctx.fill();ctx.restore();}}
    else{var ca=a.working?Math.sin(a.swing*.6)*.22:.2;if(fishing){var cyc=(a.swing/9)%2.6;ca=cyc<.4?.2-cyc/.4*1.3:(cyc<.6?-1.1+(cyc-.4)/.2*1.7:.6-Math.min(.25,(cyc-.6)*.5)+Math.sin(time*3)*.05);a.castCa=ca;a.castCyc=cyc;}drawRod(ctx,0,0,ca,toolTierFor(a,'fish'),.8,fishing);if(tl>=6){ctx.fillStyle='#3a3f45';ctx.beginPath();ctx.arc(2.5,2,2.4,0,7);ctx.fill();ctx.fillStyle='#8fe8ff';ctx.beginPath();ctx.arc(2.5,2,1,0,7);ctx.fill();}}
    ctx.restore();
  }
  ctx.restore();
  if(a.role!=='player'&&a.gear.name){ctx.font='700 6.5px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=2.2;ctx.strokeStyle='rgba(34,53,43,.7)';
    ctx.strokeText(a.gear.name,a.x,a.y-25+by);ctx.fillStyle='#fffbe8';ctx.fillText(a.gear.name,a.x,a.y-25+by);
    if(a.full&&!a.working){ctx.font='800 6px sans-serif';var ftw=ctx.measureText('적재칸 가득').width+6;ctx.fillStyle='rgba(226,86,106,.9)';rr(ctx,a.x-ftw/2,a.y-38+by,ftw,8,4);ctx.fill();ctx.fillStyle='#fff';ctx.fillText('적재칸 가득',a.x,a.y-33.8+by);}}
  if(fishing&&a.castCa!==undefined){
    var ca2=a.castCa,rx=9.6*Math.cos(ca2)+9.6*Math.sin(ca2),ry=9.6*Math.sin(ca2)-9.6*Math.cos(ca2);
    var tx=a.x+a.sc*a.dir*(11+rx),ty=a.y+a.sc*(-3-LEGH+by+ry),fq=a.res,cy2=a.castCyc,bx=fq.x,byb=fq.y+2+Math.sin(time*4+fq.ph)*.8;
    if(cy2>=.55){var k=Math.min(1,(cy2-.55)/.35),ex=tx+(bx-tx)*k,ey=ty+(byb-ty)*k-Math.sin(k*Math.PI)*14;
      ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(tx,ty);ctx.quadraticCurveTo((tx+ex)/2,Math.min(ty,ey)-(k<1?6:3),ex,ey);ctx.stroke();
      if((a.gear.rod||0)>=6){ctx.fillStyle='rgba(143,232,255,'+(.5+.4*Math.sin(time*8))+')';ctx.beginPath();ctx.arc(ex,ey,3.6,0,7);ctx.fill();}
      ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(ex,ey,1.7,0,7);ctx.fill();ctx.fillStyle='#ff5a5a';ctx.beginPath();ctx.arc(ex,ey-.6,1.7,Math.PI,0);ctx.fill();
      if(k>=1&&cy2<1.3){var rp=(cy2-.9)/.4;ctx.strokeStyle='rgba(255,255,255,'+(.8*(1-rp))+')';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(bx,byb+1,2+rp*9,1+rp*3,0,0,7);ctx.stroke();}}
  }
  if(a.stunT>0){ctx.font='700 9px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('💫',a.x+Math.sin(time*6)*3,a.y-32);}
  if(a.role==='player'){drawStack(a,by);return;}
  var n=bagN(a);
  if(n>0){
    var ids=Object.keys(a.bag).slice(0,3),full=false;
    ctx.font='700 8.5px sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
    var bw=ids.length*17+6,bx=a.x-bw/2,byy=a.y-(a.role==='player'?41:34);
    ctx.fillStyle=a.role==='courier'?'rgba(63,127,184,.92)':(full?'rgba(226,86,106,.9)':'rgba(34,53,43,.8)');rr(ctx,bx,byy,bw,12,6);ctx.fill();
    ids.forEach(function(id,i){drawItem(ctx,id,bx+7+i*17,byy+6,.48);ctx.fillStyle='#fff';ctx.fillText(String(a.bag[id]),bx+11+i*17,byy+6.5);});
  }
}
function drawCustomer(c){
  var by=c.mv?-Math.abs(Math.sin(c.bob))*2:0,g=ctx;
  g.fillStyle='rgba(0,0,0,.14)';g.beginPath();g.ellipse(c.x,c.y+7,5,2.2,0,0,7);g.fill();
  var cw=c.mv?Math.sin(c.bob):0;
  [-1,1].forEach(function(s){var ly=c.y+6-(c.mv?Math.max(0,s*cw)*2:0);g.strokeStyle=c.pants||'#4a4a5a';g.lineWidth=2.8;g.lineCap='round';g.beginPath();g.moveTo(c.x+s*2.2,c.y+by);g.lineTo(c.x+s*2.6,ly-.8);g.stroke();g.lineCap='butt';});
  g.fillStyle='#7a5a3c';[-1,1].forEach(function(s){g.beginPath();g.ellipse(c.x+s*2.6,c.y+6.5-(c.mv?Math.max(0,s*cw)*2:0),2.4,1.7,0,0,7);g.fill();});
  by-=3.5;
  [-1,1].forEach(function(s2){g.fillStyle=c.col;g.beginPath();g.arc(c.x+s2*5.8,c.y+by+1+(c.mv?Math.sin(c.bob)*s2:0),1.9,0,7);g.fill();g.fillStyle='#ffe0c4';g.beginPath();g.arc(c.x+s2*6.2,c.y+by+2.6+(c.mv?Math.sin(c.bob)*s2:0),1.3,0,7);g.fill();});
  g.fillStyle=c.col;g.beginPath();g.arc(c.x,c.y+by,6,0,7);g.fill();
  g.fillStyle='rgba(0,0,0,.14)';g.beginPath();g.arc(c.x+1.6,c.y+by+2,6.2,0,7);g.arc(c.x-.6,c.y+by-1,6,0,7,true);g.fill();
  g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.arc(c.x-1.5,c.y+by-2,3,3.4,5.6);g.fill();
  g.strokeStyle='rgba(50,35,25,.3)';g.lineWidth=.55;g.beginPath();g.arc(c.x,c.y+by,6,0,7);g.stroke();
  g.fillStyle='#ffe0c4';g.beginPath();g.arc(c.x+c.dir,c.y+by-5,4,0,7);g.fill();
  g.strokeStyle='rgba(120,80,60,.35)';g.lineWidth=.45;g.beginPath();g.arc(c.x+c.dir,c.y+by-5,4,0,7);g.stroke();
  g.fillStyle='rgba(255,140,140,.4)';g.beginPath();g.arc(c.x+c.dir*3,c.y+by-4,1.1,0,7);g.fill();
  g.fillStyle='#3a2c22';g.beginPath();g.arc(c.x+c.dir*2.2,c.y+by-5.2,.75,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(c.x+c.dir*2.2+.25,c.y+by-5.45,.25,0,7);g.fill();
  g.strokeStyle='#8a4a3a';g.lineWidth=.45;g.beginPath();g.arc(c.x+c.dir*1.8,c.y+by-3.4,.7,.3,Math.PI-.3);g.stroke();
  g.fillStyle=c.hair;g.beginPath();g.arc(c.x+c.dir,c.y+by-5.6,4.3,Math.PI,0);g.fill();g.beginPath();g.ellipse(c.x+c.dir*2,c.y+by-6,2.2,1,c.dir*.3,0,7);g.fill();
  if(c.regular){g.font='11px sans-serif';g.textAlign='center';g.fillStyle='#e0b54c';g.fillText('⭐',c.x,c.y-40);}
  if(c.state==='out'){g.font='11px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#000';g.fillText(c.mood==='angry'?'💢':'💖',c.x,c.y-15);return;}
  if(c.slot>=serv(c.seller)&&c.state==='line')return;
  var short=c.got<c.qty,txt=c.got+'/'+c.qty;
  g.font='700 8.5px sans-serif';g.textAlign='left';g.textBaseline='middle';
  var tw=g.measureText(txt).width+19,bx=c.x-tw/2,byy=c.y-27;
  var blink=short&&c.slot<serv(c.seller)&&ss(c.seller,c.want)===0&&Math.floor(time*3)%2===0;
  g.fillStyle=blink?'#ffb3bf':'rgba(255,255,255,.95)';rr(g,bx,byy,tw,12,6);g.fill();
  drawItem(g,c.want,bx+7,byy+6,.6);
  g.fillStyle=short?'#b3263b':'#22352b';g.fillText(txt,bx+13,byy+6.5);
  var pct=Math.max(0,c.pat/c.max);
  g.fillStyle=pct>.5?'#6fcf7f':(pct>.25?'#f0bb3f':'#e2566a');g.fillRect(bx,byy+12.5,tw*pct,1.8);
}
/* market walkway mats: stand here to hand goods over */
function drawMats(){
  var g=ctx,pl=agents[0],carry=bagN(pl)>0;MATS().forEach(function(m){var x=m.x,y=m.y,has=carry&&stackList(pl).some(function(id){return ITEMS[id].line===m.line;}),on=Math.hypot(pl.x-x,pl.y-y)<24;
    var bw=36,bh=34,x0=-bw/2,y0=-17,pulse=has?1+.05*Math.sin(time*8):1;
    g.save();g.translate(x,y);g.scale(pulse,pulse);
    g.fillStyle='rgba(0,0,0,.16)';rr(g,x0,y0+2,bw,bh,8);g.fill();
    var pg=g.createLinearGradient(0,y0,0,y0+bh);pg.addColorStop(0,m.line==='wood'?'#8a5a30':'#2f6b98');pg.addColorStop(1,m.line==='wood'?'#5f3c1e':'#1f4a6e');g.fillStyle=pg;rr(g,x0,y0,bw,bh,8);g.fill();
    g.fillStyle='rgba(255,255,255,.14)';rr(g,x0+2,y0+1.5,bw-4,bh*.35,6);g.fill();
    g.strokeStyle=has?'rgba(255,236,150,'+(.7+.3*Math.sin(time*8))+')':'rgba(255,255,255,.55)';g.lineWidth=has?2:1.4;g.setLineDash(has?[]:[3,2]);rr(g,x0+2,y0+2,bw-4,bh-4,6.5);g.stroke();g.setLineDash([]);
    drawItem(g,m.line==='wood'?'oak':'carp',-5,-5,.8);g.font='12px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('📦',7,-3);
    g.fillStyle='rgba(0,0,0,.45)';rr(g,x0+3,y0+bh-11.5,bw-6,9,4.5);g.fill();g.font='800 6.5px sans-serif';g.fillStyle='#fff';g.fillText('▼ 납품',0,y0+bh-6.8);
    g.restore();
    g.font='800 6.5px sans-serif';g.textAlign='center';g.textBaseline='middle';var lab=m.line==='wood'?'나무 납품':'생선 납품',cw=g.measureText(lab).width+8;
    g.fillStyle='rgba(255,252,240,.92)';rr(g,x-cw/2,y+19,cw,9,4.5);g.fill();g.fillStyle='#4a3a2c';g.fillText(lab,x,y+23.8);
    if(on&&has){g.fillStyle='rgba(79,179,106,.25)';rr(g,x+x0,y+y0,bw,bh,8);g.fill();}});
}
function drawTarget(){
  var g=ctx,pl=agents[0];
  if(pl.path.length&&pl.goal){var t=pl.goal;g.strokeStyle='rgba(240,187,63,'+(.6+.3*Math.sin(time*6))+')';g.lineWidth=2;g.setLineDash([5,3]);rr(g,t.c*T+2,t.r*T+2,T-4,T-4,6);g.stroke();g.setLineDash([]);}
  if(tapFx){tapFx.t-=1/60;if(tapFx.t<=0)tapFx=null;else{g.fillStyle='rgba(255,240,170,'+(tapFx.t*.4)+')';rr(g,tapFx.c*T,tapFx.r*T,T,T,6);g.fill();}}
}
function draw(){
  ctx.fillStyle='#d6eef5';ctx.fillRect(0,0,W,SH);
  ctx.save();if(SHAKE>0)ctx.translate(Math.sin(time*53)*SHAKE*3,Math.cos(time*47)*SHAKE*2.2);ctx.scale(Z,Z);ctx.translate(-camX,-camY);
  drawOutskirts(ctx,-112,'left');if(fenceX()>=W-1)drawOutskirts(ctx,W,'right');
  ctx.drawImage(BG,0,WORLD_TOP,W,HT-WORLD_TOP);
  drawPlaza();
  SITES.forEach(drawSite);
  /* v50 (perf): the palisade only lives in two thin strips - blit those instead of the whole world-sized layer */
  /* The visible perimeter follows the same intact/breached state as bear collision. */
  drawMarketGround();
  drawRoad();
  drawMats();drawTarget();drawFence();drawXTowers();
  res.forEach(function(q){if(q.k==='fish'&&owned(q.s))drawFish(q);});
  drawBelts();
  SITES.forEach(function(st){if(owned(st.id))drawPile(st.id);});
  SITES.forEach(function(st){drawExport(st.id);});
  LINES.forEach(drawStall);
  drawCash();
  drawLocked();
  drawGuide();drawPads();drawTapMark();
  var list=[],vx0=camX-50,vx1=camX+W/Z+50,vy0=camY-60,vy1=camY+SH/Z+60;function vis(o){return o.x>vx0&&o.x<vx1&&o.y>vy0&&o.y<vy1;} /* v59: things off screen are not drawn */
  res.forEach(function(q){if(!vis(q))return;if(q.k==='tree'&&owned(q.s))list.push({y:q.y+8,f:drawTree,o:q});else if(q.k==='ore'&&owned(q.s))list.push({y:q.y+8,f:drawOre,o:q});});
  agents.forEach(function(a){if(!a.inside&&vis(a))list.push({y:a.y+9,f:drawAgent,o:a});});
  customers.forEach(function(c){if(vis(c))list.push({y:c.y+8,f:drawCustomer,o:c});});
  BEARS.forEach(function(b){list.push({y:b.y+2,f:drawBear,o:b});});
  list.sort(function(a,b){return a.y-b.y;});
  list.forEach(function(it){it.f(it.o);});
  drawPads(true);drawFacilityLabels();drawSuperFx();drawLoot();drawArrows();drawBearTargets();
  trucks.slice().sort(function(a,b){return a.y-b.y;}).forEach(drawTruck);
  trucks.forEach(drawTruckBubble);
  drawFly();
  drawCelebs();
  drawChecks();
  res.forEach(function(q){if(q.k==='fish'&&owned(q.s))drawBar(q,-10);});
  parts.forEach(function(pt){ctx.globalAlpha=Math.max(0,pt.life/pt.max);ctx.fillStyle=pt.col;
    if(pt.ring){var rp=1-pt.life/pt.max;ctx.strokeStyle=pt.col;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(pt.x,pt.y+3,3+rp*11,1.5+rp*4.5,0,0,7);ctx.stroke();}
    else if(pt.star){ctx.save();ctx.translate(pt.x,pt.y);ctx.rotate(time*6+pt.x);ctx.beginPath();for(var si2=0;si2<10;si2++){var sa2=si2*Math.PI/5,sr2=si2%2?pt.r*.45:pt.r;ctx.lineTo(Math.cos(sa2)*sr2,Math.sin(sa2)*sr2);}ctx.closePath();ctx.fill();ctx.restore();}
    else if(pt.leaf){ctx.save();ctx.translate(pt.x,pt.y);ctx.rotate(pt.x*.2+time*3);ctx.beginPath();ctx.ellipse(0,0,2.4,1.2,0,0,7);ctx.fill();ctx.restore();}
    else if(pt.spark){ctx.fillRect(pt.x-pt.r,pt.y-.5,pt.r*2,1);ctx.fillRect(pt.x-.5,pt.y-pt.r,1,pt.r*2);}else{ctx.beginPath();ctx.arc(pt.x,pt.y,pt.r,0,7);ctx.fill();}});
  ctx.globalAlpha=1;
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  floats.slice(-8).forEach(function(fl){var unit=screenUnit/Z,al=Math.min(1,Math.max(0,(2-fl.t)/.6));ctx.globalAlpha=al;ctx.font='600 '+((fl.small?9:10)*unit)+'px sans-serif';ctx.lineWidth=2*unit;ctx.strokeStyle='rgba(35,49,39,.8)';
    var chars=Array.from(String(fl.text)),lines=[];for(var i=0;i<chars.length;i+=24)lines.push(chars.slice(i,i+24).join(''));
    lines.slice(0,2).forEach(function(line,i){var fw=ctx.measureText(line).width,fxx=Math.max(camX+fw/2+4*unit,Math.min(camX+W/Z-fw/2-4*unit,fl.x));var lineH=11*unit,minY=camY+10*unit,maxY=camY+SH/Z-10*unit-(Math.min(2,lines.length)-1)*lineH;var yy=Math.max(minY,Math.min(Math.max(minY,maxY),fl.y-fl.t*12))+i*lineH;ctx.strokeText(line,fxx,yy);ctx.fillStyle=fl.col;ctx.fillText(line,fxx,yy);});});
  ctx.globalAlpha=1;
  ctx.restore();
  drawTutorialEdge();drawAmbient();
  ctx.save();ctx.scale(Z,Z);ctx.translate(-camX,-camY);
  drawPills();
  drawTutArrow();
  ctx.restore();
  drawBearChip();drawTutEdge();drawStageBanner();drawCoinFly();drawJoy();drawEndingCinematic();
  if(flash>0){ctx.fillStyle='rgba(255,255,255,'+flash*.45+')';ctx.fillRect(0,0,W,SH);}
}
/* ---------- ambient: day cycle, drifting leaves, fireflies, soft vignette ---------- */
var DAY=300;
function dayL(){return .5+.5*Math.cos(time/DAY*6.2832);}
function nightAmt(){return 0;}
/* raid cycle (names kept for save compatibility: S.season/S.winters): each chapter has a calm preparation window before bear raids */
var SEASON_LEN=200,WINTER_LEN=75;
/* Shorter preparation and longer raids increase pressure as new villages open. */
function seasonLen(){var st=S.stage||1;return st>=3?140:(st>=2?170:SEASON_LEN);}
function raidLen(){var st=S.stage||1;return st>=3?85:(st>=2?80:WINTER_LEN);}
function winterStart(){return seasonLen()-raidLen();}
function isWinter(){return (S.season||0)>=winterStart();}
function winterLeft(){return Math.max(0,seasonLen()-(S.season||0));}
function toWinter(){return Math.max(0,winterStart()-(S.season||0));}
var LEAVES=[],FLIES=[];
for(var li=0;li<10;li++)LEAVES.push({x:hs(li,1)*W,y:hs(li,2)*H,s:1.4+hs(li,3)*2.2,ph:hs(li,4)*6,c:li%4?'#ffffff':'#d9edf6'});
for(var fi=0;fi<16;fi++)FLIES.push({x:hs(fi,5)*MX,y:hs(fi,6)*H,ph:hs(fi,7)*6,r:6+hs(fi,8)*14});
/* v51: the snow overlay, snowflakes and blue tint that still showed during raids were removed (winter concept stays deleted); v53: the last blue raid tint and teal backdrop removed too */
function drawAmbient(){
  var g=ctx;
  LEAVES.forEach(function(lf){
    lf.y+=(10+lf.s*3)*FDT;lf.x+=Math.sin(time*.6+lf.ph)*9*FDT;
    if(lf.y>SH+5){lf.y=-5;lf.x=hs(time|0,lf.ph)*W;}if(lf.x>W+5)lf.x=-5;
    g.save();g.globalAlpha=.45+lf.s*.14;g.fillStyle=lf.c;g.beginPath();g.arc(lf.x,lf.y,lf.s*.45,0,7);g.fill();g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=.55;g.beginPath();g.moveTo(lf.x-lf.s,lf.y);g.lineTo(lf.x+lf.s,lf.y);g.moveTo(lf.x,lf.y-lf.s);g.lineTo(lf.x,lf.y+lf.s);g.stroke();g.restore();
  });
  g.globalAlpha=1;
  /* warm key light from the top-left and a soft vignette */
  /* v50 (perf): the key light + vignette are painted once per screen size, not rebuilt as two full-screen gradients every frame */
  if(!AMBC||AMBC.sh!==SH){AMBC=document.createElement('canvas');AMBC.sh=SH;AMBC.width=Math.ceil(W*DPR);AMBC.height=Math.ceil(SH*DPR);var a=AMBC.getContext('2d');a.setTransform(DPR,0,0,DPR,0,0);
    var kl=a.createLinearGradient(0,0,W,SH);kl.addColorStop(0,'rgba(255,236,190,.10)');kl.addColorStop(.5,'rgba(255,236,190,0)');kl.addColorStop(1,'rgba(40,30,60,.08)');a.fillStyle=kl;a.fillRect(0,0,W,SH);
    var vg=a.createRadialGradient(W/2,SH/2,Math.min(W,SH)*.45,W/2,SH/2,Math.max(W,SH)*.75);vg.addColorStop(0,'rgba(30,25,20,0)');vg.addColorStop(1,'rgba(30,25,20,.18)');a.fillStyle=vg;a.fillRect(0,0,W,SH);}
  g.drawImage(AMBC,0,0,W,SH);
}
var AMBC=null;

/* ---------- UI ---------- */
var fmt=function(n){return Math.floor(n).toLocaleString('ko-KR');};
function money50(n){return n>0?Math.ceil((n-1e-7)/50)*50:0;}
function moneyShort(n){n=Math.floor(n);return n>=1e12?(n/1e12).toFixed(1).replace(/\.0$/,'')+'조':n>=1e8?(n/1e8).toFixed(1).replace(/\.0$/,'')+'억':n>=1e4?(n/1e4).toFixed(1).replace(/\.0$/,'')+'만':fmt(n);}
function mkUp(o){
  if(o.cost){var originalCost=o.cost;o.cost=function(){return money50(originalCost());};}
  o.isMax=o.isMax||function(){return S[o.id]>=o.max;};
  var originalCanBuy=o.canBuy;o.canBuy=function(){return S.coins>=o.cost()&&(!originalCanBuy||originalCanBuy());};
  o.lv=o.lv||function(){return 'Lv.'+(S[o.id]+1);};
  return o;
}
function gearDef(track,title,unit){
  return mkUp({id:track,gear:true,cost:function(){return gcost(track,S.p[track]||0);},
    isMax:function(){return (S.p[track]||0)>=MAXLV[track];},
    lv:function(){return 'Lv.'+((S.p[track]||0)+1)+' · 내 장비';},
    name:function(){return title;},
    desc:function(){
      var lv=S.p[track]||0,t=tierOf(track,lv),s='';
      if(track==='boots')s+='속도 '+(100+12*lv)+'→'+(112+12*lv)+'% · ';
      if(t<4){var n=TH[track][t+1]-lv,sp=track==='axe'?TREES[t+1].name:(track==='rod'?FISH[t+1].name:'');
        s+=(n===1?'다음':n+'번 더')+' → '+NAMES[track][t+1]+unit+(sp?'('+sp+')':'');}
      else s+='최고 등급';
      return s;
    }});
}
function weaponDef(){
  return mkUp({id:'wpn',gear:true,weapon:true,cost:function(){return gcost('wpn',S.p.wpn||0);},
    hidden:function(){return true;},
    isMax:function(){return (S.p.wpn||0)>=MAXLV.wpn;},
    lv:function(){var l=S.p.wpn||0;return l?'Lv.'+l+' '+WKN[wkind()]:'없음';},
    name:function(){return '권법·발차기';},
    label:function(){var l=S.p.wpn||0,nk=wkind(l+1);return !l?'권법·발차기 수련 · 북극곰과 싸워요':(nk!==wkind(l)?'✨ '+WKN[nk]+'으로 진화!':WKN[wkind()]+' 강화 · 곰에게 더 세게');},
    cap:function(){var l=S.p.wpn||0;return l?WKN[wkind()]+' Lv'+l:'무기';},
    desc:function(){return '주먹·발차기 · 8연타 뒤 광역 궁극기';}});
}
function lowestWorker(roles,tr){var best=null;S.w.forEach(function(g){if(roles.indexOf(g.role)<0)return;var l=g[tr]||0;if(l>=MAXLV[tr])return;if(!best||l<(best[tr]||0))best=g;});return best;}
function bulkDef(tr,roles,title,eff){return mkUp({id:'bulk_'+tr+'_'+roles.join('_'),bulk:1,tr:tr,roles:roles,
  hidden:function(){return !S.w.some(function(g){return roles.indexOf(g.role)>=0;});},
  cost:function(){var g=lowestWorker(roles,tr);return g?gcost(tr,g[tr]||0,true):0;},
  isMax:function(){return !lowestWorker(roles,tr);},
  lv:function(){var ls=S.w.filter(function(g){return roles.indexOf(g.role)>=0;}).map(function(g){return g[tr]||0;});return ls.length?ls.length+'명 · 최저 Lv.'+Math.min.apply(null,ls):'';},
  name:function(){return title;},
  desc:function(){var n=0,c=S.coins,sim=S.w.filter(function(g){return roles.indexOf(g.role)>=0;}).map(function(g){return g[tr]||0;});
    while(true){var mi=-1;sim.forEach(function(l,i){if(l<MAXLV[tr]&&(mi<0||l<sim[mi]))mi=i;});if(mi<0)break;var cc=gcost(tr,sim[mi],true);if(c<cc)break;c-=cc;sim[mi]++;n++;if(n>300)break;}
    return eff+' · 지금 '+n+'번 올릴 수 있어요';}});}
var PRIM={lumber:'axe',fisher:'rod',hunter:'bow',hunter2:'bow',hunter3:'bow',miner:'pick'};
function wLv(g){return g[PRIM[g.role]]||0;}
function lowestOf(role){var best=null;S.w.forEach(function(g){if(g.role!==role||wLv(g)>=MAXLV[PRIM[role]])return;if(!best||wLv(g)<wLv(best))best=g;});return best;}
var WROLE={lumber:'나무꾼',fisher:'낚시꾼',hunter:'사냥꾼',hunter2:'호수 사냥꾼',hunter3:'광산 사냥꾼',miner:'광부'};
function wBehind(role){var L=(S.wlv&&S.wlv[role])||0;return S.w.filter(function(g){return g.role===role&&wLv(g)<L;});}
function wupCost(role){return Math.round(wupCost0(role)*(role==='miner'?3:(role==='hunter'?.8:(role==='hunter2'?2.5:(role==='hunter3'?4:1))))*stageCostMult(role==='miner'?3:(role==='fisher'?2:1)));}
function wupCost0(role){var L=S.wlv[role]||0,pr=PRIM[role],b=wBehind(role);
  if(b.length){var c=0;b.forEach(function(g){for(var l=wLv(g);l<L;l++)c+=gcost(pr,l,true);});return Math.max(10,Math.round(c*.9));}
  return Math.round(gcost(pr,L,true)*2*(.6+.4*count(role)));}
/* v67 (director): a hunter crew can only take its final upgrade once all 5 hunters of that village are hired */
function wupLock(role){if(!isHunter(role))return '';var L=(S.wlv&&S.wlv[role])||0;return (!wBehind(role).length&&L+1>=MAXLV.bow&&count(role)<5)?'사냥꾼 5명을 모두 고용해야 최고 레벨로 올려요':'';}
function wupDef(role,title){return mkUp({id:'wup_'+role,wup:role,lock:function(){return wupLock(role);},canBuy:function(){return !wupLock(role)&&S.coins>=wupCost(role);},why:function(){return wupLock(role)||'코인이 부족해요';},
  hidden:function(){return !S.w.some(function(g){return g.role===role;});},
  cost:function(){return wupCost(role);},
  isMax:function(){return !wBehind(role).length&&(S.wlv[role]||0)>=MAXLV[PRIM[role]];},name:function(){return title;},
  lv:function(){return wBehind(role).length?'맞추기':'Lv'+(S.wlv[role]||0);},
  label:function(){var L=S.wlv[role]||0;if(wBehind(role).length)return WROLE[role]+' 모두 Lv'+L+'로 맞추기';if(SUPER_ROLES[role]&&L+1>=MAXLV[PRIM[role]])return '🌟 '+WROLE[role]+' 모두 Lv'+(L+1)+' · 슈퍼 '+WROLE[role]+' 1명으로 합체!';if(role==='hunter'&&!(SUPER_ROLES[role]&&L+1>=MAXLV[PRIM[role]])){var nk=wkind(L+2);return '사냥꾼 모두 Lv'+(L+1)+' · 임꺽정 권법·발차기도 강화';}return WROLE[role]+' 모두 Lv'+(L+1)+((L+1)===6?' · ✨ 첨단 장비!':' · 더 빨리 일해요');},
  desc:function(){return '';}});}
function hireDef(role,name,base,max,desc){
  return mkUp({id:'hire_'+role,role:role,max:max,hidden:function(){return (role==='miner'&&!owned('m1'))||(role==='fisher'&&(S.stage||1)<2);} /* v72: fisher hire only once the lake village opens */,cost:function(){return Math.round(base*Math.pow(2.1,count(role))*stageCostMult(role==='miner'?3:(role==='fisher'?2:1)));},
    isMax:function(){return count(role)>=max;},lv:function(){return count(role)+'명';},
    canBuy:function(){return S.lodge>0&&S.coins>=Math.round(base*Math.pow(2.1,count(role))*stageCostMult(role==='miner'?3:(role==='fisher'?2:1)));},
    why:function(){return S.lodge?'코인이 부족해요':'일꾼 숙소를 먼저 지어요';},
    name:function(){return name+' 고용';},desc:function(){return S.lodge?desc():'광장에 일꾼 숙소를 먼저 지어요';}});
}
function autocashDef(){return mkUp({id:'autocash',max:3,cost:function(){return [250,900,2600][S.autocash||0];},isMax:function(){return (S.autocash||0)>=3;},
  lv:function(){return S.autocash?'Lv.'+S.autocash:'없음';},name:function(){return S.autocash?'자동 수금 강화':'💰 자동 수금';},
  desc:function(){var L=(S.autocash||0)+1;return '손님이 둔 돈을 '+[8,5,3][L-1]+'초마다 알아서 챙겨요';}});}
function wh2Def(){return mkUp({id:'wh2',max:3,hidden:function(){return !S.whLv;},cost:function(){return Math.round(700*Math.pow(2,S.wh2||0));},isMax:function(){return (S.wh2||0)>=3;},
  lv:function(){return S.wh2?'Lv.'+S.wh2:'미건설';},name:function(){return S.wh2?'제2 창고 확장':'제2 창고 짓기';},
  desc:function(){return '보관 +'+(S.wh2?40:60)+'칸 · 트럭이 더 자주 와요';}});}
function procDef(b,name,base){return mkUp({id:b,cost:function(){var L=S[b]||0;return Math.round(base*Math.pow(b==='elec'?2.6:2.2,L)*(L===5?3:1)*stageCostMult(b==='smelt'||b==='elec'?3:(b==='smoke'?2:1)));},isMax:function(){return (S[b]||0)>=8;},
  hidden:function(){var p=plotOf(b);return !(p.show()||p.built());},lv:function(){return S[b]?'Lv.'+S[b]:'미건설';},name:function(){return S[b]?name+' 강화':name+' 짓기';},desc:function(){return '';}});}
function pstDef(b){var nm={mill:'제재소',smoke:'훈제소',smelt:'제련소',elec:'전자 공장'}[b];return mkUp({id:'pst_'+b,pst:b,hidden:function(){return !S[b];},cost:function(){var L=(S.pst&&S.pst[b])||0;return Math.round({mill:160,smoke:180,smelt:900,elec:1500}[b]*Math.pow(b==='smelt'||b==='elec'?2.4:2,L)*stageCostMult(b==='smelt'||b==='elec'?3:(b==='smoke'?2:1)));},
  isMax:function(){return ((S.pst&&S.pst[b])||0)>=5;},lv:function(){var L=(S.pst&&S.pst[b])||0;return L?'Lv.'+L+' · '+storeCap(b)+'칸':'없음';},name:function(){return (S.pst&&S.pst[b])?nm+' 창고 넓히기':nm+' 창고 짓기';},desc:function(){var L=((S.pst&&S.pst[b])||0)+1;return '보관 '+(30+26*(L-1))+'칸 · 가공 +'+(25*L)+'% 빨라요'+(b==='smelt'?'':' · 트럭 값 +'+(30*L)+'% · 더 자주, 더 많이');}});}
function procBeltDef(b){return mkUp({id:'pbelt_'+b,pbelt:b,cost:function(){return 120;},isMax:function(){return !!(S.pcv&&S.pcv[b]);},hidden:function(){return !S[b]||(b==='elec'&&!S.smelt);},name:function(){return {mill:'숲→제재소',smoke:'강→훈제소',smelt:'광산→제련소',elec:'제련소→전자 공장'}[b]+' 벨트';},lv:function(){return '';},desc:function(){return '';}});}
function beltUpCost(line){var L=(S.cvLv&&S.cvLv[line])||1;return Math.round(70*Math.pow(2.2,L-1)*(L>=5?Math.pow(1.5,L-4):1)*(line==='fish'?stageCostMult(2):(line==='iron'?stageCostMult(3):1)));}
function beltUpHidden(line){return function(){if(line==='wood')return !(S.cv.f1||(S.pcv&&S.pcv.mill));if(line==='fish')return !(S.cv.p1||(S.pcv&&S.pcv.smoke));return !((S.pcv&&S.pcv.smelt)||(S.pcv&&S.pcv.elec));};}
function beltUpDef(line,nm){return mkUp({id:'beltup_'+line,cost:function(){return beltUpCost(line);},isMax:function(){return ((S.cvLv&&S.cvLv[line])||0)>=CV_MAX;},hidden:beltUpHidden(line),name:function(){return nm+' 벨트 전체 강화';},lv:function(){return 'Lv.'+lineBeltLv(line);},desc:function(){return '';}});}
function towerDef(){return mkUp({id:'tower',max:TOWER_MAX,hidden:function(){return !huntReady();},cost:function(){return Math.round((S.tower?260*Math.pow(2.1,S.tower):30)*stageCostMult(S.stage));},isMax:function(){return S.tower>=TOWER_MAX;},
  lv:function(){return S.tower?'Lv.'+S.tower:'미건설';},name:function(){return S.tower?'망루 강화':'망루 짓기';},
  desc:function(){return '곰에게 자동으로 화살 · 공격력 '+(S.tower?towerDmg().toFixed(1):'0')+'→'+towerDmgAt((S.tower||0)+1).toFixed(1)+' · 사냥꾼 고용';}});}
function fenceDef(){return mkUp({id:'fence',max:5,hidden:function(){return !huntReady();},cost:function(){return Math.round((S.fence?220*Math.pow(2.2,S.fence):20)*stageCostMult(S.stage));},isMax:function(){return S.fence>=5;},
  lv:function(){return S.fence?'Lv.'+S.fence:'없음';},name:function(){return S.fence>=2?'성벽 강화':(S.fence?'울타리 강화':'울타리 치기');},
  desc:function(){var L=S.fence+1;return '내구도 '+fenceHpAt(L)+' · 곰 공격 간격 '+(1.1+.45*L).toFixed(1)+'초 · 피해 -'+Math.round((1-Math.max(.55,1-.08*L))*100)+'%';}});}
/* v59 (director 2026-10-04): hunters cost more - base 180, x2.2 per hunter, and x1 / x3 / x10 by village stage */
function vtowerDef(v){return mkUp({id:'vtower'+v,vt:v,max:TOWER_MAX,hidden:function(){return (S.stage||1)<v||!huntReady();},cost:function(){var L=(S.vt&&S.vt[v])||0;return Math.round((L?260*Math.pow(2.1,L):30)*stageCostMult(v));},isMax:function(){return ((S.vt&&S.vt[v])||0)>=TOWER_MAX;},
  lv:function(){var L=(S.vt&&S.vt[v])||0;return L?'Lv.'+L:'미건설';},name:function(){return (v===2?'호수':'광산')+' 망루'+(((S.vt&&S.vt[v])||0)?' 강화':' 짓기');},desc:function(){return '이 마을 성벽 위 망루';}});}
function vfenceDef(v){return mkUp({id:'vfence'+v,vf:v,max:5,hidden:function(){return (S.stage||1)<v||!huntReady();},cost:function(){var L=(S.vf&&S.vf[v])||0;return Math.round((L?220*Math.pow(2.2,L):20)*stageCostMult(v));},isMax:function(){return ((S.vf&&S.vf[v])||0)>=5;},
  lv:function(){var L=(S.vf&&S.vf[v])||0;return L?'Lv.'+L:'없음';},name:function(){return (v===2?'호수':'광산')+' 성벽'+(((S.vf&&S.vf[v])||0)?' 강화':' 짓기');},desc:function(){var L=((S.vf&&S.vf[v])||0)+1;return '내구도 '+fenceHpAt(L)+' · 곰 공격 간격 '+(1.1+.45*L).toFixed(1)+'초 · 피해 감소';}});}
function vfenceRepairDef(v){return mkUp({id:'vfence_fix'+v,vfRepair:v,hidden:function(){return (S.stage||1)<v||!VFBREACH[v];},cost:function(){return Math.round(100*stageCostMult(v));},isMax:function(){return !VFBREACH[v];},lv:function(){return '뚫림';},name:function(){return (v===2?'호수':'광산')+' 성벽 수리';},desc:function(){return '곰이 뚫은 성벽을 즉시 다시 막아요';}});}
var VFIXDEF={2:vfenceRepairDef(2),3:vfenceRepairDef(3)};
function hunterCost(role){role=role||'hunter';return Math.round(150*Math.pow(2,count(role))*({hunter:1,hunter2:3,hunter3:8}[role]));}
function hvTower(role){var v=HV[role];return v===1?S.tower>0:((S.vt&&S.vt[v])||0)>0;}
function hunterDef(role){role=role||'hunter';var v=HV[role];return mkUp({id:'hire_'+role,role:role,max:5,hidden:function(){return !huntReady()||(S.stage||1)<v;},cost:function(){return hunterCost(role);},
  isMax:function(){return count(role)>=5;},lv:function(){return count(role)+'명';},
  canBuy:function(){return hvTower(role)&&S.coins>=hunterCost(role);},
  why:function(){return hvTower(role)?'코인이 부족해요':'이 마을 망루를 먼저 지어요';},
  name:function(){return HNAME[role]+' 고용';},desc:function(){return S.tower?'곰을 쫓아가 활을 쏘고, 전리품을 가게에 납품해요':'광장에 망루를 먼저 지어요';}});}
function lodgeDef(){return mkUp({id:'lodge',lodgeB:1,max:1,cost:function(){return 60;},isMax:function(){return S.lodge>=1;},
  lv:function(){return S.lodge?'완공':'미건설';},name:function(){return '일꾼 숙소 짓기';},desc:function(){return '나무꾼·낚시꾼을 고용할 수 있어요';}});}
function millDef(){return mkUp({id:'mill',max:4,cost:function(){return Math.round(180*Math.pow(2.1,S.mill));},isMax:function(){return S.mill>=4;},
  lv:function(){return S.mill?'Lv.'+S.mill:'미건설';},name:function(){return S.mill?'제재소 강화':'제재소 짓기';},
  desc:function(){return '나무 판매값 +'+(20*S.mill)+'→'+(20*(S.mill+1))+'%';}});}
function smokeDef(){return mkUp({id:'smoke',max:4,cost:function(){return Math.round(200*Math.pow(2.1,S.smoke));},isMax:function(){return S.smoke>=4;},
  lv:function(){return S.smoke?'Lv.'+S.smoke:'미건설';},name:function(){return S.smoke?'훈제장 강화':'훈제장 짓기';},
  desc:function(){return '생선 판매값 +'+(20*S.smoke)+'→'+(20*(S.smoke+1))+'%';}});}
function trunkDef(){
  return mkUp({id:'trunk',trunkUp:1,cost:function(){return Math.round(150*Math.pow(2,S.trunk));},
    isMax:function(){return S.trunk>=5;},lv:function(){return S.trunk?'Lv.'+S.trunk:'미건설';},
    name:function(){return S.trunk?'벨트 모터실 강화':'벨트 모터실 짓기';},
    desc:function(){return '모든 벨트 속도 +'+(20*S.trunk)+'→'+(20*(S.trunk+1))+'%';}});
}
function siteDef(sid){
  var st=SITE[sid],arr=st.kind==='forest'?TREES:FISH;
  return mkUp({id:'site_'+sid,site:sid,hidden:function(){return sid==='m1'&&!S.smelt;},cost:function(){return siteCost(sid);},isMax:function(){return siteLv(sid)>=SITE_MAX;},
    lv:function(){return owned(sid)?'Lv.'+siteLv(sid):'미개척';},
    name:function(){return owned(sid)?st.name+' 가꾸기':st.name+' 개척';},
    desc:function(){return '';}});
}
function beltDef(sid){
  var st=SITE[sid];
  return mkUp({id:'belt_'+sid,beltOf:sid,cost:function(){return cvCost(sid);},isMax:function(){return !!S.cv[sid];},
    hidden:function(){return !owned(sid);},
    lv:function(){return cvLv(sid)?'Lv.'+cvLv(sid):'미설치';},
    name:function(){return st.name+' 벨트'+(cvLv(sid)?' 강화':' 설치');},
    desc:function(){var L=cvLv(sid)+1;return '초당 '+convRate(L).toFixed(1)+'회 · 한 번에 '+convBatch(L)+'개';}});
}
function shopStaffDef(line){return mkUp({id:'shopstaff_'+line,shopStaff:line,cost:function(){return 150*Math.pow(2.6,shopStaffLevel(line));},isMax:function(){return shopStaffLevel(line)>=6;},hidden:function(){return !lineOpen(line);},lv:function(){return 'Lv.'+shopStaffLevel(line);},name:function(){return SHOPDEF[line].name+' · 가게 일손';},desc:function(){return '손님이 많아졌어요. 일손을 더 들일까요? 다음: '+(shopStaffLevel(line)%2===0?'점원 고용 · 응대·계산 개선':'진열대 추가 · 판매대 +1')+' · Lv2부터 단골손님';}});}
function shopDef(line){
  var nm=SHOPDEF[line].name,base=line==='wood'?120:160;
  return mkUp({id:'shop_'+line,shop:line,cost:function(){return Math.round(base*Math.pow(1.9,S.shop[line]-1)*stageCostMult(line==='fish'?2:1));},
    isMax:function(){return S.shop[line]>=8;},lv:function(){return 'Lv.'+S.shop[line];},
    name:function(){return nm+' 넓히기';},
    desc:function(){
      return '손님 더 많이 · 줄 '+Math.min(10,4+S.shop[line])+'명 · 가격 +15%';
    }});
}
var TABS=[
  {id:'gear',label:'🧰 장비',items:[
    weaponDef()
  ]},
  {id:'crew',label:'👷 일꾼',items:[
    hireDef('lumber','나무꾼',40,5,function(){return '새 일꾼은 Lv.1 도끼·장화로 시작해요';}),
    hireDef('fisher','낚시꾼',55,5,function(){return '새 일꾼은 Lv.1 낚싯대·장화로 시작해요';}),
    hireDef('miner','광부',450,5,function(){return '고급 인력 · 광산에서 금광석까지 캐요';}),
    hunterDef('hunter'),hunterDef('hunter2'),hunterDef('hunter3'),wupDef('lumber','나무꾼 강화'),wupDef('fisher','낚시꾼 강화'),wupDef('hunter','사냥꾼 강화'),wupDef('hunter2','호수 사냥꾼 강화'),wupDef('hunter3','광산 사냥꾼 강화'),wupDef('miner','광부 강화'),
    bulkDef('axe',['lumber'],'🪓 나무꾼 도끼 모두 강화','베는 속도 +35%/Lv'),
    bulkDef('rod',['fisher'],'🎣 낚시꾼 낚싯대 모두 강화','낚는 속도 +35%/Lv'),
    bulkDef('boots',['lumber','fisher','hunter'],'👢 모든 일꾼 장화 강화','이동 속도 +15%/Lv'),
    bulkDef('bow',['hunter'],'🏹 사냥꾼 활 모두 강화','곰 공격력 +0.6/Lv')
  ]},
  {id:'move',label:'🏗️ 시설',items:[
    siteDef('f1'),siteDef('p1'),
    beltDef('f1'),beltDef('p1'),
    trunkDef(),
    mkUp({id:'pile',max:6,cost:function(){return Math.round(40*Math.pow(1.7,S.pile)*(1+0.1*siteScore()));},
      name:function(){return S.pile?'적재장 확장':'적재장 짓기';},lv:function(){return pcap()+'칸';},
      desc:function(){return '적재칸마다 '+pcap()+'→'+(pcap()+6)+'개까지';}}),
    towerDef(),fenceDef(),vtowerDef(2),vtowerDef(3),vfenceDef(2),vfenceDef(3),procDef('mill','제재소',260),procDef('smoke','훈제소',300),procDef('smelt','제련소',700),procDef('elec','전자 공장',2600),procBeltDef('mill'),procBeltDef('smoke'),procBeltDef('smelt'),procBeltDef('elec'),beltUpDef('wood','숲'),beltUpDef('fish','강'),beltUpDef('iron','광산'),pstDef('mill'),pstDef('smoke'),pstDef('smelt'),pstDef('elec'),siteDef('m1')
  ]},
  {id:'shop',label:'🏪 가게',items:[shopDef('wood'),shopDef('fish'),shopStaffDef('wood'),shopStaffDef('fish'),autocashDef()]}
];
function drawIcon(d,cv2){
  var g=cv2.getContext('2d');g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,28,28);
  function person(role,t){g.save();g.translate(14,15);g.scale(.8,.8);drawPerson(g,0,0,role,1,0,0,t);g.restore();}
  if(d.id==='axe')drawAxe(g,11,16,.35,ptier('axe'),1.15);
  else if(d.id==='wpn'){g.save();g.translate(12,16);g.rotate(-.6);drawWpn(g,wkind()||'axe',wtier(),0,false);g.restore();}
  else if(d.id==='spear'){g.save();g.translate(14,14);g.rotate(-.7);g.fillStyle='#8a6440';g.fillRect(-11,-1.2,20,2.4);g.fillStyle=TOOL_COL[ptier('spear')];g.beginPath();g.moveTo(14,0);g.lineTo(7,-4);g.lineTo(7,4);g.closePath();g.fill();g.fillStyle='#e2463c';g.fillRect(5,-2,2,4);g.restore();}
  else if(d.id==='bow'){g.strokeStyle=['#8a6440','#e8dcc0','#aeb8c2','#f0bb3f','#8fe8ff'][ptier('bow')];g.lineWidth=2.4;g.beginPath();g.arc(10,14,10,-1.2,1.2);g.stroke();g.strokeStyle='#fff';g.lineWidth=.8;g.beginPath();g.moveTo(10+10*Math.cos(-1.2),14+10*Math.sin(-1.2));g.lineTo(10+10*Math.cos(1.2),14+10*Math.sin(1.2));g.stroke();g.strokeStyle='#7a5a3c';g.lineWidth=1.2;g.beginPath();g.moveTo(6,14);g.lineTo(22,14);g.stroke();}
  else if(d.id==='rod')drawRod(g,7,19,0,ptier('rod'),1.05,false);
  else if(d.wh){g.fillStyle='#d8b687';g.fillRect(5,13,18,11);g.fillStyle='#b4513b';g.beginPath();g.moveTo(3,14);g.lineTo(8,7);g.lineTo(20,7);g.lineTo(25,14);g.closePath();g.fill();g.fillStyle='#9a938a';g.fillRect(10,16,8,8);}
  else if(d.id==='cour'){var ct=teamTier('cour');g.fillStyle=['#a8743f','#b98b5e','#9aa5b1','#f0bb3f','#8fe8ff'][ct];rr(g,5,10,18,13,2.5);g.fill();
    g.fillStyle='rgba(255,255,255,.3)';g.fillRect(6,11,16,2);g.strokeStyle='rgba(60,40,20,.45)';g.lineWidth=1;g.beginPath();g.moveTo(5,16.5);g.lineTo(23,16.5);g.stroke();
    g.strokeStyle='#7a5a3c';g.lineWidth=1.6;g.beginPath();g.arc(14,10,4,Math.PI,0);g.stroke();}
  else if(d.id==='boots'){g.save();g.translate(14,17);g.scale(1.7,1.7);drawBoots(g,0,0,ptier('boots'));g.restore();}
  else if(d.id==='bag'){g.font='18px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('🎒',14,15);}
  else if(d.role)person(d.role,0);
  else if(d.site){var st=SITE[d.site];if(st.kind==='forest'){drawItem(g,TREES[Math.max(0,siteLv(d.site)-1)].id,14,15,1.5);}else{g.fillStyle='#8fcfe6';rr(g,4,8,20,14,6);g.fill();drawItem(g,FISH[Math.max(0,siteLv(d.site)-1)].id,14,15,1.2);}}
  else if(d.beltOf){g.fillStyle=BELTCOL[SITE[d.beltOf].line];g.fillRect(3,15,22,6);g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=1;for(var bi=0;bi<4;bi++){g.beginPath();g.moveTo(5+bi*5,16);g.lineTo(7+bi*5,18);g.lineTo(5+bi*5,20);g.stroke();}drawItem(g,SITE[d.beltOf].kind==='forest'?'oak':'carp',14,11,.9);}
  else if(d.id==='lodge'){g.fillStyle='#ecd2a8';g.fillRect(6,13,16,11);g.fillStyle='#6f9a5a';g.beginPath();g.moveTo(3,14);g.lineTo(14,6);g.lineTo(25,14);g.closePath();g.fill();g.fillStyle='#9a6b40';g.fillRect(12,17,5,7);}
  else if(d.id==='smoke'){g.fillStyle='#b8664a';g.fillRect(6,12,16,12);g.fillStyle='#5b4636';g.beginPath();g.moveTo(4,13);g.lineTo(14,6);g.lineTo(24,13);g.closePath();g.fill();g.fillStyle='rgba(210,210,210,.8)';g.beginPath();g.arc(20,4,2.5,0,7);g.fill();g.fillStyle='#ff9a50';g.fillRect(11,17,6,4);}
  else if(d.id==='mill'){g.save();g.translate(14,14);g.rotate(time*4);g.fillStyle='#c9ced4';g.beginPath();for(var k2=0;k2<10;k2++){var a2=k2*.628;g.lineTo(Math.cos(a2)*9,Math.sin(a2)*9);g.lineTo(Math.cos(a2+.3)*7,Math.sin(a2+.3)*7);}g.closePath();g.fill();g.fillStyle='#7d746a';g.beginPath();g.arc(0,0,2.2,0,7);g.fill();g.restore();}
  else if(d.trunkUp){g.fillStyle='#7d746a';g.beginPath();g.arc(14,14,9,0,7);g.fill();g.fillStyle='#5b4636';g.beginPath();g.arc(14,14,6,0,7);g.fill();g.strokeStyle='#e8dccb';g.lineWidth=1.6;g.beginPath();for(var q=0;q<3;q++){var an=time*2+q*2.09;g.moveTo(14,14);g.lineTo(14+Math.cos(an)*5,14+Math.sin(an)*5);}g.stroke();}
  else if(d.conv){g.fillStyle=d.conv==='wood'?'#7a5a3c':'#3f6f98';g.fillRect(3,16,22,5);drawItem(g,d.conv==='wood'?'oak':'carp',11,12,.9);drawItem(g,d.conv==='wood'?'oak':'carp',19,12,.9);}
  else if(d.id==='pile'){for(var i=0;i<6;i++){g.fillStyle='#a07a50';rr(g,5+(i%3)*6+Math.floor(i/3)*3,20-Math.floor(i/3)*4,6,3.5,1.5);g.fill();}}
  else if(d.shop){var sd=SHOPDEF[d.shop];for(var k=0;k<6;k++){g.fillStyle=k%2?sd.awn2:sd.awn;g.fillRect(3+k*3.7,4,3.8,6);}
    g.fillStyle='#c48d52';g.fillRect(3,19,22,6);drawItem(g,sd.icon,14,15,.9);}
}
var tabsEl=document.getElementById('tabs'),drawer=document.getElementById('drawer'),btns={},allDefs=[],tabBtns={},panes={};
var activeTab=null;
TABS.forEach(function(tab){
  var tb=document.createElement('button');tb.className='tab';tb.type='button';tb.innerHTML=tab.label+'<span class="dot"></span>';
  tb.setAttribute('aria-expanded','false');
  tb.addEventListener('click',function(){activeTab=activeTab===tab.id?null:tab.id;applyTab();});
  tabsEl.appendChild(tb);tabBtns[tab.id]=tb;
  var pane=document.createElement('div');pane.className='grid';panes[tab.id]=pane;
  tab.items.forEach(function(d){
    allDefs.push(d);d.tab=tab.id;DEF[d.id]=d;
    var b=document.createElement('button');b.className='card';b.type='button';
    var top=document.createElement('div');top.className='top';
    var ic=document.createElement('canvas');ic.width=56;ic.height=56;
    var nm=document.createElement('div');nm.className='nm';
    top.appendChild(ic);top.appendChild(nm);
    var ds=document.createElement('div');ds.className='ds';
    var cs=document.createElement('span');cs.className='cost';
    b.appendChild(top);b.appendChild(ds);b.appendChild(cs);
    b.addEventListener('click',function(){buy(d);});
    pane.appendChild(b);btns[d.id]={b:b,ic:ic,nm:nm,ds:ds,cs:cs,key:''};
  });
  if(tab.id==='shop'){
    var rs=document.createElement('button');rs.className='reset';rs.type='button';rs.textContent='처음부터 다시 시작';
    var armed=false;
    rs.addEventListener('click',function(){
      if(!armed){armed=true;rs.textContent='한 번 더 누르면 초기화돼요';setTimeout(function(){armed=false;rs.textContent='처음부터 다시 시작';},3500);return;}
      startOver();
    });
    pane.appendChild(rs);
  }
});
var staffBoard=document.createElement('section');staffBoard.className='staffBoard';staffBoard.setAttribute('aria-label','직원 현황판');
staffBoard.innerHTML='<div class="staffTop"><div class="staffTitle">📋 직원 현황</div><div class="staffCount" id="staffCount">0명 근무 중</div></div><div class="staffRows" id="staffRows"></div>';
panes.crew.insertBefore(staffBoard,panes.crew.firstChild);
var wlist=document.createElement('div');wlist.className='wlist';panes.crew.appendChild(wlist);
function staffStatus(a){
  if(a.stunT>0)return ['치료 중','alert'];
  if(isHunter(a.role)){
    var bear=BEARS.some(function(b){return b.state==='in'||b.state==='attack'||b.state==='fence';});
    if(bear)return [a.aim>0?'곰과 교전 중':'곰에게 이동 중','alert'];
    if(bagN(a)>0)return ['전리품 납품 중',''];
    return [a.inside?'망루에서 대기':'순찰 중','wait'];
  }
  if(a.full)return ['적재칸 확인 중','wait'];
  if(a.working)return [a.gear&&a.gear.super?'대량 채집 중':'채집 중',''];
  if(a.path&&a.path.length)return ['작업장으로 이동','wait'];
  if(a.res)return [a.res.alive?'채집 준비 중':'자원 회복 대기','wait'];
  if(a.waitQ)return ['자원 회복 대기','wait'];
  if(a.inside)return ['숙소에서 휴식','wait'];
  return ['다음 작업 찾는 중','wait'];
}
function refreshStaffBoard(){
  var rows=document.getElementById('staffRows'),countEl=document.getElementById('staffCount');if(!rows||!countEl)return;
  countEl.textContent=S.w.length+'명 · '+agents.filter(function(a){return a.role!=='player'&&a.working;}).length+'명 작업 중';
  if(!S.w.length){rows.innerHTML='<div class="staffEmpty">아직 고용한 직원이 없어요. 아래에서 직원을 고용해보세요.</div>';return;}
  var html='';S.w.forEach(function(g){var a=agents.filter(function(x){return x.gear===g;})[0],st=a?staffStatus(a):['휴식 중','wait'];
    var job=(g.super?SUPERNAME[g.role]+' · ':'')+(WROLE[g.role]||'일꾼');
    html+='<div class="staffRow"><div class="staffName">'+(g.name||'일꾼')+'</div><div class="staffJob">'+job+'</div><div class="staffState '+st[1]+'"><i class="staffDot"></i>'+st[0]+'</div></div>';});
  rows.innerHTML=html;
}
var wKey='',wRows=[],WTN={axe:'도끼',rod:'낚싯대',boots:'장화',bow:'활'};
function wTracks(g){return g.role==='lumber'?['axe','boots']:(g.role==='hunter'?['bow','boots']:['rod','boots']);}
function renderWorkers(){
  wlist.style.display='flex';
  var key=S.w.map(function(g){return g.role;}).join(',');
  if(key!==wKey){
    wKey=key;wlist.innerHTML='';wRows=[];var idx={lumber:0,fisher:0};
    if(S.w.length){var hd=document.createElement('div');hd.className='whead';hd.textContent='고용한 일꾼 · 장비 강화는 마을 발판에서 해요';wlist.appendChild(hd);}
    S.w.forEach(function(g){
      idx[g.role]=(idx[g.role]||0)+1;
      var row=document.createElement('div');row.className='wrow';
      var ic=document.createElement('canvas');ic.width=56;ic.height=56;
      var info=document.createElement('div');info.className='wi';
      var bx=document.createElement('div');bx.className='wbtns';
      row.appendChild(ic);row.appendChild(info);row.appendChild(bx);wlist.appendChild(row);
      var bs=wTracks(g).map(function(tr){var b=document.createElement('button');b.type='button';b.className='wbtn';b.disabled=true;b.title='장비 강화 발판에 올라서면 강화돼요';bx.appendChild(b);return {b:b,tr:tr};});
      wRows.push({g:g,ic:ic,info:info,bs:bs,name:g.name+' <span class="wrole">'+(g.role==='lumber'?'나무꾼':g.role==='hunter'?'사냥꾼':'낚시꾼')+'</span>',key:''});
    });
  }
  var any=false;
  wRows.forEach(function(r){
    var g=r.g,tt=g.role==='lumber'?'axe':(g.role==='hunter'?'bow':'rod');
    r.info.innerHTML=r.name+'<small>'+NAMES[tt][tierOf(tt,g[tt]||0)]+' '+WTN[tt]+' · '+NAMES.boots[tierOf('boots',g.boots||0)]+' 장화</small>';
    r.bs.forEach(function(x){var lv=g[x.tr]||0,mx=lv>=MAXLV[x.tr],c=gcost(x.tr,lv,true),can=!mx&&S.coins>=c;if(can)any=true;
      x.b.innerHTML=mx?WTN[x.tr]+'<b>최대</b>':WTN[x.tr]+'<b>발판에서 강화</b>';x.b.disabled=true;x.b.classList.remove('off');});
    var k=tierOf(tt,g[tt]||0)+','+tierOf('boots',g.boots||0)+','+g.name;
    if(r.key!==k){r.key=k;var cg=r.ic.getContext('2d');cg.setTransform(2,0,0,2,0,0);cg.clearRect(0,0,28,28);cg.save();cg.translate(14,15);cg.scale(.8,.8);drawPerson(cg,0,0,g.role,1,0,tierOf('boots',g.boots||0),tierOf(tt,g[tt]||0),undefined,g);cg.restore();}
  });
  return any;
}
var management=document.createElement('section');management.id='management';management.setAttribute('aria-label','마을 관리');
var appEl=document.querySelector('.app');appEl.appendChild(management);management.appendChild(tabsEl);management.appendChild(drawer);
function setManagement(open){management.classList.toggle('open',!!open);document.body.classList.toggle('management-open',!!open);}
document.getElementById('quickJournal').addEventListener('click',storyBookOpen);
document.getElementById('quickDay').addEventListener('click',function(){dayBtn.click();});
document.getElementById('quickMap').addEventListener('click',function(){zoomBtn.click();});
document.getElementById('quickSettings').addEventListener('click',function(){var open=setP.hidden;setP.hidden=!open;gearBtn.setAttribute('aria-expanded',open?'true':'false');sfx('tap');});
function applyTab(){
  drawer.innerHTML='';
  TABS.forEach(function(t){var on=t.id===activeTab;tabBtns[t.id].classList.toggle('on',on);tabBtns[t.id].setAttribute('aria-expanded',on?'true':'false');});
  if(activeTab){drawer.appendChild(panes[activeTab]);drawer.hidden=false;setManagement(true);}else{drawer.hidden=true;setManagement(false);}
  fit();
}
function buy(d,fromPad){
  if(!fromPad){sfx('nope');var player0=agents[0];if(player0)addFloat(player0.x,player0.y-36,'발판 위에 올라서면 구매돼요','#ffe2a8');return false;}
  if(d.isMax()||!d.canBuy()||(d.hidden&&d.hidden())){sfx('nope');return;}
  if(d.bulk){var nUp=0;while(true){var gw=lowestWorker(d.roles,d.tr);if(!gw)break;var cw=gcost(d.tr,gw[d.tr]||0,true);if(S.coins<cw)break;S.coins-=cw;gw[d.tr]=(gw[d.tr]||0)+1;nUp++;if(nUp>300)break;}
    if(nUp){var pw0=agents[0];celebrate(pw0.x,pw0.y,d.name().replace(/ 모두 강화| 강화/,'')+' +'+nUp+'회',nUp>=3);agents.forEach(function(a){if(a.role!=='player'&&d.roles.indexOf(a.role)>=0)burst(a.x,a.y-10,'#ffe27a',6,true);});}
    save();refreshUI();return;}
  sfx('build');stat('buy',1);
  var c=d.cost(),pl=agents[0];
  S.coins-=c;
  if(d.id&&d.id.indexOf('beltup_')===0){var bln=d.id.slice(7);S.cvLv=S.cvLv||{};var BL0=lineBeltLv(bln);/* v75: a line starts at Lv1 with cvLv 0 or 1, so the first upgrade used to change nothing - it now always lands on Lv2 */S.cvLv[bln]=Math.max(2,(S.cvLv[bln]||0)+1);var pz=agents[0],BL=S.cvLv[bln];celebrate(pz.x,pz.y,tierOfBelt(BL).name+' 벨트 Lv.'+BL+' · 더 굵게!',true);BELTFX[bln]={t:0,dur:1.6,from:BL0,to:lineBeltLv(bln),end:false};save();refreshUI();return;}
  if(d.pst){var pb0=d.pst;S.pst[pb0]=(S.pst[pb0]||0)+1;var shp=shedPos(pb0);celebrate(shp.x,shp.y-10,S.pst[pb0]===1?'창고 완공! 트럭이 와요':'창고 Lv.'+S.pst[pb0],true);truckT[pb0]=Math.min(truckT[pb0],4);save();refreshUI();return;}
  if(d.pbelt){if(!S.pcv)S.pcv={};S.pcv[d.pbelt]=1;if(!S.beltLv)S.beltLv=1;var pb=plotOf(d.pbelt);celebrate(pb.x+pb.w/2,pb.y+10,'벨트 연결!',false);save();refreshUI();return;}
  if(d.wup){var wr=d.wup,pr=PRIM[wr],catchUp=wBehind(wr).length>0;if(!catchUp)S.wlv[wr]=(S.wlv[wr]||0)+1;var WL=S.wlv[wr];
    S.w.forEach(function(g){if(g.role!==wr)return;g[pr]=Math.max(g[pr]||0,WL);g.boots=Math.max(g.boots||0,Math.min(MAXLV.boots,WL));});
    if(canMerge(wr)){mergeCrew(wr,true);refreshUI();return;}
    if(wr==='hunter'){var pw=agents[0],nk1=wkind();celebrate(pw.x,pw.y,'권법·발차기 Lv.'+wpnLv(),nk1!==wkind(wpnLv()-1));}
    var first=true;agents.forEach(function(a){if(a.role!==wr)return;if(first){celebrate(a.x,a.y,WROLE[wr]+' 모두 Lv.'+WL+(catchUp?' 맞춤!':'!'),!catchUp);first=false;}else{burst(a.x,a.y-10,'#ffe27a',12,true);addFloat(a.x,a.y-30,'Lv.'+WL,'#ffe27a');}});
    save();refreshUI();return;}
  if(d.vt){var v1=d.vt;S.vt=S.vt||{};S.vt[v1]=(S.vt[v1]||0)+1;var xo=XTOWERS.filter(function(o){return o.v===v1;})[0];celebrate(xo.x,H-40,S.vt[v1]===1?'🗼 '+(v1===2?'호수':'광산')+' 망루 완공!':'🗼 망루 Lv.'+S.vt[v1],true);save();refreshUI();return;}
  if(d.vfRepair){var vr=d.vfRepair;VFHP[vr]=fMaxV(vr);VFBREACH[vr]=0;celebrate(vr===2?240:420,H-30,(vr===2?'호수':'광산')+' 성벽을 다시 막았어요!',true);save();refreshUI();return;}
  if(d.vf){var v2=d.vf;S.vf=S.vf||{};S.vf[v2]=(S.vf[v2]||0)+1;if(isWinter()){VFHP[v2]=fMaxV(v2);VFBREACH[v2]=0;}celebrate(v2===2?240:420,H-30,S.vf[v2]===1?'🪵 울타리 완성!':(S.vf[v2]===3?'🏰 성벽으로 변신!':'성벽 Lv.'+S.vf[v2]),true);save();refreshUI();return;}
  if(d.repair){doRepair(d.e);save();refreshUI();return;}
  if(d.fix){if(d.fix==='fence'){S.fenceDown=0;FENCEHP=isWinter()?fenceMax():0;celebrate(MX/2,H-30,'🪵 울타리 수리 완료!',true);}else{S.towerDown=0;TOWERHP=isWinter()?towerMax():0;celebrate(TOWER.x,TOWER.y,'🗼 망루 수리 완료!',true);}save();refreshUI();return;}
  if(d.id==='fence'){S.fence++;if(isWinter())FENCEHP=fenceMax();celebrate(MX/2,H-30,S.fence===1?'🪵 울타리 완성!':(S.fence===3?'🏰 성벽으로 변신!':(S.fence>3?'🏰 성벽 Lv.'+S.fence:'울타리 Lv.'+S.fence)),true);save();refreshUI();return;}
  if(d.weapon){var ok0=wkind();S.p.wpn=(S.p.wpn||0)+1;var nk0=wkind();celebrate(pl.x,pl.y,nk0!==ok0?'✨ '+WKN[nk0]+' 획득!':WKN[nk0]+' Lv.'+S.p.wpn,nk0!==ok0);save();refreshUI();return;}
  if(d.gear){
    var tr=d.id,old=ptier(tr);S.p[tr]=(S.p[tr]||0)+1;S[tr]=S.p[tr];
    burst(pl.x,pl.y-4,'#ffe27a',6,true);
    celebrate(pl.x,pl.y,(d.name?d.name():tr)+' Lv.'+S.p[tr],ptier(tr)>old);if(ptier(tr)>old)addFloat(pl.x,pl.y-52,'✨ 새 장비!','#ffe27a');
  }else if(d.site){
    var sid=d.site,first=!owned(sid),st=SITE[sid];S.sites[sid]=siteLv(sid)+1;
    if(first){res.forEach(function(q){if(q.s===sid)growRes(q);});addFloat(st.x+st.w/2,st.y+st.h/2,st.name+' 개척!','#c9f5c0');}
    else{var Ln=siteLv(sid);addFloat(st.x+st.w/2,st.y+st.h/2,(Ln===3||Ln===5)?'🌱 새 종류 등장!':'🌱 더 빨리 자라요!','#c9f5c0');}
    celebrate(st.x+st.w/2,st.y+st.h/2,first?st.name+' 개척!':st.name+' Lv.'+siteLv(sid),true);
  }else if(d.beltOf){
    var bs=d.beltOf,bp=pilePos(bs);S.cv[bs]=1;if(!S.beltLv)S.beltLv=1;celebrate(bp.x,bp.y,'벨트 설치!',false);
  }else if(d.role){
    var gnew={role:d.role,axe:0,rod:0,pick:0,boots:0,cour:0},lk=newLook(),WL0=(S.wlv&&S.wlv[d.role])||0;gnew[PRIM[d.role]]=WL0;gnew.boots=Math.min(MAXLV.boots,WL0);gnew.name=lk.name;gnew.hair=lk.hair;gnew.skin=lk.skin;gnew.acc=lk.acc;S.w.push(gnew);agents.push(mkAgent(d.role,gnew));
    if(isHunter(d.role)){var ha=agents[agents.length-1];var dr0=hunterDoor(d.role);ha.x=dr0.x;ha.y=dr0.y;ha.slot=count(d.role)-1;}
    addFloat(HOME.x,HOME.y-30,gnew.name+' 합류!','#c9f5c0');
  }else if(d.id==='lodge'){S.lodge=1;var lp=LODGEP();addFloat(lp.x+lp.w/2,lp.y+10,'일꾼 숙소 완공!','#c9f5c0');burst(lp.x+lp.w/2,lp.y+24,'#ffe27a',16,true);
  }else if(d.trunkUp){S.trunk++;celebrate(agents[0].x,agents[0].y,'벨트 모터 Lv.'+S.trunk,false);LINES.forEach(function(l){burst(LANE[l],dropPt(l).y,'#ffe27a',8,true);});}
  else if(d.wh){S.whLv++;truckT=Math.min(truckT,6);celebrate(WH.door,WH.wall,S.whLv===1?'창고 완공!':'창고 Lv.'+S.whLv,true);addFloat(WH.door,WH.top,S.whLv===1?'창고 완공!':'창고 확장!','#ffe27a');burst(WH.door,WH.wall,'#ffe27a',16,true);flash=.4;}
  else if(d.shopStaff){var line=d.shopStaff;if(!S.shopStaff||typeof S.shopStaff!=='object'||Array.isArray(S.shopStaff))S.shopStaff={};S.shopStaff[line]=Math.min(6,shopStaffLevel(line)+1);var st=STALL[line];STALLFX[line]=1.8;celebrate(st.x,st.y-35,shopStaffLevel(line)%2?'점원이 합류했어요!':'진열대가 늘었어요!');}
  else if(d.shop){S.shop[d.shop]++;var s=STALL[d.shop];STALLFX[d.shop]=1.8;flash=.45;sfx('cash');
    var cc=['#e2463c','#f0bb3f','#3f7fb8','#4fb36a','#b85ac8','#ffffff'];for(var cf=0;cf<46;cf++){var an=-Math.PI/2+(Math.random()-.5)*2.4,sp2=60+Math.random()*90;parts.push({x:s.x,y:s.y-20,vx:Math.cos(an)*sp2,vy:Math.sin(an)*sp2,g:140,life:1.5,max:1.5,col:cc[cf%6],r:1.6,leaf:true});}
    burst(s.x,s.y-20,'#ffe27a',18,true);var stg=shopStage(S.shop[d.shop]),newStg=stg>shopStage(S.shop[d.shop]-1);addFloat(s.x,s.y-86,newStg?'🏠 '+SHOP_STAGE[stg]+'(으)로 변신!':SHOPDEF[d.shop].name+' 확장!','#ffe27a');if(newStg){flash=.6;burst(s.x,s.y-40,'#ffffff',24,true);}}
  else{S[d.id]++;var bp2=PLOTS.filter(function(p){return p.def===d.id;})[0];if(bp2){celebrate(bp2.x+bp2.w/2,bp2.y+bp2.h/2,S[d.id]===1?bp2.name+' 완공!':(S[d.id]===6&&PROC[d.id]?'✨ 첨단 '+bp2.name+' 완성!':bp2.name+' Lv.'+S[d.id]),true);if(S[d.id]===6&&PROC[d.id])flash=.6;}else{var pp3=agents[0];celebrate(pp3.x,pp3.y,(d.name?d.name():d.id)+' Lv.'+S[d.id],false);}}
  save();refreshUI();
}

/* stall stock strip: one chip per species, piles shown as small ⛏ count */
var invEl=document.getElementById('inv'),invKey='',invChips={};
function knownItems(){
  var l=[];
  TREES.forEach(function(s,i){if(speciesAvail('forest',i)||ss('wood',s.id)>0||pileTotal(s.id)>0||whN(s.id)>0)l.push(s.id);});
  FISH.forEach(function(s,i){if(speciesAvail('pond',i)||ss('fish',s.id)>0||pileTotal(s.id)>0||whN(s.id)>0)l.push(s.id);});
  GOODS.forEach(function(g){if(recipeOk(g)||whN(g.id)>0)l.push(g.id);});
  BEAR_ITEMS.forEach(function(b){if((S.bears||0)>0||ss(b.line,b.id)>0||whN(b.id)>0)l.push(b.id);});
  return l;
}
function refreshInv(){
  var l=knownItems(),key=l.join(',');
  if(key!==invKey){
    invKey=key;invEl.innerHTML='';invChips={};var last=null;
    l.forEach(function(id){
      var cat=ITEMS[id].cat;
      if(last&&cat!==last){var sp=document.createElement('span');sp.className='sep';invEl.appendChild(sp);}
      last=cat;
      var ch=document.createElement('span');ch.className='chip';ch.title=ITEMS[id].name;
      var icv=document.createElement('canvas');icv.width=44;icv.height=44;
      var g=icv.getContext('2d');g.setTransform(2,0,0,2,0,0);drawItem(g,id,11,11.5,1.2);
      var n=document.createElement('span');ch.appendChild(icv);ch.appendChild(n);invEl.appendChild(ch);invChips[id]={el:ch,n:n};
    });
  }
  l.forEach(function(id){
    var c=invChips[id],goods=ITEMS[id].cat==='goods',shop=goods?0:ss(ITEMS[id].line,id),pile=goods?0:pileTotal(id),w=whN(id);
    c.n.innerHTML=(goods?w:shop)+(pile?'<small>⛏'+pile+'</small>':'')+(!goods&&w?'<small>🏭'+w+'</small>':'');
    c.el.classList.toggle('zero',shop+pile+w===0);c.el.classList.toggle('hot',id===HOT.id);
  });
}
var elCoins=document.getElementById('coins'),m1=document.getElementById('m1'),m2=document.getElementById('m2'),hint=document.getElementById('hint');
function anyPileFull(){return SITES.some(function(st){return owned(st.id)&&pn(st.id)>=pcap()&&!cvLv(st.id);});}
var goalBtn=document.getElementById('goal'),goalBox=document.getElementById('goalList'),goalKey='';
goalBtn.addEventListener('click',function(){audioInit();sfx('tap');var r=goalBtn.getBoundingClientRect();goalBox.style.left=Math.max(6,Math.min(window.innerWidth-236,r.left))+'px';goalBox.style.top=(r.bottom+4)+'px';goalBox.hidden=!goalBox.hidden;goalBtn.setAttribute('aria-expanded',String(!goalBox.hidden));goalKey='';refreshGoal();});
document.addEventListener('pointerdown',function(e){if(!goalBox.hidden&&!goalBox.contains(e.target)&&!goalBtn.contains(e.target)&&e.target!==cv){goalBox.hidden=true;goalBtn.setAttribute('aria-expanded','false');}});
document.getElementById('goalOpen').addEventListener('click',function(e){e.stopPropagation();setP.hidden=true;gearBtn.setAttribute('aria-expanded','false');goalKey='';refreshGoal();if(goalList()){goalBox.style.left='12px';goalBox.style.top='110px';goalBox.hidden=false;}});
function goalVal(q){var cur=Math.min(q[1](),q[2]);return q[3]==='Lv'?'Lv'+cur+' / '+q[2]:(q[3]==='명'?cur+' / '+q[2]+'명':(goalDone(q)?'완료':'설치 필요'));}
/* v50: goal card sits at the top-left of the play area (director spec); hidden while the tutorial runs */
function refreshGoal(){var l=tutOn()?null:goalList();goalBtn.hidden=true;if(!l){goalBox.hidden=true;return;}
  var done=l.filter(goalDone).length,nx=l.filter(function(q){return !goalDone(q);})[0],key=S.stage+':'+l.map(goalVal).join('|')+':'+Math.floor(goalPct()*100);if(key===goalKey)return;goalKey=key;
  goalBtn.querySelector('.gt').innerHTML='';var t1=document.createElement('span');t1.textContent='🚧 '+(S.stage===1?'2단계 호수 마을':'3단계 광산 마을');var t2=document.createElement('b');t2.textContent=done+'/'+l.length+' '+(goalBox.hidden?'▼':'▲');
  goalBtn.querySelector('.gt').append(t1,t2);goalBtn.querySelector('.gb i').style.width=(100*done/l.length)+'%';
  goalBtn.querySelector('.gn').textContent=nx?'다음: '+nx[0]+' '+goalVal(nx):'울타리를 넓히는 중!';
  goalBox.innerHTML='';var hd=document.createElement('div');hd.innerHTML='<span>🚧 '+(S.stage===1?'2단계 호수 마을':'3단계 광산 마을')+' · '+Math.floor(goalPct()*100)+'% / 75%</span><span></span>';goalBox.append(hd);
  l.forEach(function(q){var d=document.createElement('div'),a=document.createElement('span'),b=document.createElement('span');if(goalDone(q))d.className='ok';a.textContent=(goalDone(q)?'✓ ':'')+q[0]+(q[4]&&!goalDone(q)?' (필수)':'');b.textContent=goalVal(q);d.append(a,b);goalBox.append(d);});}
/* which village the player is currently standing in (x position is a reasonable proxy - forest / lake / mine sit side by side) */
function curVillage(){var v=villageAt(agents[0].x);if(v===1)return 'f1';if(v===2)return owned('p1')?'p1':'f1';return owned('m1')?'m1':(owned('p1')?'p1':'f1');}
var VNAME={f1:'🌲 숲속마을',p1:'🌊 호수마을',m1:'⛏️ 광산마을'},VROLE={f1:'lumber',p1:'fisher',m1:'miner'};
document.getElementById('radarCanvas').addEventListener('pointerdown',function(e){if(TITLE||!storyBox.hidden)return;e.preventDefault();e.stopPropagation();cancelControl();S.auto=false;var c=e.currentTarget,r=c.getBoundingClientRect(),p={x:(e.clientX-r.left)/r.width*c.width,y:(e.clientY-r.top)/r.height*c.height};var x=(p.x-6)/(c.width-12)*(fenceX()+224)-112,y=(p.y-6)/(c.height-12)*(HT+160)-80;agents[0].chaseBear=null;setTap(Math.max(8,Math.min(fenceX()-8,x)),Math.max(8,Math.min(H-8,y)));CAMERA_HELD=false;});
function radarPoint(x,y,width,height){
  return {x:6+Math.max(0,Math.min(1,(x+112)/(fenceX()+224)))*(width-12),y:6+Math.max(0,Math.min(1,(y+80)/(HT+160)))*(height-12)};
}
function refreshRaidRadar(lb){
  var box=document.getElementById('raidRadar');box.hidden=TITLE;document.documentElement.classList.toggle('raid-visible',!box.hidden);if(box.hidden)return;
  var c=document.getElementById('radarCanvas'),g=c.getContext('2d'),w=c.width,h=c.height,a=agents[0];g.clearRect(0,0,w,h);g.fillStyle='#e0e7da';g.fillRect(0,0,w,h);
  var start=radarPoint(0,0,w,h),end=radarPoint(fenceX(),H,w,h);g.fillStyle='#f3eddb';g.fillRect(start.x,start.y,end.x-start.x,end.y-start.y);g.strokeStyle='#96886c';g.lineWidth=2;g.beginPath();g.moveTo(start.x,start.y);g.lineTo(start.x,end.y);g.lineTo(end.x,end.y);g.lineTo(end.x,start.y);g.stroke();
  SITES.forEach(function(s){if(!owned(s.id))return;var p=radarPoint(s.x,s.y,w,h),q=radarPoint(s.x+s.w,s.y+s.h,w,h);g.fillStyle=s.kind==='pond'?'#88b3bd':s.kind==='forest'?'#7e9b74':'#aaa18b';g.fillRect(p.x,p.y,q.x-p.x,q.y-p.y);});
  var hero=radarPoint(a.x,a.y,w,h);g.fillStyle='#315e56';g.beginPath();g.arc(hero.x,hero.y,3.4,0,7);g.fill();
  lb.forEach(function(b){var p=radarPoint(b.x,b.y,w,h);g.fillStyle=b.king?'#663149':'#b54e3d';g.beginPath();g.arc(p.x,p.y,b.boss||b.king?4.2:3.2,0,7);g.fill();g.strokeStyle='#fff0d3';g.lineWidth=1;g.stroke();});
  g.fillStyle='#787b68';g.font='10px sans-serif';g.textAlign='center';g.fillText('↑ 북쪽',w/2,12);
  document.getElementById('radarLabel').textContent='마을 지도 · 곰 '+lb.length+'마리';box.setAttribute('aria-label','곰 '+lb.length+'마리 위치 지도 · 초록 점은 주인공');
}
function refreshBearChip(){var el=document.getElementById('bearChip');if(tutOn()||TITLE){el.hidden=true;refreshRaidRadar(liveBears());return;}el.hidden=false;var lb=liveBears(),s,t=function(x){return Math.floor(x/60)+':'+('0'+x%60).slice(-2);};
  if(isWinter()){s=Math.ceil(winterLeft());el.textContent=(lb.length?'🐻‍❄️ ':'🛡️ ')+t(s);el.className=lb.length?'raid':'calm';}
  else{s=Math.ceil(toWinter());el.textContent=(s<=30?'⚠️ ':'🐻‍❄️ ')+t(s);el.className=s<=30?'warn':'';}el.setAttribute('aria-label',(isWinter()?'습격 종료까지 ':'북극곰 습격까지 ')+t(s));refreshRaidRadar(lb);}
/* v74 (staff 2): species book. S.dex[id]=1 once an item has ever been obtained (stall, loading deck, storage, materials, a carried stack or a belt).
   older saves are filled in once from what they hold and what their sites already grow, so nothing is announced on load */
var DEXCAT=[['🌲 나무',TREES.map(function(s){return s.id;})],['🐟 물고기',FISH.map(function(s){return s.id;})],['⛏️ 광석',ORES.map(function(s){return s.id;})],
  ['🏭 가공품',GOODS.map(function(g){return g.id;})],['🐻‍❄️ 곰 전리품',BEAR_ITEMS.map(function(b){return b.id;})]];
var DEXALL=[];DEXCAT.forEach(function(c){DEXALL=DEXALL.concat(c[1]);});
var dexBox=document.getElementById('dexBox'),dexBtn=document.getElementById('dexOpen'),DEXREADY=false,dexKey='',dexNewQ=[];
function dexN(){var n=0;DEXALL.forEach(function(id){if(S.dex&&S.dex[id])n++;});return n;}
function dexHeld(){var h={};function add(o){if(o)for(var k in o)if((o[k]||0)>0)h[k]=1;}
  ['wood','fish','iron'].forEach(function(l){add(S.ss[l]);});for(var k in S.piles)add(S.piles[k]);add(S.wh);add(S.mat);
  agents.forEach(function(a){add(a.bag);});belt.forEach(function(b){h[b.id]=1;});return h;}
function dexInit(){if(S.dex)return;S.dex={};var h=dexHeld();for(var k in h)if(ITEMS[k])S.dex[k]=1;
  if(FRESH)return;
  TREES.forEach(function(s,i){if(!s.rare&&speciesAvail('forest',i))S.dex[s.id]=1;});FISH.forEach(function(s,i){if(!s.rare&&speciesAvail('pond',i))S.dex[s.id]=1;});
  if(owned('m1')){var L=siteLv('m1');SPAWN.ore.slice(0,spCount(L)).forEach(function(i){S.dex[ORES[i].id]=1;});}
  GOODS.forEach(function(g){if((S[LINEPROC[g.line]]||0)>=g.lv&&(g.line!=='elec'||S.smelt))S.dex[g.id]=1;});
  if((S.bears||0)>0){S.dex.meat=1;S.dex.hide=1;}}
function dexScan(){if(!DEXREADY)return;if(!S.dex)S.dex={};var h=dexHeld();
  for(var k in h){if(!ITEMS[k]||S.dex[k]||DEXALL.indexOf(k)<0)continue;S.dex[k]=1;dexNewQ.push(k);}
  if(dexNewQ.length&&!tutOn()){var id=dexNewQ.shift(),a=agents[0],rare=ITEMS[id].sp&&ITEMS[id].sp.rare;
    addFloat(a.x,a.y-50,'📖 도감 등록! '+ITEMS[id].name+' ('+dexN()+'/'+DEXALL.length+')',rare?'#ffe27a':'#c9f5c0');sfx('chime',.6);burst(a.x,a.y-30,'#ffe27a',rare?16:8,true);
    if(dexN()===DEXALL.length){celebrate(a.x,a.y,'📖 도감 완성!',true);}save();}
  else if(tutOn())dexNewQ=[];
  var lab='📖 '+dexN()+'/'+DEXALL.length;if(dexBtn.textContent!==lab)dexBtn.textContent=lab;
  if(!dexBox.hidden)renderDex();}
function dexIcon(id,got){var c=document.createElement('canvas');c.width=56;c.height=56;var g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);
  try{drawItem(g,id,14,15,1.25);}catch(e){}
  if(!got){g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-in';g.fillStyle='rgba(110,92,72,.55)';g.fillRect(0,0,56,56);g.globalCompositeOperation='source-over';}
  return c;}
function renderDex(){var key=DEXALL.map(function(id){return S.dex&&S.dex[id]?1:0;}).join('');if(key===dexKey)return;dexKey=key;
  var n=dexN(),tot=DEXALL.length;dexBox.innerHTML='';
  var hd=document.createElement('div');hd.className='dhd';var t=document.createElement('span');t.textContent='📖 품종 도감 ';var b=document.createElement('b');b.textContent=n+' / '+tot;t.appendChild(b);
  var x=document.createElement('button');x.id='dexClose';x.type='button';x.setAttribute('aria-label','도감 닫기');x.textContent='✕';x.addEventListener('click',function(e){e.stopPropagation();dexBox.hidden=true;sfx('tap');});
  hd.append(t,x);dexBox.appendChild(hd);
  var bar=document.createElement('div');bar.className='dbar';var bi=document.createElement('i');bi.style.width=(100*n/tot)+'%';bar.appendChild(bi);dexBox.appendChild(bar);
  DEXCAT.forEach(function(cat){var have=cat[1].filter(function(id){return S.dex&&S.dex[id];}).length;var sec=document.createElement('div');sec.className='dsec';sec.textContent=cat[0]+' '+have+'/'+cat[1].length;dexBox.appendChild(sec);
    var gr=document.createElement('div');gr.className='dgrid';
    cat[1].forEach(function(id){var got=!!(S.dex&&S.dex[id]),it=ITEMS[id],rare=!!(it.sp&&it.sp.rare),d=document.createElement('div');d.className='dc'+(got?'':' no')+(rare?' rare':'');
      d.appendChild(dexIcon(id,got));var nm=document.createElement('span');nm.textContent=got?it.name:'???';d.appendChild(nm);
      if(rare){var sm=document.createElement('small');sm.textContent='✨ 희귀';d.appendChild(sm);}gr.appendChild(d);});
    dexBox.appendChild(gr);});}
dexBtn.addEventListener('click',function(e){e.stopPropagation();setP.hidden=true;gearBtn.setAttribute('aria-expanded','false');goalBox.hidden=true;dayBox.hidden=true;dexKey='';renderDex();dexBox.hidden=false;sfx('tap');});
/* v75 (staff 2 + 6): today's goals. Every calendar day the village gets three small goals picked from what this save can already do
   (gather, serve customers, buy upgrades, load trucks, drive off bears). Progress = running totals (S.stat) minus the totals when the day began.
   No coin reward yet - the reward size waits for the director's decision; finishing all three keeps a streak (⭐ days in a row). New save field S.daily only. */
var DAYK={gather:['🪓 자원 모으기','개'],serve:['🧑‍🤝‍🧑 손님에게 팔기','명'],buy:['🏗️ 시설·일꾼 강화','번'],truck:['🚚 트럭에 싣기','대'],bear:['🐻‍❄️ 곰 물리치기','마리']};
var dayBox=document.getElementById('dayBox'),dayBtn=document.getElementById('dayOpen'),dayKey='';
function dayStr(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function dayPool(){var st=Math.max(1,S.stage||1),p=[['gather',[150,500,2000][st-1]],['serve',[30,100,400][st-1]],['buy',[4,6,8][st-1]]];
  if(PROCS.some(function(b){return S[b]&&S.pst&&S.pst[b];}))p.push(['truck',[4,15,40][st-1]]);
  if(huntReady()&&(S.tower||0)>0)p.push(['bear',[3,8,20][st-1]]);return p;}
function dayNew(ds){var p=dayPool(),h=0;for(var i=0;i<ds.length;i++)h=(h*31+ds.charCodeAt(i))|0;var r=mulberry(h);
  for(var j=p.length-1;j>0;j--){var x=Math.floor(r()*(j+1)),t=p[j];p[j]=p[x];p[x]=t;}
  var prev=S.daily,streak=prev&&prev.all&&prev.d===dayPrev(ds)?(prev.streak||0):0;
  S.daily={d:ds,g:p.slice(0,3).map(function(o){return {k:o[0],need:o[1],base:(S.stat&&S.stat[o[0]])||0,ok:0};}),all:0,streak:streak};dayKey='';save();}
function dayPrev(ds){var d=new Date(ds+'T12:00:00');d.setDate(d.getDate()-1);return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function dayVal(q){return Math.max(0,((S.stat&&S.stat[q.k])||0)-q.base);}
function dayDoneN(){return S.daily?S.daily.g.filter(function(q){return q.ok;}).length:0;}
function dayTick(){if(tutOn()||TITLE){return;}var ds=dayStr();if(!S.daily||S.daily.d!==ds){var first=!S.daily;dayNew(ds);var a0=agents[0];addFloat(a0.x,a0.y-58,first?'🎯 오늘의 목표 3개가 생겼어요 · ⚙️ 설정에서 봐요':'🎯 새로운 오늘의 목표!','#ffe27a');sfx('chime',.6);}
  var D=S.daily,a=agents[0];D.g.forEach(function(q){if(!q.ok&&dayVal(q)>=q.need){q.ok=1;addFloat(a.x,a.y-58,'🎯 목표 달성! '+DAYK[q.k][0]+' ('+dayDoneN()+'/3)','#c9f5c0');burst(a.x,a.y-30,'#8be99b',12,true);sfx('chime',.4);save();}});
  if(!D.all&&dayDoneN()===3){D.all=1;D.streak=(D.streak||0)+1;celebrate(a.x,a.y,'🎯 오늘의 목표 모두 달성! ⭐'+D.streak+'일 연속',true);save();}
  var lab='🎯 '+dayDoneN()+'/3';if(dayBtn.textContent!==lab)dayBtn.textContent=lab;dayBtn.classList.toggle('done',!!D.all);
  if(!dayBox.hidden)renderDay();}
function renderDay(){var D=S.daily;if(!D){dayBox.innerHTML='<div class="dyh"><span>🎯 오늘의 목표</span></div><div class="dyf">튜토리얼을 마치면 매일 목표 3개가 생겨요</div>';return;}
  var key=D.d+D.g.map(function(q){return Math.min(dayVal(q),q.need);}).join(',')+D.all;if(key===dayKey)return;dayKey=key;dayBox.innerHTML='';
  var hd=document.createElement('div');hd.className='dyh';var t=document.createElement('span');t.textContent='🎯 오늘의 목표 '+dayDoneN()+'/3';
  var x=document.createElement('button');x.id='dayClose';x.type='button';x.setAttribute('aria-label','오늘의 목표 닫기');x.textContent='✕';x.addEventListener('click',function(e){e.stopPropagation();dayBox.hidden=true;sfx('tap');});hd.append(t,x);dayBox.appendChild(hd);
  D.g.forEach(function(q){var v=Math.min(dayVal(q),q.need),r=document.createElement('div');r.className='dyr'+(q.ok?' ok':'');var dt=document.createElement('div');dt.className='dt';var a=document.createElement('span'),b=document.createElement('span');
    a.textContent=(q.ok?'✓ ':'')+DAYK[q.k][0];b.textContent=q.ok?'완료':fmt(v)+' / '+fmt(q.need)+DAYK[q.k][1];dt.append(a,b);var bar=document.createElement('div');bar.className='dyb';var bi=document.createElement('i');bi.style.width=(100*v/q.need)+'%';bar.appendChild(bi);r.append(dt,bar);dayBox.appendChild(r);});
  var f=document.createElement('div');f.className='dyf';f.textContent=(D.all?'오늘 목표를 모두 끝냈어요! ':'자정이 지나면 새 목표로 바뀌어요 · ')+'⭐ 연속 '+(D.streak||0)+'일';dayBox.appendChild(f);}
dayBtn.addEventListener('click',function(e){e.stopPropagation();setP.hidden=true;gearBtn.setAttribute('aria-expanded','false');goalBox.hidden=true;dexBox.hidden=true;dayKey='';renderDay();dayBox.hidden=false;sfx('tap');});
function refreshUI(){
  safe('day',dayTick);
  safe('dex',dexScan);
  safe('staff',refreshStaffBoard);
  /* v67: coins shrink to fit their own column (left third of the header), so they never run into the bear timer in the middle */
  elCoins.textContent=moneyShort(S.coins);elCoins.title=fmt(S.coins)+'원';var cl=elCoins.textContent.length;elCoins.style.fontSize=(cl<=5?24:cl<=7?20:cl<=9?16:cl<=11?13:11)+'px';refreshGoal();refreshBearChip();
  var vid=curVillage();
  m1.textContent='';m1.parentElement.style.visibility='hidden';
  m2.textContent='';
  var tabHas={};
  allDefs.forEach(function(d){
    var u=btns[d.id],hid=d.hidden?d.hidden():false;u.b.hidden=hid;if(hid)return;
    var mx=d.isMax(),c=d.cost(),can=!mx&&d.canBuy();
    if(can)tabHas[d.tab]=1;
    var lv=d.lv();
    u.nm.innerHTML=d.name()+(lv?'<small>'+lv+(mx?' · 최대':'')+'</small>':'');
    u.ds.textContent=mx?'최고 단계예요':d.desc();
    u.cs.textContent=mx?'완료':fmt(c);
    u.b.classList.toggle('max',mx);u.b.classList.toggle('off',!mx&&!can);u.b.disabled=mx;
    var key=d.id+(d.gear?ptier(d.id):'');
    if(u.key!==key){u.key=key;drawIcon(d,u.ic);}
  });
  if(renderWorkers())tabHas.crew=1;
  syncPlayerGear();
  TABS.forEach(function(t){var vis=t.items.some(function(d){return !(d.hidden&&d.hidden());});tabBtns[t.id].hidden=!vis;if(!vis&&activeTab===t.id){activeTab=null;applyTab();}tabBtns[t.id].classList.toggle('has',!!tabHas[t.id]&&activeTab!==t.id);});
  refreshInv();
  modeBtn.textContent=S.auto?'🤖 자동':'🕹️ 수동 조작';
  modeBtn.classList.toggle('auto',S.auto);modeBtn.setAttribute('aria-pressed',S.auto?'true':'false');
  zoomBtn.textContent=S.zoomOut?'\ud83d\udd0d \ud655\ub300 \ubcf4\uae30':'\ud83d\uddfa\ufe0f \uc804\uccb4\ubcf4\uae30';
  var h='';
  h=tutHint();
  if(h){}
  else if(defenseDue())h='⚠️ 곰이 와요! '+(!S.tower?'🗼 망루':'🪵 울타리')+'를 지어요';
  else if(liveBears().length&&time<bearHintT)h='🐻‍❄️ 곰이 돈을 노려요! 잡으면 되찾아요';
  else if(liveBears().length)h='';
  else if(S.fenceDown||S.towerDown)h='🔧 부서진 '+(S.fenceDown?'울타리':'망루')+'를 수리해요';
  else if((S.rep||[]).length)h='곰에게 부서진 곳은 🔧 수리 버튼으로 싸게 되살릴 수 있어요';
  else if(huntReady()&&!S.tower)h='성벽 가운데 망루를 지으면 사냥꾼이 곰을 막아줘요 · 사냥꾼을 강화하면 임꺽정의 권법·발차기도 세져요';
  else if(LOOT.length)h='곰고기는 생선 가게, 곰 가죽은 나무 가게에 납품하면 비싸게 팔려요';
  else if(['mill','smoke'].some(function(b){return S[b]&&!S.pst[b]&&storeN(b)>=storeCap(b);}))h='가공품이 쌓였어요! 작업장 옆 [창고 짓기] 발판으로 가요';
  else if(!h&&anyPileFull())h='적재칸이 가득! 시설 옆 [벨트] 발판으로 가요';

  hint.textContent=h;hint.classList.toggle('hide',!h);
  hint.style.top='46px';
}
var stageEl=document.getElementById('stage'),cwrap=document.getElementById('cwrap');
function fit(){
  var r=stageEl.getBoundingClientRect(),aw=r.width,ah=r.height;
  if(aw<=0||ah<=0)return;
  // Match the displayed canvas exactly: portrait and landscape use the same coordinate scale.
  var nsh=W*ah/aw;
  if(Math.abs(nsh-SH)>.01||Math.abs(screenUnit-W/aw)>.001){
    cancelControl();SH=nsh;screenUnit=W/aw;
    cv.height=Math.ceil(SH*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  cwrap.style.width=aw+'px';
  ZOOM_IN=2.6*(W/540)*Math.min(1,Math.max(.52,ah/aw/1.5));
  Z=zoomTarget();
  var pa=agents[0];if(pa){camX=camClampX(pa.x-W/Z/2);camY=camClampY(pa.y-SH/Z*.5);}
  titleT=0;
}
var fitFrame=0;
function scheduleFit(){if(!fitFrame)fitFrame=requestAnimationFrame(function(){fitFrame=0;fit();});}
if(window.ResizeObserver)new ResizeObserver(scheduleFit).observe(stageEl);
window.addEventListener('resize',scheduleFit);
if(window.visualViewport)window.visualViewport.addEventListener('resize',scheduleFit);

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
  camera:function(){return {z:Z,x:camX,y:camY,target:zoomTarget(),pinching:!!PINCH,touches:Object.keys(TOUCHES).length,held:CAMERA_HELD,joy:joy.on,range:zoomRange()};},hunterStep:stepHunter,arrows:function(){return ARROWS;},guardBear:blockBearAtFence,
  cornerUpgrade:upgradeOpenVillages,resourceSites:function(){return SITES;},resources:function(){return res;},perimeterSlot:nearbyFenceSlot,customers:function(){return customers;},shopCash:cashPos,padReady:function(id){PADLIST=buildPads();var p=PADLIST.filter(function(p){return p.id===id;})[0];return p?padReady(p):null;},labels:function(){return PLOTS.map(function(p){return {def:p.def,building:{x:p.x,y:p.y,w:p.w,h:p.h},sign:facilityLabelSlot(p)};});},radarPoint:radarPoint,
  actorArt:function(role,L){var c=document.createElement('canvas');c.width=240;c.height=role==='hunter2'&&L>=12?300:240;var g=c.getContext('2d');g.scale(3,3);var oldCtx=ctx;ctx=g;try{var a={x:40,y:role==='hunter2'&&L>=12?82:60,role:role,dir:1,bob:0,sc:1,mv:false,gear:{name:'',skin:0,hair:0,boots:0,axe:0,rod:0,pick:0,bow:0},bag:{},path:[]};if(role==='player'){var old=S.wlv;S.wlv={hunter:L-1};try{drawHero(g,a,0);}finally{S.wlv=old;}}else{a.gear[PRIM[role]]=L;if(L>=12)a.gear.super=1;drawAgent(a);}return c.toDataURL();}finally{ctx=oldCtx;}},
  facilityArt:function(kind,L){var c=document.createElement('canvas');c.width=240;c.height=300;var g=c.getContext('2d');g.scale(2,2);if(kind==='tower')drawWatchtower(g,46,112,30,92,L,false,0,0,0);else drawMarketShop(g,kind==='woodshop'?'wood':'fish',L);return c.toDataURL();},
  storageArt:function(L){var c=document.createElement('canvas');c.width=92;c.height=288;var g=c.getContext('2d');g.scale(2,2);drawWorkshopStorage(g,{x:0,y:0,w:136,shedLeft:1},L);return c.toDataURL();},
  workshopArt:function(b,L,SL){var pl=plotOf(b),old=S[b],previous=S.pst[b],c=document.createElement('canvas');c.width=pl.w*2;c.height=pl.h*2;var g=c.getContext('2d');g.scale(2,2);g.translate(-pl.x,-pl.y);try{S[b]=L;S.pst[b]=SL;drawWorkshop(g,pl);return c.toDataURL();}finally{S[b]=old;S.pst[b]=previous;}},
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
})();

//# sourceMappingURL=runtime.js.map
