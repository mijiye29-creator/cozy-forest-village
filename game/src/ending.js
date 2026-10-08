/* v101: finale begins once all three villages are restored and their crews can defend them;
   optional end-state fields keep old saves compatible */
function allMaxed(){
  if((S.stage||1)<3)return false;
  if(siteLv('f1')<3||siteLv('p1')<3||siteLv('m1')<3)return false;
  if((S.shop.wood||0)<4||(S.shop.fish||0)<4)return false;
  if((S.tower||0)<2||(S.fence||0)<2)return false;
  if(((S.vt&&S.vt[2])||0)<2||((S.vf&&S.vf[2])||0)<2)return false;
  if(((S.vt&&S.vt[3])||0)<2||((S.vf&&S.vf[3])||0)<2)return false;
  var roles=['lumber','fisher','hunter','hunter2','hunter3','miner'];
  for(var i=0;i<roles.length;i++){var r=roles[i];if(count(r)<3)return false;if(((S.wlv&&S.wlv[r])||0)<6)return false;}
  if((S.mill||0)<2||(S.smoke||0)<2)return false;
  if((S.smelt||0)<3||(S.elec||0)<3)return false;
  return true;
}
function spawnFinaleBoss(){
  S.finaleSpawned=1;save();
  var fx0=Math.min(MX,fenceX()),ent=bearEntry('top',fx0),hp=350*bearMult();
  var fb={x:ent.x,y:ent.y,side:'top',ex:ent.ex,ey:ent.ey,stole:0,tgt:{kind:'purse'},state:'in',hp:hp,max:hp,boss:true,king:true,finale:true,t:0,flash:0,dir:1,bob:0,kx:0,hitT:0,swipeT:1,dmg:0,swipe:0,climb:0,homeY:HT+16,roar:3,roarMax:3};
  BEARS.push(fb);sfx('horn');flash=.6;shake(1);
  STAGEBAN={t:4,max:4,text:'👑 세 마을의 불빛을 본 대왕곰!',sub:'숲·호수·광산의 사냥꾼이 함께 막아내요'};
  addFloat(MX/2,120,'🐻‍❄️👑 끝판왕 북극곰이 나타났어요!','#ffe27a');
}
function showEnding(){var el=document.getElementById('ending');if(el)el.hidden=false;sfx('chime');flash=.5;shake(.6);}
var finaleT=1;
function updateFinale(dt){finaleT-=dt;if(finaleT>0)return;finaleT=1;if(!S.finaleDone&&!S.finaleSpawned&&allMaxed())spawnFinaleBoss();}
/* v87 (director): a short cinematic slideshow - blizzard, bear invasion, village saved - plays before the trophy screen */
var ENDSEQ=null;
function startEndingCinematic(){ENDSEQ={scene:0,t:0,dur:[3.2,3.4,3.4]};flash=.6;shake(1);}
function updateEndingCinematic(dt){if(!ENDSEQ)return;ENDSEQ.t+=dt;var d=ENDSEQ.dur[ENDSEQ.scene]||3;
  if(ENDSEQ.t>=d){ENDSEQ.scene++;ENDSEQ.t=0;if(ENDSEQ.scene>=ENDSEQ.dur.length){ENDSEQ=null;showEnding();}else{shake(.5);flash=Math.max(flash,.3);sfx('chime');}}}
function drawEndingCinematic(){
  if(!ENDSEQ)return;var g=ctx,sc=ENDSEQ.scene,t=ENDSEQ.t,d=ENDSEQ.dur[sc]||3,capt='';
  g.save();
  if(sc===0){
    var gr=g.createLinearGradient(0,0,0,SH);gr.addColorStop(0,'#1c2b3a');gr.addColorStop(1,'#3d5268');g.fillStyle=gr;g.fillRect(0,0,W,SH);
    g.fillStyle='rgba(255,255,255,.6)';
    for(var i=0;i<54;i++){var sx=(i*53+time*(220+(i%5)*40))%(W+80)-40,sy=(i*37+time*(150+(i%7)*30))%(SH+40)-20;g.fillRect(sx,sy,2,9+(i*7)%9);}
    g.fillStyle='rgba(255,255,255,'+(.08+.06*Math.sin(time*5))+')';g.fillRect(0,0,W,SH);
    capt='❄️ 눈보라가 몰아쳐요...'; /* v87 (staff 4): captions were garbled text - fixed */
  }else if(sc===1){
    var p1=Math.min(1,t/d);
    var gr2=g.createLinearGradient(0,0,0,SH);gr2.addColorStop(0,'#2a1620');gr2.addColorStop(1,'#4a2430');g.fillStyle=gr2;g.fillRect(0,0,W,SH);
    var bx=W+140-(W+300)*p1,by0=SH*.58;
    g.save();g.translate(bx,by0);
    g.fillStyle='rgba(10,8,12,.94)';g.beginPath();g.ellipse(0,20,130,46,0,0,7);g.fill();
    g.beginPath();g.arc(-78,-30,54,0,7);g.fill();
    g.beginPath();g.arc(70,-70,30,0,7);g.fill();
    g.beginPath();g.ellipse(100,-54,16,12,0,0,7);g.fill();
    g.fillStyle='#ff3b4a';g.beginPath();g.arc(104,-58,3,0,7);g.arc(112,-60,3,0,7);g.fill();
    g.restore();
    g.strokeStyle='rgba(255,180,180,.4)';g.lineWidth=2;for(var r=0;r<3;r++){g.beginPath();g.arc(bx+70,by0-60,30+r*18+(time*60)%18,0,7);g.stroke();}
    capt='🐻‍❄️ 거대한 대장곰이 쳐들어와요!';
  }else{
    var gr3=g.createLinearGradient(0,0,0,SH);gr3.addColorStop(0,'#ffd98a');gr3.addColorStop(.55,'#ffb25e');gr3.addColorStop(1,'#6fae55');g.fillStyle=gr3;g.fillRect(0,0,W,SH);
    var vy=SH*.72;g.fillStyle='rgba(60,40,20,.85)';
    [[-170,0],[-70,-18],[40,10],[150,-10]].forEach(function(h){g.beginPath();g.moveTo(W/2+h[0]-34,vy+h[1]);g.lineTo(W/2+h[0],vy+h[1]-40);g.lineTo(W/2+h[0]+34,vy+h[1]);g.closePath();g.fill();g.fillRect(W/2+h[0]-26,vy+h[1],52,34);});
    for(var ci=0;ci<20;ci++){var cx=((ci*83+time*70)%(W+40))-20,cy=vy-60-((ci*47+time*140)%(SH*.5));g.fillStyle=ci%3?'#ffe9a8':'#fff3d0';g.beginPath();g.arc(cx,cy,2+(ci*3)%3,0,7);g.fill();}
    capt='🎉 마을을 지켜냈어요!';
  }
  var capAlpha=Math.min(1,t*2.2)*(t>d-.5?Math.max(0,(d-t)/.5):1);
  g.textAlign='center';g.textBaseline='middle';g.font='900 22px sans-serif';g.lineJoin='round';g.lineWidth=5;
  g.globalAlpha=capAlpha;g.strokeStyle='rgba(20,16,12,.85)';g.strokeText(capt,W/2,SH*.22);g.fillStyle='#fff';g.fillText(capt,W/2,SH*.22);
  g.globalAlpha=Math.min(.7,capAlpha);g.font='600 12px sans-serif';g.fillStyle='rgba(255,255,255,.85)';g.fillText('화면을 누르면 넘어가요',W/2,SH-26);
  g.globalAlpha=1;g.restore();
}
function heroHitFx(pl,b){var ht=heroTier(),n=9+ht*4,hx=b.x-(b.x-pl.x>0?8:-8);burst(hx,b.y-12,ht>=3?'#ffe27a':(ht>=1?'#fff1a8':'#ffffff'),n,true);shake(.22+.06*ht);flash=Math.max(flash,.14+.05*ht);try{if(navigator.vibrate)navigator.vibrate(ht>=2?55:38);}catch(_e){}parts.push({x:hx,y:b.y-12,vx:0,vy:0,g:0,life:.4,max:.4,col:'#ffffff',r:3,ring:1});for(var hfi=0;hfi<6+ht*3;hfi++)parts.push({x:b.x+(Math.random()-.5)*10,y:b.y-10+(Math.random()-.5)*8,vx:(Math.random()-.5)*110,vy:-30-Math.random()*60,g:110,life:.55+Math.random()*.25,max:.8,col:'hsl('+Math.floor(Math.random()*360)+',95%,66%)',r:1.6+Math.random()*1.4,star:1});}
var COMBO_N=8,ULT_MUL=5,HUNT_ULT_P=.22,HUNT_ULT_MUL=5;
