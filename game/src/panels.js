/* stall stock strip: one chip per species, piles shown as small ⛏ count */
var invEl=document.getElementById('inv'),invKey='',invChips={};
function knownItems(){
  var l=[];
  TREES.forEach(function(s,i){if(speciesAvail('forest',i)||ss('wood',s.id)>0||pileTotal(s.id)>0||whN(s.id)>0)l.push(s.id);});
  FISH.forEach(function(s,i){if(speciesAvail('pond',i)||ss('fish',s.id)>0||pileTotal(s.id)>0||whN(s.id)>0)l.push(s.id);});
  GOODS.forEach(function(g){if(recipeOk(g)||whN(g.id)>0)l.push(g.id);});
  BEAR_ITEMS.forEach(function(b){if((S.bears||0)>0||ss(b.line,b.id)>0||whN(b.id)>0)l.push(b.id);});
  return l;
}
function refreshInv(){
  var l=knownItems(),key=l.join(',');
  if(key!==invKey){
    invKey=key;invEl.innerHTML='';invChips={};var last=null;
    l.forEach(function(id){
      var cat=ITEMS[id].cat;
      if(last&&cat!==last){var sp=document.createElement('span');sp.className='sep';invEl.appendChild(sp);}
      last=cat;
      var ch=document.createElement('span');ch.className='chip';ch.title=ITEMS[id].name;
      var icv=document.createElement('canvas');icv.width=44;icv.height=44;
      var g=icv.getContext('2d');g.setTransform(2,0,0,2,0,0);drawItem(g,id,11,11.5,1.2);
      var n=document.createElement('span');ch.appendChild(icv);ch.appendChild(n);invEl.appendChild(ch);invChips[id]={el:ch,n:n};
    });
  }
  l.forEach(function(id){
    var c=invChips[id],goods=ITEMS[id].cat==='goods',shop=goods?0:ss(ITEMS[id].line,id),pile=goods?0:pileTotal(id),w=whN(id);
    c.n.innerHTML=(goods?w:shop)+(pile?'<small>⛏'+pile+'</small>':'')+(!goods&&w?'<small>🏭'+w+'</small>':'');
    c.el.classList.toggle('zero',shop+pile+w===0);c.el.classList.toggle('hot',id===HOT.id);
  });
}
var elCoins=document.getElementById('coins'),m1=document.getElementById('m1'),m2=document.getElementById('m2'),hint=document.getElementById('hint');
function anyPileFull(){return SITES.some(function(st){return owned(st.id)&&pn(st.id)>=pcap()&&!cvLv(st.id);});}
var goalBtn=document.getElementById('goal'),goalBox=document.getElementById('goalList'),goalKey='';
goalBtn.addEventListener('click',function(){audioInit();sfx('tap');var r=goalBtn.getBoundingClientRect();goalBox.style.left=Math.max(6,Math.min(window.innerWidth-236,r.left))+'px';goalBox.style.top=(r.bottom+4)+'px';goalBox.hidden=!goalBox.hidden;goalBtn.setAttribute('aria-expanded',String(!goalBox.hidden));goalKey='';refreshGoal();});
document.addEventListener('pointerdown',function(e){if(!goalBox.hidden&&!goalBox.contains(e.target)&&!goalBtn.contains(e.target)&&e.target!==cv){goalBox.hidden=true;goalBtn.setAttribute('aria-expanded','false');}});
document.getElementById('goalOpen').addEventListener('click',function(e){e.stopPropagation();setP.hidden=true;gearBtn.setAttribute('aria-expanded','false');goalKey='';refreshGoal();if(goalList()){goalBox.style.left='12px';goalBox.style.top='110px';goalBox.hidden=false;}});
function goalVal(q){var cur=Math.min(q[1](),q[2]);return q[3]==='Lv'?'Lv'+cur+' / '+q[2]:(q[3]==='명'?cur+' / '+q[2]+'명':(goalDone(q)?'완료':'설치 필요'));}
/* v50: goal card sits at the top-left of the play area (director spec); hidden while the tutorial runs */
function refreshGoal(){var l=tutOn()?null:goalList();goalBtn.hidden=true;if(!l){goalBox.hidden=true;return;}
  var done=l.filter(goalDone).length,nx=l.filter(function(q){return !goalDone(q);})[0],key=S.stage+':'+l.map(goalVal).join('|')+':'+Math.floor(goalPct()*100);if(key===goalKey)return;goalKey=key;
  goalBtn.querySelector('.gt').innerHTML='';var t1=document.createElement('span');t1.textContent='🚧 '+(S.stage===1?'2단계 호수 마을':'3단계 광산 마을');var t2=document.createElement('b');t2.textContent=done+'/'+l.length+' '+(goalBox.hidden?'▼':'▲');
  goalBtn.querySelector('.gt').append(t1,t2);goalBtn.querySelector('.gb i').style.width=(100*done/l.length)+'%';
  goalBtn.querySelector('.gn').textContent=nx?'다음: '+nx[0]+' '+goalVal(nx):'울타리를 넓히는 중!';
  goalBox.innerHTML='';var hd=document.createElement('div');hd.innerHTML='<span>🚧 '+(S.stage===1?'2단계 호수 마을':'3단계 광산 마을')+' · '+Math.floor(goalPct()*100)+'% / 75%</span><span></span>';goalBox.append(hd);
  l.forEach(function(q){var d=document.createElement('div'),a=document.createElement('span'),b=document.createElement('span');if(goalDone(q))d.className='ok';a.textContent=(goalDone(q)?'✓ ':'')+q[0]+(q[4]&&!goalDone(q)?' (필수)':'');b.textContent=goalVal(q);d.append(a,b);goalBox.append(d);});}
/* which village the player is currently standing in (x position is a reasonable proxy - forest / lake / mine sit side by side) */
function curVillage(){var v=villageAt(agents[0].x);if(v===1)return 'f1';if(v===2)return owned('p1')?'p1':'f1';return owned('m1')?'m1':(owned('p1')?'p1':'f1');}
var VNAME={f1:'🌲 숲속마을',p1:'🌊 호수마을',m1:'⛏️ 광산마을'},VROLE={f1:'lumber',p1:'fisher',m1:'miner'};
document.getElementById('radarCanvas').addEventListener('pointerdown',function(e){if(TITLE||!storyBox.hidden)return;e.preventDefault();e.stopPropagation();cancelControl();S.auto=false;var c=e.currentTarget,r=c.getBoundingClientRect(),p={x:(e.clientX-r.left)/r.width*c.width,y:(e.clientY-r.top)/r.height*c.height};var x=(p.x-6)/(c.width-12)*(fenceX()+224)-112,y=(p.y-6)/(c.height-12)*(HT+160)-80;agents[0].chaseBear=null;setTap(Math.max(8,Math.min(fenceX()-8,x)),Math.max(8,Math.min(H-8,y)));CAMERA_HELD=false;});
function radarPoint(x,y,width,height){
  return {x:6+Math.max(0,Math.min(1,(x+112)/(fenceX()+224)))*(width-12),y:6+Math.max(0,Math.min(1,(y+80)/(HT+160)))*(height-12)};
}
function refreshRaidRadar(lb){
  var box=document.getElementById('raidRadar');box.hidden=TITLE;document.documentElement.classList.toggle('raid-visible',!box.hidden);if(box.hidden)return;
  var c=document.getElementById('radarCanvas'),g=c.getContext('2d'),w=c.width,h=c.height,a=agents[0];g.clearRect(0,0,w,h);g.fillStyle='#e0e7da';g.fillRect(0,0,w,h);
  var start=radarPoint(0,0,w,h),end=radarPoint(fenceX(),H,w,h);g.fillStyle='#f3eddb';g.fillRect(start.x,start.y,end.x-start.x,end.y-start.y);g.strokeStyle='#96886c';g.lineWidth=2;g.beginPath();g.moveTo(start.x,start.y);g.lineTo(start.x,end.y);g.lineTo(end.x,end.y);g.lineTo(end.x,start.y);g.stroke();
  SITES.forEach(function(s){if(!owned(s.id))return;var p=radarPoint(s.x,s.y,w,h),q=radarPoint(s.x+s.w,s.y+s.h,w,h);g.fillStyle=s.kind==='pond'?'#88b3bd':s.kind==='forest'?'#7e9b74':'#aaa18b';g.fillRect(p.x,p.y,q.x-p.x,q.y-p.y);});
  var hero=radarPoint(a.x,a.y,w,h);g.fillStyle='#315e56';g.beginPath();g.arc(hero.x,hero.y,3.4,0,7);g.fill();
  lb.forEach(function(b){var p=radarPoint(b.x,b.y,w,h);g.fillStyle=b.king?'#663149':'#b54e3d';g.beginPath();g.arc(p.x,p.y,b.boss||b.king?4.2:3.2,0,7);g.fill();g.strokeStyle='#fff0d3';g.lineWidth=1;g.stroke();});
  g.fillStyle='#787b68';g.font='10px sans-serif';g.textAlign='center';g.fillText('↑ 북쪽',w/2,12);
  document.getElementById('radarLabel').textContent='마을 지도 · 곰 '+lb.length+'마리';box.setAttribute('aria-label','곰 '+lb.length+'마리 위치 지도 · 초록 점은 주인공');
}
function refreshBearChip(){var el=document.getElementById('bearChip');if(tutOn()||TITLE){el.hidden=true;refreshRaidRadar(liveBears());return;}el.hidden=false;var lb=liveBears(),s,t=function(x){return Math.floor(x/60)+':'+('0'+x%60).slice(-2);};
  if(isWinter()){s=Math.ceil(winterLeft());el.textContent=(lb.length?'🐻‍❄️ ':'🛡️ ')+t(s);el.className=lb.length?'raid':'calm';}
  else{s=Math.ceil(toWinter());el.textContent=(s<=30?'⚠️ ':'🐻‍❄️ ')+t(s);el.className=s<=30?'warn':'';}el.setAttribute('aria-label',(isWinter()?'습격 종료까지 ':'북극곰 습격까지 ')+t(s));refreshRaidRadar(lb);}
/* v74 (staff 2): species book. S.dex[id]=1 once an item has ever been obtained (stall, loading deck, storage, materials, a carried stack or a belt).
   older saves are filled in once from what they hold and what their sites already grow, so nothing is announced on load */
var DEXCAT=[['🌲 나무',TREES.map(function(s){return s.id;})],['🐟 물고기',FISH.map(function(s){return s.id;})],['⛏️ 광석',ORES.map(function(s){return s.id;})],
  ['🏭 가공품',GOODS.map(function(g){return g.id;})],['🐻‍❄️ 곰 전리품',BEAR_ITEMS.map(function(b){return b.id;})]];
var DEXALL=[];DEXCAT.forEach(function(c){DEXALL=DEXALL.concat(c[1]);});
var dexBox=document.getElementById('dexBox'),dexBtn=document.getElementById('dexOpen'),DEXREADY=false,dexKey='',dexNewQ=[];
function dexN(){var n=0;DEXALL.forEach(function(id){if(S.dex&&S.dex[id])n++;});return n;}
function dexHeld(){var h={};function add(o){if(o)for(var k in o)if((o[k]||0)>0)h[k]=1;}
  ['wood','fish','iron'].forEach(function(l){add(S.ss[l]);});for(var k in S.piles)add(S.piles[k]);add(S.wh);add(S.mat);
  agents.forEach(function(a){add(a.bag);});belt.forEach(function(b){h[b.id]=1;});return h;}
function dexInit(){if(S.dex)return;S.dex={};var h=dexHeld();for(var k in h)if(ITEMS[k])S.dex[k]=1;
  if(FRESH)return;
  TREES.forEach(function(s,i){if(!s.rare&&speciesAvail('forest',i))S.dex[s.id]=1;});FISH.forEach(function(s,i){if(!s.rare&&speciesAvail('pond',i))S.dex[s.id]=1;});
  if(owned('m1')){var L=siteLv('m1');SPAWN.ore.slice(0,spCount(L)).forEach(function(i){S.dex[ORES[i].id]=1;});}
  GOODS.forEach(function(g){if((S[LINEPROC[g.line]]||0)>=g.lv&&(g.line!=='elec'||S.smelt))S.dex[g.id]=1;});
  if((S.bears||0)>0){S.dex.meat=1;S.dex.hide=1;}}
function dexScan(){if(!DEXREADY)return;if(!S.dex)S.dex={};var h=dexHeld();
  for(var k in h){if(!ITEMS[k]||S.dex[k]||DEXALL.indexOf(k)<0)continue;S.dex[k]=1;dexNewQ.push(k);}
  if(dexNewQ.length&&!tutOn()){var id=dexNewQ.shift(),a=agents[0],rare=ITEMS[id].sp&&ITEMS[id].sp.rare;
    addFloat(a.x,a.y-50,'📖 도감 등록! '+ITEMS[id].name+' ('+dexN()+'/'+DEXALL.length+')',rare?'#ffe27a':'#c9f5c0');sfx('chime',.6);burst(a.x,a.y-30,'#ffe27a',rare?16:8,true);
    if(dexN()===DEXALL.length){celebrate(a.x,a.y,'📖 도감 완성!',true);}save();}
  else if(tutOn())dexNewQ=[];
  var lab='📖 '+dexN()+'/'+DEXALL.length;if(dexBtn.textContent!==lab)dexBtn.textContent=lab;
  if(!dexBox.hidden)renderDex();}
function dexIcon(id,got){var c=document.createElement('canvas');c.width=56;c.height=56;var g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);
  try{drawItem(g,id,14,15,1.25);}catch(e){}
  if(!got){g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-in';g.fillStyle='rgba(110,92,72,.55)';g.fillRect(0,0,56,56);g.globalCompositeOperation='source-over';}
  return c;}
function renderDex(){var key=DEXALL.map(function(id){return S.dex&&S.dex[id]?1:0;}).join('');if(key===dexKey)return;dexKey=key;
  var n=dexN(),tot=DEXALL.length;dexBox.innerHTML='';
  var hd=document.createElement('div');hd.className='dhd';var t=document.createElement('span');t.textContent='📖 품종 도감 ';var b=document.createElement('b');b.textContent=n+' / '+tot;t.appendChild(b);
  var x=document.createElement('button');x.id='dexClose';x.type='button';x.setAttribute('aria-label','도감 닫기');x.textContent='✕';x.addEventListener('click',function(e){e.stopPropagation();dexBox.hidden=true;sfx('tap');});
  hd.append(t,x);dexBox.appendChild(hd);
  var bar=document.createElement('div');bar.className='dbar';var bi=document.createElement('i');bi.style.width=(100*n/tot)+'%';bar.appendChild(bi);dexBox.appendChild(bar);
  DEXCAT.forEach(function(cat){var have=cat[1].filter(function(id){return S.dex&&S.dex[id];}).length;var sec=document.createElement('div');sec.className='dsec';sec.textContent=cat[0]+' '+have+'/'+cat[1].length;dexBox.appendChild(sec);
    var gr=document.createElement('div');gr.className='dgrid';
    cat[1].forEach(function(id){var got=!!(S.dex&&S.dex[id]),it=ITEMS[id],rare=!!(it.sp&&it.sp.rare),d=document.createElement('div');d.className='dc'+(got?'':' no')+(rare?' rare':'');
      d.appendChild(dexIcon(id,got));var nm=document.createElement('span');nm.textContent=got?it.name:'???';d.appendChild(nm);
      if(rare){var sm=document.createElement('small');sm.textContent='✨ 희귀';d.appendChild(sm);}gr.appendChild(d);});
    dexBox.appendChild(gr);});}
dexBtn.addEventListener('click',function(e){e.stopPropagation();setP.hidden=true;gearBtn.setAttribute('aria-expanded','false');goalBox.hidden=true;dayBox.hidden=true;dexKey='';renderDex();dexBox.hidden=false;sfx('tap');});
/* v75 (staff 2 + 6): today's goals. Every calendar day the village gets three small goals picked from what this save can already do
   (gather, serve customers, buy upgrades, load trucks, drive off bears). Progress = running totals (S.stat) minus the totals when the day began.
   No coin reward yet - the reward size waits for the director's decision; finishing all three keeps a streak (⭐ days in a row). New save field S.daily only. */
var DAYK={gather:['🪓 자원 모으기','개'],serve:['🧑‍🤝‍🧑 손님에게 팔기','명'],buy:['🏗️ 시설·일꾼 강화','번'],truck:['🚚 트럭에 싣기','대'],bear:['🐻‍❄️ 곰 물리치기','마리']};
var dayBox=document.getElementById('dayBox'),dayBtn=document.getElementById('dayOpen'),dayKey='';
function dayStr(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function dayPool(){var st=Math.max(1,S.stage||1),p=[['gather',[150,500,2000][st-1]],['serve',[30,100,400][st-1]],['buy',[4,6,8][st-1]]];
  if(PROCS.some(function(b){return S[b]&&S.pst&&S.pst[b];}))p.push(['truck',[4,15,40][st-1]]);
  if(huntReady()&&(S.tower||0)>0)p.push(['bear',[3,8,20][st-1]]);return p;}
function dayNew(ds){var p=dayPool(),h=0;for(var i=0;i<ds.length;i++)h=(h*31+ds.charCodeAt(i))|0;var r=mulberry(h);
  for(var j=p.length-1;j>0;j--){var x=Math.floor(r()*(j+1)),t=p[j];p[j]=p[x];p[x]=t;}
  var prev=S.daily,streak=prev&&prev.all&&prev.d===dayPrev(ds)?(prev.streak||0):0;
  S.daily={d:ds,g:p.slice(0,3).map(function(o){return {k:o[0],need:o[1],base:(S.stat&&S.stat[o[0]])||0,ok:0};}),all:0,streak:streak};dayKey='';save();}
function dayPrev(ds){var d=new Date(ds+'T12:00:00');d.setDate(d.getDate()-1);return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function dayVal(q){return Math.max(0,((S.stat&&S.stat[q.k])||0)-q.base);}
function dayDoneN(){return S.daily?S.daily.g.filter(function(q){return q.ok;}).length:0;}
function dayTick(){if(tutOn()||TITLE){return;}var ds=dayStr();if(!S.daily||S.daily.d!==ds){var first=!S.daily;dayNew(ds);var a0=agents[0];addFloat(a0.x,a0.y-58,first?'🎯 오늘의 목표 3개가 생겼어요 · ⚙️ 설정에서 봐요':'🎯 새로운 오늘의 목표!','#ffe27a');sfx('chime',.6);}
  var D=S.daily,a=agents[0];D.g.forEach(function(q){if(!q.ok&&dayVal(q)>=q.need){q.ok=1;addFloat(a.x,a.y-58,'🎯 목표 달성! '+DAYK[q.k][0]+' ('+dayDoneN()+'/3)','#c9f5c0');burst(a.x,a.y-30,'#8be99b',12,true);sfx('chime',.4);save();}});
  if(!D.all&&dayDoneN()===3){D.all=1;D.streak=(D.streak||0)+1;celebrate(a.x,a.y,'🎯 오늘의 목표 모두 달성! ⭐'+D.streak+'일 연속',true);save();}
  var lab='🎯 '+dayDoneN()+'/3';if(dayBtn.textContent!==lab)dayBtn.textContent=lab;dayBtn.classList.toggle('done',!!D.all);
  if(!dayBox.hidden)renderDay();}
function renderDay(){var D=S.daily;if(!D){dayBox.innerHTML='<div class="dyh"><span>🎯 오늘의 목표</span></div><div class="dyf">튜토리얼을 마치면 매일 목표 3개가 생겨요</div>';return;}
  var key=D.d+D.g.map(function(q){return Math.min(dayVal(q),q.need);}).join(',')+D.all;if(key===dayKey)return;dayKey=key;dayBox.innerHTML='';
  var hd=document.createElement('div');hd.className='dyh';var t=document.createElement('span');t.textContent='🎯 오늘의 목표 '+dayDoneN()+'/3';
  var x=document.createElement('button');x.id='dayClose';x.type='button';x.setAttribute('aria-label','오늘의 목표 닫기');x.textContent='✕';x.addEventListener('click',function(e){e.stopPropagation();dayBox.hidden=true;sfx('tap');});hd.append(t,x);dayBox.appendChild(hd);
  D.g.forEach(function(q){var v=Math.min(dayVal(q),q.need),r=document.createElement('div');r.className='dyr'+(q.ok?' ok':'');var dt=document.createElement('div');dt.className='dt';var a=document.createElement('span'),b=document.createElement('span');
    a.textContent=(q.ok?'✓ ':'')+DAYK[q.k][0];b.textContent=q.ok?'완료':fmt(v)+' / '+fmt(q.need)+DAYK[q.k][1];dt.append(a,b);var bar=document.createElement('div');bar.className='dyb';var bi=document.createElement('i');bi.style.width=(100*v/q.need)+'%';bar.appendChild(bi);r.append(dt,bar);dayBox.appendChild(r);});
  var f=document.createElement('div');f.className='dyf';f.textContent=(D.all?'오늘 목표를 모두 끝냈어요! ':'자정이 지나면 새 목표로 바뀌어요 · ')+'⭐ 연속 '+(D.streak||0)+'일';dayBox.appendChild(f);}
dayBtn.addEventListener('click',function(e){e.stopPropagation();setP.hidden=true;gearBtn.setAttribute('aria-expanded','false');goalBox.hidden=true;dexBox.hidden=true;dayKey='';renderDay();dayBox.hidden=false;sfx('tap');});
function refreshUI(){
  safe('day',dayTick);
  safe('dex',dexScan);
  safe('staff',refreshStaffBoard);
  /* v67: coins shrink to fit their own column (left third of the header), so they never run into the bear timer in the middle */
  elCoins.textContent=moneyShort(S.coins);elCoins.title=fmt(S.coins)+'원';var cl=elCoins.textContent.length;elCoins.style.fontSize=(cl<=5?24:cl<=7?20:cl<=9?16:cl<=11?13:11)+'px';refreshGoal();refreshBearChip();
  var vid=curVillage();
  m1.textContent='';m1.parentElement.style.visibility='hidden';
  m2.textContent='';
  var tabHas={};
  allDefs.forEach(function(d){
    var u=btns[d.id],hid=d.hidden?d.hidden():false;u.b.hidden=hid;if(hid)return;
    var mx=d.isMax(),c=d.cost(),can=!mx&&d.canBuy();
    if(can)tabHas[d.tab]=1;
    var lv=d.lv();
    u.nm.innerHTML=d.name()+(lv?'<small>'+lv+(mx?' · 최대':'')+'</small>':'');
    u.ds.textContent=mx?'최고 단계예요':d.desc();
    u.cs.textContent=mx?'완료':fmt(c);
    u.b.classList.toggle('max',mx);u.b.classList.toggle('off',!mx&&!can);u.b.disabled=mx;
    var key=d.id+(d.gear?ptier(d.id):'');
    if(u.key!==key){u.key=key;drawIcon(d,u.ic);}
  });
  if(renderWorkers())tabHas.crew=1;
  syncPlayerGear();
  TABS.forEach(function(t){var vis=t.items.some(function(d){return !(d.hidden&&d.hidden());});tabBtns[t.id].hidden=!vis;if(!vis&&activeTab===t.id){activeTab=null;applyTab();}tabBtns[t.id].classList.toggle('has',!!tabHas[t.id]&&activeTab!==t.id);});
  refreshInv();
  modeBtn.textContent=S.auto?'🤖 자동':'🕹️ 수동 조작';
  modeBtn.classList.toggle('auto',S.auto);modeBtn.setAttribute('aria-pressed',S.auto?'true':'false');
  zoomBtn.textContent=S.zoomOut?'\ud83d\udd0d \ud655\ub300 \ubcf4\uae30':'\ud83d\uddfa\ufe0f \uc804\uccb4\ubcf4\uae30';
  var h='';
  h=tutHint();
  if(h){}
  else if(defenseDue())h='⚠️ 곰이 와요! '+(!S.tower?'🗼 망루':'🪵 울타리')+'를 지어요';
  else if(liveBears().length&&time<bearHintT)h='🐻‍❄️ 곰이 돈을 노려요! 잡으면 되찾아요';
  else if(liveBears().length)h='';
  else if(S.fenceDown||S.towerDown)h='🔧 부서진 '+(S.fenceDown?'울타리':'망루')+'를 수리해요';
  else if((S.rep||[]).length)h='곰에게 부서진 곳은 🔧 수리 버튼으로 싸게 되살릴 수 있어요';
  else if(huntReady()&&!S.tower)h='성벽 가운데 망루를 지으면 사냥꾼이 곰을 막아줘요 · 사냥꾼을 강화하면 임꺽정의 권법·발차기도 세져요';
  else if(LOOT.length)h='곰고기는 생선 가게, 곰 가죽은 나무 가게에 납품하면 비싸게 팔려요';
  else if(['mill','smoke'].some(function(b){return S[b]&&!S.pst[b]&&storeN(b)>=storeCap(b);}))h='가공품이 쌓였어요! 작업장 옆 [창고 짓기] 발판으로 가요';
  else if(!h&&anyPileFull())h='적재칸이 가득! 시설 옆 [벨트] 발판으로 가요';

  hint.textContent=h;hint.classList.toggle('hide',!h);
  hint.style.top='46px';
}
var stageEl=document.getElementById('stage'),cwrap=document.getElementById('cwrap');
