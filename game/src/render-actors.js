/* forestry harvester: wheeled cab with a crane arm and a saw head (red laser rig at Lv6+) */
function drawVehicleUpgrade(g,a,L,role){
  var tint=role==='lumber'?'#698363':role==='fisher'?'#608997':'#b09b61',x=a.x,y=a.y;
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
  var coat=(master?['#92714e','#92714e','#92714e','#92714e','#92714e']:['#4e6e7c','#426b78','#365e6d','#2b505e','#233e4d'])[T],scarf=master?'#baa379':'#a54737';
  if(!master){coat=['#5b7a7e','#647653','#967454','#697d84','#8b805c','#405b68','#41685b','#607282','#354f62','#526358','#385674','#795c49','#2e455b'][Math.min(12,HL-1)];scarf=['#9f5541','#b08555','#7b654c','#b89461','#b4a07a','#ad6a48','#9f7952','#a49d79','#c3a970','#a97e51','#c3b78c','#ccb481','#e2c994'][Math.min(12,HL-1)];}
  g.save();g.translate(a.x,a.y);g.scale(d,1);
  var wool=g.createLinearGradient(-7,-20,7,-3);wool.addColorStop(0,(master?['#b99d72','#b99d72','#b99d72','#b99d72','#b99d72']:['#8195a0','#738f9c','#65828c','#5e7b86','#536c7a'])[T]);wool.addColorStop(.45,coat);wool.addColorStop(1,master?'#54412e':'#253d37');coat=wool;
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
