const vm=require('node:vm'),assert=require('node:assert/strict'),{readRuntime}=require('./runtime-source.cjs');
const defense=readRuntime('defence'),saveSource=readRuntime('save-progression');
function load(saved={}){const e={S:JSON.parse(JSON.stringify({coins:1000,stage:3,fence:2,tower:2,vf:{2:2,3:2},pads:{},...saved})),KEY:'cozy-village-v6',RESETTING:false,H:600,localStorage:{setItem:(key,value)=>{e.saved=JSON.parse(value);e.key=key;}}};vm.createContext(e);vm.runInContext(defense.slice(0,defense.indexOf('function fixDef(')),e);vm.runInContext(saveSource.slice(saveSource.indexOf('function save(){'),saveSource.indexOf('function startOver(){')),e);return e;}
let e=load();e.restoreDefenseState();assert.equal(e.FENCEHP,e.fenceMax());assert.equal(e.TOWERHP,e.towerMax());assert.equal(e.VFHP[2],e.fMaxV(2));assert.equal(e.S.defenseState,undefined,'Legacy saves need no version migration');
e.FENCEHP=220.6;e.TOWERHP=22.4;e.VFHP[2]=0;e.VFBREACH[2]=1;e.VFHP[3]=140.25;e.S.pads.vfence_fix2=50;e.save();assert.equal(e.key,'cozy-village-v6');const saved=e.saved;
e=load(saved);e.restoreDefenseState();assert.equal(e.FENCEHP,220.6);assert.equal(e.TOWERHP,22.4);assert.equal(e.VFHP[3],140.25);assert.equal(e.VFHP[2],0);assert.equal(e.VFBREACH[2],1);assert.equal(e.S.pads.vfence_fix2,50);assert.equal(e.S.coins,1000);
e.save();e=load(e.saved);e.restoreDefenseState();assert.equal(e.FENCEHP,220.6,'Repeated reload must not heal');
// A partial legacy regional-wall repair remains actionable, without free healing/refunds.
e=load({pads:{vfence_fix3:50}});e.restoreDefenseState();assert.equal(e.VFBREACH[3],1);assert.equal(e.VFHP[3],0);assert.equal(e.S.pads.vfence_fix3,50);assert.equal(e.S.coins,1000);
// Explicitly cleared breaches release only their outstanding paid credit, once.
e=load({pads:{vfence_fix2:50},defenseState:{version:1,breaches:{2:0},villageHP:{2:190}}});e.restoreDefenseState();assert.equal(e.S.coins,1050);assert.equal(e.S.pads.vfence_fix2,undefined);e.restoreDefenseState();assert.equal(e.S.coins,1050);
// Existing first-village destroyed flags remain authoritative.
e=load({fenceDown:1,towerDown:1});e.restoreDefenseState();e.save();e=load(e.saved);e.restoreDefenseState();assert.equal(e.FENCEHP,0);assert.equal(e.TOWERHP,0);assert.equal(e.S.fenceDown,1);assert.equal(e.S.towerDown,1);
// Before boot restoration, an early save cannot overwrite the valid snapshot with zeroes.
e=load(saved);e.save();assert.equal(e.saved.defenseState.fenceHP,220.6);e.restoreDefenseState();assert.equal(e.FENCEHP,220.6);
for(const value of [true,[],null,'damaged']){e=load({defenseState:value});e.restoreDefenseState();assert.equal(e.FENCEHP,e.fenceMax());}
e=load({defenseState:{version:1,fenceHP:1e9,towerHP:-9,villageHP:{2:'bad'}}});e.restoreDefenseState();assert.equal(e.FENCEHP,e.fenceMax());assert.equal(e.TOWERHP,e.towerMax());assert.equal(e.VFHP[2],e.fMaxV(2));
// Exercise the actual repair definition, pointer purchase and buy/save path.
e=load(saved);e.restoreDefenseState();Object.assign(e,{agents:[{x:0,y:0}],money50:n=>Math.ceil(n/50)*50,stageCostMult:()=>3.5,isWinter:()=>false,sfx(){},stat(){},celebrate(){},refreshUI(){},addFloat(){}});
const up=readRuntime('upgrades');vm.runInContext(up.slice(up.indexOf('function mkUp('),up.indexOf('function gearDef(')),e);vm.runInContext(up.slice(up.indexOf('function vfenceRepairDef('),up.indexOf('function hunterCost(')),e);vm.runInContext(up.slice(up.indexOf('function buy(d,')),e);
const d=e.vfenceRepairDef(2),cost=d.cost();assert.equal(d.hidden(),false);const prior=e.S.coins;e.PADLIST=[{id:d.id,d,x:10,y:10,perimeter:{floating:true}}];e.padReady=()=>true;
const input=readRuntime('input');vm.runInContext(input.slice(input.indexOf('function repairFenceAt('),input.indexOf('function endJoy(')),e);assert.equal(e.repairFenceAt(10,10),true);assert.equal(e.S.coins,prior+50-cost);assert.equal(e.S.pads.vfence_fix2,undefined);assert.equal(e.VFBREACH[2],0);assert.equal(e.saved.defenseState.villageHP[2],e.fMaxV(2));
const loop=readRuntime('loop');assert(loop.indexOf("boot('defence-save',restoreDefenseState)")<loop.indexOf("boot('merge'"));
// Execute real season transitions: keep auto-restoration rules, release orphan credit.
e=load(saved);e.restoreDefenseState();Object.assign(e,{huntShown:true,time:100,winterStart:()=>180,tutOn:()=>false,seasonLen:()=>240,isWinter:()=>e.S.season>=180,bearCap:()=>3,raidP:()=>0,BEARS:[],ARROWS:[],LOOT:[],agents:[{x:30,y:100}],joy:{on:false},liveBears:()=>[],sfx(){},shake(){},addFloat(){},STAGEBAN:null});
const combat=readRuntime('combat');vm.runInContext(combat.slice(combat.indexOf('function updateBears('),combat.indexOf('function drawArrows(')),e);
e.S.season=239.95;e.updateBears(.1);assert.equal(e.VFBREACH[2],undefined);assert.equal(e.S.coins,1050);assert.equal(e.S.pads.vfence_fix2,undefined);assert.equal(e.FENCEHP,220.6,'End of raid does not heal first-village HP');
e.S.season=179.95;e.updateBears(.1);assert.equal(e.FENCEHP,e.fenceMax());assert.equal(e.VFHP[2],e.fMaxV(2));assert.equal(e.TOWERHP,e.towerMax(),'Existing start-of-raid refill remains intact');
console.log('PASS: damaged HP/breach roundtrip; legacy/broken/malformed saves; early-save guard; paid repair remains visible/purchasable; cleared-credit refund once; boot ordering.');
