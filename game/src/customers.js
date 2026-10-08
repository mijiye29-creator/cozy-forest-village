/* ---------- customers (market side only) ---------- */
var customers=[],spawnT=3,lineSpawnT={wood:2,fish:3};
var CUST_COL=['#3ea9eb','#aa72e5','#f2963b','#4bbf76','#ed668d','#edc331'];
var HAIR=['#3a2c22','#7a4d2b','#c9a45a','#2b2b35','#a0522d'];
function serv(line){return Math.min(4,1+Math.floor((S.shop[line]-1)/2))+shopClerks(line);}
/* v60 (director 2026-10-04): a bigger shop keeps a longer queue - Lv1 4 people ... Lv7+ 10 */
function qmax(line){return Math.min(10,3+S.shop[line]);}
function shopSide(line){return line==='wood'?-1:1;}
function slotPos(line,i){var s=STALL[line],side=shopSide(line);return {x:s.x+side*(40+Math.floor(i/5)*22),y:s.y+28+(i%5)*19};}
function entryX(line){return line==='wood'?-14:W+14;}
function lineOf(line){var l=[];customers.forEach(function(c){if(c.state!=='out'&&c.seller===line)l.push(c);});return l;}
function spawnInterval(){
  var tot=lineStock('wood')+lineStock('fish');
  var base=Math.max(1.6,5.2-siteScore()*.25)/(1+0.1*(S.shop.wood+S.shop.fish-2));
  return Math.max(.25,base*.18/(1+tot/40));
}
function chooseWant(only){
  var cands=[],sum=0;
  function add(id,w){var l=ITEMS[id].line;if(only&&l!==only)return;if(!lineOpen(l)||lineOf(l).length>=qmax(l))return;if(id===HOT.id)w+=2;cands.push({id:id,w:w});sum+=w;}
  var hasW=lineStock('wood')>0,hasF=lineStock('fish')>0;
  TREES.forEach(function(s,i){var n=ss('wood',s.id);if(n>0||(!hasW&&speciesAvail('forest',i)))add(s.id,n>0?1+n*.45:1);});
  FISH.forEach(function(s,i){var n=ss('fish',s.id);if(n>0||(!hasF&&speciesAvail('pond',i)))add(s.id,n>0?1+n*.45:1);});
  BEAR_ITEMS.forEach(function(b){if(ss(b.line,b.id)>0)add(b.id,2+ss(b.line,b.id)*.6);});
  if(!cands.length)return null;
  var r=Math.random()*sum;
  for(var i=0;i<cands.length;i++){r-=cands[i].w;if(r<=0)return cands[i].id;}
  return cands[cands.length-1].id;
}
function newCustomer(only){
  var want=chooseWant(only);if(!want)return null;
  var line=ITEMS[want].line,goods=ITEMS[want].cat==='goods',s=ss(line,want);
  var qty=Math.min(3,1+Math.floor(Math.random()*2)+(s>=8&&Math.random()<.4?1:0));if(ITEMS[want].cat==='bear')qty=Math.max(1,Math.min(qty,s));
  var regular=Math.random()<shopRegularChance(line);if(regular)qty++;var pat=(40+qty*1.3+6*S.shop[line])*(regular?1.6:1);
  var sp=slotPos(line,lineOf(line).length);
  var ex=STALL[line].x+shopSide(line)*84;
  return {x:ex,ex:ex,y:-18,want:want,qty:qty,regular:regular,seller:line,pat:pat,max:pat,state:'line',slot:0,st:0,got:0,
    col:CUST_COL[Math.floor(Math.random()*CUST_COL.length)],pants:['#4a4a5a','#3f4f7a','#5b4a3a','#5d6b3d'][Math.floor(Math.random()*4)],hair:HAIR[Math.floor(Math.random()*HAIR.length)],bob:0,dir:-1,mv:false,mood:''};
}
function moveC(c,x,y,dt,m){
  var dx=x-c.x,dy=y-c.y,d=Math.hypot(dx,dy),s=62*m*dt;
  if(d<=s){c.x=x;c.y=y;c.mv=false;return true;}
  c.x+=dx/d*s;c.y+=dy/d*s;c.mv=true;c.bob+=dt*12;if(Math.abs(dx)>.5)c.dir=dx>0?1:-1;return false;
}
function updateCustomers(dt){
  spawnT-=dt;
  if(spawnT<=0){spawnT=spawnInterval()*(.7+Math.random()*.6);var nc=newCustomer();if(nc)customers.push(nc);}
  /* v60: each shop also tops up its own queue - the higher the shop level, the faster new customers walk in, so a levelled shop always has a line */
  LINES.forEach(function(l){if(!lineOpen(l))return;lineSpawnT[l]-=dt;if(lineSpawnT[l]>0)return;var lv=S.shop[l],n=lineOf(l).length,iv=2.4/(1+.3*(lv-1));
    lineSpawnT[l]=iv*(n<serv(l)+1?.45:1)*(.7+Math.random()*.6);if(n<qmax(l)){var c2=newCustomer(l);if(c2)customers.push(c2);}});
  LINES.forEach(function(l){lineOf(l).forEach(function(c,i){c.slot=i;});});
  for(var i=customers.length-1;i>=0;i--){
    var c=customers[i];
    var ex=c.ex!==undefined?c.ex:entryX(c.seller);
    if(c.state==='out'){if(c.cheerUntil>time){c.mv=false;continue;}if(Math.abs(c.x-ex)>1)moveC(c,ex,c.y,dt,1.4);else moveC(c,ex,-40,dt,1.4);if(c.y<-30)customers.splice(i,1);continue;}
    c.pat-=dt;
    var sp=slotPos(c.seller,c.slot),arr;if(c.y<sp.y-1)arr=moveC(c,ex,sp.y,dt,1.3)&&false;else arr=moveC(c,sp.x,sp.y,dt,1);
    if(c.pat<=0&&c.state!=='serve'){
      if(c.got>0){addSs(c.seller,c.want,c.got);c.got=0;}
      c.state='out';c.mood='angry';S.lost++;continue;
    }
    if(c.state==='line'&&c.got===0&&ss(c.seller,c.want)<=0){var alt=null,an=0;ORDER.forEach(function(id){var it=ITEMS[id];if(it.line!==c.seller||it.cat==='goods')return;var n=ss(c.seller,id);if(n>an){an=n;alt=id;}});
      if(alt){c.want=alt;c.qty=Math.min(c.qty,Math.max(1,an));}}
    if(c.state==='line'&&c.got>0&&c.got<c.qty&&ss(c.seller,c.want)<=0){c.waitT=(c.waitT||0)+dt;if(c.waitT>1.2){c.qty=c.got;c.state='serve';c.st=.8*shopCheckoutTime(c.seller);}}else c.waitT=0;
    if(c.state==='line'&&c.slot<serv(c.seller)&&arr){
      var take=Math.min(c.qty-c.got,ss(c.seller,c.want));
      if(take>0){S.ss[c.seller][c.want]-=take;c.got+=take;}
      if(c.got>=c.qty){c.state='serve';c.st=shopCheckoutTime(c.seller);}
    }else if(c.state==='serve'){
      c.st-=dt;
      if(c.st<=0){
        var tip=c.pat/c.max>.5;
        var pay=customerPayment(c,tip);
        if(typeof actionIncome==='function'){actionIncome(pay);actionFeverPay(pay);}S.cash[c.seller]=(S.cash[c.seller]||0)+pay;S.h2=1;stat('serve',1);sfx('coin',.09);var cp0=cashPos(c.seller);
        addFloat(cp0.x,cp0.y-18,'💵+'+pay,'#c9f5c0',true);
        for(var cfi=0;cfi<Math.min(6,2+Math.ceil(pay/20));cfi++)fly('coin',c.x+(Math.random()-.5)*10,c.y-6,cp0.x+(Math.random()-.5)*12,cp0.y-4,.36+cfi*.05);
        checkPop(c.x,c.y-24);if(c.regular&&Math.random()<.15)addFloat(c.x,c.y-40,c.seller==='fish'?'호수 쪽 물소리가 다시 들려요':'밤에 숲 뿌리가 파랗게 빛났대요','#ffe6a0',true);
        c.state='out';c.mood='happy';c.cheerUntil=time+1;c.happyUntil=time+1.8;
      }
    }
  }
}

