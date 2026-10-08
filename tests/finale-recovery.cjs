const vm=require('node:vm'),assert=require('node:assert/strict'),{readRuntime}=require('./runtime-source.cjs');
const source=readRuntime('ending');
function load(saved={}){const nodes={ending:{hidden:true},quickDock:{hidden:true}},e={S:JSON.parse(JSON.stringify(saved)),BEARS:[],TITLE:true,titleEl:{hidden:false},document:{getElementById:id=>nodes[id]},MX:1080,HT:664,bearEntry:()=>({x:400,y:0,ex:400,ey:-100}),bearMult:()=>1,fenceX:()=>1080,sfx(){},shake(){},addFloat(){},save(){e.saved=JSON.parse(JSON.stringify(e.S));},siteLv:()=>0,count:()=>0};vm.createContext(e);vm.runInContext(source,e);e.nodes=nodes;return e;}
let e=load({finaleSpawned:1});e.updateFinale(1);assert.equal(e.BEARS.length,1,'Legacy stuck save must respawn even after facilities lose maxed status');assert.equal(e.BEARS[0].finale,true);assert.equal(e.saved.finaleSpawned,1);
for(let i=0;i<100;i++)e.updateFinale(1);e.spawnFinaleBoss();assert.equal(e.BEARS.length,1,'No duplicate active boss');
e=load(e.saved);e.updateFinale(1);assert.equal(e.BEARS.length,1,'Repeated interruption remains recoverable');
e=load();e.updateFinale(1);assert.equal(e.BEARS.length,0,'New games retain existing unlock rules');e.allMaxed=()=>true;e.updateFinale(1);assert.equal(e.BEARS.length,1,'Normal unlock still spawns once');
for(const completed of [{finaleDone:1},{finaleDone:1,finaleSpawned:1}]){e=load(completed);e.restoreFinale();assert.equal(e.nodes.ending.hidden,false);assert.equal(e.TITLE,false);assert.equal(e.titleEl.hidden,true);assert.equal(e.nodes.quickDock.hidden,false);e.updateFinale(1);e.spawnFinaleBoss();assert.equal(e.BEARS.length,0,'Completed saves never spawn again');}
// Existing cinematic timings remain intact; reload during any scene restores the trophy.
for(const seconds of [1,4,8]){e=load({finaleDone:1,finaleSpawned:1});e.startEndingCinematic();for(let i=0;i<seconds*10;i++)e.updateEndingCinematic(.1);const resumed=load(e.S);resumed.restoreFinale();assert.equal(resumed.nodes.ending.hidden,false);}
e=load({finaleDone:1});e.startEndingCinematic();for(let i=0;i<110;i++)e.updateEndingCinematic(.1);assert.equal(e.ENDSEQ,null);assert.equal(e.nodes.ending.hidden,false);
const loop=readRuntime('loop');assert(loop.includes("boot('ending-resume',restoreFinale)"),'Recovery must be wired into actual boot');
console.log('PASS: stuck/repeated-reload boss saves; no duplicate boss; normal unlock; completed/cinematic-interrupted ending restoration; boot wiring.');
