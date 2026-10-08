/* ---------- agents: movement and work ---------- */
var agents=[];
var HOME={x:150,y:418}; /* Spawn below the forest upgrade's 21px purchase radius. */
function LODGEP(){return PLOTS.filter(function(p){return p.id==='lodge';})[0];}
var WNAMES=['도토리','솔방울','다람','보리','콩이','해솔','나리','모모','초롱','별이','단풍','여울'];
var LOOK_HAIR=['#3a2c22','#7a4d2b','#c9a45a','#2b2b35','#a0522d','#e6ddcc'];
var LOOK_SKIN=['#ffe0c4','#f6d0ae','#e8b98f','#d9a47a'];
function newLook(){var used={};S.w.forEach(function(g){if(g.name)used[g.name]=1;});var free=WNAMES.filter(function(n){return !used[n];});
  return {name:free.length?free[Math.floor(Math.random()*free.length)]:'일꾼'+(S.w.length+1),hair:Math.floor(Math.random()*LOOK_HAIR.length),skin:Math.floor(Math.random()*LOOK_SKIN.length),acc:Math.floor(Math.random()*4)};}
S.w.forEach(function(g){if(!g.name){var l=newLook();g.name=l.name;g.hair=l.hair;g.skin=l.skin;g.acc=l.acc;}});
function mkAgent(role,gear){
  return {role:role,gear:gear,x:HOME.x+(Math.random()-.5)*30,y:HOME.y+(Math.random()-.5)*14,bag:{},res:null,prog:0,path:[],goal:null,
    bob:0,dir:1,swing:0,idleT:0,ix:HOME.x,iy:HOME.y,mv:false,working:false,kind:role==='fisher'?'fish':(role==='miner'?'ore':'tree'),lockT:0,colT:0,thinkT:0,
    sc:role==='player'?1:0.76,slot:agents.length%3};
}
agents.push(mkAgent('player',S.p));
/* the player starts on the clear plaza spot, never on top of an upgrade pad */
agents[0].x=HOME.x;agents[0].y=HOME.y;
S.w.forEach(function(g){agents.push(mkAgent(g.role,g));});
/* the in-game supervisor (v46) was removed (code deleted in v51): refund anyone who had hired it */
if(S.sup){S.coins+=900;S.refundN=(S.refundN||0)+900;S.sup=0;}
function bagN(a){var n=0;for(var k in a.bag)n+=a.bag[k];return n;}
function bagLine(a,line){var n=0;for(var k in a.bag)if(ITEMS[k].line===line)n+=a.bag[k];return n;}
function spdOf(a){return 70*(1+0.15*(a.gear.boots||0));}
function release(a){if(a.res){a.res.by=null;a.res.prog=0;a.res=null;}a.prog=0;}
function speedOf(a){return a.role==='player'?spdOf(a)*1.38:spdOf(a)*WMOVE;}
function moveTo(a,x,y,dt){
  var dx=x-a.x,dy=y-a.y,d=Math.hypot(dx,dy),sp=speedOf(a)*dt;
  a.mv=d>.5;
  if(d<=sp){a.x=x;a.y=y;return true;}
  a.x+=dx/d*sp;a.y+=dy/d*sp;if(Math.abs(dx)>.5)a.dir=dx>0?1:-1;a.bob+=dt*13;return false;
}
function tileOf(a){return tileAt(a.x,Math.min(a.y,H-1));}
function sameTile(t,u){return !!(t&&u&&t.c===u.c&&t.r===u.r);}
/* shortest tile path (4-neighbour BFS over walkable tiles) */
function findPath(from,to){
  if(!tileOk(to.c,to.r))return null;
  var key=function(t){return t.c+','+t.r;},prev={},q=[from],head=0,seen={};seen[key(from)]=1;
  while(head<q.length){var cur=q[head++];if(sameTile(cur,to))break;
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var n={c:cur.c+d[0],r:cur.r+d[1]},k=key(n);if(seen[k]||!tileOk(n.c,n.r))return;seen[k]=1;prev[k]=cur;q.push(n);});}
  if(!seen[key(to)])return null;
  var path=[],t=to;while(!sameTile(t,from)){path.push(t);t=prev[key(t)];}
  return path.reverse();
}
function goTile(a,t){
  if(isBank(t.c,t.r))t={c:Math.floor((SITE.p1.x+SITE.p1.w+8)/T),r:t.r};
  var f=tileOf(a)||tileAt(HOME.x,HOME.y);
  if(sameTile(f,t)){a.path=[];a.goal=t;return true;}
  var p=findPath(f,t);if(!p)return false;
  release(a);p.unshift(f);a.path=p;a.goal=t;return true;
}
function followPath(a,dt){var t=a.path[0];if(moveTo(a,tileXw(t.c,t.r),tileYw(t.c,t.r),dt))a.path.shift();}
/* everyone works from the tile centre (workers shuffle into small slots so they don't overlap) */
function stand(q,a){var side=q.x<q.tc*T+30?-1:1;if(q.k==='fish')return {x:SITE[q.s].x+SITE[q.s].w+8,y:Math.max(q.tr*T+6,Math.min(q.tr*T+56,q.y+2))};return {x:Math.max(6,Math.min(MX-6,q.x+side*10)),y:Math.min(q.tr*T+56,q.y+10)};}
function near(a,p,d){return Math.hypot(a.x-p.x,a.y-p.y)<(d||26);}
function workersOnSite(sid,except){var n=0;agents.forEach(function(a){if(a!==except&&a.res&&a.res.s===sid&&a.role!=='player')n++;});return n;}
function pileRoomW(sid,a){return pn(sid)+workersOnSite(sid,a)<pcap();}
function canTake(a,q){
  if(!q.alive||!owned(q.s)||(q.by&&q.by!==a))return false;
  if(a.role==='lumber'&&q.k!=='tree')return false;
  if(a.role==='fisher'&&q.k!=='fish')return false;
  if(a.role==='miner'&&q.k!=='ore')return false;
  return okFor(a.gear,q);
}
function resInTile(c,r){return res.filter(function(q){return q.tr===r&&(q.tc===c||(q.k==='fish'&&isBank(c,r)));});}
function harvestable(a,c,r){return resInTile(c,r).filter(function(q){return canTake(a,q);});}
function needMsg(q){var tr=q.k==='tree'?'axe':(q.k==='ore'?'pick':'rod');return NAMES[tr][spOf(q).tier]+(tr==='axe'?' 도끼':' 낚싯대')+'가 필요해요';}
function harvest(a){
  var q=a.res;if(!q)return;
  if(!okFor(a.gear,q)){release(a);return;}
  var sp=spOf(q),sid=q.s,pp=pilePos(sid),pl=pileOf(sid);
  if(a.role==='player'&&q.k!=='ore'&&!cvLv(sid)){if(bagN(a)>=cap()){release(a);addFloat(a.x,a.y-34,'두 손이 가득! 납품하러 가요','#ffb3b3');return;}a.bag[sp.id]=(a.bag[sp.id]||0)+1;var tp=stackTop(a);fly(sp.id,q.x,q.y-8,tp.x,tp.y,.3);}
  else if(pn(sid)<pcap()){pl[sp.id]=(pl[sp.id]||0)+1;burst(pp.x,pp.y-6,q.k==='tree'?'#b58a5a':(q.k==='ore'?'#c9ced4':'#bfe9f7'),a.role==='player'?4:3,false);if(a.role==='player')addFloat(pp.x,pp.y-24,'📦+1','#ffffff',true);}
  if(a.role==='player'){S.h1=1;if(S.tut===1&&q.k==='tree')S.tutN=(S.tutN||0)+1;sfx(q.k==='fish'?'splash':'fell');}
  stat('gather',1);q.alive=false;q.timer=q.max;release(a);
}
function progress(a,dt){
  if(a.role==='player'&&tutNoGather()){release(a);return;}
  var q=a.res,need=baseTime(a.gear,q)/(a.role==='player'?1:WORKF);
  var tutBoost=(a.role==='player'&&tutOn()&&S.tut===1)?2.4:1;a.prog+=dt*tutBoost;q.prog=a.prog;q.need=need;a.swing+=dt*9;a.working=true;a.kind=q.k;
  a.fxT=(a.fxT||0)+dt;
  if(a.fxT>.28){a.fxT=0;if(a.role==='player')sfx(q.k==='tree'?'chop':'cast',.2);
    if(q.k==='tree'){var tsp0=TREES[q.sp];parts.push({x:q.x+(Math.random()-.5)*14,y:q.y-14,vx:(Math.random()-.5)*18,vy:-6,g:26,life:1.1,max:1.1,col:Math.random()<.5?tsp0.c1:tsp0.c2,r:1.7,leaf:1});q.hit=.25;}
    else if(q.k==='ore'){q.hit=.25;for(var sk=0;sk<3;sk++)parts.push({x:q.x+(Math.random()-.5)*10,y:q.y-6,vx:(Math.random()-.5)*50,vy:-20-Math.random()*30,g:120,life:.4,max:.4,col:Math.random()<.5?'#fff1a8':'#ffb14a',r:1.1,spark:true});}
    else{parts.push({x:q.x,y:q.y,vx:0,vy:0,g:0,life:.7,max:.7,col:'#ffffff',r:3,ring:1});}
    /* v77: the hero's own gathering throws extra, more colourful sparkle the higher his tier (same tier that changes his look) */
    if(a.role==='player'){var htG=heroTier();if(htG>0)for(var gpi=0;gpi<htG;gpi++)parts.push({x:q.x+(Math.random()-.5)*16,y:q.y-10,vx:(Math.random()-.5)*60,vy:-28-Math.random()*30,g:90,life:.5,max:.5,col:'hsl('+Math.floor(Math.random()*360)+',90%,70%)',r:1.6,star:1});}
  }
  if(a.prog>=need)harvest(a);
}
/* gathering tile: pick the nearest harvestable resource in this tile and work it */
function workTile(a,t,dt){
  var st=siteOfTile(t.c,t.r);if(!st||!owned(st.id))return false;
  if(a.res&&(!a.res.alive||a.res.by!==a||a.res.tc!==t.c||a.res.tr!==t.r))release(a);
  if(!a.res){
    var room=a.role==='player'?((cvLv(st.id)||st.kind==='mine')?pn(st.id)<pcap():bagN(a)<cap()):pileRoomW(st.id,a);
    if(!room){if(a.role==='player'&&a.lockT<=0){addFloat(a.x,a.y-30,cvLv(st.id)?'벨트가 밀려 있어요':'적재칸이 가득! 챙겨서 팔아요','#ffb3b3');a.lockT=3;}return false;}
    var best=null,bd=1e9;harvestable(a,t.c,t.r).forEach(function(q){var d=Math.hypot(q.x-a.x,q.y-a.y);if(d<bd){bd=d;best=q;}});
    if(!best){
      if(a.role==='player'&&a.lockT<=0){var lk=resInTile(t.c,t.r).filter(function(q){return q.alive&&!okFor(a.gear,q);})[0];if(lk){addFloat(a.x,a.y-30,needMsg(lk),'#ffe2a8');a.lockT=3;}}
      return false;}
    best.by=a;a.res=best;a.prog=0;
  }
  var p=stand(a.res,a);if(moveTo(a,p.x,p.y,dt)){a.dir=a.res.x>=a.x?1:-1;progress(a,dt);}else{a.prog=0;a.res.prog=0;}
  return true;
}
/* storage tile (no belt): scoop the pile into the bag */
function collectStore(a,t,dt){
  var st=siteOfTile(t.c,t.r);if(!st||cvLv(st.id)||st.kind==='mine')return false;
  a.colT-=dt;if(a.colT>0)return true;a.colT=.25;
  var room=cap()-bagN(a);if(room<=0||pn(st.id)<=0)return false;
  var got=takeFromPile(a,st.id,room);if(got>0){addFloat(a.x,a.y-30,'📦+'+got,'#cfe6ff',true);sfx('pickup');}
  return true;
}
function idleInTile(a,dt){var t=tileOf(a);if(!t)return;a.idleT-=dt;if(a.idleT<=0){a.idleT=2+Math.random()*3;a.ix=tileXw(t.c,t.r)+(Math.random()-.5)*(isBank(t.c,t.r)?4:24);a.iy=tileYw(t.c,t.r)+(Math.random()-.5)*18;}moveTo(a,a.ix,a.iy,dt);}
/* drop carried goods on a stall counter */
function dropAt(a,line){
  var n=0,room=stallCap(line)-lineStock(line);
  for(var id in a.bag){
    if(ITEMS[id].line!==line)continue;
    var put=Math.min(a.bag[id],Math.max(0,room));if(put<=0)continue;
    addSs(line,id,put);a.bag[id]-=put;room-=put;n+=put;if(a.bag[id]<=0)delete a.bag[id];
  }
  if(n>0){if(a.role==='player'&&line==='wood'&&S.tut===2)S.tutDelivered=true;addFloat(STALL[line].x-20,STALL[line].y-26,'📦+'+n,'#ffffff',true);sfx('pickup');}
  return n;
}
var DROP_TILE={wood:{c:0,r:2},fish:{c:4,r:2}},WH_TILE={c:1,r:2};
/* market walkway: rows 0-2 = wood stall, rows 3-4 = fish stall, row 5 = warehouse door */
function tryDrops(a){
  var t=tileOf(a);if(!t||bagN(a)<=0||a.path.length)return;
  if(sameTile(t,DROP_TILE.wood))dropAt(a,'wood');else if(sameTile(t,DROP_TILE.fish))dropAt(a,'fish');
  else if(false){var n=0,room=whCap()-whTotal();for(var id in a.bag){var put=Math.min(a.bag[id],Math.max(0,room));if(put<=0)continue;addWh(id,put);a.bag[id]-=put;room-=put;n+=put;if(a.bag[id]<=0)delete a.bag[id];}
    if(n>0){addFloat(WH.x0+20,WH.wall+6,'🏭 +'+n,'#ffffff');hopW.wood=1;}}
}
/* piles hold mixed species; take the most valuable first */
function takeFromPile(a,sid,max){
  var p=S.piles[sid];if(!p)return 0;
  var ids=Object.keys(p).filter(function(k){return p[k]>0;}).sort(function(x,y){return ITEMS[y].sp.val-ITEMS[x].sp.val;}),got=0;
  ids.forEach(function(id){var t=Math.min(p[id],max-got);if(t>0){p[id]-=t;got+=t;a.bag[id]=(a.bag[id]||0)+t;}});
  return got;
}
function deliverLine(a){var w=bagLine(a,'wood'),f=bagLine(a,'fish');return w>=f?(w>0?'wood':null):'fish';}
function autoDropTile(line){return DROP_TILE[line||'wood'];}
function bestGatherTile(a){
  var best=null,bs=-1e9,from=tileOf(a)||{c:2,r:4};
  SITES.forEach(function(st){
    if(!owned(st.id))return;
    if(a.role==='lumber'&&st.kind!=='forest')return;
    if(a.role==='fisher'&&st.kind!=='pond')return;
    if(a.role==='miner'&&st.kind!=='mine')return;
    if(a.role!=='miner'&&a.role!=='player'&&st.kind==='mine')return;
    var room=a.role==='player'?(pn(st.id)<pcap()||bagN(a)<cap()):pileRoomW(st.id,a);if(!room)return;
    st.tiles.forEach(function(t){if(t.store||t.pad)return;var n=harvestable(a,t.c,t.r).length;if(!n)return;
      var crowd=agents.filter(function(x){return x!==a&&x.goal&&sameTile(x.goal,t);}).length;
      var sc=n*2-crowd*3-(Math.abs(t.c-from.c)+Math.abs(t.r-from.r))*.4+(sameTile(a.goal,t)?1:0);
      if(sc>bs){bs=sc;best=t;}});
  });
  return best;
}
function stepWorker(a,dt){
  a.full=false;
  if(a.path.length){followPath(a,dt);return;}
  var t=tileOf(a);
  if(t&&tileKind(t.c,t.r)==='gather'&&workTile(a,t,dt))return;
  a.thinkT-=dt;
  if(a.thinkT<=0){a.thinkT=.25;var b=bestGatherTile(a);if(b&&!sameTile(b,t)){goTile(a,b);return;}}
  waitForRes(a,dt);
}
/* nothing to cut right now: stand by the resource that grows back soonest instead of wandering */
function waitForRes(a,dt){
  var k=a.role==='lumber'?'tree':(a.role==='fisher'?'fish':'ore'),best=null,bt=1e9;
  res.forEach(function(q){if(q.k!==k||!owned(q.s)||(q.by&&q.by!==a))return;var crowd=0;agents.forEach(function(o){if(o!==a&&o.waitQ===q)crowd++;});
    var tt=(q.alive?0:q.timer)+crowd*4+Math.hypot(q.x-a.x,q.y-a.y)/80;if(tt<bt){bt=tt;best=q;}});
  a.waitQ=best;a.full=best&&!pileRoomW(best.s,a);
  if(!best){idleInTile(a,dt);return;}
  var t=tileOf(a);if(!t||t.c!==best.tc||t.r!==best.tr){goTile(a,{c:best.tc,r:best.tr});return;}
  var p=stand(best,a);if(moveTo(a,p.x,p.y,dt)){a.dir=best.x>=a.x?1:-1;a.mv=false;}
}
function stepPlayerManual(a,dt){
  tryDrops(a);a.lockT-=dt;
  if(a.path.length){followPath(a,dt);return;}
  var t=tileOf(a);if(!t)return;var k=tileKind(t.c,t.r);
  if(k==='gather'){if(!workTile(a,t,dt))a.prog=0;}
  else if(k==='store')collectStore(a,t,dt);
}
function stepPlayerAuto(a,dt){
  tryDrops(a);a.lockT=1;
  if(!a.path.length&&bagN(a)===0){var cl=cashSpots().filter(function(o){return (S.cash&&S.cash[o.k]||0)>=25;})[0];if(cl){var ctg=cl.b?tileAt(cl.p.x,cl.p.y):DROP_TILE[cl.k],ct=tileOf(a);if(ctg&&!sameTile(ct,ctg)){goTile(a,ctg);return;}if(ctg&&Math.hypot(a.x-cl.p.x,a.y-cl.p.y)>30){moveTo(a,cl.p.x,cl.p.y-6,dt);return;}}}
  if(autoHunt(a,dt))return;
  if(a.path.length){followPath(a,dt);return;}
  var t=tileOf(a),k=t&&tileKind(t.c,t.r),n=bagN(a);
  if(k==='store'&&n<cap()){var ss0=siteOfTile(t.c,t.r);if(!cvLv(ss0.id)&&pn(ss0.id)>0){collectStore(a,t,dt);return;}}
  if(n>=cap()){goTile(a,autoDropTile(deliverLine(a)));return;}
  if(k==='gather'&&workTile(a,t,dt))return;
  a.thinkT-=dt;if(a.thinkT>0){idleInTile(a,dt);return;}a.thinkT=.25;
  var big=null;SITES.forEach(function(st){if(owned(st.id)&&st.kind!=='mine'&&!cvLv(st.id)&&pn(st.id)>=Math.min(pcap(),8)&&(!big||pn(st.id)>pn(big.id)))big=st;});
  if(big){goTile(a,big.store);return;}
  var b=bestGatherTile(a);if(b){if(!sameTile(b,t))goTile(a,b);return;}
  if(n>0){goTile(a,autoDropTile(deliverLine(a)));return;}
  var any=null;SITES.forEach(function(st){if(owned(st.id)&&st.kind!=='mine'&&!cvLv(st.id)&&pn(st.id)>0)any=st;});
  if(any){goTile(a,any.store);return;}
  idleInTile(a,dt);
}
/* v56 (director 2026-10-03): once a lumber / fishing crew reaches the top level it merges into one super worker -
   one big swing fells every grown tree in the forest (one cast of the net lands every fish in the river) */
var SUPER_ROLES={lumber:'axe',fisher:'rod',hunter:'bow',hunter2:'bow',hunter3:'bow',miner:'pick'},SUPER_T=1.1,SUPERFX=[],SUPERAURA=[];
/* v65 (director 2026-10-04): the three super hunters are the forest's 임꺽정, the lake's 거북선 (turtle ship) and the mine's 광개토대왕 on horseback */
var SUPERNAME={lumber:'슈퍼 나무꾼',fisher:'슈퍼 낚시꾼',hunter:'임꺽정',hunter2:'이순신 장군',hunter3:'광개토대왕',miner:'슈퍼 광부'};
function superGather(a){return !!(a.gear&&a.gear.super&&(a.role==='lumber'||a.role==='fisher'||a.role==='miner'));}
function superPos(role){return role==='lumber'?{x:210,y:276}:(role==='miner'?{x:900,y:186}:{x:518,y:276});}
function canMerge(role){var pr=SUPER_ROLES[role];if(!pr||!S.wlv||(S.wlv[role]||0)<MAXLV[pr])return false;var l=S.w.filter(function(g){return g.role===role;});return l.length>0&&!l.some(function(g){return g.super;})&&l.every(function(g){return (g[pr]||0)>=MAXLV[pr];});}
function mergeCrew(role,show){var l=S.w.filter(function(g){return g.role===role;}),keep=l[0];keep.super=1;keep.name=SUPERNAME[role];
  /* v59: workers that leave in the merge must let go of the tree / fish they had reserved - before, those stayed reserved forever and the super worker could never take them */
  agents.forEach(function(a){if(a.role===role&&a.gear!==keep)release(a);});
  S.w=S.w.filter(function(g){return g.role!==role||g===keep;});
  agents=agents.filter(function(a){return a.role==='player'||S.w.indexOf(a.gear)>=0;});
  if(S.rep)S.rep=S.rep.filter(function(e){return e.k!=='worker';});
  if(show){var p=isHunter(role)?hunterDoor(role):superPos(role);celebrate(p.x,p.y,'🌟 '+keep.name+' 탄생! '+l.length+'명이 하나로',true);flash=.6;burst(p.x,p.y-10,'#ffe27a',30,true);}
  save();}
/* v68 (director): one round of a super worker fills its loading deck to 90% (bonus goods on top of what was actually grown) */
function superTopUp(sid,k){var need=Math.ceil(.9*pcap())-pn(sid);if(need<=0)return 0;var L=Math.max(1,siteLv(sid)),ids=SPAWN[k].slice(0,spCount(L)).map(function(i){return spArr(k)[i].id;}),pl=pileOf(sid);
  for(var i=0;i<need;i++){var id=ids[Math.floor(Math.random()*ids.length)];pl[id]=(pl[id]||0)+1;}return need;}
function stepSuper(a,dt){var role=a.role,k={lumber:'tree',fisher:'fish',miner:'ore'}[role],sid={lumber:'f1',fisher:'p1',miner:'m1'}[role],p=superPos(role);
  a.working=false;if(!owned(sid)){idleInTile(a,dt);return;}
  if(Math.hypot(a.x-p.x,a.y-p.y)>3){moveTo(a,p.x,p.y,dt);return;}
  a.dir=-1;
  /* v65 (director 2026-10-04): the super fisher's net now really lands the fish - thrown out (0-0.45s), settles, the fish are lifted out of the water (0.55s)
     and hauled back inside the net, landing on the deck when the net is back (1.0s) */
  if(a.net){var N=a.net;N.t+=dt;a.working=true;
    if(N.t>=.55&&!N.lifted){N.lifted=true;N.list=N.list.filter(function(e){return e.q.alive&&(!e.q.by||e.q.by===a);});N.list.forEach(function(e){e.q.alive=false;e.q.timer=e.q.max;e.q.by=null;
      parts.push({x:e.x,y:e.y,vx:0,vy:0,g:0,life:.7,max:.7,col:'#ffffff',r:3,ring:1});for(var dr=0;dr<4;dr++)parts.push({x:e.x,y:e.y,vx:(Math.random()-.5)*40,vy:-30-Math.random()*30,g:120,life:.5,max:.5,col:'#bfe9f7',r:1.4});});
      if(Math.hypot(agents[0].x-a.x,agents[0].y-a.y)<160)sfx('splash',.2);}
    if(N.t>=1){var plN=pileOf(sid),ppN=pilePos(sid),nN=0;N.list.forEach(function(e){plN[e.id]=(plN[e.id]||0)+1;nN++;fly(e.id,a.x+12,a.y-14,ppN.x,ppN.y-6,.35+nN*.03);
        for(var st6=0;st6<2;st6++)parts.push({x:a.x+14,y:a.y-14,vx:(Math.random()-.5)*70,vy:-30-Math.random()*40,g:90,life:.9,max:.9,col:'hsl('+Math.floor(Math.random()*360)+',95%,65%)',r:2.6,star:1});});
      stat('gather',N.list.length);nN+=superTopUp(sid,k);N.done=true;a.net=null;if(nN){burst(a.x+12,a.y-14,'#fff1a8',16,true);shake(.12);addFloat(ppN.x,ppN.y-30,'🎣 +'+nN+'!','#ffe27a');sfx('pickup',.1);}}
    return;}
  /* v59 (bug: some fish were never landed): a fish/tree reserved by someone who is no longer working it counts as free */
  res.forEach(function(q){if(q.by&&!(q.by.net)&&(agents.indexOf(q.by)<0||q.by.res!==q))q.by=null;});
  var ready=res.filter(function(q){return q.s===sid&&q.k===k&&q.alive&&(!q.by||q.by===a);}),room=pcap()-pn(sid);
  a.full=!room;if(!ready.length){a.swT=0;return;}
  a.working=true;a.swT=(a.swT||0)+dt;a.swing+=dt*9;if(a.swT<SUPER_T)return;a.swT=0;
  if(k==='fish'){var lst=ready;lst.forEach(function(q){if(q.by&&q.by!==a)release(q.by);q.by=a;});a.net={t:0,list:lst.map(function(q){return {q:q,id:spOf(q).id,x:q.x,y:q.y};})};SUPERFX.push({x:a.x,y:a.y,t:0,k:'net',net:a.net,ax:a});sfx('cast',.2);return;}
  var pl=pileOf(sid),n=0,pp0=pilePos(sid);ready.forEach(function(q){var sp=spOf(q);if(q.by&&q.by!==a)release(q.by);pl[sp.id]=(pl[sp.id]||0)+1;n++;
    fly(sp.id,q.x,q.y-8,pp0.x,pp0.y-6,.45+n*.04);burst(q.x,q.y-10,'#ffe27a',6,true);SUPERFX.push({x:q.x,y:q.y,t:0,k:'pop'});
    burst(q.x,q.y-8,k==='tree'?'#b58a5a':(k==='ore'?'#c9ced4':'#bfe9f7'),5,false);for(var st5=0;st5<4;st5++)parts.push({x:q.x,y:q.y-12,vx:(Math.random()-.5)*70,vy:-30-Math.random()*40,g:90,life:.9,max:.9,col:'hsl('+Math.floor(Math.random()*360)+',95%,65%)',r:2.6,star:1});if(k==='tree')for(var lf=0;lf<3;lf++)parts.push({x:q.x+(Math.random()-.5)*14,y:q.y-14,vx:(Math.random()-.5)*30,vy:-14,g:30,life:1,max:1,col:Math.random()<.5?TREES[q.sp].c1:TREES[q.sp].c2,r:1.7,leaf:1});
    else parts.push({x:q.x,y:q.y,vx:0,vy:0,g:0,life:.7,max:.7,col:'#ffffff',r:3,ring:1});
    q.alive=false;q.timer=q.max;});
  stat('gather',n);n+=superTopUp(sid,k);SUPERFX.push({x:a.x,y:a.y,t:0,k:k});burst(a.x,a.y-14,'#fff1a8',18,true);burst(a.x,a.y-14,k==='tree'?'#ffb14a':'#8fe8ff',12,true);shake(.12);var pp=pilePos(sid);addFloat(pp.x,pp.y-30,(k==='tree'?'🪓 ':'🎣 ')+'+'+n+'!','#ffe27a');
  if(Math.hypot(agents[0].x-a.x,agents[0].y-a.y)<160)sfx(k==='tree'?'fell':'splash',.3);}
function step(a,dt){
  if(superGather(a)){a.mv=false;if(a.stunT>0){a.stunT-=dt;return;}stepSuper(a,dt);return;}
  a.mv=false;a.working=false;
  if(a.role==='player')((S.auto&&!joy.on&&!a.tap)?stepPlayerAuto:stepPlayerFree)(a,dt);
  else if(isHunter(a.role)){stepHunter(a,dt);hunterSeparate(a,dt);a.x=Math.max(8,Math.min(fenceX()-10,a.x));a.y=Math.max(WORLD_TOP+8,Math.min(HT-12,a.y));} /* v64: hunters never leave the map */
  else{if(a.stunT>0){a.stunT-=dt;return;}if(a.role==='miner'&&!owned('m1')){idleInTile(a,dt);return;}if(bearNear(a,a.role==='fisher'?44:30)){a.working=a.role==='lumber';return;}stepWorker(a,dt);}
}

