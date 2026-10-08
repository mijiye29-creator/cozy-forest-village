/* ---------- input: all purchases require standing on the matching world pad ---------- */
var PILLS=[],DEF={},tapFx=null,combatTapUntil=0;
function bearTapTarget(x,y){var found=null,distance=70;BEARS.forEach(function(b){if(b.state==='dead'||b.state==='out')return;var d=Math.hypot(x-b.x,y-b.y);if(d<distance){distance=d;found=b;}});return found;}
function heroCombatBusy(){var a=agents[0];return time<combatTapUntil||a.stab>0||BEARS.some(function(b){return b.state!=='dead'&&b.state!=='out'&&Math.hypot(a.x-b.x,a.y-b.y)<145;});}
function beginBearTap(b){if(!b)return false;cancelControl();var a=agents[0];combatTapUntil=time+.8;a.chaseBear=b;a.chaseT=0;a.tap=null;a.path=[];if(wkind()&&Math.hypot(a.x-b.x,a.y-b.y)<heroReach(b)+45&&(!a.tapAtkT||time-a.tapAtkT>=.12)){a.tapAtkT=time;a.stabT=0;a.bowT=0;sfx('tap');}return true;}
var TOUCHES={},PINCH=null,PINCH_USED=false,CAMERA_HELD=false;
function zoomRange(){return {min:Math.min(W/(W+192),SH/HT),max:ZOOM_IN*1.5};}
function zoomTarget(){var r=zoomRange();return !Number.isFinite(S.manualZoom)?(S.zoomOut?r.min:ZOOM_IN):Math.max(r.min,Math.min(r.max,S.manualZoom));}
function touchPair(){return Object.keys(TOUCHES).slice(0,2).map(function(id){return TOUCHES[id];});}
function registerTouch(e){
  if(e.pointerType!=='touch'||TITLE||(storyBox&&!storyBox.hidden))return false;
  TOUCHES[e.pointerId]=wpt(e);try{cv.setPointerCapture(e.pointerId);}catch(_e){}
  if(Object.keys(TOUCHES).length<2)return PINCH_USED;
  e.preventDefault();if(!PINCH){endJoy();var a=agents[0];a.tap=null;a.path=[];a.chaseBear=null;a.mv=false;a.moving=false;a.padDwell=0;
    var pair=touchPair(),mid={x:(pair[0].x+pair[1].x)/2,y:(pair[0].y+pair[1].y)/2};PINCH={distance:Math.max(1,Math.hypot(pair[0].x-pair[1].x,pair[0].y-pair[1].y)),zoom:Z,x:camX+mid.x/Z,y:camY+mid.y/Z};PINCH_USED=true;CAMERA_HELD=true;}
  return true;
}
function moveTouch(e){
  if(!TOUCHES[e.pointerId])return false;TOUCHES[e.pointerId]=wpt(e);if(!PINCH)return PINCH_USED;
  e.preventDefault();var pair=touchPair();if(pair.length<2)return true;
  var r=zoomRange(),distance=Math.hypot(pair[0].x-pair[1].x,pair[0].y-pair[1].y);Z=Math.max(r.min,Math.min(r.max,PINCH.zoom*distance/PINCH.distance));S.manualZoom=Z;S.zoomOut=Z<=r.min+.02;
  var mx=(pair[0].x+pair[1].x)/2,my=(pair[0].y+pair[1].y)/2;camX=camClampX(PINCH.x-mx/Z);camY=camClampY(PINCH.y-my/Z);return true;
}
function endTouch(e){
  if(!e||!TOUCHES[e.pointerId])return false;delete TOUCHES[e.pointerId];var used=PINCH_USED;
  if(Object.keys(TOUCHES).length<2)PINCH=null;
  if(!Object.keys(TOUCHES).length){PINCH_USED=false;if(used){endJoy();save();}}
  return used;
}
function wpt(e){var b=cv.getBoundingClientRect();return {x:(e.clientX-b.left)/b.width*W,y:(e.clientY-b.top)/b.height*SH};}
function siteAt(x,y){for(var i=0;i<SITES.length;i++){var st=SITES[i];if(x>=st.x&&x<st.x+st.w&&y>=st.y&&y<st.y+st.h)return st;}return null;}
cv.addEventListener('pointerdown',function(e){
  if(registerTouch(e))return;
  if(joy.on||e.isPrimary===false||(e.pointerType==='mouse'&&e.button!==0)||TITLE||(storyBox&&!storyBox.hidden))return;
  e.preventDefault();audioInit();idleT=0;
  if(ENDSEQ){ENDSEQ.t=ENDSEQ.dur[ENDSEQ.scene]||3;return;}
  if(!setP.hidden){setP.hidden=true;gearBtn.setAttribute('aria-expanded','false');}
  if(!dexBox.hidden){dexBox.hidden=true;return;}
  if(!dayBox.hidden){dayBox.hidden=true;return;}
  var p=wpt(e),pw={x:p.x/Z+camX,y:p.y/Z+camY};
  if(beginBearTap(bearTapTarget(pw.x,pw.y))){goalBox.hidden=true;return;}
  var hit=null,hd=1e9;
  PILLS.forEach(function(b){var px=Math.max(4,(40-b.w)/2),py=Math.max(4,(40-b.h)/2);
    if(pw.x>=b.x-px&&pw.x<=b.x+b.w+px&&pw.y>=b.y-py&&pw.y<=b.y+b.h+py){var d=Math.hypot(pw.x-(b.x+b.w/2),pw.y-(b.y+b.h/2));if(d<hd){hd=d;hit=b;}}});
  /* v66: the next-village goals now open from the 🔒 sign by the fence (the header button was removed) */
  var onSign=!hit&&SIGNP&&goalList()&&Math.hypot(pw.x-SIGNP.x,pw.y-SIGNP.y)<26;if(!onSign&&!goalBox.hidden)goalBox.hidden=true;
  if(onSign){goalKey='';refreshGoal();goalBox.style.left='12px';goalBox.style.top='110px';goalBox.hidden=!goalBox.hidden;sfx('tap');return;}
  if(hit){var b=hit;
    if(b.d.isMax())addFloat(pw.x,pw.y-8,'최고 단계예요','#ffffff');
    else if(!b.d.canBuy()){sfx('nope');addFloat(pw.x,pw.y-8,b.d.why?b.d.why():'코인이 부족해요','#ffb3b3');}
    else buy(b.d);
    return;}
  var tapB=null;
  try{cv.setPointerCapture(e.pointerId);}catch(_e){}
  var pl=agents[0];pl.path=[];
  pl.tap=null;if(!tapB)pl.chaseBear=null;
  joy={on:true,ox:p.x,oy:p.y,dx:0,dy:0,id:e.pointerId,t0:performance.now(),moved:false};
});
cv.addEventListener('pointermove',function(e){if(moveTouch(e))return;if(!joy.on||e.pointerId!==joy.id)return;var p=wpt(e);joy.dx=p.x-joy.ox;joy.dy=p.y-joy.oy;if(Math.hypot(joy.dx,joy.dy)>9*screenUnit)joy.moved=true;});
function lineClear(x0,y0,x1,y1){var d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/4);for(var i=1;i<=n;i++){if(!walkXY(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n))return false;}return true;}
function setTap(wx,wy){idleT=0;var a0=agents[0];
  if(!walkXY(wx,wy)){var best=null,bd=1e9;for(var r=4;r<130&&!best;r+=4)for(var k=0;k<16;k++){var an=k/16*6.283,px=wx+Math.cos(an)*r,py=wy+Math.sin(an)*r;if(walkXY(px,py)){var dd=Math.hypot(px-wx,py-wy);if(dd<bd){bd=dd;best={x:px,y:py};}}}if(!best)return;wx=best.x;wy=best.y;}
  a0.tap={x:wx,y:wy};a0.tapStuck=0;a0.path=[];release(a0);
  if(!lineClear(a0.x,a0.y,wx,wy)){var tt=tileAt(wx,wy);if(tt)goTile(a0,tt);}
  sfx('tap');}
function repairFenceAt(x,y){var pad=PADLIST.filter(function(p){return p.perimeter&&(p.d.fix==='fence'||p.d.vfRepair||p.perimeter.floating)&&Math.hypot(p.x-x,p.y-y)<24;})[0];if(!pad)return false;if(pad.d.fix!=='fence'&&!pad.d.vfRepair&&heroCombatBusy())return false;if(Math.hypot(agents[0].x-pad.x,agents[0].y-pad.y)>90){pad.perimeter.armed=true;return false;}if(!padReady(pad)){sfx('nope');addFloat(pad.x,pad.y-26,'코인이 부족해요','#ffb3b3');return true;}var paid=(S.pads&&S.pads[pad.id])||0;S.coins+=paid;if(S.pads)delete S.pads[pad.id];buy(pad.d,true);fencePadAnchor=null;return true;}
function endJoy(e){if(joy.on&&(!e||e.pointerId===joy.id)){if(e&&e.type==='pointerup'&&!joy.moved&&performance.now()-joy.t0<450){var wx=joy.ox/Z+camX,wy=joy.oy/Z+camY;if(!repairFenceAt(wx,wy))setTap(wx,wy);}joy.on=false;joy.dx=joy.dy=0;}}
function endPointer(e){if(!endTouch(e))endJoy(e);}
cv.addEventListener('pointerup',endPointer);cv.addEventListener('pointercancel',endPointer);
cv.addEventListener('lostpointercapture',endPointer);
cv.addEventListener('contextmenu',function(e){e.preventDefault();});
function cancelControl(){
  var touchIds=Object.keys(TOUCHES);TOUCHES={};PINCH=null;PINCH_USED=false;CAMERA_HELD=false;touchIds.forEach(function(id){if(cv.hasPointerCapture(Number(id)))cv.releasePointerCapture(Number(id));});
  var id=joy.id;endJoy();
  if(id!=null&&cv.hasPointerCapture(id))cv.releasePointerCapture(id);
  var a=agents[0];if(a){a.tap=null;a.path=[];a.chaseBear=null;a.moving=false;a.mv=false;a.padDwell=0;}
}
window.addEventListener('blur',cancelControl);
/* Opening controls with another finger cancels the active walking gesture. */
document.addEventListener('pointerdown',function(e){if(e.target!==cv)cancelControl();},{capture:true});
document.addEventListener('pointerdown',function(){audioInit();},{capture:true});
var modeBtn=document.getElementById('mode');
/* v53: joystick sensitivity - how far you drag before the hero reaches full speed (S.sens: 0 slow, 1 normal, 2 fast; older saves default to normal) */
var SENS_D=[32,20,13],SENS_N=['🐢 느리게','🎚️ 보통','🐇 빠르게'],sensBtn=document.getElementById('sensBtn');
function syncSens(){var v=S.sens==null?1:S.sens;sensBtn.textContent=SENS_N[v];}
sensBtn.addEventListener('click',function(){S.sens=((S.sens==null?1:S.sens)+1)%3;syncSens();save();sfx('tap');});
syncSens();
