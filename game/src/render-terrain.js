/* ---------- scene drawing ---------- */
var loadFx={};
function drawGear(g,x,y,r,teeth,ang,col,hub){g.save();g.translate(x,y);g.rotate(ang);g.fillStyle=col;g.beginPath();
  for(var i=0;i<teeth*2;i++){var a=i/(teeth*2)*6.283,rr2=i%2?r:r*.72;g.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2);}g.closePath();g.fill();
  g.fillStyle=hub;g.beginPath();g.arc(0,0,r*.32,0,7);g.fill();g.restore();}
function beltXOf(sid){var k=BPATH['sale_'+sid]?'sale_'+sid:'proc_'+sid;return BPATH[k][0][0];}
function drawLoader(sid){
  var g=ctx,t=SITE[sid].store,x=t.c*T,y=t.r*T,n=pn(sid),L=cvLv(sid),P=tierOfBelt(L),fx=loadFx[sid]||0,bx=beltXOf(sid);
  g.fillStyle='rgba(0,0,0,.16)';g.beginPath();g.ellipse(x+30,y+56,24,4.5,0,0,7);g.fill();
  g.fillStyle=P.dk;rr(g,x+7,y+36,46,20,3);g.fill();g.fillStyle=P.fr;rr(g,x+7,y+35,46,17,3);g.fill();g.fillStyle=P.hi;g.fillRect(x+9,y+35,42,1.2);
  g.fillStyle=P.dk;rr(g,x+8,y+40,13,11,2.5);g.fill();drawGear(g,x+14.5,y+45.5,4.4,7,time*(1.5+L*.9),P.hi,P.dk);
  /* riser: carries goods from the hopper up to the belt at the tile's top edge */
  if(beltOn('proc_'+sid)&&sid==='m1'){g.fillStyle=P.dk;rr(g,bx-6,y+40,12,20,2);g.fill();g.fillStyle='rgba(20,24,30,.75)';rr(g,bx-3.5,y+42,7,16,1.5);g.fill();}
  if(!beltOn('sale_'+sid))return drawLoaderBody();
  g.fillStyle=P.dk;rr(g,bx-6,y,12,30,2);g.fill();g.fillStyle='rgba(20,24,30,.75)';rr(g,bx-3.5,y+2,7,26,1.5);g.fill();
  if(n>0){var ph=(time*(1+L*.4))%1,ids=Object.keys(S.piles[sid]).filter(function(k){return S.piles[sid][k]>0;});
    if(ids.length){g.save();g.beginPath();g.rect(bx-3.5,y+2,7,26);g.clip();drawItem(g,ids[Math.floor(time*2)%ids.length],bx,y+28-ph*26,.5);g.restore();}}
  drawLoaderBody();
  function drawLoaderBody(){
  g.save();g.translate(x+34,y+32);g.scale(.85+.08*fx,.8-.1*fx);
  var gr=g.createLinearGradient(-20,0,20,0);gr.addColorStop(0,P.dk);gr.addColorStop(.35,P.hi);gr.addColorStop(1,P.fr);
  g.fillStyle=gr;g.beginPath();g.moveTo(-20,-11);g.lineTo(20,-11);g.lineTo(9,9);g.lineTo(-9,9);g.closePath();g.fill();
  g.fillStyle='#2f2a26';g.beginPath();g.ellipse(0,-11,18,3.6,0,0,7);g.fill();g.strokeStyle=P.hi;g.lineWidth=1.3;g.beginPath();g.ellipse(0,-11,19,4.2,0,0,7);g.stroke();
  if(n>0){var ids2=Object.keys(S.piles[sid]).filter(function(k){return S.piles[sid][k]>0;}).slice(0,3);ids2.forEach(function(id,i){drawItem(g,id,(i-1)*8,-13-(i===1?2:0),.6);});}
  g.restore();
  for(var i=0;i<Math.min(8,L);i++){g.fillStyle=P.gold?'#fff1a8':'#7be07f';g.beginPath();g.arc(x+44+(i%4)*3.2,y+44+Math.floor(i/4)*3.4,1.2,0,7);g.fill();}
  if(n>0){var lab=n+'개';g.font='800 6.5px sans-serif';g.textAlign='center';g.textBaseline='middle';
    var tw=g.measureText(lab).width+7;g.fillStyle=n>=pcap()?'rgba(226,86,106,.95)':'rgba(34,53,43,.8)';rr(g,x+30-tw/2,y+50,tw,9,4.5);g.fill();g.fillStyle='#fff';g.fillText(lab,x+30,y+54.8);}
  }
}
function drawPile(sid){
  if(cvLv(sid)){drawLoader(sid);return;}
  var p=S.piles[sid]||{},n=pn(sid),pp=pilePos(sid),x=pp.x,y=pp.y,g=ctx,st=SITE[sid],cp=pcap();
  g.save();g.translate(x,y+4);g.scale(1.75,1.75);g.translate(-x,-(y+4));
  g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.ellipse(x,y+4,11,3,0,0,7);g.fill();
  var list=[];Object.keys(p).sort(function(a,b){return ITEMS[a].sp.val-ITEMS[b].sp.val;}).forEach(function(id){for(var i=0;i<p[id];i++)list.push(id);});
  var m=Math.min(n,12),shown=[];for(var i=0;i<m;i++)shown.push(list[Math.floor(i*n/m)]);
  var top;
  if(st.kind==='mine'){
    shown.forEach(function(id,i){var layer=Math.floor(i/4),col=i%4;g.save();g.translate(x-9+col*6+(layer%2)*3,y-layer*3.6);g.scale(.55,.55);drawItem(g,id,0,0,1);g.restore();});
    top=y-Math.floor(Math.max(0,m-1)/4)*3.6-10;
  }else if(st.kind==='forest'){
    if(!n){g.strokeStyle='rgba(120,90,50,.35)';g.setLineDash([2,2]);rr(g,x-10,y-3,20,6,2);g.stroke();g.setLineDash([]);}
    shown.forEach(function(id,i){var layer=Math.floor(i/3),col=i%3,lx=x-7+col*7+(layer%2)*1.5,ly=y-layer*3.4;
      g.fillStyle=ITEMS[id].sp.log;rr(g,lx-3.4,ly-2,6.8,3.4,1.5);g.fill();
      g.fillStyle='rgba(255,236,190,.55)';g.beginPath();g.arc(lx+3,ly-.3,1.3,0,7);g.fill();});
    top=y-Math.floor(Math.max(0,m-1)/3)*3.4-10;
  }else{
    var crates=Math.ceil(m/3);
    if(!n){g.strokeStyle='rgba(120,90,50,.35)';g.setLineDash([2,2]);rr(g,x-10,y-5,20,8,2);g.stroke();g.setLineDash([]);}
    for(var j=0;j<crates;j++){
      var by=y-j*8;
      g.fillStyle='#8e6a42';rr(g,x-10,by-7,20,3,1);g.fill();
      g.fillStyle='#e8f6fb';g.beginPath();g.ellipse(x,by-5.5,8.5,1.8,0,0,7);g.fill();
      for(var k=0;k<3&&j*3+k<m;k++){var fs=ITEMS[shown[j*3+k]].sp;
        g.save();g.translate(x-5.5+k*5.5,by-6.2);g.rotate(-1.35+k*.12);g.scale(.62,.62);fishShape(g,fs.col,false);
        if(fs.id==='koi'){g.fillStyle='#e2463c';g.beginPath();g.arc(-2,-1,1.4,0,7);g.arc(1.2,.8,1.1,0,7);g.fill();}
        g.restore();}
      g.fillStyle='#c79a63';rr(g,x-10.5,by-4.5,21,7,1.6);g.fill();
      g.fillStyle='rgba(255,240,210,.35)';g.fillRect(x-9.5,by-4,19,1);
      g.strokeStyle='rgba(90,60,30,.35)';g.lineWidth=.8;g.beginPath();g.moveTo(x-10,by-1);g.lineTo(x+10,by-1);g.moveTo(x-3.5,by-4.5);g.lineTo(x-3.5,by+2.5);g.moveTo(x+3.5,by-4.5);g.lineTo(x+3.5,by+2.5);g.stroke();
    }
    top=y-Math.max(1,crates)*8-8;
  }
  g.restore();var topS=y+4-(y+4-top)*1.75;
  if(n>0){var full=n>=cp,lab=full?'가득! '+n:n+' / '+cp;g.font='800 9px sans-serif';g.textAlign='center';g.textBaseline='middle';
    var tw=g.measureText(lab).width+12;g.fillStyle=full?'rgba(226,86,106,.95)':'rgba(34,53,43,.82)';rr(g,x-tw/2,topS-8,tw,14,7);g.fill();g.fillStyle='#fff';g.fillText(lab,x,topS-.8);}
}
function grassTufts(g,x,y,w,h,seed,nT,nF){
  for(var i=0;i<nT;i++){
    var tx=x+4+hs(seed+i*3.1,i)*(w-8),ty=y+6+hs(i,seed+7.7)*(h-10),sw2=Math.sin(time*1.6+tx*.1)*1.2;
    g.strokeStyle=i%2?'#93c46f':'#a5d281';g.lineWidth=1.2;g.lineCap='round';
    g.beginPath();g.moveTo(tx-1.5,ty);g.quadraticCurveTo(tx-1.5+sw2*.5,ty-3,tx-2+sw2,ty-5);g.moveTo(tx,ty);g.quadraticCurveTo(tx+sw2*.5,ty-4,tx+sw2,ty-6.5);g.moveTo(tx+1.5,ty);g.quadraticCurveTo(tx+1.5+sw2*.5,ty-3,tx+2+sw2,ty-5);g.stroke();
  }
  for(var f=0;f<nF;f++){
    var fx0=x+8+hs(seed*2+f,3.3)*(w-16),fy0=y+8+hs(f*5.5,seed)*(h-16),fc=['#fff3f6','#ffe08a','#ffb8c8','#ffffff'][f%4];
    g.strokeStyle='#7fae5e';g.lineWidth=1;g.beginPath();g.moveTo(fx0,fy0+4);g.lineTo(fx0,fy0);g.stroke();
    g.fillStyle=fc;g.beginPath();for(var pi=0;pi<5;pi++){var pa=pi*1.2566;blob(g,fx0+Math.cos(pa)*1.7,fy0+Math.sin(pa)*1.7,1.2);}g.fill();
    g.fillStyle='#f0bb3f';g.beginPath();blob(g,fx0,fy0,1);g.fill();
  }
}
var TCACHE={};
function tileImg(key,size,fn,hh){var c=TCACHE[key];if(!c){c=document.createElement('canvas');c.width=Math.ceil(size*RS);c.height=Math.ceil((hh||size)*RS);var g=c.getContext('2d');g.setTransform(RS,0,0,RS,0,0);fn(g);TCACHE[key]=c;}return c;}
function drawForestTile(g,x,y,seed){
  var gg=g.createLinearGradient(x,y,x+T,y+T);gg.addColorStop(0,'#f7fbfc');gg.addColorStop(.58,'#e4edf2');gg.addColorStop(1,'#d3e2ea');
  g.fillStyle=gg;g.fillRect(x,y,T,T);
  g.fillStyle='rgba(101,145,170,.11)';g.beginPath();g.ellipse(x+34,y+22,22,11,.3,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.72)';g.beginPath();g.ellipse(x+17,y+47,22,5,-.14,0,7);g.ellipse(x+48,y+12,20,4,.08,0,7);g.fill();
  var mx2=x+10+hs(seed,4)*40,my=y+48;g.fillStyle='#f4ecd8';g.fillRect(mx2-1,my-2,2,3);g.fillStyle='#d9594c';g.beginPath();g.arc(mx2,my-2,2.6,Math.PI,0);g.fill();
  g.fillStyle='#fff';g.beginPath();g.arc(mx2-1,my-3.2,.5,0,7);g.arc(mx2+1,my-2.6,.4,0,7);g.fill();
  for(var pb=0;pb<3;pb++){var px2=x+6+hs(seed,pb+9)*48,py2=y+8+hs(seed,pb+13)*46;g.fillStyle='#b9b2a4';g.beginPath();g.ellipse(px2,py2,2,1.3,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(px2-.5,py2-.4,.9,.5,0,0,7);g.fill();}
  for(var lf2=0;lf2<3;lf2++){var fx2=x+4+hs(seed,lf2+20)*52,fy2=y+4+hs(seed,lf2+24)*52;g.fillStyle=lf2%2?'rgba(94,137,162,.42)':'rgba(255,255,255,.9)';g.beginPath();g.ellipse(fx2,fy2,2.2,1.1,hs(seed,lf2),0,7);g.fill();}
  var fx3=x+8+hs(seed,31)*40,fy3=y+10+hs(seed,33)*30;g.strokeStyle='#5f9a4c';g.lineWidth=.9;for(var fr=-2;fr<=2;fr++){g.beginPath();g.moveTo(fx3,fy3+5);g.quadraticCurveTo(fx3+fr*2,fy3+1,fx3+fr*3.2,fy3-1+Math.abs(fr));g.stroke();}
}
function drawPondTile(g,x,y,seed){
  var gg=g.createLinearGradient(x,y,x+T,y+T);gg.addColorStop(0,'#f8fcfd');gg.addColorStop(1,'#dfeaf0');
  g.fillStyle=gg;g.fillRect(x,y,T,T);
  g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(x+30,y+4,28,6,.04,0,7);g.fill();
  g.fillStyle='rgba(62,111,143,.2)';rr(g,x+3,y+4,54,39,14);g.fill();
  var wg=g.createLinearGradient(x,y+5,x,y+42);wg.addColorStop(0,'#c9f1fc');wg.addColorStop(1,'#83c5de');
  g.fillStyle=wg;rr(g,x+5,y+5,50,35,13);g.fill();
  var dg=g.createRadialGradient(x+32,y+26,2,x+32,y+26,24);dg.addColorStop(0,'rgba(40,110,150,.28)');dg.addColorStop(1,'rgba(40,110,150,0)');g.fillStyle=dg;rr(g,x+5,y+5,50,35,13);g.fill();
  g.strokeStyle='rgba(255,255,255,.86)';g.lineWidth=1.6;rr(g,x+6,y+6,48,33,12);g.stroke();
  g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.ellipse(x+19,y+11,8,2.5,-.15,0,7);g.fill();
  /* shoreline pebbles */
  for(var st2=0;st2<9;st2++){var a2=st2/9*6.283+hs(seed,st2)*.4,sx2=x+30+Math.cos(a2)*26,sy2=y+22.5+Math.sin(a2)*18.5;g.fillStyle=st2%2?'#b9b2a4':'#a39c8e';g.beginPath();g.ellipse(sx2,sy2,2.2,1.5,a2,0,7);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(sx2-.5,sy2-.5,.9,.5,0,0,7);g.fill();}
  /* lily pads with a notch + one blossom */
  [[47,33,4.5],[14,32,3.4]].forEach(function(l,i){g.fillStyle=i?'#6db873':'#5fa86a';g.beginPath();g.moveTo(x+l[0],y+l[1]);g.arc(x+l[0],y+l[1],l[2],.35,6.0);g.closePath();g.fill();
    g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=.5;g.beginPath();g.moveTo(x+l[0],y+l[1]);g.lineTo(x+l[0]-l[2]*.7,y+l[1]-l[2]*.3);g.stroke();});
  if(hs(seed,77)>.35){g.fillStyle='#ffb3c6';for(var pe=0;pe<5;pe++){var pa=pe/5*6.283;g.beginPath();g.ellipse(x+46+Math.cos(pa)*1.6,y+31.5+Math.sin(pa)*1.1,1.5,.9,pa,0,7);g.fill();}g.fillStyle='#ffe27a';g.beginPath();g.arc(x+46,y+31.5,.9,0,7);g.fill();}
  /* reeds clump */
  g.strokeStyle='#6a9a50';g.lineWidth=1;for(var rd=0;rd<3;rd++){g.beginPath();g.moveTo(x+52+rd*1.6,y+44);g.lineTo(x+51+rd*2.2,y+35-rd*2);g.stroke();}
}
/* the moving part of a pond tile: ripples and a swaying reed */
function drawPondAnim(g,x,y,seed){
  for(var gi=0;gi<3;gi++){var gp=(time*.5+hs(seed,gi+40)*3)%3;if(gp<1){var gx2=x+12+hs(seed,gi+50)*36,gy2=y+10+hs(seed,gi+60)*24;g.strokeStyle='rgba(255,255,255,'+(.8*Math.sin(gp*Math.PI))+')';g.lineWidth=.8;g.beginPath();g.moveTo(gx2-2.5,gy2);g.lineTo(gx2+2.5,gy2);g.stroke();}}
  for(var wi=0;wi<2;wi++){var wp=(time*.24+wi*.5+hs(seed,wi))%1;g.strokeStyle='rgba(255,255,255,'+(.38*(1-wp))+')';g.lineWidth=1;g.beginPath();g.ellipse(x+18+wi*22,y+20+wi*6,2.5+wp*7,1.2+wp*2.8,0,0,7);g.stroke();}
  var rs=Math.sin(time*1.4+seed)*1.2;g.strokeStyle='#6a9a50';g.lineWidth=1.3;g.beginPath();g.moveTo(x+7,y+40);g.quadraticCurveTo(x+7+rs*.4,y+33,x+6+rs,y+27);g.stroke();
  g.fillStyle='#8a6a48';rr(g,x+5+rs,y+24,2.2,4.5,1.1);g.fill();
}
/* storage tile: plank deck, clearly different from the gathering tiles */
function drawStoreTile(g,st,x,y){
  g.fillStyle='#e5d3ae';g.fillRect(x,y,T,T);
  g.fillStyle='rgba(40,30,20,.12)';rr(g,x+4,y+5,53,53,5);g.fill();
  g.fillStyle='#d4ad78';rr(g,x+3,y+3,53,53,5);g.fill();
  g.strokeStyle='rgba(110,75,40,.28)';g.lineWidth=1;for(var py=y+10;py<y+56;py+=7){g.beginPath();g.moveTo(x+4,py);g.lineTo(x+55,py);g.stroke();}
  g.strokeStyle='#a8743f';g.lineWidth=1.5;rr(g,x+3,y+3,53,53,5);g.stroke();
  if(!cvLv(st.id)){g.font='700 6.5px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(90,60,30,.7)';g.fillText('적재칸',x+30,y+52);}
}
function drawSite(st){
  var g=ctx,x=st.x,y=st.y,seed=x*.37+y*.11+1;
  if(!owned(st.id)){g.drawImage(tileImg('L-'+st.id+(S.smelt?1:0),st.w,function(c){drawLockedSite(c,st,0,0);},st.h),x,y,st.w,st.h);return;}
  drawOwnedSite(g,st,x,y,seed);
  if(st.kind==='forest'||st.kind==='pond'){drawStoreTile(g,st,st.store.c*T,st.store.r*T);drawPadDeck(g,st.xtT.c*T,st.xtT.r*T);}
}
function drawLockedSite(g,st,x,y){
  {
    var SZ=st.w;g.fillStyle='#aebba3';g.fillRect(x,y,SZ,st.h);
    g.save();g.beginPath();g.rect(x,y,SZ,st.h);g.clip();g.strokeStyle='rgba(255,255,255,.14)';g.lineWidth=2;
    for(var s2=-SZ;s2<SZ;s2+=14){g.beginPath();g.moveTo(x+s2,y+SZ);g.lineTo(x+s2+SZ,y);g.stroke();}g.restore();
    g.globalAlpha=.35;
    if(st.kind==='forest'){[[.3,.45],[.62,.38],[.5,.66]].forEach(function(o){g.fillStyle='#6f8a63';g.beginPath();blob(g,x+o[0]*SZ,y+o[1]*SZ-8,12);g.fill();g.fillRect(x+o[0]*SZ-2,y+o[1]*SZ,4,10);});}
    else if(st.kind==='mine'){[[.3,.7],[.62,.66],[.48,.86]].forEach(function(o){g.fillStyle='#6b6a66';g.beginPath();blob(g,x+o[0]*SZ,y+o[1]*SZ,11);g.fill();});}
    else{g.fillStyle='#7f9fa8';rr(g,x+22,y+26,76,48,20);g.fill();}
    g.globalAlpha=1;
    g.font='800 10px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#4f5d48';g.fillText(st.name+' 부지',x+SZ/2,y+SZ/2+20);if(st.kind==='mine'){g.font='700 7.5px sans-serif';g.fillText(S.smelt?'발판에서 개척해요':'제련소를 지으면 열려요',x+SZ/2,y+SZ/2+34);}
    g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=1;g.strokeRect(x+.5,y+.5,SZ-1,SZ-1);
  }
}
/* one site = one merged L-shaped gathering area (3 tiles) + a separate fenced storage deck (1 tile) */
function lPath(g,m,r){ /* L = top row (2 tiles) + bottom-left tile, inset by m, corner radius r */
  g.beginPath();
  g.moveTo(m+r,m);g.lineTo(120-m-r,m);g.quadraticCurveTo(120-m,m,120-m,m+r);
  g.lineTo(120-m,60-m-r);g.quadraticCurveTo(120-m,60-m,120-m-r,60-m);
  g.lineTo(60-m+r,60-m);g.quadraticCurveTo(60-m,60-m,60-m,60-m+r);
  g.lineTo(60-m,120-m-r);g.quadraticCurveTo(60-m,120-m,60-m-r,120-m);
  g.lineTo(m+r,120-m);g.quadraticCurveTo(m,120-m,m,120-m-r);
  g.lineTo(m,m+r);g.quadraticCurveTo(m,m,m+r,m);g.closePath();
}
function lPoint(k,m){ /* point k∈[0,1) along the L outline, used to scatter shore stones */
  var segs=[[m,m,120-m,m],[120-m,m,120-m,60-m],[120-m,60-m,60-m,60-m],[60-m,60-m,60-m,120-m],[60-m,120-m,m,120-m],[m,120-m,m,m]];
  var tot=0,ls=segs.map(function(s){var l=Math.hypot(s[2]-s[0],s[3]-s[1]);tot+=l;return l;}),d=k*tot;
  for(var i=0;i<segs.length;i++){if(d<=ls[i]){var s=segs[i],u=d/ls[i];return {x:s[0]+(s[2]-s[0])*u,y:s[1]+(s[3]-s[1])*u};}d-=ls[i];}
  return {x:m,y:m};
}
function drawPadDeck(g,x,y){
  g.fillStyle='rgba(60,50,30,.12)';rr(g,x+4,y+6,52,52,9);g.fill();
  g.fillStyle='#ece2c8';rr(g,x+4,y+4,52,52,9);g.fill();
  for(var i=0;i<4;i++)for(var j=0;j<4;j++){var sh=hs(x+i*3.1,y+j*1.7);g.fillStyle='rgba(150,125,85,'+(.10+sh*.08)+')';rr(g,x+7+i*12.5+(j%2)*3,y+7+j*12.5,10.5,10.5,3);g.fill();}
  g.strokeStyle='rgba(160,130,90,.55)';g.lineWidth=1.2;rr(g,x+4.5,y+4.5,51,51,9);g.stroke();
}
function drawSiteArt(g,st,seed){
  var kind=st.kind,px=st.pd[0]*60,sx=st.sd[0]*60,sy=st.sd[1]*60;
  var gg=g.createLinearGradient(0,0,120,120);gg.addColorStop(0,kind==='mine'?'#cfc6b4':'#c6e4a6');gg.addColorStop(1,kind==='mine'?'#b9ae98':'#a9d18c');
  g.fillStyle=gg;g.fillRect(0,0,st.w,120);
  if(kind==='forest'){
    g.fillStyle='rgba(90,140,70,.18)';rr(g,3,63,114,54,14);g.fill();grassTufts(g,0,60,120,60,seed+3,6,2);
    for(var j=0;j<10;j++){var fx=6+hs(seed,j+20)*108,fy=64+hs(seed,j+40)*50;g.fillStyle=['#d9a441','#c9743a','#e0b85a','#b8883a'][j%4];g.save();g.translate(fx,fy);g.rotate(hs(seed,j)*6);g.beginPath();g.ellipse(0,0,2,1,0,0,7);g.fill();g.restore();}
  }else if(kind==='pond'){
    /* boardwalk along the top bank, water below */
    g.fillStyle='#e8dcb8';rr(g,1,60,118,22,6);g.fill();
    g.fillStyle='rgba(70,120,70,.25)';rr(g,1,70,118,49,14);g.fill();
    var wg=g.createLinearGradient(0,74,0,118);wg.addColorStop(0,'#8fd0e8');wg.addColorStop(1,'#5fa6cc');g.fillStyle=wg;rr(g,3,74,114,43,13);g.fill();
    g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1.2;rr(g,4.5,75.5,111,40,12);g.stroke();
    g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.ellipse(30,90,12,2.4,-.1,0,7);g.ellipse(88,104,9,2,-.1,0,7);g.fill();
    g.fillStyle='rgba(60,40,20,.18)';g.fillRect(3,64,114,9);g.fillStyle='#c9a26f';g.fillRect(3,61,114,10);
    g.strokeStyle='rgba(110,75,40,.35)';g.lineWidth=.8;for(var bx=8;bx<117;bx+=7){g.beginPath();g.moveTo(bx,61);g.lineTo(bx,71);g.stroke();}
    for(var p=0;p<6;p++){var ppx=10+p*20;g.fillStyle='#8a6440';rr(g,ppx-1.6,69,3.2,6,1);g.fill();}
    [[100,110,4.6],[16,100,3.6]].forEach(function(l,i){g.fillStyle=i%2?'#6db873':'#5fa86a';g.beginPath();g.moveTo(l[0],l[1]);g.arc(l[0],l[1],l[2],.35,6.0);g.closePath();g.fill();});
  }else{
    /* quarry: cracked stone floor with gravel */
    g.save();g.translate(0,-sy);g.fillStyle='#a89c88';rr(g,3,63,st.w-6,54,10);g.fill();g.strokeStyle='rgba(60,50,40,.3)';g.lineWidth=.8;
    for(var cr=0;cr<7;cr++){var cx=10+hs(seed,cr)*(st.w-20),cy=68+hs(cr,seed)*44;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+6,cy+3);g.lineTo(cx+9,cy+1);g.stroke();}
    for(var gv=0;gv<24;gv++){g.fillStyle='rgba(80,70,60,'+(.2+hs(gv,7)*.3)+')';g.beginPath();blob(g,6+hs(gv,3)*(st.w-12),66+hs(gv,5)*50,.8+hs(gv,9)*1.2);g.fill();}
    g.fillStyle='#6b5a44';g.fillRect(4,114,st.w-8,2);g.restore();
  }
  drawPadDeck(g,px,sy);
  drawStoreTile(g,st,sx,sy);
  g.fillStyle='rgba(0,0,0,.12)';g.fillRect(sx,sy?60:58,60,2);g.fillRect(sx===0?58:60,sy,2,60);
  for(var q=0;q<5;q++){g.fillStyle='#9a7a52';rr(g,sx+1+q*14,sy?58:57,3,7,1);g.fill();}
}
/* shared decks for the non-gathering tiles */
function deck(g,x,y,w,h,col,edge){g.fillStyle='rgba(40,30,20,.14)';rr(g,x+1.5,y+2.5,w,h,7);g.fill();var dg=g.createLinearGradient(x,y,x,y+h);dg.addColorStop(0,col[0]);dg.addColorStop(1,col[1]);g.fillStyle=dg;rr(g,x,y,w,h,7);g.fill();
  g.strokeStyle=edge;g.lineWidth=1.2;rr(g,x+.6,y+.6,w-1.2,h-1.2,6.5);g.stroke();g.fillStyle='rgba(255,255,255,.3)';rr(g,x+3,y+2,w-6,2,1);g.fill();}
function laneStrip(g,x,y0,y1){g.fillStyle='rgba(60,50,40,.16)';rr(g,x-12,y0,24,y1-y0,6);g.fill();g.fillStyle='#d8ccb0';rr(g,x-11,y0,22,y1-y0,6);g.fill();
  for(var i=0;i<(y1-y0)/5;i++){g.fillStyle='rgba(120,100,70,'+(.15+hs(i,x)*.2)+')';g.beginPath();blob(g,x-8+hs(i,3)*16,y0+3+i*5,.9);g.fill();}}
function lantern(g,x,y,gold){g.fillStyle='rgba(255,210,120,.22)';g.beginPath();g.arc(x,y-9,9,0,7);g.fill();g.fillStyle='#5b4636';g.fillRect(x-.8,y-8,1.6,10);g.fillStyle=gold?'#e0b23c':'#3a3f45';rr(g,x-3,y-14,6,7,1.5);g.fill();g.fillStyle='#ffe29a';rr(g,x-2,y-13,4,5,1);g.fill();}
var FOREST_LOOK=ART.forest;
function drawForestArt(g,st,seed,L){
  var P=FOREST_LOOK[Math.max(0,Math.min(4,L-1))];
  g.fillStyle='#edf9df';rr(g,0,0,st.w,st.h,8);g.fill();
  g.fillStyle=P.floor;rr(g,2,2,st.w-5,st.h-4,13);g.fill();
  /* Ground only: the resource renderer owns every visible tree. */
  g.strokeStyle='rgba(96,125,113,.15)';g.lineWidth=.7;
  for(var j=0;j<13;j++){var x=8+hs(seed,j)*(st.w-18),y=9+hs(j,seed)*(st.h-18);g.beginPath();g.moveTo(x,y);g.lineTo(x+3,y-1);g.stroke();}
  if(L>=3){g.strokeStyle='#b9ad8f';g.lineWidth=1;g.beginPath();g.moveTo(4,9);g.lineTo(4,st.h-9);g.stroke();}
  if(L>=4){lantern(g,st.w-6,64,L===5);lantern(g,st.w-6,125,L===5);}
  if(L===5){g.fillStyle='#d5bb84';[[8,65],[48,125],[9,163]].forEach(function(p){g.beginPath();g.arc(p[0],p[1],1.5,0,7);g.fill();});}
}

function drawRiverArt(g,st,seed,L){
  var w=st.w,h=st.h,wc=[['#54cdeb','#c2eaf5'],['#30bde8','#b4e5f2'],['#21aedf','#a2e0f4'],['#219bd8','#92dafa'],['#23c5d5','#a8f2ef']][L-1];
  g.fillStyle='#dce8df';rr(g,0,0,w,h,12);g.fill();
  var water=g.createLinearGradient(0,0,w,h);water.addColorStop(0,wc[0]);water.addColorStop(.5,wc[1]);water.addColorStop(1,wc[0]);g.fillStyle=water;rr(g,5,5,w-10,h-10,11);g.fill();
  g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;rr(g,5,5,w-10,h-10,11);g.stroke();
  for(var i=0;i<14;i++){var x=12+hs(i,5)*(w-24),y=12+hs(i,9)*(h-24);g.fillStyle='rgba(255,255,255,.23)';g.beginPath();g.ellipse(x,y,6,1.4,0,0,7);g.fill();}
  for(var y=14;y<h-8;y+=18){g.fillStyle=L>=3?'#a1b3b4':'#b2c5b9';g.beginPath();g.ellipse(w-2,y,3,5,0,0,7);g.fill();}
  if(L>=2){[[18,42],[w-22,118]].forEach(function(p){g.fillStyle='#6ab27c';g.beginPath();g.arc(p[0],p[1],5+L*.4,.3,6);g.lineTo(p[0],p[1]);g.fill();});}
  if(L>=4){for(var i=0;i<L;i++){g.fillStyle='rgba(255,255,255,.7)';g.fillRect(15+hs(i,17)*(w-30),18+hs(i,23)*(h-36),3,1);}}
}
/* moving parts: the river flows downhill, fireflies over a grown forest */
function siteAnim(g,st,L){
  if(st.kind==='pond'){var x0=st.x+8;g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=1;
    for(var i=0;i<10;i++){var yy=st.y+((time*(14+L*3)+i*23)%st.h),xx=x0+6+hs(i,17)*(st.w-28);g.globalAlpha=.25+.35*Math.sin((yy-st.y)/st.h*Math.PI);g.beginPath();g.moveTo(xx,yy);g.lineTo(xx,yy+6);g.stroke();}g.globalAlpha=1;
    if(L>=4){var wf=(time*2)%1;g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x0+2,st.y+5,st.w-20,2);g.fillStyle='rgba(255,255,255,'+(.4*(1-wf))+')';g.beginPath();g.ellipse(x0+23,st.y+4+wf*6,18,2,0,0,7);g.fill();}}
  else if(L>=4){for(var f=0;f<(L>=5?7:4);f++){var fa=time*.6+f*1.9,fx=st.x+30+Math.cos(fa)*22+Math.sin(time*1.3+f)*4,fy=st.y+20+((f*37+time*6)%(st.h-30));g.fillStyle='rgba(255,240,150,'+(.4+.4*Math.sin(time*4+f))+')';g.beginPath();g.arc(fx,fy,1.3,0,7);g.fill();}}
}
function mineDeco(g,L){
  if(L>=2){g.fillStyle='#8a6440';[[4,2],[112,2]].forEach(function(p){g.fillRect(p[0],p[1],4,56);});g.fillRect(4,2,112,4);}
  if(L>=3){g.strokeStyle='#6b5a44';g.lineWidth=1.2;g.beginPath();g.moveTo(4,54);g.lineTo(116,54);g.moveTo(4,58);g.lineTo(116,58);g.stroke();for(var x=6;x<116;x+=7){g.fillStyle='#8a6440';g.fillRect(x,52,3,8);}
    g.fillStyle='#5d6670';rr(g,20,44,16,9,2);g.fill();g.fillStyle='#8a8078';g.beginPath();blob(g,24,44,3);blob(g,30,43,3);g.fill();g.fillStyle='#2b2f36';g.beginPath();g.arc(23,54,2,0,7);g.arc(33,54,2,0,7);g.fill();}
  if(L>=4){lantern(g,8,24,L>=5);lantern(g,112,24,L>=5);}
  if(L>=5){for(var k=0;k<8;k++){g.fillStyle='rgba(255,220,90,.8)';var gx=10+hs(k,5)*100,gy=8+hs(k,7)*40;g.fillRect(gx-1.4,gy-.3,2.8,.6);g.fillRect(gx-.3,gy-1.4,.6,2.8);}}
}
function drawOwnedSite(g,st,x,y,seed){
  var L=Math.max(1,siteLv(st.id)),key='S4-'+st.id+'-'+(cvLv(st.id)?1:0)+(beltOn('proc_'+st.id)?1:0)+'-'+L;
  if(st.kind!=='mine'){g.drawImage(tileImg(key,st.w,function(c){(st.kind==='forest'?drawForestArt:drawRiverArt)(c,st,seed,L);},st.h),x,y,st.w,st.h);siteAnim(g,st,L);return;}
  g.drawImage(tileImg(key,st.w,function(c){drawSiteArt(c,st,seed);mineDeco(c,L);},st.h),x,y,st.w,st.h);
  if(st.kind!=='forest')st.tiles.forEach(function(t,i){if(t.store||t.pad)return;var tx=t.c*T,ty=t.r*T,sd=seed+i*3;
    if(st.kind!=='pond')return;for(var wi=0;wi<2;wi++){var wp=(time*.24+wi*.5+hs(sd,wi))%1;g.strokeStyle='rgba(255,255,255,'+(.38*(1-wp))+')';g.lineWidth=1;g.beginPath();g.ellipse(tx+18+wi*22,ty+34+wi*8,2.5+wp*7,1.2+wp*2.8,0,0,7);g.stroke();}
    for(var gi=0;gi<2;gi++){var gp=(time*.5+hs(sd,gi+40)*3)%3;if(gp<1){var gx2=tx+14+hs(sd,gi+50)*32,gy2=ty+24+hs(sd,gi+60)*28;g.strokeStyle='rgba(255,255,255,'+(.8*Math.sin(gp*Math.PI))+')';g.lineWidth=.8;g.beginPath();g.moveTo(gx2-2.5,gy2);g.lineTo(gx2+2.5,gy2);g.stroke();}}});
}
/* central plaza: four empty lots; a building appears once it is bought */
var PLOTS=[
  {id:'sawmill',def:'mill',name:'제재소',x:186,y:414,w:136,h:144,shedLeft:1,built:function(){return S.mill>0;},show:function(){return S.shop.wood+S.shop.fish>=3||S.mill>0;}},
  {id:'smokehouse',def:'smoke',name:'훈제소',x:486,y:430,w:136,h:144,shedLeft:1,built:function(){return S.smoke>0;},show:function(){return S.shop.wood+S.shop.fish>=3||S.smoke>0;}},
  {id:'smelter',def:'smelt',name:'제련소',x:846,y:243,w:136,h:138,shedLeft:1,built:function(){return S.smelt>0;},show:function(){return S.mill>0||S.smoke>0||S.smelt>0;}},
  {id:'factory',def:'elec',name:'전자 공장',x:846,y:438,w:136,h:138,shedLeft:1,built:function(){return S.elec>0;},show:function(){return S.smelt>0||S.elec>0;}},
  {id:'tower',def:'tower',name:'망루',x:28,y:482,w:44,h:116,built:function(){return S.tower>0;},show:function(){return huntReady();}}
];
/* each factory: machine on the side the belt comes in, storage shed (truck bay) on the other */
function shedX(pl){return pl.shedLeft?pl.x:pl.x+pl.w-44;}
function machOf(pl){return {x:pl.shedLeft?pl.x+36:pl.x,y:pl.y,w:pl.w,h:pl.h};}
