/* market walkway mats: stand here to hand goods over */
function drawMats(){
  var g=ctx,pl=agents[0],carry=bagN(pl)>0;MATS().forEach(function(m){var x=m.x,y=m.y,has=carry&&stackList(pl).some(function(id){return ITEMS[id].line===m.line;}),on=Math.hypot(pl.x-x,pl.y-y)<24;
    var bw=36,bh=34,x0=-bw/2,y0=-17,pulse=has?1+.05*Math.sin(time*8):1;
    g.save();g.translate(x,y);g.scale(pulse,pulse);
    g.fillStyle='rgba(0,0,0,.16)';rr(g,x0,y0+2,bw,bh,8);g.fill();
    var pg=g.createLinearGradient(0,y0,0,y0+bh);pg.addColorStop(0,m.line==='wood'?'#8a5a30':'#2f6b98');pg.addColorStop(1,m.line==='wood'?'#5f3c1e':'#1f4a6e');g.fillStyle=pg;rr(g,x0,y0,bw,bh,8);g.fill();
    g.fillStyle='rgba(255,255,255,.14)';rr(g,x0+2,y0+1.5,bw-4,bh*.35,6);g.fill();
    g.strokeStyle=has?'rgba(255,236,150,'+(.7+.3*Math.sin(time*8))+')':'rgba(255,255,255,.55)';g.lineWidth=has?2:1.4;g.setLineDash(has?[]:[3,2]);rr(g,x0+2,y0+2,bw-4,bh-4,6.5);g.stroke();g.setLineDash([]);
    drawItem(g,m.line==='wood'?'oak':'carp',-5,-5,.8);g.font='12px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('📦',7,-3);
    g.fillStyle='rgba(0,0,0,.45)';rr(g,x0+3,y0+bh-11.5,bw-6,9,4.5);g.fill();g.font='800 6.5px sans-serif';g.fillStyle='#fff';g.fillText('▼ 납품',0,y0+bh-6.8);
    g.restore();
    g.font='800 6.5px sans-serif';g.textAlign='center';g.textBaseline='middle';var lab=m.line==='wood'?'나무 납품':'생선 납품',cw=g.measureText(lab).width+8;
    g.fillStyle='rgba(255,252,240,.92)';rr(g,x-cw/2,y+19,cw,9,4.5);g.fill();g.fillStyle='#4a3a2c';g.fillText(lab,x,y+23.8);
    if(on&&has){g.fillStyle='rgba(79,179,106,.25)';rr(g,x+x0,y+y0,bw,bh,8);g.fill();}});
}
function drawTarget(){
  var g=ctx,pl=agents[0];
  if(pl.path.length&&pl.goal){var t=pl.goal;g.strokeStyle='rgba(240,187,63,'+(.6+.3*Math.sin(time*6))+')';g.lineWidth=2;g.setLineDash([5,3]);rr(g,t.c*T+2,t.r*T+2,T-4,T-4,6);g.stroke();g.setLineDash([]);}
  if(tapFx){tapFx.t-=1/60;if(tapFx.t<=0)tapFx=null;else{g.fillStyle='rgba(255,240,170,'+(tapFx.t*.4)+')';rr(g,tapFx.c*T,tapFx.r*T,T,T,6);g.fill();}}
}
function draw(){
  ctx.fillStyle='#d6eef5';ctx.fillRect(0,0,W,SH);
  ctx.save();if(SHAKE>0)ctx.translate(Math.sin(time*53)*SHAKE*3,Math.cos(time*47)*SHAKE*2.2);ctx.scale(Z,Z);ctx.translate(-camX,-camY);
  drawOutskirts(ctx,-112,'left');if(fenceX()>=W-1)drawOutskirts(ctx,W,'right');
  ctx.drawImage(BG,0,WORLD_TOP,W,HT-WORLD_TOP);
  drawPlaza();
  SITES.forEach(drawSite);
  /* v50 (perf): the palisade only lives in two thin strips - blit those instead of the whole world-sized layer */
  /* The visible perimeter follows the same intact/breached state as bear collision. */
  drawMarketGround();
  drawRoad();
  drawMats();drawTarget();drawFence();drawXTowers();
  res.forEach(function(q){if(q.k==='fish'&&owned(q.s))drawFish(q);});
  drawBelts();
  SITES.forEach(function(st){if(owned(st.id))drawPile(st.id);});
  SITES.forEach(function(st){drawExport(st.id);});
  LINES.forEach(drawStall);
  drawCash();if(typeof drawCompleteActions==='function')drawCompleteActions();
  drawLocked();
  drawGuide();drawPads();drawTapMark();
  var list=[],vx0=camX-50,vx1=camX+W/Z+50,vy0=camY-60,vy1=camY+SH/Z+60;function vis(o){return o.x>vx0&&o.x<vx1&&o.y>vy0&&o.y<vy1;} /* v59: things off screen are not drawn */
  res.forEach(function(q){if(!vis(q))return;if(q.k==='tree'&&owned(q.s))list.push({y:q.y+8,f:drawTree,o:q});else if(q.k==='ore'&&owned(q.s))list.push({y:q.y+8,f:drawOre,o:q});});
  agents.forEach(function(a){if(!a.inside&&vis(a))list.push({y:a.y+9,f:drawAgent,o:a});});
  customers.forEach(function(c){if(vis(c))list.push({y:c.y+8,f:drawCustomer,o:c});});
  BEARS.forEach(function(b){list.push({y:b.y+2,f:drawBear,o:b});});
  list.sort(function(a,b){return a.y-b.y;});
  list.forEach(function(it){it.f(it.o);});
  drawPads(true);drawFacilityLabels();drawSuperFx();drawLoot();drawArrows();drawBearTargets();
  trucks.slice().sort(function(a,b){return a.y-b.y;}).forEach(drawTruck);
  trucks.forEach(drawTruckBubble);
  drawFly();
  drawCelebs();
  drawChecks();
  res.forEach(function(q){if(q.k==='fish'&&owned(q.s))drawBar(q,-10);});
  parts.forEach(function(pt){ctx.globalAlpha=Math.max(0,pt.life/pt.max);ctx.fillStyle=pt.col;
    if(pt.ring){var rp=1-pt.life/pt.max;ctx.strokeStyle=pt.col;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(pt.x,pt.y+3,3+rp*11,1.5+rp*4.5,0,0,7);ctx.stroke();}
    else if(pt.star){ctx.save();ctx.translate(pt.x,pt.y);ctx.rotate(time*6+pt.x);ctx.beginPath();for(var si2=0;si2<10;si2++){var sa2=si2*Math.PI/5,sr2=si2%2?pt.r*.45:pt.r;ctx.lineTo(Math.cos(sa2)*sr2,Math.sin(sa2)*sr2);}ctx.closePath();ctx.fill();ctx.restore();}
    else if(pt.leaf){ctx.save();ctx.translate(pt.x,pt.y);ctx.rotate(pt.x*.2+time*3);ctx.beginPath();ctx.ellipse(0,0,2.4,1.2,0,0,7);ctx.fill();ctx.restore();}
    else if(pt.spark){ctx.fillRect(pt.x-pt.r,pt.y-.5,pt.r*2,1);ctx.fillRect(pt.x-.5,pt.y-pt.r,1,pt.r*2);}else{ctx.beginPath();ctx.arc(pt.x,pt.y,pt.r,0,7);ctx.fill();}});
  ctx.globalAlpha=1;
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  floats.slice(-8).forEach(function(fl){var unit=screenUnit/Z,al=Math.min(1,Math.max(0,(2-fl.t)/.6));
    if(fl.dmg){var pk=fl.t<.12?1.8-fl.t/.12*.8:1;ctx.globalAlpha=Math.min(1,Math.max(0,(.85-fl.t)/.3));ctx.save();ctx.translate(fl.x+(fl.dx||0)*fl.t,fl.y-fl.t*34);ctx.scale(pk,pk);ctx.font='900 '+((fl.big?15:12)*unit)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3*unit;ctx.strokeStyle='rgba(60,20,10,.9)';ctx.strokeText(fl.text,0,0);ctx.fillStyle=fl.col;ctx.fillText(fl.text,0,0);ctx.restore();ctx.globalAlpha=1;return;} /* 2026-10-09 punchy damage numbers */ctx.globalAlpha=al;ctx.font='600 '+((fl.small?9:10)*unit)+'px sans-serif';ctx.lineWidth=2*unit;ctx.strokeStyle='rgba(35,49,39,.8)';
    var chars=Array.from(String(fl.text)),lines=[];for(var i=0;i<chars.length;i+=24)lines.push(chars.slice(i,i+24).join(''));
    lines.slice(0,2).forEach(function(line,i){var fw=ctx.measureText(line).width,fxx=Math.max(camX+fw/2+4*unit,Math.min(camX+W/Z-fw/2-4*unit,fl.x));var lineH=11*unit,minY=camY+10*unit,maxY=camY+SH/Z-10*unit-(Math.min(2,lines.length)-1)*lineH;var yy=Math.max(minY,Math.min(Math.max(minY,maxY),fl.y-fl.t*12))+i*lineH;ctx.strokeText(line,fxx,yy);ctx.fillStyle=fl.col;ctx.fillText(line,fxx,yy);});});
  ctx.globalAlpha=1;
  ctx.restore();
  drawTutorialEdge();drawAmbient();
  ctx.save();ctx.scale(Z,Z);ctx.translate(-camX,-camY);
  drawPills();
  drawTutArrow();
  ctx.restore();
  drawBearChip();drawTutEdge();drawStageBanner();drawCoinFly();drawJoy();drawEndingCinematic();
  if(flash>0){ctx.fillStyle='rgba(255,255,255,'+flash*.45+')';ctx.fillRect(0,0,W,SH);}
}
