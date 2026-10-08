/* ---------- sound: tiny synthesized effects + a soft generative tune (Web Audio, no files) ---------- */
var AC=null,SFXG=null,BGMG=null,lastSfx={},bgmNext=0,bgmStep=0;
function audioInit(){
  if(AC){if(AC.state==='suspended')AC.resume();return;}
  try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;return;}
  SFXG=AC.createGain();BGMG=AC.createGain();
  var comp=AC.createDynamicsCompressor();SFXG.connect(comp);BGMG.connect(comp);comp.connect(AC.destination);
  applyVol();bgmNext=AC.currentTime+.3;
}
function applyVol(){if(!AC)return;SFXG.gain.value=S.sfx===0?0:.55;BGMG.gain.value=S.bgm===0?0:.16;}
function tone(f,dur,type,vol,at,f2){
  var o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,at);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,at+dur);
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(vol,at+.008);g.gain.exponentialRampToValueAtTime(.0008,at+dur);
  o.connect(g);g.connect(SFXG);o.start(at);o.stop(at+dur+.02);
}
var NOISE=null;
function noise(dur,vol,freq,at,q,f2,out){
  if(!NOISE){var n=AC.sampleRate*.6|0;NOISE=AC.createBuffer(1,n,AC.sampleRate);var d=NOISE.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;}
  var s=AC.createBufferSource(),bp=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NOISE;bp.type='bandpass';bp.frequency.setValueAtTime(freq,at);bp.Q.value=q||1;
  if(f2)bp.frequency.exponentialRampToValueAtTime(f2,at+dur);
  g.gain.setValueAtTime(vol,at);g.gain.exponentialRampToValueAtTime(.0008,at+dur);
  s.connect(bp);bp.connect(g);g.connect(out||SFXG);s.start(at);s.stop(at+dur+.02);
}
var SFX={
  chop:function(t){noise(.07,.5,900,t,2);tone(150,.09,'triangle',.35,t,90);},
  fell:function(t){noise(.18,.45,500,t,1.2,200);tone(110,.2,'triangle',.3,t+.02,70);tone(660,.12,'sine',.12,t+.08,880);},
  cast:function(t){noise(.12,.18,2400,t,3,900);},
  splash:function(t){noise(.28,.5,1400,t,.9,300);tone(520,.1,'sine',.16,t+.02,780);},
  pickup:function(t){tone(520,.07,'triangle',.22,t);tone(780,.09,'triangle',.2,t+.06);},
  coin:function(t){tone(1320,.08,'square',.09,t);tone(1760,.18,'square',.08,t+.07);},
  cash:function(t){[988,1319,1568,2093].forEach(function(f,i){tone(f,.16,'square',.07,t+i*.06);});noise(.15,.15,5000,t+.2,4);},
  horn:function(t){tone(330,.22,'square',.07,t);tone(415,.22,'square',.06,t);tone(330,.18,'square',.07,t+.28);tone(415,.18,'square',.06,t+.28);},
  build:function(t){[392,494,587,784].forEach(function(f,i){tone(f,.14,'triangle',.2,t+i*.07);});noise(.08,.2,700,t,1.5);},
  tap:function(t){tone(880,.05,'sine',.12,t,660);},
  nope:function(t){tone(180,.12,'square',.07,t,140);tone(150,.14,'square',.06,t+.1,120);},
  chime:function(t){[1047,1319,1568,2093,2637].forEach(function(f,i){tone(f,.35,'sine',.12,t+i*.07);});}
};
function sfx(name,minGap){
  if(!AC||S.sfx===0||!SFX[name])return;
  var now=AC.currentTime;if(lastSfx[name]&&now-lastSfx[name]<(minGap||.05))return;lastSfx[name]=now;SFX[name](now+.005);
}
/* gentle pentatonic music box: melody on a loop, soft bass every bar, darker at night */
var MEL=[0,2,4,7,4,2,4,-1, 9,7,4,2,4,-1,2,0, 0,4,7,9,7,4,2,-1, 4,2,0,-3,0,-1,0,-1];
function btone(f,dur,vol,at,type){var o=AC.createOscillator(),g=AC.createGain();o.type=type||'triangle';o.frequency.value=f;
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(vol,at+.02);g.gain.exponentialRampToValueAtTime(.0008,at+dur);o.connect(g);g.connect(BGMG);o.start(at);o.stop(at+dur+.05);}
function updateMusic(){
  if(!AC||S.bgm===0)return;
  var beat=.42,night=nightAmt(),root=night>.5?220:261.63;
  /* v59: after the app was in the background the audio clock can run ahead of the game - skip the missed notes instead of scheduling hundreds at once (that burst made the game stutter right after coming back) */
  if(bgmNext<AC.currentTime-.1)bgmNext=AC.currentTime+.05;
  while(bgmNext<AC.currentTime+.6){
    var i=bgmStep%MEL.length,n=MEL[i];
    if(n>=0)btone(root*Math.pow(2,n/12),beat*1.8,.5,bgmNext,'triangle');
    if(i%8===0){btone(root/2*Math.pow(2,[0,5,7,5][(i/8)%4]/12),beat*7,.35,bgmNext,'sine');}
    bgmNext+=beat;bgmStep++;
  }
}

