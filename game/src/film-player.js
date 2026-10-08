/* Shared wordless illustration player. Intro loads four frames; ending loads
 * its three frames only on demand. Async loads and timers are cancellable. */
var FILM=null,filmToken=0,filmReduced=window.matchMedia('(prefers-reduced-motion:reduce)');
var filmLayer=0,filmImages=[document.getElementById('introImage'),document.getElementById('introImageNext')];
function filmTimerClear(){if(FILM&&FILM.timer){clearTimeout(FILM.timer);FILM.timer=null;}}
function filmSchedule(delay){filmTimerClear();if(!FILM||!FILM.ready||document.hidden||(FILM.holdLast&&FILM.index===FILM.frames.length-1))return;FILM.remaining=delay===undefined?4500:delay;FILM.deadline=performance.now()+FILM.remaining;FILM.timer=setTimeout(function(){if(FILM){FILM.timer=null;filmStep(1);}},FILM.remaining);}
function filmShow(index){if(!FILM||!FILM.ready)return;filmTimerClear();FILM.index=index;var frame=FILM.frames[index],next=1-filmLayer,incoming=filmImages[next],outgoing=filmImages[filmLayer];
 incoming.classList.remove('drifting');incoming.style.opacity='0';incoming.src=frame.src;incoming.alt=frame.alt;incoming.hidden=false;incoming.setAttribute('aria-hidden','false');outgoing.setAttribute('aria-hidden','true');
 titleEl.style.background=frame.background||'#1a1512';titleEl.classList.toggle('still-film',filmReduced.matches);void incoming.offsetWidth;incoming.style.opacity='1';outgoing.style.opacity='0';if(!filmReduced.matches)incoming.classList.add('drifting');filmLayer=next;
 introBack.hidden=index===0;introSkip.hidden=false;startBtn.textContent=index===FILM.frames.length-1?'▶':'›';startBtn.setAttribute('aria-label',index===FILM.frames.length-1?'장면 마치기':'다음 장면');introSkip.setAttribute('aria-label','장면 건너뛰기');introDots.textContent='';for(var i=0;i<FILM.frames.length;i++){var dot=document.createElement('span');dot.className=i===index?'current':'';introDots.appendChild(dot);}filmSchedule();
}
function filmFinish(){if(!FILM)return;var done=FILM.done,wasTitle=FILM.wasTitle;filmTimerClear();filmToken++;FILM=null;filmImages.forEach(function(im){im.hidden=true;im.classList.remove('drifting');im.style.opacity='0';});titleEl.classList.remove('illustrated','film-paused');TITLE=wasTitle;titleEl.hidden=!TITLE;introBack.hidden=true;introSkip.hidden=true;introDots.textContent='';if(done)done();}
function filmStep(delta){if(!FILM)return;if(!FILM.ready){if(delta>0)filmFinish();return;}var n=FILM.index+delta;if(n<0)return;if(n>=FILM.frames.length){filmFinish();return;}filmShow(n);}
function filmStart(frames,options){if(FILM)filmFinish();options=options||{};var token=++filmToken;FILM={frames:frames,index:0,ready:false,timer:null,done:options.done,holdLast:!!options.holdLast,wasTitle:TITLE};TITLE=true;titleEl.hidden=false;titleEl.classList.add('illustrated');introBack.hidden=true;introSkip.hidden=false;startBtn.textContent='›';introDots.textContent='';
 if(!frames.length){filmFinish();return;}FILM.timer=setTimeout(function(){if(FILM&&token===filmToken)filmFinish();},15000);
 Promise.all(frames.map(function(frame){return new Promise(function(resolve,reject){var im=new Image();im.onload=resolve;im.onerror=reject;im.src=frame.src;});})).then(function(){if(!FILM||token!==filmToken)return;filmTimerClear();FILM.ready=true;filmShow(0);}).catch(function(){if(FILM&&token===filmToken)filmFinish();});
}
function filmVisibility(){if(!FILM)return;titleEl.classList.toggle('film-paused',document.hidden);if(document.hidden){FILM.remaining=Math.max(0,(FILM.deadline||performance.now()+4500)-performance.now());if(FILM.ready)filmTimerClear();}else if(FILM.ready)filmSchedule(FILM.remaining);}
document.addEventListener('visibilitychange',filmVisibility);
if(filmReduced.addEventListener)filmReduced.addEventListener('change',function(){if(FILM&&FILM.ready)filmShow(FILM.index);});
