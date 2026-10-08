// Regression checks run the actual story functions, with a small DOM/timer adapter.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const script=require('./runtime-source.cjs').readRuntime('story-intro');
const nodes=new Map(),timers=new Map();let serial=0,saves=0,cancels=0;
function element(){return {hidden:true,textContent:'',children:[],listeners:{},setAttribute(){},appendChild(x){this.children.push(x)},addEventListener(k,f){this.listeners[k]=f},click(){this.listeners.click?.()},set innerHTML(v){this.children=[]},get innerHTML(){return ''}}}
const document={getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id)},createElement:element,addEventListener(){}};
const env={document,S:{stage:1},cancelControl(){cancels++},save(){saves++},sfx(){},setP:element(),gearBtn:element(),goalBox:element(),dayBox:element(),dexBox:element(),setInterval(f){const id=++serial;timers.set(id,f);return id},clearInterval(id){timers.delete(id)}};
vm.createContext(env);
const start=script.indexOf('var STORY_SCENES='),end=script.indexOf("startBtn.addEventListener('click'",start);
assert(start>=0&&end>start);vm.runInContext(script.slice(start,end),env);
// Old saves need no migration and must retain their existing progress.
assert.equal(env.S.storySeen,undefined);env.firstTownStory();assert.equal(env.storyBox.hidden,true,'Opening must stay wordless: no automatic chapter-one dialogue');env.storyStart(1,'auto');assert.equal(env.storyScene.id,1);assert.equal(env.storyBox.hidden,false);assert(cancels>0);
assert.equal(Object.keys(env.storySeen()).length,0,'Opening a story must not mark it read');
const next=document.getElementById('storyNext');
for(let i=0;i<env.storyScene.lines.length;i++){assert.equal(env.storyLine,i);next.click();assert.equal(env.storyTyping,null);assert.equal(document.getElementById('storyText').textContent,env.storyScene.lines[i].text);next.click();}
assert.equal(env.storySeen()[1],1);assert.equal(env.storyBox.hidden,true);assert.equal(timers.size,0);assert(saves>0);
env.firstTownStory();assert.equal(env.storyBox.hidden,true,'Seen story must not autoplay');
env.S.stage=2;env.firstTownStory();assert.equal(env.storyScene.id,2);env.storyCloseNow();assert.equal(env.storySeen()[2],undefined,'Closing unfinished dialogue must not mark it read');assert.equal(timers.size,0);
env.firstTownStory();assert.equal(env.storyScene.id,2);assert.equal(env.storyBox.hidden,false);env.storyFinish(true);assert.equal(env.storySeen()[2],1);
env.storyBookOpen();assert.equal(env.storyBook.hidden,false);assert.equal(env.storyPlayer.hidden,true);
assert.equal(env.storyList.children.filter(n=>n.disabled).length,env.STORY_SCENES.filter(s=>s.id>2).length,'Future towns must stay locked');
env.storyStart(1,'book');assert.equal(env.storyLine,0);document.getElementById('storySkip').click();assert.equal(env.storyBook.hidden,false);assert.equal(env.storyBox.hidden,false);assert.equal(timers.size,0);
env.storyStart(1,'book');env.storyFinish(true);assert.equal(env.storyBook.hidden,false);env.storyCloseNow();assert.equal(env.storyBox.hidden,true);
const saved=JSON.parse(JSON.stringify(env.S));assert.equal(saved.storySeen[1],1);assert.equal(saved.storySeen[2],1);assert.equal(saved.stage,2);
for(const malformed of [true,4,'read',[]]){env.S.storySeen=malformed;assert.equal(typeof env.storySeen(),'object');assert.equal(Array.isArray(env.storySeen()),false);env.storySeen()[1]=1;assert.equal(env.storySeen()[1],1);}
console.log('PASS: legacy save compatibility; autoplay once per town; typing/advance; read persistence; replay; future-town locks; skip/close timer cleanup.');

