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

