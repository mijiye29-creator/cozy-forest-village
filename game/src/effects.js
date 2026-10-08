/* ---------- effects ---------- */
var floats=[],parts=[],flash=0;
/* v54 (staff 1): raid presentation - a short, small world shake (max ~3px) for roars and hits */
var SHAKE=0,TOWERHIT=0;function shake(a){SHAKE=Math.max(SHAKE,Math.min(1,a));}
function addFloat(x,y,text,col,small){floats.push({x:x,y:y,t:0,text:text,col:col||'#fff',small:small});}
function burst(x,y,col,n,spark){
  for(var i=0;i<n;i++){
    var a=Math.random()*6.283,s=20+Math.random()*50;
    parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-25,g:110,life:.6+Math.random()*.3,max:.9,col:col,r:1.6+Math.random()*1.6,spark:!!spark});
  }
}

