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
