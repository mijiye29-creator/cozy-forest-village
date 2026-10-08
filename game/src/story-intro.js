/* v53: title screen - the world is drawn behind it but nothing runs until the player taps start */
var TITLE=true,titleEl=document.getElementById('title'),startBtn=document.getElementById('startBtn');
var introFrames=Array.isArray(window.INTRO_SCENES)?window.INTRO_SCENES:[];
var introImage=document.getElementById('introImage'),introBack=document.getElementById('introBack'),introSkip=document.getElementById('introSkip'),introDots=document.getElementById('introDots');
function enterBookWorld(){TITLE=false;titleEl.hidden=true;document.getElementById('quickDock').hidden=false;last=performance.now();sfx('chime');firstTownStory();}
function introLoad(){if(FRESH&&introFrames.length===4)filmStart(introFrames,{holdLast:true,done:enterBookWorld});}
introBack.addEventListener('click',function(){filmStep(-1);});
introSkip.addEventListener('click',filmFinish);
filmImages.forEach(function(im){im.addEventListener('click',function(){filmStep(1);});});
if(!FRESH)startBtn.setAttribute('aria-label','저장한 게임 이어하기');
introLoad();
/* Story scenes are short, replayable town prologues. Seen flags are save-local and optional for old saves. */
var STORY_SCENES=[
 {id:1,title:'1장 · 숲속마을 — 불씨를 지키는 숲',headline:'마지막 불씨와 파란 뿌리',land:'🌲',cloud:'❄️',lines:[
  {who:'이야기꾼',face:'📜',text:'부모님과 침대에서 책을 읽던 남자아이가 반짝이는 책장 속으로 들어왔어요. 눈앞에는 책에서 보던 겨울 숲이 펼쳐졌지요.'},
  {who:'나무꾼 모모',face:'🪓',text:'장작은 필요하지만 나무를 베기만 하면 숲이 더 아파져요. 묘목도 함께 심어야 해요.'},
  {who:'남자아이',face:'🧒',text:'책 속에서 본 파란 뿌리가 여기에도 있어요! 저는 이 숲에 온 아이예요. 부모님께 돌아갈 길을 찾는 동안 마을을 도울게요.'},
  {who:'나무꾼 모모',face:'🪓',text:'숲을 다시 숨 쉬게 해줘요. 그러면 눈 녹은 물길도 어딘가로 이어질 거예요.'}
 ]},
 {id:2,title:'2장 · 호수마을 — 얼음 아래의 물길',headline:'얼음 밑에서 들려온 물소리',land:'🌊',cloud:'❄️',lines:[
  {who:'낚시꾼 여울',face:'🎣',text:'호수는 꽁꽁 얼었는데, 얼음 아래에서 물 흐르는 소리가 들려요.'},
  {who:'나무꾼 모모',face:'🪵',text:'숲에서 가져온 목재로 수문과 다리를 고칠게요. 물길을 다시 열어봐요.'},
  {who:'낚시꾼 여울',face:'🐟',text:'따뜻한 물이 돌아오자 물고기들이 나타났어요! 물은 산 아래에서 흘러오고 있어요.'},
  {who:'남자아이',face:'🧒',text:'책에서 본 별빛 길이 북쪽 산으로 이어져요. 마을을 도우며 따라가면 집으로 돌아갈 단서도 찾을 수 있겠죠?'}
 ]},
 {id:3,title:'3장 · 광산마을 — 산속에서 깨어난 빛',headline:'돌 속에 잠든 별빛',land:'⛏️',cloud:'✨',lines:[
  {who:'광부 단풍',face:'⛏️',text:'이 광맥을 보세요. 호수 얼음 아래에서 본 것과 똑같은 푸른빛이에요.'},
  {who:'제련공 보리',face:'🔥',text:'제련소의 불을 다시 붙이면, 갱도 깊은 곳의 오래된 보일러도 깨울 수 있을 거예요.'},
  {who:'사냥꾼 임꺽정',face:'🥋',text:'세 마을의 등불이 산 너머까지 이어졌어요. 하지만 저 눈보라 속에서 큰 그림자가 다가와요.'},
  {who:'남자아이',face:'🧒',text:'부모님이 읽어주신 이야기처럼 우리도 함께하면 돼요. 이 불빛을 지키고, 산 너머 다음 책장을 찾아가요!'}
 ]}
];
var storyBox=document.getElementById('storyBox'),storyBook=document.getElementById('storyBook'),storyPlayer=document.getElementById('storyPlayer'),storyList=document.getElementById('storyList'),storyMode='auto',storyScene=null,storyLine=0,storyTyping=null,storyTypingText='';
function storySeen(){if(!S.storySeen||typeof S.storySeen!=='object'||Array.isArray(S.storySeen))S.storySeen={};return S.storySeen;}
function storyTypingClear(){if(storyTyping){clearInterval(storyTyping);storyTyping=null;}}
function storyRenderList(){storyList.innerHTML='';var max=Math.min(3,Math.max(1,S.stage||1));STORY_SCENES.forEach(function(sc){var b=document.createElement('button');b.type='button';b.className='storyChapterBtn';b.disabled=sc.id>max;
  var title=document.createElement('b');title.textContent=(sc.id>max?'🔒 ':'📖 ')+sc.title;b.appendChild(title);var sm=document.createElement('small');sm.textContent=sc.id>max?'마을을 열면 이야기를 읽을 수 있어요':(storySeen()[sc.id]?'다시 읽기 · 이야기를 끝내면 읽음 표시':'이야기를 읽어보기');b.appendChild(sm);if(sc.id<=max)b.addEventListener('click',function(){storyStart(sc.id,'book');});storyList.appendChild(b);});storyFilmButtons();}
function storyFilmButtons(){if(typeof filmStart!=='function')return;[['인트로 다시 보기',introFrames,true],['엔딩 다시 보기',Array.isArray(window.ENDING_SCENES)?window.ENDING_SCENES:[],!!S.finaleDone]].forEach(function(row){var b=document.createElement('button');b.type='button';b.className='storyChapterBtn';b.textContent=row[0];b.disabled=!row[2]||!row[1].length;if(!b.disabled)b.addEventListener('click',function(){storyTypingClear();storyBox.hidden=true;cancelControl();filmStart(row[1],{holdLast:row[0].indexOf('인트로')===0,done:function(){storyBox.hidden=false;storyBook.hidden=false;storyPlayer.hidden=true;}});});storyList.appendChild(b);});}
function storyBookOpen(){cancelControl();storyMode='book';storyTypingClear();storyPlayer.hidden=true;storyBook.hidden=false;storyRenderList();storyBox.hidden=false;setP.hidden=true;gearBtn.setAttribute('aria-expanded','false');goalBox.hidden=true;dayBox.hidden=true;dexBox.hidden=true;sfx('tap');}
function storyFinish(mark){storyTypingClear();if(mark&&storyScene)storySeen()[storyScene.id]=1;if(mark)save();if(storyMode==='book'){storyPlayer.hidden=true;storyBook.hidden=false;storyRenderList();}else{storyBox.hidden=true;}sfx('tap');}
function storyCloseNow(){storyTypingClear();storyBox.hidden=true;sfx('tap');}
function storyPaintLine(){if(!storyScene)return;storyTypingClear();var ln=storyScene.lines[storyLine];document.getElementById('storyAvatar').textContent=ln.face;document.getElementById('storySpeakerName').textContent=ln.who;var out=document.getElementById('storyText');storyTypingText=ln.text;out.textContent='';var i=0;storyTyping=setInterval(function(){i++;out.textContent=storyTypingText.slice(0,i);if(i>=storyTypingText.length)storyTypingClear();},22);document.getElementById('storyProgress').textContent='대화 '+(storyLine+1)+' / '+storyScene.lines.length;document.getElementById('storyNext').textContent=storyLine===storyScene.lines.length-1?'이야기 마치기':'다음';}
function storyStart(id,mode){cancelControl();storyScene=STORY_SCENES.filter(function(x){return x.id===id;})[0];if(!storyScene)return;storyMode=mode||'auto';storyLine=0;storyTypingClear();storyBook.hidden=true;storyPlayer.hidden=false;storyBox.hidden=false;
  var art=document.getElementById('storyArt');art.setAttribute('data-scene',String(id));document.getElementById('storyLandscape').textContent=storyScene.land;document.getElementById('storyCloud').textContent=storyScene.cloud;document.getElementById('storyChapter').textContent=storyScene.title;document.getElementById('storyHeadline').textContent=storyScene.headline;document.getElementById('storyKicker').textContent='포근한 숲속 마을 · 이야기 장면';document.getElementById('storySkip').textContent=storyMode==='auto'?'건너뛰기':'목록으로';storyPaintLine();sfx('chime');}
document.getElementById('storyNext').addEventListener('click',function(){if(storyTyping){storyTypingClear();document.getElementById('storyText').textContent=storyTypingText;return;}if(storyLine<storyScene.lines.length-1){storyLine++;storyPaintLine();sfx('tap');}else storyFinish(true);});
document.getElementById('storySkip').addEventListener('click',function(){if(storyMode==='book'){storyTypingClear();storyPlayer.hidden=true;storyBook.hidden=false;storyRenderList();}else storyFinish(true);});
document.getElementById('storyClose').addEventListener('click',storyCloseNow);
storyBox.addEventListener('pointerdown',function(e){e.stopPropagation();});
document.addEventListener('keydown',function(e){if(storyBox.hidden)return;if(e.key==='Escape'){e.preventDefault();storyCloseNow();}else if(e.key==='Enter'||e.key===' '){if(!storyBook.hidden)return;e.preventDefault();document.getElementById('storyNext').click();}});
document.getElementById('storyOpen').addEventListener('click',storyBookOpen);
function firstTownStory(){var v=Math.min(3,Math.max(1,S.stage||1));if(v>1&&!storySeen()[v])storyStart(v,'auto');}
startBtn.addEventListener('click',function(){audioInit();if(FILM){filmStep(1);return;}enterBookWorld();});
var endingEl=document.getElementById('ending'),endBtn=document.getElementById('endBtn');
endBtn.addEventListener('click',function(){startOver();});
var gearBtn=document.getElementById('gear'),setP=document.getElementById('setp');
var ngBtn=document.getElementById('newGame'),ngArm=false;
ngBtn.addEventListener('click',function(){
  if(!ngArm){ngArm=true;ngBtn.classList.add('armed');ngBtn.textContent='한 번 더 누르면 새로 시작';setTimeout(function(){ngArm=false;ngBtn.classList.remove('armed');ngBtn.textContent='🔄 처음부터';},3500);return;}
  startOver();});
gearBtn.addEventListener('click',function(){var open=setP.hidden;setP.hidden=!open;gearBtn.setAttribute('aria-expanded',open?'true':'false');sfx('tap');});
var sfxBtn=document.getElementById('sfxBtn'),bgmBtn=document.getElementById('bgmBtn');
function syncSnd(){sfxBtn.textContent=S.sfx?'🔊':'🔇';sfxBtn.classList.toggle('off',!S.sfx);sfxBtn.setAttribute('aria-pressed',S.sfx?'true':'false');
  bgmBtn.classList.toggle('off',!S.bgm);bgmBtn.setAttribute('aria-pressed',S.bgm?'true':'false');}
sfxBtn.addEventListener('click',function(){audioInit();S.sfx=S.sfx?0:1;applyVol();syncSnd();save();sfx('tap');});
bgmBtn.addEventListener('click',function(){audioInit();S.bgm=S.bgm?0:1;applyVol();if(S.bgm&&AC)bgmNext=AC.currentTime+.1;syncSnd();save();});
syncSnd();
modeBtn.addEventListener('click',function(){S.auto=!S.auto;var p=agents[0];release(p);p.path=[];p.tap=null;joy.on=false;save();refreshUI();});
var zoomBtn=document.getElementById('zoomBtn');
zoomBtn.addEventListener('click',function(){delete S.manualZoom;CAMERA_HELD=false;S.zoomOut=!S.zoomOut;sfx('tap');save();zoomBtn.textContent=S.zoomOut?'\ud83d\udd0d \ud655\ub300 \ubcf4\uae30':'\ud83d\uddfa\ufe0f \uc804\uccb4\ubcf4\uae30';});

