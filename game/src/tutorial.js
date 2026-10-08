/* ---------- tutorial: six short steps with an arrow on the target ---------- */
var TUT=[
  {t:'화면을 끌어요 · 화살표까지 왕복',at:function(){return (S.tutN||0)<1?TUT_A:{x:HOME.x,y:HOME.y};},done:function(){return (S.tutN||0)>=2;},prog:function(){return Math.min(2,S.tutN||0)+'/2';}},
  {t:'🌲 나무 옆에 서요 · 자동 채집',at:function(){var a=agents[0],best=null,bd=1e9;res.forEach(function(r){if(r.s==='f1'&&r.alive){var d=Math.hypot(r.x-a.x,r.y-a.y);if(d<bd){bd=d;best=r;}}});return best?{x:best.x,y:Math.max(26,best.y-22)}:null;},done:function(){return bagN(agents[0])>=cap();},prog:function(){return Math.min(cap(),bagN(agents[0]))+'/'+cap();}},
  {t:'나무를 가게에 옮겨요',at:function(){return dropPt('wood');},done:function(){return bagN(agents[0])===0&&tutHasDelivery();},prog:function(){return bagN(agents[0])+'개 남음';}},
  {t:'💵 돈더미를 주워요',tt:function(){return (S.cash&&S.cash.wood>0)?'💵 돈더미 주우러 가요':'🧑‍🤝‍🧑 손님이 사는 중 · 곧 돈더미 생겨요';},at:function(){var p=cashPos('wood');return {x:p.x,y:p.y-8};},done:function(){return !!S.h4;}},
  {t:'🪓 [나무꾼 고용]에 서요 · 대신 베어요',at:function(){return padPos(TUTPAD[S.tut]);},done:function(){return S.w.length>0;}},
  {t:'🌲 [숲 키우기]에 서요 · 좋은 나무 등장',at:function(){return padPos(TUTPAD[S.tut]);},done:function(){return siteLv('f1')>=2;}},
  {t:'💪 [나무꾼 강화]에 서요 · 더 빨리 베요',at:function(){return padPos(TUTPAD[S.tut]);},done:function(){return (S.wlv&&S.wlv.lumber||0)>0;}},
  {t:'⚙️ [숲 벨트]에 서요 · 자동 운반',at:function(){return padPos(TUTPAD[S.tut]);},done:function(){return !!S.cv.f1;}},
  {t:'🐻 울타리에 다가가 발판 위에 서요',at:function(){return padPos(TUTPAD[S.tut])||{x:26,y:Math.max(30,Math.min(H-30,agents[0].y))};},done:function(){return S.fence>0;}},
  {t:'🗼 [망루]도 지어요 · 화살 방어',at:function(){return padPos(TUTPAD[S.tut]);},done:function(){return S.tower>0;}}
];
var TUTPAD={4:'hire_lumber',5:'site_f1',6:'wup_lumber',7:'belt_f1',8:'fence',9:'tower'},TUT_A={x:40,y:392};
var TUT_OK=['잘 움직였어요!','가득 찼어요! 납품하러 가요','납품 완료! 손님이 사 가요','돈을 챙겼어요!','첫 일꾼 고용!','숲 레벨 업!','나무꾼 레벨 업!','벨트 설치! 이제 자동으로 팔려요','울타리 완성!','망루 완성!'];
/* each tutorial step allows only its own action: gather only in the gathering step, deliver only in the delivery step, cash only in the cash step */
function tutHasDelivery(){return !!S.tutDelivered||lineStock('wood')>0||!!(S.cash&&S.cash.wood>0)||!!S.h4;}
function tutRecoverDelivery(){if((S.tut===2||S.tut===3)&&bagN(agents[0])===0&&!tutHasDelivery()){S.tut=1;S.tutN=0;save();}}
function tutNoGather(){return tutOn()&&S.tut!==1&&!((S.tut===2||S.tut===3)&&!tutHasDelivery()&&bagN(agents[0])===0);}
function tutAllow(what){if(!tutOn())return true;return {deliver:2,cash:3}[what]===S.tut;}
function tutOn(){return S.tut!=null&&S.tut<TUT.length;}
function tutNext(){var done=S.tut;S.tut++;S.tutN=0;var a=agents[0];
  if(S.tut>=TUT.length){S.coins+=50;S.season=0;celebrate(a.x,a.y,'🎉 튜토리얼 완료!',true);sfx('chime');flash=.45;
    STAGEBAN={t:5,max:5,big:1,text:'🔥 1장 · 불씨를 지키는 숲',sub:'보상 +50 · 눈 아래 푸른 뿌리가 깨어났어요 · 겨울 장작을 모아요'};
    for(var i=0;i<8;i++)coinToHud(a.x+(Math.random()-.5)*20,a.y-20);}
  else{sfx('chime');burst(a.x,a.y-12,'#ffe27a',14,true);STAGEBAN={t:2.6,max:2.6,text:'👍 '+(TUT_OK[done]||'잘했어요!'),sub:'다음: '+TUT[S.tut].t.split(' · ')[0].replace(/[\[\]]/g,'').slice(0,22)};}
  save();}
function updateTut(){if(S.tut==null||S.tut>=TUT.length)return;tutRecoverDelivery();var st=TUT[S.tut];
  if(S.tut===0){var a0=agents[0];if((S.tutN||0)===0&&Math.hypot(a0.x-TUT_A.x,a0.y-TUT_A.y)<20){S.tutN=1;sfx('chime');addFloat(a0.x,a0.y-44,'👍 좋아요! 이제 처음 자리로 돌아와요','#ffe27a');burst(a0.x,a0.y-10,'#ffe27a',10,true);}
    else if(S.tutN===1&&Math.hypot(a0.x-HOME.x,a0.y-HOME.y)<20)S.tutN=2;}
  var pd=TUTPAD[S.tut];if(pd&&DEF[pd]){var need=Math.ceil(DEF[pd].cost()-((S.pads&&S.pads[pd])||0)),gap=need-Math.floor(S.coins);
    if(gap>0){S.coins+=gap;if(S.tutF!==S.tut){S.tutF=S.tut;var a=agents[0];addFloat(a.x,a.y-46,'🎁+'+gap,'#ffe27a',true);for(var i=0;i<Math.min(8,2+Math.ceil(gap/8));i++)coinToHud(a.x+(Math.random()-.5)*16,a.y-20);sfx('coin');}save();}}
  if(st.done())tutNext();}
function tutHint(){if(S.tut==null||S.tut>=TUT.length)return '';var st=TUT[S.tut];return (S.tut+1)+'/'+TUT.length+' '+(st.tt?st.tt():st.t).replace(/ · /g,'\n')+(st.prog?' ('+st.prog()+')':'');}
function guideTarget(){if(tutOn()){var p=TUT[S.tut].at();return p?{x:p.x,y:p.y,col:'232,38,48'}:null;}
  if(defenseDue()){var d=defensePad();if(d)return {x:d.x,y:d.y,col:'232,38,48'};}
  var ih=idleHint();if(ih)return {x:ih.x,y:ih.y,col:'240,187,63'};
  return null;}
function defenseDue(){return huntReady()&&!isWinter()&&toWinter()<70&&(!S.tower||!S.fence)&&!liveBears().length;}
function defensePad(){var t=null,f=null;PADLIST.forEach(function(p){if(p.id==='tower'&&!S.tower)t=p;if(p.id==='fence'&&!S.fence)f=p;});return t||f;}
function drawGuide(){var tg=guideTarget();if(!tg)return;var a=agents[0],dx=tg.x-a.x,dy=tg.y-a.y,d=Math.hypot(dx,dy);if(d<34)return;
  var g=ctx,ux=dx/d,uy=dy/d,ph=(time*40)%14;
  g.save();g.lineCap='round';
  for(var t=18+ph;t<d-16;t+=14){var k=Math.min(1,(t-10)/40)*Math.min(1,(d-t)/40);var px=a.x+ux*t,py=a.y+uy*t;g.fillStyle='rgba(255,255,255,'+(.9*k)+')';g.beginPath();g.arc(px,py,4,0,7);g.fill();g.fillStyle='rgba('+tg.col+','+k+')';g.beginPath();g.arc(px,py,2.9,0,7);g.fill();}
  var ax=a.x+ux*28,ay=a.y-6+uy*28,an=Math.atan2(uy,ux),bb=Math.sin(time*8)*2.5;g.translate(ax+ux*bb,ay+uy*bb);g.rotate(an);
  g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.moveTo(12,2);g.lineTo(-4,-8);g.lineTo(0,2);g.lineTo(-4,12);g.closePath();g.fill();
  g.scale(1.25,1.25);g.fillStyle='rgb('+tg.col+')';g.strokeStyle='#fff';g.lineWidth=2.4;g.lineJoin='round';g.beginPath();g.moveTo(11,0);g.lineTo(-5,-10);g.lineTo(-1,0);g.lineTo(-5,10);g.closePath();g.stroke();g.fill();
  g.restore();}
function tutorialEdgePoint(p){var pad=24*screenUnit,x=(p.x-camX)*Z,y=(p.y-camY)*Z;if(x>=pad&&x<=W-pad&&y>=pad&&y<=SH-pad)return null;var dx=x-W/2,dy=y-SH/2,k=Math.min(dx?Math.max(0,W/2-pad)/Math.abs(dx):Infinity,dy?Math.max(0,SH/2-pad)/Math.abs(dy):Infinity);return {x:W/2+dx*k,y:SH/2+dy*k,angle:Math.atan2(dy,dx)};}
function drawTutorialEdge(){if(!tutOn())return;var p=TUT[S.tut].at();if(!p)return;var edge=tutorialEdgePoint(p);if(!edge)return;var g=ctx;g.save();g.translate(edge.x,edge.y);g.rotate(edge.angle);g.fillStyle='#e2463c';g.strokeStyle='#fff';g.lineWidth=2*screenUnit;g.beginPath();g.moveTo(10*screenUnit,0);g.lineTo(-7*screenUnit,-7*screenUnit);g.lineTo(-7*screenUnit,7*screenUnit);g.closePath();g.stroke();g.fill();g.restore();}
function drawTutArrow(){
  if(S.tut==null||S.tut>=TUT.length)return;var p=TUT[S.tut].at();if(!p)return;var g=ctx,b=Math.sin(time*6)*4;
  g.fillStyle='rgba(255,226,122,.35)';g.beginPath();g.ellipse(p.x,p.y+14,14+Math.sin(time*6)*2,5,0,0,7);g.fill();
  g.save();g.translate(p.x,p.y-8+b);g.fillStyle='#e2463c';g.strokeStyle='#fff';g.lineWidth=2;
  g.beginPath();g.moveTo(-5,-14);g.lineTo(5,-14);g.lineTo(5,-4);g.lineTo(10,-4);g.lineTo(0,6);g.lineTo(-10,-4);g.lineTo(-5,-4);g.closePath();g.stroke();g.fill();g.restore();
}

