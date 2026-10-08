const vm=require('node:vm'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{readRuntime}=require('./runtime-source.cjs');
const ambient=readRuntime('ambient'),raids=readRuntime('raids');
const e={S:{stage:1,winters:1,season:0},Math:Object.create(Math)};e.Math.random=()=>.5;vm.createContext(e);
vm.runInContext(ambient.slice(ambient.indexOf('var SEASON_LEN='),ambient.indexOf('var LEAVES=')),e);
vm.runInContext(raids.slice(raids.indexOf('function bearMult('),raids.indexOf('var RUSHMSG=')),e);
vm.runInContext(raids.match(/var BEAR_HPX=.*?;/)[0],e);
const oldPrepare=[170,140,115];let previous=Infinity;
for(const stage of [1,2,3]){e.S.stage=stage;e.S.season=0;const prep=e.toWinter();assert(prep>30&&prep<oldPrepare[stage-1]*.8);assert(prep<previous);previous=prep;assert(e.raidLen()>=75);assert(!e.isWinter());assert.equal(e.winterStart()+e.raidLen(),e.seasonLen());
 e.S.season=e.winterStart();assert(e.isWinter());assert.equal(e.raidP(),0);const startGap=e.raidGap(),startCap=e.bearCapNow();assert(startCap>=2);assert(startGap<(9.1*(stage===3?.55:1)*2.1)*.8);
 e.S.season=e.seasonLen()-1;assert(e.raidGap()<startGap);assert(e.bearCapNow()>startCap);assert(e.bearStrikeMult()>1+.12*(stage-1));
 const multiplier=e.bearMult();e.S.fence=9;e.S.tower=9;assert.equal(e.bearMult(),multiplier,'Defense upgrades must not scale the enemy');
 for(const winters of [1,10,1000])for(let p=0;p<=1;p+=.1){e.S.winters=winters;e.S.season=e.winterStart()+p*e.raidLen();assert(e.raidGap()>=.8);assert(e.bearCapNow()<=14);}
 e.S.winters=1;
}
assert.equal(e.BEAR_HPX/2.6,1.25);assert(e.BEAR_SPX>1.15);
const chip={hidden:true,setAttribute(k,v){this[k]=v}},ui={S:{},TITLE:false,tutOn:()=>false,liveBears:()=>[],document:{getElementById:()=>chip},isWinter:()=>false,toWinter:()=>125,winterLeft:()=>42,refreshRaidRadar(){}};vm.createContext(ui);
const panels=readRuntime('panels');vm.runInContext(panels.slice(panels.indexOf('function refreshBearChip('),panels.indexOf('/* v74')),ui);
ui.refreshBearChip();assert(chip.textContent.endsWith('2:05'));assert.equal(chip['aria-label'],'반달곰 습격까지 2:05');ui.toWinter=()=>9;ui.refreshBearChip();assert.equal(chip.className,'warn');assert(chip.textContent.endsWith('0:09'));assert(!chip.textContent.includes('곰'),'Compact visible text fits enlarged digits');
ui.isWinter=()=>true;ui.liveBears=()=>[{}];ui.refreshBearChip();assert.equal(chip.className,'raid');assert.equal(chip['aria-label'],'습격 종료까지 0:42');ui.tutOn=()=>true;ui.refreshBearChip();assert.equal(chip.hidden,true);
const html=fs.readFileSync(path.resolve(__dirname,'../game/index.html'),'utf8');assert(/<header>[\s\S]*id="bearChip"[\s\S]*<\/header>/.test(html));
const css=fs.readFileSync(path.resolve(__dirname,'../game/styles/game.css'),'utf8');assert(css.includes('#raidRadar #bearChip{position:static'));assert(css.includes('font-size:26px'));assert(css.includes('#raidRadar #bearChip[hidden]{display:none}'));assert(css.includes('@media(prefers-reduced-motion:reduce)'));
console.log('PASS: shorter preparation; longer raids; earlier/larger waves; stronger HP/attacks/movement; bounded spawn rate; stable upgrade scaling; countdown states/accessibility/tutorial hiding.');
