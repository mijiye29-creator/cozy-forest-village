/* forestry harvester: wheeled cab with a crane arm and a saw head (red laser rig at Lv6+) */
function drawVehicleUpgrade(g,a,L,role){
  var model={lumber:'harvester',fisher:'fish_rig',miner:'excavator'}[role];if(model&&spriteReady(model))return;
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
function drawHarvester(a){if(drawSprite(ctx,'harvester',a.working?'work':a.mv?'drive':'idle',time,a.x,a.y+7,SPRITE_PPU*(.84+.025*(a.gear.axe||4)),a.dir>0)){drawSpriteLevel(ctx,a.x,a.y-34,a.gear.axe,12);return;}var g=ctx,L=a.gear.axe||0,big=L>=6,on=a.working,d=a.dir||1,by=a.mv?Math.sin(a.bob*2)*.6:0,bc=big?'#c8453d':'#4f9a6a';
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
function drawFishRig(a){if(drawSprite(ctx,'fish_rig',a.working?'work':a.mv?'drive':'idle',time,a.x,a.y+7,SPRITE_PPU*(.84+.025*(a.gear.rod||4)),a.dir>0)){drawSpriteLevel(ctx,a.x,a.y-34,a.gear.rod,12);return;}var g=ctx,L=a.gear.rod||0,big=L>=6,on=a.working,by=a.mv?Math.sin(a.bob*2)*.6:0,bc=big?'#2c3e9e':'#3f7fb8';
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
function drawExcavator(a){if(drawSprite(ctx,'excavator',a.working?'work':a.mv?'drive':'idle',time,a.x,a.y+7,SPRITE_PPU*(.84+.025*(a.gear.pick||4)),a.dir>0)){drawSpriteLevel(ctx,a.x,a.y-34,a.gear.pick,12);return;}var g=ctx,L=a.gear.pick||0,big=L>=6,on=a.working,d=a.dir||1,by=a.mv?Math.sin(a.bob*2)*.6:0;
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
function superWorkPose(a){
  var t=a.net?a.net.t:0,active=a.working,p=a.net?(t<.2?t/.2:t<.6?(t-.2)/.4:t<.85?1:Math.max(0,1-(t-.85)/.75)):0;
  return {lean:active?(a.net?(t<.2?.14*(t/.2):t<.85?-.23*p:.16*(1-p)):Math.sin((a.swT||0)/SUPER_T*Math.PI)*.14):0,crouch:active?(a.net?t>=.85?.7*(1-p):.25*p:.2):0,reach:active?p:0,lift:active&&a.net&&t<.2?t/.2:0,phase:t};
}
function superHands(a){var p=superWorkPose(a),dx=a.dir*(12+p.reach*10),dy=(-25-p.lift*12)*(1-p.crouch*.12);return {x:a.x+dx*Math.cos(p.lean)-dy*Math.sin(p.lean),y:a.y+9+dx*Math.sin(p.lean)+dy*Math.cos(p.lean)};}
function superNetBounds(a,N){var st=SITE.p1,h=superHands(a),t=N.t,out=t<.2?0:t<.6?(t-.2)/.4:t<.85?1:Math.max(0,1-(t-.85)/.75),e=out*out*(3-2*out),w=8+(st.w-18)*e,height=8+(st.h-18)*e,lift=N.lifted?Math.sin(Math.min(1,(t-.85)/.75)*Math.PI)*16:0;return {x:h.x+((st.x+st.w/2)-h.x)*e-w/2,y:h.y+((st.y+st.h/2)-h.y)*e-height/2-lift,w:w,h:height,hand:h,spread:e,lift:lift};}
function superNetFish(box,fish){return {x:box.hand.x+(fish.x-box.hand.x)*box.spread,y:box.hand.y+(fish.y-box.hand.y)*box.spread-box.lift};}
function drawMasterFisher(g,a){
  var p=superWorkPose(a);g.fillStyle='rgba(67,111,125,.2)';g.beginPath();g.ellipse(a.x,a.y+9,14,4,0,0,7);g.fill();
  g.save();g.translate(a.x,a.y+9);g.rotate(p.lean);g.scale(1.3,1.3*(1-p.crouch*.12));g.translate(-a.x,-a.y-9);
  curWalk=!!a.working||a.mv;curPh=a.net?Math.min(1,a.net.t/1.6)*Math.PI*2:a.bob;if(!drawSprite(g,'master_fisher_body',a.working?'work':'idle',a.net?a.net.t:(a.swT||0),a.x,a.y+9,SPRITE_PPU,a.dir>0))drawPerson(g,a.x,a.y,'fisher',a.dir,0,4,4,4,Object.assign({},a.gear,{customArms:true}));curWalk=null;
  g.lineCap='round';g.lineJoin='round';var handX=a.x+a.dir*(12+p.reach*10)/1.3,handY=a.y+9+(-25-p.lift*12)/1.3;
  [-1,1].forEach(function(side){g.strokeStyle=side<0?'#335e78':'#5e96a9';g.lineWidth=4;g.beginPath();g.moveTo(a.x+side*5,a.y-17);g.lineTo(a.x+a.dir*(5+p.reach*5),a.y-8-p.lift*6+side*2);g.lineTo(handX,handY+side*2);g.stroke();g.fillStyle='#eac6a4';g.beginPath();g.arc(handX,handY+side*2,2,0,7);g.fill();});
  g.strokeStyle='#f4e5b4';g.lineWidth=1.4;g.beginPath();g.arc(handX,handY,4,0,7);g.stroke();g.restore();superPlate(g,a,true);
}
function drawMasterLumber(g,a){
  var pose={x:a.x,y:a.y,role:'lumber',appearanceTier:4,dir:-1,customArms:true,mv:false,bob:a.bob};
  g.fillStyle='rgba(193,172,119,.22)';g.beginPath();g.ellipse(a.x,a.y+9,13,4,0,0,7);g.fill();
  var motion=a.working?Math.sin(Math.min(1,(a.swT||0)/SUPER_T)*Math.PI):0;g.save();g.translate(a.x,a.y+9);g.rotate(-motion*.16);g.scale(1,1-motion*.08);g.translate(-a.x,-a.y-9);pose.mv=!!a.working;pose.bob=(a.swT||0)/SUPER_T*Math.PI*2;if(!drawSprite(g,'master_lumber_body',a.working?'work':'idle',(a.swT||0)*.9/SUPER_T,a.x,a.y+9,SPRITE_PPU*1.3,false))drawHero(g,pose,motion*2);
  var phase=a.working?Math.min(1,(a.swT||0)/SUPER_T):0;
  var axeAngle=a.working?-.9+Math.sin(phase*Math.PI)*1.25:-.3,gripX=a.x-16-motion*4,gripY=a.y-12-motion*3;
  [-1,1].forEach(function(side){var gy=(side<0?2:6)*1.6,hx=gripX-Math.sin(axeAngle)*gy,hy=gripY+Math.cos(axeAngle)*gy;g.strokeStyle=side<0?'#715438':'#ab8b5e';g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(a.x+side*5,a.y-15);g.lineTo(a.x-9-motion*3,a.y-5+side*2);g.lineTo(hx,hy);g.stroke();g.fillStyle='#e8c19b';g.beginPath();g.arc(hx,hy,2.2,0,7);g.fill();});
  g.save();g.translate(gripX,gripY);g.scale(1.6,1.6);g.rotate(a.working?-.9+Math.sin(phase*Math.PI)*1.25:-.3);
  var wood=g.createLinearGradient(-1,0,2,0);wood.addColorStop(0,'#6e4b31');wood.addColorStop(.5,'#c69d6a');wood.addColorStop(1,'#80603f');g.fillStyle=wood;rr(g,-1.5,-15,3,26,1);g.fill();
  var steel=g.createLinearGradient(-10,-16,4,-6);steel.addColorStop(0,'#e1e8df');steel.addColorStop(.45,'#9baaa2');steel.addColorStop(1,'#52655d');g.fillStyle=steel;g.beginPath();g.moveTo(-1,-15);g.lineTo(-9,-18);g.quadraticCurveTo(-13,-12,-10,-6);g.lineTo(-1,-10);g.closePath();g.fill();g.strokeStyle='#e1e8df';g.lineWidth=1;g.beginPath();g.moveTo(-10,-17);g.quadraticCurveTo(-12,-12,-10,-7);g.stroke();g.restore();
  g.restore();superPlate(g,a,true);
}
function drawSuper(a){var g=ctx,role=a.role,lum=role==='lumber',hun=isHunter(role),k=a.working?Math.min(1,(a.swT||0)/SUPER_T):0,pu=(Math.sin(time*3)+1)/2,col=lum?'255,190,90':(hun?'255,120,90':(role==='miner'?'255,140,230':'120,220,255'));
  if(lum){drawMasterLumber(g,a);return;}if(role==='fisher'){drawMasterFisher(g,a);return;}
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
function superPlate(g,a,bar){var k=a.working?Math.min(1,a.net?a.net.t/1.6:(a.swT||0)/SUPER_T):0,plateY=a.y-(a.role==='hunter2'?76:a.role==='lumber'?68:50);
  /* Keep the captain's nameplate above his helmet rather than across his face. */
  var lab='👑 '+a.gear.name;g.font='900 7.5px sans-serif';g.textAlign='center';g.textBaseline='middle';var tw=g.measureText(lab).width+12;
  var sh=g.createLinearGradient(a.x-tw/2,0,a.x+tw/2,0),sx=(time*.5)%1;sh.addColorStop(0,'#c8901a');sh.addColorStop(Math.max(0,sx-.15),'#e8b23c');sh.addColorStop(sx,'#fff6c8');sh.addColorStop(Math.min(1,sx+.15),'#e8b23c');sh.addColorStop(1,'#c8901a');
  g.fillStyle='rgba(60,40,10,.35)';rr(g,a.x-tw/2+1,plateY+1,tw,12,6);g.fill();g.fillStyle=sh;rr(g,a.x-tw/2,plateY,tw,12,6);g.fill();g.fillStyle='#4a3000';g.fillText(lab,a.x,plateY+6.4);
  if(a.working&&bar){g.fillStyle='rgba(0,0,0,.35)';rr(g,a.x-16,a.y+18,32,4.5,2.2);g.fill();g.fillStyle='#ffe27a';rr(g,a.x-16,a.y+18,32*k,4.5,2.2);g.fill();}
  if(a.full){g.font='800 6px sans-serif';var tw2=g.measureText('적재칸 가득').width+6;g.fillStyle='rgba(226,86,106,.9)';rr(g,a.x-tw2/2,a.y-61,tw2,8,4);g.fill();g.fillStyle='#fff';g.fillText('적재칸 가득',a.x,a.y-56.8);}}
/* the swing / net sweep / volley that clears the whole site */
function drawSuperFx(){var g=ctx;for(var i=SUPERFX.length-1;i>=0;i--){var f=SUPERFX[i],dur=f.k==='pop'?.5:(f.k==='net'?99:.7);f.t+=FDT;if(f.t>dur){SUPERFX.splice(i,1);continue;}var k=f.t/dur;
  if(f.k==='pop'){g.strokeStyle='rgba(255,236,150,'+(1-k)+')';g.lineWidth=2.4*(1-k)+.6;g.beginPath();g.arc(f.x,f.y-8,4+k*16,0,7);g.stroke();
    g.fillStyle='rgba(255,255,255,'+(.8*(1-k))+')';for(var r2=0;r2<4;r2++){var an=r2*1.571+k;g.fillRect(f.x+Math.cos(an)*(6+k*14)-1,f.y-8+Math.sin(an)*(6+k*14)-1,2,2);}continue;}
  if(f.k==='net'){ /* v65: rainbow net follows the fisher's net state - out, settle, then hauled back with the fish inside */
    var N=f.net;if(!N||N.done){SUPERFX.splice(i,1);continue;}var tt=N.t,fa=f.ax,netBox=superNetBounds(fa,N),hx0=netBox.hand.x,hy0=netBox.hand.y,cx2=netBox.x+netBox.w/2,cy2=netBox.y+netBox.h/2,wx=netBox.w,hy2=netBox.h;
    g.save();g.lineWidth=1.3;for(var ni=0;ni<=6;ni++){g.strokeStyle=RAINBOW[ni];var yy2=cy2-hy2/2+hy2*ni/6;g.beginPath();g.moveTo(cx2-wx/2,yy2);g.quadraticCurveTo(cx2,yy2+3*Math.sin(time*6+ni),cx2+wx/2,yy2);g.stroke();}
    for(var nj=0;nj<=4;nj++){g.strokeStyle=RAINBOW[(nj*2)%7];var xx2=cx2-wx/2+wx*nj/4;g.beginPath();g.moveTo(xx2,cy2-hy2/2);g.lineTo(xx2,cy2+hy2/2);g.stroke();}
    g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=.8;g.beginPath();g.moveTo(hx0,hy0);g.lineTo(cx2+(fa.dir<0?wx/2:-wx/2),cy2-hy2/2);g.moveTo(hx0,hy0);g.lineTo(cx2+(fa.dir<0?wx/2:-wx/2),cy2+hy2/2);g.stroke();
    if(N.lifted){var hk=Math.min(1,(tt-.85)/.75);N.list.forEach(function(en,ei){var point=superNetFish(netBox,en),ex=point.x,ey=point.y,wig=Math.sin(time*18+ei)*.4;
      g.save();g.translate(ex,ey);g.rotate(wig-.6);drawItem(g,en.id,0,0,1.7);g.restore();});}
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
 var master=a.role==='lumber',level=master?12:(a.martialLevel||wpnLv());
 var fromSprite=!master&&!a.customArms&&drawSprite(g,'hero',actorSpriteAnim(a),time+(a.x%7)*.1,a.x,a.y+9,SPRITE_PPU,a.dir>0);
 if(fromSprite)drawSpriteLevel(g,a.x,a.y+16,level,13);
 if(!fromSprite)drawActor3D(g,a,{coat:master?'#e6872a':ART.coats[Math.min(12,level-1)],scarf:master?'#ffe06b':ART.scarves[Math.min(12,level-1)],customArms:!!a.customArms,level:level});
 if((a.stab||0)>0){var force=Math.sin(Math.min(1,a.stab/.32)*Math.PI);g.save();g.translate(a.x,a.y);g.scale(a.dir||1,1);g.strokeStyle='rgba(255,216,102,'+force*.75+')';g.lineWidth=1.4;g.beginPath();g.arc(3,a.strikeType==='kick'?0:-14,12+force*8,-.8,.8);g.stroke();g.restore();}
 if((a.ultFxT||0)>0){var wave=1-a.ultFxT/.65;g.strokeStyle='rgba(255,220,110,'+(1-wave)*.8+')';g.lineWidth=2.2;g.beginPath();g.ellipse(a.x,a.y+9,135*wave,52*wave,0,0,7);g.stroke();}
}

function drawAgent(a){
  var by=a.mv?-Math.abs(Math.sin(a.bob))*2.5:0;
  if(a.inside||!spriteVisible(a.x,a.y,90))return;
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
  else if(!drawSprite(ctx,SPRITE_ROLE[a.role],actorSpriteAnim(a),time+(a.x%7)*.1,a.x,a.y+9,SPRITE_PPU,a.dir>0))drawPerson(ctx,a.x,a.y,a.role,a.dir,by,tierOf('boots',a.gear.boots),t,t2,a.role==='player'?null:a.gear,a);
  curWalk=null;if(a.role!=='player'&&!isHunter(a.role)&&SPRITE_ROLE[a.role]&&spriteReady(SPRITE_ROLE[a.role]))drawSpriteLevel(ctx,a.x,a.y+14,a.gear[PRIM[a.role]]||0,12);
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
    ctx.strokeText(a.gear.name,a.x,a.y-43+by);ctx.fillStyle='#fffbe8';ctx.fillText(a.gear.name,a.x,a.y-43+by);
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
    var bw=ids.length*17+6,bx=a.x-bw/2,byy=a.y-(a.role==='player'?41:51);
    ctx.fillStyle=a.role==='courier'?'rgba(63,127,184,.92)':(full?'rgba(226,86,106,.9)':'rgba(34,53,43,.8)');rr(ctx,bx,byy,bw,12,6);ctx.fill();
    ids.forEach(function(id,i){drawItem(ctx,id,bx+7+i*17,byy+6,.48);ctx.fillStyle='#fff';ctx.fillText(String(a.bag[id]),bx+11+i*17,byy+6.5);});
  }
}
function drawCustomer(c){
 var g=ctx;
 if(!drawSprite(g,'customer',c.state==='out'&&c.mood!=='angry'?'happy':actorSpriteAnim(c),time+(c.x%7)*.1,c.x,c.y+6,SPRITE_PPU*.65,c.dir>0))drawActor3D(g,c,{coat:c.col,pants:c.pants,hair:c.hair,scale:.65});
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
