// Browser QA harness; not verified in this environment. Requires Playwright and Chromium.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs'),http=require('node:http');
(async()=>{
 const root=path.resolve(__dirname,'..');
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/html');res.end(fs.readFileSync(file));}catch(e){res.writeHead(404);res.end();}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 const url='http://127.0.0.1:'+server.address().port+'/game/index.html?test=1';
 let browser;
 try{browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  for(const viewport of [{width:390,height:844},{width:844,height:390},{width:320,height:568}]){
   const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url);
   await page.waitForFunction(()=>!!window.__cozyTest);
   assert.equal(await page.locator('#title h1, #title .tsub, #title .tlogo').count(),0);
   await page.locator('#startBtn').click();
   assert(await page.locator('#title').evaluate(n=>n.hidden));
   assert(await page.locator('#storyBox').evaluate(n=>n.hidden),'Chapter one must not add a text intro');
   await page.locator('#quickJournal').click();
   const chapters=page.locator('.storyChapterBtn');assert.equal(await chapters.count(),3);assert.equal(await chapters.nth(1).isDisabled(),true);
   await chapters.nth(0).click();
   assert.equal(await page.locator('#storyPlayer').evaluate(n=>n.hidden),false);
   await page.locator('#storyClose').click();
   assert.equal(await page.evaluate(()=>window.__cozyTest.S().storySeen?.[1]),undefined);
   await page.locator('#quickJournal').click();await chapters.nth(0).click();
   for(let line=0;line<4;line++){
    await page.locator('#storyNext').click();
    await page.locator('#storyNext').click();
   }
   assert.equal(await page.evaluate(()=>window.__cozyTest.S().storySeen[1]),1);
   assert.equal(await page.locator('#storyBook').evaluate(n=>n.hidden),false);
   await page.locator('#storyClose').click();
   await page.reload();await page.waitForFunction(()=>!!window.__cozyTest);
   assert.equal(await page.evaluate(()=>window.__cozyTest.S().storySeen[1]),1);
   await page.locator('#startBtn').click();
   assert(await page.locator('#storyBox').evaluate(n=>n.hidden));
   await page.locator('#quickJournal').click();await page.locator('.storyChapterBtn').nth(0).click();
   const before=await page.evaluate(()=>JSON.stringify(window.__cozyTest.S()));
   await page.waitForTimeout(300);
   assert.equal(await page.evaluate(()=>JSON.stringify(window.__cozyTest.S())),before,'Game state stays paused during story');
   await page.locator('#storyClose').click();
   assert.deepEqual(errors,[]);
   const runtime=await page.evaluate(()=>window.__cozyTest.errs());assert.equal(runtime.n,0);assert.equal(runtime.boot,'');
   await context.close();
  }
  // Test-only images exercise viewer wiring; they are not production artwork.
  const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();
  await page.route('**/intro-scenes.js',route=>route.fulfill({contentType:'text/javascript',body:'window.INTRO_SCENES='+JSON.stringify(Array.from({length:4},(_,i)=>({src:'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${['red','green','blue','gold'][i]}"/></svg>`),alt:'Test scene '+i})))+';'}));
  await page.goto(url);
  await page.waitForFunction(()=>document.querySelector('#title').classList.contains('illustrated'));
  assert.equal(await page.locator('#introImage').getAttribute('alt'),'Test scene 0');
  await page.locator('#startBtn').click();assert.equal(await page.locator('#introImage').getAttribute('alt'),'Test scene 1');
  await page.locator('#introBack').click();assert.equal(await page.locator('#introImage').getAttribute('alt'),'Test scene 0');
  for(let i=0;i<3;i++)await page.locator('#startBtn').click();
  assert.equal(await page.locator('#introImage').getAttribute('alt'),'Test scene 3');
  await page.locator('#startBtn').click();assert(await page.locator('#title').evaluate(n=>n.hidden));assert(await page.locator('#storyBox').evaluate(n=>n.hidden));
  await context.close();
  console.log('PASS: Chromium 390x844, 844x390, 320x568; wordless start; old save reload; unfinished-close; chapter locks; replay/read persistence; story pause; no runtime errors; four-image viewer forward/back/start (test images only).');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exit(1)});
