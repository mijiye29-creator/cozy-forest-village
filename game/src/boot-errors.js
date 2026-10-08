
/* v57: any error while the game starts up is written on the title card (and in settings) so a frozen resume can be diagnosed from a screenshot */
window.__bootErr='';window.addEventListener('error',function(e){var m=(e&&e.message)||'오류';if(!window.__bootErr)window.__bootErr=m+(e&&e.lineno?' @'+e.lineno:'');
  try{var t=document.getElementById('tinfo');if(t){t.hidden=false;t.textContent='⚠️ '+window.__bootErr;t.style.color='#b3263b';}var v=document.querySelector('#setp .sver');if(v)v.textContent='v103 · 오류 '+window.__bootErr.slice(0,70);}catch(_e){}});
