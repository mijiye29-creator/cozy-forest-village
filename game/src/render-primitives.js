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

