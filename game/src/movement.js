/* ---------- arcade controls: joystick, stack on your back, stand-on pads ---------- */
var joy={on:false,ox:0,oy:0,dx:0,dy:0,id:null},FLY=[],zoneT=0,padMsgT=0;
/* v78: idle hint - if the player hasn't acted in a while (outside the tutorial), point the guide arrow at something useful */
var idleT=0;
function idleHint(){
  if(tutOn()||idleT<9)return null;
  var cand=null;PADLIST.forEach(function(p){if(cand||p.mini)return;if(!p.d.isMax()&&p.d.canBuy())cand=p;});
  if(cand)return {x:cand.x,y:cand.y};
  var pileSt=null;SITES.forEach(function(st){if(pileSt)return;if(owned(st.id)&&!cvLv(st.id)&&st.kind!=='mine'&&pn(st.id)>0)pileSt=st;});
  if(pileSt){var pp=pilePos(pileSt.id);return {x:pp.x,y:pp.y};}
  var cs=cashSpots().filter(function(o){return (S.cash[o.k]||0)>0;})[0];
  if(cs)return {x:cs.p.x,y:cs.p.y};
  return null;
}
function walkXY(x,y){
  if(x<4||y<WORLD_TOP+4||y>=H-4||x>fenceX()-7)return false;
  for(var i=0;i<PADLIST.length;i++){if(Math.hypot(x-PADLIST[i].x,y-PADLIST[i].y)<20)return true;}
  if(x>MX-4)return false;var t=tileAt(x,y);var lake=SITE.p1;if(x>lake.x+3&&x<lake.x+lake.w-3&&y>lake.y+3&&y<lake.y+lake.h-3)return false;return !!t&&tileOk(t.c,t.r);
}
function fly(id,x0,y0,x1,y1,dur,style){FLY.push({id:id,x0:x0,y0:y0,x1:x1,y1:y1,t:0,dur:dur||.32,payment:style==='payment',bend:style==='payment'?(x0-x1)*.4:0});}
function updateFly(dt){for(var i=FLY.length-1;i>=0;i--){FLY[i].t+=dt;if(FLY[i].t>=FLY[i].dur)FLY.splice(i,1);}}
function drawFly(){FLY.forEach(function(f){var k=f.t/f.dur,e=1-(1-k)*(1-k),x=f.x0+(f.x1-f.x0)*e+Math.sin(k*Math.PI)*(f.bend||0),y=f.y0+(f.y1-f.y0)*e-Math.sin(k*Math.PI)*18;
  if(f.id==='bigcoin'){if(f.payment){ctx.strokeStyle='rgba(255,226,106,'+(.8*(1-k))+')';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-4,y-9);ctx.quadraticCurveTo(x+2,y-4,x,y);ctx.stroke();}var sq=Math.abs(Math.cos(time*10+f.x0))*.6+.4;ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(255,230,120,.35)';ctx.beginPath();ctx.arc(0,0,9,0,7);ctx.fill();ctx.scale(sq,1);
    ctx.fillStyle='#b8801a';ctx.beginPath();ctx.arc(0,1.2,6.4,0,7);ctx.fill();ctx.fillStyle='#f0bb3f';ctx.beginPath();ctx.arc(0,0,6.4,0,7);ctx.fill();ctx.strokeStyle='#fff1a8';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,4.8,0,7);ctx.stroke();
    ctx.fillStyle='#8a5a10';ctx.font='900 7px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('₩',0,.4);ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(-2.2,-2.4,1.3,0,7);ctx.fill();ctx.restore();}
  else if(f.id==='coin'){ctx.fillStyle='#f0bb3f';ctx.beginPath();ctx.arc(x,y,3.2,0,7);ctx.fill();ctx.fillStyle='#fff3c0';ctx.beginPath();ctx.arc(x-1,y-1,1.1,0,7);ctx.fill();}
  else drawItem(ctx,f.id,x,y,.6);});}
/* the carried stack: ordered list of item ids, cheapest at the bottom */
function stackList(a){var l=[];ORDER.forEach(function(id){for(var i=0;i<(a.bag[id]||0);i++)l.push(id);});return l;}
function stackTop(a){var n=bagN(a);return {x:a.x+a.dir*9,y:a.y-7-n*3.2};}
function drawStack(a,by){
  var l=stackList(a);if(!l.length)return;
  var sway=a.mv?Math.sin(a.bob*.5):0,bx=a.x+a.dir*9;
  l.forEach(function(id,i){var it=ITEMS[id],x=bx+sway*i*.18,y=a.y-4+by-i*3.2;
    if(it.cat==='wood'){ctx.fillStyle=it.sp.log;rr(ctx,x-5.5,y-1.6,11,3.2,1.5);ctx.fill();ctx.fillStyle='rgba(255,236,190,.55)';ctx.beginPath();ctx.arc(x+4.6,y,1.2,0,7);ctx.fill();}
    else if(it.cat==='fish'){ctx.fillStyle='#c79a63';rr(ctx,x-5,y-1.6,10,3.2,1);ctx.fill();ctx.fillStyle=it.sp.col;ctx.fillRect(x-3.5,y-1.1,7,1.4);}
    else if(id==='meat'){ctx.fillStyle='#c9463d';rr(ctx,x-5,y-1.8,10,3.6,1.6);ctx.fill();ctx.fillStyle='#f3ead8';ctx.fillRect(x+3,y-.6,3,1.2);}
    else if(id==='hide'){ctx.fillStyle='#eef2f6';rr(ctx,x-6,y-1.6,12,3.2,1.2);ctx.fill();ctx.fillStyle='#c9d6e0';ctx.fillRect(x-6,y+.8,12,.8);}
    else{ctx.fillStyle='#b98b5e';rr(ctx,x-4.5,y-1.6,9,3.2,1);ctx.fill();}});
  if(bagN(a)>=cap()){var t=stackTop(a);ctx.font='800 7px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(226,86,106,.92)';rr(ctx,t.x-12,t.y-9+by,24,10,5);ctx.fill();ctx.fillStyle='#fff';ctx.fillText('가득',t.x,t.y-3.8+by);}
}
/* walk-over zones: storage decks hand you their pile, stall mats take your stack */
function allBelted(line){var l=SITES.filter(function(st){return owned(st.id)&&st.line===line;});return l.length>0&&l.every(function(st){return cvLv(st.id)>0;});}
var MATS=function(){return [{line:'wood',x:246,y:138},{line:'fish',x:504,y:138}].filter(function(o){return lineOpen(o.line)&&!allBelted(o.line);});};
var CFLY=[],FDT=.016;
function coinToHud(wx,wy){var p=toScreen(wx,wy);CFLY.push({x0:p.x,y0:p.y,cx:p.x+(Math.random()-.5)*70,cy:Math.max(10,p.y-50-Math.random()*50),t:0,dur:.5+Math.random()*.2,sp:Math.random()*6});}
function bumpHud(){var el=elCoins.parentElement;el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
function drawCoinFly(){var g=ctx;for(var i=CFLY.length-1;i>=0;i--){var f=CFLY[i];f.t+=FDT;var k=Math.min(1,f.t/f.dur),e=k*k,u=1-e,tx=24,ty=-10;
    var x=u*u*f.x0+2*u*e*f.cx+e*e*tx,y=u*u*f.y0+2*u*e*f.cy+e*e*ty,r=6.5-2*k;
    g.fillStyle='rgba(255,230,120,.35)';g.beginPath();g.arc(x,y,r+3,0,7);g.fill();
    g.save();g.translate(x,y);g.scale(Math.abs(Math.cos(time*9+f.sp))*.5+.5,1);g.fillStyle='#d99a20';g.beginPath();g.arc(0,.8,r,0,7);g.fill();g.fillStyle='#f0bb3f';g.beginPath();g.arc(0,0,r,0,7);g.fill();
    g.fillStyle='#fff3b0';g.beginPath();g.arc(-r*.35,-r*.35,r*.3,0,7);g.fill();g.restore();
    if(k>=1){CFLY.splice(i,1);bumpHud();sfx('coin',.04);}}}
function cashPos(line){var s=STALL[line];return {x:line==='wood'?s.x-40:s.x+52,y:172};}
function tcashPos(b){var p=plotOf(b);return {x:shedX(p)+19,y:p.y-16};}
function cashSpots(){var l=[{k:'wood',p:cashPos('wood'),r:40},{k:'fish',p:cashPos('fish'),r:40}];TPROCS.forEach(function(b){if(S[b])l.push({k:'t_'+b,p:tcashPos(b),r:34,b:b});});return l;}
var autoT=0;
function updateCash(dt){
  if(!S.cash)S.cash={wood:0,fish:0};var a=agents[0],sp=cashSpots();
  if(S.autocash){autoT-=dt;if(autoT<=0){autoT=[8,5,3][S.autocash-1];sp.forEach(function(o){var n=S.cash[o.k]||0;if(n<=0)return;var p=o.p;S.coins+=n;S.cash[o.k]=0;S.h4=1;
      for(var ci=0;ci<Math.min(10,2+Math.ceil(n/15));ci++)coinToHud(p.x+(Math.random()-.5)*14,p.y-4-Math.random()*6);addFloat(p.x,p.y-20,'💰+'+fmt(n),'#ffe27a',true);});}}
  sp.forEach(function(o){var n=S.cash[o.k]||0;if(n<=0||!tutAllow('cash'))return;var p=o.p;if(Math.hypot(a.x-p.x,a.y-p.y)>o.r)return;
    if(tutOn()){var np=TUTPAD[S.tut+1],need=np&&DEF[np]?Math.max(0,Math.ceil(DEF[np].cost())-Math.floor(S.coins)):0;S.cash[o.k]=0;S.coins+=need;S.h4=1;
      for(var ci=0;ci<Math.min(10,3+Math.ceil(need/8));ci++)coinToHud(p.x+(Math.random()-.5)*14,p.y-4-Math.random()*6);addFloat(a.x,a.y-34,'💰+'+fmt(need),'#ffe27a',true);sfx('coin');save();return;}
    a.cashT=(a.cashT||0)-dt;if(a.cashT>0)return;a.cashT=.05;
    var take=n<50?n:Math.max(50,Math.floor(n*.18/50)*50);if(take>n)take=n;S.cash[o.k]=n-take;S.coins+=take;S.h4=1;a.cashGot=(a.cashGot||0)+take;
    coinToHud(p.x+(Math.random()-.5)*10,p.y-4);if(Math.random()<.5)coinToHud(p.x+(Math.random()-.5)*10,p.y-6);
    if(S.cash[o.k]<=0){S.cash[o.k]=0;addFloat(a.x,a.y-34,'💰+'+fmt(a.cashGot),'#ffe27a',true);a.cashGot=0;}});
}
function drawCash(){
  if(!S.cash)return;var g=ctx;
  cashSpots().forEach(function(o){var n=S.cash[o.k]||0;if(n<=0)return;var p=o.p,bricks=Math.min(48,Math.ceil(n/5));
    g.fillStyle='rgba(0,0,0,.16)';g.beginPath();g.ellipse(p.x+1,p.y+4,19,5,0,0,7);g.fill();
    for(var i=0;i<bricks;i++){var layer=Math.floor(i/8),k=i%8,row=Math.floor(k/4),col=k%4,bx=p.x-14+col*10+row*4,by=p.y-row*5-layer*3.4;
      g.fillStyle='#a8720f';g.beginPath();g.ellipse(bx,by+.8,5.6,3.6,0,0,7);g.fill();
      g.fillStyle='#f0bb3f';g.beginPath();g.ellipse(bx,by,5.6,3.6,0,0,7);g.fill();
      g.strokeStyle='#fff3c0';g.lineWidth=.9;g.beginPath();g.ellipse(bx,by,3.9,2.5,0,0,7);g.stroke();
      g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(bx-1.5,by-1.1,1.6,.9,0,0,7);g.fill();
      g.fillStyle='rgba(120,70,10,.55)';g.font='800 4.5px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('₩',bx,by+.3);}
    var top=p.y-4-Math.floor((bricks-1)/8)*3.4-4;g.fillStyle='rgba(255,255,255,'+(.5+.4*Math.sin(time*5))+')';g.beginPath();g.moveTo(p.x-2.6,top);g.lineTo(p.x,top-3.8);g.lineTo(p.x+2.6,top);g.lineTo(p.x,top+3.8);g.closePath();g.fill();
    g.font='900 9.5px sans-serif';g.textAlign='center';g.textBaseline='middle';var lab=(o.b?'🚚 ':'')+'₩'+moneyShort(n),tw=Math.min(70,g.measureText(lab).width+10);g.fillStyle='rgba(168,114,15,.95)';rr(g,p.x-tw/2,p.y+5,tw,13,6.5);g.fill();g.strokeStyle='#fff3c0';g.lineWidth=1;rr(g,p.x-tw/2+1,p.y+6,tw-2,11,5.5);g.stroke();g.fillStyle='#fff';g.fillText(lab,p.x,p.y+11.6,60);
    if(Math.random()<.04)parts.push({x:p.x+(Math.random()-.5)*20,y:top+Math.random()*8,vx:0,vy:-8,g:0,life:.6,max:.6,col:'#fff1a8',r:1.2,spark:true});});
}
function zoneActions(a,dt){
  zoneT-=dt;if(zoneT>0)return;zoneT=.04;
  var st=null;SITES.forEach(function(s2){var t=s2.store;if(owned(s2.id)&&a.x>=t.c*T&&a.x<t.c*T+T&&a.y>=t.r*T&&a.y<t.r*T+T)st=s2;});
  if(st&&cvLv(st.id)&&bagN(a)>0&&pn(st.id)<pcap()){
    var bid=null;for(var k2 in a.bag){if(ITEMS[k2].line===st.line&&ITEMS[k2].sp){bid=k2;break;}}
    if(bid){a.bag[bid]--;if(a.bag[bid]<=0)delete a.bag[bid];var pl2=pileOf(st.id);pl2[bid]=(pl2[bid]||0)+1;var pp2=pilePos(st.id),tp2=stackTop(a);fly(bid,tp2.x,tp2.y,pp2.x,pp2.y-6,.25);sfx('pickup',.12);return;}}
  if(st&&st.kind!=='mine'&&!cvLv(st.id)&&pn(st.id)>0&&bagN(a)<cap()&&!tutOn()){
    var got={};takeFromPileTo(got,st.id,1);var id=Object.keys(got)[0];
    if(id){a.bag[id]=(a.bag[id]||0)+1;var pp=pilePos(st.id),tp=stackTop(a);fly(id,pp.x,pp.y-6,tp.x,tp.y,.25);sfx('pickup',.12);}
    return;}
  MATS().forEach(function(m){
    if(Math.hypot(a.x-m.x,a.y-m.y)>24||bagN(a)<=0||!tutAllow('deliver'))return;
    var ids=stackList(a).reverse(),id=null;
    for(var i=0;i<ids.length;i++){var it=ITEMS[ids[i]];if(m.line==='wh'||it.line===m.line){id=ids[i];break;}}
    if(!id)return;
    if(m.line==='wh'){if(whTotal()>=whCap())return;addWh(id,1);}
    else{if(lineStock(m.line)>=stallCap(m.line)){if(padMsgT<=0){addFloat(m.x,m.y-20,'판매대가 가득','#ffb3b3');padMsgT=2;}return;}addSs(m.line,id,1);}
    a.bag[id]--;if(a.bag[id]<=0)delete a.bag[id];
    var tp=stackTop(a),tx=m.line==='wh'?WH.x0+30:STALL[m.line].x-10,ty=m.line==='wh'?WH.wall+10:STALL[m.line].y-4;
    fly(id,tp.x,tp.y,tx,ty,.3);sfx('pickup',.1);
  });
}
function takeFromPileTo(bag,sid,max){var p=S.piles[sid];if(!p)return 0;var ids=Object.keys(p).filter(function(k){return p[k]>0;}).sort(function(x,y){return ITEMS[y].sp.val-ITEMS[x].sp.val;}),got=0;
  ids.forEach(function(id){var t=Math.min(p[id],max-got);if(t>0){p[id]-=t;got+=t;bag[id]=(bag[id]||0)+t;}});return got;}
function unstick(a){for(var r=4;r<200;r+=4)for(var k=0;k<16;k++){var an=k/16*6.283,px=a.x+Math.cos(an)*r,py=a.y+Math.sin(an)*r;if(walkXY(px,py)){a.x=px;a.y=py;release(a);a.path=[];return true;}}a.x=HOME.x;a.y=HOME.y;return false;}
function stepPlayerFree(a,dt){
  a.lockT-=dt;padMsgT-=dt;
  zoneActions(a,dt);
  /* v83: keep re-targeting a tapped bear's live position instead of a one-time stale point */
  if(a.chaseBear){var cb=a.chaseBear;
    if(cb.state==='dead'||cb.state==='out'||BEARS.indexOf(cb)<0)a.chaseBear=null;
    else if(!joy.on){var cd=Math.hypot(a.x-cb.x,a.y-cb.y);
      var cwk=wkind(),creach=heroReach(cb)-4;
      if(cd<creach)a.chaseBear=null;
      else{a.chaseT=(a.chaseT||0)-dt;if(a.chaseT<=0){a.chaseT=.2;var cux=(a.x-cb.x)/(cd||1),cuy=(a.y-cb.y)/(cd||1),cst=Math.min(creach-4,Math.max(bearR(cb)+12,cwk==='gun'?110:0));a.tap={x:cb.x+cux*cst,y:cb.y+cuy*cst};a.tapStuck=0;
        if(!lineClear(a.x,a.y,cb.x,cb.y)){var ctt=tileAt(cb.x,cb.y);if(ctt)goTile(a,ctt);}else a.path=[];}}}}
  if(!joy.on&&a.tap&&a.path.length){followPath(a,dt);a.moving=true;a.mv=true;return;}
  if(!joy.on&&a.tap){var tdx=a.tap.x-a.x,tdy=a.tap.y-a.y,td=Math.hypot(tdx,tdy);
    if(td<2.5){a.tap=null;a.moving=false;}
    else{release(a);var tsp=Math.min(td,speedOf(a)*1.2*(a.rampK=Math.min(1,(a.rampK||0)+dt*5),.45+.55*(1-(1-a.rampK)*(1-a.rampK)))*dt),tvx=tdx/td*tsp,tvy=tdy/td*tsp,ok=false;
      if(walkXY(a.x+tvx,a.y)){a.x+=tvx;ok=true;}if(walkXY(a.x,a.y+tvy)){a.y+=tvy;ok=true;}
      if(!ok||(Math.abs(tvx)<.01&&Math.abs(tvy)<.01)){a.tapStuck+=dt;if(a.tapStuck>.35)a.tap=null;}else a.tapStuck=0;
      if(Math.abs(tvx)>.05)a.dir=tvx>0?1:-1;a.mv=true;a.bob+=dt*13;a.moving=true;return;}}
  if(joy.on&&Math.hypot(joy.dx,joy.dy)>2*screenUnit){
    release(a);
    var d=Math.hypot(joy.dx,joy.dy),k=Math.min(1,Math.sqrt(d/(SENS_D[S.sens==null?1:S.sens]*screenUnit))),sp=speedOf(a)*1.2*k*(a.rampK=Math.min(1,(a.rampK||0)+dt*5),.45+.55*(1-(1-a.rampK)*(1-a.rampK)))*dt,vx=joy.dx/d*sp,vy=joy.dy/d*sp;
    var mvd=false;if(walkXY(a.x+vx,a.y)){a.x+=vx;mvd=true;}if(walkXY(a.x,a.y+vy)){a.y+=vy;mvd=true;}
    /* v57: if the hero stands on a spot it may not walk on (e.g. resumed onto a pad edge or a closed tile) it could never move again - hop to the nearest free spot */
    if(!mvd&&!walkXY(a.x,a.y)){a.stuckT=(a.stuckT||0)+dt;if(a.stuckT>.25){a.stuckT=0;unstick(a);}}else a.stuckT=0;
    if(Math.abs(vx)>.05)a.dir=vx>0?1:-1;a.mv=true;a.bob+=dt*13*Math.max(.5,k);a.moving=true;return;}
  a.moving=false;a.rampK=0; /* 2026-10-09: hero eases into a walk over ~0.2 s (rampK); stopping stays instant */
  if(tutNoGather()){release(a);return;}
  /* standing still: chop / fish the nearest thing within reach */
  var mt=tileOf(a),mst=mt?siteOfTile(mt.c,mt.r):null,mto=mt?siteTileObj(mt.c,mt.r):null,inSite=mst&&owned(mst.id)&&mto&&!mto.store&&!mto.pad;
  if(inSite){
    if(a.res&&(!a.res.alive||a.res.by!==a||a.res.s!==mst.id))release(a);
    var roomS=cvLv(mst.id)||mst.kind==='mine'?pn(mst.id)<pcap():bagN(a)<cap();
    if(!a.res){if(!roomS){if(a.lockT<=0){addFloat(a.x,a.y-34,cvLv(mst.id)?'적재칸이 가득! 벨트를 강화해요':'두 손이 가득! 납품하러 가요','#ffb3b3');a.lockT=3;}return;}
      var qb=null,qd=1e9;res.forEach(function(q){if(q.s!==mst.id||!q.alive)return;var d3=Math.hypot(q.x-a.x,q.y-a.y)+(q.by&&q.by!==a?60:0);if(d3<qd){qd=d3;qb=q;}});
      if(!qb)return;if(qb.by&&qb.by!==a)release(qb.by);qb.by=a;a.res=qb;a.prog=0;}
    var sp0=stand(a.res,a);if(Math.hypot(sp0.x-a.x,sp0.y-a.y)>1.5){moveTo(a,sp0.x,sp0.y,dt);a.prog=0;return;}
    a.dir=a.res.x>=a.x?1:-1;progress(a,dt);return;}
  if(a.res&&(!a.res.alive||a.res.by!==a||Math.hypot(a.res.x-a.x,a.res.y-a.y)>48))release(a);
  if(!a.res){
    var best=null,bd=50;
    res.forEach(function(q){if(!q.alive||!owned(q.s)||(q.by&&q.by!==a))return;var d2=Math.hypot(q.x-a.x,(q.y+10-a.y)*1.1);if(d2<bd){bd=d2;best=q;}});
    if(!best)return;
    if(!okFor(a.gear,best)){if(a.lockT<=0){addFloat(a.x,a.y-30,needMsg(best),'#ffe2a8');a.lockT=3;}return;}
    if((cvLv(best.s)||best.k==='ore')?pn(best.s)>=pcap():bagN(a)>=cap()){if(a.lockT<=0){addFloat(a.x,a.y-30,'두 손이 가득! 납품하러 가요','#ffb3b3');a.lockT=3;}return;}
    best.by=a;a.res=best;a.prog=0;
  }
  a.dir=a.res.x>=a.x?1:-1;progress(a,dt);
}
