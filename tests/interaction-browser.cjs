// Run: node tests/interaction-browser.cjs (Playwright and Chromium required).
const {chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'..');
 const server=http.createServer((req,res)=>{const js=req.url.split('?')[0].endsWith('intro-scenes.js');res.setHeader('Content-Type',js?'text/javascript':'text/html');res.end(fs.readFileSync(path.join(root,js?'game/intro-scenes.js':'game/index.html')));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   const context=await browser.newContext({viewport,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.address().port+'/?test=1');await page.click('#startBtn');
   await page.evaluate(()=>{const s=__cozyTest.S();Object.assign(s,{stage:3,tut:99,coins:1e9,auto:false,season:0,fence:4,vf:{2:4,3:4},tower:9,vt:{2:9,3:9},mill:1,smoke:1,smelt:1,elec:1,sites:{f1:1,p1:1,m1:1},shop:{wood:2,fish:2}});__cozyTest.hero(400,380);__cozyTest.run(.05);});
   const cdp=await context.newCDPSession(page),cy=viewport.height*.55,cx=viewport.width*.5;
   const touch=(x,id)=>({x,y:cy,id,radiusX:2,radiusY:2});
   const before=await page.evaluate(()=>__cozyTest.camera());
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch(cx-45,1)]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch(cx-45,1),touch(cx+45,2)]});
   assert(await page.evaluate(()=>__cozyTest.camera().pinching));
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[touch(cx-80,1),touch(cx+80,2)]});
   await page.waitForFunction(z=>__cozyTest.camera().z>z,before.z);const enlarged=await page.evaluate(()=>__cozyTest.camera());assert(enlarged.z>before.z);assert(!enlarged.joy);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[touch(cx-12,1),touch(cx+12,2)]});
   await page.waitForFunction(z=>__cozyTest.camera().z<z,before.z);const reduced=await page.evaluate(()=>__cozyTest.camera());assert(reduced.z<before.z);assert(reduced.z>=reduced.range.min);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   const after=await page.evaluate(()=>{__cozyTest.run(.2);return {camera:__cozyTest.camera(),tap:__cozyTest.agents()[0].tap};});
   assert(!after.camera.pinching);assert.equal(after.camera.touches,0);assert.equal(after.tap,null);assert(Math.abs(after.camera.z-reduced.z)<.001,'Zoom must persist after lifting fingers');
   const layout=await page.evaluate(()=>{const t=__cozyTest;t.run(.05);const pads=t.pads(),obstacles=t.padObstacles(),hit=(a,b)=>a.x-a.w/2<b.x+b.w+3&&a.x+a.w/2+3>b.x&&a.y-a.h/2<b.y+b.h+3&&a.y+a.h/2+3>b.y;const blocked=pads.filter(p=>obstacles.some(o=>!(p.construction&&p.id==='belt_p1'&&o.belt==='sale_p1')&&hit(p,o)));const plots=t.labels();const upgrades=plots.filter(p=>p.def!=='tower').map(p=>({id:p.def,above:pads.find(q=>q.id===p.def).y+15<p.building.y}));return {blocked,upgrades,overlaps:t.padOverlaps(),purchased:['pbelt_mill','pbelt_smoke','pbelt_smelt','pbelt_elec'].map(id=>[id,t.buy(id)])};});
   assert.equal(layout.blocked.length,0,JSON.stringify(layout.blocked));assert.equal(layout.overlaps.length,0);assert(layout.upgrades.every(x=>x.above));assert(layout.purchased.every(x=>x[1]));
   for(const side of ['left','right','bottom']){
    const crowd=await page.evaluate(side=>{const t=__cozyTest,bears=t.bears();bears.splice(0);t.hero(400,80);for(let i=0;i<12;i++){t.spawnBear(side);const b=bears[bears.length-1];b.x=side==='left'?3:side==='right'?1077:200;b.y=side==='bottom'?597:260;b.hp=b.max=1e7;b.entered=false;}t.run(.2,.01);return {bears:bears.map(b=>({x:b.x,y:b.y,side:b.side,state:b.state,entered:b.entered,margin:15*(b.king?1.6:b.boss?1.35:1)+10})),errors:t.errs()};},side);
    assert.equal(crowd.errors.n,0);assert(crowd.bears.every(b=>!b.entered&&b.state==='fence'&&(side==='left'?b.x<=-b.margin:side==='right'?b.x>=1080+b.margin:b.y>=600+b.margin+5)),`${side} crowd crossed an intact wall`);
   }
   const combat=await page.evaluate(()=>{const t=__cozyTest,pool=t.bears();pool.splice(0);t.spawnBear('top');const b=pool[0];Object.assign(b,{x:400,y:300,state:'in',entered:true,hp:1e7,max:1e7});const near={...b,x:440,y:320,hp:1e7};pool.push(near);const a={x:370,y:300,role:'hunter',gear:{super:1,bow:12},bag:{},path:[],bob:0},before=t.arrows().length,types=[];for(let i=0;i<8;i++){t.hunterStep(a,.5);types.push(a.strikeType);}return {types,combo:a.combo,arrows:t.arrows().length-before,damage:1e7-b.hp,areaDamage:1e7-near.hp};});
   assert.deepEqual(combat.types.slice(0,3),['punch','punch-left','kick']);assert.equal(combat.combo,0);assert.equal(combat.arrows,0);assert(combat.damage>0&&combat.areaDamage>0);
   const runtime=await page.evaluate(()=>__cozyTest.errs());assert.equal(runtime.n,0);assert.equal(errors.length,0,errors.join('; '));
   console.log(`PASS ${viewport.width}x${viewport.height}: real two-finger zoom; clear upgrade pads and purchases; 36 crowd-displaced bears blocked; Lim punches/kicks/area ultimate without arrows.`);
   await context.close();
  }
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
