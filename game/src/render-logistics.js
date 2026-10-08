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
  if(!drawFacilitySprite(g,'warehouse',x0+w/2,H,w+6,H-WH.top,S.whLv,5,0)){
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
  }
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
  if(!spriteVisible(t.x,t.y,90))return;
  if(drawSprite(ctx,'truck',t.state==='load'?'idle':'drive',time,t.x,t.y+10,SPRITE_PPU*1.7,true)){var countLoaded=0,totalOrder=0;t.order.forEach(function(o){countLoaded+=o.got;totalOrder+=o.qty;});ctx.save();ctx.font='600 6px sans-serif';ctx.textAlign='center';ctx.fillStyle='#214b56';ctx.fillText(countLoaded+' / '+totalOrder,t.x,t.y-29);t.order.slice(0,3).forEach(function(o,i){if(o.got)drawItem(ctx,o.id,t.x-10+i*10,t.y-13,.4);});ctx.restore();return;}
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
