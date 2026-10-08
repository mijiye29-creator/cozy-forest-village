/* ---------- polar bear raids: once the village can hunt (owns a spear or bow) bears come down from the north
   and attack an upgraded building or a worker. enough damage knocks that thing's level down by one.
   fight them with a spear (close) and a bow (range); they drop meat and hide ---------- */
var BEARS=[],LOOT=[],ARROWS=[],bearT=40,huntShown=false,raidQ=0,raidT=0,bearHintT=0,bearBanT=-99;
function hasWeapon(){return true;}
function huntReady(){return !tutOn()||S.tut>=7||(S.winters||0)>=1||siteScore()>=3||S.tower>0;}
function bearsOn(){return isWinter();}
function bearInterval(){return 80+Math.random()*30;}
function liveBears(){return BEARS.filter(function(b){return b.state!=='dead';});}
function bearNear(a,d){var best=null,bd=d;BEARS.forEach(function(b){if(b.state==='dead'||b.state==='out')return;var dd=Math.hypot(b.x-a.x,b.y-a.y);if(dd<bd){bd=dd;best=b;}});return best;}
function spearDmg(){return (4+2.3*wpnLv())*heroDmgMul();}
function bowDmg(){return (7+2.7*wpnLv())*heroDmgMul();}
var BEAR_HIT=24;
/* things a bear can go after */
function bearTargets(){
  var l=[];
  agents.forEach(function(a){if(a.role!=='player'&&!a.inside)l.push({kind:'worker',a:a,w:1.2});});
  cashSpots().forEach(function(o){var n=S.cash[o.k]||0;if(n>=5)l.push({kind:'cash',k:o.k,p:o.p,w:1+Math.min(3,n/80)});});
  if(S.coins>0)l.push({kind:'purse',w:.8});
  return l;
}
/* More advanced chapters toughen bears slightly; player defenses never make bears stronger. */
function bearMult(){return 1+.35*Math.max(0,(S.stage||1)-1);}
function bearStrikeMult(){return 1.18+.18*Math.max(0,(S.stage||1)-1);}
/* v63 (director 2026-10-04): once the mine village opens, bears come more often, more of them at once, and a fierce black King Bear shows up */
function bearCap(){var s3=(S.stage||1)>=3;return Math.min(s3?10:7,3+Math.floor((S.winters||1)/2)+(s3?2:0));}
/* v89 (director 2026-10-06: raids should start slow and end in a frantic rush) - 0 at the start of a raid, 1 at its end */
function raidP(){if(!isWinter())return 0;return Math.max(0,Math.min(1,((S.season||0)-winterStart())/Math.max(1,raidLen())));}
/* how many bears may be in at once right now: a few at first, the full cap by mid-raid, +2 extra in the closing rush */
function bearCapNow(){var p=raidP(),c=bearCap();return Math.max(1,Math.round(c*(.5+.7*Math.min(1,p/.7))))+(p>=.7?2:0);}
/* Earlier pressure still ramps into a closing rush, with a bounded spawn rate. */
function raidGap(){var p=raidP(),base=(Math.max(3,6.5-.3*(S.winters||1))+Math.random()*2)*((S.stage||1)>=3?.6:1);return Math.max(.8,base*(1.55-1.2*Math.pow(p,.85)));}
var RUSHMSG=0;
/* v89: a bear's on-body radius (boss/king are drawn bigger) - used to keep the hero, workers and other bears from standing inside it */
function bearR(b){return 15*(b.king?1.6:(b.boss?1.35:1));}
function tPos(t){
  if(t.kind==='worker')return {x:t.a.x,y:t.a.y};
  if(t.kind==='none')return {x:HOME.x,y:HOME.y};
  if(t.kind==='cash')return {x:t.p.x,y:t.p.y};
  if(t.kind==='purse')return {x:HOME.x,y:HOME.y};
  if(t.kind==='tower')return {x:TOWER.x,y:TOWER.y+76};
  if(t.kind==='plot')return {x:t.pl.x+t.pl.w/2,y:t.pl.y+t.pl.h-8};
  if(t.kind==='shop')return {x:STALL[t.line].x-10,y:STALL[t.line].y+20};
  var p=pilePos(t.sid);return {x:p.x,y:p.y+8};
}
function tValid(t){if(t.kind==='none')return false;if(t.kind==='worker')return agents.indexOf(t.a)>=0;if(t.kind==='cash')return (S.cash[t.k]||0)>0;if(t.kind==='purse')return S.coins>1;if(t.kind==='tower')return S.tower>0&&!S.towerDown;if(t.kind==='plot')return t.pl.built();if(t.kind==='belt')return cvLv(t.sid)>0;return true;}
function tName(t){if(t.kind==='worker')return t.a.gear.name||'일꾼';if(t.kind==='cash')return '돈 더미';if(t.kind==='purse')return '마을 금고';if(t.kind==='tower')return '망루';if(t.kind==='plot')return t.pl.name;if(t.kind==='shop')return SHOPDEF[t.line].name;return SITE[t.sid].name+' 벨트';}
function pickTarget(b){if(S.tower>0&&!S.towerDown&&(!b||!b.didTower)&&Math.random()<.45){if(b)b.didTower=1;return {kind:'tower',w:1};}var l=bearTargets();if(!l.length)return null;var sum=0;l.forEach(function(t){sum+=t.w;});var r=Math.random()*sum;for(var i=0;i<l.length;i++){r-=l[i].w;if(r<=0)return l[i];}return l[l.length-1];}
var BEAR_HPX=3.25,BEAR_SPX=1.3;
function pickBearSide(){var r=Math.random();return r<.4?'bottom':(r<.6?'left':(r<.82?'right':'top'));}
function bearEntry(side,fx0){var yy=80+Math.random()*(H-140);
  if(side==='left')return {x:-24,y:yy,ex:-40,ey:yy};
  if(side==='right')return {x:fx0+24,y:yy,ex:fx0+40,ey:yy};
  if(side==='top'){var tx=20+Math.random()*(fx0-40);return {x:tx,y:WORLD_TOP+6,ex:tx,ey:-40};}
  var bx=20+Math.random()*(fx0-50);return {x:bx,y:HT-10+Math.random()*4,ex:bx,ey:HT+36};}
/* a bear coming over the side palisade has to climb it first - longer behind a higher wall */
function bearClimb(v){return 0;}
function blockBearAtFence(b,nx,ny){
  if(b.entered||b.state==='out'||b.state==='dead')return false;
  var side=b.side||'bottom',fx=fenceX(),v=side==='left'?1:side==='right'?(S.stage||1):villageAt(b.x),r=15*(b.king?1.6:(b.boss?1.35:1)),margin=r+10,bottom=H+r+15;
  if(side==='top'||!fenceUp(v))return false;
  /* This guard also catches crowd separation pushing an exterior bear through a wall. */
  var blocked=side==='left'?nx>=-margin:side==='right'?nx<=fx+margin:ny<=bottom;
  if(!blocked)return false;
  if(side==='left')b.x=-margin;else if(side==='right')b.x=fx+margin;else b.y=bottom;
  if(b.state!=='fence'||b.wallV!==v)b.swipeT=.4;b.wallV=v;b.state='fence';
  if(!b.fenceMsg){b.fenceMsg=1;b.roar=1.1;shake(.3);addFloat(Math.max(18,Math.min(fx-18,b.x)),Math.min(H-25,b.y),'🪵 울타리를 부수려 해요!','#dff4ff');}
  return true;
}
function spawnBear(sideOverride){
  var t=pickTarget();if(!t)return;
  var n=S.bears||0,king=(S.stage||1)>=3&&((n+1)%4===0||Math.random()<.12),boss=!king&&(n+1)%5===0,hp=(18+7*Math.min(n,20))*(king?4.5:(boss?2.5:1))*bearMult(),tp=tPos(t.kind==='tower'?{kind:'purse'}:t);
  /* v77 (director 2026-10-05: bears too weak, and they should come from everywhere, not only from below) - health and movement use BEAR_HPX/BEAR_SPX below,
     and enter from the bottom (through the wall), the left palisade, the right edge of the fog or the market road at the top */
  var side=['left','right','bottom','top'].indexOf(sideOverride)>=0?sideOverride:pickBearSide(),fx0=Math.min(MX,fenceX()),ent=bearEntry(side,fx0);
  var b={x:ent.x,y:ent.y,side:side,ex:ent.ex,ey:ent.ey,stole:0,tgt:t,state:'in',hp:hp*BEAR_HPX,max:hp*BEAR_HPX,boss:boss,t:0,flash:0,dir:side==='right'?-1:1,bob:0,kx:0,hitT:0,swipeT:1,dmg:0,swipe:0,king:king,climb:side==='left'||side==='right'?bearClimb(villageAt(ent.x)):0};
  b.homeY=HT+16;b.spm=.9+.35*raidP();b.roar=king?2:1.3;b.roarMax=b.roar;BEARS.push(b);sfx('horn');flash=king?.4:.2;shake(king?1:(boss?.6:.25));
  var SIDEN={bottom:'아래',left:'왼쪽',right:'오른쪽',top:'위쪽'};
  /* v83 (director 2026-10-05: bears were still hard to spot) - a screen-fixed banner (not world-space) fires every time a bear appears, throttled so a raid wave doesn't spam it */
  if(king){sfx('horn');STAGEBAN={t:2.4,max:2.4,text:'🖤 난폭한 검은 대왕곰!',sub:'체력이 아주 높고 빨라요 · 망루와 사냥꾼을 모아요'};bearBanT=time;}
  else if(time-bearBanT>4.5){bearBanT=time;STAGEBAN={t:2,max:2,text:(boss?'👑 대장 북극곰이 나타났어요!':'🐻‍❄️ 곰이 나타났어요!'),sub:SIDEN[side]+'에서 침입 · 가장자리 화살표를 따라가요'};}
  addFloat(Math.max(60,Math.min(MX-60,b.x)),Math.max(40,Math.min(H-50,b.y-30)),(king?'🖤 검은 대왕곰 침입!':(boss?'👑 대장 북극곰 침입!':'🐻‍❄️ 북극곰 '+SIDEN[side]+'에서 침입!')),king?'#ffb3b3':'#dff4ff');
}
/* the damage lands: one level goes down (never below 1; level-1 things just hold on) */
function degrade(t,b){
  var p=tPos(t),msg='',lost=false;
  if(t.kind==='worker'){var g=t.a.gear,trs=t.a.role==='lumber'?['axe','boots']:['rod','boots'],best=null;
    trs.forEach(function(tr){if((g[tr]||0)>0&&(!best||g[tr]>g[best]))best=tr;});
    if(best){g[best]--;lost=true;t.tr=best;msg=(g.name||'일꾼')+' '+(best==='axe'?'도끼':best==='rod'?'낚싯대':'장화')+' Lv-1';}else msg=(g.name||'일꾼')+' 다쳤어요';}
  else if(t.kind==='plot'){if(S[t.key]>1){S[t.key]--;lost=true;msg=t.pl.name+' Lv-1';}else msg=t.pl.name+' 버텨냈어요';}
  else if(t.kind==='shop'){if(S.shop[t.line]>1){S.shop[t.line]--;lost=true;msg=SHOPDEF[t.line].name+' Lv-1';}else msg=SHOPDEF[t.line].name+' 버텨냈어요';}
  else{if(S.cv[t.sid]>1){S.cv[t.sid]--;lost=true;msg=SITE[t.sid].name+' 벨트 Lv-1';}else msg=SITE[t.sid].name+' 벨트 버텨냈어요';}
  addFloat(p.x,p.y-30,(lost?'💥 ':'🛡️ ')+msg,lost?'#ffb3b3':'#dff4ff');burst(p.x,p.y-10,lost?'#e2566a':'#dff4ff',12,true);
  if(lost){addRepair(t);sfx('nope');flash=.3;}refreshUI();save();
  b.state='out';addFloat(b.x,b.y-34,'크아앙! 곰이 돌아가요','#ffffff');
}
function killBear(b){
  b.state='dead';b.t=0;S.bears=(S.bears||0)+1;stat('bear',1);
  if(b.stole>0){S.coins+=b.stole;addFloat(b.x,b.y-52,'💰+'+fmt(b.stole),'#ffe27a',true);b.stole=0;}
  var str=Math.max(1,(b.max||18)/18),nm=Math.min(16,2+Math.floor(Math.random()*2)+Math.floor(str/2)+(b.boss?3:0)+(b.king?6:0)),nh=Math.min(12,1+Math.floor(str/3)+(Math.random()<.3?1:0)+(b.boss?2:0)),i;
  addSs('fish','meat',nm);addSs('wood','hide',nh);
  for(i=0;i<Math.min(10,nm+nh);i++){var fid=i%2?'hide':'meat',st2=STALL[fid==='meat'?'fish':'wood'];fly(fid,b.x+(Math.random()-.5)*16,b.y-10,st2.x+(Math.random()-.5)*20,st2.y+8,.7+i*.06);}
  var bonus=money50((b.king?420:(b.boss?150:34))*str);S.coins+=bonus;
  for(i=0;i<Math.min(8,2+Math.floor(bonus/40));i++)fly('coin',b.x+(Math.random()-.5)*20,b.y-14,b.x+(Math.random()-.5)*10,b.y-60,.5+i*.05);
  /* v84: every kill gets a real punch - shake, a ring shockwave and extra sparkle, scaled up further for boss/king */
  shake(Math.max(b.king?.8:(b.boss?.55:.4)));flash=Math.max(flash,b.king?.6:(b.boss?.5:.4));
  if(b.king)celebrate(b.x,b.y,'🖤 대왕곰 처치!',true);else if(b.boss)addFloat(b.x,b.y-64,'👑 대장 처치!','#ffe27a');else addFloat(b.x,b.y-64,'💥 처치!','#ffe27a');
  for(var kri=0;kri<(b.king?3:2);kri++)parts.push({x:b.x,y:b.y-12,vx:0,vy:0,g:0,life:.5+kri*.18,max:.5+kri*.18,col:b.king?'#ff6070':'#ffffff',r:5+kri*4,ring:1});
  addFloat(b.x,b.y-40,(b.king?'🖤+':(b.boss?'👑+':'💰+'))+fmt(bonus),'#ffe27a',true);
  addFloat(b.x,b.y-54,'🥩+'+nm+' 🧥+'+nh,'#ffffff',true);
  burst(b.x,b.y-10,'#ffffff',16+(b.king?10:(b.boss?6:4)),true);burst(b.x,b.y-10,'#ffe27a',10+(b.king?8:(b.boss?4:2)),true);sfx('chime');save();
  if(b.finale){S.finaleDone=1;save();startEndingCinematic();}
}
