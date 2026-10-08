/* ---------- species & goods ---------- */
var TREES=[
  {id:'oak',name:'참나무',tier:0,val:4,shape:'round',c1:'#4c9a5c',c2:'#6cb877',trunk:'#8a6845',log:'#a07a50'},
  {id:'pine',name:'소나무',tier:1,val:6,shape:'cone',c1:'#2f7a4f',c2:'#43995f',trunk:'#7a5634',log:'#8a6440'},
  {id:'birch',name:'자작나무',tier:2,val:10,shape:'round',c1:'#9bc955',c2:'#c9e585',trunk:'#f3f1ea',log:'#e8e2d2'},
  {id:'maple',name:'단풍나무',tier:3,val:16,shape:'round',c1:'#e0612f',c2:'#f5a13a',trunk:'#7a4d2b',log:'#b0603a'},
  {id:'crystal',name:'수정나무',tier:4,val:26,shape:'round',c1:'#7fdbf0',c2:'#d4faff',trunk:'#b9a5e0',log:'#b9a5e0'},
  {id:'rainbow',name:'전설 무지개나무',tier:4,val:130,rare:1,shape:'round',c1:'#ff9ab0',c2:'#fff1a8',trunk:'#c9a0e8',log:'#f4a8d0'}
];
var FISH=[
  {id:'carp',name:'붕어',tier:0,val:7,col:'#b89a6a'},
  {id:'trout',name:'송어',tier:1,val:11,col:'#7fa37a'},
  {id:'salmon',name:'연어',tier:2,val:17,col:'#ff7a52'},
  {id:'koi',name:'비단잉어',tier:3,val:27,col:'#ffffff'},
  {id:'gold',name:'황금잉어',tier:4,val:41,col:'#f0bb3f'},
  {id:'dragon',name:'전설 무지개잉어',tier:4,val:190,rare:1,col:'#ff8ad0'}
];
var ORES=[
  {id:'ore',name:'철광석',tier:0,val:8,col:'#8a8f98',spk:'#dfe4ea'},
  {id:'silver',name:'은광석',tier:1,val:18,col:'#8e9aa8',spk:'#ffffff'},
  {id:'goldore',name:'금광석',tier:2,val:34,col:'#7d6c52',spk:'#f0bb3f'},
  {id:'gem',name:'보석 원석',tier:3,val:80,rare:1,col:'#6a5a8a',spk:'#ff9ae8'}
];
var GOODS=[
  {id:'chair',name:'의자',price:40,line:'wood',n:2,time:5,lv:1},
  {id:'table',name:'탁자',price:110,line:'wood',n:4,time:9,lv:3},
  {id:'can',name:'통조림',price:55,line:'fish',n:2,time:6,lv:1},
  {id:'smoked',name:'훈제 생선',price:135,line:'fish',n:3,time:9,lv:3},
  {id:'sofa',name:'가구 세트',price:300,line:'wood',n:6,time:10,lv:6},
  {id:'gift',name:'선물 세트',price:330,line:'fish',n:5,time:10,lv:6},
  {id:'ingot',name:'철판',price:50,line:'iron',n:2,time:5,lv:1},
  {id:'glass',name:'유리',price:60,line:'iron',n:2,time:6,lv:1},
  {id:'plastic',name:'플라스틱',price:90,line:'iron',n:3,time:7,lv:3},
  /* v62: electronics are made 2.5x faster (TV 20s -> 8s, PC 26 -> 10, phone 30 -> 12) so materials don't sit waiting at the factory */
  /* v61 (director 2026-10-04): electronics sell for hundreds of thousands - TV 2,200 -> 150,000, PC 5,200 -> 350,000, phone 9,000 -> 700,000 */
  {id:'tv',name:'TV',price:150000,line:'elec',mat:{ingot:1,glass:2},time:8,lv:1},
  {id:'pc',name:'컴퓨터',price:350000,line:'elec',mat:{ingot:2,glass:1,plastic:2},time:10,lv:3},
  {id:'phone',name:'스마트폰',price:700000,line:'elec',mat:{ingot:1,glass:2,plastic:2},time:12,lv:6}
];
var ITEMS={},ORDER=[],GOOD={};GOODS.forEach(function(g){GOOD[g.id]=g;});
TREES.forEach(function(s){ITEMS[s.id]={cat:'wood',line:'wood',sp:s,name:s.name};ORDER.push(s.id);});
FISH.forEach(function(s){ITEMS[s.id]={cat:'fish',line:'fish',sp:s,name:s.name};ORDER.push(s.id);});
ORES.forEach(function(s){ITEMS[s.id]={cat:'ore',line:'iron',sp:s,name:s.name};ORDER.push(s.id);});
GOODS.forEach(function(g){ITEMS[g.id]={cat:'goods',line:g.line,price:g.price,name:g.name,rec:g};ORDER.push(g.id);});
/* polar bear loot: premium materials sold at the stalls (meat = food stall, hide = wood/craft stall) */
var BEAR_ITEMS=[{id:'meat',name:'곰고기',price:18,line:'fish'},{id:'hide',name:'곰 가죽',price:32,line:'wood'}];
BEAR_ITEMS.forEach(function(b){ITEMS[b.id]={cat:'bear',line:b.line,price:b.price,name:b.name};ORDER.push(b.id);});
var LINES=['wood','fish'];
var GOOD_IDS=['chair','table','can','smoked','sofa','gift','ingot','tool','engine'];
/* fewer species: each site shows 1 -> 2 -> 3 kinds (Lv1 / Lv3 / Lv5) plus one rare */
var SPAWN={tree:[0,3,4,5],fish:[0,2,4,5],ore:[0,1,2,3]};
function spArr(k){return k==='tree'?TREES:(k==='fish'?FISH:ORES);}
function spCount(L){return L>=5?3:(L>=3?2:1);}

