/* ---------- warehouse: bulk storage, workshop, truck dock ---------- */
var WH={x0:MK+22,x1:W-5,top:334,wall:350,door:MK+70};
var WHY={wood:398,fish:386};
function whDrop(){return {x:MK+30,y:326};}
function whN(id){return S.wh[id]||0;}
function whTotal(){var n=0;for(var k in S.wh)n+=S.wh[k];return n;}
function whUnlocked(){return S.mill>0||S.smoke>0||S.smelt>0;}
function palKey(){return whUnlocked()+':'+(S.mill>0)+(S.smoke>0)+(S.smelt>0)+(S.elec>0);}
var PROC={mill:{line:'wood',goods:['chair','table','sofa'],plot:'sawmill'},smoke:{line:'fish',goods:['can','smoked','gift'],plot:'smokehouse'},smelt:{line:'iron',goods:['ingot','glass','plastic'],plot:'smelter'},elec:{line:'elec',goods:['tv','pc','phone'],plot:'factory'}},procT={mill:0,smoke:0,smelt:0,elec:0},procN={mill:0,smoke:0,smelt:0,elec:0},procBusy={mill:0,smoke:0,smelt:0,elec:0},flushT=0;
var PROCS=['mill','smoke','smelt','elec'],TPROCS=['mill','smoke','elec'],LINEPROC={wood:'mill',fish:'smoke',iron:'smelt',elec:'elec'};
/* v63: a full smelter storage is never stuck - the material with the most stock is sold off a few at a time (it no longer waits forever when the factory can't keep up) */
var smeltSellT=0,SMELTNEED=null;function smeltSell(dt){smeltSellT-=dt;if(smeltSellT>0)return;smeltSellT=.6;var junk=PROC.smelt.goods.filter(function(id){return SMELTNEED&&!SMELTNEED[id]&&whN(id)>0;});var ids=(junk.length?junk:PROC.smelt.goods.filter(function(id){return whN(id)>0;})).sort(function(x,y){return whN(y)-whN(x);});if(!ids.length)return;var id=ids[0],n=Math.min(3,whN(id));addWh(id,-n);var pay=money50(n*ITEMS[id].price*priceMult());S.coins+=pay;if(typeof actionIncome==='function'){actionIncome(pay);actionFeverPay(pay);}var sp0=shedPos('smelt');addFloat(sp0.x,sp0.y-22,'📦 남는 자재 판매 +'+fmt(pay),'#ffe27a',true);}
function procYield(L){return L>=6?4:(L>=5?3:(L>=3?2:1));}
/* v60: a bigger storage shed also packs extra goods from the same batch - +1 at storage Lv3, +2 at Lv5 */
function shedYield(b){var L=(S.pst&&S.pst[b])||0;return L>=5?2:(L>=3?1:0);}
function matOk(g){for(var k in g.mat)if((S.mat[k]||0)<g.mat[k])return false;return true;}
function matN(){var n=0;for(var k in S.mat)n+=S.mat[k]||0;return n;}
function plotOf(b){return PLOTS.filter(function(p){return p.id===PROC[b].plot;})[0];}
var procCur={mill:null,smoke:null,smelt:null,elec:null},procPop={mill:0,smoke:0,smelt:0,elec:0},procFullT={mill:0,smoke:0,smelt:0,elec:0};
function storeN(b){var n=0;PROC[b].goods.forEach(function(id){n+=whN(id);});return n;}
function storeCap(b){var L=(S.pst&&S.pst[b])||0;return L?30+26*(L-1):10;}
/* v60 (director 2026-10-04): storage upgrades matter more - processing +25%/Lv (was +10%), trucks pay +30%/Lv (was +15%), come more often and load more */
function shedBoost(b){return 1+.25*((S.pst&&S.pst[b])||0);}
function machPos(b){var p=plotOf(b),m=machOf(p);return {x:p.x+(p.shedLeft?84:42),y:p.y+108};}
function shedPos(b){var p=plotOf(b);return {x:shedX(p)+18,y:p.y+116};}
function dockX(b){return shedX(plotOf(b))+19;}
function updateProcessing(dt){
  updateLegend(dt);
  PROCS.forEach(function(b){var L=S[b]||0;procBusy[b]=Math.max(0,procBusy[b]-dt);procPop[b]=Math.max(0,procPop[b]-dt*2.5);procFullT[b]-=dt;if(!L)return;var P=PROC[b],line=P.line;
    var av=P.goods.filter(function(id){return GOOD[id].lv<=L;}),gid=av[procN[b]%av.length];
    /* v63 (bug: smelter storage filled up and stopped): make only what the factory's unlocked products use, in proportion to the recipes */
    if(b==='smelt'){var need={ingot:0,glass:0,plastic:0};GOODS.forEach(function(g2){if(g2.line==='elec'&&g2.lv<=Math.max(1,S.elec||0))for(var mk2 in g2.mat)need[mk2]+=g2.mat[mk2];});
      SMELTNEED=need;var cand=av.filter(function(id){return need[id]>0;});if(!cand.length)cand=av;gid=cand.slice().sort(function(x,y){return (whN(x)+(S.mat[x]||0))/need[x]-(whN(y)+(S.mat[y]||0))/need[y];})[0];}
    var ok=b==='elec'?av.filter(function(id){return matOk(GOOD[id]);}):null;if(ok&&ok.length)gid=ok[procN[b]%ok.length];
    var gd=GOOD[gid],need=gd.n,t=gd.time/shedBoost(b)/(1+.45*(L-1))/(L>=6?(1.6+.6*(L-6))*(b==='smelt'?1.45:1):1);procCur[b]={id:gid,t:t};
    if(ok?!ok.length:(S.pin[line]||0)<need){procT[b]=0;return;}
    if(b==='smelt'&&(storeN(b)>=storeCap(b)||PROC.smelt.goods.some(function(id){return SMELTNEED&&!SMELTNEED[id]&&whN(id)>0;}))){smeltSell(dt);}
    if(storeN(b)>=storeCap(b)){if(procFullT[b]<=0){procFullT[b]=6;var sp0=shedPos(b);addFloat(sp0.x,sp0.y-30,b==='smelt'?(S.elec?'자재 창고 가득! 남는 자재는 팔아요':'전자 공장을 지으면 자재를 써요 · 남는 자재는 팔아요'):(S.pst[b]?'창고가 가득! 트럭을 기다려요':'창고를 지으면 더 쌓여요'),'#ffe2a8');}return;}
    procBusy[b]=.4;procT[b]+=dt;if(procT[b]<t)return;procT[b]=0;if(ok){for(var mk in gd.mat)S.mat[mk]-=gd.mat[mk];}else S.pin[line]-=need;procN[b]++;procPop[b]=1;
    /* v56 (director 2026-10-03): a higher-level workshop turns the same batch into more goods (Lv1 x1, Lv3 x2, Lv5 x3, Lv6+ x4), so its storage fills faster and storage upgrades pay off */
    var yieldN=b==='elec'?1:Math.max(1,Math.min(procYield(L)+shedYield(b),storeCap(b)-storeN(b)));
    var m=machPos(b),sh=shedPos(b);burst(m.x,m.y-4,'#ffe27a',8,true);addWh(gid,yieldN);fly(gid,m.x,m.y-4,sh.x,sh.y-10,.7);if(yieldN>1)addFloat(m.x,m.y-20,'×'+yieldN,'#ffe27a',true);sfx('pickup',.15);});
}
function whCap(){return S.whLv?60+40*(S.whLv-1)+(S.wh2?60+40*(S.wh2-1):0):0;}
function addWh(id,n){S.wh[id]=whN(id)+n;}
function recipeOk(g){return (S[LINEPROC[g.line]]||0)>=g.lv;}
var CR={wood:{active:null,t:0},fish:{active:null,t:0}},craftPop={wood:0,fish:0},hopW={wood:0,fish:0,iron:0,elec:0};
function reservedWh(){var m={};trucks.forEach(function(t){if(t.state==='out')return;t.order.forEach(function(o){m[o.id]=(m[o.id]||0)+(o.qty-o.got);});});return m;}
function updateCrafting(dt){
  LINES.forEach(function(l){craftPop[l]=Math.max(0,craftPop[l]-dt*2.5);hopW[l]=Math.max(0,hopW[l]-dt*3);});
  if(!S.whLv)return;
  LINES.forEach(function(line){
    var cr=CR[line];
    if(cr.active){cr.t+=dt;if(cr.t>=cr.active.time){addWh(cr.active.id,1);cr.active=null;craftPop[line]=1;}return;}
    var recs=GOODS.filter(function(g){return g.line===line&&recipeOk(g)&&whN(g.id)<10;}).sort(function(a,b){return whN(a.id)-whN(b.id);});
    if(!recs.length)return;
    var resv=reservedWh();
    var raws=ORDER.filter(function(id){return ITEMS[id].cat===line;}).sort(function(a,b){return ITEMS[a].sp.val-ITEMS[b].sp.val;});
    for(var i=0;i<recs.length;i++){
      var rec=recs[i],avail=0;
      raws.forEach(function(id){avail+=Math.max(0,whN(id)-(resv[id]||0));});
      if(avail<rec.n)continue;
      var need=rec.n;
      raws.forEach(function(id){var t=Math.min(need,Math.max(0,whN(id)-(resv[id]||0)));if(t>0){addWh(id,-t);need-=t;}});
      cr.active=rec;cr.t=0;return;
    }
  });
}
/* trucks: drive in on the road, load at the dock, pay in bulk */
var trucks=[],truckT={mill:6,smoke:9,smelt:12,elec:8},TRUCK_COL=['#3f7fb8','#4f9a6a','#e0a03a','#8a5ab8','#5a8fb8'],LANE_UP=H+23,LANE_DN=H+44;
function truckCands(b){
  var c=[];
  PROC[b].goods.forEach(function(id){var g=GOOD[id];if(recipeOk(g)||whN(id)>0)c.push({id:id,w:1.6+whN(id)*.3});});
  return c;
}
function pickW(c){var sum=0;c.forEach(function(x){sum+=x.w;});var r=Math.random()*sum;for(var i=0;i<c.length;i++){r-=c[i].w;if(r<=0)return c.splice(i,1)[0].id;}return c.pop().id;}
function newTruck(b){
  var c=truckCands(b);if(!c.length)return null;
  var rush=Math.random()<.2,sl=(S.pst&&S.pst[b])||0;if(rush)rushCount++;
  var n=Math.min(c.length,rush?1:(sl>=2&&Math.random()<.5?2:1)),order=[],tot=0;
  var room=10+12*sl,have=storeN(b);for(var i=0;i<n;i++){var id=pickW(c),qty=Math.max(3,Math.min(Math.ceil(room/n),whN(id)+Math.floor(Math.random()*3)));if(rush)qty=Math.max(2,Math.round(qty*.6));order.push({id:id,qty:qty,got:0});tot+=qty;}
  var pat=(55+tot*3)*(rush?.6:1);
  return {b:b,x:W+70,y:LANE_DN,state:'in',dock:0,rush:rush,order:order,pat:pat,max:pat,col:rush?'#e2463c':TRUCK_COL[Math.floor(Math.random()*TRUCK_COL.length)],wheel:0,loadT:0,bump:0,vx:0,puff:0};
}
/* v68: trucks also pay more for a higher workshop level (+20%/Lv) and double at the top level (Lv8) */
function procPay(b){var L=S[b]||0;return (1+.2*Math.max(0,L-1))*(L>=8?2:1);}
function truckPrice(id){var it=ITEMS[id],b=LINEPROC[it.line];return money50((it.price||5)*ECON*procPay(b)*priceMult()*(1.1+.3*((S.pst&&S.pst[b])||0))*hotMult(id));}
/* v68: at the top workshop level trucks keep lining up (next one is always on its way) */
function truckInterval(b){var k=storeN(b)/Math.max(1,storeCap(b)),L=S[b]||0;return 6/(1+.8*((S.pst&&S.pst[b])||0))*(k>=.5?.35:(k>=.25?.7:1))*(L>=8?.25:(L>=6?.6:1));}
var rushCount=0;
function updateHot(dt){}
function truckDone(t){return t.order.every(function(o){return o.got>=o.qty;});}
function truckLeave(t){t.state='undock';}
function updateTrucks(dt){
  TPROCS.forEach(function(b){if(!S[b]||storeN(b)<Math.min((S[b]||0)>=8?1:2,storeCap(b)))return;if(trucks.filter(function(t){return t.b===b&&t.state!=='out';}).length>=2)return;
    truckT[b]-=dt;if(truckT[b]<=0){truckT[b]=truckInterval(b)*(.5+Math.random()*.3);var nt=newTruck(b);if(nt)trucks.push(nt);}});
  for(var i=trucks.length-1;i>=0;i--){
    var t=trucks[i],v=0,dx=dockX(t.b)+(trucks.some(function(o){return o!==t&&o.b===t.b&&(o.state==='dock'||o.state==='load');})?46:0);
    t.bump=Math.max(0,t.bump-dt*3);
    if(t.state==='in'){var d=t.x-dx;
      if(d>.5){v=Math.max(20,Math.min(160,d*2));t.x-=Math.min(d,v*dt);}
      else{t.x=dx;t.state='dock';}
    }else if(t.state==='dock'){
      t.y+=(LANE_UP-t.y)*Math.min(1,dt*5);v=4;
      if(Math.abs(t.y-LANE_UP)<.6){t.y=LANE_UP;t.state='load';t.bump=1;sfx('horn',.5);}
    }else if(t.state==='load'){
      t.pat-=dt;t.loadT-=dt;
      var ld=true;if(t.loadT<=0){t.loadT=.08;ld=false;
        for(var k=0;k<t.order.length;k++){var o=t.order[k];if(o.got<o.qty&&whN(o.id)>0){ld=true;addWh(o.id,-1);o.got++;t.bump=.45;var sh=shedPos(t.b);fly(o.id,sh.x,sh.y-6,t.x+10,t.y-10,.35);break;}}}
      if(truckDone(t)||(!ld&&t.order.some(function(o){return o.got>0;}))){
        var pay=0;t.order.forEach(function(o){pay+=o.got*truckPrice(o.id);});pay=money50(pay*(t.rush?2:1));
        var tk='t_'+t.b,tcp=tcashPos(t.b);if(typeof actionIncome==='function'){actionIncome(pay);actionFeverPay(pay);}S.cash[tk]=(S.cash[tk]||0)+pay;S.h3=1;stat('truck',1);sfx('cash');addFloat(tcp.x,tcp.y-24,(t.rush?'⚡+':'🚚+')+pay,'#ffd35a',true);burst(tcp.x,tcp.y,'#ffe27a',t.rush?20:12,true);
        for(var ci=0;ci<Math.min(8,3+Math.floor(pay/40));ci++)fly('coin',t.x+(Math.random()-.5)*20,t.y-12,tcp.x+(Math.random()-.5)*16,tcp.y-4,.5+ci*.05);if(t.rush)flash=.3;truckLeave(t);
      }else if(t.pat<=0){
        var got=0,pay2=0;t.order.forEach(function(o){got+=o.got;pay2+=o.got*truckPrice(o.id)*.85;});
        if(got>0){pay2=money50(pay2);var tk2='t_'+t.b,tcp2=tcashPos(t.b);S.cash[tk2]=(S.cash[tk2]||0)+pay2;addFloat(tcp2.x,tcp2.y-24,'🚚+'+pay2,'#ffe2a8',true);}
        else{S.lost++;addFloat(dx,H-10,'빈 트럭으로 떠나요','#ffb3b3');}
        truckLeave(t);
      }
    }else if(t.state==='undock'){
      t.y+=(LANE_DN-t.y)*Math.min(1,dt*5);t.x-=14*dt;v=14;
      if(Math.abs(t.y-LANE_DN)<.6){t.y=LANE_DN;t.state='out';}
    }else{t.vx=Math.min(190,t.vx+dt*170);v=t.vx;t.x-=v*dt;if(t.x<-90){trucks.splice(i,1);continue;}}
    t.wheel+=v*dt/5.5;
    if(v>5){t.puff-=dt;if(t.puff<=0){t.puff=.18;parts.push({x:t.x-9.4,y:t.y-23,vx:18+Math.random()*10,vy:-14,g:-6,life:.8,max:.8,col:'rgba(200,200,200,.8)',r:2.2});}}
  }
}

