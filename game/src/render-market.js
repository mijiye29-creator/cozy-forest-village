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
function celebrate(x,y,label,big){agents.forEach(function(a){if(Math.hypot(a.x-x,a.y-y)<180)a.cheerUntil=time+1;});CELEB.push({x:x,y:y,t:1.6,max:1.6,label:label,big:!!big});flash=Math.max(flash,.12);sfx('cash');
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
  for(var i=0;i<n;i++){var x=st.x+side*(24+i*9),y=st.y+101;if(typeof drawStaffAction==='function'&&drawStaffAction(g,line,i,x,y,side))continue;if(!drawSprite(g,'shop_staff',customers.some(function(c){return c.seller===line&&c.cheerUntil>time;})?'cheer':customers.some(function(c){return c.seller===line&&c.state==='serve';})?'work':customers.some(function(c){return c.seller===line&&c.mv;})?'walk':'idle',time+i*.3,x,y+6,SPRITE_PPU*.65,side>0))drawActor3D(g,{x:x,y:y,dir:side,role:'courier',working:!!customers.some(function(c){return c.seller===line&&c.state==='line';})},{coat:line==='wood'?'#e78537':'#169ac7',apron:true,scale:.65});}

  for(var j=0;j<shopShelves(line);j++){var rx=st.x-19+j*13,ry=st.y+112;if(!drawFacilitySprite(g,'market_stall',rx+5,ry+2,18,20,1,1,time))isoBox(g,rx,ry,10,3,7,'#a68a60');drawItem(g,SHOPDEF[line].icon,rx+5,ry-8,.3);}
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
  if(drawFacilitySprite(g,line==='wood'?'shop_wood':'shop_fish',46,126,92,142,L,8,0))return;
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
  var g=ctx,st=STALL[line],L=S.shop[line],img=tileImg('vertical-market-v1-'+line+'-'+L,96,function(c){drawMarketShop(c,line,L);},144);if(!drawFacilitySprite(g,line==='wood'?'shop_wood':'shop_fish',st.x,st.y+120,92,142,L,8,time))g.drawImage(img,st.x-48,st.y-18,96,144);
  var ids=ORDER.filter(function(id){return ITEMS[id].line===line&&ss(line,id)>0;}).slice(0,4),side=shopSide(line);
  ids.forEach(function(id,i){var x=st.x+side*28,y=st.y+89+i*9;drawItem(g,id,x,y,.34);g.fillStyle='#fbf3dd';g.font='5px sans-serif';g.textAlign='center';g.fillText(String(ss(line,id)),x,y+6);});
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
  if(!spriteVisible(q.x,q.y,100))return;
  var g=ctx,L=Math.max(1,Math.min(5,siteLv(q.s))),step=dtv||FDT||.016;
  if(q.hit>0)q.hit=Math.max(0,q.hit-step);
  g.fillStyle='rgba(36,65,58,.13)';g.beginPath();g.ellipse(q.x+2,q.y+8,10,3,0,0,7);g.fill();
  if(q.alive){
    var sway=Math.sin(time*.8+q.ph)*.022+(q.by&&q.prog>0?Math.sin(time*27)*.045:0);
    var scale=1;if(q.pop>0){q.pop=Math.max(0,q.pop-step*2.2);scale=1-.16*Math.sin(q.pop*Math.PI);}
    g.save();g.translate(q.x,q.y+7);g.rotate(sway);g.scale(scale*1.35,scale*1.35);if(q.sp>=3||!drawSprite(g,L<=1?'pine_small':'pine',q.by&&q.prog>0?'chop':'idle',time+q.ph,0,0,SPRITE_PPU*(1+.08*(L-1)),false))g.drawImage(treeSprite(L,q.sp),-24,-52,48,64);g.restore();
    if(!teamOk(q))lockBadge(q.x+9,q.y-28);drawBar(q,-45);
  }else{
    var stump=drawSprite(g,'stump','static',0,q.x,q.y+7,SPRITE_PPU,false);
    if(!stump){g.fillStyle='#82614b';rr(g,q.x-3,q.y+3,6,5,1.5);g.fill();g.fillStyle='#d0b99a';g.beginPath();g.ellipse(q.x,q.y+3,3,1.5,0,0,7);g.fill();}
    var growth=Math.max(0,Math.min(1,1-q.timer/q.max));
    if(growth>.25){g.fillStyle=FOREST_LOOK[L-1].leaf;g.beginPath();g.moveTo(q.x,q.y-8*growth);g.lineTo(q.x-4*growth,q.y+2);g.lineTo(q.x+4*growth,q.y+2);g.closePath();g.fill();}
  }
}

function drawOre(q){
  if(!spriteVisible(q.x,q.y,80))return;
  var sp=ORES[q.sp]||ORES[0],g=ctx;if(q.hit>0)q.hit=Math.max(0,q.hit-FDT);
  g.fillStyle='rgba(30,30,30,.18)';g.beginPath();g.ellipse(q.x+2,q.y+8,13,4,0,0,7);g.fill();
  if(!q.alive){var gr=1-q.timer/q.max;g.fillStyle='#8a8078';g.beginPath();g.ellipse(q.x,q.y+5,6+gr*4,3,0,0,7);g.fill();if(gr>.3){g.save();g.translate(q.x,q.y+2);g.scale(gr,gr);drawItem(g,sp.id,0,0,1.1);g.restore();}return;}
  var sh=q.by&&q.prog>0?Math.sin(time*40)*.8:0,pop=q.pop>0?(q.pop=Math.max(0,q.pop-FDT*2.2),1+.25*Math.sin(q.pop*Math.PI)):1;
  g.save();g.translate(q.x+sh,q.y+6);g.scale(pop*.78,pop*.78);
  if(!drawSprite(g,q.sp===0?'rock':'ore_rock','static',0,0,0,SPRITE_PPU*1.4,false)){
  g.fillStyle='#7d746a';g.beginPath();g.moveTo(-13,2);g.lineTo(-10,-9);g.lineTo(-3,-15);g.lineTo(7,-13);g.lineTo(13,-4);g.lineTo(11,2);g.closePath();g.fill();
  g.fillStyle='#9a9088';g.beginPath();g.moveTo(-10,-9);g.lineTo(-3,-15);g.lineTo(3,-12);g.lineTo(-4,-5);g.closePath();g.fill();
  }
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
  ctx.save();ctx.translate(q.x+fx,q.y+fy);ctx.rotate(fa);ctx.globalAlpha=.92;ctx.filter='hue-rotate('+(q.sp*42)+'deg)';
  if(!drawSprite(ctx,'fish','swim',time+q.ph,0,8,SPRITE_PPU*.55,Math.cos(time*.8+q.ph)<0))drawItem(ctx,FISH[q.sp].id,0,0,2.2);
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
