/* Shared wordless illustration player. Intro loads four frames; ending loads
 * its three frames only on demand. Async loads and timers are cancellable. */
var FILM=null,filmToken=0,filmReduced=window.matchMedia('(prefers-reduced-motion:reduce)');
var filmLayer=0,filmImages=[document.getElementById('introImage'),document.getElementById('introImageNext')];
function filmTimerClear(){if(FILM&&FILM.timer){clearTimeout(FILM.timer);FILM.timer=null;}}
function filmSchedule(delay){filmTimerClear();if(!FILM||!FILM.ready||FILM.videoPlaying||document.hidden||(FILM.holdLast&&FILM.index===FILM.frames.length-1))return;FILM.remaining=delay===undefined?4500:delay;FILM.deadline=performance.now()+FILM.remaining;FILM.timer=setTimeout(function(){if(FILM){FILM.timer=null;filmStep(1);}},FILM.remaining);}
function filmShow(index){if(!FILM||!FILM.ready||FILM.videoPlaying)return;filmTimerClear();FILM.index=index;var frame=FILM.frames[index],next=1-filmLayer,incoming=filmImages[next],outgoing=filmImages[filmLayer];
 incoming.classList.remove('drifting');incoming.style.opacity='0';incoming.src=frame.src;incoming.alt=frame.alt;incoming.hidden=false;incoming.setAttribute('aria-hidden','false');outgoing.setAttribute('aria-hidden','true');
 titleEl.style.background=frame.background||'#1a1512';titleEl.classList.toggle('still-film',filmReduced.matches);void incoming.offsetWidth;incoming.style.opacity='1';outgoing.style.opacity='0';if(!filmReduced.matches)incoming.classList.add('drifting');filmLayer=next;
 introBack.hidden=index===0;introSkip.hidden=false;startBtn.textContent=index===FILM.frames.length-1?'▶':'›';startBtn.setAttribute('aria-label',index===FILM.frames.length-1?'장면 마치기':'다음 장면');introSkip.setAttribute('aria-label','장면 건너뛰기');introDots.textContent='';for(var i=0;i<FILM.frames.length;i++){var dot=document.createElement('span');dot.className=i===index?'current':'';introDots.appendChild(dot);}filmSchedule();
}
function filmFinish(){if(!FILM)return;var done=FILM.done,wasTitle=FILM.wasTitle;filmVideoStop();filmTimerClear();filmToken++;FILM=null;filmImages.forEach(function(im){im.hidden=true;im.classList.remove('drifting');im.style.opacity='0';});titleEl.classList.remove('illustrated','film-paused');TITLE=wasTitle;titleEl.hidden=!TITLE;introBack.hidden=true;introSkip.hidden=true;introDots.textContent='';if(done)done();}
function filmStep(delta){if(!FILM)return;if(FILM.videoPlaying){if(delta>0)filmFinish();else{filmVideoFallback();filmStep(delta);}return;}if(!FILM.ready){if(delta>0)filmFinish();return;}var n=FILM.index+delta;if(n<0)return;if(n>=FILM.frames.length){filmFinish();return;}filmShow(n);}
function filmStart(frames,options){if(FILM)filmFinish();options=options||{};var token=++filmToken;FILM={frames:frames,index:0,ready:false,timer:null,done:options.done,holdLast:!!options.holdLast,wasTitle:TITLE};TITLE=true;titleEl.hidden=false;titleEl.classList.add('illustrated');introBack.hidden=true;introSkip.hidden=false;startBtn.textContent='›';introDots.textContent='';
 if(!frames.length){filmFinish();return;}FILM.timer=setTimeout(function(){if(FILM&&token===filmToken)filmFinish();},15000);
 Promise.all(frames.map(function(frame){return new Promise(function(resolve,reject){var im=new Image();im.onload=resolve;im.onerror=reject;im.src=frame.src;});})).then(function(){if(!FILM||token!==filmToken)return;filmTimerClear();FILM.ready=true;filmShow(0);filmVideoTry(options.video);}).catch(function(){if(FILM&&token===filmToken)filmFinish();});
}
function filmVisibility(){if(!FILM)return;if(FILM.videoPlaying){if(document.hidden)FILM.video.pause();else FILM.video.play().catch(filmVideoFallback);return;}titleEl.classList.toggle('film-paused',document.hidden);if(document.hidden){FILM.remaining=Math.max(0,(FILM.deadline||performance.now()+4500)-performance.now());if(FILM.ready)filmTimerClear();}else if(FILM.ready)filmSchedule(FILM.remaining);}
document.addEventListener('visibilitychange',filmVisibility);
if(filmReduced.addEventListener)filmReduced.addEventListener('change',function(){if(FILM&&FILM.videoPlaying&&filmReduced.matches)filmVideoFallback();else if(FILM&&FILM.ready)filmShow(FILM.index);});

// Lazy muted video with image fallback. Skip, backgrounding and stale events
// share the same cancellation token as the illustration player.
function filmVideoStop(){if(!FILM||!FILM.video)return;var v=FILM.video;if(FILM.videoTimer)clearTimeout(FILM.videoTimer);FILM.videoTimer=null;FILM.videoPlaying=false;FILM.video=null;v.onplaying=v.onended=v.onerror=v.ontimeupdate=null;v.pause();v.hidden=true;v.removeAttribute('src');v.removeAttribute('poster');v.replaceChildren();v.load();}
function filmVideoFallback(){if(!FILM)return;var i=FILM.index;filmVideoStop();if(FILM.ready)filmShow(i);}
function filmVideoTry(kind){var media=window.STORY_VIDEOS&&window.STORY_VIDEOS[kind],v=document.getElementById('storyVideo');if(!FILM||!media||!v||document.hidden||filmReduced.matches||(window.navigator&&window.navigator.connection&&window.navigator.connection.saveData))return;var token=filmToken;FILM.video=v;v.muted=true;v.playsInline=true;v.poster=media.poster;
 ['webm','mp4'].forEach(function(ext){var source=document.createElement('source');source.src=media[ext];source.type=ext==='webm'?'video/webm':'video/mp4';v.appendChild(source);});
 function current(){return FILM&&token===filmToken&&FILM.video===v;}
 v.onplaying=function(){if(!current())return;if(filmReduced.matches){filmVideoFallback();return;}FILM.videoPlaying=true;filmTimerClear();clearTimeout(FILM.videoTimer);FILM.videoTimer=null;filmImages.forEach(function(im){im.hidden=true;});v.hidden=false;introBack.hidden=true;startBtn.textContent='▶';startBtn.setAttribute('aria-label','영상 건너뛰고 계속하기');if(document.hidden)v.pause();};
 v.ontimeupdate=function(){if(!current()||!FILM.videoPlaying)return;FILM.index=Math.min(FILM.frames.length-1,Math.floor(v.currentTime/4.5));Array.prototype.forEach.call(introDots.children,function(dot,i){dot.className=i===FILM.index?'current':'';});};
 v.onended=function(){if(current())filmFinish();};v.onerror=function(){if(current())filmVideoFallback();};FILM.videoTimer=setTimeout(function(){if(current())filmVideoFallback();},5000);v.load();var promise=v.play();if(promise&&promise.catch)promise.catch(function(){if(current())filmVideoFallback();});
}
var storyVideo=document.getElementById('storyVideo');if(storyVideo)storyVideo.addEventListener('click',filmFinish);
