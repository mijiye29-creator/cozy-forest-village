/* v84: hero ultimate - every COMBO_N consecutive attacks unleash a flashy, far stronger blow */
function heroUltFx(pl,b){
  pl.ultFxT=.65;shake(1);flash=Math.max(flash,.6);try{if(navigator.vibrate)navigator.vibrate([40,30,90]);}catch(_e){}
  burst(b.x,b.y-14,'#ffe27a',22,true);burst(b.x,b.y-14,'#ffffff',16,true);burst(b.x,b.y-14,'#ff6a3c',16,true);
  addFloat(pl.x,pl.y-54,'권왕 · 진각파!' ,'#ffe27a');
  for(var ri=0;ri<3;ri++)parts.push({x:b.x,y:b.y-12,vx:0,vy:0,g:0,life:.5+ri*.15,max:.5+ri*.15,col:'#fff1a8',r:4+ri*4,ring:1});
  for(var ui=0;ui<28;ui++)parts.push({x:b.x+(Math.random()-.5)*26,y:b.y-14+(Math.random()-.5)*20,vx:(Math.random()-.5)*240,vy:-60-Math.random()*130,g:140,life:.7+Math.random()*.4,max:1.1,col:'hsl('+Math.floor(Math.random()*60+8)+',95%,62%)',r:2.2+Math.random()*2.2,star:1});
}
/* All martial strikes share the combo counter and area ultimate. */
function heroAttackHit(pl,b,baseDmg,ranged){
  pl.combo=(pl.comboT&&time-pl.comboT<3?(pl.combo||0):0)+1;pl.comboT=time;
  /* The eighth consecutive strike sends a shockwave around the hero. */
  if(pl.combo>=COMBO_N){pl.combo=0;heroUltFx(pl,b);BEARS.slice().forEach(function(ob){if(ob.state==='dead'||ob.state==='out')return;if(ob===b||Math.hypot(ob.x-pl.x,ob.y-pl.y)<=135)hitBear(ob,pl,baseDmg*ULT_MUL,false);});}
  else{hitBear(b,pl,baseDmg,ranged);heroHitFx(pl,b);}
}
function hitBear(b,from,dmg,ranged){
  if(b.state==='dead')return;
  b.hp-=dmg;b.flash=.2;var d=Math.max(1,Math.hypot(b.x-from.x,b.y-from.y));b.kx=(b.x-from.x)/d*(ranged?1.8:4);b.hitT=.5;
  /* v89 (director 2026-10-06: hits need to feel like they hurt) - a pain face, a recoil and now and then a cry; big hits leave it dizzy */
  var bigH=dmg>=b.max*.1;b.hurtT=Math.max(b.hurtT||0,bigH?.6:.42);if(bigH)b.dizzyT=Math.max(b.dizzyT||0,.9);
  if(!b.ouchAt||time-b.ouchAt>1.3){if(bigH||Math.random()<.5){b.ouchAt=time;var OUCH=['아야!','끄앙!','으앙!','아파!'];b.ouchTxt=b.king?'크헉!':OUCH[Math.floor(Math.random()*OUCH.length)];}}
  burst(b.x-(b.x-from.x)/d*8,b.y-12,'#ffffff',4,true);sfx('chop',.08);
  addFloat(b.x,b.y-30-Math.random()*6,'-'+Math.round(dmg),dmg>=15?'#ffe27a':'#ffffff',true);
  if(b.hp<=0)killBear(b);
}
function separateBear(b,pl){
  if(b.state==='dead'||b.state==='fence'||b.climb>0)return;
  var mind=bearR(b)+10,dx=pl.x-b.x,dy=pl.y-b.y,dd=Math.hypot(dx,dy);
  if(dd<mind&&!pl.inside){if(dd<.5){dx=-b.dir;dy=.3;dd=Math.hypot(dx,dy);}var push=mind-dd,ux=dx/dd,uy=dy/dd,
      hx=pl.x+ux*push*.75,hy=pl.y+uy*push*.75;
    if(walkXY(hx,pl.y))pl.x=hx;if(walkXY(pl.x,hy))pl.y=hy;
    if(b.state==='in'||b.state==='attack'||b.state==='out'){b.x-=ux*push*.25;b.y-=uy*push*.25;if(b.entered&&b.x>fenceX()-14)b.x=fenceX()-14;}}
  agents.forEach(function(a){if(a===pl||a.inside||a.role==='player')return;var wx=a.x-b.x,wy=a.y-b.y,wd=Math.hypot(wx,wy),wm=bearR(b)+6;
    if(wd<wm&&wd>.5&&(b.state==='in'||b.state==='attack')){var wp=(wm-wd);b.x-=wx/wd*wp;b.y-=wy/wd*wp;}});
  BEARS.forEach(function(o){if(o===b||o.state==='dead'||o.climb>0)return;var ox=b.x-o.x,oy=b.y-o.y,od=Math.hypot(ox,oy),om=bearR(b)+bearR(o)-4;
    if(od<om){if(od<.5){ox=Math.random()-.5;oy=Math.random()-.5;od=Math.hypot(ox,oy)||1;}var op=(om-od)*.5;
      if(b.state!=='fence'){b.x+=ox/od*op;b.y+=oy/od*op;}else b.x+=(ox/od)*op;if(b.entered&&b.x>fenceX()-14)b.x=fenceX()-14;if(b.entered&&b.x<4)b.x=4;}});
}
function updateBears(dt){
  if(!huntShown&&huntReady()&&!hasWeapon()){huntShown=true;var a0=agents[0];addFloat(a0.x,a0.y-44,'⚔️ 광장에 무기 발판이 생겼어요!','#ffe27a');sfx('chime');}
  /* seasons */
  var w0=winterStart(),prev=S.season||0;S.season=prev+(tutOn()?0:dt);
  if(prev<w0-20&&S.season>=w0-20){var aw=agents[0];addFloat(aw.x,aw.y-46,'⚠️ 곧 북극곰이 습격해요!','#dff4ff');sfx('chime');}
  if(prev<w0&&S.season>=w0){S.winters=(S.winters||0)+1;var nb=bearCap();bearHintT=time+3.5;raidQ=0;raidT=1;FENCEHP=S.fence&&!S.fenceDown?fenceMax():0;VFBREACH={};VFHP={2:fMaxV(2),3:fMaxV(3)};TOWERHP=S.tower&&!S.towerDown?towerMax():0;
    flash=.4;sfx('horn');shake(.7);var aw2=agents[0];addFloat(aw2.x,aw2.y-46,'🐻‍❄️ 곰 습격! 북극곰이 아래에서 몰려와요','#dff4ff');
    if(!STAGEBAN)STAGEBAN={t:1.8,max:1.8,text:'🐻‍❄️ 북극곰 습격!',sub:'망루·사냥꾼이 막아요'};}
  if(S.season>=seasonLen()){S.season=S.season%seasonLen();raidQ=0;VFBREACH={};var aw3=agents[0];addFloat(aw3.x,aw3.y-46,liveBears().length?'🛡️ 새로운 곰은 안 와요 · 남은 곰을 무찔러요':'🛡️ 곰 습격이 끝났어요','#c9f5c0');}
  if(isWinter()){raidT-=dt;var rp=raidP();
    if(rp>=.7&&RUSHMSG!==S.winters){RUSHMSG=S.winters;STAGEBAN={t:2.2,max:2.2,text:'🔥 곰 떼가 몰려와요!',sub:'습격 막바지 · 끝까지 버텨요'};bearBanT=time;shake(.6);flash=Math.max(flash,.3);sfx('horn');}
    if(raidT<=0){raidT=raidGap();var capN=bearCapNow();if(liveBears().length<capN){spawnBear();
      /* closing rush: bears arrive in pairs */
      if(rp>=.7&&Math.random()<.35&&liveBears().length<capN)spawnBear();}}}
  if(!FENCEHP&&S.fence&&!S.fenceDown)FENCEHP=fenceMax();if(isWinter()&&!TOWERHP&&S.tower&&!S.towerDown)TOWERHP=towerMax();
  var pl=agents[0];pl.stabT=(pl.stabT||0)-dt;pl.bowT=(pl.bowT||0)-dt;pl.stab=Math.max(0,(pl.stab||0)-dt);pl.aim=Math.max(0,(pl.aim||0)-dt);pl.ultFxT=Math.max(0,(pl.ultFxT||0)-dt);
  /* v86: holding a finger down on a bear (instead of tapping repeatedly) keeps attacking it - easier for young players */
  if(joy.on&&!joy.moved){var hwx=joy.ox/Z+camX,hwy=joy.oy/Z+camY,hBear=null,hBd=70;BEARS.forEach(function(hbb){if(hbb.state==='dead'||hbb.state==='out')return;var hdd=Math.hypot(hwx-hbb.x,hwy-hbb.y);if(hdd<hBd){hBd=hdd;hBear=hbb;}});
    if(hBear){var hpd=Math.hypot(pl.x-hBear.x,pl.y-hBear.y),hwk=wkind(),hrng=heroReach(hBear);
      pl.chaseBear=hBear;
      if(hwk&&hpd<hrng+45&&(!pl.tapAtkT||time-pl.tapAtkT>=.12)){pl.tapAtkT=time;pl.stabT=0;pl.bowT=0;}}}
  for(var k=BEARS.length-1;k>=0;k--){var b=BEARS[k];b.t+=dt;b.flash=Math.max(0,b.flash-dt);b.hurtT=Math.max(0,(b.hurtT||0)-dt);b.dizzyT=Math.max(0,(b.dizzyT||0)-dt);b.kx*=Math.max(0,1-dt*10);b.hitT-=dt;b.swipe=Math.max(0,b.swipe-dt*3);b.roar=Math.max(0,(b.roar||0)-dt);
    if(b.state==='dead'){if(b.t>1)BEARS.splice(k,1);continue;}
    var sp=(b.king?36:(b.boss?22:28))*BEAR_SPX*(b.spm||1)*dt;
    if(b.climb>0){b.climb-=dt;b.bob+=dt*3;b.swipe=Math.max(b.swipe,.3);}
    if(b.state==='fence'){b.dir=b.side==='right'?-1:1;b.swipeT-=dt;b.bob+=dt*4;
      var fv=b.wallV||villageAt(b.x);if(fv!==1){if(!fenceUp(fv)){b.state='in';}else if(b.swipeT<=0){b.swipeT=fenceHold(fv);b.swipe=1;b.ultSwipe=false;VFHP[fv]=(VFHP[fv]||fMaxV(fv))-(b.king?16:(b.boss?9:5))*1.4*bearStrikeMult()*fenceSoft(fv);sfx('chop',.2);shake(.15);burst(b.x,b.side==='bottom'?H+6:b.y,'#b98f5e',5,false);
        if(VFHP[fv]<=0){VFHP[fv]=0;VFBREACH[fv]=1;flash=.3;shake(.8);sfx('nope');addFloat(b.x,H-40,'💥 '+(fv===2?'호수':'광산')+' 마을 성벽이 뚫렸어요!','#ffb3b3');burst(b.x,H-6,'#b98f5e',20,false);}}}
      else if(!S.fence||S.fenceDown){b.state='in';}
      else if(b.swipeT<=0){b.swipeT=fenceHold(1);b.swipe=1;b.ultSwipe=false;FENCEHP-=(b.king?16:(b.boss?9:5))*1.4*bearStrikeMult()*fenceSoft(1);sfx('chop',.2);shake(b.boss?.3:.15);burst(b.x,b.side==='bottom'?H+6:b.y,'#b98f5e',5,false);
        if(FENCEHP<=0){FENCEHP=0;S.fenceDown=1;flash=.35;shake(1);sfx('nope');addFloat(MX/2,H-40,'💥 울타리가 부서졌어요! 수리해요','#ffb3b3');burst(MX/2,H-6,'#b98f5e',24,false);save();}}}
    else if(b.state==='in'||b.state==='attack'){
      if(!tValid(b.tgt)){var nt=pickTarget(b);if(nt){b.tgt=nt;b.dmg=0;b.state='in';}else b.state='out';}
      if(b.state!=='out'){
      var tp=tPos(b.tgt),dx=tp.x-b.x,dy=tp.y-b.y,d=Math.hypot(dx,dy);
      if(d>(b.tgt.kind==='worker'?bearR(b)+9:16)){b.state='in';if(b.hitT<=0&&!(b.climb>0)){var ny=b.y+dy/d*sp;
          var nx=b.x+dx/d*sp;if(!blockBearAtFence(b,nx,ny)){b.x=nx;b.y=ny;}b.dir=dx>=0?1:-1;b.bob+=dt*9;}}
      else if(blockBearAtFence(b,tp.x,tp.y)){}
      else{b.state='attack';b.dir=dx>=0?1:-1;b.swipeT-=dt;
        if(b.swipeT<=0){b.swipeT=1.3;b.swipe=1;b.ultSwipe=Math.random()<.18;sfx('chop',.2);burst(tp.x,tp.y-10,'#e2566a',4,false);var T0=b.tgt;
          if(T0.kind==='tower'){TOWERHP-=(b.king?18:(b.boss?10:6))*1.4*bearStrikeMult();TOWERHIT=.35;shake(.2);if(TOWERHP<=0){TOWERHP=0;S.towerDown=1;flash=.35;shake(1);sfx('nope');addFloat(TOWER.x,TOWER.y-30,'💥 망루가 무너졌어요! 수리해요','#ffb3b3');burst(TOWER.x,TOWER.y,'#9a938a',24,false);save();}}
          else if(T0.kind==='cash'){var cn=S.cash[T0.k]||0,tk=Math.min(cn,money50(cn*.4*Math.min(1.6,bearMult())));S.cash[T0.k]=cn-tk;b.stole+=tk;if(tk>0)addFloat(tp.x,tp.y-26,'💸 -'+fmt(tk),'#ffb3b3');}
          else{var st0=Math.min(Math.floor(S.coins),money50(Math.min(S.coins*.03,(40+10*(S.winters||1))*bearMult())));S.coins-=st0;b.stole+=st0;if(st0>0)addFloat(tp.x,tp.y-26,'💸 -'+fmt(st0),'#ffb3b3');
            if(T0.kind==='worker'){T0.a.stunT=b.king?7:4;release(T0.a);b.dmg++;if(b.dmg>=2){b.tgt={kind:'none'};}}}
          if(T0.kind==='purse'){b.dmg++;if(b.dmg>=3)b.tgt={kind:'none'};}}}
      if(b.t>40&&b.state!=='out'&&!b.finale){b.state='out';addFloat(b.x,b.y-30,b.stole?'곰이 돈을 들고 돌아가요!':'곰이 돌아가요','#dff4ff');}}}
    else if(b.state==='out'){var ex=b.ex!==undefined?b.ex:b.x,ey=b.ey!==undefined?b.ey:b.homeY+30,odx=ex-b.x,ody=ey-b.y,od=Math.hypot(odx,ody);b.bob+=dt*9;if(Math.abs(odx)>.5)b.dir=odx>0?1:-1;
      if(od<=sp*1.3+1){if(b.stole>0){S.lost++;}BEARS.splice(k,1);continue;}b.x+=odx/od*sp*1.3;b.y+=ody/od*sp*1.3;}
    /* v89 (director 2026-10-06: the hero must not stand inside the bear while fighting) - push the hero out to the bear's edge,
       and keep bears from piling on each other, so every bear and the hero stay readable */
    separateBear(b,pl);
    blockBearAtFence(b,b.x,b.y);
    if(b.x>=0&&b.x<=fenceX()&&b.y>=0&&b.y<H)b.entered=true;
    /* Lim attacks with alternating punches and kicks at every training level. */
    var pd=Math.hypot(pl.x-b.x,pl.y-b.y),wl=wpnLv();
    if(pd<heroReach(b)&&pl.stabT<=0&&b.state!=='dead'){
      pl.strikeN=(pl.strikeN||0)+1;pl.strikeType=pl.strikeN%3===0?'kick':pl.strikeN%3===2?'punch-left':'punch';
      pl.stabT=Math.max(.28,.5-wl*.012);pl.stab=.32;pl.dir=b.x>=pl.x?1:-1;
      heroAttackHit(pl,b,(4+2.5*wl)*heroDmgMul()*(pl.strikeType==='kick'?1.25:1),false);
    }
    /* lumberjacks chip in with their axes */
    agents.forEach(function(a){if(a.role!=='lumber'||b.state==='dead')return;if(Math.hypot(a.x-b.x,a.y-b.y)>30)return;
      a.fightT=(a.fightT||0)-dt;if(a.fightT<=0){a.fightT=.7;hitBear(b,a,.5+.3*tierOf('axe',a.gear.axe||0),false);}});
  }
  for(var j=ARROWS.length-1;j>=0;j--){var ar=ARROWS[j];if(ar.delay>0){ar.delay-=dt;continue;}
    if(ar.tw&&ar.tw!=='arrow'){var tb3=ar.b;if(tb3.state==='dead'||tb3.state==='out'){var nb=null,nd=1e9;liveBears().forEach(function(x){if(x.state==='dead'||x.state==='out')return;var d=Math.hypot(x.x-ar.x,x.y-ar.y);if(d<nd){nd=d;nb=x;}});if(nb)ar.b=tb3=nb;}
      var ex3=tb3.x-ar.x,ey3=tb3.y-8-ar.y,ed3=Math.hypot(ex3,ey3)||1,st3=TSPEED[ar.tw]*dt;if(!ar.d0)ar.d0=ed3+1;ar.t+=dt;ar.ang=Math.atan2(ey3,ex3);ar.k=Math.max(0,Math.min(1,1-ed3/ar.d0));
      if(ar.tw==='rocket'&&Math.random()<.7)parts.push({x:ar.x,y:ar.y-Math.sin(ar.k*Math.PI)*Math.min(30,ar.d0*.12),vx:(Math.random()-.5)*10,vy:-6,g:-10,life:.5,max:.5,col:'rgba(210,210,210,.8)',r:2});
      if(ed3<=st3+2||ar.t>4){if(tb3.state!=='dead'&&tb3.state!=='out'){var R2=TSPLASH[ar.tw];BEARS.forEach(function(b2){if(b2.state==='dead'||b2.state==='out')return;var dd=Math.hypot(b2.x-tb3.x,b2.y-tb3.y);if(b2===tb3||dd<R2)hitBear(b2,{x:ar.x,y:ar.y},ar.dmg*(b2===tb3?1:.6),true);});}
        burst(tb3.x,tb3.y-8,ar.tw==='stone'?'#b9b2a4':'#ffb14a',ar.tw==='stone'?8:16,true);if(ar.tw!=='stone'){burst(tb3.x,tb3.y-8,'#6b6258',8,false);flash=Math.max(flash,.12);}ARROWS.splice(j,1);continue;}
      ar.x+=ex3/ed3*st3;ar.y+=ey3/ed3*st3;continue;}
    var tb=ar.b,ex=tb.x-ar.x,ey=tb.y-14-ar.y,ed=Math.hypot(ex,ey),st2=(ar.gun?620:280)*dt;ar.t+=dt;ar.ang=Math.atan2(ey,ex);
    if(tb.state==='dead'||ar.t>(ar.tw?2.5:1.2)){ARROWS.splice(j,1);continue;}
    if(ed<=st2+2){hitBear(tb,{x:ar.x,y:ar.y},ar.dmg||bowDmg(),true);ARROWS.splice(j,1);continue;}
    ar.x+=ex/ed*st2;ar.y+=ey/ed*st2;}
  for(var i=LOOT.length-1;i>=0;i--){var L=LOOT[i];L.t+=dt;L.life-=dt;
    if(L.z>0||L.vz>0){L.z+=L.vz*dt;L.vz-=260*dt;L.x+=L.vx*dt;L.y+=L.vy*dt;if(L.z<=0){L.z=0;L.vz=0;L.vx=L.vy=0;}}
    else if(L.t>.4&&Math.hypot(pl.x-L.x,pl.y-L.y)<34&&bagN(pl)<cap()){pl.bag[L.id]=(pl.bag[L.id]||0)+1;var tp2=stackTop(pl);fly(L.id,L.x,L.y-6,tp2.x,tp2.y,.3);sfx('pickup',.05);LOOT.splice(i,1);continue;}
    if(L.life<=0)LOOT.splice(i,1);}
}
function drawArrows(){ARROWS.forEach(function(ar){if(ar.delay>0)return;if(ar.tw&&ar.tw!=='arrow'){var hh=Math.sin((ar.k||0)*Math.PI)*Math.min(ar.tw==='rocket'?30:60,(ar.d0||100)*(ar.tw==='rocket'?.12:.25)),yy=ar.y-hh;
    ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(ar.x,ar.y+4,3,1.2,0,0,7);ctx.fill();
    if(ar.tw==='stone'){ctx.fillStyle='#8a8078';ctx.beginPath();blob(ctx,ar.x,yy,3.4);ctx.fill();ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.arc(ar.x-1,yy-1,1.2,0,7);ctx.fill();}
    else if(ar.tw==='rocket'){ctx.save();ctx.translate(ar.x,yy);ctx.rotate(ar.ang||0);ctx.fillStyle='#ff9a3c';ctx.beginPath();ctx.moveTo(-6,-1.6);ctx.lineTo(-10-Math.random()*3,0);ctx.lineTo(-6,1.6);ctx.closePath();ctx.fill();ctx.fillStyle='#e8ecf0';rr(ctx,-6,-1.8,9,3.6,1.5);ctx.fill();ctx.fillStyle='#e2463c';ctx.beginPath();ctx.moveTo(3,-1.8);ctx.lineTo(6,0);ctx.lineTo(3,1.8);ctx.closePath();ctx.fill();ctx.restore();}
    else if(ar.tw==='laser'){ctx.save();ctx.translate(ar.x,yy);ctx.rotate(ar.ang||0);ctx.strokeStyle='rgba(140,245,255,.95)';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(6,0);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(6,0);ctx.stroke();ctx.restore();}
    else if(ar.tw==='plasma'){ctx.fillStyle='rgba(216,120,255,.9)';ctx.beginPath();ctx.arc(ar.x,yy,4,0,7);ctx.fill();ctx.fillStyle='#f0c8ff';ctx.beginPath();ctx.arc(ar.x,yy,1.8,0,7);ctx.fill();}
    else{ctx.fillStyle='#2b2f36';ctx.beginPath();ctx.arc(ar.x,yy,2.8,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(ar.x-.9,yy-.9,.9,0,7);ctx.fill();}
    return;}
  if(ar.gold){ctx.save();ctx.translate(ar.x,ar.y);ctx.rotate(ar.ang||0);ctx.fillStyle='rgba(255,226,122,.45)';ctx.fillRect(-18,-2,18,4);ctx.fillStyle='#ffe27a';ctx.beginPath();ctx.arc(0,0,3,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(.5,0,1.3,0,7);ctx.fill();ctx.restore();return;}
  if(ar.gun){ctx.save();ctx.translate(ar.x,ar.y);ctx.rotate(ar.ang||0);ctx.fillStyle='rgba(255,210,90,.5)';ctx.fillRect(-10,-1,10,2);ctx.fillStyle='#fff6c8';ctx.beginPath();ctx.arc(0,0,1.8,0,7);ctx.fill();ctx.restore();return;}ctx.save();ctx.translate(ar.x,ar.y);ctx.rotate(ar.ang||0);ctx.strokeStyle='#7a5a3c';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(4,0);ctx.stroke();
  if(ar.fire){ctx.fillStyle='rgba(255,140,40,.85)';ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(-6-Math.random()*4,-2.4);ctx.lineTo(-4,0);ctx.lineTo(-6-Math.random()*4,2.4);ctx.closePath();ctx.fill();}
  ctx.fillStyle=ar.hero?'#ffd34a':TOOL_COL[ptier('bow')];ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(2.5,-2);ctx.lineTo(2.5,2);ctx.closePath();ctx.fill();ctx.fillStyle='#f3ead8';ctx.fillRect(-9,-1.8,3,1.2);ctx.fillRect(-9,.6,3,1.2);ctx.restore();});}
/* the thing a bear is chewing on: warning mark + how close it is to losing a level */
function drawBearTargets(){BEARS.forEach(function(b){if(b.state!=='attack'&&b.state!=='in')return;var p=tPos(b.tgt),yy=p.y-(b.tgt.kind==='worker'?36:30),k=Math.max(0,1-b.dmg/BEAR_HIT);
  var bl=Math.floor(time*4)%2===0;ctx.font='700 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';if(bl||b.state==='attack')ctx.fillText('⚠️',p.x,yy-8);
  if(b.state==='attack'||b.dmg>0){ctx.fillStyle='rgba(0,0,0,.35)';rr(ctx,p.x-14,yy,28,4,2);ctx.fill();ctx.fillStyle=k>.4?'#7cc0f5':'#ff8a3c';rr(ctx,p.x-14,yy,Math.max(1.5,28*k),4,2);ctx.fill();ctx.font='700 7px sans-serif';ctx.fillText('🛡️',p.x-19,yy+2);}});}
/* player weapons drawn while fighting */
function drawWpn(g,kind,t,swing,flashOn,ult){
  if(kind==='axe'){g.save();g.rotate(-.5+swing*(ult?2.3:1.6));drawAxe(g,0,-2,0,t,ult?1.18:.95);
    if(!ult&&swing>.05){g.strokeStyle='rgba(255,255,255,'+Math.min(.85,swing*1.1)+')';g.lineWidth=1.8;g.beginPath();g.arc(0,-2,11,-1.9,1.2);g.stroke();}
    if(ult){g.strokeStyle='rgba(255,210,110,.9)';g.lineWidth=2.6;g.beginPath();g.arc(0,-2,12,-2.1,1.6);g.stroke();g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=1.4;g.beginPath();g.arc(0,-2,16,-2.3,1.8);g.stroke();g.fillStyle='rgba(255,170,60,.55)';g.beginPath();g.arc(9,-9,3.2,0,7);g.fill();}
    g.restore();}
  else if(kind==='spear'){var th=swing*8;g.fillStyle='#8a6440';g.fillRect(-10+th,-1,22,2);
    g.fillStyle=TOOL_COL[t];g.beginPath();g.moveTo(18+th,0);g.lineTo(11+th,-3.2);g.lineTo(11+th,3.2);g.closePath();g.fill();g.fillStyle='#e2463c';g.fillRect(9+th,-1.6,2,3.2);
    if(!ult&&th>1){g.strokeStyle='rgba(255,255,255,'+Math.min(.75,th*.12)+')';g.lineWidth=1.6;g.beginPath();g.moveTo(2+th,0);g.lineTo(-6,0);g.stroke();}
    if(ult){g.fillStyle='rgba(255,140,40,.92)';g.beginPath();g.moveTo(18+th,0);g.lineTo(31+th+Math.random()*7,-4);g.lineTo(25+th,0);g.lineTo(31+th+Math.random()*7,4);g.closePath();g.fill();g.fillStyle='rgba(255,220,140,.8)';g.beginPath();g.arc(18+th,0,3.4,0,7);g.fill();}}
  else if(kind==='gun'){g.fillStyle='#7a4d2b';g.beginPath();g.moveTo(-9,-1);g.lineTo(0,-2);g.lineTo(0,2);g.lineTo(-8,4);g.closePath();g.fill();
    g.fillStyle=t>=4?'#e0b23c':'#5d6670';g.fillRect(-1,-2.2,18,2.6);g.fillStyle=t>=4?'#fff3b0':'#9aa5b1';g.fillRect(-1,-2.2,18,.8);
    g.fillStyle='#3a3f45';g.fillRect(2,.2,3,2.6);
    if(flashOn){g.fillStyle='#fff1a8';g.beginPath();for(var i=0;i<8;i++){var an=i/8*6.283,r=i%2?2.5:6;g.lineTo(19+Math.cos(an)*r,-1+Math.sin(an)*r);}g.closePath();g.fill();}
    if(ult){g.fillStyle='rgba(255,120,30,.92)';g.beginPath();g.moveTo(17,-1);g.lineTo(32+Math.random()*9,-4.5);g.lineTo(26,0);g.lineTo(32+Math.random()*9,4.5);g.closePath();g.fill();g.fillStyle='rgba(255,225,150,.85)';g.beginPath();g.arc(17,0,4.4,0,7);g.fill();}}
}
function drawWeapon(a,by){
  if(a.role==='player')return false;
  if(!hasWeapon())return false;var near=bearNear(a,150);if(!near&&!(a.stab>0)&&!(a.aim>0))return false;
  var wk=wkind();ctx.save();ctx.translate(a.x+a.dir*9,a.y-14+by);ctx.scale(a.dir,1);
  drawWpn(ctx,wk,wtier(),wk==='axe'?(a.stab>0?Math.sin(a.stab/.3*Math.PI):0):(a.stab>0?Math.sin(a.stab/.22*Math.PI):0),a.aim>.12,(a.ultFxT||0)>0);
  ctx.restore();return true;
}
/* v66 (director): the weapon is always visible - slung on the hero's back when there is no bear to fight */
function drawWeaponBack(a,by){var wk=wkind();ctx.save();ctx.translate(a.x-a.dir*5,a.y-12+by);ctx.scale(-a.dir*.8,.8);ctx.rotate(wk==='gun'?-.9:-1.1);drawWpn(ctx,wk,wtier(),0,false);ctx.restore();}
/* v66: the hero's outfit grows with the weapon level - red cape (Lv4+), golden pauldrons and plume (Lv8+), golden aura and crown (Lv12+) */
function drawHeroGear(a,by,front){var L=wpnLv(),d=a.dir,x=a.x,y=a.y+by-5.5,g=ctx,sc=a.sc||1;
  if(!front){if(L>=12){var pu=(Math.sin(time*3)+1)/2;g.fillStyle='rgba(255,226,122,'+(.16+.12*pu)+')';g.beginPath();g.arc(x,y-4,17*sc,0,7);g.fill();}
    if(L>=4){var fl=Math.sin(time*5+(a.mv?a.bob:0))*1.6;g.fillStyle=L>=8?'#8a1f2e':'#c8302f';g.beginPath();g.moveTo(x-d*2-5,y-8);g.lineTo(x-d*2+5,y-8);g.quadraticCurveTo(x-d*8,y+4,x-d*12+fl,y+10);g.lineTo(x-d*4,y+9);g.closePath();g.fill();if(L>=8){g.strokeStyle='#e0b23c';g.lineWidth=.8;g.stroke();}}return;}
  if(L>=8){g.fillStyle='#e0b23c';[-1,1].forEach(function(s2){g.beginPath();g.ellipse(x+s2*7,y-5,3.6,2.2,s2*.4,0,7);g.fill();});g.fillStyle='#e2463c';g.beginPath();g.moveTo(x+d*1,y-16);g.quadraticCurveTo(x-d*6,y-22+Math.sin(time*6),x-d*9,y-15);g.lineTo(x,y-14);g.closePath();g.fill();}
  if(L>=12){var cy=y-15.5;g.fillStyle='#f0bb3f';g.fillRect(x-4.5,cy,9,2);for(var cp=-4;cp<=4;cp+=2.6){g.beginPath();g.moveTo(x+cp-1,cy+.5);g.lineTo(x+cp,cy-3.5);g.lineTo(x+cp+1,cy+.5);g.closePath();g.fill();}g.fillStyle='#4fb3a0';g.beginPath();g.arc(x,cy+1,.8,0,7);g.fill();}}
