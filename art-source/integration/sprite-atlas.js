/* Drop-in helper for game/src (plain functions, shares the runtime closure like the other modules).
 * Loads game/assets/sprites/atlas.json + *.webp (pre-rendered from art-source/models/*.glb)
 * and draws a frame anchored at the model's feet / ground centre.
 *   spriteReady('hero')                         -> true once the sheet image has loaded
 *   drawSprite(g,'hero','walk',t,x,y,ppu,flip)  -> false when not ready (caller keeps its old Canvas art)
 * ppu = game pixels per model unit (1 unit ≈ 1 m). SPRITE_PPU keeps every model on one world scale. */
var SPRITE_BASE='assets/sprites/',SPRITE_PPU=19,SPRITES={atlas:null,img:{},failed:false};
function spritesLoad(){
  if(SPRITES.atlas||SPRITES.loading)return;SPRITES.loading=true;
  fetch(SPRITE_BASE+'atlas.json').then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(a){
    SPRITES.atlas=a;Object.keys(a).forEach(function(k){var im=new Image();im.decoding='async';im.src=SPRITE_BASE+a[k].file;SPRITES.img[k]=im;});
  }).catch(function(){SPRITES.failed=true;});
}
function spriteReady(name){var im=SPRITES.img[name];return !!(SPRITES.atlas&&SPRITES.atlas[name]&&im&&im.complete&&im.naturalWidth);}
function spriteAnim(m,anim){return m.anims[anim]||m.anims.idle||m.anims.static||m.anims[Object.keys(m.anims)[0]];}
function drawSprite(g,name,anim,t,x,y,ppu,flip,alpha){
  if(!spriteReady(name))return false;
  var m=SPRITES.atlas[name],A=spriteAnim(m,anim),f=0;
  if(A.fps&&!(MOTION3D_REDUCED&&MOTION3D_REDUCED.matches)){f=Math.floor(Math.max(0,t)*A.fps);f=A.loop?f%A.frames:Math.min(A.frames-1,f);}
  var s=(ppu||SPRITE_PPU)/m.ppu,w=m.frameW*s,h=m.frameH*s;
  g.save();if(alpha!==undefined)g.globalAlpha*=alpha;g.translate(x,y);if(flip)g.scale(-1,1);
  g.drawImage(SPRITES.img[name],f*m.frameW,A.row*m.frameH,m.frameW,m.frameH,-m.anchor[0]*s,-m.anchor[1]*s,w,h);
  g.restore();return true;
}
/* Suggested mapping from game roles to model names (art-source/models). */
var SPRITE_ROLE={player:'hero',lumber:'lumberjack',fisher:'fisher',miner:'miner',hunter:'hunter',hunter2:'hunter_blue',hunter3:'hunter_violet',courier:'villager',imk:'shopkeeper'};
function actorSpriteAnim(a){return a.working?'work':((a.mv||a.moving)?'walk':'idle');}
spritesLoad();
