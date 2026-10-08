/* ---- everything that never moves is painted once into an offscreen canvas ---- */
var BG=document.createElement('canvas');BG.width=Math.ceil(W*RS);BG.height=Math.ceil((HT-WORLD_TOP)*RS);
function paintStatic(){
  var g=BG.getContext('2d');g.setTransform(RS,0,0,RS,0,0);
  var land=g.createLinearGradient(0,0,W,HT);land.addColorStop(0,'#e4e9d9');land.addColorStop(.45,'#e8eadb');land.addColorStop(1,'#d7e0cd');g.fillStyle=land;g.fillRect(0,0,W,HT);
  g.fillStyle='#eee9dc';g.fillRect(0,0,W,178);
  /* Paths follow the actual gaps; planting stays out of working and upgrade areas. */
  g.fillStyle='#e3dcc9';rr(g,12,366,W-24,57,16);g.fill();
  [150,570,1038].forEach(function(x){g.fillStyle='#ece6d4';rr(g,x-19,126,38,452,14);g.fill();
    for(var sy=157;sy<568;sy+=24){g.fillStyle='rgba(255,253,243,.52)';g.beginPath();g.ellipse(x+(sy%48?3:-3),sy,10,5,0,0,7);g.fill();}});
  g.fillStyle='#e7e3d0';rr(g,116,235,125,25,9);g.fill();
  g.fillStyle='#dce3d6';g.fillRect(0,431,W,H-431);
  [326,680,1008].forEach(function(x){
    var py=x===1008?240:x===680?132:220,ph=x===326?102:78;g.fillStyle='#adb6a0';rr(g,x-9,py,18,ph,8);g.fill();g.fillStyle='#e5e4d3';rr(g,x-8,py-1,16,ph-3,7);g.fill();
    for(var j=0;j<(x===326?8:6);j++){var yy=py+10+j*11;g.fillStyle=j%2?'#819579':'#9cac8c';g.beginPath();g.ellipse(x+(j%2?2:-2),yy,5,3,0,0,7);g.fill();g.fillStyle=j%3?'#e7dcc1':'#c7b692';g.beginPath();g.arc(x-2,yy-1,1.1,0,7);g.fill();}
  });
  /* Northern snow gardens frame the mining district without narrowing its entrance. */
  [[708,56,31],[788,75,25],[914,35,30],[996,58,24]].forEach(function(o){
    var x=o[0],y=o[1],r=o[2];g.fillStyle='rgba(93,123,106,.12)';g.beginPath();g.ellipse(x+3,y+4,r,r*.46,0,0,7);g.fill();
    var mound=g.createLinearGradient(x-r,y-r,x+r,y+r);mound.addColorStop(0,'#f8faf0');mound.addColorStop(1,'#c6d3c5');g.fillStyle=mound;g.beginPath();g.ellipse(x,y,r,r*.46,0,0,7);g.fill();
    [-8,9].forEach(function(off,i){var xx=x+off,yy=y+i*3;g.fillStyle='#8a7e60';g.fillRect(xx-1,yy-6,2,8);g.fillStyle=i?'#637e6f':'#557263';g.beginPath();g.moveTo(xx-7,yy-4);g.lineTo(xx,yy-24-i*4);g.lineTo(xx+7,yy-4);g.closePath();g.fill();g.fillStyle='#eef3e8';g.beginPath();g.moveTo(xx-4,yy-12);g.lineTo(xx,yy-24-i*4);g.lineTo(xx+4,yy-12);g.closePath();g.fill();});
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
      var lg=g.createRadialGradient(x-1.3,ly-1.3,.4,x,ly,4.6);lg.addColorStop(0,'#ffd291');lg.addColorStop(.55,'#d98a3a');lg.addColorStop(1,'#a4601f');
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
