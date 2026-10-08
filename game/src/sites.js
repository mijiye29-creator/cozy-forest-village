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

