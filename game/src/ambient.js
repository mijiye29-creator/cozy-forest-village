/* ---------- ambient: day cycle, drifting leaves, fireflies, soft vignette ---------- */
var DAY=300;
function dayL(){return .5+.5*Math.cos(time/DAY*6.2832);}
function nightAmt(){return 0;}
/* raid cycle (names kept for save compatibility: S.season/S.winters): each chapter has a calm preparation window before bear raids */
var SEASON_LEN=185,WINTER_LEN=75;
/* Shorter preparation and longer raids increase pressure as new villages open. */
function seasonLen(){var st=S.stage||1;return st>=3?135:(st>=2?165:SEASON_LEN);}
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

