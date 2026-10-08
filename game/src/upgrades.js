/* ---------- UI ---------- */
var fmt=function(n){return Math.floor(n).toLocaleString('ko-KR');};
function money50(n){return n>0?Math.ceil((n-1e-7)/50)*50:0;}
function moneyShort(n){n=Math.floor(n);return n>=1e12?(n/1e12).toFixed(1).replace(/\.0$/,'')+'조':n>=1e8?(n/1e8).toFixed(1).replace(/\.0$/,'')+'억':n>=1e4?(n/1e4).toFixed(1).replace(/\.0$/,'')+'만':fmt(n);}
function mkUp(o){
  if(o.cost){var originalCost=o.cost;o.cost=function(){return money50(originalCost());};}
  o.isMax=o.isMax||function(){return S[o.id]>=o.max;};
  var originalCanBuy=o.canBuy;o.canBuy=function(){return S.coins>=o.cost()&&(!originalCanBuy||originalCanBuy());};
  o.lv=o.lv||function(){return 'Lv.'+(S[o.id]+1);};
  return o;
}
function gearDef(track,title,unit){
  return mkUp({id:track,gear:true,cost:function(){return gcost(track,S.p[track]||0);},
    isMax:function(){return (S.p[track]||0)>=MAXLV[track];},
    lv:function(){return 'Lv.'+((S.p[track]||0)+1)+' · 내 장비';},
    name:function(){return title;},
    desc:function(){
      var lv=S.p[track]||0,t=tierOf(track,lv),s='';
      if(track==='boots')s+='속도 '+(100+12*lv)+'→'+(112+12*lv)+'% · ';
      if(t<4){var n=TH[track][t+1]-lv,sp=track==='axe'?TREES[t+1].name:(track==='rod'?FISH[t+1].name:'');
        s+=(n===1?'다음':n+'번 더')+' → '+NAMES[track][t+1]+unit+(sp?'('+sp+')':'');}
      else s+='최고 등급';
      return s;
    }});
}
function weaponDef(){
  return mkUp({id:'wpn',gear:true,weapon:true,cost:function(){return gcost('wpn',S.p.wpn||0);},
    hidden:function(){return true;},
    isMax:function(){return (S.p.wpn||0)>=MAXLV.wpn;},
    lv:function(){var l=S.p.wpn||0;return l?'Lv.'+l+' '+WKN[wkind()]:'없음';},
    name:function(){return '권법·발차기';},
    label:function(){var l=S.p.wpn||0,nk=wkind(l+1);return !l?'권법·발차기 수련 · 북극곰과 싸워요':(nk!==wkind(l)?'✨ '+WKN[nk]+'으로 진화!':WKN[wkind()]+' 강화 · 곰에게 더 세게');},
    cap:function(){var l=S.p.wpn||0;return l?WKN[wkind()]+' Lv'+l:'무기';},
    desc:function(){return '주먹·발차기 · 8연타 뒤 광역 궁극기';}});
}
function lowestWorker(roles,tr){var best=null;S.w.forEach(function(g){if(roles.indexOf(g.role)<0)return;var l=g[tr]||0;if(l>=MAXLV[tr])return;if(!best||l<(best[tr]||0))best=g;});return best;}
function bulkDef(tr,roles,title,eff){return mkUp({id:'bulk_'+tr+'_'+roles.join('_'),bulk:1,tr:tr,roles:roles,
  hidden:function(){return !S.w.some(function(g){return roles.indexOf(g.role)>=0;});},
  cost:function(){var g=lowestWorker(roles,tr);return g?gcost(tr,g[tr]||0,true):0;},
  isMax:function(){return !lowestWorker(roles,tr);},
  lv:function(){var ls=S.w.filter(function(g){return roles.indexOf(g.role)>=0;}).map(function(g){return g[tr]||0;});return ls.length?ls.length+'명 · 최저 Lv.'+Math.min.apply(null,ls):'';},
  name:function(){return title;},
  desc:function(){var n=0,c=S.coins,sim=S.w.filter(function(g){return roles.indexOf(g.role)>=0;}).map(function(g){return g[tr]||0;});
    while(true){var mi=-1;sim.forEach(function(l,i){if(l<MAXLV[tr]&&(mi<0||l<sim[mi]))mi=i;});if(mi<0)break;var cc=gcost(tr,sim[mi],true);if(c<cc)break;c-=cc;sim[mi]++;n++;if(n>300)break;}
    return eff+' · 지금 '+n+'번 올릴 수 있어요';}});}
var PRIM={lumber:'axe',fisher:'rod',hunter:'bow',hunter2:'bow',hunter3:'bow',miner:'pick'};
function wLv(g){return g[PRIM[g.role]]||0;}
function lowestOf(role){var best=null;S.w.forEach(function(g){if(g.role!==role||wLv(g)>=MAXLV[PRIM[role]])return;if(!best||wLv(g)<wLv(best))best=g;});return best;}
var WROLE={lumber:'나무꾼',fisher:'낚시꾼',hunter:'사냥꾼',hunter2:'호수 사냥꾼',hunter3:'광산 사냥꾼',miner:'광부'};
function wBehind(role){var L=(S.wlv&&S.wlv[role])||0;return S.w.filter(function(g){return g.role===role&&wLv(g)<L;});}
function wupCost(role){return Math.round(wupCost0(role)*(role==='miner'?3:(role==='hunter'?.8:(role==='hunter2'?2.5:(role==='hunter3'?4:1))))*stageCostMult(role==='miner'?3:(role==='fisher'?2:1)));}
function wupCost0(role){var L=S.wlv[role]||0,pr=PRIM[role],b=wBehind(role);
  if(b.length){var c=0;b.forEach(function(g){for(var l=wLv(g);l<L;l++)c+=gcost(pr,l,true);});return Math.max(10,Math.round(c*.9));}
  return Math.round(gcost(pr,L,true)*2*(.6+.4*count(role)));}
/* v67 (director): a hunter crew can only take its final upgrade once all 5 hunters of that village are hired */
function wupLock(role){if(!isHunter(role))return '';var L=(S.wlv&&S.wlv[role])||0;return (!wBehind(role).length&&L+1>=MAXLV.bow&&count(role)<5)?'사냥꾼 5명을 모두 고용해야 최고 레벨로 올려요':'';}
function wupDef(role,title){return mkUp({id:'wup_'+role,wup:role,lock:function(){return wupLock(role);},canBuy:function(){return !wupLock(role)&&S.coins>=wupCost(role);},why:function(){return wupLock(role)||'코인이 부족해요';},
  hidden:function(){return !S.w.some(function(g){return g.role===role;});},
  cost:function(){return wupCost(role);},
  isMax:function(){return !wBehind(role).length&&(S.wlv[role]||0)>=MAXLV[PRIM[role]];},name:function(){return title;},
  lv:function(){return wBehind(role).length?'맞추기':'Lv'+(S.wlv[role]||0);},
  label:function(){var L=S.wlv[role]||0;if(wBehind(role).length)return WROLE[role]+' 모두 Lv'+L+'로 맞추기';if(SUPER_ROLES[role]&&L+1>=MAXLV[PRIM[role]])return '🌟 '+WROLE[role]+' 모두 Lv'+(L+1)+' · 슈퍼 '+WROLE[role]+' 1명으로 합체!';if(role==='hunter'&&!(SUPER_ROLES[role]&&L+1>=MAXLV[PRIM[role]])){var nk=wkind(L+2);return '사냥꾼 모두 Lv'+(L+1)+' · 임꺽정 권법·발차기도 강화';}return WROLE[role]+' 모두 Lv'+(L+1)+((L+1)===6?' · ✨ 첨단 장비!':' · 더 빨리 일해요');},
  desc:function(){return '';}});}
function hireDef(role,name,base,max,desc){
  return mkUp({id:'hire_'+role,role:role,max:max,hidden:function(){return (role==='miner'&&!owned('m1'))||(role==='fisher'&&(S.stage||1)<2);} /* v72: fisher hire only once the lake village opens */,cost:function(){return Math.round(base*Math.pow(2.1,count(role))*stageCostMult(role==='miner'?3:(role==='fisher'?2:1)));},
    isMax:function(){return count(role)>=max;},lv:function(){return count(role)+'명';},
    canBuy:function(){return S.lodge>0&&S.coins>=Math.round(base*Math.pow(2.1,count(role))*stageCostMult(role==='miner'?3:(role==='fisher'?2:1)));},
    why:function(){return S.lodge?'코인이 부족해요':'일꾼 숙소를 먼저 지어요';},
    name:function(){return name+' 고용';},desc:function(){return S.lodge?desc():'광장에 일꾼 숙소를 먼저 지어요';}});
}
function autocashDef(){return mkUp({id:'autocash',max:3,cost:function(){return [250,900,2600][S.autocash||0];},isMax:function(){return (S.autocash||0)>=3;},
  lv:function(){return S.autocash?'Lv.'+S.autocash:'없음';},name:function(){return S.autocash?'자동 수금 강화':'💰 자동 수금';},
  desc:function(){var L=(S.autocash||0)+1;return '손님이 둔 돈을 '+[8,5,3][L-1]+'초마다 알아서 챙겨요';}});}
function wh2Def(){return mkUp({id:'wh2',max:3,hidden:function(){return !S.whLv;},cost:function(){return Math.round(700*Math.pow(2,S.wh2||0));},isMax:function(){return (S.wh2||0)>=3;},
  lv:function(){return S.wh2?'Lv.'+S.wh2:'미건설';},name:function(){return S.wh2?'제2 창고 확장':'제2 창고 짓기';},
  desc:function(){return '보관 +'+(S.wh2?40:60)+'칸 · 트럭이 더 자주 와요';}});}
function procDef(b,name,base){return mkUp({id:b,cost:function(){var L=S[b]||0;return Math.round(base*Math.pow(b==='elec'?2.6:2.2,L)*(L===5?3:1)*stageCostMult(b==='smelt'||b==='elec'?3:(b==='smoke'?2:1)));},isMax:function(){return (S[b]||0)>=8;},
  hidden:function(){var p=plotOf(b);return !(p.show()||p.built());},lv:function(){return S[b]?'Lv.'+S[b]:'미건설';},name:function(){return S[b]?name+' 강화':name+' 짓기';},desc:function(){return '';}});}
function pstDef(b){var nm={mill:'제재소',smoke:'훈제소',smelt:'제련소',elec:'전자 공장'}[b];return mkUp({id:'pst_'+b,pst:b,hidden:function(){return !S[b];},cost:function(){var L=(S.pst&&S.pst[b])||0;return Math.round({mill:160,smoke:180,smelt:900,elec:1500}[b]*Math.pow(b==='smelt'||b==='elec'?2.4:2,L)*stageCostMult(b==='smelt'||b==='elec'?3:(b==='smoke'?2:1)));},
  isMax:function(){return ((S.pst&&S.pst[b])||0)>=5;},lv:function(){var L=(S.pst&&S.pst[b])||0;return L?'Lv.'+L+' · '+storeCap(b)+'칸':'없음';},name:function(){return (S.pst&&S.pst[b])?nm+' 창고 넓히기':nm+' 창고 짓기';},desc:function(){var L=((S.pst&&S.pst[b])||0)+1;return '보관 '+(30+26*(L-1))+'칸 · 가공 +'+(25*L)+'% 빨라요'+(b==='smelt'?'':' · 트럭 값 +'+(30*L)+'% · 더 자주, 더 많이');}});}
function procBeltDef(b){return mkUp({id:'pbelt_'+b,pbelt:b,cost:function(){return 120;},isMax:function(){return !!(S.pcv&&S.pcv[b]);},hidden:function(){return !S[b]||(b==='elec'&&!S.smelt);},name:function(){return {mill:'숲→제재소',smoke:'강→훈제소',smelt:'광산→제련소',elec:'제련소→전자 공장'}[b]+' 벨트';},lv:function(){return '';},desc:function(){return '';}});}
function beltUpCost(line){var L=(S.cvLv&&S.cvLv[line])||1;return Math.round(70*Math.pow(2.2,L-1)*(L>=5?Math.pow(1.5,L-4):1)*(line==='fish'?stageCostMult(2):(line==='iron'?stageCostMult(3):1)));}
function beltUpHidden(line){return function(){if(line==='wood')return !(S.cv.f1||(S.pcv&&S.pcv.mill));if(line==='fish')return !(S.cv.p1||(S.pcv&&S.pcv.smoke));return !((S.pcv&&S.pcv.smelt)||(S.pcv&&S.pcv.elec));};}
function beltUpDef(line,nm){return mkUp({id:'beltup_'+line,cost:function(){return beltUpCost(line);},isMax:function(){return ((S.cvLv&&S.cvLv[line])||0)>=CV_MAX;},hidden:beltUpHidden(line),name:function(){return nm+' 벨트 전체 강화';},lv:function(){return 'Lv.'+lineBeltLv(line);},desc:function(){return '';}});}
function towerDef(){return mkUp({id:'tower',max:TOWER_MAX,hidden:function(){return !huntReady();},cost:function(){return Math.round((S.tower?260*Math.pow(2.1,S.tower):30)*stageCostMult(S.stage));},isMax:function(){return S.tower>=TOWER_MAX;},
  lv:function(){return S.tower?'Lv.'+S.tower:'미건설';},name:function(){return S.tower?'망루 강화':'망루 짓기';},
  desc:function(){return '곰에게 자동으로 화살 · 공격력 '+(S.tower?towerDmg().toFixed(1):'0')+'→'+towerDmgAt((S.tower||0)+1).toFixed(1)+' · 사냥꾼 고용';}});}
function fenceDef(){return mkUp({id:'fence',max:5,hidden:function(){return !huntReady();},cost:function(){return Math.round((S.fence?220*Math.pow(2.2,S.fence):20)*stageCostMult(S.stage));},isMax:function(){return S.fence>=5;},
  lv:function(){return S.fence?'Lv.'+S.fence:'없음';},name:function(){return S.fence>=2?'성벽 강화':(S.fence?'울타리 강화':'울타리 치기');},
  desc:function(){var L=S.fence+1;return '내구도 '+fenceHpAt(L)+' · 곰 공격 간격 '+(1.1+.45*L).toFixed(1)+'초 · 피해 -'+Math.round((1-Math.max(.55,1-.08*L))*100)+'%';}});}
/* v59 (director 2026-10-04): hunters cost more - base 180, x2.2 per hunter, and x1 / x3 / x10 by village stage */
function vtowerDef(v){return mkUp({id:'vtower'+v,vt:v,max:TOWER_MAX,hidden:function(){return (S.stage||1)<v||!huntReady();},cost:function(){var L=(S.vt&&S.vt[v])||0;return Math.round((L?260*Math.pow(2.1,L):30)*stageCostMult(v));},isMax:function(){return ((S.vt&&S.vt[v])||0)>=TOWER_MAX;},
  lv:function(){var L=(S.vt&&S.vt[v])||0;return L?'Lv.'+L:'미건설';},name:function(){return (v===2?'호수':'광산')+' 망루'+(((S.vt&&S.vt[v])||0)?' 강화':' 짓기');},desc:function(){return '이 마을 성벽 위 망루';}});}
function vfenceDef(v){return mkUp({id:'vfence'+v,vf:v,max:5,hidden:function(){return (S.stage||1)<v||!huntReady();},cost:function(){var L=(S.vf&&S.vf[v])||0;return Math.round((L?220*Math.pow(2.2,L):20)*stageCostMult(v));},isMax:function(){return ((S.vf&&S.vf[v])||0)>=5;},
  lv:function(){var L=(S.vf&&S.vf[v])||0;return L?'Lv.'+L:'없음';},name:function(){return (v===2?'호수':'광산')+' 성벽'+(((S.vf&&S.vf[v])||0)?' 강화':' 짓기');},desc:function(){var L=((S.vf&&S.vf[v])||0)+1;return '내구도 '+fenceHpAt(L)+' · 곰 공격 간격 '+(1.1+.45*L).toFixed(1)+'초 · 피해 감소';}});}
function vfenceRepairDef(v){return mkUp({id:'vfence_fix'+v,vfRepair:v,hidden:function(){return (S.stage||1)<v||!VFBREACH[v];},cost:function(){return Math.round(100*stageCostMult(v));},isMax:function(){return !VFBREACH[v];},lv:function(){return '뚫림';},name:function(){return (v===2?'호수':'광산')+' 성벽 수리';},desc:function(){return '곰이 뚫은 성벽을 즉시 다시 막아요';}});}
var VFIXDEF={2:vfenceRepairDef(2),3:vfenceRepairDef(3)};
function hunterCost(role){role=role||'hunter';return Math.round(150*Math.pow(2,count(role))*({hunter:1,hunter2:3,hunter3:8}[role]));}
function hvTower(role){var v=HV[role];return v===1?S.tower>0:((S.vt&&S.vt[v])||0)>0;}
function hunterDef(role){role=role||'hunter';var v=HV[role];return mkUp({id:'hire_'+role,role:role,max:5,hidden:function(){return !huntReady()||(S.stage||1)<v;},cost:function(){return hunterCost(role);},
  isMax:function(){return count(role)>=5;},lv:function(){return count(role)+'명';},
  canBuy:function(){return hvTower(role)&&S.coins>=hunterCost(role);},
  why:function(){return hvTower(role)?'코인이 부족해요':'이 마을 망루를 먼저 지어요';},
  name:function(){return HNAME[role]+' 고용';},desc:function(){return S.tower?'곰을 쫓아가 활을 쏘고, 전리품을 가게에 납품해요':'광장에 망루를 먼저 지어요';}});}
function lodgeDef(){return mkUp({id:'lodge',lodgeB:1,max:1,cost:function(){return 60;},isMax:function(){return S.lodge>=1;},
  lv:function(){return S.lodge?'완공':'미건설';},name:function(){return '일꾼 숙소 짓기';},desc:function(){return '나무꾼·낚시꾼을 고용할 수 있어요';}});}
function millDef(){return mkUp({id:'mill',max:4,cost:function(){return Math.round(180*Math.pow(2.1,S.mill));},isMax:function(){return S.mill>=4;},
  lv:function(){return S.mill?'Lv.'+S.mill:'미건설';},name:function(){return S.mill?'제재소 강화':'제재소 짓기';},
  desc:function(){return '나무 판매값 +'+(20*S.mill)+'→'+(20*(S.mill+1))+'%';}});}
function smokeDef(){return mkUp({id:'smoke',max:4,cost:function(){return Math.round(200*Math.pow(2.1,S.smoke));},isMax:function(){return S.smoke>=4;},
  lv:function(){return S.smoke?'Lv.'+S.smoke:'미건설';},name:function(){return S.smoke?'훈제장 강화':'훈제장 짓기';},
  desc:function(){return '생선 판매값 +'+(20*S.smoke)+'→'+(20*(S.smoke+1))+'%';}});}
function trunkDef(){
  return mkUp({id:'trunk',trunkUp:1,cost:function(){return Math.round(150*Math.pow(2,S.trunk));},
    isMax:function(){return S.trunk>=5;},lv:function(){return S.trunk?'Lv.'+S.trunk:'미건설';},
    name:function(){return S.trunk?'벨트 모터실 강화':'벨트 모터실 짓기';},
    desc:function(){return '모든 벨트 속도 +'+(20*S.trunk)+'→'+(20*(S.trunk+1))+'%';}});
}
function siteDef(sid){
  var st=SITE[sid],arr=st.kind==='forest'?TREES:FISH;
  return mkUp({id:'site_'+sid,site:sid,hidden:function(){return sid==='m1'&&!S.smelt;},cost:function(){return siteCost(sid);},isMax:function(){return siteLv(sid)>=SITE_MAX;},
    lv:function(){return owned(sid)?'Lv.'+siteLv(sid):'미개척';},
    name:function(){return owned(sid)?st.name+' 가꾸기':st.name+' 개척';},
    desc:function(){return '';}});
}
function beltDef(sid){
  var st=SITE[sid];
  return mkUp({id:'belt_'+sid,beltOf:sid,cost:function(){return cvCost(sid);},isMax:function(){return !!S.cv[sid];},
    hidden:function(){return !owned(sid);},
    lv:function(){return cvLv(sid)?'Lv.'+cvLv(sid):'미설치';},
    name:function(){return st.name+' 벨트'+(cvLv(sid)?' 강화':' 설치');},
    desc:function(){var L=cvLv(sid)+1;return '초당 '+convRate(L).toFixed(1)+'회 · 한 번에 '+convBatch(L)+'개';}});
}
function shopStaffDef(line){return mkUp({id:'shopstaff_'+line,shopStaff:line,cost:function(){return 150*Math.pow(2.6,shopStaffLevel(line));},isMax:function(){return shopStaffLevel(line)>=6;},hidden:function(){return !lineOpen(line);},lv:function(){return 'Lv.'+shopStaffLevel(line);},name:function(){return SHOPDEF[line].name+' · 가게 일손';},desc:function(){return '손님이 많아졌어요. 일손을 더 들일까요? 다음: '+(shopStaffLevel(line)%2===0?'점원 고용 · 응대·계산 개선':'진열대 추가 · 판매대 +1')+' · Lv2부터 단골손님';}});}
function shopDef(line){
  var nm=SHOPDEF[line].name,base=line==='wood'?120:160;
  return mkUp({id:'shop_'+line,shop:line,cost:function(){return Math.round(base*Math.pow(1.9,S.shop[line]-1)*stageCostMult(line==='fish'?2:1));},
    isMax:function(){return S.shop[line]>=8;},lv:function(){return 'Lv.'+S.shop[line];},
    name:function(){return nm+' 넓히기';},
    desc:function(){
      return '손님 더 많이 · 줄 '+Math.min(10,4+S.shop[line])+'명 · 가격 +15%';
    }});
}
var TABS=[
  {id:'gear',label:'🧰 장비',items:[
    weaponDef()
  ]},
  {id:'crew',label:'👷 일꾼',items:[
    hireDef('lumber','나무꾼',40,5,function(){return '새 일꾼은 Lv.1 도끼·장화로 시작해요';}),
    hireDef('fisher','낚시꾼',55,5,function(){return '새 일꾼은 Lv.1 낚싯대·장화로 시작해요';}),
    hireDef('miner','광부',450,5,function(){return '고급 인력 · 광산에서 금광석까지 캐요';}),
    hunterDef('hunter'),hunterDef('hunter2'),hunterDef('hunter3'),wupDef('lumber','나무꾼 강화'),wupDef('fisher','낚시꾼 강화'),wupDef('hunter','사냥꾼 강화'),wupDef('hunter2','호수 사냥꾼 강화'),wupDef('hunter3','광산 사냥꾼 강화'),wupDef('miner','광부 강화'),
    bulkDef('axe',['lumber'],'🪓 나무꾼 도끼 모두 강화','베는 속도 +35%/Lv'),
    bulkDef('rod',['fisher'],'🎣 낚시꾼 낚싯대 모두 강화','낚는 속도 +35%/Lv'),
    bulkDef('boots',['lumber','fisher','hunter'],'👢 모든 일꾼 장화 강화','이동 속도 +15%/Lv'),
    bulkDef('bow',['hunter'],'🏹 사냥꾼 활 모두 강화','곰 공격력 +0.6/Lv')
  ]},
  {id:'move',label:'🏗️ 시설',items:[
    siteDef('f1'),siteDef('p1'),
    beltDef('f1'),beltDef('p1'),
    trunkDef(),
    mkUp({id:'pile',max:6,cost:function(){return Math.round(40*Math.pow(1.7,S.pile)*(1+0.1*siteScore()));},
      name:function(){return S.pile?'적재장 확장':'적재장 짓기';},lv:function(){return pcap()+'칸';},
      desc:function(){return '적재칸마다 '+pcap()+'→'+(pcap()+6)+'개까지';}}),
    towerDef(),fenceDef(),vtowerDef(2),vtowerDef(3),vfenceDef(2),vfenceDef(3),procDef('mill','제재소',260),procDef('smoke','훈제소',300),procDef('smelt','제련소',700),procDef('elec','전자 공장',2600),procBeltDef('mill'),procBeltDef('smoke'),procBeltDef('smelt'),procBeltDef('elec'),beltUpDef('wood','숲'),beltUpDef('fish','강'),beltUpDef('iron','광산'),pstDef('mill'),pstDef('smoke'),pstDef('smelt'),pstDef('elec'),siteDef('m1')
  ]},
  {id:'shop',label:'🏪 가게',items:[shopDef('wood'),shopDef('fish'),shopStaffDef('wood'),shopStaffDef('fish'),autocashDef()]}
];
function drawIcon(d,cv2){
  var g=cv2.getContext('2d');g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,28,28);
  function person(role,t){g.save();g.translate(14,15);g.scale(.8,.8);drawPerson(g,0,0,role,1,0,0,t);g.restore();}
  if(d.id==='axe')drawAxe(g,11,16,.35,ptier('axe'),1.15);
  else if(d.id==='wpn'){g.save();g.translate(12,16);g.rotate(-.6);drawWpn(g,wkind()||'axe',wtier(),0,false);g.restore();}
  else if(d.id==='spear'){g.save();g.translate(14,14);g.rotate(-.7);g.fillStyle='#8a6440';g.fillRect(-11,-1.2,20,2.4);g.fillStyle=TOOL_COL[ptier('spear')];g.beginPath();g.moveTo(14,0);g.lineTo(7,-4);g.lineTo(7,4);g.closePath();g.fill();g.fillStyle='#e2463c';g.fillRect(5,-2,2,4);g.restore();}
  else if(d.id==='bow'){g.strokeStyle=['#8a6440','#e8dcc0','#aeb8c2','#f0bb3f','#8fe8ff'][ptier('bow')];g.lineWidth=2.4;g.beginPath();g.arc(10,14,10,-1.2,1.2);g.stroke();g.strokeStyle='#fff';g.lineWidth=.8;g.beginPath();g.moveTo(10+10*Math.cos(-1.2),14+10*Math.sin(-1.2));g.lineTo(10+10*Math.cos(1.2),14+10*Math.sin(1.2));g.stroke();g.strokeStyle='#7a5a3c';g.lineWidth=1.2;g.beginPath();g.moveTo(6,14);g.lineTo(22,14);g.stroke();}
  else if(d.id==='rod')drawRod(g,7,19,0,ptier('rod'),1.05,false);
  else if(d.wh){g.fillStyle='#d8b687';g.fillRect(5,13,18,11);g.fillStyle='#b4513b';g.beginPath();g.moveTo(3,14);g.lineTo(8,7);g.lineTo(20,7);g.lineTo(25,14);g.closePath();g.fill();g.fillStyle='#9a938a';g.fillRect(10,16,8,8);}
  else if(d.id==='cour'){var ct=teamTier('cour');g.fillStyle=['#a8743f','#b98b5e','#9aa5b1','#f0bb3f','#8fe8ff'][ct];rr(g,5,10,18,13,2.5);g.fill();
    g.fillStyle='rgba(255,255,255,.3)';g.fillRect(6,11,16,2);g.strokeStyle='rgba(60,40,20,.45)';g.lineWidth=1;g.beginPath();g.moveTo(5,16.5);g.lineTo(23,16.5);g.stroke();
    g.strokeStyle='#7a5a3c';g.lineWidth=1.6;g.beginPath();g.arc(14,10,4,Math.PI,0);g.stroke();}
  else if(d.id==='boots'){g.save();g.translate(14,17);g.scale(1.7,1.7);drawBoots(g,0,0,ptier('boots'));g.restore();}
  else if(d.id==='bag'){g.font='18px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('🎒',14,15);}
  else if(d.role)person(d.role,0);
  else if(d.site){var st=SITE[d.site];if(st.kind==='forest'){drawItem(g,TREES[Math.max(0,siteLv(d.site)-1)].id,14,15,1.5);}else{g.fillStyle='#8fcfe6';rr(g,4,8,20,14,6);g.fill();drawItem(g,FISH[Math.max(0,siteLv(d.site)-1)].id,14,15,1.2);}}
  else if(d.beltOf){g.fillStyle=BELTCOL[SITE[d.beltOf].line];g.fillRect(3,15,22,6);g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=1;for(var bi=0;bi<4;bi++){g.beginPath();g.moveTo(5+bi*5,16);g.lineTo(7+bi*5,18);g.lineTo(5+bi*5,20);g.stroke();}drawItem(g,SITE[d.beltOf].kind==='forest'?'oak':'carp',14,11,.9);}
  else if(d.id==='lodge'){g.fillStyle='#ecd2a8';g.fillRect(6,13,16,11);g.fillStyle='#6f9a5a';g.beginPath();g.moveTo(3,14);g.lineTo(14,6);g.lineTo(25,14);g.closePath();g.fill();g.fillStyle='#9a6b40';g.fillRect(12,17,5,7);}
  else if(d.id==='smoke'){g.fillStyle='#b8664a';g.fillRect(6,12,16,12);g.fillStyle='#5b4636';g.beginPath();g.moveTo(4,13);g.lineTo(14,6);g.lineTo(24,13);g.closePath();g.fill();g.fillStyle='rgba(210,210,210,.8)';g.beginPath();g.arc(20,4,2.5,0,7);g.fill();g.fillStyle='#ff9a50';g.fillRect(11,17,6,4);}
  else if(d.id==='mill'){g.save();g.translate(14,14);g.rotate(time*4);g.fillStyle='#c9ced4';g.beginPath();for(var k2=0;k2<10;k2++){var a2=k2*.628;g.lineTo(Math.cos(a2)*9,Math.sin(a2)*9);g.lineTo(Math.cos(a2+.3)*7,Math.sin(a2+.3)*7);}g.closePath();g.fill();g.fillStyle='#7d746a';g.beginPath();g.arc(0,0,2.2,0,7);g.fill();g.restore();}
  else if(d.trunkUp){g.fillStyle='#7d746a';g.beginPath();g.arc(14,14,9,0,7);g.fill();g.fillStyle='#5b4636';g.beginPath();g.arc(14,14,6,0,7);g.fill();g.strokeStyle='#e8dccb';g.lineWidth=1.6;g.beginPath();for(var q=0;q<3;q++){var an=time*2+q*2.09;g.moveTo(14,14);g.lineTo(14+Math.cos(an)*5,14+Math.sin(an)*5);}g.stroke();}
  else if(d.conv){g.fillStyle=d.conv==='wood'?'#7a5a3c':'#3f6f98';g.fillRect(3,16,22,5);drawItem(g,d.conv==='wood'?'oak':'carp',11,12,.9);drawItem(g,d.conv==='wood'?'oak':'carp',19,12,.9);}
  else if(d.id==='pile'){for(var i=0;i<6;i++){g.fillStyle='#a07a50';rr(g,5+(i%3)*6+Math.floor(i/3)*3,20-Math.floor(i/3)*4,6,3.5,1.5);g.fill();}}
  else if(d.shop){var sd=SHOPDEF[d.shop];for(var k=0;k<6;k++){g.fillStyle=k%2?sd.awn2:sd.awn;g.fillRect(3+k*3.7,4,3.8,6);}
    g.fillStyle='#c48d52';g.fillRect(3,19,22,6);drawItem(g,sd.icon,14,15,.9);}
}
var tabsEl=document.getElementById('tabs'),drawer=document.getElementById('drawer'),btns={},allDefs=[],tabBtns={},panes={};
var activeTab=null;
TABS.forEach(function(tab){
  var tb=document.createElement('button');tb.className='tab';tb.type='button';tb.innerHTML=tab.label+'<span class="dot"></span>';
  tb.setAttribute('aria-expanded','false');
  tb.addEventListener('click',function(){activeTab=activeTab===tab.id?null:tab.id;applyTab();});
  tabsEl.appendChild(tb);tabBtns[tab.id]=tb;
  var pane=document.createElement('div');pane.className='grid';panes[tab.id]=pane;
  tab.items.forEach(function(d){
    allDefs.push(d);d.tab=tab.id;DEF[d.id]=d;
    var b=document.createElement('button');b.className='card';b.type='button';
    var top=document.createElement('div');top.className='top';
    var ic=document.createElement('canvas');ic.width=56;ic.height=56;
    var nm=document.createElement('div');nm.className='nm';
    top.appendChild(ic);top.appendChild(nm);
    var ds=document.createElement('div');ds.className='ds';
    var cs=document.createElement('span');cs.className='cost';
    b.appendChild(top);b.appendChild(ds);b.appendChild(cs);
    b.addEventListener('click',function(){buy(d);});
    pane.appendChild(b);btns[d.id]={b:b,ic:ic,nm:nm,ds:ds,cs:cs,key:''};
  });
  if(tab.id==='shop'){
    var rs=document.createElement('button');rs.className='reset';rs.type='button';rs.textContent='처음부터 다시 시작';
    var armed=false;
    rs.addEventListener('click',function(){
      if(!armed){armed=true;rs.textContent='한 번 더 누르면 초기화돼요';setTimeout(function(){armed=false;rs.textContent='처음부터 다시 시작';},3500);return;}
      startOver();
    });
    pane.appendChild(rs);
  }
});
var staffBoard=document.createElement('section');staffBoard.className='staffBoard';staffBoard.setAttribute('aria-label','직원 현황판');
staffBoard.innerHTML='<div class="staffTop"><div class="staffTitle">📋 직원 현황</div><div class="staffCount" id="staffCount">0명 근무 중</div></div><div class="staffRows" id="staffRows"></div>';
panes.crew.insertBefore(staffBoard,panes.crew.firstChild);
var wlist=document.createElement('div');wlist.className='wlist';panes.crew.appendChild(wlist);
function staffStatus(a){
  if(a.stunT>0)return ['치료 중','alert'];
  if(isHunter(a.role)){
    var bear=BEARS.some(function(b){return b.state==='in'||b.state==='attack'||b.state==='fence';});
    if(bear)return [a.aim>0?'곰과 교전 중':'곰에게 이동 중','alert'];
    if(bagN(a)>0)return ['전리품 납품 중',''];
    return [a.inside?'망루에서 대기':'순찰 중','wait'];
  }
  if(a.full)return ['적재칸 확인 중','wait'];
  if(a.working)return [a.gear&&a.gear.super?'대량 채집 중':'채집 중',''];
  if(a.path&&a.path.length)return ['작업장으로 이동','wait'];
  if(a.res)return [a.res.alive?'채집 준비 중':'자원 회복 대기','wait'];
  if(a.waitQ)return ['자원 회복 대기','wait'];
  if(a.inside)return ['숙소에서 휴식','wait'];
  return ['다음 작업 찾는 중','wait'];
}
function refreshStaffBoard(){
  var rows=document.getElementById('staffRows'),countEl=document.getElementById('staffCount');if(!rows||!countEl)return;
  countEl.textContent=S.w.length+'명 · '+agents.filter(function(a){return a.role!=='player'&&a.working;}).length+'명 작업 중';
  if(!S.w.length){rows.innerHTML='<div class="staffEmpty">아직 고용한 직원이 없어요. 아래에서 직원을 고용해보세요.</div>';return;}
  var html='';S.w.forEach(function(g){var a=agents.filter(function(x){return x.gear===g;})[0],st=a?staffStatus(a):['휴식 중','wait'];
    var job=(g.super?SUPERNAME[g.role]+' · ':'')+(WROLE[g.role]||'일꾼');
    html+='<div class="staffRow"><div class="staffName">'+(g.name||'일꾼')+'</div><div class="staffJob">'+job+'</div><div class="staffState '+st[1]+'"><i class="staffDot"></i>'+st[0]+'</div></div>';});
  rows.innerHTML=html;
}
var wKey='',wRows=[],WTN={axe:'도끼',rod:'낚싯대',boots:'장화',bow:'활'};
function wTracks(g){return g.role==='lumber'?['axe','boots']:(g.role==='hunter'?['bow','boots']:['rod','boots']);}
function renderWorkers(){
  wlist.style.display='flex';
  var key=S.w.map(function(g){return g.role;}).join(',');
  if(key!==wKey){
    wKey=key;wlist.innerHTML='';wRows=[];var idx={lumber:0,fisher:0};
    if(S.w.length){var hd=document.createElement('div');hd.className='whead';hd.textContent='고용한 일꾼 · 장비 강화는 마을 발판에서 해요';wlist.appendChild(hd);}
    S.w.forEach(function(g){
      idx[g.role]=(idx[g.role]||0)+1;
      var row=document.createElement('div');row.className='wrow';
      var ic=document.createElement('canvas');ic.width=56;ic.height=56;
      var info=document.createElement('div');info.className='wi';
      var bx=document.createElement('div');bx.className='wbtns';
      row.appendChild(ic);row.appendChild(info);row.appendChild(bx);wlist.appendChild(row);
      var bs=wTracks(g).map(function(tr){var b=document.createElement('button');b.type='button';b.className='wbtn';b.disabled=true;b.title='장비 강화 발판에 올라서면 강화돼요';bx.appendChild(b);return {b:b,tr:tr};});
      wRows.push({g:g,ic:ic,info:info,bs:bs,name:g.name+' <span class="wrole">'+(g.role==='lumber'?'나무꾼':g.role==='hunter'?'사냥꾼':'낚시꾼')+'</span>',key:''});
    });
  }
  var any=false;
  wRows.forEach(function(r){
    var g=r.g,tt=g.role==='lumber'?'axe':(g.role==='hunter'?'bow':'rod');
    r.info.innerHTML=r.name+'<small>'+NAMES[tt][tierOf(tt,g[tt]||0)]+' '+WTN[tt]+' · '+NAMES.boots[tierOf('boots',g.boots||0)]+' 장화</small>';
    r.bs.forEach(function(x){var lv=g[x.tr]||0,mx=lv>=MAXLV[x.tr],c=gcost(x.tr,lv,true),can=!mx&&S.coins>=c;if(can)any=true;
      x.b.innerHTML=mx?WTN[x.tr]+'<b>최대</b>':WTN[x.tr]+'<b>발판에서 강화</b>';x.b.disabled=true;x.b.classList.remove('off');});
    var k=tierOf(tt,g[tt]||0)+','+tierOf('boots',g.boots||0)+','+g.name;
    if(r.key!==k){r.key=k;var cg=r.ic.getContext('2d');cg.setTransform(2,0,0,2,0,0);cg.clearRect(0,0,28,28);cg.save();cg.translate(14,15);cg.scale(.8,.8);drawPerson(cg,0,0,g.role,1,0,tierOf('boots',g.boots||0),tierOf(tt,g[tt]||0),undefined,g);cg.restore();}
  });
  return any;
}
var management=document.createElement('section');management.id='management';management.setAttribute('aria-label','마을 관리');
var appEl=document.querySelector('.app');appEl.appendChild(management);management.appendChild(tabsEl);management.appendChild(drawer);
function setManagement(open){management.classList.toggle('open',!!open);document.body.classList.toggle('management-open',!!open);}
document.getElementById('quickJournal').addEventListener('click',storyBookOpen);
document.getElementById('quickDay').addEventListener('click',function(){dayBtn.click();});
document.getElementById('quickMap').addEventListener('click',function(){zoomBtn.click();});
document.getElementById('quickSettings').addEventListener('click',function(){var open=setP.hidden;setP.hidden=!open;gearBtn.setAttribute('aria-expanded',open?'true':'false');sfx('tap');});
function applyTab(){
  drawer.innerHTML='';
  TABS.forEach(function(t){var on=t.id===activeTab;tabBtns[t.id].classList.toggle('on',on);tabBtns[t.id].setAttribute('aria-expanded',on?'true':'false');});
  if(activeTab){drawer.appendChild(panes[activeTab]);drawer.hidden=false;setManagement(true);}else{drawer.hidden=true;setManagement(false);}
  fit();
}
function buy(d,fromPad){
  if(!fromPad){sfx('nope');var player0=agents[0];if(player0)addFloat(player0.x,player0.y-36,'발판 위에 올라서면 구매돼요','#ffe2a8');return false;}
  if(d.isMax()||!d.canBuy()||(d.hidden&&d.hidden())){sfx('nope');return;}
  if(d.bulk){var nUp=0;while(true){var gw=lowestWorker(d.roles,d.tr);if(!gw)break;var cw=gcost(d.tr,gw[d.tr]||0,true);if(S.coins<cw)break;S.coins-=cw;gw[d.tr]=(gw[d.tr]||0)+1;nUp++;if(nUp>300)break;}
    if(nUp){var pw0=agents[0];celebrate(pw0.x,pw0.y,d.name().replace(/ 모두 강화| 강화/,'')+' +'+nUp+'회',nUp>=3);agents.forEach(function(a){if(a.role!=='player'&&d.roles.indexOf(a.role)>=0)burst(a.x,a.y-10,'#ffe27a',6,true);});}
    save();refreshUI();return;}
  sfx('build');stat('buy',1);
  var c=d.cost(),pl=agents[0];
  S.coins-=c;
  if(d.id&&d.id.indexOf('beltup_')===0){var bln=d.id.slice(7);S.cvLv=S.cvLv||{};var BL0=lineBeltLv(bln);/* v75: a line starts at Lv1 with cvLv 0 or 1, so the first upgrade used to change nothing - it now always lands on Lv2 */S.cvLv[bln]=Math.max(2,(S.cvLv[bln]||0)+1);var pz=agents[0],BL=S.cvLv[bln];celebrate(pz.x,pz.y,tierOfBelt(BL).name+' 벨트 Lv.'+BL+' · 더 굵게!',true);BELTFX[bln]={t:0,dur:1.6,from:BL0,to:lineBeltLv(bln),end:false};save();refreshUI();return;}
  if(d.pst){var pb0=d.pst;S.pst[pb0]=(S.pst[pb0]||0)+1;var shp=shedPos(pb0);celebrate(shp.x,shp.y-10,S.pst[pb0]===1?'창고 완공! 트럭이 와요':'창고 Lv.'+S.pst[pb0],true);truckT[pb0]=Math.min(truckT[pb0],4);save();refreshUI();return;}
  if(d.pbelt){if(!S.pcv)S.pcv={};S.pcv[d.pbelt]=1;if(!S.beltLv)S.beltLv=1;var pb=plotOf(d.pbelt);celebrate(pb.x+pb.w/2,pb.y+10,'벨트 연결!',false);save();refreshUI();return;}
  if(d.wup){var wr=d.wup,pr=PRIM[wr],catchUp=wBehind(wr).length>0;if(!catchUp)S.wlv[wr]=(S.wlv[wr]||0)+1;var WL=S.wlv[wr];
    S.w.forEach(function(g){if(g.role!==wr)return;g[pr]=Math.max(g[pr]||0,WL);g.boots=Math.max(g.boots||0,Math.min(MAXLV.boots,WL));});
    if(canMerge(wr)){mergeCrew(wr,true);refreshUI();return;}
    if(wr==='hunter'){var pw=agents[0],nk1=wkind();celebrate(pw.x,pw.y,'권법·발차기 Lv.'+wpnLv(),nk1!==wkind(wpnLv()-1));}
    var first=true;agents.forEach(function(a){if(a.role!==wr)return;if(first){celebrate(a.x,a.y,WROLE[wr]+' 모두 Lv.'+WL+(catchUp?' 맞춤!':'!'),!catchUp);first=false;}else{burst(a.x,a.y-10,'#ffe27a',12,true);addFloat(a.x,a.y-30,'Lv.'+WL,'#ffe27a');}});
    save();refreshUI();return;}
  if(d.vt){var v1=d.vt;S.vt=S.vt||{};S.vt[v1]=(S.vt[v1]||0)+1;var xo=XTOWERS.filter(function(o){return o.v===v1;})[0];celebrate(xo.x,H-40,S.vt[v1]===1?'🗼 '+(v1===2?'호수':'광산')+' 망루 완공!':'🗼 망루 Lv.'+S.vt[v1],true);save();refreshUI();return;}
  if(d.vfRepair){var vr=d.vfRepair;VFHP[vr]=fMaxV(vr);VFBREACH[vr]=0;celebrate(vr===2?240:420,H-30,(vr===2?'호수':'광산')+' 성벽을 다시 막았어요!',true);save();refreshUI();return;}
  if(d.vf){var v2=d.vf;S.vf=S.vf||{};S.vf[v2]=(S.vf[v2]||0)+1;if(isWinter()){VFHP[v2]=fMaxV(v2);VFBREACH[v2]=0;}celebrate(v2===2?240:420,H-30,S.vf[v2]===1?'🪵 울타리 완성!':(S.vf[v2]===3?'🏰 성벽으로 변신!':'성벽 Lv.'+S.vf[v2]),true);save();refreshUI();return;}
  if(d.repair){doRepair(d.e);save();refreshUI();return;}
  if(d.fix){if(d.fix==='fence'){S.fenceDown=0;FENCEHP=isWinter()?fenceMax():0;celebrate(MX/2,H-30,'🪵 울타리 수리 완료!',true);}else{S.towerDown=0;TOWERHP=isWinter()?towerMax():0;celebrate(TOWER.x,TOWER.y,'🗼 망루 수리 완료!',true);}save();refreshUI();return;}
  if(d.id==='fence'){S.fence++;if(isWinter())FENCEHP=fenceMax();celebrate(MX/2,H-30,S.fence===1?'🪵 울타리 완성!':(S.fence===3?'🏰 성벽으로 변신!':(S.fence>3?'🏰 성벽 Lv.'+S.fence:'울타리 Lv.'+S.fence)),true);save();refreshUI();return;}
  if(d.weapon){var ok0=wkind();S.p.wpn=(S.p.wpn||0)+1;var nk0=wkind();celebrate(pl.x,pl.y,nk0!==ok0?'✨ '+WKN[nk0]+' 획득!':WKN[nk0]+' Lv.'+S.p.wpn,nk0!==ok0);save();refreshUI();return;}
  if(d.gear){
    var tr=d.id,old=ptier(tr);S.p[tr]=(S.p[tr]||0)+1;S[tr]=S.p[tr];
    burst(pl.x,pl.y-4,'#ffe27a',6,true);
    celebrate(pl.x,pl.y,(d.name?d.name():tr)+' Lv.'+S.p[tr],ptier(tr)>old);if(ptier(tr)>old)addFloat(pl.x,pl.y-52,'✨ 새 장비!','#ffe27a');
  }else if(d.site){
    var sid=d.site,first=!owned(sid),st=SITE[sid];S.sites[sid]=siteLv(sid)+1;
    if(first){res.forEach(function(q){if(q.s===sid)growRes(q);});addFloat(st.x+st.w/2,st.y+st.h/2,st.name+' 개척!','#c9f5c0');}
    else{var Ln=siteLv(sid);addFloat(st.x+st.w/2,st.y+st.h/2,(Ln===3||Ln===5)?'🌱 새 종류 등장!':'🌱 더 빨리 자라요!','#c9f5c0');}
    celebrate(st.x+st.w/2,st.y+st.h/2,first?st.name+' 개척!':st.name+' Lv.'+siteLv(sid),true);
  }else if(d.beltOf){
    var bs=d.beltOf,bp=pilePos(bs);S.cv[bs]=1;if(!S.beltLv)S.beltLv=1;celebrate(bp.x,bp.y,'벨트 설치!',false);
  }else if(d.role){
    var gnew={role:d.role,axe:0,rod:0,pick:0,boots:0,cour:0},lk=newLook(),WL0=(S.wlv&&S.wlv[d.role])||0;gnew[PRIM[d.role]]=WL0;gnew.boots=Math.min(MAXLV.boots,WL0);gnew.name=lk.name;gnew.hair=lk.hair;gnew.skin=lk.skin;gnew.acc=lk.acc;S.w.push(gnew);agents.push(mkAgent(d.role,gnew));
    if(isHunter(d.role)){var ha=agents[agents.length-1];var dr0=hunterDoor(d.role);ha.x=dr0.x;ha.y=dr0.y;ha.slot=count(d.role)-1;}
    addFloat(HOME.x,HOME.y-30,gnew.name+' 합류!','#c9f5c0');
  }else if(d.id==='lodge'){S.lodge=1;var lp=LODGEP();addFloat(lp.x+lp.w/2,lp.y+10,'일꾼 숙소 완공!','#c9f5c0');burst(lp.x+lp.w/2,lp.y+24,'#ffe27a',16,true);
  }else if(d.trunkUp){S.trunk++;celebrate(agents[0].x,agents[0].y,'벨트 모터 Lv.'+S.trunk,false);LINES.forEach(function(l){burst(LANE[l],dropPt(l).y,'#ffe27a',8,true);});}
  else if(d.wh){S.whLv++;truckT=Math.min(truckT,6);celebrate(WH.door,WH.wall,S.whLv===1?'창고 완공!':'창고 Lv.'+S.whLv,true);addFloat(WH.door,WH.top,S.whLv===1?'창고 완공!':'창고 확장!','#ffe27a');burst(WH.door,WH.wall,'#ffe27a',16,true);flash=.4;}
  else if(d.shopStaff){var line=d.shopStaff;if(!S.shopStaff||typeof S.shopStaff!=='object'||Array.isArray(S.shopStaff))S.shopStaff={};S.shopStaff[line]=Math.min(6,shopStaffLevel(line)+1);var st=STALL[line];STALLFX[line]=1.8;celebrate(st.x,st.y-35,shopStaffLevel(line)%2?'점원이 합류했어요!':'진열대가 늘었어요!');}
  else if(d.shop){S.shop[d.shop]++;var s=STALL[d.shop];STALLFX[d.shop]=1.8;flash=.45;sfx('cash');
    var cc=['#e2463c','#f0bb3f','#3f7fb8','#4fb36a','#b85ac8','#ffffff'];for(var cf=0;cf<46;cf++){var an=-Math.PI/2+(Math.random()-.5)*2.4,sp2=60+Math.random()*90;parts.push({x:s.x,y:s.y-20,vx:Math.cos(an)*sp2,vy:Math.sin(an)*sp2,g:140,life:1.5,max:1.5,col:cc[cf%6],r:1.6,leaf:true});}
    burst(s.x,s.y-20,'#ffe27a',18,true);var stg=shopStage(S.shop[d.shop]),newStg=stg>shopStage(S.shop[d.shop]-1);addFloat(s.x,s.y-86,newStg?'🏠 '+SHOP_STAGE[stg]+'(으)로 변신!':SHOPDEF[d.shop].name+' 확장!','#ffe27a');if(newStg){flash=.6;burst(s.x,s.y-40,'#ffffff',24,true);}}
  else{S[d.id]++;var bp2=PLOTS.filter(function(p){return p.def===d.id;})[0];if(bp2){celebrate(bp2.x+bp2.w/2,bp2.y+bp2.h/2,S[d.id]===1?bp2.name+' 완공!':(S[d.id]===6&&PROC[d.id]?'✨ 첨단 '+bp2.name+' 완성!':bp2.name+' Lv.'+S[d.id]),true);if(S[d.id]===6&&PROC[d.id])flash=.6;}else{var pp3=agents[0];celebrate(pp3.x,pp3.y,(d.name?d.name():d.id)+' Lv.'+S[d.id],false);}}
  save();refreshUI();
}

