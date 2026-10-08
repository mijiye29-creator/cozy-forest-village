/* ---------- conveyors: one belt per site -> plot edge -> corridor trunk -> stall / warehouse ---------- */
var belt=[],convT={},hopP={wood:0,fish:0};
/* export loader on the bottom tile of the forest/river: feeds the belt down to the factory */
function drawExport(sid){var st=SITE[sid];if(!st.xtT||!owned(sid)||!beltOn('proc_'+sid))return;var g=ctx,x=st.xtT.c*T,y=st.xtT.r*T,L=cvLv(sid),P=tierOfBelt(L),fx=loadFx['x'+sid]||0,line=st.line,n=S.pin[line]||0;
  g.fillStyle='rgba(0,0,0,.16)';g.beginPath();g.ellipse(x+30,y+48,22,4,0,0,7);g.fill();
  g.fillStyle=P.dk;rr(g,x+10,y+22,40,22,3);g.fill();g.fillStyle=P.fr;rr(g,x+10,y+21,40,19,3);g.fill();g.fillStyle=P.hi;g.fillRect(x+12,y+21,36,1.2);
  g.fillStyle=P.dk;rr(g,x+12,y+26,12,11,2.5);g.fill();drawGear(g,x+18,y+31.5,4.2,7,time*(1.5+L*.9),P.hi,P.dk);
  g.save();g.translate(x+36,y+18);g.scale(.7+.08*fx,.7-.08*fx);var gr=g.createLinearGradient(-20,0,20,0);gr.addColorStop(0,P.dk);gr.addColorStop(.35,P.hi);gr.addColorStop(1,P.fr);g.fillStyle=gr;g.beginPath();g.moveTo(-20,-11);g.lineTo(20,-11);g.lineTo(9,9);g.lineTo(-9,9);g.closePath();g.fill();
  g.fillStyle='#2f2a26';g.beginPath();g.ellipse(0,-11,18,3.6,0,0,7);g.fill();g.restore();
  g.fillStyle=P.dk;rr(g,x+24,y+38,12,10,2);g.fill();
  g.font='800 6.5px sans-serif';g.textAlign='center';g.textBaseline='middle';var lab='⬇ '+(sid==='f1'?'제재소':'훈제소'),tw=g.measureText(lab).width+8;g.fillStyle='rgba(34,53,43,.82)';rr(g,x+30-tw/2,y+2,tw,10,5);g.fill();g.fillStyle='#fff';g.fillText(lab,x+30,y+7.2);}
function convRate(L){return 0.6*(1+0.6*(L-1));}
function convBatch(L){return [1,1,2,2,3,3,4,5][Math.max(1,Math.min(8,L))-1];}
function convSpeed(L){return 110*(1+0.12*L)*(1+0.2*S.trunk);}
var PROC_OF={f1:'mill',p1:'smoke',m1:'smelt',el:'elec'},SITE_OF={mill:'f1',smoke:'p1',smelt:'m1',elec:'el'};
var CVLINE={f1:'wood',p1:'fish',m1:'iron',el:'iron'};function lineBeltLv(line){return Math.max(1,(S.cvLv&&S.cvLv[line])||1);}
function cvLv(sid){return (S.cv[sid]||(S.pcv&&S.pcv[PROC_OF[sid]]))?lineBeltLv(CVLINE[sid]||sid):0;}
var BPATH={sale_f1:[[150,216],[270,216],[270,136]],sale_p1:[[570,182],[570,136]],proc_f1:[[150,216],[270,216],[270,346],[270,416]],proc_p1:[[570,346],[570,432]],proc_m1:[[930,178],[930,245]],proc_el:[[930,381],[930,440]]};
function beltOn(k){var sid=k.slice(-2);return k.indexOf('sale')===0?!!S.cv[sid]:!!(S.pcv&&S.pcv[PROC_OF[sid]]&&S[PROC_OF[sid]]);}
function ptsOf(k){return BPATH[k].map(function(p){return {x:p[0],y:p[1]};});}
function procCap(b){return 20+10*(S[b]||0)+15*((S.pst&&S.pst[b])||0);}
var CV_MAX=8;
function cvCost(sid){var base=SITE[sid].kind==='forest'?45:55;return Math.round(base*stageCostMult(sid==='m1'?3:(sid==='p1'?2:1)));}
function beltPts(sid,dest){var st=SITE[sid],pp=pilePos(sid),fy=feedY(sid),line=st.line,d=dropPt(line),lx=LANE[line],a0={x:pp.x,y:fy};
  if(dest==='wh')return [a0,{x:lx,y:fy},{x:lx,y:WHY[line]},{x:WH.x0,y:WHY[line]}];
  return [a0,{x:lx,y:fy},{x:lx,y:d.y},{x:d.x+6,y:d.y}];}
var convN={},SPLIT={},FEEDFX=[];
/* v87 (staff 1, t116): which way the loader's diverter sends the NEXT batch - same rule as updateConveyors (both open -> alternate) */
function splitNext(k){var st=SITE[k],line=st.line,b=PROC_OF[k],inS=0,inP=0;belt.forEach(function(x){if(x.line!==line)return;if(x.dest==='proc')inP+=x.n;else inS+=x.n;});
  var so=beltOn('sale_'+k)&&lineStock(line)+inS<stallCap(line),po=beltOn('proc_'+k)&&(S.pin[line]||0)+inP<procCap(b);if(so&&po)return ((convN[k]||0)+1)%2?'stall':'proc';return so?'stall':(po?'proc':null);}
function updateConveyors(dt){
  SITES.forEach(function(st){
    var k=st.id,L=cvLv(k);if(!L||!owned(k))return;
    convT[k]=(convT[k]||0)-dt;if(convT[k]>0)return;convT[k]=1/(convRate(L)*(k==='m1'?2:1)); /* v62: the mine belt runs twice as often (ore piled up waiting for it) */
    var line=st.line,b=PROC_OF[k],inS=0,inP=0;belt.forEach(function(x){if(x.line!==line)return;if(x.dest==='proc')inP+=x.n;else inS+=x.n;});
    var saleOk=beltOn('sale_'+k)&&lineStock(line)+inS<stallCap(line),procOk=beltOn('proc_'+k)&&(S.pin[line]||0)+inP<procCap(b);
    if(!saleOk&&!procOk)return;
    convN[k]=(convN[k]||0)+1;var dest=saleOk&&procOk?(convN[k]%2?'stall':'proc'):(saleOk?'stall':'proc');
    var p=S.piles[k];if(!p)return;var id=null,bn=0,bs=1e9;for(var q in p){if(!(p[q]>0))continue;var sq=dest==='stall'?ss(line,q):0;if(sq<bs||(sq===bs&&p[q]>bn)){bs=sq;bn=p[q];id=q;}}if(!id)return;
    var n=Math.min(convBatch(L)*(k==='m1'?2:1),bn);p[id]-=n;loadFx[k]=1;SPLIT[k]={dest:dest,t:0};if(dest==='proc'&&k!=='m1')FEEDFX.push({sid:k,id:id,n:n,t:0});
    var pts=ptsOf((dest==='proc'?'proc_':'sale_')+k);if(dest==='proc')loadFx['x'+k]=1;
    belt.push({dest:dest,line:line,id:id,n:n,pts:pts,seg:0,t:0,x:pts[0].x,y:pts[0].y,sp:convSpeed(L),seed:Math.random()*6,hop:0});
  });
  if(beltOn('proc_el')&&S.smelt){var Le=lineBeltLv('iron');convT.el=(convT.el||0)-dt;if(convT.el<=0){/* v62 (director 2026-10-04: smelter -> factory was too slow): 3x as often, double batches, every needed material on each run (was one kind at a time), 1.6x belt speed, factory holds up to 30 of each */
    convT.el=1/(convRate(Le)*3);
    var fl={};belt.forEach(function(x){if(x.dest==='mat')fl[x.id]=(fl[x.id]||0)+x.n;});
    var mc=PROC.smelt.goods.filter(function(id){return whN(id)>0&&(S.mat[id]||0)+(fl[id]||0)<30;});
    mc.forEach(function(mid,mi){var mn=Math.min(convBatch(Le)*2,whN(mid));addWh(mid,-mn);var mp=ptsOf('proc_el');belt.push({dest:'mat',line:'elec',id:mid,n:mn,pts:mp,seg:0,t:0,x:mp[0].x,y:mp[0].y,sp:convSpeed(Le)*1.6,seed:Math.random()*6,hop:0});});}}
  for(var i=belt.length-1;i>=0;i--){
    var bb=belt[i],a=bb.pts[bb.seg],e=bb.pts[bb.seg+1];
    var len=Math.hypot(e.x-a.x,e.y-a.y)||1;
    bb.t+=bb.sp*dt/len;bb.hop=Math.max(0,bb.hop-dt*4);
    if(bb.t>=1){bb.seg++;bb.t=0;bb.hop=1;
      if(bb.seg>=bb.pts.length-1){var end=bb.pts[bb.pts.length-1];
        if(bb.dest==='mat'){S.mat[bb.id]=(S.mat[bb.id]||0)+bb.n;hopW.elec=1;burst(end.x,end.y-4,'#bfe8ff',5,true);}
        else if(bb.dest==='proc'){S.pin[bb.line]=(S.pin[bb.line]||0)+bb.n;hopW[bb.line]=1;burst(end.x,end.y-4,'#ffe27a',5,true);}
        else{addSs(bb.line,bb.id,bb.n);hopP[bb.line]=1;burst(end.x+2,end.y-4,'#ffe27a',5,true);}
        belt.splice(i,1);continue;}
      a=bb.pts[bb.seg];e=bb.pts[bb.seg+1];}
    bb.x=a.x+(e.x-a.x)*bb.t;bb.y=a.y+(e.y-a.y)*bb.t;
  }
  LINES.forEach(function(l){hopP[l]=Math.max(0,hopP[l]-dt*3);});['wood','fish','iron','elec'].forEach(function(l){hopW[l]=Math.max(0,(hopW[l]||0)-dt*3);});
  for(var lk in loadFx)loadFx[lk]=Math.max(0,loadFx[lk]-dt*4);
}

