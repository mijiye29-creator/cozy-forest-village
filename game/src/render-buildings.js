/* storage shed on the lot: goods pile up here and the truck loads straight from it */
/* Oblique miniature architecture: consistent top-left light, real depth and cast shadows. */
function artPoly(g,points,color){g.fillStyle=color;g.beginPath();points.forEach(function(p,i){if(i)g.lineTo(p[0],p[1]);else g.moveTo(p[0],p[1]);});g.closePath();g.fill();}
function artShade(hex,factor){var n=parseInt(hex.slice(1),16);return '#'+[n>>16,(n>>8)&255,n&255].map(function(c){return Math.max(0,Math.min(255,Math.round(c*factor))).toString(16).padStart(2,'0');}).join('');}
function isoBox(g,x,y,w,d,h,color){
  var rise=d*.58;artPoly(g,[[x+3,y+2],[x+w+3,y+2],[x+w+d+9,y-rise+7],[x+d+9,y-rise+7]],'rgba(25,43,39,.16)');
  drawFacilitySolid3D(g,x,y,w,d,h,color);
  g.strokeStyle=artShade(color,1.34);g.lineWidth=.8;g.beginPath();g.moveTo(x,y-h);g.lineTo(x+w,y-h);g.lineTo(x+w+d,y-h-rise);g.stroke();
}
function isoRoof(g,x,y,w,d,h,color,metal){
  var rise=d*.58;artPoly(g,[[x-3,y],[x+w/2,y-h],[x+w+3,y]],artShade(color,.84));
  artPoly(g,[[x-3,y],[x+w/2,y-h],[x+w/2+d,y-h-rise],[x+d-3,y-rise]],artShade(color,1.17));
  artPoly(g,[[x+w/2,y-h],[x+w+3,y],[x+w+d+3,y-rise],[x+w/2+d,y-h-rise]],artShade(color,.71));
  g.strokeStyle=artShade(color,1.4);g.lineWidth=.8;g.beginPath();g.moveTo(x-3,y);g.lineTo(x+w/2,y-h);g.lineTo(x+w/2+d,y-h-rise);g.stroke();
  g.strokeStyle=artShade(color,.62);g.lineWidth=metal?.75:.5;for(var seam=1;seam<7;seam++){var t=seam/7;g.beginPath();g.moveTo(x-3+(w/2+3)*t,y-h*t);g.lineTo(x+d-3+(w/2+3)*t,y-h*t-rise);g.stroke();}
  g.fillStyle='#edf0e4';g.beginPath();g.moveTo(x+w/2-7,y-h+4);g.lineTo(x+w/2,y-h);g.lineTo(x+w/2+d,y-h-rise);g.lineTo(x+w/2+d+4,y-h-rise+3);g.lineTo(x+w/2+4,y-h+4);g.closePath();g.fill();
  g.fillStyle=artShade(color,.55);g.fillRect(x-3,y,w+6,2.5);
}
function isoGlass(g,x,y,w,h){
  g.fillStyle='#314f57';g.fillRect(x-1,y-1,w+2,h+2);var glass=g.createLinearGradient(x,y,x+w,y+h);glass.addColorStop(0,'#d1e7e2');glass.addColorStop(.38,'#7cafb9');glass.addColorStop(1,'#2e6274');g.fillStyle=glass;g.fillRect(x,y,w,h);
  artPoly(g,[[x+1,y+1],[x+w*.6,y+1],[x+1,y+h*.7]],'rgba(250,255,243,.35)');g.strokeStyle='#e3ddc6';g.lineWidth=1;g.strokeRect(x,y,w,h);for(var p=x+9;p<x+w;p+=9){g.beginPath();g.moveTo(p,y);g.lineTo(p,y+h);g.stroke();}
}
function isoTank(g,x,y,w,h,color){
  var metal=g.createLinearGradient(x-w/2,0,x+w/2,0);metal.addColorStop(0,artShade(color,.58));metal.addColorStop(.25,artShade(color,1.18));metal.addColorStop(.55,color);metal.addColorStop(1,artShade(color,.55));g.fillStyle=metal;g.fillRect(x-w/2,y-h,w,h);g.beginPath();g.ellipse(x,y,w/2,w*.22,0,0,7);g.fill();
  g.fillStyle=artShade(color,1.3);g.beginPath();g.ellipse(x,y-h,w/2,w*.22,0,0,7);g.fill();g.strokeStyle=artShade(color,.55);g.lineWidth=.7;g.beginPath();g.ellipse(x,y-h,w/2,w*.22,0,0,7);g.stroke();
  [y-h*.25,y-h*.75].forEach(function(yy){g.strokeStyle=artShade(color,.67);g.lineWidth=1.3;g.beginPath();g.ellipse(x,yy,w/2,w*.16,0,0,Math.PI);g.stroke();});
}
function artPosts(g,x,base,w,height,color){[0,w-3].forEach(function(px){isoBox(g,x+px,base,3,3,height,color);});g.strokeStyle=artShade(color,.65);g.lineWidth=2;g.beginPath();g.moveTo(x+2,base-height+13);g.lineTo(x+13,base-height+3);g.moveTo(x+w-2,base-height+13);g.lineTo(x+w-13,base-height+3);g.stroke();}
function artBricks(g,x,y,w,h){g.strokeStyle='rgba(63,44,33,.28)';g.lineWidth=.55;for(var r=0;r<h;r+=7){g.beginPath();g.moveTo(x,y+r);g.lineTo(x+w,y+r);for(var c=(r%14?5:0);c<w;c+=11){g.moveTo(x+c,y+r);g.lineTo(x+c,y+Math.min(h,r+7));}g.stroke();}}
function drawIndustrialBuilding(g,pl,L){
  var b=pl.def,x=pl.shedLeft?46:4,base=118,w=76,d=10,wood='#edab54',brick='#df7953',metal='#42b9c6',roof='#197fab';
  var heights=[28,42,52,64,60,72,82,94],h=heights[L-1],wall=[wood,'#ffc778','#d98e43',brick,'#83d6d4',metal,'#258ebd','#c4f0e4'][L-1];
  isoBox(g,x-3,base+8,w+3,d+1,8,'#a7b2a0');
  if(b==='mill'){
    if(L===1){isoBox(g,x+4,base-2,58,9,16,'#ad8250');isoTank(g,x+22,base-17,13,32,'#ac8758');}
    if(L===2){artPosts(g,x,base,w,43,wood);isoBox(g,x+3,base-1,w-8,8,17,'#52c291');isoRoof(g,x,base-43,w,d,13,'#aa825a');}
    if(L===3||L===4){isoBox(g,x,base,w,d,h,wall);g.fillStyle='#263f39';g.fillRect(x+7,base-36,w-14,30);artPosts(g,x+4,base,w-8,h,wood);isoRoof(g,x,base-h,w,d,L===3?18:26,L===3?'#249970':'#537fc4');if(L===4)isoGlass(g,x+20,base-h+5,35,13);}
    if(L===5){isoBox(g,x,base,w-12,d,60,'#c9b98c');isoRoof(g,x,base-60,w-12,d,26,'#179c91');g.fillStyle='#304b40';g.fillRect(x+7,base-34,42,28);isoTank(g,x+w-6,base-5,18,46,'#20aaa5');g.strokeStyle='#d9c894';g.lineWidth=2;for(var spoke=0;spoke<8;spoke++){var a=spoke*Math.PI/4;g.beginPath();g.moveTo(x+w-6,base-27);g.lineTo(x+w-6+Math.cos(a)*9,base-27+Math.sin(a)*9);g.stroke();}}
    if(L===6){artPosts(g,x,base,w,76,'#43bbb0');isoBox(g,x-2,base-72,w+3,12,8,'#298dad');isoBox(g,x+7,base-4,w-16,10,24,'#6cd7bd');isoGlass(g,x+8,base-65,58,24);}
    if(L===7){isoBox(g,x,base,w,d,64,'#43baca');isoGlass(g,x+5,base-59,w-10,23);isoBox(g,x+12,base-64,48,10,24,'#8be3ce');isoGlass(g,x+15,base-83,41,14);isoRoof(g,x+10,base-88,52,10,10,'#147c9d',true);}
    if(L===8){isoBox(g,x,base,w,d,70,'#c3cdbc');isoGlass(g,x+5,base-62,w-10,29);isoBox(g,x+3,base-70,32,12,33,'#748f91');isoGlass(g,x+6,base-96,25,18);isoBox(g,x+3,base-103,32,12,3,'#f1c342');artPosts(g,x+42,base,w-44,88,'#69858b');isoBox(g,x+37,base-83,w-35,12,5,'#ffbe43');}
    if(L>=5){g.strokeStyle='#dfbd72';g.lineWidth=2;g.beginPath();g.moveTo(x+4,base-30);g.lineTo(x+w-4,base-30);g.stroke();}
    isoBox(g,x+5,base+1,58,9,6,'#b68f5b');for(var log=0;log<3;log++){isoBox(g,x+51,base-8-log*4,19,7,3,'#d1b27c');}
  }else if(b==='smoke'){
    if(L<=2){for(var t=0;t<L;t++){isoTank(g,x+21+t*30,base-4,22,30+t*6,'#976c4d');isoBox(g,x+18+t*30,base-34-t*6,6,6,12,'#695b4e');}if(L===2){artPosts(g,x,base,w,54,wood);isoRoof(g,x,base-54,w,d,13,'#9e6847');}}
    if(L===3||L===4){isoBox(g,x,base,w,d,h,brick);artBricks(g,x,base-h,w,h);isoRoof(g,x,base-h,w,d,L===3?19:12,'#815c48');for(var f=0;f<(L===4?2:1);f++){isoBox(g,x+13+f*37,base-4,21,3,29,'#513f34');isoBox(g,x+19+f*37,base-h,9,8,L===4?30:20,'#a26d52');}}
    if(L===5){isoBox(g,x,base,31,d,57,'#c5b291');isoRoof(g,x,base-57,31,d,21,'#a47953');isoTank(g,x+57,base-4,32,69,'#748884');isoBox(g,x+53,base-73,8,8,20,'#5c7370');}
    if(L===6){isoBox(g,x,base,w,d,18,'#abb9ae');isoTank(g,x+21,base-18,26,62,'#aebfb8');isoTank(g,x+54,base-18,26,48,'#83a6a2');isoBox(g,x+5,base-4,66,4,13,'#647c77');}
    if(L===7){isoBox(g,x,base,w,d,64,'#b17955');artBricks(g,x,base-64,w,64);isoRoof(g,x,base-64,w,d,12,'#536f6b');isoBox(g,x+55,base-52,13,10,53,'#93694e');isoGlass(g,x+6,base-56,37,18);}
    if(L===8){isoBox(g,x,base,w,d,71,'#b8cebd');isoGlass(g,x+5,base-63,52,24);isoBox(g,x-1,base-71,w+2,13,4,'#66888b');isoTank(g,x+23,base-77,28,24,'#92b2ad');isoTank(g,x+55,base-77,21,18,'#708f98');isoBox(g,x+61,base-7,13,4,47,'#596e65');}
    g.fillStyle='#263b32';rr(g,x+10,base-27,19,23,7);g.fill();var heat=g.createLinearGradient(0,base-20,0,base-4);heat.addColorStop(0,'#99432e');heat.addColorStop(1,'#f2bd59');g.fillStyle=heat;rr(g,x+13,base-19,13,14,4);g.fill();
    if(L>=3){g.strokeStyle='#796043';g.lineWidth=1.5;g.beginPath();g.moveTo(x+37,base-26);g.lineTo(x+69,base-26);g.stroke();for(var fish=0;fish<4;fish++){g.fillStyle='#d4ab73';g.beginPath();g.ellipse(x+42+fish*7,base-19,2,5,0,0,7);g.fill();}}
  }else if(b==='smelt'){
    if(L===1){isoBox(g,x+14,base-3,42,15,38,'#999e8b');isoBox(g,x+21,base-41,28,12,6,'#737d6b');}
    if(L===2){isoBox(g,x+7,base,w-15,d,47,'#af8964');artPosts(g,x,base,w,65,'#9b7b55');isoRoof(g,x,base-65,w,d,12,'#8b7958');isoBox(g,x+48,base-40,12,10,38,'#766c5b');}
    if(L===3||L===4){isoBox(g,x+5,base,w-9,d,h,brick);artBricks(g,x+5,base-h,w-9,h);isoBox(g,x+18,base-h,37,10,L===3?24:33,'#9c7455');isoBox(g,x+15,base-h-(L===3?24:33),43,12,4,'#ccb899');if(L===4){isoTank(g,x+w-8,base-4,20,68,'#708e86');}}
    if(L===5){isoTank(g,x+37,base-2,52,70,'#77938b');isoBox(g,x+8,base-4,8,8,93,'#5d756f');isoBox(g,x+65,base-4,8,8,79,'#83998e');}
    if(L===6){isoTank(g,x+20,base-4,29,71,'#91a59a');isoTank(g,x+56,base-4,31,84,'#648b8b');isoBox(g,x+15,base-68,47,10,6,'#b1b7a2');}
    if(L===7){isoBox(g,x+9,base,57,d,76,'#779397');isoTank(g,x+37,base-76,43,24,'#a1b7ac');isoBox(g,x+3,base-4,8,9,92,'#617f76');isoGlass(g,x+50,base-52,18,20);}
    if(L===8){isoBox(g,x+2,base,w-3,11,83,'#a2b7a9');isoBox(g,x+13,base-83,52,13,23,'#587c89');isoBox(g,x+10,base-106,58,13,3,'#d1bd86');isoGlass(g,x+7,base-72,23,28);isoBox(g,x+50,base-7,19,6,51,'#5b7779');}
    g.fillStyle='#493c31';rr(g,x+26,base-30,24,27,9);g.fill();var glow=g.createLinearGradient(0,base-28,0,base-4);glow.addColorStop(0,'#bb5636');glow.addColorStop(.55,'#e98d3d');glow.addColorStop(1,'#ffdf8a');g.fillStyle=glow;rr(g,x+30,base-24,16,18,6);g.fill();isoBox(g,x+19,base+3,38,11,4,'#9b8c6e');
  }else{
    if(L===1){isoBox(g,x+5,base-5,61,12,19,'#ad956b');isoBox(g,x+11,base-24,19,5,15,'#738f8b');isoGlass(g,x+13,base-36,15,8);}
    if(L===2){artPosts(g,x,base,w,52,wood);isoRoof(g,x,base-52,w,d,15,'#648776');isoBox(g,x+5,base-5,61,10,22,'#8aa399');}
    if(L===3||L===4){isoBox(g,x,base,w,d,h,L===3?'#c7b187':'#9eb7b2');isoRoof(g,x,base-h,w,d,L===3?24:12,L===3?'#527b79':'#597b91');isoGlass(g,x+5,base-h+7,w-10,L===3?19:31);}
    if(L===5){isoBox(g,x,base,w,d,54,'#98b6aa');isoBox(g,x+43,base-54,31,10,38,'#5e8695');isoGlass(g,x+46,base-86,25,22);isoBox(g,x-2,base-54,w+4,11,4,'#778d80');}
    if(L===6){isoBox(g,x,base,w,d,70,'#b5cbc1');isoGlass(g,x+4,base-65,w-8,38);isoRoof(g,x,base-70,w,d,13,'#6c8893',true);isoTank(g,x+w-9,base-4,14,27,'#758e8d');}
    if(L===7){isoBox(g,x,base,w,d,65,'#7fa09e');isoGlass(g,x+4,base-59,w-8,31);isoBox(g,x+4,base-65,67,13,23,'#89aaa8');isoGlass(g,x+8,base-83,57,12);isoBox(g,x+2,base-88,72,13,3,'#d1c18d');}
    if(L===8){isoBox(g,x,base,w,d,79,'#c2d5c9');isoGlass(g,x+4,base-72,w-8,39);isoBox(g,x+36,base-79,40,11,26,'#567e8c');isoGlass(g,x+39,base-99,32,17);isoBox(g,x-3,base-79,42,15,4,'#b4c7b9');isoBox(g,x+33,base-105,45,12,3,'#dabf7d');}
    if(L>=3){isoBox(g,x+5,base-3,21,5,18,'#4a737a');isoGlass(g,x+7,base-18,16,9);}
    if(L>=6){var py=base-(L===6?78:L===7?91:83);for(var panel=0;panel<3;panel++){artPoly(g,[[x+4+panel*12,py],[x+14+panel*12,py],[x+20+panel*12,py-6],[x+10+panel*12,py-6]],'#315d7b');g.strokeStyle='#a9cad1';g.lineWidth=.5;g.stroke();}}
    g.fillStyle='#e3ce89';g.beginPath();g.moveTo(x+55,base-23);g.lineTo(x+47,base-12);g.lineTo(x+54,base-12);g.lineTo(x+50,base-4);g.lineTo(x+63,base-18);g.lineTo(x+55,base-18);g.closePath();g.fill();
  }
}
function drawWorkshopStorage(g,pl,L){
  var x=shedX(pl)+2,base=128,w=39,d=9,h=[30,40,48,59,69][L-1],col=['#a68a5f','#bfa175','#b9b8a1','#8bafb0','#c7d1be'][L-1];
  if(drawFacilitySprite(g,L<=2?'storage':'warehouse',x+w/2,base+4,w+10,h+18,L,5,0))return;
  isoBox(g,x-2,base+4,w+3,d,5,'#adb39e');
  if(L===1){isoBox(g,x,base,w,d,5,col);artPosts(g,x,base,w,h,'#9e8052');}
  else{isoBox(g,x,base,w,d,h,col);if(L===3)artBricks(g,x,base-h,w,h);if(L>=4)isoGlass(g,x+3,base-h+5,w-6,12);}
  if(L<=3)isoRoof(g,x,base-h,w,d,L===2?12:7,L===1?'#90754f':L===2?'#6f8c77':'#597681');else isoBox(g,x-2,base-h,w+4,d+1,3,L===4?'#426e7d':'#bbad72');
  g.fillStyle='#30433a';g.fillRect(x+3,base-23,w-6,21);g.fillStyle='#ab9066';g.fillRect(x+3,base-12,w-6,2);
  if(L>=3){isoBox(g,x+2,base-24,w-4,2,4,'#809086');}if(L===5){isoTank(g,x+19,base-h-3,12,12,'#859e99');}
}
function drawWorkshop(g,pl){
  if(!spriteVisible(pl.x+pl.w/2,pl.y+pl.h/2,Math.max(pl.w,pl.h)))return;
  var b=pl.def,L=S[b]||1,SL=(S.pst&&S.pst[b])||0,key='industrial-3d-v2-'+b+'-'+L+'-'+SL+'-'+pl.w;
  var kind={mill:'sawmill',smoke:'smokehouse',smelt:'smelter',elec:'power_plant'}[b],fromSprite=drawFacilitySprite(g,kind,pl.x+pl.w/2,pl.y+pl.h-6,pl.w-8,pl.h-6,L,8,procBusy[b]>0?time:0);
  if(!fromSprite){
  var art=tileImg(key,pl.w,function(c){
    isoBox(c,2,pl.h-5,pl.w-15,11,6,'#c6cbb8');c.strokeStyle='rgba(79,103,82,.18)';c.lineWidth=.6;for(var tile=14;tile<pl.w-8;tile+=14){c.beginPath();c.moveTo(tile,pl.h-11);c.lineTo(tile+6,pl.h-18);c.stroke();}
    drawIndustrialBuilding(c,pl,L);if(SL)drawWorkshopStorage(c,{x:0,y:0,w:pl.w,def:b,shedLeft:pl.shedLeft},SL);
    else{var sx=pl.shedLeft?3:pl.w-39;c.strokeStyle='#93a38c';c.setLineDash([2,3]);c.strokeRect(sx,88,32,38);c.setLineDash([]);}
  },pl.h);g.drawImage(art,pl.x,pl.y,pl.w,pl.h);
  }else if(SL){g.save();g.translate(pl.x,pl.y);drawWorkshopStorage(g,{x:0,y:0,w:pl.w,def:b,shedLeft:pl.shedLeft},SL);g.restore();}
  if(fromSprite&&L>=4)drawFacilitySprite(g,'workshop',pl.x+pl.w-22,pl.y+pl.h-10,40,34,L,8,procBusy[b]>0?time:0);
  var busy=procBusy[b]>0,cur=procCur[b],pr=cur?Math.min(1,procT[b]/cur.t):0,mx=pl.x+(pl.shedLeft?46:4);
  if(b==='mill'){
    var blades=L>=4?2:1;for(var blade=0;blade<blades;blade++){g.save();g.translate(mx+26+blade*19,pl.y+105);g.rotate(time*(busy?6+L:1));g.fillStyle='#e3e8dc';g.strokeStyle='#708a87';g.lineWidth=.7;g.beginPath();for(var tooth=0;tooth<18;tooth++){var an=tooth*Math.PI/9;g.lineTo(Math.cos(an)*9,Math.sin(an)*9);g.lineTo(Math.cos(an+.1)*7,Math.sin(an+.1)*7);}g.closePath();g.fill();g.stroke();g.fillStyle='#6e8884';g.beginPath();g.arc(0,0,2,0,7);g.fill();g.restore();}
    isoBox(g,mx+7+(busy?(time*8)%8:2),pl.y+121,35,5,5,'#c19b66');
  }
  if(!fromSprite)drawFacilityMotion3D(g,mx+57,pl.y+87,b,L,busy);
  if(busy){var puff=(time*.55)%1;g.fillStyle='rgba(250,246,229,'+(.35*(1-puff))+')';g.beginPath();g.ellipse(mx+61+puff*5,pl.y+22-puff*13,2+puff*3,2+puff*3,0,0,7);g.fill();g.fillStyle='#d1ad5d';rr(g,pl.x+8,pl.y+pl.h-4,(pl.w-16)*pr,2,1);g.fill();}
  if(cur)drawItem(g,cur.id,mx+40,pl.y+123,.55);
  if(SL){var sx=shedX(pl)+7,stocks=PROC[b].goods.filter(function(id){return whN(id)>0;}),units=[];stocks.forEach(function(id){for(var n=0;n<Math.min(12,whN(id));n++)units.push(id);});units.slice(0,12).forEach(function(id,i){drawItem(g,id,sx+(i%4)*8,pl.y+123-Math.floor(i/4)*7,.38);});g.fillStyle='#eaf1df';g.font='600 5px sans-serif';g.textAlign='center';g.fillText(storeN(b)+' / '+storeCap(b),shedX(pl)+21,pl.y+98);}
}

var BOARD={x:6,y:188,w:52,h:44};
function drawBoard(){
  var g=ctx,b=BOARD;
  var boardSprite=drawFacilitySprite(g,'notice_board',b.x+b.w/2,b.y+b.h+4,b.w+6,b.h+16,1,1,0);if(!boardSprite){g.fillStyle='#8a6a44';g.fillRect(b.x+6,b.y+b.h-8,3,12);g.fillRect(b.x+b.w-9,b.y+b.h-8,3,12);
  g.fillStyle='rgba(40,30,20,.18)';rr(g,b.x+2,b.y+2,b.w,b.h-4,4);g.fill();
  g.fillStyle='#b98b5e';rr(g,b.x,b.y,b.w,b.h-4,4);g.fill();
  g.fillStyle='#f6ecd2';rr(g,b.x+3,b.y+10,b.w-6,b.h-17,2);g.fill();
  }g.font='800 7px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#5b4636';g.fillText('시장 게시판',b.x+b.w/2,b.y-8);
  if(HOT.id){
    var bob=Math.sin(time*3)*1;drawItem(g,HOT.id,b.x+13,b.y+21+bob,1);
    g.fillStyle='#e2463c';g.font='800 8px sans-serif';g.textAlign='left';g.fillText('+50%',b.x+22,b.y+21);
    g.fillStyle='#5b4636';g.font='700 6.5px sans-serif';g.textAlign='center';g.fillText(ITEMS[HOT.id].name,b.x+b.w/2,b.y+32);
    var pct=Math.max(0,HOT.t/HOT.dur);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(b.x+6,b.y+37,b.w-12,2.5);g.fillStyle='#f0bb3f';g.fillRect(b.x+6,b.y+37,(b.w-12)*pct,2.5);
  }
  /* red pin */
  g.fillStyle='#e2463c';g.beginPath();blob(g,b.x+b.w-7,b.y+12,1.8);g.fill();
  if(S.whLv){g.font='700 6px sans-serif';g.fillStyle='#e2463c';g.textAlign='center';g.fillText('⚡ 급한 주문 '+rushCount,b.x+b.w/2,b.y+b.h+7);}
}
function drawPills(){PILLS=[];}

function drawMarketGround(){}

